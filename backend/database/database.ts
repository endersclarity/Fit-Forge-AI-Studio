import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import {
  ProfileResponse,
  ProfileUpdateRequest,
  WorkoutResponse,
  WorkoutSaveRequest,
  WorkoutExercise,
  MuscleStatesResponse,
  MuscleStatesUpdateRequest,
  PersonalBestsResponse,
  PersonalBestsUpdateRequest,
  MuscleBaselinesResponse,
  MuscleBaselinesUpdateRequest,
  WorkoutTemplate
} from '../../types';

// Database file location (persisted in data/ folder)
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/fitforge.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

// Initialize database
const db: Database.Database = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); // Better performance for concurrent reads

console.log(`Database initialized at: ${DB_PATH}`);

// Run schema to create tables
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('Database schema initialized');

// ============================================
// DATABASE ROW TYPES (internal to database layer)
// ============================================

interface UserRow {
  id: number;
  name: string;
  experience: string;
  created_at: string;
  updated_at: string;
}

interface WorkoutRow {
  id: number;
  user_id: number;
  date: string;
  variation: string;
  duration_seconds: number | null;
  created_at: string;
}

interface WorkoutTemplateRow {
  id: number;
  user_id: number;
  name: string;
  category: string;
  variation: string;
  exercise_ids: string;
  is_favorite: number;
  times_used: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// HELPER FUNCTIONS FOR DATABASE OPERATIONS
// ============================================

/**
 * Get user profile
 */
function getProfile(): ProfileResponse {
  const user = db.prepare('SELECT * FROM users WHERE id = 1').get() as UserRow | undefined;

  if (!user) {
    throw new Error('User not found');
  }

  const bodyweightHistory = db.prepare(`
    SELECT date, weight
    FROM bodyweight_history
    WHERE user_id = 1
    ORDER BY date DESC
  `).all() as Array<{ date: string; weight: number }>;

  const equipment = db.prepare(`
    SELECT name, min_weight as minWeight, max_weight as maxWeight, weight_increment as increment
    FROM equipment
    WHERE user_id = 1
  `).all() as Array<{ name: string; minWeight: number; maxWeight: number; increment: number }>;

  return {
    name: user.name,
    experience: user.experience as 'Beginner' | 'Intermediate' | 'Advanced',
    bodyweightHistory,
    equipment
  };
}

/**
 * Update user profile
 */
function updateProfile(profile: ProfileUpdateRequest): ProfileResponse {
  const updateUser = db.prepare('UPDATE users SET name = ?, experience = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1');
  updateUser.run(profile.name, profile.experience);

  // Clear and re-insert bodyweight history
  db.prepare('DELETE FROM bodyweight_history WHERE user_id = 1').run();
  if (profile.bodyweightHistory && profile.bodyweightHistory.length > 0) {
    const insertBodyweight = db.prepare('INSERT INTO bodyweight_history (user_id, date, weight) VALUES (1, ?, ?)');
    const insertMany = db.transaction((items: Array<{ date: string; weight: number }>) => {
      for (const item of items) {
        insertBodyweight.run(item.date, item.weight);
      }
    });
    insertMany(profile.bodyweightHistory);
  }

  // Clear and re-insert equipment
  db.prepare('DELETE FROM equipment WHERE user_id = 1').run();
  if (profile.equipment && profile.equipment.length > 0) {
    const insertEquipment = db.prepare('INSERT INTO equipment (user_id, name, min_weight, max_weight, weight_increment) VALUES (1, ?, ?, ?, ?)');
    const insertMany = db.transaction((items: Array<{ name: string; minWeight: number; maxWeight: number; increment: number }>) => {
      for (const item of items) {
        insertEquipment.run(item.name, item.minWeight, item.maxWeight, item.increment);
      }
    });
    insertMany(profile.equipment);
  }

  return getProfile();
}

/**
 * Get all workouts
 */
function getWorkouts(): WorkoutResponse[] {
  const workouts = db.prepare(`
    SELECT * FROM workouts
    WHERE user_id = 1
    ORDER BY date DESC
  `).all() as WorkoutRow[];

  // For each workout, get its exercise sets
  const results: WorkoutResponse[] = [];

  for (const workout of workouts) {
    const sets = db.prepare(`
      SELECT exercise_name as exercise, weight, reps, set_number
      FROM exercise_sets
      WHERE workout_id = ?
      ORDER BY set_number
    `).all(workout.id) as Array<{ exercise: string; weight: number; reps: number; set_number: number }>;

    // Group sets by exercise
    const exercisesMap: Record<string, WorkoutExercise> = {};
    for (const set of sets) {
      if (!exercisesMap[set.exercise]) {
        exercisesMap[set.exercise] = { exercise: set.exercise, sets: [] };
      }
      const exercise = exercisesMap[set.exercise];
      if (exercise) {
        exercise.sets.push({ weight: set.weight, reps: set.reps });
      }
    }

    results.push({
      id: workout.id,
      date: workout.date,
      variation: workout.variation,
      duration_seconds: workout.duration_seconds,
      exercises: Object.values(exercisesMap),
      created_at: workout.created_at
    });
  }

  return results;
}

/**
 * Save a new workout
 */
function saveWorkout(workout: WorkoutSaveRequest): WorkoutResponse {
  const insertWorkout = db.prepare(`
    INSERT INTO workouts (user_id, date, variation, duration_seconds)
    VALUES (1, ?, ?, ?)
  `);

  const insertSet = db.prepare(`
    INSERT INTO exercise_sets (workout_id, exercise_name, weight, reps, set_number)
    VALUES (?, ?, ?, ?, ?)
  `);

  const saveTransaction = db.transaction(() => {
    // Insert workout
    const result = insertWorkout.run(workout.date, workout.variation, workout.durationSeconds || null);
    const workoutId = result.lastInsertRowid as number;

    // Insert exercise sets
    let globalSetNumber = 1;
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        insertSet.run(workoutId, exercise.exercise, set.weight, set.reps, globalSetNumber);
        globalSetNumber++;
      }
    }

    return workoutId;
  });

  const workoutId = saveTransaction();

  // Return the saved workout
  const savedWorkout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId) as WorkoutRow;
  const sets = db.prepare(`
    SELECT exercise_name as exercise, weight, reps, set_number
    FROM exercise_sets
    WHERE workout_id = ?
    ORDER BY set_number
  `).all(workoutId) as Array<{ exercise: string; weight: number; reps: number; set_number: number }>;

  const exercisesMap: Record<string, WorkoutExercise> = {};
  for (const set of sets) {
    if (!exercisesMap[set.exercise]) {
      exercisesMap[set.exercise] = { exercise: set.exercise, sets: [] };
    }
    const exercise = exercisesMap[set.exercise];
    if (exercise) {
      exercise.sets.push({ weight: set.weight, reps: set.reps });
    }
  }

  return {
    id: savedWorkout.id,
    date: savedWorkout.date,
    variation: savedWorkout.variation,
    duration_seconds: savedWorkout.duration_seconds,
    exercises: Object.values(exercisesMap),
    created_at: savedWorkout.created_at
  };
}

/**
 * Get muscle states
 */
function getMuscleStates(): MuscleStatesResponse {
  const states = db.prepare(`
    SELECT muscle_name, fatigue_percent, volume_today, recovered_at, last_trained
    FROM muscle_states
    WHERE user_id = 1
  `).all() as Array<{
    muscle_name: string;
    fatigue_percent: number;
    volume_today: number;
    recovered_at: string | null;
    last_trained: string | null;
  }>;

  const result: MuscleStatesResponse = {};
  for (const state of states) {
    result[state.muscle_name] = {
      fatiguePercent: state.fatigue_percent,
      volumeToday: state.volume_today,
      recoveredAt: state.recovered_at,
      lastTrained: state.last_trained
    };
  }

  return result;
}

/**
 * Update muscle states
 */
function updateMuscleStates(states: MuscleStatesUpdateRequest): MuscleStatesResponse {
  const update = db.prepare(`
    UPDATE muscle_states
    SET fatigue_percent = ?, volume_today = ?, recovered_at = ?, last_trained = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = 1 AND muscle_name = ?
  `);

  const updateTransaction = db.transaction(() => {
    for (const [muscleName, state] of Object.entries(states)) {
      update.run(
        state.fatiguePercent ?? 0,
        state.volumeToday ?? 0,
        state.recoveredAt ?? null,
        state.lastTrained ?? null,
        muscleName
      );
    }
  });

  updateTransaction();
  return getMuscleStates();
}

/**
 * Get personal bests
 */
function getPersonalBests(): PersonalBestsResponse {
  const pbs = db.prepare(`
    SELECT exercise_name, best_single_set, best_session_volume, rolling_average_max
    FROM personal_bests
    WHERE user_id = 1
  `).all() as Array<{
    exercise_name: string;
    best_single_set: number | null;
    best_session_volume: number | null;
    rolling_average_max: number | null;
  }>;

  const result: PersonalBestsResponse = {};
  for (const pb of pbs) {
    result[pb.exercise_name] = {
      bestSingleSet: pb.best_single_set,
      bestSessionVolume: pb.best_session_volume,
      rollingAverageMax: pb.rolling_average_max
    };
  }

  return result;
}

/**
 * Update personal bests
 */
function updatePersonalBests(pbs: PersonalBestsUpdateRequest): PersonalBestsResponse {
  const upsert = db.prepare(`
    INSERT INTO personal_bests (user_id, exercise_name, best_single_set, best_session_volume, rolling_average_max, updated_at)
    VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, exercise_name) DO UPDATE SET
      best_single_set = excluded.best_single_set,
      best_session_volume = excluded.best_session_volume,
      rolling_average_max = excluded.rolling_average_max,
      updated_at = CURRENT_TIMESTAMP
  `);

  const updateTransaction = db.transaction(() => {
    for (const [exerciseName, pb] of Object.entries(pbs)) {
      upsert.run(
        exerciseName,
        pb.bestSingleSet ?? null,
        pb.bestSessionVolume ?? null,
        pb.rollingAverageMax ?? null
      );
    }
  });

  updateTransaction();
  return getPersonalBests();
}

/**
 * Get muscle baselines
 */
function getMuscleBaselines(): MuscleBaselinesResponse {
  const baselines = db.prepare(`
    SELECT muscle_name, system_learned_max, user_override
    FROM muscle_baselines
    WHERE user_id = 1
  `).all() as Array<{
    muscle_name: string;
    system_learned_max: number;
    user_override: number | null;
  }>;

  const result: MuscleBaselinesResponse = {};
  for (const baseline of baselines) {
    result[baseline.muscle_name] = {
      systemLearnedMax: baseline.system_learned_max,
      userOverride: baseline.user_override
    };
  }

  return result;
}

/**
 * Update muscle baselines
 */
function updateMuscleBaselines(baselines: MuscleBaselinesUpdateRequest): MuscleBaselinesResponse {
  const update = db.prepare(`
    UPDATE muscle_baselines
    SET system_learned_max = ?, user_override = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = 1 AND muscle_name = ?
  `);

  const updateTransaction = db.transaction(() => {
    for (const [muscleName, baseline] of Object.entries(baselines)) {
      update.run(
        baseline.systemLearnedMax ?? 10000,
        baseline.userOverride ?? null,
        muscleName
      );
    }
  });

  updateTransaction();
  return getMuscleBaselines();
}

/**
 * Get all workout templates
 */
function getWorkoutTemplates(): WorkoutTemplate[] {
  const templates = db.prepare(`
    SELECT * FROM workout_templates
    WHERE user_id = 1
    ORDER BY times_used DESC, updated_at DESC
  `).all() as WorkoutTemplateRow[];

  return templates.map(t => ({
    id: t.id.toString(),
    name: t.name,
    category: t.category as 'Push' | 'Pull' | 'Legs' | 'Core',
    variation: t.variation as 'A' | 'B',
    exerciseIds: JSON.parse(t.exercise_ids) as string[],
    isFavorite: Boolean(t.is_favorite),
    timesUsed: t.times_used,
    createdAt: new Date(t.created_at).getTime(),
    updatedAt: new Date(t.updated_at).getTime()
  }));
}

/**
 * Get a single workout template by ID
 */
function getWorkoutTemplateById(id: string | number): WorkoutTemplate | null {
  const template = db.prepare(`
    SELECT * FROM workout_templates
    WHERE id = ? AND user_id = 1
  `).get(id) as WorkoutTemplateRow | undefined;

  if (!template) return null;

  return {
    id: template.id.toString(),
    name: template.name,
    category: template.category as 'Push' | 'Pull' | 'Legs' | 'Core',
    variation: template.variation as 'A' | 'B',
    exerciseIds: JSON.parse(template.exercise_ids) as string[],
    isFavorite: Boolean(template.is_favorite),
    timesUsed: template.times_used,
    createdAt: new Date(template.created_at).getTime(),
    updatedAt: new Date(template.updated_at).getTime()
  };
}

/**
 * Create a new workout template
 */
function createWorkoutTemplate(template: Omit<WorkoutTemplate, 'id' | 'timesUsed' | 'createdAt' | 'updatedAt'>): WorkoutTemplate {
  const insert = db.prepare(`
    INSERT INTO workout_templates (user_id, name, category, variation, exercise_ids, is_favorite, created_at, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  const result = insert.run(
    template.name,
    template.category,
    template.variation,
    JSON.stringify(template.exerciseIds),
    template.isFavorite ? 1 : 0
  );

  const created = getWorkoutTemplateById(result.lastInsertRowid as number);
  if (!created) {
    throw new Error('Failed to create workout template');
  }

  return created;
}

/**
 * Update a workout template
 */
function updateWorkoutTemplate(id: string | number, template: Partial<WorkoutTemplate>): WorkoutTemplate | null {
  const update = db.prepare(`
    UPDATE workout_templates
    SET name = ?, category = ?, variation = ?, exercise_ids = ?, is_favorite = ?, times_used = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = 1
  `);

  const result = update.run(
    template.name,
    template.category,
    template.variation,
    template.exerciseIds ? JSON.stringify(template.exerciseIds) : undefined,
    template.isFavorite ? 1 : 0,
    template.timesUsed ?? 0,
    id
  );

  if (result.changes === 0) return null;
  return getWorkoutTemplateById(id);
}

/**
 * Delete a workout template
 */
function deleteWorkoutTemplate(id: string | number): boolean {
  const del = db.prepare('DELETE FROM workout_templates WHERE id = ? AND user_id = 1');
  const result = del.run(id);
  return result.changes > 0;
}

/**
 * Seed default workout templates (called on startup if none exist)
 */
function seedDefaultTemplates(): void {
  try {
    console.log('Checking for existing templates...');
    // Check if templates already exist
    const existing = db.prepare('SELECT COUNT(*) as count FROM workout_templates WHERE user_id = 1').get() as { count: number };
    console.log(`Found ${existing.count} existing templates`);
    if (existing.count > 0) {
      console.log('Default templates already exist, skipping seed');
      return;
    }

    console.log('Seeding default workout templates...');

  // Define default templates with curated exercise selections (6-8 exercises each)
  const defaultTemplates: Array<{
    name: string;
    category: 'Push' | 'Pull' | 'Legs' | 'Core';
    variation: 'A' | 'B';
    exerciseIds: string[];
    isFavorite: number;
  }> = [
    {
      name: 'Push Day A',
      category: 'Push',
      variation: 'A',
      exerciseIds: ['ex02', 'ex30', 'ex38', 'ex05', 'ex34', 'ex31'], // Dumbbell Bench, Tricep Ext, Single Arm Bench, Shoulder Press, KB Press, TRX Pushup
      isFavorite: 1
    },
    {
      name: 'Push Day B',
      category: 'Push',
      variation: 'B',
      exerciseIds: ['ex03', 'ex05', 'ex32', 'ex33', 'ex40', 'ex29'], // Push-up, Shoulder Press, Incline Bench, Dips, TRX Tricep, TRX Reverse Flys
      isFavorite: 0
    },
    {
      name: 'Pull Day A',
      category: 'Pull',
      variation: 'A',
      exerciseIds: ['ex42', 'ex22', 'ex07', 'ex18', 'ex23', 'ex25'], // Wide Grip Pull-ups, Concentration Curl, Bicep Curl, Upright Row, Shrugs, Incline Hammer Curl
      isFavorite: 0
    },
    {
      name: 'Pull Day B',
      category: 'Pull',
      variation: 'B',
      exerciseIds: ['ex09', 'ex07', 'ex21', 'ex20', 'ex19', 'ex48'], // Dumbbell Row, Bicep Curl, Face Pull, Chin-Ups, TRX Bicep Curl, Pullover
      isFavorite: 0
    },
    {
      name: 'Legs Day A',
      category: 'Legs',
      variation: 'A',
      exerciseIds: ['ex12', 'ex15', 'ex43', 'ex37'], // Kettlebell Goblet Squat, Calf Raises, Dumbbell Goblet Squat, Kettlebell Swings
      isFavorite: 0
    },
    {
      name: 'Legs Day B',
      category: 'Legs',
      variation: 'B',
      exerciseIds: ['ex13', 'ex35', 'ex36', 'ex47', 'ex37'], // Romanian Deadlift, Glute Bridges, Stiff Legged Deadlift, Box Step-ups, Kettlebell Swings
      isFavorite: 0
    },
    {
      name: 'Core Day A',
      category: 'Core',
      variation: 'A',
      exerciseIds: ['ex17', 'ex16', 'ex44'], // Bench Sit-ups, Plank, Spider Planks
      isFavorite: 0
    },
    {
      name: 'Core Day B',
      category: 'Core',
      variation: 'B',
      exerciseIds: ['ex16', 'ex45', 'ex46'], // Plank, TRX Mountain Climbers, Hanging Leg Raises
      isFavorite: 0
    }
  ];

  const insert = db.prepare(`
    INSERT INTO workout_templates (user_id, name, category, variation, exercise_ids, is_favorite, times_used)
    VALUES (1, ?, ?, ?, ?, ?, 0)
  `);

  const insertAll = db.transaction((templates: typeof defaultTemplates) => {
    for (const template of templates) {
      insert.run(
        template.name,
        template.category,
        template.variation,
        JSON.stringify(template.exerciseIds),
        template.isFavorite
      );
    }
  });

  insertAll(defaultTemplates);
    console.log(`✅ Successfully seeded ${defaultTemplates.length} default workout templates`);
  } catch (error) {
    console.error('❌ Error seeding default templates:', (error as Error).message);
    console.error((error as Error).stack);
  }
}

// Run seed function on startup
console.log('Running seed function...');
seedDefaultTemplates();

// Export database instance and helper functions
export {
  db,
  getProfile,
  updateProfile,
  getWorkouts,
  saveWorkout,
  getMuscleStates,
  updateMuscleStates,
  getPersonalBests,
  updatePersonalBests,
  getMuscleBaselines,
  updateMuscleBaselines,
  getWorkoutTemplates,
  getWorkoutTemplateById,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate
};

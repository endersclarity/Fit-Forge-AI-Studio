const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Database file location (persisted in data/ folder)
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/fitforge.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

// Initialize database
const db = new Database(DB_PATH);
db.pragma('journal_mode = DELETE'); // DELETE mode for Docker compatibility (WAL doesn't work on Windows volume mounts)

console.log(`Database initialized at: ${DB_PATH}`);

// Run schema to create tables
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('Database schema initialized');

// Helper functions for common database operations

/**
 * Get user profile
 */
function getProfile() {
  const user = db.prepare('SELECT * FROM users WHERE id = 1').get();

  const bodyweightHistory = db.prepare(`
    SELECT date, weight
    FROM bodyweight_history
    WHERE user_id = 1
    ORDER BY date DESC
  `).all();

  const equipment = db.prepare(`
    SELECT name, min_weight as minWeight, max_weight as maxWeight, weight_increment as increment
    FROM equipment
    WHERE user_id = 1
  `).all();

  return {
    name: user.name,
    experience: user.experience,
    bodyweightHistory,
    equipment
  };
}

/**
 * Update user profile
 */
function updateProfile(profile) {
  const updateUser = db.prepare('UPDATE users SET name = ?, experience = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1');
  updateUser.run(profile.name, profile.experience);

  // Clear and re-insert bodyweight history
  db.prepare('DELETE FROM bodyweight_history WHERE user_id = 1').run();
  if (profile.bodyweightHistory && profile.bodyweightHistory.length > 0) {
    const insertBodyweight = db.prepare('INSERT INTO bodyweight_history (user_id, date, weight) VALUES (1, ?, ?)');
    const insertMany = db.transaction((items) => {
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
    const insertMany = db.transaction((items) => {
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
function getWorkouts() {
  const workouts = db.prepare(`
    SELECT * FROM workouts
    WHERE user_id = 1
    ORDER BY date DESC
  `).all();

  // For each workout, get its exercise sets
  for (const workout of workouts) {
    const sets = db.prepare(`
      SELECT exercise_name as exercise, weight, reps, set_number, to_failure
      FROM exercise_sets
      WHERE workout_id = ?
      ORDER BY set_number
    `).all(workout.id);

    // Group sets by exercise
    const exercisesMap = {};
    for (const set of sets) {
      if (!exercisesMap[set.exercise]) {
        exercisesMap[set.exercise] = { exercise: set.exercise, sets: [] };
      }
      exercisesMap[set.exercise].sets.push({
        weight: set.weight,
        reps: set.reps,
        to_failure: Boolean(set.to_failure) // Convert 0/1 to boolean
      });
    }

    workout.exercises = Object.values(exercisesMap);
    delete workout.user_id; // Clean up response
  }

  return workouts;
}

/**
 * Get the last workout for a specific category
 */
function getLastWorkoutByCategory(category) {
  const workout = db.prepare(`
    SELECT * FROM workouts
    WHERE user_id = 1 AND category = ?
    ORDER BY date DESC
    LIMIT 1
  `).get(category);

  if (!workout) {
    return null;
  }

  // Get exercise sets for this workout
  const sets = db.prepare(`
    SELECT exercise_name as exercise, weight, reps, set_number, to_failure
    FROM exercise_sets
    WHERE workout_id = ?
    ORDER BY set_number
  `).all(workout.id);

  // Group sets by exercise
  const exercisesMap = {};
  for (const set of sets) {
    if (!exercisesMap[set.exercise]) {
      exercisesMap[set.exercise] = { exercise: set.exercise, sets: [] };
    }
    exercisesMap[set.exercise].sets.push({
      weight: set.weight,
      reps: set.reps,
      to_failure: Boolean(set.to_failure) // Convert 0/1 to boolean
    });
  }

  workout.exercises = Object.values(exercisesMap);
  delete workout.user_id; // Clean up response

  return workout;
}

/**
 * Save a new workout
 */
function saveWorkout(workout) {
  const insertWorkout = db.prepare(`
    INSERT INTO workouts (user_id, date, category, variation, progression_method, duration_seconds)
    VALUES (1, ?, ?, ?, ?, ?)
  `);

  const insertSet = db.prepare(`
    INSERT INTO exercise_sets (workout_id, exercise_name, weight, reps, set_number, to_failure)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const upsertPR = db.prepare(`
    INSERT INTO personal_bests (user_id, exercise_name, best_single_set, best_session_volume, rolling_average_max, updated_at)
    VALUES (1, ?, ?, NULL, NULL, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, exercise_name) DO UPDATE SET
      best_single_set = excluded.best_single_set,
      updated_at = CURRENT_TIMESTAMP
  `);

  const prsDetected = [];

  const saveTransaction = db.transaction(() => {
    // Insert workout
    const result = insertWorkout.run(
      workout.date,
      workout.category || null,
      workout.variation || null,
      workout.progressionMethod || null,
      workout.durationSeconds || null
    );
    const workoutId = result.lastInsertRowid;

    // Insert exercise sets and detect PRs
    let globalSetNumber = 1;
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        // Convert boolean to_failure to 0/1 for SQLite, default to 1 (true) if not provided
        const toFailure = set.to_failure !== undefined ? (set.to_failure ? 1 : 0) : 1;
        insertSet.run(workoutId, exercise.exercise, set.weight, set.reps, globalSetNumber, toFailure);

        // Detect PR for this set
        const prInfo = detectPR(exercise.exercise, set.weight, set.reps, Boolean(toFailure));
        if (prInfo) {
          // Update personal_bests table
          upsertPR.run(exercise.exercise, prInfo.newVolume);
          prsDetected.push(prInfo);
        }

        globalSetNumber++;
      }
    }

    return workoutId;
  });

  const workoutId = saveTransaction();

  // Return the saved workout with PR info
  const savedWorkout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
  const sets = db.prepare(`
    SELECT exercise_name as exercise, weight, reps, set_number, to_failure
    FROM exercise_sets
    WHERE workout_id = ?
    ORDER BY set_number
  `).all(workoutId);

  const exercisesMap = {};
  for (const set of sets) {
    if (!exercisesMap[set.exercise]) {
      exercisesMap[set.exercise] = { exercise: set.exercise, sets: [] };
    }
    exercisesMap[set.exercise].sets.push({
      weight: set.weight,
      reps: set.reps,
      to_failure: Boolean(set.to_failure) // Convert 0/1 to boolean
    });
  }

  savedWorkout.exercises = Object.values(exercisesMap);
  delete savedWorkout.user_id;

  // Add PRs to response
  savedWorkout.prs = prsDetected;

  return savedWorkout;
}

/**
 * Get muscle states
 */
function getMuscleStates() {
  const states = db.prepare(`
    SELECT muscle_name, fatigue_percent, volume_today, recovered_at, last_trained
    FROM muscle_states
    WHERE user_id = 1
  `).all();

  const result = {};
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
function updateMuscleStates(states) {
  const update = db.prepare(`
    UPDATE muscle_states
    SET fatigue_percent = ?, volume_today = ?, recovered_at = ?, last_trained = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = 1 AND muscle_name = ?
  `);

  const updateTransaction = db.transaction(() => {
    for (const [muscleName, state] of Object.entries(states)) {
      update.run(
        state.fatiguePercent || 0,
        state.volumeToday || 0,
        state.recoveredAt || null,
        state.lastTrained || null,
        muscleName
      );
    }
  });

  updateTransaction();
  return getMuscleStates();
}

/**
 * Detect if a set is a new PR (Personal Record)
 * Only checks sets marked as "to failure"
 *
 * @param {string} exerciseName - Name of the exercise
 * @param {number} weight - Weight used in the set
 * @param {number} reps - Number of reps performed
 * @param {boolean} toFailure - Whether the set was taken to failure
 * @returns {object|null} PR info if detected, null otherwise
 */
function detectPR(exerciseName, weight, reps, toFailure) {
  // Only detect PRs for failure sets
  if (!toFailure) {
    return null;
  }

  // Calculate volume (weight × reps)
  const currentVolume = weight * reps;

  // Get previous best for this exercise
  const previousBest = db.prepare(`
    SELECT best_single_set, updated_at
    FROM personal_bests
    WHERE user_id = 1 AND exercise_name = ?
  `).get(exerciseName);

  // First time doing this exercise
  if (!previousBest || previousBest.best_single_set === null) {
    return {
      isPR: true,
      exercise: exerciseName,
      newVolume: currentVolume,
      previousVolume: 0,
      improvement: currentVolume,
      percentIncrease: 0,
      isFirstTime: true
    };
  }

  // Compare volumes
  if (currentVolume > previousBest.best_single_set) {
    const improvement = currentVolume - previousBest.best_single_set;
    const percentIncrease = (improvement / previousBest.best_single_set) * 100;

    return {
      isPR: true,
      exercise: exerciseName,
      newVolume: currentVolume,
      previousVolume: previousBest.best_single_set,
      improvement,
      percentIncrease: Math.round(percentIncrease * 10) / 10, // Round to 1 decimal place
      isFirstTime: false
    };
  }

  // Not a PR
  return null;
}

/**
 * Get personal bests
 */
function getPersonalBests() {
  const pbs = db.prepare(`
    SELECT exercise_name, best_single_set, best_session_volume, rolling_average_max
    FROM personal_bests
    WHERE user_id = 1
  `).all();

  const result = {};
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
function updatePersonalBests(pbs) {
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
        pb.bestSingleSet || null,
        pb.bestSessionVolume || null,
        pb.rollingAverageMax || null
      );
    }
  });

  updateTransaction();
  return getPersonalBests();
}

/**
 * Get muscle baselines
 */
function getMuscleBaselines() {
  const baselines = db.prepare(`
    SELECT muscle_name, system_learned_max, user_override
    FROM muscle_baselines
    WHERE user_id = 1
  `).all();

  const result = {};
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
function updateMuscleBaselines(baselines) {
  const update = db.prepare(`
    UPDATE muscle_baselines
    SET system_learned_max = ?, user_override = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = 1 AND muscle_name = ?
  `);

  const updateTransaction = db.transaction(() => {
    for (const [muscleName, baseline] of Object.entries(baselines)) {
      update.run(
        baseline.systemLearnedMax || 10000,
        baseline.userOverride || null,
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
function getWorkoutTemplates() {
  const templates = db.prepare(`
    SELECT * FROM workout_templates
    WHERE user_id = 1
    ORDER BY times_used DESC, updated_at DESC
  `).all();

  return templates.map(t => ({
    id: t.id.toString(),
    name: t.name,
    category: t.category,
    variation: t.variation,
    exerciseIds: JSON.parse(t.exercise_ids),
    isFavorite: Boolean(t.is_favorite),
    timesUsed: t.times_used,
    createdAt: new Date(t.created_at).getTime(),
    updatedAt: new Date(t.updated_at).getTime()
  }));
}

/**
 * Get a single workout template by ID
 */
function getWorkoutTemplateById(id) {
  const template = db.prepare(`
    SELECT * FROM workout_templates
    WHERE id = ? AND user_id = 1
  `).get(id);

  if (!template) return null;

  return {
    id: template.id.toString(),
    name: template.name,
    category: template.category,
    variation: template.variation,
    exerciseIds: JSON.parse(template.exercise_ids),
    isFavorite: Boolean(template.is_favorite),
    timesUsed: template.times_used,
    createdAt: new Date(template.created_at).getTime(),
    updatedAt: new Date(template.updated_at).getTime()
  };
}

/**
 * Create a new workout template
 */
function createWorkoutTemplate(template) {
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

  return getWorkoutTemplateById(result.lastInsertRowid);
}

/**
 * Update a workout template
 */
function updateWorkoutTemplate(id, template) {
  const update = db.prepare(`
    UPDATE workout_templates
    SET name = ?, category = ?, variation = ?, exercise_ids = ?, is_favorite = ?, times_used = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = 1
  `);

  const result = update.run(
    template.name,
    template.category,
    template.variation,
    JSON.stringify(template.exerciseIds),
    template.isFavorite ? 1 : 0,
    template.timesUsed || 0,
    id
  );

  if (result.changes === 0) return null;
  return getWorkoutTemplateById(id);
}

/**
 * Delete a workout template
 */
function deleteWorkoutTemplate(id) {
  const del = db.prepare('DELETE FROM workout_templates WHERE id = ? AND user_id = 1');
  const result = del.run(id);
  return result.changes > 0;
}

/**
 * Seed default workout templates (called on startup if none exist)
 */
function seedDefaultTemplates() {
  try {
    console.log('Checking for existing templates...');
    // Check if templates already exist
    const existing = db.prepare('SELECT COUNT(*) as count FROM workout_templates WHERE user_id = 1').get();
    console.log(`Found ${existing.count} existing templates`);
    if (existing.count > 0) {
      console.log('Default templates already exist, skipping seed');
      return;
    }

    console.log('Seeding default workout templates...');

  // Define default templates with curated exercise selections (6-8 exercises each)
  const defaultTemplates = [
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

  const insertAll = db.transaction((templates) => {
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
    console.error('❌ Error seeding default templates:', error.message);
    console.error(error.stack);
  }
}

// Run seed function on startup
console.log('Running seed function...');
seedDefaultTemplates();

// Export database instance and helper functions
module.exports = {
  db,
  getProfile,
  updateProfile,
  getWorkouts,
  getLastWorkoutByCategory,
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

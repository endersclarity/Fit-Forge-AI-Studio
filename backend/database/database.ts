import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import {
  ProfileResponse,
  ProfileUpdateRequest,
  ProfileInitRequest,
  WorkoutResponse,
  WorkoutSaveRequest,
  WorkoutExercise,
  MuscleStatesResponse,
  MuscleStatesUpdateRequest,
  PersonalBestsResponse,
  PersonalBestsUpdateRequest,
  MuscleBaselinesResponse,
  MuscleBaselinesUpdateRequest,
  WorkoutTemplate,
  BaselineUpdate,
  PRInfo,
  WorkoutRotationState,
  WorkoutRecommendation,
  ExerciseCategory
} from '../types';
import { EXERCISE_LIBRARY, ROTATION_SEQUENCE } from '../constants';

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
db.pragma('journal_mode = DELETE'); // DELETE mode for Docker compatibility (WAL doesn't work on Windows volume mounts)

console.log(`Database initialized at: ${DB_PATH}`);

// Run schema to create tables
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('Database schema initialized');

// Run migrations
const migrationsDir = path.join(__dirname, 'migrations');
if (fs.existsSync(migrationsDir)) {
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && !file.includes('rollback'))
    .sort();

  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);
    const migration = fs.readFileSync(migrationPath, 'utf8');
    try {
      db.exec(migration);
      console.log(`Migration applied: ${file}`);
    } catch (error: any) {
      // Ignore errors for migrations that have already been applied
      if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
        console.error(`Error applying migration ${file}:`, error);
      }
    }
  }
}

// ============================================
// DATABASE ROW TYPES (internal to database layer)
// ============================================

interface UserRow {
  id: number;
  name: string;
  experience: string;
  recovery_days_to_full: number;
  created_at: string;
  updated_at: string;
}

interface WorkoutRotationStateRow {
  id: number;
  user_id: number;
  current_cycle: 'A' | 'B';
  current_phase: number;
  last_workout_date: string | null;
  last_workout_category: string | null;
  last_workout_variation: 'A' | 'B' | null;
  rest_days_count: number;
  updated_at: string;
}

interface WorkoutRow {
  id: number;
  user_id: number;
  date: string;
  category: string | null;
  variation: string | null;
  progression_method: string | null;
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
// CUSTOM ERROR TYPES
// ============================================

class UserNotFoundError extends Error {
  code: string;
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
    this.code = 'USER_NOT_FOUND';
  }
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
    throw new UserNotFoundError();
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
    equipment,
    recovery_days_to_full: user.recovery_days_to_full || 5
  };
}

/**
 * Update user profile
 */
function updateProfile(profile: ProfileUpdateRequest): ProfileResponse {
  // Build dynamic SQL based on provided fields
  const updates: string[] = [];
  const params: any[] = [];

  if (profile.name !== undefined) {
    updates.push('name = ?');
    params.push(profile.name);
  }
  if (profile.experience !== undefined) {
    updates.push('experience = ?');
    params.push(profile.experience);
  }
  if (profile.recovery_days_to_full !== undefined) {
    updates.push('recovery_days_to_full = ?');
    params.push(profile.recovery_days_to_full);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  if (updates.length > 1) { // More than just updated_at
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = 1`;
    db.prepare(sql).run(...params);
  }

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
 * Initialize user profile for first-time users
 */
function initializeProfile(request: ProfileInitRequest): ProfileResponse {
  // Check if user already exists (idempotent behavior)
  const existingUser = db.prepare('SELECT * FROM users WHERE id = 1').get() as UserRow | undefined;
  if (existingUser) {
    return getProfile();
  }

  // Scale baselines based on experience level
  const baselinesByExperience = {
    'Beginner': 5000,
    'Intermediate': 10000,
    'Advanced': 15000
  };
  const baseline = baselinesByExperience[request.experience];

  // All 13 muscles from Muscle enum
  const muscles = [
    'Pectoralis', 'Triceps', 'Deltoids', 'Lats', 'Biceps',
    'Rhomboids', 'Trapezius', 'Forearms', 'Quadriceps',
    'Glutes', 'Hamstrings', 'Calves', 'Core'
  ];

  // Transaction to ensure atomicity
  const initTransaction = db.transaction(() => {
    // Insert user
    db.prepare('INSERT INTO users (id, name, experience) VALUES (1, ?, ?)').run(
      request.name,
      request.experience
    );

    // Initialize muscle baselines
    const insertBaseline = db.prepare(
      'INSERT INTO muscle_baselines (user_id, muscle_name, system_learned_max) VALUES (1, ?, ?)'
    );
    for (const muscle of muscles) {
      insertBaseline.run(muscle, baseline);
    }

    // Initialize muscle states
    const insertState = db.prepare(
      'INSERT INTO muscle_states (user_id, muscle_name, initial_fatigue_percent, volume_today, last_trained) VALUES (1, ?, 0, 0, NULL)'
    );
    for (const muscle of muscles) {
      insertState.run(muscle);
    }

    // Insert equipment if provided
    if (request.equipment && request.equipment.length > 0) {
      const insertEquipment = db.prepare(
        'INSERT INTO equipment (user_id, name, min_weight, max_weight, weight_increment) VALUES (1, ?, ?, ?, ?)'
      );
      for (const item of request.equipment) {
        insertEquipment.run(item.name, item.minWeight, item.maxWeight, item.increment);
      }
    }
  });

  // Execute transaction
  initTransaction();

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
      category: workout.category,
      variation: workout.variation,
      progression_method: workout.progression_method,
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
    INSERT INTO workouts (user_id, date, category, variation, progression_method, duration_seconds)
    VALUES (1, ?, ?, ?, ?, ?)
  `);

  const insertSet = db.prepare(`
    INSERT INTO exercise_sets (workout_id, exercise_name, weight, reps, set_number, to_failure)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const saveTransaction = db.transaction(() => {
    // Convert date to ISO string if it's a timestamp number
    let dateValue: string | number = workout.date;
    if (typeof workout.date === 'number') {
      dateValue = new Date(workout.date).toISOString();
    }

    // Insert workout
    const result = insertWorkout.run(
      dateValue,
      workout.category || null,
      workout.variation || null,
      workout.progressionMethod || null,
      workout.durationSeconds || null
    );
    const workoutId = result.lastInsertRowid as number;

    // Insert exercise sets
    let globalSetNumber = 1;
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        insertSet.run(
          workoutId,
          exercise.exercise,
          set.weight,
          set.reps,
          globalSetNumber,
          set.to_failure ? 1 : 1 // Default to 1 (true) for backward compatibility
        );
        globalSetNumber++;
      }
    }

    return workoutId;
  });

  const workoutId = saveTransaction();

  // Learn muscle baselines from "to failure" sets
  const updatedBaselines = learnMuscleBaselinesFromWorkout(workoutId);

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
    category: savedWorkout.category,
    variation: savedWorkout.variation,
    progression_method: savedWorkout.progression_method,
    duration_seconds: savedWorkout.duration_seconds,
    exercises: Object.values(exercisesMap),
    created_at: savedWorkout.created_at,
    updated_baselines: updatedBaselines.length > 0 ? updatedBaselines : undefined
  };
}

/**
 * Learn muscle baselines from workout's "to failure" sets
 *
 * Implements conservative max observed volume algorithm:
 * For each to_failure set, calculate muscle-specific volume and update baseline if higher than current.
 *
 * @param workoutId - ID of the workout to analyze
 * @returns Array of baseline updates with muscle name, old max, and new max
 */
function learnMuscleBaselinesFromWorkout(workoutId: number): BaselineUpdate[] {
  // Query all to_failure sets for this workout
  const failureSets = db.prepare(`
    SELECT exercise_name, weight, reps
    FROM exercise_sets
    WHERE workout_id = ? AND to_failure = 1
  `).all(workoutId) as Array<{ exercise_name: string; weight: number; reps: number }>;

  // If no failure sets, nothing to learn
  if (failureSets.length === 0) {
    return [];
  }

  // Track max volume observed per muscle
  const muscleVolumes: Record<string, number> = {};

  // Process each failure set
  for (const set of failureSets) {
    // Find exercise in library
    const exercise = EXERCISE_LIBRARY.find(ex => ex.name === set.exercise_name);

    if (!exercise) {
      console.warn(`Exercise not found in library: ${set.exercise_name}`);
      continue;
    }

    // Calculate total volume for this set
    const totalVolume = set.weight * set.reps;

    // Get calibrated engagement percentages (or defaults if no calibration exists)
    const exerciseCalibrations = getExerciseCalibrations(exercise.id);

    // Calculate volume per muscle based on engagement percentages (with calibrations)
    for (const engagement of exerciseCalibrations.engagements) {
      const muscleVolume = totalVolume * (engagement.percentage / 100);
      const muscleName = engagement.muscle;

      // Track maximum volume observed for each muscle
      if (!muscleVolumes[muscleName] || muscleVolume > muscleVolumes[muscleName]) {
        muscleVolumes[muscleName] = muscleVolume;
      }
    }
  }

  // Compare observed volumes to current baselines and update where higher
  const updates: BaselineUpdate[] = [];

  for (const [muscleName, observedVolume] of Object.entries(muscleVolumes)) {
    // Get current baseline
    const currentBaseline = db.prepare(`
      SELECT system_learned_max
      FROM muscle_baselines
      WHERE user_id = 1 AND muscle_name = ?
    `).get(muscleName) as { system_learned_max: number } | undefined;

    if (!currentBaseline) {
      console.warn(`No baseline found for muscle: ${muscleName}`);
      continue;
    }

    // Only update if observed volume exceeds current baseline
    if (observedVolume > currentBaseline.system_learned_max) {
      // Update baseline in database
      db.prepare(`
        UPDATE muscle_baselines
        SET system_learned_max = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = 1 AND muscle_name = ?
      `).run(observedVolume, muscleName);

      // Track update for response
      updates.push({
        muscle: muscleName,
        oldMax: currentBaseline.system_learned_max,
        newMax: observedVolume
      });
    }
  }

  return updates;
}

/**
 * Detect personal records (PRs) for all exercises in a workout
 *
 * Compares each exercise's performance to historical personal bests:
 * - Best single set (weight × reps)
 * - Best session volume (sum of all sets)
 *
 * @param workoutId - ID of the workout to analyze
 * @returns Array of PR info for each exercise with improvements
 */
function detectPRsForWorkout(workoutId: number): PRInfo[] {
  // Get all exercises and their sets from this workout
  const exerciseSets = db.prepare(`
    SELECT exercise_name, weight, reps
    FROM exercise_sets
    WHERE workout_id = ?
    ORDER BY exercise_name, set_number
  `).all(workoutId) as Array<{ exercise_name: string; weight: number; reps: number }>;

  if (exerciseSets.length === 0) {
    return [];
  }

  // Group sets by exercise
  const exerciseGroups: Record<string, Array<{ weight: number; reps: number }>> = {};
  for (const set of exerciseSets) {
    if (!exerciseGroups[set.exercise_name]) {
      exerciseGroups[set.exercise_name] = [];
    }
    exerciseGroups[set.exercise_name].push({ weight: set.weight, reps: set.reps });
  }

  // Get current personal bests
  const currentPBs = getPersonalBests();

  const prs: PRInfo[] = [];

  // Check each exercise for PRs
  for (const [exerciseName, sets] of Object.entries(exerciseGroups)) {
    // Calculate best single set and session volume for this workout
    const volumes = sets.map(s => s.weight * s.reps);
    const newBestSingleSet = Math.max(...volumes);
    const newSessionVolume = volumes.reduce((sum, v) => sum + v, 0);

    // Get previous personal bests for this exercise
    const previousPB = currentPBs[exerciseName];
    const previousBestSingleSet = previousPB?.bestSingleSet ?? 0;
    const previousSessionVolume = previousPB?.bestSessionVolume ?? 0;

    const isFirstTime = !previousPB;
    let isPR = false;
    let improvement = 0;
    let percentIncrease = 0;

    // Check for PR (single set or session volume)
    if (isFirstTime) {
      isPR = true;
      improvement = newBestSingleSet;
      percentIncrease = 100;
    } else if (newBestSingleSet > previousBestSingleSet || newSessionVolume > previousSessionVolume) {
      isPR = true;
      // Use best single set as primary metric for improvement
      improvement = newBestSingleSet - previousBestSingleSet;
      percentIncrease = previousBestSingleSet > 0
        ? ((newBestSingleSet - previousBestSingleSet) / previousBestSingleSet) * 100
        : 100;
    }

    // Update personal bests in database if PR detected
    if (isPR) {
      const updatePB = db.prepare(`
        INSERT INTO personal_bests (user_id, exercise_name, best_single_set, best_session_volume, updated_at)
        VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, exercise_name) DO UPDATE SET
          best_single_set = MAX(best_single_set, excluded.best_single_set),
          best_session_volume = MAX(best_session_volume, excluded.best_session_volume),
          updated_at = CURRENT_TIMESTAMP
      `);
      updatePB.run(exerciseName, newBestSingleSet, newSessionVolume);
    }

    // Add to results if PR or first time
    if (isPR || isFirstTime) {
      prs.push({
        isPR,
        exercise: exerciseName,
        newVolume: newBestSingleSet,
        previousVolume: previousBestSingleSet,
        improvement,
        percentIncrease: Math.round(percentIncrease * 10) / 10, // Round to 1 decimal
        isFirstTime
      });
    }
  }

  return prs;
}

/**
 * Get last performance for a specific exercise
 *
 * Retrieves the most recent workout containing the specified exercise
 * and returns the first set's data (weight, reps, date) as the baseline.
 *
 * @param exerciseName - Name of the exercise to query
 * @returns Last performance data or null if no history exists
 */
function getLastPerformanceForExercise(exerciseName: string): {
  weight: number;
  reps: number;
  date: string;
  workoutId: number;
} | null {
  const result = db.prepare(`
    SELECT w.id as workout_id, w.date, es.weight, es.reps
    FROM workouts w
    JOIN exercise_sets es ON w.id = es.workout_id
    WHERE w.user_id = 1 AND es.exercise_name = ?
    ORDER BY w.date DESC, es.set_number ASC
    LIMIT 1
  `).get(exerciseName) as {
    workout_id: number;
    date: string;
    weight: number;
    reps: number;
  } | undefined;

  if (!result) {
    return null;
  }

  return {
    weight: result.weight,
    reps: result.reps,
    date: result.date,
    workoutId: result.workout_id
  };
}

/**
 * Get previous performance for a specific exercise (second-to-last workout)
 *
 * Used to detect which progression method was used last time.
 *
 * @param exerciseName - Name of the exercise to query
 * @returns Previous performance data or null if insufficient history
 */
function getPreviousPerformanceForExercise(exerciseName: string): {
  weight: number;
  reps: number;
  date: string;
} | null {
  const result = db.prepare(`
    SELECT w.date, es.weight, es.reps
    FROM workouts w
    JOIN exercise_sets es ON w.id = es.workout_id
    WHERE w.user_id = 1 AND es.exercise_name = ?
    ORDER BY w.date DESC, es.set_number ASC
    LIMIT 1 OFFSET 1
  `).get(exerciseName) as {
    date: string;
    weight: number;
    reps: number;
  } | undefined;

  if (!result) {
    return null;
  }

  return {
    weight: result.weight,
    reps: result.reps,
    date: result.date
  };
}

/**
 * Get progressive overload suggestions for an exercise
 *
 * Calculates both +3% weight and +3% reps options from last performance,
 * detects which method was used last time, and recommends alternating.
 *
 * @param exerciseName - Name of the exercise
 * @returns Progressive suggestion object or null if no history
 */
function getProgressiveSuggestions(exerciseName: string): {
  lastPerformance: {
    weight: number;
    reps: number;
    date: string;
  };
  lastMethod: 'weight' | 'reps' | 'none';
  weightOption: {
    weight: number;
    reps: number;
    method: 'weight';
  };
  repsOption: {
    weight: number;
    reps: number;
    method: 'reps';
  };
  suggested: 'weight' | 'reps';
  daysAgo: number;
} | null {
  // Get last two performances
  const lastPerf = getLastPerformanceForExercise(exerciseName);
  const previousPerf = getPreviousPerformanceForExercise(exerciseName);

  if (!lastPerf) {
    return null; // No history, user must establish baseline
  }

  // Calculate days since last performance
  const lastDate = new Date(lastPerf.date).getTime();
  const now = Date.now();
  const daysAgo = Math.round((now - lastDate) / (1000 * 60 * 60 * 24));

  // Detect last method used (weight/reps/none)
  let lastMethod: 'weight' | 'reps' | 'none' = 'none';

  if (previousPerf) {
    const weightIncreased = lastPerf.weight > previousPerf.weight;
    const repsIncreased = lastPerf.reps > previousPerf.reps;
    const weightDecreased = lastPerf.weight < previousPerf.weight;
    const repsDecreased = lastPerf.reps < previousPerf.reps;

    // Clear weight progression: weight up, reps same
    if (weightIncreased && !repsIncreased && !repsDecreased) {
      lastMethod = 'weight';
    }
    // Clear reps progression: reps up, weight same
    else if (repsIncreased && !weightIncreased && !weightDecreased) {
      lastMethod = 'reps';
    }
    // Otherwise: both changed, neither changed, or regression → "none"
  }

  // Calculate +3% weight option (round to nearest integer)
  const weightOption = {
    weight: Math.round(lastPerf.weight * 1.03),
    reps: lastPerf.reps,
    method: 'weight' as const
  };

  // Calculate +3% reps option (round up)
  const repsOption = {
    weight: lastPerf.weight,
    reps: Math.ceil(lastPerf.reps * 1.03),
    method: 'reps' as const
  };

  // Determine recommended method (alternate from last)
  const suggested =
    lastMethod === 'weight' ? 'reps' :
    lastMethod === 'reps' ? 'weight' :
    'reps'; // Default to reps if unclear (safer for joints)

  return {
    lastPerformance: {
      weight: lastPerf.weight,
      reps: lastPerf.reps,
      date: lastPerf.date
    },
    lastMethod,
    weightOption,
    repsOption,
    suggested,
    daysAgo
  };
}

/**
 * Get muscle states with calculated fields
 *
 * This function implements the backend calculation engine for muscle state.
 * It reads immutable historical facts from the database and calculates current
 * state based on time elapsed and recovery formulas.
 */
function getMuscleStates(): MuscleStatesResponse {
  // Get user's recovery days setting
  const user = db.prepare('SELECT recovery_days_to_full FROM users WHERE id = 1').get() as { recovery_days_to_full: number } | undefined;
  const recoveryDaysToFull = user?.recovery_days_to_full || 5;

  const states = db.prepare(`
    SELECT muscle_name, initial_fatigue_percent, last_trained
    FROM muscle_states
    WHERE user_id = 1
  `).all() as Array<{
    muscle_name: string;
    initial_fatigue_percent: number;
    last_trained: string | null;
  }>;

  const now = Date.now();
  const result: MuscleStatesResponse = {};

  for (const state of states) {
    // Handle never-trained muscles (last_trained is null)
    if (!state.last_trained) {
      result[state.muscle_name] = {
        currentFatiguePercent: 0,
        daysElapsed: null,
        estimatedRecoveryDays: 1, // Base recovery time
        daysUntilRecovered: 0,
        recoveryStatus: 'ready',
        initialFatiguePercent: 0,
        lastTrained: null
      };
      continue;
    }

    // Calculate time elapsed since workout
    const lastTrainedTime = new Date(state.last_trained).getTime();
    const daysElapsed = (now - lastTrainedTime) / (1000 * 60 * 60 * 24);

    // Calculate recovery time using user's configured recovery days
    // Use user's recovery_days_to_full setting instead of hardcoded 7 days
    // Formula: currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)
    const estimatedRecoveryDays = recoveryDaysToFull;

    // Calculate current fatigue using linear decay
    // currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)
    let currentFatiguePercent = state.initial_fatigue_percent * (1 - daysElapsed / estimatedRecoveryDays);

    // Apply bounds checking (clamp to 0-100)
    currentFatiguePercent = Math.max(0, Math.min(100, currentFatiguePercent));

    // Round to 1 decimal place for display
    currentFatiguePercent = Math.round(currentFatiguePercent * 10) / 10;

    // Calculate days until fully recovered
    let daysUntilRecovered = Math.max(0, estimatedRecoveryDays - daysElapsed);
    daysUntilRecovered = Math.round(daysUntilRecovered * 10) / 10;

    // Determine recovery status based on thresholds
    // ready: <= 33%, recovering: <= 66%, fatigued: > 66%
    let recoveryStatus: 'ready' | 'recovering' | 'fatigued';
    if (currentFatiguePercent <= 33) {
      recoveryStatus = 'ready';
    } else if (currentFatiguePercent <= 66) {
      recoveryStatus = 'recovering';
    } else {
      recoveryStatus = 'fatigued';
    }

    result[state.muscle_name] = {
      currentFatiguePercent,
      daysElapsed: Math.round(daysElapsed * 10) / 10,
      estimatedRecoveryDays: Math.round(estimatedRecoveryDays * 10) / 10,
      daysUntilRecovered,
      recoveryStatus,
      initialFatiguePercent: state.initial_fatigue_percent,
      lastTrained: state.last_trained
    };
  }

  return result;
}

/**
 * Update muscle states
 *
 * Stores immutable historical facts from a workout and returns calculated current state.
 * The response includes all calculated fields from getMuscleStates().
 */
function updateMuscleStates(states: MuscleStatesUpdateRequest): MuscleStatesResponse {
  const update = db.prepare(`
    UPDATE muscle_states
    SET initial_fatigue_percent = ?, volume_today = ?, last_trained = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = 1 AND muscle_name = ?
  `);

  const updateTransaction = db.transaction(() => {
    for (const [muscleName, state] of Object.entries(states)) {
      update.run(
        state.initial_fatigue_percent,
        state.volume_today ?? 0,
        state.last_trained,
        muscleName
      );
    }
  });

  updateTransaction();

  // Return calculated muscle states with all fields
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

/**
 * Get last variation used for a category and suggest opposite
 *
 * Returns the last variation used in a category and suggests
 * the opposite variation for balanced training.
 *
 * @param category - Exercise category (Push/Pull/Legs/Core)
 * @returns Variation suggestion object or default to 'A' if no history
 */
function getLastVariationForCategory(category: string): {
  suggested: 'A' | 'B';
  lastVariation: 'A' | 'B' | null;
  lastDate: string | null;
  daysAgo: number | null;
} {
  const lastWorkout = db.prepare(`
    SELECT variation, date
    FROM workouts
    WHERE user_id = 1 AND category = ?
    ORDER BY date DESC
    LIMIT 1
  `).get(category) as { variation: string; date: string } | undefined;

  if (!lastWorkout) {
    return {
      suggested: 'A', // Default to A for first workout
      lastVariation: null,
      lastDate: null,
      daysAgo: null
    };
  }

  // Calculate days since last workout
  const lastDate = new Date(lastWorkout.date).getTime();
  const now = Date.now();
  const daysAgo = Math.round((now - lastDate) / (1000 * 60 * 60 * 24));

  // Suggest opposite of what was done last time
  const suggested = lastWorkout.variation === 'A' ? 'B' : 'A';

  return {
    suggested,
    lastVariation: lastWorkout.variation as 'A' | 'B',
    lastDate: lastWorkout.date,
    daysAgo
  };
}

/**
 * Get last workout by category
 */
function getLastWorkoutByCategory(category: string): WorkoutResponse | null {
  const workout = db.prepare(`
    SELECT * FROM workouts
    WHERE user_id = 1 AND category = ?
    ORDER BY date DESC
    LIMIT 1
  `).get(category) as WorkoutRow | undefined;

  if (!workout) {
    return null;
  }

  // Get exercise sets for this workout
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

  return {
    id: workout.id,
    date: workout.date,
    category: workout.category,
    variation: workout.variation,
    progression_method: workout.progression_method,
    duration_seconds: workout.duration_seconds,
    exercises: Object.values(exercisesMap),
    created_at: workout.created_at
  };
}

/**
 * Get all calibrations for user
 */
function getUserCalibrations(): Record<string, Record<string, number>> {
  const calibrations = db.prepare(`
    SELECT exercise_id, muscle_name, engagement_percentage
    FROM user_exercise_calibrations
    WHERE user_id = 1
  `).all() as Array<{
    exercise_id: string;
    muscle_name: string;
    engagement_percentage: number;
  }>;

  const result: Record<string, Record<string, number>> = {};
  for (const cal of calibrations) {
    if (!result[cal.exercise_id]) {
      result[cal.exercise_id] = {};
    }
    result[cal.exercise_id][cal.muscle_name] = cal.engagement_percentage;
  }

  return result;
}

/**
 * Get calibrations for specific exercise (merged with defaults)
 */
function getExerciseCalibrations(exerciseId: string): {
  exerciseId: string;
  exerciseName: string;
  engagements: Array<{
    muscle: string;
    percentage: number;
    isCalibrated: boolean;
  }>;
} {
  // Find exercise in library
  const exercise = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
  if (!exercise) {
    throw new Error(`Exercise not found: ${exerciseId}`);
  }

  // Get user calibrations for this exercise
  const calibrations = db.prepare(`
    SELECT muscle_name, engagement_percentage
    FROM user_exercise_calibrations
    WHERE user_id = 1 AND exercise_id = ?
  `).all(exerciseId) as Array<{
    muscle_name: string;
    engagement_percentage: number;
  }>;

  // Create lookup map
  const calibrationMap: Record<string, number> = {};
  for (const cal of calibrations) {
    calibrationMap[cal.muscle_name] = cal.engagement_percentage;
  }

  // Merge with defaults
  const engagements = exercise.muscleEngagements.map(engagement => ({
    muscle: engagement.muscle,
    percentage: calibrationMap[engagement.muscle] ?? engagement.percentage,
    isCalibrated: !!calibrationMap[engagement.muscle]
  }));

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    engagements
  };
}

/**
 * Save calibrations for exercise
 */
function saveExerciseCalibrations(
  exerciseId: string,
  calibrations: Record<string, number>
): void {
  // Validate exercise exists
  const exercise = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
  if (!exercise) {
    throw new Error(`Exercise not found: ${exerciseId}`);
  }

  // Transaction: upsert all calibrations
  const upsert = db.prepare(`
    INSERT INTO user_exercise_calibrations (user_id, exercise_id, muscle_name, engagement_percentage)
    VALUES (1, ?, ?, ?)
    ON CONFLICT(user_id, exercise_id, muscle_name) DO UPDATE SET
      engagement_percentage = excluded.engagement_percentage,
      updated_at = CURRENT_TIMESTAMP
  `);

  const saveTransaction = db.transaction(() => {
    for (const [muscleName, percentage] of Object.entries(calibrations)) {
      upsert.run(exerciseId, muscleName, percentage);
    }
  });

  saveTransaction();
}

/**
 * Delete all calibrations for exercise
 */
function deleteExerciseCalibrations(exerciseId: string): void {
  db.prepare(`
    DELETE FROM user_exercise_calibrations
    WHERE user_id = 1 AND exercise_id = ?
  `).run(exerciseId);
}

// Export database instance and helper functions
export {
  db,
  getProfile,
  updateProfile,
  initializeProfile,
  getWorkouts,
  getLastWorkoutByCategory,
  getLastVariationForCategory,
  saveWorkout,
  detectPRsForWorkout,
  getProgressiveSuggestions,
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
  deleteWorkoutTemplate,
  getUserCalibrations,
  getExerciseCalibrations,
  saveExerciseCalibrations,
  deleteExerciseCalibrations,
  getRotationState,
  getNextWorkout,
  advanceRotation
};

// ============================================
// WORKOUT ROTATION ENGINE
// ============================================

/**
 * Get the current rotation state for a user
 */
function getRotationState(userId: number = 1): WorkoutRotationState {
  const row = db.prepare(`
    SELECT * FROM workout_rotation_state WHERE user_id = ?
  `).get(userId) as WorkoutRotationStateRow | undefined;

  if (!row) {
    // Initialize default state if not exists
    db.prepare(`
      INSERT INTO workout_rotation_state (user_id, current_cycle, current_phase, rest_days_count)
      VALUES (?, 'A', 0, 0)
    `).run(userId);

    return {
      userId,
      currentCycle: 'A',
      currentPhase: 0,
      lastWorkoutDate: null,
      lastWorkoutCategory: null,
      lastWorkoutVariation: null,
      restDaysCount: 0
    };
  }

  return {
    id: row.id,
    userId: row.user_id,
    currentCycle: row.current_cycle,
    currentPhase: row.current_phase,
    lastWorkoutDate: row.last_workout_date,
    lastWorkoutCategory: row.last_workout_category as ExerciseCategory | null,
    lastWorkoutVariation: row.last_workout_variation,
    restDaysCount: row.rest_days_count,
    updatedAt: row.updated_at
  };
}

/**
 * Get the next recommended workout based on rotation state
 */
function getNextWorkout(userId: number = 1): WorkoutRecommendation {
  const state = getRotationState(userId);

  // Calculate days since last workout
  let daysAgo = 0;
  if (state.lastWorkoutDate) {
    const lastDate = new Date(state.lastWorkoutDate);
    const now = new Date();
    daysAgo = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // If this is the first workout ever, start at Push A
  if (!state.lastWorkoutDate) {
    const firstWorkout = ROTATION_SEQUENCE[0];
    return {
      isRestDay: false,
      category: firstWorkout.category,
      variation: firstWorkout.variation,
      phase: 0
    };
  }

  // Check if rest days are needed
  const lastWorkout = ROTATION_SEQUENCE[state.currentPhase];
  if (state.restDaysCount < lastWorkout.restAfter) {
    return {
      isRestDay: true,
      reason: 'Scheduled rest day',
      lastWorkout: state.lastWorkoutCategory && state.lastWorkoutVariation ? {
        category: state.lastWorkoutCategory,
        variation: state.lastWorkoutVariation,
        date: state.lastWorkoutDate!,
        daysAgo
      } : undefined
    };
  }

  // Get next workout in sequence
  const nextPhase = (state.currentPhase + 1) % ROTATION_SEQUENCE.length;
  const nextWorkout = ROTATION_SEQUENCE[nextPhase];

  // Validate 5-day rule: same muscle group shouldn't be hit within 5 days
  if (state.lastWorkoutCategory && state.lastWorkoutDate) {
    // Push/Pull/Legs are the main categories, Core doesn't count for 5-day rule
    if (state.lastWorkoutCategory !== 'Core' && nextWorkout.category !== 'Core') {
      if (state.lastWorkoutCategory === nextWorkout.category && daysAgo < 5) {
        return {
          isRestDay: true,
          reason: 'Muscle group needs more recovery (5-day rule)',
          lastWorkout: {
            category: state.lastWorkoutCategory,
            variation: state.lastWorkoutVariation!,
            date: state.lastWorkoutDate,
            daysAgo
          }
        };
      }
    }
  }

  return {
    isRestDay: false,
    category: nextWorkout.category,
    variation: nextWorkout.variation,
    phase: nextPhase,
    lastWorkout: state.lastWorkoutCategory && state.lastWorkoutVariation ? {
      category: state.lastWorkoutCategory,
      variation: state.lastWorkoutVariation,
      date: state.lastWorkoutDate!,
      daysAgo
    } : undefined
  };
}

/**
 * Advance the rotation state after completing a workout
 */
function advanceRotation(
  userId: number,
  completedCategory: ExerciseCategory,
  completedVariation: 'A' | 'B',
  workoutDate: string
): void {
  const state = getRotationState(userId);

  // Core workouts don't advance the rotation phase
  if (completedCategory === 'Core') {
    db.prepare(`
      UPDATE workout_rotation_state
      SET last_workout_date = ?,
          last_workout_category = ?,
          last_workout_variation = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(workoutDate, completedCategory, completedVariation, userId);
    return;
  }

  // Advance to next phase
  const nextPhase = (state.currentPhase + 1) % ROTATION_SEQUENCE.length;

  // Determine cycle: transitions happen after Pull B (phase 5 → phase 0)
  let newCycle = state.currentCycle;
  if (state.currentPhase === 5 && nextPhase === 0) {
    // Cycle repeats, stay in current cycle pattern
    // The sequence itself handles A/B variation
  }

  db.prepare(`
    UPDATE workout_rotation_state
    SET current_phase = ?,
        current_cycle = ?,
        last_workout_date = ?,
        last_workout_category = ?,
        last_workout_variation = ?,
        rest_days_count = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(nextPhase, newCycle, workoutDate, completedCategory, completedVariation, userId);

  console.log(`Rotation advanced: Phase ${state.currentPhase} → ${nextPhase}, Category: ${completedCategory} ${completedVariation}`);
}

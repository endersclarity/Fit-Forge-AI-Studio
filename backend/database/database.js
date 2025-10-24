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
db.pragma('journal_mode = WAL'); // Better performance for concurrent reads

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
      SELECT exercise_name as exercise, weight, reps, set_number
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
      exercisesMap[set.exercise].sets.push({ weight: set.weight, reps: set.reps });
    }

    workout.exercises = Object.values(exercisesMap);
    delete workout.user_id; // Clean up response
  }

  return workouts;
}

/**
 * Save a new workout
 */
function saveWorkout(workout) {
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
    const workoutId = result.lastInsertRowid;

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
  const savedWorkout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
  const sets = db.prepare(`
    SELECT exercise_name as exercise, weight, reps, set_number
    FROM exercise_sets
    WHERE workout_id = ?
    ORDER BY set_number
  `).all(workoutId);

  const exercisesMap = {};
  for (const set of sets) {
    if (!exercisesMap[set.exercise]) {
      exercisesMap[set.exercise] = { exercise: set.exercise, sets: [] };
    }
    exercisesMap[set.exercise].sets.push({ weight: set.weight, reps: set.reps });
  }

  savedWorkout.exercises = Object.values(exercisesMap);
  delete savedWorkout.user_id;

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

// Export database instance and helper functions
module.exports = {
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
  updateMuscleBaselines
};

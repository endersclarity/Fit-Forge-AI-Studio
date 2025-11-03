import Database from 'better-sqlite3';

const db = new Database('./data/fitforge.db', { readonly: true });

console.log('\n=== DATABASE TABLES ===\n');

const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
`).all();

console.log(tables);

// Check if muscle_states table exists
const muscleStatesExists = tables.some((t: any) => t.name === 'muscle_states');
console.log(`\nmuscle_states table exists: ${muscleStatesExists}`);

if (muscleStatesExists) {
  console.log('\n=== MUSCLE STATES FOR LEG MUSCLES ===\n');

  const muscleStates = db.prepare(`
    SELECT muscle_name, initial_fatigue_percent, last_trained, updated_at
    FROM muscle_states
    WHERE muscle_name IN ('Quadriceps', 'Hamstrings', 'Glutes', 'Calves')
    ORDER BY updated_at DESC
  `).all();

  console.log(muscleStates);

  console.log('\n=== ALL MUSCLE STATES ===\n');

  const allStates = db.prepare(`
    SELECT muscle_name, initial_fatigue_percent, last_trained, updated_at
    FROM muscle_states
    ORDER BY updated_at DESC
    LIMIT 20
  `).all();

  console.log(allStates);
}

console.log('\n=== RECENT WORKOUTS WITH LEG EXERCISES ===\n');

const recentWorkouts = db.prepare(`
  SELECT
    w.id,
    w.date,
    w.category,
    GROUP_CONCAT(DISTINCT es.exercise_name) as exercises
  FROM workouts w
  LEFT JOIN exercise_sets es ON w.id = es.workout_id
  WHERE w.date >= date('now', '-7 days')
  GROUP BY w.id
  ORDER BY w.date DESC
  LIMIT 10
`).all();

console.log(recentWorkouts);

console.log('\n=== LEG WORKOUT DETAILS (ID 61) ===\n');

const legWorkoutSets = db.prepare(`
  SELECT exercise_name, weight, reps, set_number, to_failure
  FROM exercise_sets
  WHERE workout_id = 61
  ORDER BY set_number
`).all();

console.log(legWorkoutSets);

db.close();

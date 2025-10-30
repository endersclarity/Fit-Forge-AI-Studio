const sqlite3 = require('better-sqlite3');
const db = new sqlite3('/data/fitforge.db');

// Get the most recent 5 workouts with details
const workouts = db.prepare(`
  SELECT
    w.id,
    w.date,
    w.category,
    w.variation,
    w.duration_seconds,
    w.created_at
  FROM workouts w
  ORDER BY w.created_at DESC
  LIMIT 5
`).all();

for (const workout of workouts) {
  console.log('\n=== WORKOUT', workout.id, '===');
  console.log('Date:', workout.date);
  console.log('Category:', workout.category, workout.variation);
  console.log('Duration:', Math.floor(workout.duration_seconds / 60), 'min', workout.duration_seconds % 60, 'sec');

  const exercises = db.prepare(`
    SELECT we.id, we.exercise_id, we.position, e.name as exercise_name
    FROM workout_exercises we
    LEFT JOIN exercises e ON we.exercise_id = e.id
    WHERE we.workout_id = ?
    ORDER BY we.position
  `).all(workout.id);

  if (exercises.length === 0) {
    console.log('  No exercises recorded');
  } else {
    for (const exercise of exercises) {
      console.log('  Exercise:', exercise.exercise_name || 'Unknown');

      const sets = db.prepare(`
        SELECT set_number, weight, reps, completed
        FROM workout_sets
        WHERE workout_exercise_id = ?
        ORDER BY set_number
      `).all(exercise.id);

      for (const set of sets) {
        console.log('    Set', set.set_number + ':', set.weight + 'lbs x', set.reps, 'reps', set.completed ? '✓' : '✗');
      }
    }
  }
}

db.close();

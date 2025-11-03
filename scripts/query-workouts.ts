import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/fitforge.db');
const db = new Database(DB_PATH, { readonly: true });

console.log('=== WORKOUTS SUMMARY ===\n');

// Get workout count
const countResult = db.prepare('SELECT COUNT(*) as count FROM workouts').get() as { count: number };
console.log(`Total workouts logged: ${countResult.count}\n`);

// Get recent workouts with details
const workouts = db.prepare(`
  SELECT
    w.id,
    w.date,
    w.category,
    w.variation,
    w.duration_seconds,
    COUNT(es.id) as sets_count,
    GROUP_CONCAT(DISTINCT es.exercise_name) as exercises
  FROM workouts w
  LEFT JOIN exercise_sets es ON w.id = es.workout_id
  GROUP BY w.id
  ORDER BY w.date DESC
  LIMIT 20
`).all() as Array<{
  id: number;
  date: string;
  category: string | null;
  variation: string | null;
  duration_seconds: number | null;
  sets_count: number;
  exercises: string;
}>;

if (workouts.length === 0) {
  console.log('No workouts found in the database.');
} else {
  console.log('=== RECENT WORKOUTS ===\n');
  workouts.forEach((w, idx) => {
    console.log(`${idx + 1}. Workout #${w.id}`);
    console.log(`   Date: ${w.date}`);
    console.log(`   Category: ${w.category || 'N/A'}`);
    console.log(`   Variation: ${w.variation || 'N/A'}`);
    console.log(`   Sets: ${w.sets_count}`);
    console.log(`   Duration: ${w.duration_seconds ? `${Math.floor(w.duration_seconds / 60)} minutes` : 'N/A'}`);

    // Show first few exercises
    if (w.exercises) {
      const exerciseList = w.exercises.split(',').slice(0, 3).join(', ');
      const more = w.exercises.split(',').length > 3 ? '...' : '';
      console.log(`   Exercises: ${exerciseList}${more}`);
    }
    console.log('');
  });
}

// Get exercise statistics
console.log('\n=== EXERCISE STATISTICS ===\n');
const exerciseStats = db.prepare(`
  SELECT
    es.exercise_name,
    COUNT(DISTINCT es.workout_id) as workout_count,
    COUNT(es.id) as total_sets,
    MAX(es.weight * es.reps) as best_volume,
    AVG(es.weight * es.reps) as avg_volume
  FROM exercise_sets es
  GROUP BY es.exercise_name
  ORDER BY workout_count DESC, total_sets DESC
  LIMIT 10
`).all() as Array<{
  exercise_name: string;
  workout_count: number;
  total_sets: number;
  best_volume: number;
  avg_volume: number;
}>;

if (exerciseStats.length > 0) {
  console.log('Top exercises by frequency:\n');
  exerciseStats.forEach((stat, idx) => {
    console.log(`${idx + 1}. ${stat.exercise_name}`);
    console.log(`   Workouts: ${stat.workout_count}`);
    console.log(`   Total Sets: ${stat.total_sets}`);
    console.log(`   Best Volume: ${Math.round(stat.best_volume)}`);
    console.log(`   Avg Volume: ${Math.round(stat.avg_volume)}`);
    console.log('');
  });
}

db.close();

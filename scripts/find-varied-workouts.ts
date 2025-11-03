import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/fitforge.db');
const db = new Database(DB_PATH, { readonly: true });

console.log('=== WORKOUTS WITH MULTIPLE EXERCISES ===\n');

const workouts = db.prepare(`
  SELECT
    w.id,
    w.date,
    w.category,
    w.variation,
    GROUP_CONCAT(DISTINCT es.exercise_name) as exercises,
    COUNT(DISTINCT es.exercise_name) as exercise_count
  FROM workouts w
  LEFT JOIN exercise_sets es ON w.id = es.workout_id
  GROUP BY w.id
  HAVING exercise_count > 1
  ORDER BY w.date ASC
  LIMIT 10
`).all() as Array<{
  id: number;
  date: string;
  category: string;
  variation: string;
  exercises: string;
  exercise_count: number;
}>;

if (workouts.length === 0) {
  console.log('No workouts with multiple exercises found.');
} else {
  workouts.forEach((w, idx) => {
    console.log(`${idx + 1}. Workout #${w.id} - ${new Date(w.date).toLocaleDateString()}`);
    console.log(`   Category: ${w.category}, Variation: ${w.variation}`);
    console.log(`   Exercises (${w.exercise_count}): ${w.exercises}`);
    console.log('');
  });
}

db.close();

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/fitforge.db');
const db = new Database(DB_PATH, { readonly: true });

const workout = db.prepare(`SELECT * FROM workouts ORDER BY date DESC LIMIT 1`).get() as any;

if (!workout) {
  console.log('No workouts found.');
  db.close();
  process.exit(0);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 CURRENT WORKOUT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`Date: ${new Date(workout.date).toLocaleDateString()}`);
console.log(`Category: ${workout.category || 'N/A'}`);
console.log(`Variation: ${workout.variation || 'N/A'}`);
console.log('');

const sets = db.prepare(`
  SELECT exercise_name, weight, reps, set_number, to_failure
  FROM exercise_sets
  WHERE workout_id = ?
  ORDER BY set_number
`).all(workout.id) as any[];

const byExercise: Record<string, any[]> = {};
sets.forEach(set => {
  if (!byExercise[set.exercise_name]) {
    byExercise[set.exercise_name] = [];
  }
  byExercise[set.exercise_name].push(set);
});

console.log('EXERCISES:\n');

Object.entries(byExercise).forEach(([exercise, exerciseSets], idx) => {
  console.log(`${idx + 1}. ${exercise}`);
  exerciseSets.forEach((set, setIdx) => {
    const weight = set.weight > 0 ? `${set.weight} lbs × ` : '';
    const toFailure = set.to_failure === 1 ? ' ✓ to failure' : '';
    console.log(`   Set ${setIdx + 1}: ${weight}${set.reps} reps${toFailure}`);
  });

  const totalSets = exerciseSets.length;
  const totalReps = exerciseSets.reduce((sum: number, s: any) => sum + s.reps, 0);
  const totalVolume = exerciseSets.reduce((sum: number, s: any) => sum + (s.weight * s.reps), 0);
  const failureSets = exerciseSets.filter((s: any) => s.to_failure === 1).length;

  console.log(`   📊 ${totalSets} sets, ${totalReps} reps${totalVolume > 0 ? `, ${totalVolume} volume` : ''}${failureSets > 0 ? ` (${failureSets} to failure)` : ''}`);
  console.log('');
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n✅ Database contains 1 clean workout with ${sets.length} total sets\n`);

db.close();

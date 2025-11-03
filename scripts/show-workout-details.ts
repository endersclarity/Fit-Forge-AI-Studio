import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/fitforge.db');
const db = new Database(DB_PATH, { readonly: true });

// Get a few different workouts to show variety
const workoutIds = [54, 50, 42, 38]; // Some of the workouts with 3 sets

console.log('=== DETAILED WORKOUT VIEW ===\n');

workoutIds.forEach(workoutId => {
  const workout = db.prepare(`
    SELECT * FROM workouts WHERE id = ?
  `).get(workoutId) as any;

  if (!workout) return;

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`WORKOUT #${workout.id}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Date: ${new Date(workout.date).toLocaleString()}`);
  console.log(`Category: ${workout.category || 'N/A'}`);
  console.log(`Variation: ${workout.variation || 'N/A'}`);
  console.log(`Duration: ${workout.duration_seconds ? `${Math.floor(workout.duration_seconds / 60)} min ${workout.duration_seconds % 60} sec` : 'N/A'}`);
  console.log('');

  const sets = db.prepare(`
    SELECT
      exercise_name,
      weight,
      reps,
      set_number,
      to_failure
    FROM exercise_sets
    WHERE workout_id = ?
    ORDER BY set_number
  `).all(workoutId) as any[];

  if (sets.length > 0) {
    console.log('EXERCISES & SETS:');
    console.log('─────────────────────────────────────────');

    // Group by exercise
    const byExercise: Record<string, any[]> = {};
    sets.forEach(set => {
      if (!byExercise[set.exercise_name]) {
        byExercise[set.exercise_name] = [];
      }
      byExercise[set.exercise_name].push(set);
    });

    Object.entries(byExercise).forEach(([exercise, exerciseSets], idx) => {
      console.log(`\n${idx + 1}. ${exercise}`);
      exerciseSets.forEach((set, setIdx) => {
        const volume = set.weight * set.reps;
        const toFailure = set.to_failure === 1 ? ' (to failure)' : '';
        console.log(`   Set ${setIdx + 1}: ${set.weight} lbs × ${set.reps} reps = ${volume} volume${toFailure}`);
      });

      // Calculate totals for this exercise
      const totalVolume = exerciseSets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
      const totalReps = exerciseSets.reduce((sum, s) => sum + s.reps, 0);
      console.log(`   → Total: ${exerciseSets.length} sets, ${totalReps} reps, ${totalVolume} volume`);
    });
  } else {
    console.log('No sets recorded for this workout.');
  }
});

console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

db.close();

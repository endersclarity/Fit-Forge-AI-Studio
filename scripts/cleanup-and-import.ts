import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/fitforge.db');
const WORKOUT_FILE = path.join(__dirname, '../workouts/2025-10-29-chest-triceps.json');

const db = new Database(DB_PATH);

console.log('🗑️  Cleaning up database...\n');

// Step 1: Delete all existing workouts (CASCADE will delete exercise_sets)
const workoutCount = db.prepare('SELECT COUNT(*) as count FROM workouts').get() as { count: number };
console.log(`Found ${workoutCount.count} workouts to delete`);

db.prepare('DELETE FROM workouts').run();
console.log('✅ All workouts deleted');

// Step 2: Clear related tables
db.prepare('DELETE FROM personal_bests').run();
console.log('✅ Personal bests cleared');

// Reset muscle states (only reset fields that exist in current schema)
db.prepare(`UPDATE muscle_states SET initial_fatigue_percent = 0, last_trained = NULL`).run();
console.log('✅ Muscle states reset');

console.log('\n📥 Importing legitimate workout...\n');

// Step 3: Read and import the workout file
const workoutData = JSON.parse(fs.readFileSync(WORKOUT_FILE, 'utf-8'));

console.log(`Date: ${workoutData.date}`);
console.log(`Total Working Sets: ${workoutData.summary.totalWorkingSets}`);
console.log(`Sets to Failure: ${workoutData.summary.setsToFailure}`);
console.log(`Primary Focus: ${workoutData.summary.primaryFocus.join(', ')}`);

// Convert to database format
const exercises: Array<{
  exercise: string;
  sets: Array<{ weight: number; reps: number; to_failure?: boolean }>;
}> = [];

for (const ex of workoutData.exercises) {
  const sets = ex.sets.map((set: any) => {
    let weight = 0;

    // For dumbbell exercises with weightPerHand, double the weight
    if (set.weight !== undefined) {
      weight = set.weightPerHand ? set.weight * 2 : set.weight;
    }

    return {
      weight,
      reps: set.reps,
      to_failure: set.toFailure
    };
  });

  exercises.push({
    exercise: ex.name,
    sets
  });
}

// Insert the workout
const insertWorkout = db.prepare(`
  INSERT INTO workouts (user_id, date, category, variation, progression_method, duration_seconds)
  VALUES (1, ?, ?, ?, ?, ?)
`);

const insertSet = db.prepare(`
  INSERT INTO exercise_sets (workout_id, exercise_name, weight, reps, set_number, to_failure)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const result = insertWorkout.run(
  workoutData.timestamp,
  'Push', // Category based on chest/triceps focus
  null,
  null,
  null
);

const workoutId = result.lastInsertRowid as number;

// Insert all exercise sets
let globalSetNumber = 1;
for (const exercise of exercises) {
  console.log(`\n${exercise.exercise}:`);
  for (const set of exercise.sets) {
    insertSet.run(
      workoutId,
      exercise.exercise,
      set.weight,
      set.reps,
      globalSetNumber,
      set.to_failure ? 1 : 0
    );
    const toFailureStr = set.to_failure ? ' (to failure)' : '';
    console.log(`  Set ${globalSetNumber}: ${set.weight} lbs × ${set.reps} reps${toFailureStr}`);
    globalSetNumber++;
  }
}

console.log('\n✅ Workout imported successfully!\n');

// Verify
const finalCount = db.prepare('SELECT COUNT(*) as count FROM workouts').get() as { count: number };
const setsCount = db.prepare('SELECT COUNT(*) as count FROM exercise_sets').get() as { count: number };

console.log('📊 Database Summary:');
console.log(`   Workouts: ${finalCount.count}`);
console.log(`   Exercise Sets: ${setsCount.count}`);

db.close();

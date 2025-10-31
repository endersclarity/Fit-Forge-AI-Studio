const Database = require('better-sqlite3');
const db = new Database('/data/fitforge.db');
const { EXERCISE_LIBRARY } = require('./dist/shared/exercise-library.js');

// Get all sets from workout 60
const sets = db.prepare(`
  SELECT exercise_name, weight, reps
  FROM exercise_sets
  WHERE workout_id = 60
`).all();

console.log('Found', sets.length, 'sets in workout 60\n');

// Calculate muscle volumes
const muscleVolumes = {};

sets.forEach(set => {
  const exercise = EXERCISE_LIBRARY.find(ex => ex.name === set.exercise_name);
  if (!exercise) {
    console.log('Warning: Exercise not found:', set.exercise_name);
    return;
  }

  const setVolume = set.weight * set.reps;
  const muscleEngagements = exercise.muscleEngagements || [];
  const muscleNames = muscleEngagements.map(m => m.muscle);

  console.log(`${set.exercise_name}: ${set.weight} x ${set.reps} = ${setVolume} lbs -> ${muscleNames.join(', ')}`);

  muscleEngagements.forEach(engagement => {
    const muscle = engagement.muscle;
    const contribution = setVolume * (engagement.percentage / 100);
    if (!muscleVolumes[muscle]) muscleVolumes[muscle] = 0;
    muscleVolumes[muscle] += contribution;
  });
});

console.log('\nMuscle volumes from workout 60:');
console.log(JSON.stringify(muscleVolumes, null, 2));

// Check current baselines and update if needed
const baselines = db.prepare(`
  SELECT muscle_name, system_learned_max
  FROM muscle_baselines
  WHERE user_id = 1
`).all();

console.log('\n=== BASELINE UPDATES ===');
const updateStmt = db.prepare(`
  UPDATE muscle_baselines
  SET system_learned_max = ?, updated_at = CURRENT_TIMESTAMP
  WHERE user_id = 1 AND muscle_name = ?
`);

let updatesCount = 0;
baselines.forEach(b => {
  const workoutVol = muscleVolumes[b.muscle_name] || 0;
  if (workoutVol > b.system_learned_max) {
    console.log(`Updating ${b.muscle_name}: ${b.system_learned_max} -> ${workoutVol}`);
    updateStmt.run(workoutVol, b.muscle_name);
    updatesCount++;
  }
});

console.log(`\nUpdated ${updatesCount} baselines`);

// Now calculate and update PRs
console.log('\n=== PERSONAL RECORDS ===');

// Group sets by exercise
const exerciseGroups = {};
sets.forEach(set => {
  if (!exerciseGroups[set.exercise_name]) {
    exerciseGroups[set.exercise_name] = [];
  }
  exerciseGroups[set.exercise_name].push({ weight: set.weight, reps: set.reps });
});

// For each exercise, calculate best single set and session volume
Object.entries(exerciseGroups).forEach(([exerciseName, sets]) => {
  const sessionVolume = sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
  const bestSingleSet = Math.max(...sets.map(s => s.weight * s.reps));

  // Check if PR exists
  const existingPR = db.prepare(`
    SELECT best_single_set, best_session_volume
    FROM personal_bests
    WHERE user_id = 1 AND exercise_name = ?
  `).get(exerciseName);

  if (!existingPR) {
    // Insert new PR
    console.log(`Creating PR for ${exerciseName}: session=${sessionVolume}, best_set=${bestSingleSet}`);
    db.prepare(`
      INSERT INTO personal_bests (user_id, exercise_name, best_single_set, best_session_volume)
      VALUES (1, ?, ?, ?)
    `).run(exerciseName, bestSingleSet, sessionVolume);
  } else {
    // Update if better
    let updated = false;
    let newBestSet = existingPR.best_single_set;
    let newSessionVol = existingPR.best_session_volume;

    if (bestSingleSet > existingPR.best_single_set) {
      newBestSet = bestSingleSet;
      updated = true;
    }
    if (sessionVolume > existingPR.best_session_volume) {
      newSessionVol = sessionVolume;
      updated = true;
    }

    if (updated) {
      console.log(`Updating PR for ${exerciseName}:`);
      console.log(`  Best Set: ${existingPR.best_single_set} -> ${newBestSet}`);
      console.log(`  Session Vol: ${existingPR.best_session_volume} -> ${newSessionVol}`);

      db.prepare(`
        UPDATE personal_bests
        SET best_single_set = ?, best_session_volume = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = 1 AND exercise_name = ?
      `).run(newBestSet, newSessionVol, exerciseName);
    } else {
      console.log(`${exerciseName}: No PR (session=${sessionVolume}, best=${bestSingleSet})`);
    }
  }
});

console.log('\n=== DONE ===');

// Log a Legs Day A workout
const API_BASE_URL = 'http://localhost:3001/api';

const workout = {
  date: Date.now(),
  category: 'Legs',
  variation: 'A',
  progressionMethod: 'standard',
  durationSeconds: 3600, // 1 hour workout
  exercises: [
    {
      exercise: 'Kettlebell Goblet Squat',
      sets: [
        { weight: 40, reps: 20, to_failure: true },
        { weight: 40, reps: 20, to_failure: true },
        { weight: 40, reps: 20, to_failure: true }
      ]
    },
    {
      exercise: 'Calf Raises',
      sets: [
        { weight: 0, reps: 50, to_failure: true },
        { weight: 0, reps: 50, to_failure: true },
        { weight: 0, reps: 50, to_failure: true }
      ]
    },
    {
      exercise: 'Kettlebell Swings',
      sets: [
        { weight: 40, reps: 20, to_failure: true },
        { weight: 40, reps: 20, to_failure: true },
        { weight: 40, reps: 20, to_failure: true }
      ]
    },
    {
      exercise: 'Dumbbell Stiff Legged Deadlift',
      sets: [
        { weight: 100, reps: 15, to_failure: true },
        { weight: 100, reps: 15, to_failure: true },
        { weight: 100, reps: 15, to_failure: true }
      ]
    }
  ]
};

console.log('Saving Legs Day A workout...\n');

const response = await fetch(`${API_BASE_URL}/workouts`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(workout),
});

if (!response.ok) {
  const error = await response.text();
  console.error('Failed to save workout:', error);
  process.exit(1);
}

const saved = await response.json();
console.log('✅ Workout saved successfully!');
console.log(`\nWorkout ID: ${saved.id}`);
console.log(`Date: ${new Date(saved.date).toLocaleString()}`);
console.log(`Category: ${saved.category} ${saved.variation}`);
console.log(`Duration: ${saved.duration_seconds}s`);
console.log(`\nExercises:`);
saved.exercises.forEach(ex => {
  console.log(`  - ${ex.exercise}: ${ex.sets.length} sets`);
  ex.sets.forEach((set, i) => {
    console.log(`    Set ${i + 1}: ${set.weight} lbs × ${set.reps} reps`);
  });
});

if (saved.prs && saved.prs.length > 0) {
  console.log('\n🎉 Personal Records:');
  saved.prs.forEach(pr => {
    if (pr.isFirstTime) {
      console.log(`  - ${pr.exercise}: First time! ${pr.newVolume} lbs total`);
    } else {
      console.log(`  - ${pr.exercise}: ${pr.newVolume} lbs (${pr.percentIncrease}% increase)`);
    }
  });
}

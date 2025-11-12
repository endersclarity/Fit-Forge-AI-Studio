/**
 * Manual test for Fatigue Calculator
 * Run with: node backend/services/test-fatigue.js
 */

const { calculateFatigue, getAllMuscles, getBaselineSuggestions } = require('./fatigueCalculator');

console.log('='.repeat(80));
console.log('FATIGUE CALCULATOR TEST');
console.log('='.repeat(80));

// Test data
const testWorkout = {
  exercises: [
    {
      exerciseId: 'ex12', // Kettlebell Goblet Squat
      sets: [
        { weight: 70, reps: 10 },
        { weight: 70, reps: 10 },
        { weight: 70, reps: 10 }
      ]
    },
    {
      exerciseId: 'ex13', // Dumbbell Romanian Deadlift
      sets: [
        { weight: 100, reps: 10 },
        { weight: 100, reps: 10 },
        { weight: 100, reps: 10 }
      ]
    }
  ]
};

const testBaselines = {
  Quadriceps: 7000,
  Glutes: 6500,
  Hamstrings: 5200,
  Core: 3000,
  LowerBack: 2800,
  Pectoralis: 3400,
  Lats: 4500,
  AnteriorDeltoids: 2500,
  PosteriorDeltoids: 2000,
  Trapezius: 2800,
  Rhomboids: 2200,
  Biceps: 2000,
  Triceps: 2500,
  Forearms: 1500,
  Calves: 1800
};

console.log('\nTest 1: Calculate Fatigue for Leg Workout');
console.log('-'.repeat(80));

const results = calculateFatigue(testWorkout, testBaselines);

console.log('\nMuscle Volumes and Fatigue:');
Object.keys(results).forEach(muscle => {
  const r = results[muscle];
  console.log(`  ${muscle}:`);
  console.log(`    Volume: ${r.volume.toFixed(0)} lbs`);
  console.log(`    Baseline: ${r.baseline} lbs`);
  console.log(`    Fatigue: ${r.fatiguePercent.toFixed(1)}%`);
  if (r.exceededBaseline) {
    console.log(`    ⚠️  EXCEEDED by ${(r.fatiguePercent - 100).toFixed(1)}%`);
  }
});

console.log('\n\nTest 2: Get All 15 Muscles (including untrained)');
console.log('-'.repeat(80));

const allMuscles = getAllMuscles(results, testBaselines);
console.log(`\nTotal muscles tracked: ${allMuscles.length}`);
console.log('\nFatigue Summary:');
allMuscles.forEach(m => {
  const indicator = m.fatiguePercent > 50 ? '🔴' : m.fatiguePercent > 20 ? '🟡' : '🟢';
  console.log(`  ${indicator} ${m.muscle}: ${m.displayFatigue.toFixed(1)}%`);
});

console.log('\n\nTest 3: Baseline Exceedance Detection');
console.log('-'.repeat(80));

const highVolumeWorkout = {
  exercises: [
    {
      exerciseId: 'ex13', // Romanian Deadlift
      sets: [
        { weight: 300, reps: 15 },
        { weight: 300, reps: 15 },
        { weight: 300, reps: 15 }
      ]
    }
  ]
};

const highResults = calculateFatigue(highVolumeWorkout, testBaselines);
const suggestions = getBaselineSuggestions(highResults);

console.log(`\nHigh volume workout (300 lbs × 15 reps × 3 sets):`);
console.log(`Baseline suggestions: ${suggestions.length}`);

if (suggestions.length > 0) {
  suggestions.forEach(s => {
    console.log(`\n  ${s.muscle}:`);
    console.log(`    Current baseline: ${s.currentBaseline} lbs`);
    console.log(`    Volume achieved: ${s.volumeAchieved.toFixed(0)} lbs`);
    console.log(`    Suggested baseline: ${s.suggestedBaseline} lbs`);
    console.log(`    Exceeded by: ${s.exceedancePercent.toFixed(1)}%`);
  });
} else {
  console.log('  No baselines exceeded');
}

console.log('\n' + '='.repeat(80));
console.log('✅ All tests completed successfully!');
console.log('='.repeat(80));

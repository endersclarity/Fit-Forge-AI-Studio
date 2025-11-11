/**
 * Manual test for Exercise Recommendation Service
 * Run with: node backend/services/test-recommender.js
 */

const {
  recommendExercises,
  scoreExercise,
  checkBottleneckSafety,
  getAllExercises,
  getExerciseById
} = require('./exerciseRecommender');

console.log('='.repeat(80));
console.log('EXERCISE RECOMMENDATION SERVICE TEST');
console.log('='.repeat(80));

// Test data - simulate mid-workout state
const testBaselines = {
  Quadriceps: 7000,
  Glutes: 6500,
  Hamstrings: 5200,
  Core: 3000,
  'Lower Back': 2800,
  Pectoralis: 3400,
  Lats: 4500,
  'Anterior Deltoids': 2500,
  'Posterior Deltoids': 2000,
  Trapezius: 2800,
  Rhomboids: 2200,
  Biceps: 2000,
  Triceps: 2500,
  Forearms: 1500,
  Calves: 1800
};

const currentWorkout = [
  { exerciseId: 'ex13' }, // Romanian Deadlift (worked hamstrings, glutes, lower back)
  { exerciseId: 'ex19' }  // Leg Curls (worked hamstrings)
];

const currentFatigue = {
  Quadriceps: 15,      // Fresh
  Glutes: 45,          // Moderate
  Hamstrings: 68,      // High
  Core: 22,            // Light
  'Lower Back': 38,    // Moderate
  Pectoralis: 0,       // Fresh
  Lats: 0,             // Fresh
  'Anterior Deltoids': 0,
  'Posterior Deltoids': 0,
  Trapezius: 0,
  Rhomboids: 0,
  Biceps: 0,
  Triceps: 0,
  Forearms: 0,
  Calves: 0
};

const currentMuscleVolumes = {
  Quadriceps: 1050,
  Glutes: 2925,
  Hamstrings: 3536,
  Core: 660,
  'Lower Back': 1064
};

console.log('\n📊 CURRENT WORKOUT STATE');
console.log('-'.repeat(80));
console.log('Exercises in workout:');
currentWorkout.forEach(ex => {
  const exercise = getExerciseById(ex.exerciseId);
  console.log(`  • ${exercise.name} (${exercise.equipment})`);
});

console.log('\nMuscle Fatigue:');
Object.entries(currentFatigue)
  .filter(([_, fatigue]) => fatigue > 0)
  .sort((a, b) => b[1] - a[1])
  .forEach(([muscle, fatigue]) => {
    const indicator = fatigue >= 80 ? '🔴' : fatigue >= 40 ? '🟡' : '🟢';
    console.log(`  ${indicator} ${muscle}: ${fatigue.toFixed(1)}%`);
  });

// Test Case 1: Recommend exercises for Quadriceps (fresh muscle)
console.log('\n\n🎯 TEST 1: Recommend Exercises for Quadriceps (Fresh - 15%)');
console.log('='.repeat(80));

const quadRecommendations = recommendExercises({
  targetMuscle: 'Quadriceps',
  currentWorkout,
  currentFatigue,
  currentMuscleVolumes,
  baselines: testBaselines,
  availableEquipment: ['dumbbell', 'kettlebell', 'bodyweight', 'barbell'],
  userPreferences: {
    preferExercises: ['ex12'], // User loves Goblet Squats
    avoidExercises: ['ex15']   // User dislikes Leg Press
  }
});

console.log(`\nTarget: Quadriceps (${currentFatigue.Quadriceps}% current fatigue)`);
console.log(`Total eligible exercises: ${quadRecommendations.totalEligible}`);
console.log(`Safe recommendations: ${quadRecommendations.totalSafe}`);
console.log(`Unsafe recommendations: ${quadRecommendations.totalUnsafe}`);

console.log('\n✅ TOP SAFE RECOMMENDATIONS:');
console.log('-'.repeat(80));

quadRecommendations.recommended.slice(0, 5).forEach((rec, idx) => {
  console.log(`\n${idx + 1}. ${rec.name} (Score: ${rec.score}/100)`);
  console.log(`   Quad Engagement: ${rec.targetEngagement}% ${rec.isPrimary ? '(PRIMARY)' : '(SECONDARY)'}`);
  console.log(`   Equipment: ${rec.equipment}`);
  console.log(`   Category: ${rec.category}`);
  console.log(`   Estimated: ${rec.estimatedSets} sets × ${rec.estimatedReps} reps @ ${rec.estimatedWeight} lbs`);

  if (rec.warnings.length > 0) {
    console.log(`   ⚠️  Warnings: ${rec.warnings.length} muscle(s) near limit`);
    rec.warnings.forEach(w => {
      console.log(`      • ${w.muscle}: ${w.currentFatigue.toFixed(1)}% → ${w.newFatigue.toFixed(1)}%`);
    });
  } else {
    console.log(`   ✅ No bottleneck concerns`);
  }
});

if (quadRecommendations.notRecommended.length > 0) {
  console.log('\n\n❌ NOT RECOMMENDED (Would cause bottlenecks):');
  console.log('-'.repeat(80));

  quadRecommendations.notRecommended.slice(0, 3).forEach((rec) => {
    console.log(`\n${rec.name}`);
    console.log(`   Quad Engagement: ${rec.targetEngagement}%`);
    console.log(`   Score (if safe): ${rec.score}/100`);
    console.log(`   🚨 UNSAFE: Would exceed baseline for:`);
    rec.warnings.forEach(w => {
      console.log(`      • ${w.muscle}: ${w.currentFatigue.toFixed(1)}% → ${w.newFatigue.toFixed(1)}% (+${w.overage.toFixed(1)}%)`);
    });
  });
}

// Test Case 2: Recommend exercises for Hamstrings (already fatigued)
console.log('\n\n🎯 TEST 2: Recommend Exercises for Hamstrings (High Fatigue - 68%)');
console.log('='.repeat(80));

const hamstringRecommendations = recommendExercises({
  targetMuscle: 'Hamstrings',
  currentWorkout,
  currentFatigue,
  currentMuscleVolumes,
  baselines: testBaselines,
  availableEquipment: ['dumbbell', 'kettlebell', 'bodyweight', 'barbell']
});

console.log(`\nTarget: Hamstrings (${currentFatigue.Hamstrings}% current fatigue - HIGH)`);
console.log(`Total eligible exercises: ${hamstringRecommendations.totalEligible}`);
console.log(`Safe recommendations: ${hamstringRecommendations.totalSafe}`);
console.log(`Unsafe recommendations: ${hamstringRecommendations.totalUnsafe}`);

if (hamstringRecommendations.totalSafe > 0) {
  console.log('\n✅ TOP SAFE OPTIONS (if any):');
  console.log('-'.repeat(80));

  hamstringRecommendations.recommended.slice(0, 3).forEach((rec, idx) => {
    console.log(`\n${idx + 1}. ${rec.name} (Score: ${rec.score}/100)`);
    console.log(`   Hamstring Engagement: ${rec.targetEngagement}%`);
    console.log(`   Estimated: ${rec.estimatedSets} × ${rec.estimatedReps} @ ${rec.estimatedWeight} lbs`);
  });
} else {
  console.log('\n⚠️  NO SAFE OPTIONS AVAILABLE');
  console.log('All exercises targeting hamstrings would exceed baseline limits.');
  console.log('Recommendation: Reduce volume or rest this muscle group.');
}

// Test Case 3: Recommend for Pectoralis (completely fresh)
console.log('\n\n🎯 TEST 3: Recommend Exercises for Pectoralis (Fresh - 0%)');
console.log('='.repeat(80));

const pecRecommendations = recommendExercises({
  targetMuscle: 'Pectoralis',
  currentWorkout,
  currentFatigue,
  currentMuscleVolumes,
  baselines: testBaselines,
  availableEquipment: ['dumbbell', 'barbell', 'bodyweight']
});

console.log(`\nTarget: Pectoralis (${currentFatigue.Pectoralis}% current fatigue - FRESH)`);
console.log(`Total eligible exercises: ${pecRecommendations.totalEligible}`);
console.log(`Safe recommendations: ${pecRecommendations.totalSafe}`);

console.log('\n✅ TOP RECOMMENDATIONS:');
console.log('-'.repeat(80));

pecRecommendations.recommended.slice(0, 5).forEach((rec, idx) => {
  console.log(`${idx + 1}. ${rec.name} (Score: ${rec.score}/100) - ${rec.targetEngagement}% pec engagement`);
});

// Test Case 4: Scoring breakdown for a specific exercise
console.log('\n\n🧮 TEST 4: Detailed Scoring Breakdown');
console.log('='.repeat(80));

const bulgSplitSquat = getExerciseById('ex12'); // Bulgarian Split Squats
if (bulgSplitSquat) {
  const score = scoreExercise(
    bulgSplitSquat,
    'Quadriceps',
    currentFatigue,
    currentWorkout,
    ['ex12'] // User prefers this exercise
  );

  console.log(`\nExercise: ${bulgSplitSquat.name}`);
  console.log(`Target Muscle: Quadriceps`);
  console.log(`\nScoring Factors:`);

  const targetEngagement = bulgSplitSquat.muscles.find(m => m.muscle === 'Quadriceps');
  console.log(`  1. Target Match (40%): ${targetEngagement.percentage}% engagement`);
  console.log(`     Score: ${((targetEngagement.percentage / 100) * 40).toFixed(1)}`);

  console.log(`  2. Muscle Freshness (25%): Supporting muscles freshness`);
  let totalWeightedFatigue = 0;
  let totalEngagement = 0;
  bulgSplitSquat.muscles.forEach(m => {
    const fatigue = currentFatigue[m.muscle] || 0;
    console.log(`     • ${m.muscle} (${m.percentage}%): ${fatigue.toFixed(1)}% fatigued`);
    totalWeightedFatigue += fatigue * (m.percentage / 100);
    totalEngagement += m.percentage / 100;
  });
  const avgFatigue = totalWeightedFatigue / totalEngagement;
  const freshnessScore = Math.max(0, 100 - avgFatigue) / 100 * 25;
  console.log(`     Weighted avg fatigue: ${avgFatigue.toFixed(1)}%`);
  console.log(`     Score: ${freshnessScore.toFixed(1)}`);

  console.log(`  3. Movement Variety (15%): Category = ${bulgSplitSquat.category}`);
  const samePatternCount = currentWorkout.filter(ex => {
    const exData = getExerciseById(ex.exerciseId);
    return exData && exData.category === bulgSplitSquat.category;
  }).length;
  const varietyScore = Math.max(0, 1 - (samePatternCount / 5)) * 15;
  console.log(`     Same category in workout: ${samePatternCount}`);
  console.log(`     Score: ${varietyScore.toFixed(1)}`);

  console.log(`  4. User Preference (10%): In favorites? Yes`);
  console.log(`     Score: 10.0`);

  console.log(`  5. Primary Balance (10%): Is Quad primary? ${targetEngagement.primary ? 'Yes' : 'No'}`);
  const primaryScore = targetEngagement.primary ? 10 : 5;
  console.log(`     Score: ${primaryScore.toFixed(1)}`);

  console.log(`\n📊 TOTAL SCORE: ${score}/100`);
}

// Test Case 5: Bottleneck detection
console.log('\n\n🚨 TEST 5: Bottleneck Detection');
console.log('='.repeat(80));

// Simulate trying to add barbell squat when lower back is already fatigued
const barbellSquat = getExerciseById('ex5'); // Barbell Back Squat
if (barbellSquat) {
  // Set lower back to high fatigue
  const highFatigueLowerBack = { ...currentFatigue, 'Lower Back': 85 };
  const highVolumeLowerBack = { ...currentMuscleVolumes, 'Lower Back': 2380 };

  const safetyCheck = checkBottleneckSafety(
    barbellSquat,
    highFatigueLowerBack,
    highVolumeLowerBack,
    testBaselines,
    3, // sets
    10, // reps
    225 // weight
  );

  console.log(`\nExercise: ${barbellSquat.name}`);
  console.log(`Estimated: 3 × 10 @ 225 lbs = 6,750 lbs total volume`);
  console.log(`\nSafety Check: ${safetyCheck.isSafe ? '✅ SAFE' : '❌ UNSAFE'}`);

  if (safetyCheck.warnings.length > 0) {
    console.log(`\n🚨 WARNINGS (${safetyCheck.warnings.length}):`);
    safetyCheck.warnings.forEach(w => {
      console.log(`\n  ${w.muscle}:`);
      console.log(`    Current: ${w.currentFatigue.toFixed(1)}%`);
      console.log(`    After adding: ${w.newFatigue.toFixed(1)}%`);
      console.log(`    Overage: +${w.overage.toFixed(1)}%`);
      console.log(`    Severity: ${w.severity === 'critical' ? '🔴 CRITICAL' : '🟡 WARNING'}`);
    });
  }
}

console.log('\n' + '='.repeat(80));
console.log('✅ All recommendation tests completed!');
console.log('='.repeat(80));

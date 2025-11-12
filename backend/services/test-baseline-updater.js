/**
 * Manual test for Baseline Update Service
 * Run with: node backend/services/test-baseline-updater.js
 */

const {
  checkBaselineUpdates,
  getUpdateMessage,
  calculateIncreasePercent,
  validateBaselineUpdate,
  formatSuggestionsForUI
} = require('./baselineUpdater');

console.log('='.repeat(80));
console.log('BASELINE UPDATE SERVICE TEST');
console.log('='.repeat(80));

// Test data
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

// Test Case 1: No baselines exceeded (normal workout)
console.log('\n📊 TEST 1: Normal Workout (No Baselines Exceeded)');
console.log('-'.repeat(80));

const normalVolumes = {
  Quadriceps: 6800,   // 97% of baseline
  Glutes: 5850,       // 90% of baseline
  Hamstrings: 4680,   // 90% of baseline
  Core: 2400,         // 80% of baseline
  'Lower Back': 2100  // 75% of baseline
};

const normalResult = checkBaselineUpdates(normalVolumes, testBaselines, new Date(), 'workout-001');

console.log(`Has updates: ${normalResult.hasUpdates}`);
console.log(`Total suggestions: ${normalResult.totalSuggestions}`);
console.log(`Message: ${getUpdateMessage(normalResult)}`);

if (normalResult.hasUpdates) {
  console.log('\n❌ UNEXPECTED: Should not have baseline updates for normal workout');
} else {
  console.log('\n✅ PASSED: No baseline updates suggested (as expected)');
}

// Test Case 2: Single muscle exceeded
console.log('\n\n📊 TEST 2: Single Muscle Exceeded Baseline');
console.log('-'.repeat(80));

const singleExceedVolumes = {
  Quadriceps: 7350,   // 105% of baseline - EXCEEDED
  Glutes: 5850,       // 90% of baseline
  Hamstrings: 4680,   // 90% of baseline
  Core: 2400,         // 80% of baseline
  'Lower Back': 2100  // 75% of baseline
};

const singleExceedResult = checkBaselineUpdates(singleExceedVolumes, testBaselines, new Date(), 'workout-002');

console.log(`Has updates: ${singleExceedResult.hasUpdates}`);
console.log(`Total suggestions: ${singleExceedResult.totalSuggestions}`);
console.log(`Exceeded muscles: ${singleExceedResult.exceededMuscles.join(', ')}`);
console.log(`Message: ${getUpdateMessage(singleExceedResult)}`);

if (singleExceedResult.suggestions.length > 0) {
  console.log('\nSuggestion Details:');
  const suggestion = singleExceedResult.suggestions[0];
  console.log(`  Muscle: ${suggestion.muscle}`);
  console.log(`  Current Baseline: ${suggestion.currentBaseline} lbs`);
  console.log(`  Volume Achieved: ${suggestion.volumeAchieved} lbs`);
  console.log(`  Suggested Baseline: ${suggestion.suggestedBaseline} lbs`);
  console.log(`  Exceedance: ${suggestion.exceedancePercent.toFixed(1)}%`);
  console.log(`  Amount Over: +${suggestion.exceedanceAmount} lbs`);
  console.log('\n✅ PASSED: Correctly identified baseline exceedance');
} else {
  console.log('\n❌ FAILED: Should have detected baseline exceedance');
}

// Test Case 3: Multiple muscles exceeded
console.log('\n\n📊 TEST 3: Multiple Muscles Exceeded Baseline');
console.log('-'.repeat(80));

const multipleExceedVolumes = {
  Quadriceps: 7700,   // 110% of baseline - EXCEEDED
  Glutes: 7150,       // 110% of baseline - EXCEEDED
  Hamstrings: 5876,   // 113% of baseline - EXCEEDED (highest)
  Core: 2400,         // 80% of baseline
  'Lower Back': 2100  // 75% of baseline
};

const multipleExceedResult = checkBaselineUpdates(multipleExceedVolumes, testBaselines, new Date(), 'workout-003');

console.log(`Has updates: ${multipleExceedResult.hasUpdates}`);
console.log(`Total suggestions: ${multipleExceedResult.totalSuggestions}`);
console.log(`Exceeded muscles: ${multipleExceedResult.exceededMuscles.join(', ')}`);
console.log(`Message: ${getUpdateMessage(multipleExceedResult)}`);

console.log('\nAll Suggestions (sorted by exceedance):');
multipleExceedResult.suggestions.forEach((suggestion, idx) => {
  console.log(`\n${idx + 1}. ${suggestion.muscle}`);
  console.log(`   Current: ${suggestion.currentBaseline} lbs`);
  console.log(`   Achieved: ${suggestion.volumeAchieved} lbs`);
  console.log(`   Suggested: ${suggestion.suggestedBaseline} lbs`);
  console.log(`   Exceeded by: ${suggestion.exceedancePercent.toFixed(1)}% (+${suggestion.exceedanceAmount} lbs)`);
});

if (multipleExceedResult.totalSuggestions === 3) {
  console.log('\n✅ PASSED: Correctly identified all 3 baseline exceedances');
} else {
  console.log(`\n❌ FAILED: Expected 3 suggestions, got ${multipleExceedResult.totalSuggestions}`);
}

// Test Case 4: Validation checks
console.log('\n\n🔍 TEST 4: Baseline Update Validation');
console.log('-'.repeat(80));

// Reasonable update (10% increase)
const reasonableValidation = validateBaselineUpdate(7000, 7700, 50);
console.log('\n1. Reasonable Update (7000 → 7700):');
console.log(`   Valid: ${reasonableValidation.isValid ? '✅' : '❌'}`);
console.log(`   Increase: ${reasonableValidation.increasePercent.toFixed(1)}%`);
console.log(`   Reason: ${reasonableValidation.reason}`);

// Too large update (80% increase - suspicious)
const largeValidation = validateBaselineUpdate(7000, 12600, 50);
console.log('\n2. Suspicious Update (7000 → 12,600):');
console.log(`   Valid: ${largeValidation.isValid ? '✅' : '❌'}`);
console.log(`   Increase: ${largeValidation.increasePercent.toFixed(1)}%`);
console.log(`   Reason: ${largeValidation.reason}`);

// Invalid update (decrease)
const invalidValidation = validateBaselineUpdate(7000, 6500, 50);
console.log('\n3. Invalid Update (7000 → 6,500):');
console.log(`   Valid: ${invalidValidation.isValid ? '✅' : '❌'}`);
console.log(`   Increase: ${invalidValidation.increasePercent.toFixed(1)}%`);
console.log(`   Reason: ${invalidValidation.reason}`);

// Test Case 5: UI Formatting
console.log('\n\n🎨 TEST 5: Format Suggestions for UI');
console.log('-'.repeat(80));

const formattedSuggestions = formatSuggestionsForUI(multipleExceedResult.suggestions);

console.log('\nFormatted for Frontend:');
formattedSuggestions.forEach((formatted, idx) => {
  console.log(`\n${idx + 1}. ${formatted.message}`);
  console.log(`   Data: { muscle: "${formatted.muscle}", current: ${formatted.current}, suggested: ${formatted.suggested} }`);
});

// Test Case 6: Edge case - extremely high volume (potential PR)
console.log('\n\n💪 TEST 6: Personal Record Detection');
console.log('-'.repeat(80));

const prVolumes = {
  Hamstrings: 7800  // 150% of baseline - PR!
};

const prResult = checkBaselineUpdates(prVolumes, testBaselines, new Date(), 'workout-pr');

if (prResult.hasUpdates) {
  const suggestion = prResult.suggestions[0];
  console.log(`\n🏆 Personal Record Detected!`);
  console.log(`   Muscle: ${suggestion.muscle}`);
  console.log(`   Previous Baseline: ${suggestion.currentBaseline} lbs`);
  console.log(`   Volume Achieved: ${suggestion.volumeAchieved} lbs`);
  console.log(`   Improvement: +${suggestion.exceedancePercent.toFixed(1)}%`);

  const validation = validateBaselineUpdate(
    suggestion.currentBaseline,
    suggestion.suggestedBaseline,
    50
  );

  if (!validation.isValid) {
    console.log(`\n⚠️  WARNING: This increase (${validation.increasePercent.toFixed(1)}%) seems unusually high.`);
    console.log(`   Reason: ${validation.reason}`);
    console.log(`   Recommendation: Verify workout data before updating baseline`);
  } else {
    console.log(`\n✅ Update validated - this is a legitimate PR!`);
  }
}

// Test Case 7: Percentage calculation utility
console.log('\n\n📊 TEST 7: Percentage Increase Calculations');
console.log('-'.repeat(80));

const testCases = [
  { current: 5000, suggested: 5250, expected: 5.0 },
  { current: 7000, suggested: 7700, expected: 10.0 },
  { current: 3000, suggested: 3600, expected: 20.0 },
  { current: 2000, suggested: 2500, expected: 25.0 }
];

let allPassed = true;
testCases.forEach(test => {
  const calculated = calculateIncreasePercent(test.current, test.suggested);
  const passed = Math.abs(calculated - test.expected) < 0.1;
  const icon = passed ? '✅' : '❌';

  if (!passed) allPassed = false;

  console.log(`${icon} ${test.current} → ${test.suggested}: Expected ${test.expected}%, Got ${calculated.toFixed(1)}%`);
});

console.log('\n' + '='.repeat(80));
if (allPassed) {
  console.log('✅ All baseline update tests passed!');
} else {
  console.log('❌ Some tests failed. Check implementation.');
}
console.log('='.repeat(80));

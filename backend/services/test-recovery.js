/**
 * Manual test for Recovery Calculator
 * Run with: node backend/services/test-recovery.js
 */

const {
  calculateRecovery,
  calculateRecoveryProjections,
  calculateFullRecoveryTime,
  calculateReadyToTrainTime,
  getRecoveryTimeline
} = require('./recoveryCalculator');

console.log('='.repeat(80));
console.log('RECOVERY CALCULATOR TEST');
console.log('='.repeat(80));

// Test Case 1: Recovery calculation
console.log('\nTest 1: Calculate Current Recovery State');
console.log('-'.repeat(80));

const workoutDate = new Date('2025-11-08T10:00:00Z');
const currentDate = new Date('2025-11-09T10:00:00Z'); // 24 hours later
const initialFatigue = 113.1; // Hamstrings from reference workout

const recovery24h = calculateRecovery(initialFatigue, workoutDate, currentDate);

console.log('Hamstrings Recovery (24 hours post-workout):');
console.log(`  Initial fatigue: ${initialFatigue}%`);
console.log(`  Hours elapsed: ${recovery24h.hoursElapsed}`);
console.log(`  Days elapsed: ${recovery24h.daysElapsed.toFixed(1)}`);
console.log(`  Recovered: ${recovery24h.recoveredPercentage.toFixed(1)}%`);
console.log(`  Current fatigue: ${recovery24h.currentFatigue.toFixed(1)}%`);
console.log(`  Status: ${recovery24h.status}`);

// Test Case 2: Recovery projections
console.log('\n\nTest 2: Recovery Projections (24h, 48h, 72h)');
console.log('-'.repeat(80));

const projections = calculateRecoveryProjections(initialFatigue, workoutDate);

console.log('Hamstrings Recovery Timeline:');
Object.keys(projections).forEach(timePoint => {
  const proj = projections[timePoint];
  const status = proj.status === 'ready' ? '🟢' : proj.status === 'caution' ? '🟡' : '🔴';
  console.log(`  ${timePoint}: ${proj.currentFatigue.toFixed(1)}% ${status} (${proj.status})`);
});

// Test Case 3: Full recovery time
console.log('\n\nTest 3: Calculate Full Recovery Time');
console.log('-'.repeat(80));

const testMuscles = [
  { name: 'Hamstrings', fatigue: 113.1 },
  { name: 'Glutes', fatigue: 94.6 },
  { name: 'Core', fatigue: 65.4 },
  { name: 'Quadriceps', fatigue: 48.9 },
  { name: 'Lower Back', fatigue: 23.8 }
];

console.log('Time until muscles are fully recovered (0% fatigue):');
testMuscles.forEach(muscle => {
  const recovery = calculateFullRecoveryTime(muscle.fatigue);
  console.log(`  ${muscle.name} (${muscle.fatigue}%): ${recovery.message}`);
});

// Test Case 4: Ready to train time
console.log('\n\nTest 4: Calculate Ready to Train Time (<40%)');
console.log('-'.repeat(80));

console.log('Time until muscles are ready to train:');
testMuscles.forEach(muscle => {
  const ready = calculateReadyToTrainTime(muscle.fatigue);
  const icon = ready.daysNeeded === 0 ? '✅' : '⏳';
  console.log(`  ${icon} ${muscle.name} (${muscle.fatigue}%): ${ready.message}`);
});

// Test Case 5: Complete recovery timeline
console.log('\n\nTest 5: Complete Recovery Timeline');
console.log('-'.repeat(80));

const timeline = getRecoveryTimeline(initialFatigue, workoutDate, currentDate);

console.log('\nHamstrings Complete Timeline:');
console.log(`  Current State (24h post-workout):`);
console.log(`    Fatigue: ${timeline.current.currentFatigue.toFixed(1)}%`);
console.log(`    Status: ${timeline.current.status}`);
console.log('\n  Projections:');
console.log(`    24h: ${timeline.projections['24h'].currentFatigue.toFixed(1)}%`);
console.log(`    48h: ${timeline.projections['48h'].currentFatigue.toFixed(1)}%`);
console.log(`    72h: ${timeline.projections['72h'].currentFatigue.toFixed(1)}%`);
console.log('\n  Recovery Milestones:');
console.log(`    Ready to train (<40%): ${timeline.readyToTrainTime.message}`);
console.log(`    Fully recovered (0%): ${timeline.fullRecoveryTime.message}`);

// Test Case 6: Validate 15% daily recovery rate
console.log('\n\nTest 6: Validate 15% Daily Recovery Rate');
console.log('-'.repeat(80));
console.log('Formula: currentFatigue = max(0, initialFatigue - (daysElapsed × 15%))');
console.log('\nTest Case: 113.1% initial fatigue');

const validationTests = [
  { days: 1, expected: 98.1 },
  { days: 2, expected: 83.1 },
  { days: 3, expected: 68.1 },
  { days: 4, expected: 53.1 },
  { days: 5, expected: 38.1 },
  { days: 6, expected: 23.1 },
  { days: 7, expected: 8.1 }
];

let allPassed = true;
validationTests.forEach(test => {
  const testTime = new Date(workoutDate.getTime() + (test.days * 24 * 60 * 60 * 1000));
  const result = calculateRecovery(113.1, workoutDate, testTime);
  const actual = parseFloat(result.currentFatigue.toFixed(1));
  const passed = Math.abs(actual - test.expected) < 0.1;
  const icon = passed ? '✅' : '❌';

  if (!passed) allPassed = false;

  console.log(`  ${icon} Day ${test.days}: Expected ${test.expected}%, Got ${actual}%`);
});

console.log('\n' + '='.repeat(80));
if (allPassed) {
  console.log('✅ All tests passed! Recovery calculator is accurate.');
} else {
  console.log('❌ Some tests failed. Check implementation.');
}
console.log('='.repeat(80));

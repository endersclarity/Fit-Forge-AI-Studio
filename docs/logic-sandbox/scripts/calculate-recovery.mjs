/**
 * Recovery Calculation Script
 *
 * Tests the 15% daily recovery algorithm by:
 * 1. Loading a past workout
 * 2. Calculating initial muscle fatigue
 * 3. Computing recovery at 24h, 48h, 72h intervals
 * 4. Determining when muscles are "ready to train" (<40% fatigue)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load data files
const exercisesData = JSON.parse(readFileSync(join(__dirname, '../exercises.json'), 'utf8'));
const exercises = exercisesData.exercises; // Extract exercises array
const baselinesData = JSON.parse(readFileSync(join(__dirname, '../baselines.json'), 'utf8'));
const baselines = baselinesData.baselines; // Extract baselines array
const workout = JSON.parse(readFileSync(join(__dirname, '../workouts/2025-11-05-legs-day-a.json'), 'utf8'));

// Constants
const RECOVERY_RATE_PER_DAY = 0.15; // 15% per day
const READY_TO_TRAIN_THRESHOLD = 40; // <40% = ready to train
const CAUTION_THRESHOLD = 80; // 40-79% = caution, 80-100% = don't train

/**
 * Calculate initial muscle fatigue from workout
 */
function calculateMuscleFatigue(workout, exercises, baselines) {
  const muscleVolumes = {};

  // For each exercise in workout
  workout.exercises.forEach(workoutExercise => {
    const exerciseData = exercises.find(ex => ex.id === workoutExercise.exerciseId);
    if (!exerciseData) {
      console.warn(`Exercise ${workoutExercise.exerciseId} not found in library`);
      return;
    }

    // Calculate total volume for this exercise
    const totalVolume = workoutExercise.sets.reduce((sum, set) => {
      return sum + (set.weight * set.reps);
    }, 0);

    // Distribute volume across muscles
    exerciseData.muscles.forEach(muscle => {
      const muscleVolume = totalVolume * (muscle.percentage / 100);

      if (!muscleVolumes[muscle.muscle]) {
        muscleVolumes[muscle.muscle] = 0;
      }
      muscleVolumes[muscle.muscle] += muscleVolume;
    });
  });

  // Calculate fatigue percentages
  const fatigue = {};
  Object.keys(muscleVolumes).forEach(muscleName => {
    const baseline = baselines.find(b => b.muscle === muscleName);
    if (!baseline) {
      console.warn(`Baseline for ${muscleName} not found`);
      return;
    }

    const fatiguePercent = (muscleVolumes[muscleName] / baseline.baselineCapacity) * 100;

    fatigue[muscleName] = {
      volume: muscleVolumes[muscleName],
      baseline: baseline.baselineCapacity,
      initialFatigue: fatiguePercent,
      exceedsBaseline: fatiguePercent > 100
    };
  });

  return fatigue;
}

/**
 * Calculate recovery at a given time point
 */
function calculateRecovery(initialFatigue, hoursElapsed) {
  const daysElapsed = hoursElapsed / 24;
  const recoveredPercentage = daysElapsed * (RECOVERY_RATE_PER_DAY * 100);
  const currentFatigue = Math.max(0, initialFatigue - recoveredPercentage);

  return {
    hoursElapsed,
    daysElapsed: daysElapsed.toFixed(1),
    recoveredPercentage: recoveredPercentage.toFixed(1),
    currentFatigue: currentFatigue.toFixed(1),
    status: currentFatigue < READY_TO_TRAIN_THRESHOLD ? '🟢 Ready' :
            currentFatigue < CAUTION_THRESHOLD ? '🟡 Caution' :
            '🔴 Don\'t Train'
  };
}

/**
 * Calculate when muscle will be ready to train
 */
function calculateReadyTime(initialFatigue) {
  if (initialFatigue <= READY_TO_TRAIN_THRESHOLD) {
    return { hours: 0, days: 0, message: 'Already ready!' };
  }

  // Solve for: READY_TO_TRAIN_THRESHOLD = initialFatigue - (days * 15)
  // days = (initialFatigue - READY_TO_TRAIN_THRESHOLD) / 15
  const daysNeeded = (initialFatigue - READY_TO_TRAIN_THRESHOLD) / (RECOVERY_RATE_PER_DAY * 100);
  const hoursNeeded = daysNeeded * 24;

  return {
    hours: hoursNeeded.toFixed(1),
    days: daysNeeded.toFixed(1),
    message: `Ready in ${daysNeeded.toFixed(1)} days (${hoursNeeded.toFixed(0)} hours)`
  };
}

// Main execution
console.log('🧪 RECOVERY ALGORITHM TESTING');
console.log('═'.repeat(80));
console.log(`\nWorkout: ${workout.date} - ${workout.category} ${workout.variation}`);
console.log(`Started: ${workout.startTime}`);
console.log(`Current Test Date: 2025-11-08 (3 days later)\n`);

// Calculate initial fatigue
const initialFatigue = calculateMuscleFatigue(workout, exercises, baselines);

console.log('📊 INITIAL MUSCLE FATIGUE (Immediately Post-Workout)');
console.log('─'.repeat(80));

// Sort muscles by fatigue descending
const sortedMuscles = Object.entries(initialFatigue).sort((a, b) => b[1].initialFatigue - a[1].initialFatigue);

sortedMuscles.forEach(([muscle, data]) => {
  const fatigue = data.initialFatigue.toFixed(1);
  const bar = '█'.repeat(Math.min(Math.floor(data.initialFatigue / 5), 20));
  const exceeds = data.exceedsBaseline ? ' ⚠️ EXCEEDS BASELINE' : '';
  console.log(`${muscle.padEnd(25)} ${bar.padEnd(20)} ${fatigue.padStart(6)}%${exceeds}`);
});

// Test recovery at different time intervals
console.log('\n\n⏱️ RECOVERY TIMELINE');
console.log('═'.repeat(80));

const timePoints = [24, 48, 72, 96, 120]; // 1-5 days

timePoints.forEach(hours => {
  console.log(`\n📅 ${hours / 24} Day${hours > 24 ? 's' : ''} Later (${hours} hours elapsed)`);
  console.log('─'.repeat(80));

  sortedMuscles.forEach(([muscle, data]) => {
    const recovery = calculateRecovery(data.initialFatigue, hours);
    const bar = '█'.repeat(Math.min(Math.floor(parseFloat(recovery.currentFatigue) / 5), 20));
    console.log(
      `${muscle.padEnd(25)} ${bar.padEnd(20)} ${recovery.currentFatigue.padStart(6)}% ${recovery.status}`
    );
  });
});

// Calculate "ready to train" timeline
console.log('\n\n📆 WHEN WILL MUSCLES BE READY TO TRAIN? (<40% fatigue)');
console.log('═'.repeat(80));

sortedMuscles.forEach(([muscle, data]) => {
  const readyTime = calculateReadyTime(data.initialFatigue);
  const initialFatigueDisplay = data.initialFatigue.toFixed(1);

  if (readyTime.days === 0) {
    console.log(`${muscle.padEnd(25)} ${initialFatigueDisplay.padStart(6)}% → 🟢 ${readyTime.message}`);
  } else {
    const targetDate = new Date('2025-11-05T14:00:00Z');
    targetDate.setHours(targetDate.getHours() + parseFloat(readyTime.hours));
    const dateStr = targetDate.toISOString().split('T')[0];
    console.log(`${muscle.padEnd(25)} ${initialFatigueDisplay.padStart(6)}% → ${readyTime.message} (${dateStr})`);
  }
});

// Summary analysis
console.log('\n\n💡 ANALYSIS & INSIGHTS');
console.log('═'.repeat(80));

const highlyFatigued = sortedMuscles.filter(([_, data]) => data.initialFatigue >= 80);
const moderatelyFatigued = sortedMuscles.filter(([_, data]) => data.initialFatigue >= 40 && data.initialFatigue < 80);
const lightlyFatigued = sortedMuscles.filter(([_, data]) => data.initialFatigue < 40);
const exceeded = sortedMuscles.filter(([_, data]) => data.exceedsBaseline);

console.log(`\n🔴 Highly Fatigued (80-100%+): ${highlyFatigued.length} muscles`);
highlyFatigued.forEach(([muscle]) => {
  const readyTime = calculateReadyTime(initialFatigue[muscle].initialFatigue);
  console.log(`   • ${muscle}: ${readyTime.message}`);
});

console.log(`\n🟡 Moderately Fatigued (40-79%): ${moderatelyFatigued.length} muscles`);
moderatelyFatigued.forEach(([muscle]) => {
  const readyTime = calculateReadyTime(initialFatigue[muscle].initialFatigue);
  console.log(`   • ${muscle}: ${readyTime.message}`);
});

console.log(`\n🟢 Lightly Fatigued (<40%): ${lightlyFatigued.length} muscles`);
lightlyFatigued.forEach(([muscle]) => {
  console.log(`   • ${muscle}: Already ready!`);
});

if (exceeded.length > 0) {
  console.log(`\n⚠️ Baseline Exceeded: ${exceeded.length} muscles`);
  exceeded.forEach(([muscle, data]) => {
    const exceedPercent = ((data.initialFatigue - 100) / 100 * 100).toFixed(1);
    console.log(`   • ${muscle}: +${exceedPercent}% over baseline`);
  });
}

// Recovery rate validation
console.log('\n\n✅ RECOVERY RATE VALIDATION (15% per day)');
console.log('─'.repeat(80));
console.log('Formula: currentFatigue = max(0, initialFatigue - (daysElapsed × 15%))');
console.log('\nTest Case: Hamstrings (113.1% initial)');
const hamstringRecovery = [
  { days: 1, expected: 98.1 },
  { days: 2, expected: 83.1 },
  { days: 3, expected: 68.1 },
  { days: 4, expected: 53.1 },
  { days: 5, expected: 38.1 }
];

hamstringRecovery.forEach(test => {
  const recovery = calculateRecovery(113.1, test.days * 24);
  const match = Math.abs(parseFloat(recovery.currentFatigue) - test.expected) < 0.1 ? '✅' : '❌';
  console.log(`   Day ${test.days}: Expected ${test.expected}%, Got ${recovery.currentFatigue}% ${match}`);
});

console.log('\n' + '═'.repeat(80));
console.log('🎯 RECOVERY TESTING COMPLETE');
console.log('═'.repeat(80));

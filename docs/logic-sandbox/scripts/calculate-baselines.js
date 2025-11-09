// Baseline Calculation Script
// Processes all exercise performance data and calculates muscle baselines

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load exercises database
const exercisesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../exercises.json'), 'utf8')
);

// Create exercise lookup by ID
const exerciseById = {};
exercisesData.exercises.forEach(ex => {
  exerciseById[ex.id] = ex;
});

// User's performance data
const performanceData = [
  // PUSH
  { id: 'ex02', sets: 3, reps: 10, weight: 105 }, // DB Bench (52.5/hand)
  { id: 'ex32', sets: 3, reps: 10, weight: 90 },  // Incline DB Bench (45/hand)
  { id: 'ex39', sets: 3, reps: 10, weight: 40 },  // Single Arm Incline
  { id: 'ex31', sets: 3, reps: 20, weight: 130 }, // TRX Pushup (65% BW)
  { id: 'ex40', sets: 3, reps: 15, weight: 80 },  // TRX Tricep Ext (40% BW)

  // PULL
  { id: 'ex09', sets: 3, reps: 10, weight: 80 },  // DB Row (40/hand)
  { id: 'ex18', sets: 3, reps: 10, weight: 60 },  // DB Upright Row (30/hand)
  { id: 'ex28', sets: 3, reps: 10, weight: 60 },  // Renegade Rows (30/hand)
  { id: 'ex23', sets: 3, reps: 10, weight: 105 }, // Shoulder Shrugs (52.5/hand)
  { id: 'ex48', sets: 3, reps: 10, weight: 25 },  // DB Pullover
  { id: 'ex26', sets: 3, reps: 8, weight: 200 },  // Neutral Grip Pull-ups
  { id: 'ex42', sets: 3, reps: 7, weight: 200 },  // Wide Grip Pull-ups
  { id: 'ex41', sets: 3, reps: 10, weight: 200 }, // TRX Pull-up

  // ARMS
  { id: 'ex19', sets: 3, reps: 15, weight: 70 },  // TRX Bicep Curl (35% BW)
  { id: 'ex22', sets: 3, reps: 10, weight: 27.5 },// Concentration Curl
  { id: 'ex07', sets: 3, reps: 10, weight: 60 },  // DB Bicep Curl (30/hand)

  // LEGS
  { id: 'ex12', sets: 3, reps: 16, weight: 40 },  // KB Goblet Squat
  { id: 'ex43', sets: 3, reps: 10, weight: 70 },  // DB Goblet Squat
  { id: 'ex13', sets: 3, reps: 20, weight: 105 }, // DB Romanian DL (52.5/hand)
  { id: 'ex36', sets: 3, reps: 20, weight: 105 }, // DB Stiff-Leg DL (52.5/hand)
  { id: 'ex35', sets: 3, reps: 20, weight: 90 },  // Glute Bridge
  { id: 'ex37', sets: 3, reps: 20, weight: 40 },  // KB Swings
  { id: 'ex47', sets: 3, reps: 40, weight: 200 }, // Box Step-ups (BW)
  { id: 'ex15', sets: 3, reps: 60, weight: 200 }, // Calf Raises (BW)

  // CORE
  { id: 'ex16', sets: 1, reps: 120, weight: 140 }, // Plank - 2 min hold (120 sec @ 70% BW)
  { id: 'ex44', sets: 1, reps: 30, weight: 200 }, // Spider Planks - 30 reps @ BW
  { id: 'ex17', sets: 3, reps: 30, weight: 0 },   // Bench Sit-ups (BW, but no weight moved)
  { id: 'ex45', sets: 1, reps: 60, weight: 140 }, // TRX Mountain Climbers - 1 min (60 sec @ 70% BW)
  { id: 'ex46', sets: 3, reps: 13, weight: 200 }, // Hanging Leg Raises

  // ADDITIONAL EXERCISES
  { id: 'ex38', sets: 3, reps: 10, weight: 80 },  // Single Arm DB Bench (40/hand)
  { id: 'ex03', sets: 3, reps: 17, weight: 130 }, // Push-ups @ 65% BW (corrected from 200)
  { id: 'ex05', sets: 3, reps: 10, weight: 60 },  // DB Shoulder Press (30/hand)
  { id: 'ex29', sets: 3, reps: 12, weight: 60 },  // TRX Reverse Flys (30% BW)
  { id: 'ex30', sets: 3, reps: 10, weight: 25 },  // DB Tricep Extension
  { id: 'ex33', sets: 3, reps: 9, weight: 200 },  // Dips @ BW
  { id: 'ex34', sets: 3, reps: 10, weight: 60 },  // Kettlebell Press (same as DB shoulder press)
  { id: 'ex06', sets: 3, reps: 8, weight: 200 },  // Pull-up @ BW
  { id: 'ex20', sets: 3, reps: 9, weight: 200 },  // Chin-Ups @ BW
  { id: 'ex21', sets: 3, reps: 15, weight: 80 },  // Face Pull
  { id: 'ex25', sets: 3, reps: 10, weight: 60 },  // Incline Hammer Curl (30/hand)
];

// Calculate muscle volumes
const muscleMaximums = {};

performanceData.forEach(perf => {
  const exercise = exerciseById[perf.id];
  if (!exercise) {
    console.warn(`Exercise ${perf.id} not found`);
    return;
  }

  const totalVolume = perf.sets * perf.reps * perf.weight;

  console.log(`\n${exercise.name} (${perf.id})`);
  console.log(`  Performance: ${perf.sets}×${perf.reps} @ ${perf.weight} lb = ${totalVolume} lb total`);
  console.log(`  Muscle breakdown:`);

  exercise.muscles.forEach(m => {
    const muscleVolume = totalVolume * (m.percentage / 100);
    console.log(`    ${m.muscle} (${m.percentage}%): ${muscleVolume.toFixed(1)} lb`);

    // Track maximum
    if (!muscleMaximums[m.muscle] || muscleVolume > muscleMaximums[m.muscle].volume) {
      muscleMaximums[m.muscle] = {
        volume: muscleVolume,
        exercise: exercise.name,
        exerciseId: exercise.id
      };
    }
  });
});

// Display final baselines
console.log('\n\n' + '='.repeat(80));
console.log('FINAL MUSCLE BASELINES');
console.log('='.repeat(80));

const muscles = Object.keys(muscleMaximums).sort();
muscles.forEach(muscle => {
  const data = muscleMaximums[muscle];
  console.log(`\n${muscle}:`);
  console.log(`  Baseline: ${data.volume.toFixed(1)} lbs`);
  console.log(`  Source: ${data.exercise} (${data.exerciseId})`);
});

// Save baselines to JSON
const baselineOutput = {
  baselines: muscles.map(muscle => ({
    muscle: muscle,
    baselineCapacity: Math.round(muscleMaximums[muscle].volume),
    unit: 'lbs',
    lastUpdated: '2025-11-08',
    source: muscleMaximums[muscle].exercise,
    exerciseId: muscleMaximums[muscle].exerciseId,
    notes: 'Calculated from maximum volume across all exercises in isolation'
  })),
  metadata: {
    lastUpdated: '2025-11-08',
    method: 'Maximum volume across all exercises',
    notes: 'These baselines represent the highest muscle volume achieved in any single exercise performed to failure in isolation.'
  }
};

fs.writeFileSync(
  path.join(__dirname, '../baselines-calculated.json'),
  JSON.stringify(baselineOutput, null, 2)
);

console.log('\n\nBaselines saved to baselines-calculated.json');

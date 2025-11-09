// Calculate comprehensive workout analysis
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data files
const workoutPath = path.join(__dirname, '../workouts/2025-11-08-legs-day-a.json');
const exercisesPath = path.join(__dirname, '../exercises.json');
const baselinesPath = path.join(__dirname, '../baselines.json');
const userProfilePath = path.join(__dirname, '../user-profile.json');

const workout = JSON.parse(fs.readFileSync(workoutPath, 'utf8'));
const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));
const baselinesData = JSON.parse(fs.readFileSync(baselinesPath, 'utf8'));
const userProfile = JSON.parse(fs.readFileSync(userProfilePath, 'utf8'));

// Build lookup maps
const exerciseMap = {};
exercisesData.exercises.forEach(ex => {
  exerciseMap[ex.id] = ex;
});

const baselineMap = {};
baselinesData.baselines.forEach(b => {
  baselineMap[b.muscle] = b.baselineCapacity;
});

console.log('='.repeat(80));
console.log('LEGS DAY A WORKOUT ANALYSIS');
console.log('='.repeat(80));
console.log(`Date: ${workout.date}`);
console.log(`Category: ${workout.category} ${workout.variation}`);
console.log(`Duration: ${workout.totalDuration / 60} minutes`);
console.log('='.repeat(80));
console.log();

// Track muscle volumes
const muscleVolumes = {};

// Analyze each exercise
console.log('EXERCISE-BY-EXERCISE BREAKDOWN');
console.log('-'.repeat(80));

workout.exercises.forEach((workoutEx, index) => {
  const exerciseData = exerciseMap[workoutEx.exerciseId];

  console.log(`\n${index + 1}. ${workoutEx.exerciseName} (${workoutEx.exerciseId})`);
  console.log(`   Sets: ${workoutEx.sets.length}`);
  console.log(`   Total Volume: ${workoutEx.totalVolume.toLocaleString()} lbs`);

  // Calculate volume distribution across muscles
  console.log(`   Muscle Distribution:`);

  exerciseData.muscles.forEach(muscle => {
    const muscleVolume = workoutEx.totalVolume * (muscle.percentage / 100);

    // Accumulate in muscle volumes
    if (!muscleVolumes[muscle.muscle]) {
      muscleVolumes[muscle.muscle] = 0;
    }
    muscleVolumes[muscle.muscle] += muscleVolume;

    console.log(`     - ${muscle.muscle}: ${muscle.percentage}% = ${muscleVolume.toFixed(0)} lbs ${muscle.primary ? '(PRIMARY)' : ''}`);
  });

  // Show sets detail
  console.log(`   Sets Detail:`);
  workoutEx.sets.forEach(set => {
    console.log(`     Set ${set.setNumber}: ${set.weight} lbs × ${set.reps} reps = ${set.weight * set.reps} lbs ${set.toFailure ? '(TO FAILURE)' : ''}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('MUSCLE FATIGUE ANALYSIS');
console.log('='.repeat(80));

const fatigueResults = [];

Object.keys(muscleVolumes).sort().forEach(muscle => {
  const volume = muscleVolumes[muscle];
  const baseline = baselineMap[muscle];

  if (!baseline) {
    console.log(`\n${muscle}: ${volume.toFixed(0)} lbs (NO BASELINE DATA)`);
    return;
  }

  const fatiguePercent = (volume / baseline) * 100;
  const displayFatigue = Math.min(100, fatiguePercent);
  const exceededBaseline = fatiguePercent > 100;

  fatigueResults.push({
    muscle,
    volume,
    baseline,
    fatiguePercent,
    displayFatigue,
    exceededBaseline
  });

  console.log(`\n${muscle}:`);
  console.log(`  Volume: ${volume.toFixed(0)} lbs`);
  console.log(`  Baseline: ${baseline.toLocaleString()} lbs`);
  console.log(`  Fatigue: ${fatiguePercent.toFixed(1)}%`);
  console.log(`  Display: ${displayFatigue.toFixed(1)}%`);
  if (exceededBaseline) {
    console.log(`  ⚠️  EXCEEDED BASELINE by ${(fatiguePercent - 100).toFixed(1)}%`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('RECOVERY TIMELINE (15% per day)');
console.log('='.repeat(80));

const recoveryRate = userProfile.settings.recoveryRatePerDay;

fatigueResults.forEach(result => {
  const daysToFullRecovery = result.displayFatigue / (recoveryRate * 100);
  const hoursToFullRecovery = daysToFullRecovery * 24;

  console.log(`\n${result.muscle} (${result.displayFatigue.toFixed(1)}% fatigue):`);
  console.log(`  - 24h: ${Math.max(0, result.displayFatigue - 15).toFixed(1)}%`);
  console.log(`  - 48h: ${Math.max(0, result.displayFatigue - 30).toFixed(1)}%`);
  console.log(`  - 72h: ${Math.max(0, result.displayFatigue - 45).toFixed(1)}%`);
  console.log(`  - Full recovery: ${daysToFullRecovery.toFixed(1)} days (${hoursToFullRecovery.toFixed(0)} hours)`);
});

console.log('\n' + '='.repeat(80));
console.log('WORKOUT SUMMARY');
console.log('='.repeat(80));

const totalVolume = Object.values(muscleVolumes).reduce((sum, v) => sum + v, 0);
const musclesWorked = Object.keys(muscleVolumes).length;
const avgFatigue = fatigueResults.reduce((sum, r) => sum + r.fatiguePercent, 0) / fatigueResults.length;
const maxFatigue = Math.max(...fatigueResults.map(r => r.fatiguePercent));
const maxFatigueMuscle = fatigueResults.find(r => r.fatiguePercent === maxFatigue).muscle;

console.log(`\nTotal Volume Distributed: ${totalVolume.toFixed(0)} lbs`);
console.log(`Muscles Worked: ${musclesWorked}`);
console.log(`Average Fatigue: ${avgFatigue.toFixed(1)}%`);
console.log(`Max Fatigue: ${maxFatigue.toFixed(1)}% (${maxFatigueMuscle})`);
console.log(`Baselines Exceeded: ${fatigueResults.filter(r => r.exceededBaseline).length}`);

// Write results to JSON
const outputPath = path.join(__dirname, '../calculations/2025-11-08-legs-day-a-analysis.json');
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const analysisResults = {
  workout: {
    id: workout.id,
    date: workout.date,
    category: workout.category,
    variation: workout.variation
  },
  summary: {
    totalVolume,
    musclesWorked,
    avgFatigue,
    maxFatigue,
    maxFatigueMuscle,
    baselinesExceeded: fatigueResults.filter(r => r.exceededBaseline).length
  },
  muscleAnalysis: fatigueResults.map(r => ({
    muscle: r.muscle,
    volume: r.volume,
    baseline: r.baseline,
    fatiguePercent: r.fatiguePercent,
    displayFatigue: r.displayFatigue,
    exceededBaseline: r.exceededBaseline,
    recoveryDays: r.displayFatigue / (recoveryRate * 100)
  })),
  recoveryTimeline: fatigueResults.map(r => ({
    muscle: r.muscle,
    initialFatigue: r.displayFatigue,
    '24h': Math.max(0, r.displayFatigue - 15),
    '48h': Math.max(0, r.displayFatigue - 30),
    '72h': Math.max(0, r.displayFatigue - 45),
    fullRecoveryDays: r.displayFatigue / (recoveryRate * 100)
  }))
};

fs.writeFileSync(outputPath, JSON.stringify(analysisResults, null, 2));
console.log(`\n✅ Analysis saved to: ${outputPath}`);
console.log('='.repeat(80));

/**
 * Detailed verification script to audit muscle baseline calculations
 * Shows exactly which exercises contribute to each muscle
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_BODYWEIGHT = 200; // lbs

const MUSCLE_MAP: Record<string, string> = {
  'pectoralis major': 'Pectoralis',
  'upper pectorals': 'Pectoralis',
  'chest': 'Pectoralis',
  'anterior deltoid': 'Deltoids',
  'deltoids': 'Deltoids',
  'rear delts': 'Deltoids',
  'shoulders': 'Deltoids',
  'triceps brachii': 'Triceps',
  'triceps': 'Triceps',
  'latissimus dorsi': 'Lats',
  'lats': 'Lats',
  'rhomboids': 'Rhomboids',
  'posterior deltoid': 'Deltoids',
  'biceps': 'Biceps',
  'biceps brachii': 'Biceps',
  'brachialis': 'Biceps',
  'trapezius': 'Trapezius',
  'upper traps': 'Trapezius',
  'forearms': 'Forearms',
  'grip': 'Forearms',
  'quadriceps': 'Quadriceps',
  'quads': 'Quadriceps',
  'glutes': 'Glutes',
  'hamstrings': 'Hamstrings',
  'calves': 'Calves',
  'gastrocnemius': 'Calves',
  'soleus': 'Calves',
  'core': 'Core',
  'rectus abdominis': 'Core',
  'obliques': 'Core',
  'lower abs': 'Core',
  'hip flexors': 'Core',
  'core stabilizers': 'Core',
  'serratus anterior': 'Core',
  'spinal erectors': 'Core',
};

interface PersonalRecordExercise {
  exercise: string;
  category: string;
  protocol: string;
  totalVolume: number | null;
  volumeUnit: string;
  muscles: string[];
  notes: string;
  adaptation: string;
}

interface PersonalRecordsData {
  version: string;
  lastUpdated: string;
  muscleBaselines: PersonalRecordExercise[];
  sessionSummary: any;
}

function parseProtocolReps(protocol: string): number | null {
  const totalMatch = protocol.match(/(\d+)\s+total/);
  if (totalMatch) {
    return parseInt(totalMatch[1]);
  }

  const setsRepsMatch = protocol.match(/(\d+)×(\d+)/);
  if (setsRepsMatch) {
    const sets = parseInt(setsRepsMatch[1]);
    const reps = parseInt(setsRepsMatch[2]);
    return sets * reps;
  }

  return null;
}

function normalizeMuscle(muscleName: string): string {
  const normalized = muscleName.toLowerCase().trim();
  return MUSCLE_MAP[normalized] || null;
}

interface ExerciseContribution {
  exercise: string;
  totalVolume: number;
  muscleCount: number;
  volumePerMuscle: number;
  protocol: string;
}

function analyzeCalculations() {
  console.log('🔍 Detailed Muscle Baseline Verification\n');
  console.log('='.repeat(60));

  // Read personal records
  const recordsPath = path.join(__dirname, '..', 'personal-records.json');
  const recordsData: PersonalRecordsData = JSON.parse(
    fs.readFileSync(recordsPath, 'utf-8')
  );

  // Track contributions by muscle
  const muscleContributions = new Map<string, ExerciseContribution[]>();
  const skippedExercises: string[] = [];

  for (const exercise of recordsData.muscleBaselines) {
    let volume: number;

    // Calculate volume
    if (exercise.totalVolume !== null) {
      volume = exercise.totalVolume;
    } else if (exercise.volumeUnit === 'bodyweight' || exercise.volumeUnit === 'reps') {
      const totalReps = parseProtocolReps(exercise.protocol);
      if (totalReps === null) {
        skippedExercises.push(`${exercise.exercise} (couldn't parse: ${exercise.protocol})`);
        continue;
      }
      volume = totalReps * USER_BODYWEIGHT;
    } else {
      skippedExercises.push(`${exercise.exercise} (${exercise.volumeUnit})`);
      continue;
    }

    // Normalize and deduplicate muscles for this exercise
    const normalizedMuscles = new Set<string>();
    for (const muscleName of exercise.muscles) {
      const dbMuscle = normalizeMuscle(muscleName);
      if (dbMuscle) {
        normalizedMuscles.add(dbMuscle);
      }
    }

    const muscleCount = normalizedMuscles.size;
    const volumePerMuscle = volume / muscleCount;

    // Add to each muscle's contribution list
    for (const dbMuscle of normalizedMuscles) {
      if (!muscleContributions.has(dbMuscle)) {
        muscleContributions.set(dbMuscle, []);
      }
      muscleContributions.get(dbMuscle)!.push({
        exercise: exercise.exercise,
        totalVolume: volume,
        muscleCount,
        volumePerMuscle,
        protocol: exercise.protocol
      });
    }
  }

  // Print detailed breakdown by muscle
  const sortedMuscles = Array.from(muscleContributions.keys()).sort();

  for (const muscle of sortedMuscles) {
    const contributions = muscleContributions.get(muscle)!;
    const totalVolume = contributions.reduce((sum, c) => sum + c.volumePerMuscle, 0);

    console.log(`\n📊 ${muscle.toUpperCase()}: ${Math.round(totalVolume).toLocaleString()} lbs`);
    console.log('-'.repeat(60));

    for (const contrib of contributions) {
      console.log(`  ${contrib.exercise}`);
      console.log(`    Protocol: ${contrib.protocol}`);
      console.log(`    Total Volume: ${contrib.totalVolume.toLocaleString()} lbs`);
      console.log(`    Shared with ${contrib.muscleCount} muscles`);
      console.log(`    Contribution: ${Math.round(contrib.volumePerMuscle).toLocaleString()} lbs`);
    }
  }

  // Print skipped exercises
  if (skippedExercises.length > 0) {
    console.log('\n\n⚠️  SKIPPED EXERCISES:');
    console.log('='.repeat(60));
    skippedExercises.forEach(ex => console.log(`  - ${ex}`));
  }

  // Summary
  console.log('\n\n📈 SUMMARY:');
  console.log('='.repeat(60));
  console.log(`Total exercises analyzed: ${recordsData.muscleBaselines.length}`);
  console.log(`Exercises processed: ${recordsData.muscleBaselines.length - skippedExercises.length}`);
  console.log(`Exercises skipped: ${skippedExercises.length}`);
  console.log(`Muscles tracked: ${muscleContributions.size}`);
}

analyzeCalculations();

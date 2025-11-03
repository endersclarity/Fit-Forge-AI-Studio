/**
 * Script to import a workout from JSON file into the FitForge database
 *
 * Usage: npm run import-workout workouts/2025-10-29-chest-triceps.json
 */

import * as fs from 'fs';
import * as path from 'path';

// Exercise name mappings - JSON file names → Database names (must match EXERCISE_LIBRARY)
const EXERCISE_NAME_MAPPING: Record<string, string> = {
  'Incline Dumbbell Bench Press': 'Incline Dumbbell Bench Press',
  'Push-Ups': 'Push-up', // Note: singular in library
  'TRX Wide-Grip Push-Ups': 'TRX Pushup', // Simplified name in library
  'TRX Tricep Extensions': 'TRX Tricep Extension', // Note: singular in library
};

interface WorkoutSet {
  reps: number;
  weight?: number;
  weightUnit?: string;
  weightPerHand?: boolean;
  toFailure: boolean;
}

interface WorkoutExercise {
  name: string;
  equipment: string;
  sets: WorkoutSet[];
}

interface WorkoutData {
  date: string;
  timestamp: string;
  summary: {
    totalWorkingSets: number;
    setsToFailure: number;
    primaryFocus: string[];
    notes: string;
  };
  exercises: WorkoutExercise[];
}

interface APIExercise {
  exercise: string; // Exercise NAME not ID
  sets: Array<{
    weight: number;
    reps: number;
    to_failure: boolean;
  }>;
}

async function getUserBodyweight(): Promise<number> {
  try {
    const response = await fetch('http://localhost:3001/api/profile');
    if (!response.ok) {
      console.warn('Could not fetch profile, using default bodyweight of 175 lbs');
      return 175;
    }
    const profile = await response.json();

    // Get latest bodyweight from history
    if (profile.bodyweightHistory && profile.bodyweightHistory.length > 0) {
      const sorted = profile.bodyweightHistory.sort((a: any, b: any) => b.date - a.date);
      return sorted[0].weight;
    }

    console.warn('No bodyweight history found, using default of 175 lbs');
    return 175;
  } catch (error) {
    console.warn('Error fetching profile:', error);
    return 175;
  }
}

async function importWorkout(filePath: string) {
  console.log(`\n📋 Importing workout from: ${filePath}\n`);

  // Read the workout file
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    process.exit(1);
  }

  const workoutData: WorkoutData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

  console.log(`📅 Date: ${workoutData.date}`);
  console.log(`💪 Focus: ${workoutData.summary.primaryFocus.join(', ')}`);
  console.log(`📊 Total Sets: ${workoutData.summary.totalWorkingSets} (${workoutData.summary.setsToFailure} to failure)\n`);

  // Get user's bodyweight for bodyweight exercises
  const bodyweight = await getUserBodyweight();
  console.log(`⚖️  Using bodyweight: ${bodyweight} lbs\n`);

  // Convert exercises to API format
  const apiExercises: APIExercise[] = [];

  for (const exercise of workoutData.exercises) {
    const mappedName = EXERCISE_NAME_MAPPING[exercise.name];

    if (!mappedName) {
      console.error(`❌ Unknown exercise: ${exercise.name}`);
      console.error(`   Available mappings: ${Object.keys(EXERCISE_NAME_MAPPING).join(', ')}`);
      process.exit(1);
    }

    console.log(`✅ ${exercise.name} → ${mappedName}`);

    const apiSets = exercise.sets.map((set) => {
      let weight = 0;

      if (set.weight !== undefined) {
        // For dumbbells marked as "per hand", double the weight for total
        weight = set.weightPerHand ? set.weight * 2 : set.weight;
      } else if (exercise.equipment === 'bodyweight') {
        // Use bodyweight for bodyweight exercises
        weight = bodyweight;
      }

      console.log(`   Set: ${set.reps} reps @ ${weight} lbs ${set.toFailure ? '(to failure)' : ''}`);

      return {
        weight,
        reps: set.reps,
        to_failure: set.toFailure
      };
    });

    apiExercises.push({
      exercise: mappedName, // Use mapped exercise name from EXERCISE_LIBRARY
      sets: apiSets
    });
  }

  // Prepare the workout payload
  const workoutPayload = {
    date: new Date(workoutData.timestamp).getTime(), // Convert to timestamp
    category: 'Push', // Based on the workout content
    variation: 'A', // Assuming variation A
    progressionMethod: null, // Will be auto-detected by backend
    durationSeconds: null, // Not tracked in JSON file
    exercises: apiExercises
  };

  console.log('\n📤 Sending workout to API...\n');

  try {
    const response = await fetch('http://localhost:3001/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutPayload)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Workout saved successfully!');
    console.log(`   Workout ID: ${result.id}`);
    console.log(`   Date: ${result.date}`);
    console.log(`   Category: ${result.category}`);
    console.log(`   Exercises: ${result.exercises.length}`);

    // Calculate metrics (muscle volume, fatigue, baselines, PRs)
    console.log('\n📊 Calculating workout metrics...\n');
    const metricsResponse = await fetch(`http://localhost:3001/api/workouts/${result.id}/calculate-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!metricsResponse.ok) {
      const error = await metricsResponse.json();
      console.error('❌ Failed to calculate metrics:', error);
    } else {
      const metrics = await metricsResponse.json();

      // Display muscle fatigue
      console.log('💪 Muscle Fatigue:');
      Object.entries(metrics.muscleFatigue).forEach(([muscle, fatigue]) => {
        console.log(`   ${muscle}: ${(fatigue as number).toFixed(1)}%`);
      });

      // Display baseline updates
      if (metrics.updatedBaselines.length > 0) {
        console.log('\n📈 New Muscle Baselines:');
        metrics.updatedBaselines.forEach((update: any) => {
          console.log(`   ${update.muscle}: ${update.oldMax} → ${update.newMax} (+${update.newMax - update.oldMax})`);
        });
      }

      // Display PRs
      if (metrics.prsDetected.length > 0) {
        console.log('\n🏆 Personal Records Set:');
        metrics.prsDetected.forEach((pr: any) => {
          if (pr.isFirstTime) {
            console.log(`   ${pr.exercise}: ${pr.newVolume} lbs (First time!)`);
          } else {
            console.log(`   ${pr.exercise}: ${pr.newVolume} lbs (+${pr.improvement} lbs, +${pr.percentIncrease.toFixed(1)}%)`);
          }
        });
      }
    }

    console.log('\n✅ Import complete!\n');
  } catch (error) {
    console.error('❌ Error saving workout:', error);
    process.exit(1);
  }
}

// Get file path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: npm run import-workout <path-to-workout.json>');
  console.error('Example: npm run import-workout workouts/2025-10-29-chest-triceps.json');
  process.exit(1);
}

importWorkout(args[0]);

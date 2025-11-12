/**
 * Baseline Update Trigger Service
 *
 * Detects when users exceed their muscle baseline capacity and suggests baseline updates.
 * Algorithm ported from: docs/musclemax-baseline-learning-system.md
 *
 * Conservative Max Observed Volume Approach:
 * - Only analyzes sets marked as "to failure" (quality data)
 * - Compares achieved muscle volume to current baseline capacity
 * - Suggests baseline update if volume exceeded
 * - Baselines only increase, never decrease automatically
 *
 * Formula: muscleVolume = weight × reps × (muscleEngagement / 100)
 *
 * @module baselineUpdater
 */

import { loadExerciseLibrary, loadBaselineData, normalizeMuscle } from './dataLoaders.js';

/**
 * Calculate muscle volumes from workout exercises
 *
 * Only processes sets marked as "to failure" (quality data for learning)
 * Tracks maximum volume achieved per muscle across all sets
 *
 * @param {Array<Object>} workoutExercises - Workout exercises with sets
 * @param {Array<Object>} exerciseLibrary - Exercise library with muscle engagement data
 * @returns {Object} Map of muscle names to maximum volumes achieved and exercise context
 */
function calculateMuscleVolumes(workoutExercises, exerciseLibrary) {
  const muscleVolumes = {};
  const exerciseContext = {}; // Track which exercise triggered each muscle volume

  for (const workoutEx of workoutExercises) {
    // Find exercise in library
    const exercise = exerciseLibrary.find(e => e.name === workoutEx.exercise);
    if (!exercise) {
      // Unknown exercise - skip gracefully
      continue;
    }

    // Process each set
    for (const set of workoutEx.sets) {
      // Only process "to failure" sets (quality data)
      if (!set.toFailure) {
        continue;
      }

      // Calculate total volume for this set
      const totalVolume = set.weight * set.reps;

      // Calculate muscle-specific volumes
      for (const muscleData of exercise.muscles) {
        const muscleVolume = totalVolume * (muscleData.percentage / 100);
        const muscleName = normalizeMuscle(muscleData.muscle);

        // Track max volume per muscle (not sum)
        if (!muscleVolumes[muscleName] || muscleVolume > muscleVolumes[muscleName]) {
          muscleVolumes[muscleName] = muscleVolume;
          exerciseContext[muscleName] = workoutEx.exercise;
        }
      }
    }
  }

  return { muscleVolumes, exerciseContext };
}

/**
 * Check for baseline updates based on completed workout
 *
 * Algorithm: Conservative max observed volume
 * - Only analyzes sets marked as "to failure" (quality data)
 * - Compares achieved volume to current baseline
 * - Suggests baseline update if volume exceeded
 * - Returns full context for transparency (exercise, date, old/new values)
 *
 * @param {Array<Object>} workoutExercises - Completed workout exercises
 *   Format: [{ exercise: string, sets: [{ weight: number, reps: number, toFailure: boolean }] }]
 * @param {string} workoutDate - ISO date string of workout (e.g., "2025-11-11")
 * @returns {Array<Object>} Baseline update suggestions
 *   Format: [{ muscle, currentBaseline, suggestedBaseline, achievedVolume, exercise, date, percentIncrease }]
 * @throws {Error} If workout data is invalid
 *
 * @example
 * const suggestions = checkForBaselineUpdates([
 *   {
 *     exercise: "Push-ups",
 *     sets: [
 *       { weight: 200, reps: 30, toFailure: true }
 *     ]
 *   }
 * ], "2025-11-11");
 * // Returns: [
 * //   {
 * //     muscle: "Pectoralis",
 * //     currentBaseline: 3744,
 * //     suggestedBaseline: 4200,
 * //     achievedVolume: 4200,
 * //     exercise: "Push-ups",
 * //     date: "2025-11-11",
 * //     percentIncrease: 12.2
 * //   }
 * // ]
 *
 * Source: docs/musclemax-baseline-learning-system.md
 */
export function checkForBaselineUpdates(workoutExercises, workoutDate) {
  // Input validation
  if (!Array.isArray(workoutExercises)) {
    throw new Error('Workout exercises must be an array');
  }
  if (!workoutDate) {
    throw new Error('Workout date is required');
  }

  // Validate workout structure
  for (const workoutEx of workoutExercises) {
    if (!workoutEx.exercise || typeof workoutEx.exercise !== 'string') {
      throw new Error('Each workout exercise must have an exercise name');
    }
    if (!Array.isArray(workoutEx.sets)) {
      throw new Error('Each workout exercise must have a sets array');
    }
    for (const set of workoutEx.sets) {
      if (typeof set.weight !== 'number' || typeof set.reps !== 'number') {
        throw new Error('Each set must have weight and reps as numbers');
      }
    }
  }

  // Load data sources
  const exercises = loadExerciseLibrary();
  const baselines = loadBaselineData();

  // Calculate muscle volumes from workout
  const { muscleVolumes, exerciseContext } = calculateMuscleVolumes(workoutExercises, exercises);

  // Compare to baselines and generate suggestions
  const suggestions = [];

  for (const [muscleName, achievedVolume] of Object.entries(muscleVolumes)) {
    const baseline = baselines.find(b => b.muscle === muscleName);

    if (!baseline) {
      // Unknown muscle - skip gracefully
      continue;
    }

    // Check if baseline exceeded
    if (achievedVolume > baseline.baselineCapacity) {
      const percentIncrease = ((achievedVolume - baseline.baselineCapacity) / baseline.baselineCapacity) * 100;

      suggestions.push({
        muscle: muscleName,
        currentBaseline: baseline.baselineCapacity,
        suggestedBaseline: achievedVolume,
        achievedVolume: achievedVolume,
        exercise: exerciseContext[muscleName],
        date: workoutDate,
        percentIncrease: parseFloat(percentIncrease.toFixed(1))
      });
    }
  }

  return suggestions;
}

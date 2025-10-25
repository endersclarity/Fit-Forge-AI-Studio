/**
 * Progressive Overload Calculator
 *
 * This utility provides functions for calculating progressive overload suggestions
 * for workout exercises. It implements an alternating strategy between weight and
 * reps progression to attack muscle adaptation from multiple angles.
 */

export type ProgressionMethod = 'weight' | 'reps';

export interface LastPerformance {
  weight: number;
  reps: number;
}

export interface PersonalBest {
  weight: number;
  reps: number;
}

export interface ProgressiveOverloadSuggestion {
  suggestedWeight: number;
  suggestedReps: number;
  progressionMethod: ProgressionMethod;
  percentIncrease: number;
}

/**
 * Rounds a weight value to the nearest 0.5 lb increment
 * This matches practical weight increment capabilities of most equipment
 *
 * @param value - The weight value to round
 * @returns The rounded weight value
 *
 * @example
 * roundToNearestHalf(102.3) // Returns 102.5
 * roundToNearestHalf(102.7) // Returns 103.0
 */
export function roundToNearestHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Determines the next progression method based on the last method used
 * Alternates between 'weight' and 'reps' to vary the training stimulus
 *
 * @param lastMethod - The progression method used in the last workout (null for first workout)
 * @returns The next progression method to use
 *
 * @example
 * determineProgressionMethod(null) // Returns 'weight' (default for first workout)
 * determineProgressionMethod('weight') // Returns 'reps'
 * determineProgressionMethod('reps') // Returns 'weight'
 */
export function determineProgressionMethod(lastMethod: ProgressionMethod | null): ProgressionMethod {
  // If no previous method, default to weight progression
  if (!lastMethod) {
    return 'weight';
  }

  // Alternate between weight and reps
  return lastMethod === 'weight' ? 'reps' : 'weight';
}

/**
 * Calculates progressive overload suggestion for an exercise
 *
 * This function implements a 3% progressive overload strategy that alternates
 * between increasing weight and increasing reps. This approach helps prevent
 * plateaus by varying the training stimulus.
 *
 * Strategy:
 * - Weight progression: Increase weight by 3%, keep reps the same
 * - Reps progression: Increase reps by 3%, keep weight the same
 * - Alternates between the two methods each workout
 * - Never suggests below the personal best
 *
 * @param lastPerformance - The weight and reps from the last workout
 * @param lastProgressionMethod - The progression method used last time (null for first workout)
 * @param personalBest - The personal best for this exercise (optional)
 * @returns Suggestion for the next workout with progression method
 *
 * @example
 * // First workout after baseline (no previous progression)
 * calculateProgressiveOverload(
 *   { weight: 100, reps: 8 },
 *   null,
 *   { weight: 100, reps: 8 }
 * )
 * // Returns: { suggestedWeight: 103, suggestedReps: 8, progressionMethod: 'weight', percentIncrease: 3.0 }
 *
 * @example
 * // After weight progression, switch to reps
 * calculateProgressiveOverload(
 *   { weight: 103, reps: 8 },
 *   'weight',
 *   { weight: 103, reps: 8 }
 * )
 * // Returns: { suggestedWeight: 103, suggestedReps: 9, progressionMethod: 'reps', percentIncrease: 3.0 }
 */
export function calculateProgressiveOverload(
  lastPerformance: LastPerformance,
  lastProgressionMethod: ProgressionMethod | null,
  personalBest?: PersonalBest
): ProgressiveOverloadSuggestion {
  // Determine which method to use next
  const nextMethod = determineProgressionMethod(lastProgressionMethod);

  // Start with last performance values
  let suggestedWeight = lastPerformance.weight;
  let suggestedReps = lastPerformance.reps;

  // Apply 3% progression based on method
  if (nextMethod === 'weight') {
    // Increase weight by 3%, keep reps same
    const increase = lastPerformance.weight * 0.03;
    suggestedWeight = roundToNearestHalf(lastPerformance.weight + increase);
  } else {
    // Increase reps by 3%, keep weight same
    const increase = Math.ceil(lastPerformance.reps * 0.03);
    suggestedReps = lastPerformance.reps + Math.max(1, increase); // Always increase by at least 1 rep
  }

  // Safety check: don't suggest below personal best
  if (personalBest) {
    if (suggestedWeight < personalBest.weight) {
      suggestedWeight = personalBest.weight;
    }
    // Note: We don't enforce reps minimum because you might be doing heavier weight
  }

  return {
    suggestedWeight,
    suggestedReps,
    progressionMethod: nextMethod,
    percentIncrease: 3.0
  };
}

/**
 * Get the suggested variation (A or B) based on the last workout
 * Recommends alternating between variations to ensure balanced training
 *
 * @param lastVariation - The variation used in the last workout
 * @returns The suggested variation for the next workout
 *
 * @example
 * getSuggestedVariation('A') // Returns 'B'
 * getSuggestedVariation('B') // Returns 'A'
 * getSuggestedVariation(null) // Returns 'A' (default for first workout)
 */
export function getSuggestedVariation(lastVariation: 'A' | 'B' | null): 'A' | 'B' {
  if (!lastVariation) {
    return 'A'; // Default to A for first workout
  }

  return lastVariation === 'A' ? 'B' : 'A';
}

/**
 * Calculate days since last workout
 *
 * @param lastWorkoutDate - Date string or timestamp of last workout
 * @returns Number of days since last workout
 *
 * @example
 * getDaysSinceWorkout('2025-10-20') // Returns number of days from Oct 20 to today
 */
export function getDaysSinceWorkout(lastWorkoutDate: string | number): number {
  const lastDate = typeof lastWorkoutDate === 'string'
    ? new Date(lastWorkoutDate).getTime()
    : lastWorkoutDate;

  const now = Date.now();
  const diffMs = now - lastDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format a date relative to today (e.g., "3 days ago", "1 week ago")
 *
 * @param date - Date string or timestamp
 * @returns Human-readable relative time string
 *
 * @example
 * formatRelativeDate('2025-10-21') // Returns "3 days ago"
 */
export function formatRelativeDate(date: string | number): string {
  const days = getDaysSinceWorkout(date);

  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';

  return `${Math.floor(days / 30)} months ago`;
}

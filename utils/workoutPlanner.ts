import { Muscle, PlannedExercise, ForecastedMuscleState, MuscleBaselinesResponse } from '../types';

/**
 * All muscles in the system
 */
const ALL_MUSCLES: Muscle[] = [
  Muscle.Pectoralis,
  Muscle.Triceps,
  Muscle.Deltoids,
  Muscle.Lats,
  Muscle.Biceps,
  Muscle.Rhomboids,
  Muscle.Trapezius,
  Muscle.Forearms,
  Muscle.Quadriceps,
  Muscle.Glutes,
  Muscle.Hamstrings,
  Muscle.Calves,
  Muscle.Core,
];

/**
 * Default baseline value for muscles without user-defined baselines
 * Represents typical session volume capacity in pounds
 */
const DEFAULT_BASELINE = 5000;

/**
 * Calculates forecasted muscle fatigue from planned exercises
 *
 * Algorithm:
 * 1. Calculate total volume per exercise (sets × reps × weight)
 * 2. Distribute volume to muscles based on engagement percentages
 * 3. Sum cumulative volume per muscle across all exercises
 * 4. Convert to fatigue percentage (volume / baseline × 100)
 * 5. Cap at 100% maximum
 *
 * @param plannedExercises - Array of exercises with sets/reps/weight configuration
 * @param muscleBaselines - Baseline capacities for each muscle (from API)
 * @param currentFatigue - Optional current fatigue levels (defaults to 0 for all)
 * @returns Record mapping each muscle to its forecasted state
 *
 * @example
 * const planned: PlannedExercise[] = [{
 *   exercise: DUMBBELL_BENCH_PRESS,
 *   sets: 3,
 *   reps: 10,
 *   weight: 50
 * }];
 *
 * const baselines = {
 *   [Muscle.Pectoralis]: { systemLearnedMax: 5000, userOverride: null }
 * };
 *
 * const forecast = calculateForecastedFatigue(planned, baselines);
 * // forecast[Muscle.Pectoralis].forecastedFatiguePercent ≈ 25.8%
 */
export function calculateForecastedFatigue(
  plannedExercises: PlannedExercise[],
  muscleBaselines: MuscleBaselinesResponse,
  currentFatigue?: Partial<Record<Muscle, number>>
): Record<Muscle, ForecastedMuscleState> {
  // Initialize volume accumulator for each muscle
  const muscleVolumes: Record<Muscle, number> = {} as Record<Muscle, number>;

  ALL_MUSCLES.forEach(muscle => {
    muscleVolumes[muscle] = 0;
  });

  // Calculate volume per muscle from planned exercises
  for (const planned of plannedExercises) {
    // Total volume for this exercise
    const exerciseVolume = planned.sets * planned.reps * planned.weight;

    // Distribute volume to engaged muscles
    for (const engagement of planned.exercise.muscleEngagements) {
      const muscleVolume = exerciseVolume * (engagement.percentage / 100);
      muscleVolumes[engagement.muscle] += muscleVolume;
    }
  }

  // Convert volumes to fatigue percentages
  const result: Record<Muscle, ForecastedMuscleState> = {} as Record<Muscle, ForecastedMuscleState>;

  for (const muscle of ALL_MUSCLES) {
    // Get baseline (prefer user override, fallback to learned max, then default)
    const baselineData = muscleBaselines[muscle];
    const baseline = baselineData?.userOverride
      ?? baselineData?.systemLearnedMax
      ?? DEFAULT_BASELINE;

    const volumeAdded = muscleVolumes[muscle];
    const currentFatiguePercent = currentFatigue?.[muscle] ?? 0;

    // Calculate new fatigue from added volume
    const addedFatiguePercent = (volumeAdded / baseline) * 100;

    // Total fatigue = current + added (capped at 100%)
    const forecastedFatiguePercent = Math.min(
      currentFatiguePercent + addedFatiguePercent,
      100
    );

    result[muscle] = {
      muscle,
      currentFatiguePercent,
      forecastedFatiguePercent,
      volumeAdded,
      baseline
    };
  }

  return result;
}

/**
 * Formats muscle impact for display
 * Returns only muscles with significant engagement (>5%)
 *
 * @param exercise - The exercise to analyze
 * @param sets - Number of sets
 * @param reps - Reps per set
 * @param weight - Weight per set
 * @param baselines - Muscle baselines for calculation
 * @returns Array of formatted strings like ["Pec +40%", "Tri +20%"]
 */
export function formatMuscleImpact(
  exercise: PlannedExercise['exercise'],
  sets: number,
  reps: number,
  weight: number,
  baselines: MuscleBaselinesResponse
): string[] {
  const exerciseVolume = sets * reps * weight;
  const impacts: { muscle: string; percent: number }[] = [];

  for (const engagement of exercise.muscleEngagements) {
    // Only show muscles with >5% engagement
    if (engagement.percentage < 5) continue;

    const muscleVolume = exerciseVolume * (engagement.percentage / 100);
    const baselineData = baselines[engagement.muscle];
    const baseline = baselineData?.userOverride
      ?? baselineData?.systemLearnedMax
      ?? DEFAULT_BASELINE;

    const fatiguePercent = (muscleVolume / baseline) * 100;

    impacts.push({
      muscle: engagement.muscle,
      percent: fatiguePercent
    });
  }

  // Sort by impact (highest first) and format
  return impacts
    .sort((a, b) => b.percent - a.percent)
    .map(({ muscle, percent }) =>
      `${muscle} +${percent.toFixed(0)}%`
    );
}

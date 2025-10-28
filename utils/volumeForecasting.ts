import { Muscle, MuscleEngagement, ForecastedMuscleState } from '../types';

interface MuscleCapacity {
  currentFatiguePercent: number;
  baseline: number;
}

/**
 * Calculate forecasted muscle fatigue after performing an exercise with given volume
 */
export function forecastMuscleFatigueForExercise(
  muscleEngagements: MuscleEngagement[],
  totalVolume: number,
  muscleStates: Record<Muscle, MuscleCapacity>
): Record<Muscle, ForecastedMuscleState> {
  const forecast: Record<Muscle, ForecastedMuscleState> = {} as any;

  for (const engagement of muscleEngagements) {
    const muscleState = muscleStates[engagement.muscle];
    if (!muscleState) continue;

    const volumeAdded = (engagement.percentage / 100) * totalVolume;
    const volumePercent = (volumeAdded / muscleState.baseline) * 100;
    const forecastedFatiguePercent = Math.min(100, muscleState.currentFatiguePercent + volumePercent);

    forecast[engagement.muscle] = {
      muscle: engagement.muscle,
      currentFatiguePercent: muscleState.currentFatiguePercent,
      forecastedFatiguePercent,
      volumeAdded,
      baseline: muscleState.baseline,
    };
  }

  return forecast;
}

/**
 * Find the "sweet spot" volume where target muscle reaches 100% before any supporting muscle
 */
export function findOptimalVolume(
  targetMuscle: Muscle,
  muscleEngagements: MuscleEngagement[],
  muscleStates: Record<Muscle, MuscleCapacity>
): number {
  const targetEngagement = muscleEngagements.find(e => e.muscle === targetMuscle);
  if (!targetEngagement || !muscleStates[targetMuscle]) return 0;

  const targetState = muscleStates[targetMuscle];
  const targetCapacityRemaining = 100 - targetState.currentFatiguePercent;
  const targetMaxVolume = (targetCapacityRemaining / 100) * targetState.baseline / (targetEngagement.percentage / 100);

  // Find limiting volume for each supporting muscle
  let limitingVolume = targetMaxVolume;

  for (const engagement of muscleEngagements) {
    if (engagement.muscle === targetMuscle) continue;

    const muscleState = muscleStates[engagement.muscle];
    if (!muscleState) continue;

    const capacityRemaining = 100 - muscleState.currentFatiguePercent;
    const maxVolumeForMuscle = (capacityRemaining / 100) * muscleState.baseline / (engagement.percentage / 100);

    if (maxVolumeForMuscle < limitingVolume) {
      limitingVolume = maxVolumeForMuscle;
    }
  }

  return Math.floor(limitingVolume);
}

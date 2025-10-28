import { Muscle, MuscleEngagement } from '../types';

interface MuscleCapacity {
  currentFatiguePercent: number;
  baseline: number;
}

/**
 * Calculate efficiency score for an exercise targeting a specific muscle
 *
 * Algorithm:
 * 1. Calculate target muscle's remaining capacity %
 * 2. For each supporting muscle, calculate (engagement % × capacity remaining %)
 * 3. Find the lowest supporting muscle score (bottleneck)
 * 4. Efficiency = (target_engagement × target_capacity) ÷ bottleneck_capacity
 *
 * Higher scores = can push target muscle further before hitting bottleneck
 */
export function calculateEfficiencyScore(
  targetMuscle: Muscle,
  muscleEngagements: MuscleEngagement[],
  muscleStates: Record<Muscle, MuscleCapacity>
): number {
  const targetEngagement = muscleEngagements.find(e => e.muscle === targetMuscle);
  if (!targetEngagement || !muscleStates[targetMuscle]) return 0;

  const targetCapacityRemaining = 100 - muscleStates[targetMuscle].currentFatiguePercent;
  const targetScore = (targetEngagement.percentage / 100) * targetCapacityRemaining;

  // Find bottleneck: supporting muscle with lowest capacity score
  let bottleneckScore = Infinity;

  for (const engagement of muscleEngagements) {
    if (engagement.muscle === targetMuscle) continue;

    const muscleState = muscleStates[engagement.muscle];
    if (!muscleState) continue;

    const capacityRemaining = 100 - muscleState.currentFatiguePercent;
    const score = (engagement.percentage / 100) * capacityRemaining;

    if (score < bottleneckScore) {
      bottleneckScore = score;
    }
  }

  // If no supporting muscles, return target score directly
  if (bottleneckScore === Infinity) return targetScore;

  return targetScore / bottleneckScore;
}

/**
 * Get efficiency badge label based on score
 */
export function getEfficiencyBadge(score: number): {
  label: string;
  color: 'green' | 'yellow' | 'red';
} {
  if (score > 5.0) return { label: 'Efficient', color: 'green' };
  if (score >= 2.0) return { label: 'Limited', color: 'yellow' };
  return { label: 'Poor choice', color: 'red' };
}

/**
 * Find bottleneck muscle for an exercise
 */
export function findBottleneckMuscle(
  targetMuscle: Muscle,
  muscleEngagements: MuscleEngagement[],
  muscleStates: Record<Muscle, MuscleCapacity>
): Muscle | null {
  let bottleneckMuscle: Muscle | null = null;
  let lowestScore = Infinity;

  for (const engagement of muscleEngagements) {
    if (engagement.muscle === targetMuscle) continue;

    const muscleState = muscleStates[engagement.muscle];
    if (!muscleState) continue;

    const capacityRemaining = 100 - muscleState.currentFatiguePercent;
    const score = (engagement.percentage / 100) * capacityRemaining;

    if (score < lowestScore) {
      lowestScore = score;
      bottleneckMuscle = engagement.muscle;
    }
  }

  return bottleneckMuscle;
}

import { Muscle, MuscleBaselines, MuscleStatesResponse, Exercise } from '../types';
import { EXERCISE_LIBRARY } from '../constants';
import { MuscleTargets } from '../components/TargetModePanel';

export interface ExerciseRecommendation {
  exercise: Exercise;
  targetVolume: number;
  muscleImpacts: Record<string, number>;  // Muscle name -> fatigue increase %
  efficiencyScore: number;
}

interface MuscleState {
  currentFatigue: number;
  targetFatigue: number;
  maxAllowed: number | null;
  baseline: number;
}

/**
 * Calculate the fatigue impact on each muscle from a given volume of an exercise
 */
export function calculateMuscleImpact(
  exercise: Exercise,
  volume: number,
  muscleBaselines: MuscleBaselines
): Record<string, number> {
  const impacts: Record<string, number> = {};

  for (const engagement of exercise.muscleEngagements) {
    const muscleName = engagement.muscle;
    const baseline = muscleBaselines[muscleName as Muscle];
    const effectiveMax = baseline?.userOverride || baseline?.systemLearnedMax || 1000;

    const muscleVolume = volume * (engagement.percentage / 100);
    const fatigueIncrease = (muscleVolume / effectiveMax) * 100;

    impacts[muscleName] = fatigueIncrease;
  }

  return impacts;
}

/**
 * Calculate how much volume is needed to close a specific muscle's fatigue gap
 */
export function calculateVolumeForFatigueGap(
  fatigueGap: number,
  engagement: number,  // percentage (0-100)
  baseline: number
): number {
  // fatigueGap = (muscleVolume / baseline) * 100
  // muscleVolume = engagement% * totalVolume
  // Therefore: fatigueGap = (engagement% * totalVolume / baseline) * 100
  // Solving: totalVolume = (fatigueGap * baseline) / (engagement%)

  const engagementDecimal = engagement / 100;
  if (engagementDecimal === 0) return 0;

  const volume = (fatigueGap / 100) * baseline / engagementDecimal;
  return Math.max(0, volume);
}

/**
 * Score an exercise based on how efficiently it addresses the target muscle
 * while minimizing collateral fatigue on constrained muscles
 */
export function calculateExerciseScore(
  exercise: Exercise,
  targetMuscle: Muscle,
  fatigueGap: number,
  muscleStates: Record<string, MuscleState>
): number {
  // Find target muscle engagement
  const targetEngagement = exercise.muscleEngagements.find(
    e => e.muscle === targetMuscle
  );

  if (!targetEngagement || targetEngagement.percentage === 0) {
    return 0;  // Exercise doesn't work target muscle
  }

  // Calculate collateral risk from constrained muscles
  let collateralRisk = 0;

  for (const engagement of exercise.muscleEngagements) {
    const muscleName = engagement.muscle;
    const state = muscleStates[muscleName];

    if (!state) continue;

    // Skip target muscle
    if (muscleName === targetMuscle) continue;

    // If this muscle has a constraint (maxAllowed)
    if (state.maxAllowed !== null) {
      const headroom = state.maxAllowed - state.currentFatigue;
      if (headroom <= 0) {
        // No headroom, high risk
        collateralRisk += engagement.percentage * 10;
      } else {
        // Risk inversely proportional to headroom
        const riskFactor = engagement.percentage / headroom;
        collateralRisk += riskFactor;
      }
    }
  }

  // Score = target engagement / (1 + collateral risk)
  // Higher target engagement = better
  // Higher collateral risk = worse
  const score = targetEngagement.percentage / (1 + collateralRisk);

  return score;
}

/**
 * Greedy algorithm to generate workout recommendations from muscle targets
 *
 * Algorithm:
 * 1. Sort muscles by fatigue gap (largest first)
 * 2. For each muscle with a gap:
 *    a. Score all exercises based on efficiency
 *    b. Pick best exercise
 *    c. Calculate volume needed to close gap
 *    d. Check if any constraints would be violated
 *    e. If valid, add to recommendations and update simulated states
 * 3. Return recommendations
 */
export function generateWorkoutFromTargets(
  targets: MuscleTargets,
  currentMuscleStates: MuscleStatesResponse,
  muscleBaselines: MuscleBaselines
): ExerciseRecommendation[] {
  const recommendations: ExerciseRecommendation[] = [];

  // Build muscle state map
  const muscleStates: Record<string, MuscleState> = {};

  Object.keys(Muscle).forEach(key => {
    const muscle = Muscle[key as keyof typeof Muscle];
    const target = targets[muscle];
    const current = currentMuscleStates[muscle];
    const baseline = muscleBaselines[muscle];

    if (!target || !baseline) return;

    muscleStates[muscle] = {
      currentFatigue: current?.currentFatiguePercent || 0,
      targetFatigue: target.targetFatigue,
      maxAllowed: target.maxAllowed,
      baseline: baseline.userOverride || baseline.systemLearnedMax || 1000,
    };
  });

  // Calculate initial fatigue gaps
  const gaps: Array<{ muscle: Muscle; gap: number }> = [];

  for (const [muscleName, state] of Object.entries(muscleStates)) {
    const gap = state.targetFatigue - state.currentFatigue;
    if (gap > 0) {
      gaps.push({ muscle: muscleName as Muscle, gap });
    }
  }

  // Sort by gap size (largest first)
  gaps.sort((a, b) => b.gap - a.gap);

  // Simulated muscle states (track cumulative fatigue)
  const simulatedStates = { ...muscleStates };

  // Process each gap
  for (const { muscle, gap } of gaps) {
    // Score all exercises
    const scoredExercises = EXERCISE_LIBRARY.map(exercise => ({
      exercise,
      score: calculateExerciseScore(exercise, muscle, gap, simulatedStates),
    })).filter(se => se.score > 0);

    // Sort by score (best first)
    scoredExercises.sort((a, b) => b.score - a.score);

    if (scoredExercises.length === 0) {
      console.warn(`No valid exercises found for ${muscle}`);
      continue;
    }

    // Pick best exercise
    const best = scoredExercises[0];
    const exercise = best.exercise;

    // Find target muscle engagement percentage
    const targetEngagement = exercise.muscleEngagements.find(
      e => e.muscle === muscle
    );

    if (!targetEngagement) continue;

    // Calculate volume needed to close gap
    const state = simulatedStates[muscle];
    const currentGap = state.targetFatigue - state.currentFatigue;
    const volume = calculateVolumeForFatigueGap(
      currentGap,
      targetEngagement.percentage,
      state.baseline
    );

    // Calculate impacts on all muscles
    const impacts = calculateMuscleImpact(exercise, volume, muscleBaselines);

    // Check for constraint violations
    let violatesConstraint = false;

    for (const [muscleName, impact] of Object.entries(impacts)) {
      const muscleState = simulatedStates[muscleName];
      if (!muscleState) continue;

      if (muscleState.maxAllowed !== null) {
        const newFatigue = muscleState.currentFatigue + impact;
        if (newFatigue > muscleState.maxAllowed) {
          violatesConstraint = true;
          console.warn(
            `Exercise ${exercise.name} would violate ${muscleName} constraint: ` +
            `${newFatigue.toFixed(1)}% > ${muscleState.maxAllowed}%`
          );
          break;
        }
      }
    }

    if (violatesConstraint) {
      // Try next best exercise
      // For simplicity, skip this muscle (could be improved)
      continue;
    }

    // Add recommendation
    recommendations.push({
      exercise,
      targetVolume: volume,
      muscleImpacts: impacts,
      efficiencyScore: best.score,
    });

    // Update simulated states
    for (const [muscleName, impact] of Object.entries(impacts)) {
      if (simulatedStates[muscleName]) {
        simulatedStates[muscleName].currentFatigue += impact;
      }
    }
  }

  return recommendations;
}

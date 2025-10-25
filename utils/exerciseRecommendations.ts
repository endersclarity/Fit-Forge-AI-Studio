import {
  Exercise,
  Muscle,
  ExerciseCategory,
  Equipment,
  EquipmentItem,
  MuscleStatesResponse,
  MuscleReadiness,
  ExerciseRecommendation
} from '../types';
import { EXERCISE_LIBRARY } from '../constants';

/**
 * Check if user has required equipment for an exercise
 */
function checkEquipmentAvailable(
  requiredEquipment: Equipment | Equipment[],
  userEquipment: EquipmentItem[] | any[]
): boolean {
  if (!userEquipment || userEquipment.length === 0) {
    return false;
  }

  const required = Array.isArray(requiredEquipment) ? requiredEquipment : [requiredEquipment];

  // Exercise is available if user has ALL required equipment types
  // Handle both frontend format (type field) and backend format (name field)
  return required.every(reqType =>
    userEquipment.some(userEq => {
      const equipmentType = (userEq as any).type || (userEq as any).name;
      const quantity = (userEq as EquipmentItem).quantity !== undefined
        ? (userEq as EquipmentItem).quantity
        : 1; // Assume quantity of 1 if not specified
      return equipmentType === reqType && quantity > 0;
    })
  );
}

/**
 * Calculate opportunity score for a single exercise
 */
function calculateOpportunityScore(
  exercise: Exercise,
  muscleStates: MuscleStatesResponse
): {
  score: number;
  primaryMuscles: MuscleReadiness[];
  limitingFactors: MuscleReadiness[];
} {
  // 1. Calculate muscle readiness for all engaged muscles
  const muscleReadiness: MuscleReadiness[] = exercise.muscleEngagements.map(eng => {
    const state = muscleStates[eng.muscle];
    const fatigue = state ? state.currentFatiguePercent : 0;
    const recovery = 100 - fatigue;

    return {
      muscle: eng.muscle,
      recovery,
      fatigue,
      engagement: eng.percentage,
      isPrimary: eng.percentage >= 50
    };
  });

  // 2. Identify primary muscles (>= 50% engagement)
  const primaryMuscles = muscleReadiness.filter(m => m.isPrimary);

  // 3. Calculate average freshness of primary muscles
  const avgFreshness = primaryMuscles.length > 0
    ? primaryMuscles.reduce((sum, m) => sum + m.recovery, 0) / primaryMuscles.length
    : 0;

  // 4. Find limiting factors (muscles with fatigue > 66%)
  const limitingFactors = muscleReadiness.filter(m => m.fatigue > 66);

  // 5. Find max fatigue across all engaged muscles
  const maxFatigue = Math.max(...muscleReadiness.map(m => m.fatigue), 0);

  // 6. Calculate opportunity score
  // Formula: avgFreshness - (maxFatigue × 0.5)
  // This penalizes exercises where ANY muscle is fatigued
  const opportunityScore = avgFreshness - (maxFatigue * 0.5);

  return {
    score: opportunityScore,
    primaryMuscles,
    limitingFactors
  };
}

/**
 * Determine status based on freshness and limiting factors
 */
function determineStatus(
  avgFreshness: number,
  limitingFactors: MuscleReadiness[]
): 'excellent' | 'good' | 'suboptimal' | 'not-recommended' {
  const limitingCount = limitingFactors.length;

  // Excellent: All muscles fresh, high primary freshness
  if (limitingCount === 0 && avgFreshness >= 90) {
    return 'excellent';
  }

  // Good: No limiting factors, decent primary freshness
  if (limitingCount === 0 && avgFreshness >= 70) {
    return 'good';
  }

  // Suboptimal: Has limiting factors BUT primary muscles still somewhat fresh
  if (limitingCount > 0 && avgFreshness >= 50) {
    return 'suboptimal';
  }

  // Not recommended: Primary muscles too fatigued
  return 'not-recommended';
}

/**
 * Generate human-readable explanation for recommendation
 */
function generateExplanation(
  status: 'excellent' | 'good' | 'suboptimal' | 'not-recommended',
  primaryMuscles: MuscleReadiness[],
  limitingFactors: MuscleReadiness[]
): string {
  if (status === 'excellent') {
    return 'All muscles fully recovered - maximum training potential';
  }

  if (status === 'good') {
    return 'Primary muscles ready - good training opportunity';
  }

  if (status === 'suboptimal') {
    if (limitingFactors.length > 0) {
      const mostFatigued = limitingFactors.reduce((prev, curr) =>
        curr.fatigue > prev.fatigue ? curr : prev
      );
      return `${mostFatigued.muscle} is ${mostFatigued.fatigue.toFixed(0)}% fatigued and may limit performance`;
    }
    return 'Some engaged muscles are fatigued';
  }

  // not-recommended
  return 'Primary muscles need more recovery time';
}

/**
 * Main entry point: Calculate exercise recommendations
 *
 * @param muscleStates Current muscle fatigue states from API
 * @param equipment User's available equipment
 * @param category Optional filter by exercise category
 * @returns Array of recommendations sorted by opportunity score (highest first)
 */
export function calculateRecommendations(
  muscleStates: MuscleStatesResponse,
  equipment: EquipmentItem[],
  category?: ExerciseCategory
): ExerciseRecommendation[] {
  // Filter exercises by category if provided
  const exercises = category
    ? EXERCISE_LIBRARY.filter(ex => ex.category === category)
    : EXERCISE_LIBRARY;

  const recommendations: ExerciseRecommendation[] = [];

  for (const exercise of exercises) {
    // 1. Check equipment availability
    const equipmentAvailable = checkEquipmentAvailable(exercise.equipment, equipment);

    // Skip if equipment not available (optional: can show as unavailable instead)
    if (!equipmentAvailable) continue;

    // 2. Calculate opportunity score and muscle readiness
    const { score, primaryMuscles, limitingFactors } = calculateOpportunityScore(
      exercise,
      muscleStates
    );

    // 3. Calculate average freshness for status determination
    const avgFreshness = primaryMuscles.length > 0
      ? primaryMuscles.reduce((sum, m) => sum + m.recovery, 0) / primaryMuscles.length
      : 0;

    // 4. Determine status
    const status = determineStatus(avgFreshness, limitingFactors);

    // 5. Generate explanation
    const explanation = generateExplanation(status, primaryMuscles, limitingFactors);

    // 6. Build recommendation object
    recommendations.push({
      exercise,
      opportunityScore: score,
      primaryMuscles,
      limitingFactors,
      status,
      explanation,
      equipmentAvailable
    });
  }

  // Sort by opportunity score (highest first)
  return recommendations.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

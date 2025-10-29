import {
  Exercise,
  Muscle,
  DetailedMuscle,
  ExerciseCategory,
  Equipment,
  EquipmentItem,
  MuscleStatesResponse,
  MuscleReadiness,
  ExerciseRecommendation,
  CalibrationMap
} from '../types';
import { EXERCISE_LIBRARY } from '../constants';

/**
 * Merge user calibrations with default muscle engagements
 */
function getMuscleEngagementsWithCalibrations(
  exercise: Exercise,
  calibrations?: CalibrationMap
): Array<{ muscle: Muscle; percentage: number }> {
  const exerciseCalibrations = calibrations?.[exercise.id];

  if (!exerciseCalibrations) {
    // No calibrations for this exercise, use defaults
    return exercise.muscleEngagements;
  }

  // Merge calibrations with defaults
  return exercise.muscleEngagements.map(engagement => ({
    muscle: engagement.muscle,
    percentage: exerciseCalibrations[engagement.muscle] ?? engagement.percentage
  }));
}

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
 * Uses detailed muscle data when available for more accurate scoring
 */
function calculateOpportunityScore(
  exercise: Exercise,
  muscleStates: MuscleStatesResponse,
  calibrations?: CalibrationMap
): {
  score: number;
  primaryMuscles: MuscleReadiness[];
  limitingFactors: MuscleReadiness[];
  usesDetailedData: boolean;
  detailedMuscles?: Array<{
    muscle: string;
    role: string;
    fatigue: number;
    engagement: number;
  }>;
} {
  // Check if exercise has detailed muscle engagements
  const hasDetailedData = exercise.detailedMuscleEngagements && exercise.detailedMuscleEngagements.length > 0;

  if (hasDetailedData) {
    // Use detailed muscle tracking for more accurate recommendations
    const detailedEngagements = exercise.detailedMuscleEngagements!;
    let totalFatigueLoad = 0;
    let maxFatigue = 0;
    const detailedMuscles: Array<{muscle: string; role: string; fatigue: number; engagement: number}> = [];
    const limitingFactorsList: MuscleReadiness[] = [];

    // Calculate fatigue-weighted score based on detailed muscles
    for (const engagement of detailedEngagements) {
      // For now, we aggregate detailed muscle fatigue from their visualization muscle
      // TODO: In future phases, query detailed_muscle_states table directly
      const vizMuscle = getVisualizationMuscleForDetailed(engagement.muscle);
      const state = muscleStates[vizMuscle];
      const fatigue = state ? state.currentFatiguePercent : 0;

      // Weight fatigue by engagement percentage and role
      const roleWeight = engagement.role === 'primary' ? 1.0
        : engagement.role === 'secondary' ? 0.5
        : 0.2; // stabilizers have minimal impact

      const fatigueContribution = (fatigue / 100) * (engagement.percentage / 100) * roleWeight;
      totalFatigueLoad += fatigueContribution;

      if (fatigue > maxFatigue) {
        maxFatigue = fatigue;
      }

      detailedMuscles.push({
        muscle: engagement.muscle,
        role: engagement.role,
        fatigue: fatigue,
        engagement: engagement.percentage
      });

      // Track limiting factors (primary movers with high fatigue)
      if (fatigue > 66 && engagement.role === 'primary') {
        limitingFactorsList.push({
          muscle: vizMuscle as Muscle,
          recovery: 100 - fatigue,
          fatigue: fatigue,
          engagement: engagement.percentage,
          isPrimary: true
        });
      }
    }

    // Calculate opportunity score: higher when fresh, lower when fatigued
    const opportunityScore = 100 - (totalFatigueLoad * 100);

    // Calculate primary muscle readiness for UI display
    const primaryMuscles = detailedEngagements
      .filter(e => e.role === 'primary')
      .map(e => {
        const vizMuscle = getVisualizationMuscleForDetailed(e.muscle);
        const state = muscleStates[vizMuscle];
        const fatigue = state ? state.currentFatiguePercent : 0;
        return {
          muscle: vizMuscle as Muscle,
          recovery: 100 - fatigue,
          fatigue: fatigue,
          engagement: e.percentage,
          isPrimary: true
        };
      });

    return {
      score: Math.max(0, opportunityScore),
      primaryMuscles,
      limitingFactors: limitingFactorsList,
      usesDetailedData: true,
      detailedMuscles
    };
  } else {
    // Fall back to visualization muscle tracking for legacy exercises
    const muscleEngagements = getMuscleEngagementsWithCalibrations(exercise, calibrations);

    // 1. Calculate muscle readiness for all engaged muscles
    const muscleReadiness: MuscleReadiness[] = muscleEngagements.map(eng => {
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
      limitingFactors,
      usesDetailedData: false
    };
  }
}

/**
 * Map detailed muscle to its visualization muscle group
 * TODO: Move to shared utility file or import from backend/database/mappings.ts
 */
function getVisualizationMuscleForDetailed(detailedMuscle: DetailedMuscle): string {
  // Simplified mapping - in production, import from backend/database/mappings.ts
  const mapping: Record<string, string> = {
    // CHEST
    "Pectoralis Major (Clavicular)": "Pectoralis",
    "Pectoralis Major (Sternal)": "Pectoralis",
    // SHOULDERS
    "Anterior Deltoid": "Deltoids",
    "Medial Deltoid": "Deltoids",
    "Posterior Deltoid": "Deltoids",
    // ROTATOR CUFF
    "Infraspinatus": "Deltoids",
    "Supraspinatus": "Deltoids",
    "Teres Minor": "Deltoids",
    "Subscapularis": "Deltoids",
    // SCAPULAR STABILIZERS
    "Serratus Anterior": "Pectoralis",
    "Rhomboids": "Rhomboids",
    "Levator Scapulae": "Trapezius",
    // BACK
    "Latissimus Dorsi": "Lats",
    "Upper Trapezius": "Trapezius",
    "Middle Trapezius": "Trapezius",
    "Lower Trapezius": "Trapezius",
    "Erector Spinae": "Core",
    // ARMS - Biceps
    "Biceps Brachii": "Biceps",
    "Brachialis": "Biceps",
    "Brachioradialis": "Forearms",
    // ARMS - Triceps
    "Triceps (Long Head)": "Triceps",
    "Triceps (Lateral Head)": "Triceps",
    "Triceps (Medial Head)": "Triceps",
    // ARMS - Forearms
    "Wrist Flexors": "Forearms",
    "Wrist Extensors": "Forearms",
    // CORE
    "Rectus Abdominis": "Core",
    "External Obliques": "Core",
    "Internal Obliques": "Core",
    "Transverse Abdominis": "Core",
    "Iliopsoas": "Core",
    // LEGS - Quadriceps
    "Vastus Lateralis": "Quadriceps",
    "Vastus Medialis": "Quadriceps",
    "Vastus Intermedius": "Quadriceps",
    "Rectus Femoris": "Quadriceps",
    // LEGS - Glutes
    "Gluteus Maximus": "Glutes",
    "Gluteus Medius": "Glutes",
    "Gluteus Minimus": "Glutes",
    // LEGS - Hamstrings
    "Biceps Femoris": "Hamstrings",
    "Semitendinosus": "Hamstrings",
    "Semimembranosus": "Hamstrings",
    // LEGS - Calves
    "Gastrocnemius (Medial)": "Calves",
    "Gastrocnemius (Lateral)": "Calves",
    "Soleus": "Calves",
  };

  return mapping[detailedMuscle as string] || "Core"; // Default fallback
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
 * Includes detailed muscle information when available
 */
function generateExplanation(
  status: 'excellent' | 'good' | 'suboptimal' | 'not-recommended',
  primaryMuscles: MuscleReadiness[],
  limitingFactors: MuscleReadiness[],
  detailedMuscles?: Array<{muscle: string; role: string; fatigue: number; engagement: number}>
): string {
  if (status === 'excellent') {
    // If we have detailed data, mention specific fresh muscles
    if (detailedMuscles && detailedMuscles.length > 0) {
      const freshPrimary = detailedMuscles
        .filter(m => m.role === 'primary' && m.fatigue < 30)
        .map(m => m.muscle);

      if (freshPrimary.length > 0) {
        const topMuscles = freshPrimary.slice(0, 2).join(', ');
        return `Targets fresh: ${topMuscles} - excellent opportunity`;
      }
    }
    return 'All muscles fully recovered - maximum training potential';
  }

  if (status === 'good') {
    // If we have detailed data, mention specific fresh primary movers
    if (detailedMuscles && detailedMuscles.length > 0) {
      const freshPrimary = detailedMuscles
        .filter(m => m.role === 'primary' && m.fatigue < 40)
        .map(m => m.muscle);

      if (freshPrimary.length > 0) {
        const topMuscles = freshPrimary.slice(0, 2).join(', ');
        return `Fresh primary movers: ${topMuscles}`;
      }
    }
    return 'Primary muscles ready - good training opportunity';
  }

  if (status === 'suboptimal') {
    // If we have detailed data, mention specific limiting muscles
    if (detailedMuscles && detailedMuscles.length > 0) {
      const fatiguedPrimary = detailedMuscles
        .filter(m => m.role === 'primary' && m.fatigue > 60)
        .sort((a, b) => b.fatigue - a.fatigue);

      if (fatiguedPrimary.length > 0) {
        const mostFatigued = fatiguedPrimary[0];
        return `${mostFatigued.muscle} is ${mostFatigued.fatigue.toFixed(0)}% fatigued - may limit performance`;
      }
    }

    // Fall back to visualization muscle explanation
    if (limitingFactors.length > 0) {
      const mostFatigued = limitingFactors.reduce((prev, curr) =>
        curr.fatigue > prev.fatigue ? curr : prev
      );
      return `${mostFatigued.muscle} is ${mostFatigued.fatigue.toFixed(0)}% fatigued and may limit performance`;
    }
    return 'Some engaged muscles are fatigued';
  }

  // not-recommended
  if (detailedMuscles && detailedMuscles.length > 0) {
    const fatiguedMuscles = detailedMuscles
      .filter(m => m.role === 'primary' && m.fatigue > 70)
      .map(m => m.muscle)
      .slice(0, 2)
      .join(', ');

    if (fatiguedMuscles) {
      return `May overtrain: ${fatiguedMuscles} need recovery`;
    }
  }
  return 'Primary muscles need more recovery time';
}

/**
 * Main entry point: Calculate exercise recommendations
 *
 * @param muscleStates Current muscle fatigue states from API
 * @param equipment User's available equipment
 * @param category Optional filter by exercise category
 * @param calibrations Optional user calibrations for muscle engagement percentages
 * @returns Array of recommendations sorted by opportunity score (highest first)
 */
export function calculateRecommendations(
  muscleStates: MuscleStatesResponse,
  equipment: EquipmentItem[],
  category?: ExerciseCategory,
  calibrations?: CalibrationMap
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

    // 2. Calculate opportunity score and muscle readiness (using calibrations if available)
    const { score, primaryMuscles, limitingFactors, usesDetailedData, detailedMuscles } = calculateOpportunityScore(
      exercise,
      muscleStates,
      calibrations
    );

    // 3. Calculate average freshness for status determination
    const avgFreshness = primaryMuscles.length > 0
      ? primaryMuscles.reduce((sum, m) => sum + m.recovery, 0) / primaryMuscles.length
      : 0;

    // 4. Determine status
    const status = determineStatus(avgFreshness, limitingFactors);

    // 5. Generate explanation (pass detailedMuscles for enhanced messaging)
    const explanation = generateExplanation(status, primaryMuscles, limitingFactors, detailedMuscles);

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

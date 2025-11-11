/**
 * Exercise Recommendation Service
 *
 * Scores and ranks exercises based on multiple factors for intelligent recommendations.
 *
 * Algorithm based on: logic-sandbox/workout-builder-recommendations.md
 *
 * 5-Factor Scoring:
 * 1. Target Muscle Match (40%): Higher engagement = better
 * 2. Muscle Freshness (25%): Fresher supporting muscles = better
 * 3. Movement Variety (15%): Less duplication = better
 * 4. User Preference (10%): User favorites = better
 * 5. Primary/Secondary Balance (10%): Primary engagement = better
 */

const exercisesData = require('../../docs/logic-sandbox/exercises.json');
const exercises = exercisesData.exercises;

// Constants
const SCORING_WEIGHTS = {
  targetMatch: 40,
  muscleFreshness: 25,
  variety: 15,
  userPreference: 10,
  primaryBalance: 10
};

const MIN_ENGAGEMENT_THRESHOLD = 5; // Minimum 5% muscle engagement to consider
const BOTTLENECK_WARNING_THRESHOLD = 80; // Warn if supporting muscle >80% fatigued
const BASELINE_EXCEEDANCE_THRESHOLD = 100; // Unsafe if any muscle would exceed 100%

/**
 * Filter exercises by eligibility criteria
 *
 * @param {Array} targetMuscle - Muscle group to target
 * @param {Array} availableEquipment - Equipment user has access to
 * @param {Array} currentWorkout - Exercises already in workout (array of { exerciseId })
 * @param {Array} avoidExercises - Exercise IDs user wants to avoid
 * @returns {Array} Eligible exercises
 */
function filterEligibleExercises(targetMuscle, availableEquipment, currentWorkout = [], avoidExercises = []) {
  return exercises.filter(exercise => {
    // 1. Must have required equipment
    if (availableEquipment && availableEquipment.length > 0) {
      if (!availableEquipment.includes(exercise.equipment)) {
        return false;
      }
    }

    // 2. Must not be in user's "avoid" list
    if (avoidExercises.includes(exercise.id)) {
      return false;
    }

    // 3. Must not already be in current workout (no duplicates)
    if (currentWorkout.some(ex => ex.exerciseId === exercise.id)) {
      return false;
    }

    // 4. Must actually target the desired muscle
    const targetEngagement = exercise.muscles.find(m => m.muscle === targetMuscle);
    if (!targetEngagement || targetEngagement.percentage < MIN_ENGAGEMENT_THRESHOLD) {
      return false;
    }

    return true;
  });
}

/**
 * Check if adding an exercise would create bottlenecks
 *
 * @param {Object} exercise - Exercise to check
 * @param {Object} currentFatigue - Current fatigue state per muscle
 * @param {Object} currentMuscleVolumes - Current volume per muscle in workout
 * @param {Object} baselines - Baseline capacity per muscle
 * @param {number} estimatedSets - Estimated sets (default 3)
 * @param {number} estimatedReps - Estimated reps (default 10)
 * @param {number} estimatedWeight - Estimated weight
 * @returns {Object} Safety check result with warnings
 */
function checkBottleneckSafety(exercise, currentFatigue, currentMuscleVolumes, baselines, estimatedSets = 3, estimatedReps = 10, estimatedWeight = 100) {
  const warnings = [];

  // Estimate total volume for this exercise
  const estimatedVolume = estimatedSets * estimatedReps * estimatedWeight;

  // Check impact on each muscle this exercise engages
  exercise.muscles.forEach(muscleData => {
    const muscleName = muscleData.muscle;
    const muscleVolume = estimatedVolume * (muscleData.percentage / 100);

    const currentMuscleVolume = currentMuscleVolumes[muscleName] || 0;
    const baseline = baselines[muscleName];

    if (!baseline) {
      // No baseline data available - skip safety check
      return;
    }

    // Calculate new fatigue if this exercise is added
    const newTotalVolume = currentMuscleVolume + muscleVolume;
    const newFatigue = (newTotalVolume / baseline) * 100;

    // Check for baseline exceedance
    if (newFatigue > BASELINE_EXCEEDANCE_THRESHOLD) {
      warnings.push({
        muscle: muscleName,
        currentFatigue: currentFatigue[muscleName] || 0,
        newFatigue: newFatigue,
        overage: newFatigue - BASELINE_EXCEEDANCE_THRESHOLD,
        severity: 'critical'
      });
    }
    // Check for bottleneck warning
    else if (newFatigue > BOTTLENECK_WARNING_THRESHOLD) {
      warnings.push({
        muscle: muscleName,
        currentFatigue: currentFatigue[muscleName] || 0,
        newFatigue: newFatigue,
        overage: newFatigue - BOTTLENECK_WARNING_THRESHOLD,
        severity: 'warning'
      });
    }
  });

  const isSafe = warnings.filter(w => w.severity === 'critical').length === 0;

  return {
    isSafe,
    warnings: warnings,
    hasCriticalWarnings: warnings.some(w => w.severity === 'critical'),
    hasWarnings: warnings.length > 0
  };
}

/**
 * Score an exercise using 5-factor algorithm
 *
 * @param {Object} exercise - Exercise to score
 * @param {string} targetMuscle - Target muscle group
 * @param {Object} currentFatigue - Current fatigue state per muscle
 * @param {Array} currentWorkout - Exercises already in workout
 * @param {Array} preferExercises - Exercise IDs user prefers
 * @returns {number} Score from 0-100
 */
function scoreExercise(exercise, targetMuscle, currentFatigue, currentWorkout = [], preferExercises = []) {
  let score = 0;

  // Factor 1: Target Muscle Match (40% weight)
  const targetEngagement = exercise.muscles.find(m => m.muscle === targetMuscle);
  if (targetEngagement) {
    const engagementScore = (targetEngagement.percentage / 100) * SCORING_WEIGHTS.targetMatch;
    score += engagementScore;
  }

  // Factor 2: Muscle Freshness (25% weight)
  // Calculate weighted average fatigue of all muscles involved
  let totalWeightedFatigue = 0;
  let totalEngagement = 0;

  exercise.muscles.forEach(muscleData => {
    const muscleFatigue = currentFatigue[muscleData.muscle] || 0;
    totalWeightedFatigue += muscleFatigue * (muscleData.percentage / 100);
    totalEngagement += muscleData.percentage / 100;
  });

  const avgWeightedFatigue = totalEngagement > 0 ? totalWeightedFatigue / totalEngagement : 0;
  const freshnessScore = Math.max(0, 100 - avgWeightedFatigue) / 100;
  score += freshnessScore * SCORING_WEIGHTS.muscleFreshness;

  // Factor 3: Movement Variety (15% weight)
  const movementPattern = exercise.category;
  const samePatternCount = currentWorkout.filter(ex => {
    const exData = exercises.find(e => e.id === ex.exerciseId);
    return exData && exData.category === movementPattern;
  }).length;

  // Diminishing returns after 3 of same pattern
  const varietyScore = Math.max(0, 1 - (samePatternCount / 5));
  score += varietyScore * SCORING_WEIGHTS.variety;

  // Factor 4: User Preference (10% weight)
  if (preferExercises.includes(exercise.id)) {
    score += SCORING_WEIGHTS.userPreference;
  }

  // Factor 5: Primary vs Secondary Balance (10% weight)
  if (targetEngagement && targetEngagement.primary) {
    score += SCORING_WEIGHTS.primaryBalance; // Full points for primary
  } else if (targetEngagement) {
    score += SCORING_WEIGHTS.primaryBalance * 0.5; // Half points for secondary
  }

  return Math.round(score * 10) / 10; // Round to 1 decimal
}

/**
 * Estimate weight for an exercise based on user history or defaults
 *
 * @param {Object} exercise - Exercise to estimate for
 * @param {Array} userHistory - Past workout data (optional)
 * @returns {number} Estimated weight
 */
function estimateWeight(exercise, userHistory = []) {
  // If user has history with this exercise, use average weight
  const pastSets = userHistory
    .flatMap(w => w.exercises || [])
    .filter(e => e.exerciseId === exercise.id)
    .flatMap(e => e.sets || []);

  if (pastSets.length > 0) {
    const avgWeight = pastSets.reduce((sum, set) => sum + (set.weight || 0), 0) / pastSets.length;
    return Math.round(avgWeight);
  }

  // Default estimates by equipment type
  const defaults = {
    barbell: 135,
    dumbbell: 50,
    kettlebell: 35,
    'cable-machine': 80,
    'smith-machine': 95,
    bodyweight: 180, // Average body weight
    trx: 180,
    'resistance-band': 20,
    'pull-up-bar': 180
  };

  return defaults[exercise.equipment] || 100;
}

/**
 * Get exercise recommendations for a target muscle
 *
 * @param {Object} params - Recommendation parameters
 * @param {string} params.targetMuscle - Which muscle to target
 * @param {Array} params.currentWorkout - Exercises already in workout
 * @param {Object} params.currentFatigue - Current muscle fatigue state
 * @param {Object} params.currentMuscleVolumes - Current volume per muscle
 * @param {Object} params.baselines - Baseline capacity per muscle
 * @param {Array} params.availableEquipment - Equipment user has (optional)
 * @param {Array} params.userHistory - Past workouts for weight estimation (optional)
 * @param {Object} params.userPreferences - User preferences (optional)
 * @returns {Object} Recommendation results
 */
function recommendExercises(params) {
  const {
    targetMuscle,
    currentWorkout = [],
    currentFatigue = {},
    currentMuscleVolumes = {},
    baselines = {},
    availableEquipment = [],
    userHistory = [],
    userPreferences = {}
  } = params;

  const avoidExercises = userPreferences.avoidExercises || [];
  const preferExercises = userPreferences.preferExercises || [];

  // Step 1: Filter eligible exercises
  const eligibleExercises = filterEligibleExercises(
    targetMuscle,
    availableEquipment,
    currentWorkout,
    avoidExercises
  );

  // Step 2: Score and check safety for each exercise
  const scoredExercises = eligibleExercises.map(exercise => {
    // Estimate weight for bottleneck check
    const estimatedWeight = estimateWeight(exercise, userHistory);

    // Check safety with estimated volume
    const safetyCheck = checkBottleneckSafety(
      exercise,
      currentFatigue,
      currentMuscleVolumes,
      baselines,
      3, // Default 3 sets
      10, // Default 10 reps
      estimatedWeight
    );

    // Calculate score
    const score = scoreExercise(
      exercise,
      targetMuscle,
      currentFatigue,
      currentWorkout,
      preferExercises
    );

    // Get target muscle engagement
    const targetEngagement = exercise.muscles.find(m => m.muscle === targetMuscle);

    return {
      exerciseId: exercise.id,
      name: exercise.name,
      equipment: exercise.equipment,
      category: exercise.category,
      score: score,
      isSafe: safetyCheck.isSafe,
      warnings: safetyCheck.warnings,
      estimatedWeight: estimatedWeight,
      estimatedSets: 3,
      estimatedReps: 10,
      targetEngagement: targetEngagement ? targetEngagement.percentage : 0,
      isPrimary: targetEngagement ? targetEngagement.primary : false,
      muscles: exercise.muscles
    };
  });

  // Step 3: Sort by score (descending)
  const sortedExercises = scoredExercises.sort((a, b) => b.score - a.score);

  // Step 4: Separate safe vs unsafe
  const safeRecommendations = sortedExercises.filter(ex => ex.isSafe);
  const unsafeRecommendations = sortedExercises.filter(ex => !ex.isSafe);

  return {
    targetMuscle,
    recommended: safeRecommendations.slice(0, 10), // Top 10 safe options
    notRecommended: unsafeRecommendations,
    totalEligible: eligibleExercises.length,
    totalSafe: safeRecommendations.length,
    totalUnsafe: unsafeRecommendations.length
  };
}

/**
 * Get all exercises (for reference)
 * @returns {Array} All exercises
 */
function getAllExercises() {
  return exercises;
}

/**
 * Get exercise by ID
 * @param {string} exerciseId - Exercise ID
 * @returns {Object|null} Exercise or null if not found
 */
function getExerciseById(exerciseId) {
  return exercises.find(ex => ex.id === exerciseId) || null;
}

module.exports = {
  recommendExercises,
  scoreExercise,
  filterEligibleExercises,
  checkBottleneckSafety,
  estimateWeight,
  getAllExercises,
  getExerciseById,
  // Export constants for testing
  SCORING_WEIGHTS,
  MIN_ENGAGEMENT_THRESHOLD,
  BOTTLENECK_WARNING_THRESHOLD,
  BASELINE_EXCEEDANCE_THRESHOLD
};

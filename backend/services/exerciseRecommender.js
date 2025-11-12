/**
 * Exercise Recommendation Service
 *
 * Scores and ranks exercises based on 5-factor algorithm for intelligent recommendations.
 * Algorithm ported from: docs/logic-sandbox/workout-builder-recommendations.md
 *
 * 5-Factor Scoring System:
 * - Target Muscle Match (40%): Higher score if exercise works the target muscle
 * - Muscle Freshness (25%): Higher score if supporting muscles are recovered
 * - Variety (15%): Higher score for exercises not recently performed
 * - User Preference (10%): Higher score for user's favorite exercises
 * - Primary/Secondary Balance (10%): Prefer exercises where target is primary
 *
 * Safety Features:
 * - Bottleneck detection: Filters exercises that would over-fatigue supporting muscles
 * - Equipment filtering: Only shows exercises user has equipment for
 * - Ranking and separation: Returns safe vs unsafe recommendations
 *
 * @module exerciseRecommender
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load exercise library from validated JSON source
let exerciseLibraryCache = null;
let baselineDataCache = null;

/**
 * Load exercise library from docs/logic-sandbox/exercises.json
 *
 * @returns {Array<Object>} Array of 48 validated exercises
 * @throws {Error} If exercise library cannot be loaded
 */
function loadExerciseLibrary() {
  if (exerciseLibraryCache) {
    return exerciseLibraryCache;
  }

  try {
    const exercisePath = join(__dirname, '../../docs/logic-sandbox/exercises.json');
    const exerciseData = JSON.parse(readFileSync(exercisePath, 'utf8'));
    exerciseLibraryCache = exerciseData.exercises;
    return exerciseLibraryCache;
  } catch (error) {
    throw new Error(`Failed to load exercise library: ${error.message}`);
  }
}

/**
 * Load baseline data from docs/logic-sandbox/baselines.json
 *
 * @returns {Array<Object>} Array of muscle baseline capacities
 * @throws {Error} If baseline data cannot be loaded
 */
function loadBaselineData() {
  if (baselineDataCache) {
    return baselineDataCache;
  }

  try {
    const baselinePath = join(__dirname, '../../docs/logic-sandbox/baselines.json');
    const baselineData = JSON.parse(readFileSync(baselinePath, 'utf8'));
    baselineDataCache = baselineData.baselines;
    return baselineDataCache;
  } catch (error) {
    throw new Error(`Failed to load baseline data: ${error.message}`);
  }
}

// Muscle name mapping: Exercise data format → Baseline data format
const MUSCLE_NAME_MAP = {
  'Deltoids (Anterior)': 'AnteriorDeltoids',
  'Deltoids (Posterior)': 'PosteriorDeltoids',
  'Latissimus Dorsi': 'Lats',
  'Erector Spinae': 'LowerBack',
  'Rectus Abdominis': 'Core',
  'Obliques': 'Core'
};

/**
 * Get baseline capacity for a muscle by name
 *
 * Maps muscle names from exercise format to baseline format and looks up capacity
 *
 * @param {string} muscleName - Muscle name from exercise data
 * @returns {number|null} Baseline capacity or null if not found
 */
function getBaselineCapacity(muscleName) {
  const baselines = loadBaselineData();
  const mappedName = MUSCLE_NAME_MAP[muscleName] || muscleName;
  const baseline = baselines.find(b => b.muscle === mappedName);
  return baseline ? baseline.baselineCapacity : null;
}

const exercises = loadExerciseLibrary();

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
 * Filters out exercises that:
 * - Require unavailable equipment
 * - Don't target the desired muscle (< 5% engagement)
 * - Are in user's avoid list
 *
 * @param {Array<Object>} exercises - All available exercises
 * @param {string} targetMuscle - Target muscle group name
 * @param {Object} options - Filtering options
 * @returns {Array<Object>} Filtered exercises
 */
function filterEligibleExercises(exercises, targetMuscle, options = {}) {
  const { availableEquipment, userPreferences } = options;

  return exercises.filter(exercise => {
    // Equipment check - if specified, must match
    if (availableEquipment && availableEquipment.length > 0) {
      if (!availableEquipment.includes(exercise.equipment)) {
        return false;
      }
    }

    // User avoidance check
    if (userPreferences?.avoid?.includes(exercise.id)) {
      return false;
    }

    // Target muscle engagement check (must be > 5%)
    const targetEngagement = exercise.muscles.find(m => m.muscle === targetMuscle);
    if (!targetEngagement || targetEngagement.percentage < MIN_ENGAGEMENT_THRESHOLD) {
      return false;
    }

    return true;
  });
}

/**
 * Check if exercise would create bottleneck (over-fatigued supporting muscles)
 *
 * Volume-based calculation: Estimates total volume and projects fatigue for each muscle
 * Flags unsafe if any muscle would exceed 100% of baseline capacity
 *
 * @param {Object} exercise - Exercise to check
 * @param {Array<Object>} muscleStates - Current muscle fatigue states
 * @param {number} estimatedSets - Estimated sets for this exercise (default: 3)
 * @param {number} estimatedReps - Estimated reps per set (default: 10)
 * @param {number} estimatedWeight - Estimated weight in lbs (default: 100)
 * @returns {Object} Safety check result with warnings
 * @returns {boolean} returns.isSafe - True if no bottleneck detected
 * @returns {Array<Object>} returns.warnings - Array of warning objects for unsafe muscles
 */
function checkBottleneckSafety(exercise, muscleStates, estimatedSets = 3, estimatedReps = 10, estimatedWeight = 100) {
  const warnings = [];

  // Calculate total estimated volume for this exercise
  const totalVolume = estimatedSets * estimatedReps * estimatedWeight;

  exercise.muscles.forEach(muscleData => {
    // Find current fatigue for this muscle
    const muscleState = muscleStates.find(s => s.muscle === muscleData.muscle);
    const currentFatigue = muscleState?.currentFatigue || muscleState?.fatiguePercent || 0;

    // Get baseline capacity for this muscle
    const baseline = getBaselineCapacity(muscleData.muscle);

    if (!baseline) {
      // If baseline not found, skip this muscle (defensive coding)
      return;
    }

    // Calculate volume added to this muscle based on engagement percentage
    const addedVolume = totalVolume * (muscleData.percentage / 100);

    // Calculate current volume from fatigue percentage
    const currentVolume = (currentFatigue / 100) * baseline;

    // Project new fatigue after adding this exercise
    const projectedFatigue = ((currentVolume + addedVolume) / baseline) * 100;

    // Flag unsafe if projected fatigue would exceed 100%
    if (projectedFatigue > 100) {
      const overage = projectedFatigue - 100;
      warnings.push({
        muscle: muscleData.muscle,
        currentFatigue: currentFatigue,
        projectedFatigue: projectedFatigue,
        overage: overage,
        engagement: muscleData.percentage,
        addedVolume: addedVolume,
        baseline: baseline,
        message: `${muscleData.muscle} would reach ${projectedFatigue.toFixed(1)}% fatigue (exceeds baseline by ${overage.toFixed(1)}%)`
      });
    }
  });

  return {
    isSafe: warnings.length === 0,
    warnings: warnings
  };
}

/**
 * Calculate weighted average fatigue for all muscles in an exercise
 *
 * Weights each muscle's fatigue by its engagement percentage in the exercise
 *
 * @param {Object} exercise - Exercise object with muscles array
 * @param {Array<Object>} muscleStates - Current muscle fatigue states
 * @returns {number} Weighted average fatigue percentage
 */
function calculateWeightedFatigue(exercise, muscleStates) {
  let totalWeightedFatigue = 0;
  let totalWeight = 0;

  exercise.muscles.forEach(muscleData => {
    // Find current fatigue for this muscle
    const muscleState = muscleStates.find(s => s.muscle === muscleData.muscle);
    const currentFatigue = muscleState?.currentFatigue || muscleState?.fatiguePercent || 0;

    // Weight fatigue by muscle engagement percentage
    totalWeightedFatigue += currentFatigue * (muscleData.percentage / 100);
    totalWeight += muscleData.percentage / 100;
  });

  // Return weighted average
  return totalWeight > 0 ? totalWeightedFatigue / totalWeight : 0;
}

/**
 * Count similar movement patterns in workout history
 *
 * Compares exercise category to count repetition of same movement type
 *
 * @param {Object} exercise - Exercise to check
 * @param {Array<string>} workoutHistory - Recent exercise names/IDs
 * @param {Array<Object>} allExercises - Full exercise library for lookups
 * @returns {number} Count of similar patterns in history
 */
function countSimilarPatterns(exercise, workoutHistory, allExercises) {
  if (!workoutHistory || workoutHistory.length === 0) {
    return 0;
  }

  const exerciseCategory = exercise.category;
  let count = 0;

  workoutHistory.forEach(historyItem => {
    // Find exercise in library by ID or name
    const historyExercise = allExercises.find(
      ex => ex.id === historyItem || ex.name === historyItem
    );

    if (historyExercise && historyExercise.category === exerciseCategory) {
      count++;
    }
  });

  return count;
}

/**
 * Calculate factor breakdown for transparency
 *
 * Returns individual scores for each of the 5 factors
 *
 * @param {Object} exercise - Exercise being scored
 * @param {string} targetMuscle - Target muscle group
 * @param {Array<Object>} muscleStates - Current muscle states
 * @param {Object} options - Scoring options
 * @param {Array<Object>} allExercises - Full exercise library
 * @returns {Object} Breakdown of scores by factor
 */
function calculateFactorBreakdown(exercise, targetMuscle, muscleStates, options, allExercises) {
  const targetEngagement = exercise.muscles.find(m => m.muscle === targetMuscle);

  // Factor 1: Target Muscle Match (40%)
  const targetMatchScore = (targetEngagement.percentage / 100) * 40;

  // Factor 2: Muscle Freshness (25%)
  const weightedAvgFatigue = calculateWeightedFatigue(exercise, muscleStates);
  const freshnessScore = ((100 - weightedAvgFatigue) / 100) * 25;

  // Factor 3: Variety (15%)
  const samePatternCount = countSimilarPatterns(exercise, options.workoutHistory, allExercises);
  const varietyScore = Math.max(0, 1 - (samePatternCount / 5)) * 15;

  // Factor 4: User Preference (10%)
  const preferenceScore = options.userPreferences?.favorites?.includes(exercise.id) ? 10 : 0;

  // Factor 5: Primary/Secondary (10%)
  const primaryScore = targetEngagement.primary ? 10 : 5;

  return {
    targetMatch: targetMatchScore,
    freshness: freshnessScore,
    variety: varietyScore,
    preference: preferenceScore,
    primary: primaryScore,
    total: targetMatchScore + freshnessScore + varietyScore + preferenceScore + primaryScore
  };
}

/**
 * Score a single exercise using 5-factor algorithm
 *
 * @param {Object} exercise - Exercise to score
 * @param {string} targetMuscle - Target muscle group
 * @param {Array<Object>} muscleStates - Current muscle states
 * @param {Object} options - Scoring options
 * @param {Array<Object>} allExercises - Full exercise library
 * @returns {number} Total score (0-100)
 */
function scoreExercise(exercise, targetMuscle, muscleStates, options, allExercises) {
  const factors = calculateFactorBreakdown(exercise, targetMuscle, muscleStates, options, allExercises);
  return factors.total;
}

/**
 * Recommend exercises based on 5-factor scoring algorithm
 *
 * Scoring Factors:
 * - Target Muscle Match (40%): Higher engagement = higher score
 * - Muscle Freshness (25%): Fresh muscles preferred over fatigued
 * - Variety (15%): Penalize repeated movement patterns
 * - User Preference (10%): Bonus for favorite exercises
 * - Primary/Secondary (10%): Primary engagement preferred
 *
 * @param {string} targetMuscle - Muscle group to target
 * @param {Array<Object>} muscleStates - Current recovery states from recovery calculator
 * @param {Object} options - Additional parameters
 * @param {Array<string>} options.availableEquipment - Equipment user has access to
 * @param {Array<string>} options.workoutHistory - Recent exercises for variety calculation
 * @param {Object} options.userPreferences - User's favorite/avoided exercises
 * @param {Array<string>} options.userPreferences.favorites - Favorite exercise IDs
 * @param {Array<string>} options.userPreferences.avoid - Avoided exercise IDs
 * @param {number} options.estimatedSets - Estimated sets for bottleneck calculation (default: 3)
 * @param {number} options.estimatedReps - Estimated reps for bottleneck calculation (default: 10)
 * @param {number} options.estimatedWeight - Estimated weight in lbs for bottleneck calculation (default: 100)
 * @returns {Object} Ranked recommendations with scores and warnings
 * @returns {Array<Object>} returns.safe - Safe recommendations (sorted by score)
 * @returns {Array<Object>} returns.unsafe - Unsafe recommendations (bottleneck warnings)
 * @returns {number} returns.totalFiltered - Total exercises filtered before scoring
 * @throws {Error} If inputs are invalid
 *
 * @example
 * const recommendations = recommendExercises("Quadriceps", muscleStates, {
 *   availableEquipment: ["dumbbell", "bodyweight"],
 *   workoutHistory: ["Bulgarian Split Squats", "Leg Press"],
 *   userPreferences: { favorites: ["ex12"], avoid: [] },
 *   estimatedSets: 3,
 *   estimatedReps: 10,
 *   estimatedWeight: 100
 * });
 * // Returns: {
 * //   safe: [{ exercise, score, factors, warnings }],
 * //   unsafe: [...],
 * //   totalFiltered: 48
 * // }
 *
 * Source: docs/logic-sandbox/workout-builder-recommendations.md
 */
export function recommendExercises(targetMuscle, muscleStates, options = {}) {
  // Input validation
  if (!targetMuscle || typeof targetMuscle !== 'string') {
    throw new Error('Target muscle is required and must be a string');
  }

  if (!muscleStates || !Array.isArray(muscleStates)) {
    throw new Error('Muscle states array is required');
  }

  // Validate muscle states structure
  muscleStates.forEach((state, index) => {
    if (!state.muscle) {
      throw new Error(`Muscle state at index ${index} must have a muscle name`);
    }
    if (typeof state.currentFatigue !== 'number' && typeof state.fatiguePercent !== 'number') {
      throw new Error(`Muscle state at index ${index} must have currentFatigue or fatiguePercent`);
    }
  });

  // Validate equipment array if provided
  if (options.availableEquipment && !Array.isArray(options.availableEquipment)) {
    throw new Error('availableEquipment must be an array');
  }

  // Extract volume parameters with defaults
  const {
    estimatedSets = 3,
    estimatedReps = 10,
    estimatedWeight = 100
  } = options;

  // Step 1: Filter eligible exercises
  const eligible = filterEligibleExercises(exercises, targetMuscle, options);

  // Step 2 & 3: Check safety and score
  const scored = eligible.map(exercise => {
    const safetyCheck = checkBottleneckSafety(exercise, muscleStates, estimatedSets, estimatedReps, estimatedWeight);
    const score = safetyCheck.isSafe ? scoreExercise(exercise, targetMuscle, muscleStates, options, exercises) : 0;
    const factors = calculateFactorBreakdown(exercise, targetMuscle, muscleStates, options, exercises);

    return {
      exercise: exercise,
      score: score,
      isSafe: safetyCheck.isSafe,
      warnings: safetyCheck.warnings,
      factors: factors
    };
  });

  // Step 4: Sort by score (descending)
  const sorted = scored.sort((a, b) => b.score - a.score);

  // Separate safe vs unsafe
  const safe = sorted.filter(ex => ex.isSafe).slice(0, 15);
  const unsafe = sorted.filter(ex => !ex.isSafe);

  return {
    safe: safe,
    unsafe: unsafe,
    totalFiltered: eligible.length
  };
}

/**
 * Calculate muscle-specific fatigue from workout data using validated algorithm
 *
 * Algorithm ported from: docs/logic-sandbox/scripts/calculate-workout-fatigue.mjs
 *
 * @param {Object} workout - Workout object with exercises array
 * @param {Array<Object>} workout.exercises - Array of workout exercises
 * @param {string} workout.exercises[].exerciseId - ID matching exercise library
 * @param {number} [workout.exercises[].totalVolume] - Pre-calculated volume (reps × weight)
 * @param {Array<Object>} [workout.exercises[].sets] - Array of sets if totalVolume not provided
 * @param {number} workout.exercises[].sets[].weight - Weight in lbs
 * @param {number} workout.exercises[].sets[].reps - Number of repetitions
 *
 * @param {Array|Object} exercises - Exercise library with muscle engagement percentages
 *   Can be array of exercises or object with { exercises: [...] } property
 * @param {string} exercises[].id - Exercise identifier
 * @param {Array<Object>} exercises[].muscles - Array of muscle engagement data
 * @param {string} exercises[].muscles[].muscle - Muscle group name
 * @param {number} exercises[].muscles[].percentage - Engagement percentage (0-100)
 *
 * @param {Object} baselines - Muscle baseline capacities (target volume per workout)
 *   Example: { "Quadriceps": 2880, "Hamstrings": 2880, "Glutes": 2880, ... }
 *
 * @returns {Object} Fatigue calculation results
 * @returns {Array<Object>} returns.muscleStates - Fatigue data for all 15 muscle groups
 * @returns {string} returns.muscleStates[].muscle - Muscle group name
 * @returns {number} returns.muscleStates[].volume - Total volume for this muscle (lbs)
 * @returns {number} returns.muscleStates[].baseline - Baseline capacity for this muscle (lbs)
 * @returns {number} returns.muscleStates[].fatiguePercent - Actual fatigue percentage (can exceed 100%)
 * @returns {number} returns.muscleStates[].displayFatigue - Display fatigue (capped at 100%)
 * @returns {boolean} returns.muscleStates[].exceededBaseline - True if fatiguePercent > 100%
 * @returns {Array<string>} returns.warnings - Warning messages for muscles >80% or >100%
 * @returns {string} returns.timestamp - ISO 8601 timestamp of calculation
 *
 * @throws {Error} If workout, exercises, or baselines are missing or invalid
 * @throws {Error} If any baseline value is zero
 *
 * @example
 * const workout = {
 *   exercises: [
 *     { exerciseId: 'ex02', totalVolume: 2000 }
 *   ]
 * };
 * const result = calculateMuscleFatigue(workout, exerciseLibrary, baselines);
 * // result.muscleStates will contain all 15 muscle groups
 * // result.warnings will list any muscles approaching/exceeding capacity
 */
function calculateMuscleFatigue(workout, exercises, baselines) {
  // Input validation
  if (!workout) {
    throw new Error('Workout is required');
  }
  if (!workout.exercises || !Array.isArray(workout.exercises)) {
    throw new Error('Workout must contain an exercises array');
  }
  if (workout.exercises.length === 0) {
    throw new Error('Workout exercises array cannot be empty');
  }
  if (!exercises) {
    throw new Error('Exercise library is required');
  }
  if (!baselines || typeof baselines !== 'object') {
    throw new Error('Baselines are required and must be an object');
  }

  // Build exercise lookup map
  const exerciseMap = {};
  if (Array.isArray(exercises)) {
    exercises.forEach(ex => {
      exerciseMap[ex.id] = ex;
    });
  } else if (exercises.exercises && Array.isArray(exercises.exercises)) {
    exercises.exercises.forEach(ex => {
      exerciseMap[ex.id] = ex;
    });
  } else {
    throw new Error('Exercise library must be an array or object with exercises property');
  }

  // Track muscle volumes (accumulate across all exercises)
  const muscleVolumes = {};

  // Process each exercise in the workout
  workout.exercises.forEach((workoutEx) => {
    const exerciseData = exerciseMap[workoutEx.exerciseId];

    if (!exerciseData) {
      console.warn(`Warning: Exercise ${workoutEx.exerciseId} not found in exercise library`);
      return;
    }

    if (!exerciseData.muscles || !Array.isArray(exerciseData.muscles)) {
      console.warn(`Warning: Exercise ${workoutEx.exerciseId} has no muscle engagement data`);
      return;
    }

    // Calculate total volume for this exercise
    let totalVolume = 0;
    if (workoutEx.totalVolume !== undefined) {
      totalVolume = workoutEx.totalVolume;
    } else if (workoutEx.sets && Array.isArray(workoutEx.sets)) {
      totalVolume = workoutEx.sets.reduce((sum, set) => {
        return sum + (set.weight * set.reps);
      }, 0);
    } else {
      console.warn(`Warning: Exercise ${workoutEx.exerciseId} has no totalVolume or sets data`);
      return;
    }

    // Distribute volume across muscles according to engagement percentages
    exerciseData.muscles.forEach(muscle => {
      const muscleVolume = totalVolume * (muscle.percentage / 100);

      if (!muscleVolumes[muscle.muscle]) {
        muscleVolumes[muscle.muscle] = 0;
      }
      muscleVolumes[muscle.muscle] += muscleVolume;
    });
  });

  // Calculate fatigue percentages for each muscle
  const muscleStates = [];
  const warnings = [];

  Object.keys(muscleVolumes).sort().forEach(muscle => {
    const volume = muscleVolumes[muscle];
    const baseline = baselines[muscle];

    if (baseline === undefined || baseline === null) {
      console.warn(`Warning: No baseline found for muscle ${muscle}`);
      return;
    }

    if (baseline === 0) {
      throw new Error(`Invalid baseline: ${muscle} baseline cannot be zero`);
    }

    // Calculate fatigue percentage: (totalMuscleVolume / baseline) × 100
    const fatiguePercent = (volume / baseline) * 100;
    const displayFatigue = Math.min(100, fatiguePercent);
    const exceededBaseline = fatiguePercent > 100;

    muscleStates.push({
      muscle,
      volume: parseFloat(volume.toFixed(1)),
      baseline,
      fatiguePercent: parseFloat(fatiguePercent.toFixed(1)),
      displayFatigue: parseFloat(displayFatigue.toFixed(1)),
      exceededBaseline
    });

    // Generate warnings for muscles approaching or exceeding capacity
    if (exceededBaseline) {
      warnings.push(`${muscle}: EXCEEDED baseline by ${(fatiguePercent - 100).toFixed(1)}% (${volume.toFixed(0)}/${baseline} lbs)`);
    } else if (fatiguePercent > 80) {
      warnings.push(`${muscle}: Approaching capacity at ${fatiguePercent.toFixed(1)}%`);
    }
  });

  // Ensure all muscles from baselines are included (even with 0 fatigue)
  // This satisfies AC3: "returns fatigue data for all 15 muscle groups"
  Object.keys(baselines).forEach(muscle => {
    if (!muscleStates.find(m => m.muscle === muscle)) {
      muscleStates.push({
        muscle,
        volume: 0,
        baseline: baselines[muscle],
        fatiguePercent: 0,
        displayFatigue: 0,
        exceededBaseline: false
      });
    }
  });

  // Sort muscle states alphabetically for consistent ordering
  muscleStates.sort((a, b) => a.muscle.localeCompare(b.muscle));

  return {
    muscleStates,
    warnings,
    timestamp: new Date().toISOString()
  };
}

export { calculateMuscleFatigue };

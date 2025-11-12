/**
 * Recovery Calculation Service
 *
 * Calculates current recovery state for muscles using linear recovery model.
 * Algorithm ported from: docs/logic-sandbox/scripts/calculate-recovery.mjs
 *
 * Linear Recovery Model:
 * - Recovery rate: 15% of fatigue per 24 hours
 * - Formula: currentFatigue = max(0, initialFatigue - (hoursElapsed / 24) × 15%)
 * - Projections: Calculate future recovery states at 24h, 48h, 72h intervals
 * - Full recovery: Timestamp when muscle reaches 0% fatigue
 *
 * @module recoveryCalculator
 */

/**
 * Calculate hours elapsed between two ISO 8601 timestamps
 *
 * @param {string} startTime - Start timestamp (ISO 8601 format)
 * @param {string} endTime - End timestamp (ISO 8601 format)
 * @returns {number} Hours elapsed between timestamps
 * @throws {Error} If timestamps are invalid or missing
 *
 * @example
 * const hours = calculateHoursElapsed('2025-11-10T08:00:00Z', '2025-11-11T08:00:00Z');
 * // Returns: 24
 */
function calculateHoursElapsed(startTime, endTime) {
  if (!startTime || typeof startTime !== 'string') {
    throw new Error('Start time is required and must be a string');
  }
  if (!endTime || typeof endTime !== 'string') {
    throw new Error('End time is required and must be a string');
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Validate that dates are valid
  if (isNaN(start.getTime())) {
    throw new Error(`Invalid start time format: ${startTime}`);
  }
  if (isNaN(end.getTime())) {
    throw new Error(`Invalid end time format: ${endTime}`);
  }

  // Calculate hours elapsed
  const milliseconds = end - start;
  const hours = milliseconds / (1000 * 60 * 60);

  return hours;
}

/**
 * Calculate timestamp when muscle will be fully recovered (0% fatigue)
 *
 * Uses linear recovery model: 15% recovery per 24 hours
 *
 * @param {number} currentFatigue - Current fatigue percentage
 * @param {string} currentTime - Current timestamp (ISO 8601 format)
 * @returns {string|null} ISO 8601 timestamp when fully recovered, or null if already recovered
 *
 * @example
 * const recoveryTime = calculateFullRecoveryTime(45, '2025-11-11T08:00:00Z');
 * // Returns: '2025-11-14T08:00:00.000Z' (3 days later)
 */
function calculateFullRecoveryTime(currentFatigue, currentTime) {
  // If already recovered, return null
  if (currentFatigue <= 0) {
    return null;
  }

  // Calculate hours until full recovery
  // Formula: hoursUntilRecovery = (currentFatigue / 15) × 24
  // Because we recover 15% per 24 hours
  const hoursUntilRecovery = (currentFatigue / 15) * 24;

  // Add hours to current time
  const recoveryTime = new Date(currentTime);
  recoveryTime.setTime(recoveryTime.getTime() + hoursUntilRecovery * 60 * 60 * 1000);

  return recoveryTime.toISOString();
}

/**
 * Calculate recovery state for a single muscle
 *
 * @param {Object} muscleState - Muscle state from fatigue calculation
 * @param {string} muscleState.muscle - Muscle group name
 * @param {number} muscleState.fatiguePercent - Initial fatigue percentage
 * @param {string} workoutTimestamp - Workout completion timestamp (ISO 8601)
 * @param {string} currentTime - Current timestamp for recovery calculation (ISO 8601)
 * @returns {Object} Recovery state for this muscle
 * @returns {string} returns.muscle - Muscle group name
 * @returns {number} returns.currentFatigue - Current fatigue percentage
 * @returns {Object} returns.projections - Future recovery projections
 * @returns {number} returns.projections.24h - Fatigue at 24h from now
 * @returns {number} returns.projections.48h - Fatigue at 48h from now
 * @returns {number} returns.projections.72h - Fatigue at 72h from now
 * @returns {string|null} returns.fullyRecoveredAt - ISO 8601 timestamp when fully recovered
 */
function calculateMuscleRecovery(muscleState, workoutTimestamp, currentTime) {
  // Calculate hours elapsed since workout
  const hoursElapsed = calculateHoursElapsed(workoutTimestamp, currentTime);

  // Apply linear recovery model: recoveredPercentage = (hoursElapsed / 24) × 15%
  const recoveredPercentage = (hoursElapsed / 24) * 15;

  // Calculate current fatigue: max(0, initialFatigue - recoveredPercentage)
  const currentFatigue = Math.max(0, muscleState.fatiguePercent - recoveredPercentage);

  // Calculate projections (relative to current time, not workout time)
  const projections = {
    '24h': Math.max(0, currentFatigue - 15), // 1 day from now
    '48h': Math.max(0, currentFatigue - 30), // 2 days from now
    '72h': Math.max(0, currentFatigue - 45)  // 3 days from now
  };

  // Calculate when muscle will be fully recovered
  const fullyRecoveredAt = calculateFullRecoveryTime(currentFatigue, currentTime);

  return {
    muscle: muscleState.muscle,
    currentFatigue: parseFloat(currentFatigue.toFixed(1)),
    projections: {
      '24h': parseFloat(projections['24h'].toFixed(1)),
      '48h': parseFloat(projections['48h'].toFixed(1)),
      '72h': parseFloat(projections['72h'].toFixed(1))
    },
    fullyRecoveredAt
  };
}

/**
 * Calculate current recovery state for all muscles based on linear recovery model
 *
 * Linear Recovery Model:
 * - Recovery rate: 15% of fatigue per 24 hours
 * - Formula: currentFatigue = max(0, initialFatigue - (hoursElapsed / 24) × 15%)
 *
 * @param {Array<Object>} muscleStates - Muscle states from fatigue calculation
 * @param {string} muscleStates[].muscle - Muscle group name
 * @param {number} muscleStates[].fatiguePercent - Initial fatigue percentage
 * @param {string} workoutTimestamp - Workout completion timestamp (ISO 8601 format)
 * @param {string} currentTime - Current timestamp for recovery calculation (ISO 8601 format)
 *
 * @returns {Object} Recovery state with current fatigue and projections
 * @returns {Array<Object>} returns.muscleStates - Recovery states for all muscles
 * @returns {string} returns.muscleStates[].muscle - Muscle group name
 * @returns {number} returns.muscleStates[].currentFatigue - Current fatigue percentage
 * @returns {Object} returns.muscleStates[].projections - Future projections (24h, 48h, 72h)
 * @returns {string|null} returns.muscleStates[].fullyRecoveredAt - ISO 8601 timestamp when fully recovered
 * @returns {string} returns.timestamp - ISO 8601 timestamp of calculation
 *
 * @throws {Error} If muscleStates is not an array or is empty
 * @throws {Error} If workoutTimestamp or currentTime are invalid
 * @throws {Error} If any muscle state has negative fatigue
 *
 * @example
 * const muscleStates = [
 *   { muscle: "Quadriceps", fatiguePercent: 94.4 },
 *   { muscle: "Hamstrings", fatiguePercent: 113.1 }
 * ];
 * const recovery = calculateRecovery(
 *   muscleStates,
 *   "2025-11-10T08:00:00Z",
 *   "2025-11-11T08:00:00Z"
 * );
 * // Returns:
 * // {
 * //   muscleStates: [
 * //     {
 * //       muscle: "Quadriceps",
 * //       currentFatigue: 79.4,
 * //       projections: { "24h": 64.4, "48h": 49.4, "72h": 34.4 },
 * //       fullyRecoveredAt: "2025-11-16T08:00:00.000Z"
 * //     },
 * //     { ... }
 * //   ],
 * //   timestamp: "2025-11-11T08:00:00Z"
 * // }
 *
 * Source: docs/logic-sandbox/scripts/calculate-recovery.mjs
 */
function calculateRecovery(muscleStates, workoutTimestamp, currentTime) {
  // Input validation
  if (!muscleStates || !Array.isArray(muscleStates)) {
    throw new Error('Muscle states array is required');
  }

  if (muscleStates.length === 0) {
    throw new Error('Muscle states array cannot be empty');
  }

  if (!workoutTimestamp || typeof workoutTimestamp !== 'string') {
    throw new Error('Workout timestamp is required and must be a string');
  }

  if (!currentTime || typeof currentTime !== 'string') {
    throw new Error('Current time is required and must be a string');
  }

  // Validate muscle states structure
  muscleStates.forEach((state, index) => {
    if (!state.muscle || typeof state.muscle !== 'string') {
      throw new Error(`Muscle state at index ${index} must have a muscle name`);
    }

    if (state.fatiguePercent === undefined || state.fatiguePercent === null) {
      throw new Error(`Muscle state for ${state.muscle} must have a fatiguePercent value`);
    }

    if (typeof state.fatiguePercent !== 'number') {
      throw new Error(`Muscle state for ${state.muscle} fatiguePercent must be a number`);
    }

    if (state.fatiguePercent < 0) {
      throw new Error(`Muscle state for ${state.muscle} cannot have negative fatigue: ${state.fatiguePercent}`);
    }
  });

  // Calculate recovery for each muscle
  const recoveryStates = muscleStates.map(state => {
    return calculateMuscleRecovery(state, workoutTimestamp, currentTime);
  });

  return {
    muscleStates: recoveryStates,
    timestamp: currentTime
  };
}

export { calculateRecovery };

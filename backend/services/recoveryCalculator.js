/**
 * Recovery Calculation Service
 *
 * Calculates current recovery state for each muscle based on linear recovery model.
 * Formula: currentFatigue = max(0, initialFatigue - (daysElapsed × 15%))
 *
 * Ported from: logic-sandbox/scripts/calculate-recovery.mjs
 * Validated with: 15% daily recovery rate
 */

// Constants
const RECOVERY_RATE_PER_DAY = 0.15; // 15% per day
const READY_TO_TRAIN_THRESHOLD = 40; // <40% = ready to train
const CAUTION_THRESHOLD = 80; // 40-79% = caution, 80-100% = don't train

/**
 * Calculate current recovery state for a muscle
 *
 * @param {number} initialFatigue - Initial fatigue percentage (0-100+)
 * @param {Date} workoutTimestamp - When the workout occurred
 * @param {Date} currentTime - Current time (defaults to now)
 * @returns {Object} Recovery state
 */
function calculateRecovery(initialFatigue, workoutTimestamp, currentTime = new Date()) {
  // Calculate time elapsed
  const workoutTime = new Date(workoutTimestamp);
  const hoursElapsed = (currentTime - workoutTime) / (1000 * 60 * 60);
  const daysElapsed = hoursElapsed / 24;

  // Calculate recovery
  const recoveredPercentage = daysElapsed * (RECOVERY_RATE_PER_DAY * 100);
  const currentFatigue = Math.max(0, initialFatigue - recoveredPercentage);

  // Determine status
  let status = 'ready'; // <40%
  if (currentFatigue >= CAUTION_THRESHOLD) {
    status = 'dont_train'; // 80-100%
  } else if (currentFatigue >= READY_TO_TRAIN_THRESHOLD) {
    status = 'caution'; // 40-79%
  }

  return {
    initialFatigue,
    currentFatigue,
    hoursElapsed,
    daysElapsed,
    recoveredPercentage,
    status
  };
}

/**
 * Calculate recovery projections at specific intervals
 *
 * @param {number} initialFatigue - Initial fatigue percentage
 * @param {Date} workoutTimestamp - When the workout occurred
 * @returns {Object} Recovery projections at 24h, 48h, 72h
 */
function calculateRecoveryProjections(initialFatigue, workoutTimestamp) {
  const workoutTime = new Date(workoutTimestamp);

  // Project 24h, 48h, 72h into the future
  const projections = {
    '24h': calculateRecoveryAtTime(initialFatigue, workoutTime, 24),
    '48h': calculateRecoveryAtTime(initialFatigue, workoutTime, 48),
    '72h': calculateRecoveryAtTime(initialFatigue, workoutTime, 72)
  };

  return projections;
}

/**
 * Calculate recovery at a specific time offset (helper function)
 *
 * @param {number} initialFatigue - Initial fatigue percentage
 * @param {Date} workoutTime - When the workout occurred
 * @param {number} hoursOffset - Hours after workout
 * @returns {Object} Recovery state at that time
 */
function calculateRecoveryAtTime(initialFatigue, workoutTime, hoursOffset) {
  const futureTime = new Date(workoutTime.getTime() + (hoursOffset * 60 * 60 * 1000));
  return calculateRecovery(initialFatigue, workoutTime, futureTime);
}

/**
 * Calculate when a muscle will be fully recovered (0% fatigue)
 *
 * @param {number} initialFatigue - Initial fatigue percentage
 * @returns {Object} Time until full recovery
 */
function calculateFullRecoveryTime(initialFatigue) {
  if (initialFatigue <= 0) {
    return {
      daysNeeded: 0,
      hoursNeeded: 0,
      message: 'Already recovered'
    };
  }

  // Solve for: 0 = initialFatigue - (days × 15)
  // days = initialFatigue / 15
  const daysNeeded = initialFatigue / (RECOVERY_RATE_PER_DAY * 100);
  const hoursNeeded = daysNeeded * 24;

  return {
    daysNeeded,
    hoursNeeded,
    message: `${daysNeeded.toFixed(1)} days (${Math.ceil(hoursNeeded)} hours)`
  };
}

/**
 * Calculate when a muscle will be ready to train (<40% fatigue)
 *
 * @param {number} initialFatigue - Initial fatigue percentage
 * @returns {Object} Time until ready to train
 */
function calculateReadyToTrainTime(initialFatigue) {
  if (initialFatigue <= READY_TO_TRAIN_THRESHOLD) {
    return {
      daysNeeded: 0,
      hoursNeeded: 0,
      message: 'Already ready'
    };
  }

  // Solve for: 40 = initialFatigue - (days × 15)
  // days = (initialFatigue - 40) / 15
  const daysNeeded = (initialFatigue - READY_TO_TRAIN_THRESHOLD) / (RECOVERY_RATE_PER_DAY * 100);
  const hoursNeeded = daysNeeded * 24;

  return {
    daysNeeded,
    hoursNeeded,
    message: `${daysNeeded.toFixed(1)} days (${Math.ceil(hoursNeeded)} hours)`
  };
}

/**
 * Get recovery timeline for a muscle from workout completion
 *
 * @param {number} initialFatigue - Initial fatigue percentage
 * @param {Date} workoutTimestamp - When the workout occurred
 * @param {Date} currentTime - Current time (defaults to now)
 * @returns {Object} Complete recovery timeline
 */
function getRecoveryTimeline(initialFatigue, workoutTimestamp, currentTime = new Date()) {
  const current = calculateRecovery(initialFatigue, workoutTimestamp, currentTime);
  const projections = calculateRecoveryProjections(initialFatigue, workoutTimestamp);
  const fullRecovery = calculateFullRecoveryTime(current.currentFatigue);
  const readyToTrain = calculateReadyToTrainTime(current.currentFatigue);

  return {
    current,
    projections,
    fullRecoveryTime: fullRecovery,
    readyToTrainTime: readyToTrain
  };
}

module.exports = {
  calculateRecovery,
  calculateRecoveryProjections,
  calculateFullRecoveryTime,
  calculateReadyToTrainTime,
  getRecoveryTimeline,
  // Export constants for testing
  RECOVERY_RATE_PER_DAY,
  READY_TO_TRAIN_THRESHOLD,
  CAUTION_THRESHOLD
};

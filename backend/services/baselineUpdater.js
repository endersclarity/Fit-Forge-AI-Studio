/**
 * Baseline Update Service
 *
 * Detects when a user exceeds their muscle baseline capacity and suggests updates.
 * Triggered on workout completion to identify strength improvements.
 *
 * Simple comparison logic - no complex algorithms needed.
 */

/**
 * Check if baselines should be updated based on workout performance
 *
 * @param {Object} muscleVolumes - Actual volumes achieved per muscle
 * @param {Object} baselines - Current baseline capacities per muscle
 * @param {Date} workoutDate - When the workout occurred
 * @param {string} workoutId - ID of the workout (optional)
 * @returns {Object} Baseline update suggestions
 */
function checkBaselineUpdates(muscleVolumes, baselines, workoutDate = new Date(), workoutId = null) {
  const suggestions = [];
  const exceededMuscles = [];

  // Check each muscle that was worked
  Object.keys(muscleVolumes).forEach(muscle => {
    const volumeAchieved = muscleVolumes[muscle];
    const currentBaseline = baselines[muscle];

    if (!currentBaseline) {
      // No baseline exists - skip (this shouldn't happen in production)
      return;
    }

    // Check if volume exceeded baseline
    if (volumeAchieved > currentBaseline) {
      const exceedancePercent = ((volumeAchieved - currentBaseline) / currentBaseline) * 100;
      const suggestedBaseline = Math.ceil(volumeAchieved);

      suggestions.push({
        muscle,
        currentBaseline,
        volumeAchieved,
        suggestedBaseline,
        exceedancePercent,
        exceedanceAmount: volumeAchieved - currentBaseline,
        workoutDate: workoutDate.toISOString(),
        workoutId
      });

      exceededMuscles.push(muscle);
    }
  });

  return {
    hasUpdates: suggestions.length > 0,
    totalSuggestions: suggestions.length,
    suggestions: suggestions.sort((a, b) => b.exceedancePercent - a.exceedancePercent), // Sort by highest exceedance
    exceededMuscles,
    workoutDate: workoutDate.toISOString(),
    workoutId
  };
}

/**
 * Get baseline update message for user
 *
 * @param {Object} updateResult - Result from checkBaselineUpdates
 * @returns {string} User-friendly message
 */
function getUpdateMessage(updateResult) {
  if (!updateResult.hasUpdates) {
    return 'No baseline updates needed. Great workout!';
  }

  if (updateResult.totalSuggestions === 1) {
    const suggestion = updateResult.suggestions[0];
    return `🎉 You exceeded your ${suggestion.muscle} baseline by ${suggestion.exceedancePercent.toFixed(1)}%! Consider updating from ${suggestion.currentBaseline} to ${suggestion.suggestedBaseline} lbs.`;
  }

  const muscleList = updateResult.exceededMuscles.slice(0, 3).join(', ');
  const remaining = updateResult.totalSuggestions - 3;

  if (remaining > 0) {
    return `🎉 You exceeded baselines for ${muscleList} and ${remaining} more muscle${remaining > 1 ? 's' : ''}!`;
  } else {
    return `🎉 You exceeded baselines for ${muscleList}!`;
  }
}

/**
 * Calculate percentage increase for a baseline update
 *
 * @param {number} currentBaseline - Current baseline
 * @param {number} suggestedBaseline - Suggested new baseline
 * @returns {number} Percentage increase
 */
function calculateIncreasePercent(currentBaseline, suggestedBaseline) {
  return ((suggestedBaseline - currentBaseline) / currentBaseline) * 100;
}

/**
 * Validate if a baseline update is reasonable (safety check)
 *
 * @param {number} currentBaseline - Current baseline
 * @param {number} suggestedBaseline - Suggested new baseline
 * @param {number} maxIncreasePercent - Maximum allowed increase (default 50%)
 * @returns {Object} Validation result
 */
function validateBaselineUpdate(currentBaseline, suggestedBaseline, maxIncreasePercent = 50) {
  const increasePercent = calculateIncreasePercent(currentBaseline, suggestedBaseline);

  if (increasePercent <= 0) {
    return {
      isValid: false,
      reason: 'Suggested baseline must be higher than current baseline',
      increasePercent
    };
  }

  if (increasePercent > maxIncreasePercent) {
    return {
      isValid: false,
      reason: `Increase of ${increasePercent.toFixed(1)}% exceeds maximum allowed (${maxIncreasePercent}%). This might be an error.`,
      increasePercent
    };
  }

  return {
    isValid: true,
    reason: 'Baseline update is reasonable',
    increasePercent
  };
}

/**
 * Format baseline suggestions for API response
 *
 * @param {Array} suggestions - Baseline update suggestions
 * @returns {Array} Formatted suggestions for frontend
 */
function formatSuggestionsForUI(suggestions) {
  return suggestions.map(suggestion => ({
    muscle: suggestion.muscle,
    current: suggestion.currentBaseline,
    suggested: suggestion.suggestedBaseline,
    increase: suggestion.exceedanceAmount,
    increasePercent: suggestion.exceedancePercent,
    message: `${suggestion.muscle}: ${suggestion.currentBaseline} → ${suggestion.suggestedBaseline} lbs (+${suggestion.exceedancePercent.toFixed(1)}%)`
  }));
}

/**
 * Get history of baseline updates for a muscle (placeholder for DB integration)
 *
 * @param {string} muscle - Muscle name
 * @param {number} userId - User ID (for DB query)
 * @returns {Array} History of baseline updates
 */
function getBaselineHistory(muscle, userId) {
  // TODO: Query database for baseline history
  // SELECT * FROM muscle_baselines WHERE user_id = ? AND muscle = ? ORDER BY updated_at DESC
  return [];
}

module.exports = {
  checkBaselineUpdates,
  getUpdateMessage,
  calculateIncreasePercent,
  validateBaselineUpdate,
  formatSuggestionsForUI,
  getBaselineHistory
};

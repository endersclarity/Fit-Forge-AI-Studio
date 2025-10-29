export interface SetConfiguration {
  sets: number;
  reps: number;
  weight: number;
}

interface SetBuilderOptions {
  sets?: number;
  reps?: number;
  weight?: number;
  preferredRepRange?: [number, number];
}

/**
 * Calculate sets/reps/weight to hit target volume
 *
 * Logic:
 * - Default to 3 sets
 * - Target rep range: 8-12 (or custom)
 * - Lock target volume - adjustments maintain total
 */
export function calculateSetsRepsWeight(
  targetVolume: number,
  options: SetBuilderOptions = {}
): SetConfiguration {
  const {
    sets = 3,
    reps,
    weight,
    preferredRepRange = [8, 12],
  } = options;

  // If all three are provided, just validate
  if (sets && reps && weight) {
    return { sets, reps, weight };
  }

  // Calculate volume per set
  const volumePerSet = targetVolume / sets;

  // If reps provided, calculate weight
  if (reps) {
    const calculatedWeight = Math.round(volumePerSet / reps / 5) * 5; // Round to nearest 5
    return { sets, reps, weight: calculatedWeight };
  }

  // If weight provided, calculate reps
  if (weight) {
    const calculatedReps = Math.round(volumePerSet / weight);
    return { sets, reps: calculatedReps, weight };
  }

  // Default: calculate both reps and weight targeting mid-range
  const targetReps = Math.floor((preferredRepRange[0] + preferredRepRange[1]) / 2);
  const calculatedWeight = Math.round(volumePerSet / targetReps / 5) * 5;

  return { sets, reps: targetReps, weight: calculatedWeight };
}

/**
 * Adjust set configuration while maintaining target volume
 */
export function adjustSetConfiguration(
  targetVolume: number,
  current: SetConfiguration,
  adjustment: Partial<SetConfiguration>
): SetConfiguration {
  const newSets = adjustment.sets ?? current.sets;
  const newReps = adjustment.reps ?? current.reps;
  const newWeight = adjustment.weight ?? current.weight;

  return calculateSetsRepsWeight(targetVolume, {
    sets: newSets,
    reps: newReps !== current.reps ? newReps : undefined,
    weight: newWeight !== current.weight ? newWeight : undefined,
  });
}

// ============================================
// SMART VOLUME SLIDER UTILITIES
// ============================================

export interface SetBreakdown {
  sets: number;
  reps: number;
  weight: number;
  actualVolume: number;
}

export interface LastPerformance {
  weight: number;
  reps: number;
}

const PROGRESSIVE_OVERLOAD_MULTIPLIER = 1.03; // 3% increase
const MIN_REPS = 5;
const MAX_REPS = 15;
const DEFAULT_SETS = 3;
const WEIGHT_ROUNDING = 5; // Round to nearest 5 lbs

/**
 * Generate optimal set/rep/weight breakdown from target volume with progressive overload
 *
 * @param targetVolume - Desired total volume in lbs (weight × reps × sets)
 * @param lastPerformance - Last performance data for progressive overload
 * @returns Optimal set breakdown
 */
export function generateSetsFromVolume(
  targetVolume: number,
  lastPerformance?: LastPerformance
): SetBreakdown {
  if (targetVolume <= 0) {
    return {
      sets: 0,
      reps: 0,
      weight: 0,
      actualVolume: 0
    };
  }

  // Start with last performance if available, otherwise use conservative defaults
  let baseWeight = lastPerformance ? lastPerformance.weight : 100;

  // Apply 3% progressive overload to weight
  let suggestedWeight = baseWeight * PROGRESSIVE_OVERLOAD_MULTIPLIER;

  // Round weight to nearest 5 lbs
  suggestedWeight = Math.round(suggestedWeight / WEIGHT_ROUNDING) * WEIGHT_ROUNDING;

  // Calculate reps needed to hit target volume with suggested weight and default sets
  let calculatedReps = targetVolume / (suggestedWeight * DEFAULT_SETS);

  // Clamp reps to reasonable range (5-15)
  calculatedReps = Math.max(MIN_REPS, Math.min(MAX_REPS, Math.round(calculatedReps)));

  // If calculated reps are at boundaries, adjust sets or weight to get closer to target
  let sets = DEFAULT_SETS;

  // Calculate actual volume achieved
  const actualVolume = sets * calculatedReps * suggestedWeight;

  // If we're far from target (>20% off), try adjusting sets
  const volumeRatio = actualVolume / targetVolume;
  if (volumeRatio < 0.8) {
    // Need more volume - add a set
    sets = 4;
  } else if (volumeRatio > 1.2 && sets > 2) {
    // Too much volume - reduce a set
    sets = 2;
  }

  // Recalculate with adjusted sets
  const finalReps = Math.max(MIN_REPS, Math.min(MAX_REPS, Math.round(targetVolume / (suggestedWeight * sets))));
  const finalVolume = sets * finalReps * suggestedWeight;

  return {
    sets,
    reps: finalReps,
    weight: suggestedWeight,
    actualVolume: finalVolume
  };
}

/**
 * Format set breakdown for display
 * @param breakdown - Set breakdown to format
 * @returns Formatted string like "3×10@135"
 */
export function formatSetBreakdown(breakdown: SetBreakdown): string {
  if (breakdown.sets === 0) {
    return '0 sets';
  }
  return `${breakdown.sets}×${breakdown.reps}@${breakdown.weight}`;
}

/**
 * Calculate progressive overload comparison
 * @param current - Current set breakdown
 * @param last - Last performance
 * @returns Comparison string with percentage increase
 */
export function calculateProgressiveOverload(
  current: SetBreakdown,
  last: { weight: number; reps: number; sets?: number }
): { percentage: number; description: string } {
  const lastVolume = last.weight * last.reps * (last.sets || DEFAULT_SETS);
  const currentVolume = current.actualVolume;

  const percentage = ((currentVolume - lastVolume) / lastVolume) * 100;

  return {
    percentage,
    description: `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
  };
}

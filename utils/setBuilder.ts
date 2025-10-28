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

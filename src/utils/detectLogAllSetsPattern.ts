export interface SimpleSetData {
  weight: number;
  reps: number;
  completed?: boolean;
}

export interface LogAllSetsPatternResult {
  shouldPrompt: boolean;
  totalSets: number;
  completedSets: number;
  remainingSets: number;
  matchedWeight: number;
  matchedReps: number;
}

const BASE_RESULT: LogAllSetsPatternResult = {
  shouldPrompt: false,
  totalSets: 0,
  completedSets: 0,
  remainingSets: 0,
  matchedWeight: 0,
  matchedReps: 0,
};

/**
 * Detects when 2/3 of the sets share the same weight/reps so we can prompt to log the rest.
 */
export function detectLogAllSetsPattern(sets: SimpleSetData[]): LogAllSetsPatternResult {
  if (!sets || sets.length === 0) {
    return BASE_RESULT;
  }

  const completedSets = sets.filter((set) => Boolean(set.completed));
  const remainingSets = sets.length - completedSets.length;

  const result: LogAllSetsPatternResult = {
    ...BASE_RESULT,
    totalSets: sets.length,
    completedSets: completedSets.length,
    remainingSets,
  };

  if (completedSets.length < 2 || remainingSets <= 0) {
    return result;
  }

  const completionRatio = completedSets.length / sets.length;
  if (completionRatio < 2 / 3) {
    return result;
  }

  const firstSet = completedSets[0];
  if (firstSet.weight <= 0 || firstSet.reps <= 0) {
    return result;
  }

  const allMatch = completedSets.every(
    (set) => set.weight === firstSet.weight && set.reps === firstSet.reps
  );

  if (!allMatch) {
    return result;
  }

  return {
    ...result,
    shouldPrompt: true,
    matchedWeight: firstSet.weight,
    matchedReps: firstSet.reps,
  };
}

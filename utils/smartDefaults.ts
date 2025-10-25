/**
 * Smart Defaults Service
 *
 * Fetches last performance data for exercises and calculates progressive overload suggestions
 * for the Quick-Add feature.
 */

import { roundToNearestHalf, type ProgressionMethod } from './progressiveOverload';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface LastPerformance {
  weight: number;
  reps: number;
  to_failure: boolean;
  date: string;
  volume: number;
}

export interface SmartDefaults {
  lastPerformance: LastPerformance | null;
  suggestedWeight: number | null;
  suggestedReps: number | null;
  progressionMethod: ProgressionMethod | null;
  daysAgo: number | null;
}

interface LastTwoSetsResponse {
  lastSet: {
    weight: number;
    reps: number;
    to_failure: boolean;
    date: string;
  } | null;
  secondLastSet: {
    weight: number;
    reps: number;
    to_failure: boolean;
    date: string;
  } | null;
}

/**
 * Fetches smart defaults for an exercise based on last performance and progressive overload
 *
 * @param exerciseName - The name of the exercise
 * @returns SmartDefaults object with suggested values
 *
 * @example
 * const defaults = await fetchSmartDefaults('Pull-ups');
 * // Returns: { suggestedWeight: 206, suggestedReps: 10, progressionMethod: 'weight', ... }
 */
export async function fetchSmartDefaults(exerciseName: string): Promise<SmartDefaults> {
  try {
    // Fetch last TWO performances to determine progression method alternation
    const response = await fetch(
      `${API_BASE_URL}/workouts/last-two-sets?exerciseName=${encodeURIComponent(exerciseName)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch smart defaults: ${response.statusText}`);
    }

    const { lastSet, secondLastSet }: LastTwoSetsResponse = await response.json();

    if (!lastSet) {
      return {
        lastPerformance: null,
        suggestedWeight: null,
        suggestedReps: null,
        progressionMethod: null,
        daysAgo: null
      };
    }

    // Determine last progression method by comparing last two sets
    let lastMethod: ProgressionMethod | null = null;
    if (secondLastSet) {
      if (lastSet.weight > secondLastSet.weight) {
        lastMethod = 'weight';
      } else if (lastSet.reps > secondLastSet.reps) {
        lastMethod = 'reps';
      }
    }

    // Alternate progression method (default to 'weight' if first time or unknown)
    const nextMethod: ProgressionMethod = lastMethod === 'weight' ? 'reps' : 'weight';

    // Calculate suggestions based on +3% progressive overload
    const suggestedWeight = nextMethod === 'weight'
      ? roundToNearestHalf(lastSet.weight * 1.03)
      : lastSet.weight;

    const suggestedReps = nextMethod === 'reps'
      ? Math.ceil(lastSet.reps * 1.03)
      : lastSet.reps;

    // Calculate days since last performance
    const daysAgo = Math.floor(
      (Date.now() - new Date(lastSet.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      lastPerformance: {
        weight: lastSet.weight,
        reps: lastSet.reps,
        to_failure: lastSet.to_failure,
        date: lastSet.date,
        volume: lastSet.weight * lastSet.reps
      },
      suggestedWeight,
      suggestedReps,
      progressionMethod: nextMethod,
      daysAgo
    };

  } catch (error) {
    console.error('Failed to fetch smart defaults:', error);
    return {
      lastPerformance: null,
      suggestedWeight: null,
      suggestedReps: null,
      progressionMethod: null,
      daysAgo: null
    };
  }
}

/**
 * Formats the progression suggestion as a human-readable string
 *
 * @param defaults - SmartDefaults object
 * @returns Formatted suggestion string
 *
 * @example
 * formatProgressionSuggestion({ progressionMethod: 'weight', suggestedWeight: 206, ... })
 * // Returns: "+3% weight (206 lbs)"
 */
export function formatProgressionSuggestion(defaults: SmartDefaults): string {
  if (!defaults.lastPerformance || !defaults.progressionMethod) {
    return 'No previous data';
  }

  if (defaults.progressionMethod === 'weight') {
    return `+3% weight (${defaults.suggestedWeight} lbs)`;
  } else {
    return `+3% reps (${defaults.suggestedReps} reps)`;
  }
}

/**
 * Formats the last performance info as a human-readable string
 *
 * @param defaults - SmartDefaults object
 * @returns Formatted last performance string
 *
 * @example
 * formatLastPerformance({ lastPerformance: { weight: 200, reps: 10 }, daysAgo: 3, ... })
 * // Returns: "Last: 10 reps @ 200 lbs (3 days ago)"
 */
export function formatLastPerformance(defaults: SmartDefaults): string {
  if (!defaults.lastPerformance) {
    return 'First time doing this exercise';
  }

  const daysText = defaults.daysAgo === 0
    ? 'today'
    : defaults.daysAgo === 1
    ? '1 day ago'
    : `${defaults.daysAgo} days ago`;

  return `Last: ${defaults.lastPerformance.reps} reps @ ${defaults.lastPerformance.weight} lbs (${daysText})`;
}

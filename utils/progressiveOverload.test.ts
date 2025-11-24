/**
 * Tests for Progressive Overload Calculator
 *
 * Covers all functions including:
 * - roundToNearestHalf
 * - determineProgressionMethod
 * - calculateProgressiveOverload
 * - getSuggestedVariation
 * - getDaysSinceWorkout
 * - formatRelativeDate
 */

import { describe, it, expect } from 'vitest';
import {
  roundToNearestHalf,
  determineProgressionMethod,
  calculateProgressiveOverload,
  getSuggestedVariation,
  getDaysSinceWorkout,
  formatRelativeDate,
  type ProgressionMethod,
  type LastPerformance,
  type PersonalBest,
} from './progressiveOverload';

describe('progressiveOverload', () => {
  describe('roundToNearestHalf', () => {
    it('rounds down to nearest 0.5', () => {
      expect(roundToNearestHalf(102.3)).toBe(102.5);
      expect(roundToNearestHalf(102.2)).toBe(102);
    });

    it('rounds up to nearest 0.5', () => {
      expect(roundToNearestHalf(102.7)).toBe(103);
      expect(roundToNearestHalf(102.6)).toBe(102.5);
    });

    it('handles exact half values', () => {
      expect(roundToNearestHalf(102.5)).toBe(102.5);
      expect(roundToNearestHalf(103.0)).toBe(103);
    });

    it('handles edge cases', () => {
      expect(roundToNearestHalf(0)).toBe(0);
      expect(roundToNearestHalf(0.3)).toBe(0.5);
      expect(roundToNearestHalf(0.2)).toBe(0);
    });

    it('handles negative values', () => {
      expect(roundToNearestHalf(-102.3)).toBe(-102.5);
      expect(roundToNearestHalf(-102.7)).toBe(-103);
    });
  });

  describe('determineProgressionMethod', () => {
    it('defaults to weight for first workout (null)', () => {
      expect(determineProgressionMethod(null)).toBe('weight');
    });

    it('alternates from weight to reps', () => {
      expect(determineProgressionMethod('weight')).toBe('reps');
    });

    it('alternates from reps to weight', () => {
      expect(determineProgressionMethod('reps')).toBe('weight');
    });
  });

  describe('calculateProgressiveOverload', () => {
    describe('weight progression', () => {
      it('increases weight by 3% when method is weight', () => {
        const lastPerformance: LastPerformance = { weight: 100, reps: 8 };
        const result = calculateProgressiveOverload(lastPerformance, null);

        expect(result.progressionMethod).toBe('weight');
        expect(result.suggestedWeight).toBe(103); // 100 * 1.03 = 103
        expect(result.suggestedReps).toBe(8); // Reps unchanged
        expect(result.percentIncrease).toBe(3.0);
      });

      it('rounds weight to nearest 0.5 lb', () => {
        const lastPerformance: LastPerformance = { weight: 101, reps: 10 };
        const result = calculateProgressiveOverload(lastPerformance, null);

        // 101 * 1.03 = 104.03 → rounds to 104
        expect(result.suggestedWeight).toBe(104);
      });
    });

    describe('reps progression', () => {
      it('increases reps by 3% when method is reps', () => {
        const lastPerformance: LastPerformance = { weight: 100, reps: 10 };
        const result = calculateProgressiveOverload(lastPerformance, 'weight');

        expect(result.progressionMethod).toBe('reps');
        expect(result.suggestedWeight).toBe(100); // Weight unchanged
        expect(result.suggestedReps).toBe(11); // 10 * 1.03 = 10.3 → ceil(0.3) = 1, so 10+1=11
        expect(result.percentIncrease).toBe(3.0);
      });

      it('always increases by at least 1 rep', () => {
        const lastPerformance: LastPerformance = { weight: 100, reps: 20 };
        const result = calculateProgressiveOverload(lastPerformance, 'weight');

        // 20 * 0.03 = 0.6 → ceil(0.6) = 1 → 20+1 = 21
        expect(result.suggestedReps).toBe(21);
      });

      it('handles small rep values', () => {
        const lastPerformance: LastPerformance = { weight: 100, reps: 5 };
        const result = calculateProgressiveOverload(lastPerformance, 'weight');

        // 5 * 0.03 = 0.15 → ceil(0.15) = 1 → 5+1 = 6
        expect(result.suggestedReps).toBe(6);
      });
    });

    describe('personal best enforcement', () => {
      it('does not suggest weight below personal best', () => {
        const lastPerformance: LastPerformance = { weight: 100, reps: 8 };
        const personalBest: PersonalBest = { weight: 110, reps: 5 };
        const result = calculateProgressiveOverload(lastPerformance, null, personalBest);

        // Would suggest 103, but PB is 110
        expect(result.suggestedWeight).toBe(110);
      });

      it('allows weight above personal best', () => {
        const lastPerformance: LastPerformance = { weight: 120, reps: 8 };
        const personalBest: PersonalBest = { weight: 110, reps: 5 };
        const result = calculateProgressiveOverload(lastPerformance, null, personalBest);

        // 120 * 1.03 = 123.6 → 124
        expect(result.suggestedWeight).toBe(124);
      });

      it('does not enforce reps minimum (allows heavier weight with fewer reps)', () => {
        const lastPerformance: LastPerformance = { weight: 150, reps: 5 };
        const personalBest: PersonalBest = { weight: 140, reps: 10 };
        const result = calculateProgressiveOverload(lastPerformance, 'weight');

        // Reps progression from 5 reps - should suggest 6 reps
        expect(result.suggestedReps).toBe(6); // Not enforced to PB's 10 reps
      });
    });

    describe('alternation pattern', () => {
      it('follows weight → reps → weight pattern', () => {
        let lastPerformance: LastPerformance = { weight: 100, reps: 8 };
        let lastMethod: ProgressionMethod | null = null;

        // First workout: weight progression
        let result = calculateProgressiveOverload(lastPerformance, lastMethod);
        expect(result.progressionMethod).toBe('weight');
        expect(result.suggestedWeight).toBe(103);
        expect(result.suggestedReps).toBe(8);

        // Second workout: reps progression
        lastPerformance = { weight: 103, reps: 8 };
        lastMethod = 'weight';
        result = calculateProgressiveOverload(lastPerformance, lastMethod);
        expect(result.progressionMethod).toBe('reps');
        expect(result.suggestedWeight).toBe(103);
        expect(result.suggestedReps).toBe(9);

        // Third workout: weight progression again
        lastPerformance = { weight: 103, reps: 9 };
        lastMethod = 'reps';
        result = calculateProgressiveOverload(lastPerformance, lastMethod);
        expect(result.progressionMethod).toBe('weight');
        expect(result.suggestedWeight).toBe(106); // 103 * 1.03 = 106.09 → 106
        expect(result.suggestedReps).toBe(9);
      });
    });
  });

  describe('getSuggestedVariation', () => {
    it('defaults to A for first workout', () => {
      expect(getSuggestedVariation(null)).toBe('A');
    });

    it('alternates from A to B', () => {
      expect(getSuggestedVariation('A')).toBe('B');
    });

    it('alternates from B to A', () => {
      expect(getSuggestedVariation('B')).toBe('A');
    });
  });

  describe('getDaysSinceWorkout', () => {
    it('calculates days from timestamp', () => {
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      expect(getDaysSinceWorkout(threeDaysAgo)).toBe(3);
    });

    it('calculates days from date string', () => {
      const threeDaysAgo = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString();
      expect(getDaysSinceWorkout(threeDaysAgo)).toBe(3);
    });

    it('returns 0 for today', () => {
      const today = Date.now();
      expect(getDaysSinceWorkout(today)).toBe(0);
    });

    it('floors partial days', () => {
      const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
      expect(getDaysSinceWorkout(twelveHoursAgo)).toBe(0);
    });
  });

  describe('formatRelativeDate', () => {
    it('formats today', () => {
      const today = Date.now();
      expect(formatRelativeDate(today)).toBe('today');
    });

    it('formats yesterday', () => {
      const yesterday = Date.now() - (1 * 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(yesterday)).toBe('yesterday');
    });

    it('formats recent days (2-6)', () => {
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago');
    });

    it('formats one week', () => {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(oneWeekAgo)).toBe('1 week ago');
    });

    it('formats multiple weeks', () => {
      const threeWeeksAgo = Date.now() - (21 * 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(threeWeeksAgo)).toBe('3 weeks ago');
    });

    it('formats one month', () => {
      const oneMonthAgo = Date.now() - (40 * 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(oneMonthAgo)).toBe('1 month ago');
    });

    it('formats multiple months', () => {
      const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(threeMonthsAgo)).toBe('3 months ago');
    });
  });
});

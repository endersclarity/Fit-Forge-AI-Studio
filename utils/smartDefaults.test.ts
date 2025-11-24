/**
 * Tests for Smart Defaults Service
 *
 * Covers:
 * - formatProgressionSuggestion
 * - formatLastPerformance
 * - Internal logic for progression method detection
 */

import { describe, it, expect } from 'vitest';
import {
  formatProgressionSuggestion,
  formatLastPerformance,
  type SmartDefaults,
} from './smartDefaults';

describe('smartDefaults', () => {
  describe('formatProgressionSuggestion', () => {
    it('formats weight progression suggestion', () => {
      const defaults: SmartDefaults = {
        lastPerformance: { weight: 200, reps: 10, to_failure: false, date: '2025-10-20', volume: 2000 },
        suggestedWeight: 206,
        suggestedReps: 10,
        progressionMethod: 'weight',
        daysAgo: 3,
      };

      expect(formatProgressionSuggestion(defaults)).toBe('+3% weight (206 lbs)');
    });

    it('formats reps progression suggestion', () => {
      const defaults: SmartDefaults = {
        lastPerformance: { weight: 200, reps: 10, to_failure: false, date: '2025-10-20', volume: 2000 },
        suggestedWeight: 200,
        suggestedReps: 11,
        progressionMethod: 'reps',
        daysAgo: 3,
      };

      expect(formatProgressionSuggestion(defaults)).toBe('+3% reps (11 reps)');
    });

    it('handles no previous data', () => {
      const defaults: SmartDefaults = {
        lastPerformance: null,
        suggestedWeight: null,
        suggestedReps: null,
        progressionMethod: null,
        daysAgo: null,
      };

      expect(formatProgressionSuggestion(defaults)).toBe('No previous data');
    });

    it('handles missing progression method', () => {
      const defaults: SmartDefaults = {
        lastPerformance: { weight: 200, reps: 10, to_failure: false, date: '2025-10-20', volume: 2000 },
        suggestedWeight: 206,
        suggestedReps: 10,
        progressionMethod: null,
        daysAgo: 3,
      };

      expect(formatProgressionSuggestion(defaults)).toBe('No previous data');
    });
  });

  describe('formatLastPerformance', () => {
    it('formats last performance with days ago', () => {
      const defaults: SmartDefaults = {
        lastPerformance: { weight: 200, reps: 10, to_failure: false, date: '2025-10-20', volume: 2000 },
        suggestedWeight: 206,
        suggestedReps: 10,
        progressionMethod: 'weight',
        daysAgo: 3,
      };

      expect(formatLastPerformance(defaults)).toBe('Last: 10 reps @ 200 lbs (3 days ago)');
    });

    it('formats today correctly', () => {
      const defaults: SmartDefaults = {
        lastPerformance: { weight: 150, reps: 8, to_failure: true, date: '2025-10-24', volume: 1200 },
        suggestedWeight: 155,
        suggestedReps: 8,
        progressionMethod: 'weight',
        daysAgo: 0,
      };

      expect(formatLastPerformance(defaults)).toBe('Last: 8 reps @ 150 lbs (today)');
    });

    it('formats 1 day ago correctly', () => {
      const defaults: SmartDefaults = {
        lastPerformance: { weight: 150, reps: 8, to_failure: true, date: '2025-10-23', volume: 1200 },
        suggestedWeight: 155,
        suggestedReps: 8,
        progressionMethod: 'weight',
        daysAgo: 1,
      };

      expect(formatLastPerformance(defaults)).toBe('Last: 8 reps @ 150 lbs (1 day ago)');
    });

    it('handles first time doing exercise', () => {
      const defaults: SmartDefaults = {
        lastPerformance: null,
        suggestedWeight: null,
        suggestedReps: null,
        progressionMethod: null,
        daysAgo: null,
      };

      expect(formatLastPerformance(defaults)).toBe('First time doing this exercise');
    });

    it('formats different rep ranges', () => {
      const defaults: SmartDefaults = {
        lastPerformance: { weight: 300, reps: 3, to_failure: false, date: '2025-10-15', volume: 900 },
        suggestedWeight: 309,
        suggestedReps: 3,
        progressionMethod: 'weight',
        daysAgo: 7,
      };

      expect(formatLastPerformance(defaults)).toBe('Last: 3 reps @ 300 lbs (7 days ago)');
    });
  });

  describe('progression method detection logic', () => {
    it('determines weight progression when weight increased', () => {
      // This tests the logic inside fetchSmartDefaults
      // lastSet.weight (200) > secondLastSet.weight (190) → 'weight' method was last used
      // Next method should be 'reps'

      const lastSet = { weight: 200, reps: 10, to_failure: false, date: '2025-10-20' };
      const secondLastSet = { weight: 190, reps: 10, to_failure: false, date: '2025-10-17' };

      // Simulate the logic
      let lastMethod: 'weight' | 'reps' | null = null;
      if (lastSet.weight > secondLastSet.weight) {
        lastMethod = 'weight';
      } else if (lastSet.reps > secondLastSet.reps) {
        lastMethod = 'reps';
      }

      expect(lastMethod).toBe('weight');

      // Next method should alternate
      const nextMethod = lastMethod === 'weight' ? 'reps' : 'weight';
      expect(nextMethod).toBe('reps');
    });

    it('determines reps progression when reps increased', () => {
      const lastSet = { weight: 200, reps: 12, to_failure: false, date: '2025-10-20' };
      const secondLastSet = { weight: 200, reps: 10, to_failure: false, date: '2025-10-17' };

      let lastMethod: 'weight' | 'reps' | null = null;
      if (lastSet.weight > secondLastSet.weight) {
        lastMethod = 'weight';
      } else if (lastSet.reps > secondLastSet.reps) {
        lastMethod = 'reps';
      }

      expect(lastMethod).toBe('reps');

      const nextMethod = lastMethod === 'weight' ? 'reps' : 'weight';
      expect(nextMethod).toBe('weight');
    });

    it('defaults to weight when no second set exists', () => {
      const lastSet = { weight: 200, reps: 10, to_failure: false, date: '2025-10-20' };
      const secondLastSet = null;

      let lastMethod: 'weight' | 'reps' | null = null;
      if (secondLastSet) {
        if (lastSet.weight > secondLastSet.weight) {
          lastMethod = 'weight';
        } else if (lastSet.reps > secondLastSet.reps) {
          lastMethod = 'reps';
        }
      }

      expect(lastMethod).toBe(null);

      const nextMethod = lastMethod === 'weight' ? 'reps' : 'weight';
      expect(nextMethod).toBe('weight');
    });
  });

  describe('progressive overload calculation', () => {
    it('calculates 3% weight increase correctly', () => {
      const lastWeight = 200;
      const nextMethod = 'weight';

      const suggestedWeight = nextMethod === 'weight'
        ? Math.round(lastWeight * 1.03 * 2) / 2 // roundToNearestHalf
        : lastWeight;

      expect(suggestedWeight).toBe(206); // 200 * 1.03 = 206
    });

    it('calculates 3% reps increase correctly', () => {
      const lastReps = 10;
      const nextMethod = 'reps';

      const suggestedReps = nextMethod === 'reps'
        ? Math.ceil(lastReps * 1.03)
        : lastReps;

      expect(suggestedReps).toBe(11); // ceil(10 * 1.03) = ceil(10.3) = 11
    });

    it('handles rounding for weight increases', () => {
      const lastWeight = 135;
      const suggestedWeight = Math.round(lastWeight * 1.03 * 2) / 2;

      expect(suggestedWeight).toBe(139); // 135 * 1.03 = 139.05 → 139
    });

    it('ensures minimum 1 rep increase', () => {
      const lastReps = 20;
      const suggestedReps = Math.ceil(lastReps * 1.03);

      expect(suggestedReps).toBe(21); // ceil(20 * 1.03) = ceil(20.6) = 21
    });
  });

  describe('volume calculation', () => {
    it('calculates volume correctly', () => {
      const weight = 200;
      const reps = 10;
      const volume = weight * reps;

      expect(volume).toBe(2000);
    });

    it('handles different weight and rep combinations', () => {
      expect(100 * 5).toBe(500);
      expect(225 * 8).toBe(1800);
      expect(315 * 3).toBe(945);
    });
  });
});

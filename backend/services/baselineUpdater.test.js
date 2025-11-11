/**
 * Baseline Updater Service Tests
 *
 * Validates baseline exceedance detection and suggestion generation
 */

const {
  checkBaselineUpdates,
  getUpdateMessage,
  calculateIncreasePercent,
  validateBaselineUpdate,
  formatSuggestionsForUI,
  getBaselineHistory
} = require('./baselineUpdater');

// Test data
const testBaselines = {
  Quadriceps: 7000,
  Glutes: 6500,
  Hamstrings: 5200,
  Core: 3000,
  LowerBack: 2800,
  Pectoralis: 8000,
  Deltoids: 6000,
  Triceps: 5000
};

describe('BaselineUpdater', () => {
  describe('checkBaselineUpdates', () => {
    it('creates suggestion when volume exceeds baseline', () => {
      const muscleVolumes = {
        Quadriceps: 7500, // Exceeds 7000 baseline
        Glutes: 6000 // Does not exceed 6500 baseline
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines);

      expect(result.hasUpdates).toBe(true);
      expect(result.totalSuggestions).toBe(1);
      expect(result.suggestions.length).toBe(1);
      expect(result.suggestions[0].muscle).toBe('Quadriceps');
      expect(result.suggestions[0].currentBaseline).toBe(7000);
      expect(result.suggestions[0].volumeAchieved).toBe(7500);
      expect(result.suggestions[0].suggestedBaseline).toBe(7500);
      expect(result.exceededMuscles).toContain('Quadriceps');
    });

    it('calculates exceed percentage correctly', () => {
      const muscleVolumes = {
        Quadriceps: 8400 // 20% over 7000 baseline
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines);

      expect(result.suggestions[0].exceedancePercent).toBeCloseTo(20, 1);
      expect(result.suggestions[0].exceedanceAmount).toBe(1400);
    });

    it('includes workout context in suggestion', () => {
      const muscleVolumes = {
        Quadriceps: 7500
      };
      const workoutDate = new Date('2025-11-10T10:00:00Z');
      const workoutId = 'workout-123';

      const result = checkBaselineUpdates(muscleVolumes, testBaselines, workoutDate, workoutId);

      expect(result.workoutDate).toBe(workoutDate.toISOString());
      expect(result.workoutId).toBe(workoutId);
      expect(result.suggestions[0].workoutDate).toBe(workoutDate.toISOString());
      expect(result.suggestions[0].workoutId).toBe(workoutId);
    });

    it('detects multiple muscles exceeding baselines', () => {
      const muscleVolumes = {
        Quadriceps: 7500,
        Glutes: 7000,
        Hamstrings: 5500
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines);

      expect(result.hasUpdates).toBe(true);
      expect(result.totalSuggestions).toBe(3);
      expect(result.exceededMuscles).toEqual(['Quadriceps', 'Glutes', 'Hamstrings']);
    });

    it('sorts suggestions by highest exceedance percentage', () => {
      const muscleVolumes = {
        Quadriceps: 7700, // 10% over
        Glutes: 7800, // 20% over
        Hamstrings: 5460 // 5% over
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines);

      // Should be sorted: Glutes (20%), Quadriceps (10%), Hamstrings (5%)
      expect(result.suggestions[0].muscle).toBe('Glutes');
      expect(result.suggestions[1].muscle).toBe('Quadriceps');
      expect(result.suggestions[2].muscle).toBe('Hamstrings');
      expect(result.suggestions[0].exceedancePercent).toBeGreaterThan(result.suggestions[1].exceedancePercent);
    });
  });

  describe('checkBaselineUpdates - Edge Cases', () => {
    it('returns empty array when no muscles exceed baseline', () => {
      const muscleVolumes = {
        Quadriceps: 5000, // Below 7000 baseline
        Glutes: 4000 // Below 6500 baseline
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines);

      expect(result.hasUpdates).toBe(false);
      expect(result.totalSuggestions).toBe(0);
      expect(result.suggestions.length).toBe(0);
      expect(result.exceededMuscles.length).toBe(0);
    });

    it('handles volume exactly equal to baseline (no suggestion)', () => {
      const muscleVolumes = {
        Quadriceps: 7000 // Exactly equals baseline
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines);

      expect(result.hasUpdates).toBe(false);
      expect(result.totalSuggestions).toBe(0);
    });

    it('handles volume slightly exceeding baseline (<5%)', () => {
      const muscleVolumes = {
        Quadriceps: 7140 // 2% over baseline
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines);

      expect(result.hasUpdates).toBe(true);
      expect(result.suggestions[0].exceedancePercent).toBeCloseTo(2, 1);
    });

    it('handles all muscles exceeding baselines (15 suggestions)', () => {
      const muscleVolumes = {
        Quadriceps: 8000,
        Glutes: 7500,
        Hamstrings: 6000,
        Core: 3500,
        LowerBack: 3200,
        Pectoralis: 9000,
        Deltoids: 7000,
        Triceps: 6000,
        Biceps: 5000,
        Lats: 8000,
        MiddleBack: 6000,
        Traps: 4500,
        Calves: 4000,
        Forearms: 2500,
        Hip: 4000
      };

      // Need to provide baselines for all muscles
      const allBaselines = {
        ...testBaselines,
        Biceps: 4500,
        Lats: 7500,
        MiddleBack: 5500,
        Traps: 4000,
        Calves: 3500,
        Forearms: 2000,
        Hip: 3500
      };

      const result = checkBaselineUpdates(muscleVolumes, allBaselines);

      expect(result.hasUpdates).toBe(true);
      expect(result.totalSuggestions).toBe(15);
    });

    it('skips muscles with no baseline defined', () => {
      const muscleVolumes = {
        Quadriceps: 7500,
        UnknownMuscle: 9999 // No baseline for this
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines);

      expect(result.totalSuggestions).toBe(1);
      expect(result.suggestions[0].muscle).toBe('Quadriceps');
      // UnknownMuscle should be skipped
    });

    it('handles zero volume achieved', () => {
      const muscleVolumes = {
        Quadriceps: 0
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines);

      expect(result.hasUpdates).toBe(false);
    });

    it('rounds up suggested baseline', () => {
      const muscleVolumes = {
        Quadriceps: 7350.7 // Should round to 7351
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines);

      expect(result.suggestions[0].suggestedBaseline).toBe(7351);
    });
  });

  describe('checkBaselineUpdates - Error Handling', () => {
    it('handles missing muscle volumes gracefully', () => {
      const result = checkBaselineUpdates({}, testBaselines);

      expect(result.hasUpdates).toBe(false);
      expect(result.suggestions.length).toBe(0);
    });

    it('handles missing baselines gracefully', () => {
      const muscleVolumes = {
        Quadriceps: 7500
      };

      const result = checkBaselineUpdates(muscleVolumes, {});

      expect(result.hasUpdates).toBe(false);
    });

    it('handles null workout ID gracefully', () => {
      const muscleVolumes = {
        Quadriceps: 7500
      };

      const result = checkBaselineUpdates(muscleVolumes, testBaselines, new Date(), null);

      expect(result.workoutId).toBeNull();
      expect(result.suggestions[0].workoutId).toBeNull();
    });
  });

  describe('getUpdateMessage', () => {
    it('returns message for no updates needed', () => {
      const updateResult = {
        hasUpdates: false,
        totalSuggestions: 0,
        suggestions: []
      };

      const message = getUpdateMessage(updateResult);

      expect(message).toBe('No baseline updates needed. Great workout!');
    });

    it('returns detailed message for single muscle update', () => {
      const updateResult = {
        hasUpdates: true,
        totalSuggestions: 1,
        suggestions: [{
          muscle: 'Quadriceps',
          currentBaseline: 7000,
          suggestedBaseline: 7500,
          exceedancePercent: 7.14
        }],
        exceededMuscles: ['Quadriceps']
      };

      const message = getUpdateMessage(updateResult);

      expect(message).toContain('🎉');
      expect(message).toContain('Quadriceps');
      expect(message).toContain('7.1%');
      expect(message).toContain('7000');
      expect(message).toContain('7500');
    });

    it('returns summary message for multiple muscle updates (<=3)', () => {
      const updateResult = {
        hasUpdates: true,
        totalSuggestions: 3,
        suggestions: [],
        exceededMuscles: ['Quadriceps', 'Glutes', 'Hamstrings']
      };

      const message = getUpdateMessage(updateResult);

      expect(message).toContain('Quadriceps');
      expect(message).toContain('Glutes');
      expect(message).toContain('Hamstrings');
    });

    it('returns summary message for many muscle updates (>3)', () => {
      const updateResult = {
        hasUpdates: true,
        totalSuggestions: 5,
        suggestions: [],
        exceededMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core', 'LowerBack']
      };

      const message = getUpdateMessage(updateResult);

      expect(message).toContain('Quadriceps');
      expect(message).toContain('2 more');
    });
  });

  describe('calculateIncreasePercent', () => {
    it('calculates percentage increase correctly', () => {
      expect(calculateIncreasePercent(7000, 7700)).toBeCloseTo(10, 1);
      expect(calculateIncreasePercent(5000, 5500)).toBeCloseTo(10, 1);
      expect(calculateIncreasePercent(1000, 1200)).toBeCloseTo(20, 1);
    });

    it('handles 50% increase', () => {
      expect(calculateIncreasePercent(1000, 1500)).toBeCloseTo(50, 1);
    });

    it('handles small increases', () => {
      expect(calculateIncreasePercent(7000, 7070)).toBeCloseTo(1, 1);
    });

    it('handles 100%+ increase', () => {
      expect(calculateIncreasePercent(1000, 2500)).toBeCloseTo(150, 1);
    });
  });

  describe('validateBaselineUpdate', () => {
    it('validates reasonable baseline update (within 50%)', () => {
      const result = validateBaselineUpdate(7000, 7700); // 10% increase

      expect(result.isValid).toBe(true);
      expect(result.reason).toContain('reasonable');
      expect(result.increasePercent).toBeCloseTo(10, 1);
    });

    it('rejects baseline update exceeding 50% increase', () => {
      const result = validateBaselineUpdate(1000, 2000); // 100% increase

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('exceeds maximum');
      expect(result.reason).toContain('100.0%');
    });

    it('rejects suggested baseline lower than current', () => {
      const result = validateBaselineUpdate(7000, 6000);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('must be higher');
    });

    it('rejects suggested baseline equal to current', () => {
      const result = validateBaselineUpdate(7000, 7000);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('must be higher');
    });

    it('allows custom maximum increase percentage', () => {
      const result = validateBaselineUpdate(1000, 1300, 25); // 30% increase, max 25%

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('25');
    });

    it('validates exactly at maximum threshold', () => {
      const result = validateBaselineUpdate(1000, 1500, 50); // Exactly 50%

      expect(result.isValid).toBe(true);
    });
  });

  describe('formatSuggestionsForUI', () => {
    it('formats suggestions for frontend display', () => {
      const suggestions = [
        {
          muscle: 'Quadriceps',
          currentBaseline: 7000,
          suggestedBaseline: 7500,
          exceedanceAmount: 500,
          exceedancePercent: 7.14
        },
        {
          muscle: 'Glutes',
          currentBaseline: 6500,
          suggestedBaseline: 7000,
          exceedanceAmount: 500,
          exceedancePercent: 7.69
        }
      ];

      const formatted = formatSuggestionsForUI(suggestions);

      expect(formatted.length).toBe(2);
      expect(formatted[0]).toHaveProperty('muscle', 'Quadriceps');
      expect(formatted[0]).toHaveProperty('current', 7000);
      expect(formatted[0]).toHaveProperty('suggested', 7500);
      expect(formatted[0]).toHaveProperty('increase', 500);
      expect(formatted[0]).toHaveProperty('increasePercent', 7.14);
      expect(formatted[0]).toHaveProperty('message');
      expect(formatted[0].message).toContain('Quadriceps: 7000 → 7500');
    });

    it('formats empty suggestions array', () => {
      const formatted = formatSuggestionsForUI([]);

      expect(formatted.length).toBe(0);
    });

    it('includes proper formatting in message', () => {
      const suggestions = [{
        muscle: 'Quadriceps',
        currentBaseline: 7000,
        suggestedBaseline: 7777,
        exceedanceAmount: 777,
        exceedancePercent: 11.1
      }];

      const formatted = formatSuggestionsForUI(suggestions);

      expect(formatted[0].message).toContain('7000 → 7777');
      expect(formatted[0].message).toContain('+11.1%');
    });
  });

  describe('getBaselineHistory', () => {
    it('returns empty array (placeholder for DB integration)', () => {
      const history = getBaselineHistory('Quadriceps', 123);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    it('accepts muscle name and user ID parameters', () => {
      // Should not throw error
      expect(() => {
        getBaselineHistory('Hamstrings', 456);
      }).not.toThrow();
    });
  });
});

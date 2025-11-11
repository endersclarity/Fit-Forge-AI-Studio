/**
 * Fatigue Calculator Service Tests
 *
 * Validates fatigue calculation logic matches logic-sandbox reference implementation
 */

const { calculateFatigue, getAllMuscles, getBaselineSuggestions } = require('./fatigueCalculator');

// Test data from logic-sandbox
const testWorkout = {
  exercises: [
    {
      exerciseId: 'ex12', // Kettlebell Goblet Squat
      sets: [
        { weight: 70, reps: 10 },
        { weight: 70, reps: 10 },
        { weight: 70, reps: 10 }
      ]
    },
    {
      exerciseId: 'ex13', // Dumbbell Romanian Deadlift
      sets: [
        { weight: 100, reps: 10 },
        { weight: 100, reps: 10 },
        { weight: 100, reps: 10 }
      ]
    }
  ]
};

const testBaselines = {
  Quadriceps: 7000,
  Glutes: 6500,
  Hamstrings: 5200,
  Core: 3000,
  LowerBack: 2800
};

describe('FatigueCalculator', () => {
  describe('calculateFatigue', () => {
    it('calculates correct muscle volumes', () => {
      const results = calculateFatigue(testWorkout, testBaselines);

      // Goblet Squat: 70*10*3 = 2100 total
      // Quadriceps: 2100 * 0.50 = 1050
      // Glutes: 2100 * 0.30 = 630
      // Hamstrings: 2100 * 0.12 = 252
      // Core: 2100 * 0.08 = 168

      // Romanian Deadlift: 100*10*3 = 3000 total
      // Hamstrings: 3000 * 0.45 = 1350
      // Glutes: 3000 * 0.35 = 1050
      // Core: 3000 * 0.15 = 450
      // LowerBack: 3000 * 0.05 = 150

      // Total volumes:
      // Quadriceps: 1050
      // Glutes: 630 + 1050 = 1680
      // Hamstrings: 252 + 1350 = 1602
      // Core: 168 + 450 = 618
      // LowerBack: 150

      expect(Math.round(results.Quadriceps.volume)).toBe(1050);
      expect(Math.round(results.Glutes.volume)).toBe(1680);
      expect(Math.round(results.Hamstrings.volume)).toBe(1602);
      expect(Math.round(results.Core.volume)).toBe(618);
      expect(Math.round(results.LowerBack.volume)).toBe(150);
    });

    it('calculates correct fatigue percentages', () => {
      const results = calculateFatigue(testWorkout, testBaselines);

      // Quadriceps: 1050 / 7000 = 15%
      // Glutes: 1680 / 6500 = 25.8%
      // Hamstrings: 1602 / 5200 = 30.8%
      // Core: 618 / 3000 = 20.6%
      // LowerBack: 150 / 2800 = 5.4%

      expect(Math.round(results.Quadriceps.fatiguePercent)).toBe(15);
      expect(Math.round(results.Glutes.fatiguePercent)).toBe(26);
      expect(Math.round(results.Hamstrings.fatiguePercent)).toBe(31);
      expect(Math.round(results.Core.fatiguePercent)).toBe(21);
      expect(Math.round(results.LowerBack.fatiguePercent)).toBe(5);
    });

    it('detects when baseline is exceeded', () => {
      const highVolumeWorkout = {
        exercises: [
          {
            exerciseId: 'ex13', // Romanian Deadlift
            sets: [
              { weight: 200, reps: 15 },
              { weight: 200, reps: 15 },
              { weight: 200, reps: 15 }
            ]
          }
        ]
      };

      const results = calculateFatigue(highVolumeWorkout, testBaselines);

      // Total volume: 200 * 15 * 3 = 9000
      // Hamstrings: 9000 * 0.45 = 4050
      // Baseline: 5200
      // Fatigue: 4050 / 5200 = 77.9% (NOT exceeded)

      expect(results.Hamstrings.exceededBaseline).toBe(false);

      // But if we increase weight...
      const veryHighVolumeWorkout = {
        exercises: [
          {
            exerciseId: 'ex13',
            sets: [
              { weight: 250, reps: 15 },
              { weight: 250, reps: 15 },
              { weight: 250, reps: 15 }
            ]
          }
        ]
      };

      const results2 = calculateFatigue(veryHighVolumeWorkout, testBaselines);
      // Volume: 250 * 15 * 3 = 11250
      // Hamstrings: 11250 * 0.45 = 5062.5
      // Fatigue: 5062.5 / 5200 = 97.4% (still not exceeded)

      // Need even more...
      const extremeWorkout = {
        exercises: [
          {
            exerciseId: 'ex13',
            sets: [
              { weight: 300, reps: 15 },
              { weight: 300, reps: 15 },
              { weight: 300, reps: 15 }
            ]
          }
        ]
      };

      const results3 = calculateFatigue(extremeWorkout, testBaselines);
      // Volume: 300 * 15 * 3 = 13500
      // Hamstrings: 13500 * 0.45 = 6075
      // Fatigue: 6075 / 5200 = 116.8% (EXCEEDED!)

      expect(results3.Hamstrings.exceededBaseline).toBe(true);
      expect(results3.Hamstrings.fatiguePercent).toBeGreaterThan(100);
    });
  });

  describe('getAllMuscles', () => {
    it('returns all 15 muscle groups', () => {
      const results = calculateFatigue(testWorkout, testBaselines);
      const allMuscles = getAllMuscles(results, testBaselines);

      expect(allMuscles.length).toBe(15);
      expect(allMuscles.map(m => m.muscle)).toContain('Pectoralis');
      expect(allMuscles.map(m => m.muscle)).toContain('Quadriceps');
      expect(allMuscles.map(m => m.muscle)).toContain('Hamstrings');
    });

    it('includes 0% fatigue for untrained muscles', () => {
      const results = calculateFatigue(testWorkout, testBaselines);
      const allMuscles = getAllMuscles(results, testBaselines);

      const pecs = allMuscles.find(m => m.muscle === 'Pectoralis');
      expect(pecs.fatiguePercent).toBe(0);
      expect(pecs.displayFatigue).toBe(0);
      expect(pecs.volume).toBe(0);
    });
  });

  describe('getBaselineSuggestions', () => {
    it('returns suggestions for exceeded baselines', () => {
      const extremeWorkout = {
        exercises: [
          {
            exerciseId: 'ex13',
            sets: [
              { weight: 300, reps: 15 },
              { weight: 300, reps: 15 },
              { weight: 300, reps: 15 }
            ]
          }
        ]
      };

      const results = calculateFatigue(extremeWorkout, testBaselines);
      const suggestions = getBaselineSuggestions(results);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('muscle');
      expect(suggestions[0]).toHaveProperty('currentBaseline');
      expect(suggestions[0]).toHaveProperty('suggestedBaseline');
      expect(suggestions[0]).toHaveProperty('volumeAchieved');
      expect(suggestions[0].suggestedBaseline).toBeGreaterThan(suggestions[0].currentBaseline);
    });

    it('returns empty array when no baselines exceeded', () => {
      const results = calculateFatigue(testWorkout, testBaselines);
      const suggestions = getBaselineSuggestions(results);

      expect(suggestions.length).toBe(0);
    });
  });
});

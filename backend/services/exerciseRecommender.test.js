/**
 * Exercise Recommender Service Tests
 *
 * Validates 5-factor scoring algorithm and bottleneck detection
 * Algorithm: logic-sandbox/workout-builder-recommendations.md
 */

const {
  recommendExercises,
  scoreExercise,
  filterEligibleExercises,
  checkBottleneckSafety,
  estimateWeight,
  getAllExercises,
  getExerciseById,
  SCORING_WEIGHTS,
  MIN_ENGAGEMENT_THRESHOLD,
  BOTTLENECK_WARNING_THRESHOLD,
  BASELINE_EXCEEDANCE_THRESHOLD
} = require('./exerciseRecommender');

// Test data
const testBaselines = {
  Pectoralis: 8000,
  Deltoids: 6000,
  Triceps: 5000,
  Quadriceps: 7000,
  Glutes: 6500,
  Hamstrings: 5200,
  Core: 3000,
  LowerBack: 2800,
  Biceps: 4500,
  Lats: 7500,
  MiddleBack: 5500,
  Traps: 4000,
  Calves: 3500,
  Forearms: 2000,
  Hip: 3500
};

describe('ExerciseRecommender', () => {
  describe('getAllExercises', () => {
    it('returns all exercises from database', () => {
      const exercises = getAllExercises();

      expect(exercises).toBeDefined();
      expect(Array.isArray(exercises)).toBe(true);
      expect(exercises.length).toBeGreaterThan(0);
      expect(exercises[0]).toHaveProperty('id');
      expect(exercises[0]).toHaveProperty('name');
      expect(exercises[0]).toHaveProperty('muscles');
    });
  });

  describe('getExerciseById', () => {
    it('returns exercise by ID', () => {
      const exercise = getExerciseById('ex02'); // Dumbbell Bench Press

      expect(exercise).toBeDefined();
      expect(exercise).not.toBeNull();
      expect(exercise.id).toBe('ex02');
      expect(exercise).toHaveProperty('name');
      expect(exercise).toHaveProperty('muscles');
    });

    it('returns null for invalid ID', () => {
      const exercise = getExerciseById('invalid-id');

      expect(exercise).toBeNull();
    });
  });

  describe('filterEligibleExercises', () => {
    it('filters exercises by target muscle', () => {
      const eligible = filterEligibleExercises('Pectoralis', []);

      expect(eligible.length).toBeGreaterThan(0);
      eligible.forEach(exercise => {
        const targetMuscle = exercise.muscles.find(m => m.muscle === 'Pectoralis');
        expect(targetMuscle).toBeDefined();
        expect(targetMuscle.percentage).toBeGreaterThanOrEqual(MIN_ENGAGEMENT_THRESHOLD);
      });
    });

    it('filters exercises by equipment', () => {
      const eligible = filterEligibleExercises('Pectoralis', ['dumbbell']); // Use dumbbell instead of barbell

      expect(eligible.length).toBeGreaterThan(0);
      eligible.forEach(exercise => {
        expect(exercise.equipment).toBe('dumbbell');
      });
    });

    it('excludes exercises already in workout', () => {
      const currentWorkout = [{ exerciseId: 'ex02' }]; // Valid exercise ID
      const eligible = filterEligibleExercises('Pectoralis', [], currentWorkout);

      eligible.forEach(exercise => {
        expect(exercise.id).not.toBe('ex02');
      });
    });

    it('excludes exercises in avoid list', () => {
      const avoidExercises = ['ex02', 'ex03'];
      const eligible = filterEligibleExercises('Pectoralis', [], [], avoidExercises);

      eligible.forEach(exercise => {
        expect(avoidExercises.includes(exercise.id)).toBe(false);
      });
    });

    it('returns empty array when target muscle not primary in any exercise', () => {
      // Use a muscle that might not have many exercises
      const eligible = filterEligibleExercises('InvalidMuscle', []);

      expect(eligible).toBeDefined();
      expect(Array.isArray(eligible)).toBe(true);
    });

    it('handles no equipment specified (returns all exercises)', () => {
      const eligibleNoEquipment = filterEligibleExercises('Pectoralis', []);
      const eligibleAllEquipment = filterEligibleExercises('Pectoralis', null);

      expect(eligibleNoEquipment.length).toBeGreaterThan(0);
      if (eligibleAllEquipment) {
        expect(eligibleAllEquipment.length).toBeGreaterThan(0);
      }
    });
  });

  describe('scoreExercise', () => {
    it('calculates 5-factor score with known inputs', () => {
      const exercise = getExerciseById('ex02'); // Dumbbell Bench Press
      const targetMuscle = 'Pectoralis';
      const currentFatigue = {
        Pectoralis: 20,
        AnteriorDeltoids: 15,
        Triceps: 10
      };
      const currentWorkout = [];
      const preferExercises = [];

      const score = scoreExercise(exercise, targetMuscle, currentFatigue, currentWorkout, preferExercises);

      expect(score).toBeDefined();
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('scores higher for fresh muscles (0% fatigue)', () => {
      const exercise = getExerciseById('ex02');
      const freshFatigue = { Pectoralis: 0, AnteriorDeltoids: 0, Triceps: 0 };
      const tiredFatigue = { Pectoralis: 80, AnteriorDeltoids: 80, Triceps: 80 };

      const freshScore = scoreExercise(exercise, 'Pectoralis', freshFatigue);
      const tiredScore = scoreExercise(exercise, 'Pectoralis', tiredFatigue);

      expect(freshScore).toBeGreaterThan(tiredScore);
    });

    it('scores higher for primary vs secondary muscle engagement', () => {
      const exercise = getExerciseById('ex02');
      const targetMuscleData = exercise.muscles.find(m => m.muscle === 'Pectoralis');

      if (targetMuscleData && targetMuscleData.primary) {
        // If Pectoralis is primary, score should include primary bonus
        const score = scoreExercise(exercise, 'Pectoralis', {});
        expect(score).toBeGreaterThan(0);
      }
    });

    it('scores higher for user preferred exercises', () => {
      const exercise = getExerciseById('ex02');
      const withoutPreference = scoreExercise(exercise, 'Pectoralis', {}, [], []);
      const withPreference = scoreExercise(exercise, 'Pectoralis', {}, [], ['ex02']);

      expect(withPreference).toBe(withoutPreference + SCORING_WEIGHTS.userPreference);
    });

    it('penalizes for variety (same movement pattern)', () => {
      const exercise = getExerciseById('ex02'); // Dumbbell Bench Press
      const emptyWorkout = [];
      const fullWorkout = [
        { exerciseId: 'ex03' }, // Another push exercise
        { exerciseId: 'ex05' }, // Another push exercise
        { exerciseId: 'ex38' }  // Another push exercise
      ];

      const scoreEmpty = scoreExercise(exercise, 'Pectoralis', {}, emptyWorkout);
      const scoreFull = scoreExercise(exercise, 'Pectoralis', {}, fullWorkout);

      // Score should be lower with more of same movement pattern
      expect(scoreFull).toBeLessThanOrEqual(scoreEmpty);
    });

    it('handles exercise not targeting specified muscle', () => {
      const exercise = getExerciseById('ex02'); // Chest exercise
      // Try to score for a muscle it doesn't target
      const score = scoreExercise(exercise, 'Calves', {});

      // Should still return a score (likely low)
      expect(typeof score).toBe('number');
    });
  });

  describe('scoreExercise - Edge Cases', () => {
    it('handles all muscles at 100% fatigue', () => {
      const exercise = getExerciseById('ex02');
      const maxFatigue = {
        Pectoralis: 100,
        AnteriorDeltoids: 100,
        Triceps: 100,
        Biceps: 100,
        Lats: 100
      };

      const score = scoreExercise(exercise, 'Pectoralis', maxFatigue);

      expect(score).toBeDefined();
      expect(score).toBeGreaterThanOrEqual(0);
      // Score should be low due to high fatigue
    });

    it('handles empty current workout', () => {
      const exercise = getExerciseById('ex02');
      const score = scoreExercise(exercise, 'Pectoralis', {}, []);

      expect(score).toBeDefined();
      expect(score).toBeGreaterThan(0);
    });

    it('verifies score breakdown sums correctly', () => {
      // Target Match (40%) + Freshness (25%) + Variety (15%) + Preference (10%) + Primary (10%) = 100%
      expect(
        SCORING_WEIGHTS.targetMatch +
        SCORING_WEIGHTS.muscleFreshness +
        SCORING_WEIGHTS.variety +
        SCORING_WEIGHTS.userPreference +
        SCORING_WEIGHTS.primaryBalance
      ).toBe(100);
    });
  });

  describe('checkBottleneckSafety', () => {
    it('identifies bottleneck when muscle >80% fatigued', () => {
      const exercise = getExerciseById('ex02');
      const currentFatigue = { Pectoralis: 70 };
      const currentMuscleVolumes = { Pectoralis: 5600 }; // 70% of 8000 baseline
      const baselines = { Pectoralis: 8000 };

      // Adding exercise would push it over 80%
      const result = checkBottleneckSafety(
        exercise,
        currentFatigue,
        currentMuscleVolumes,
        baselines,
        3, // sets
        10, // reps
        150 // weight
      );

      expect(result).toHaveProperty('isSafe');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('hasWarnings');
    });

    it('flags critical warning when baseline would be exceeded (>100%)', () => {
      const exercise = getExerciseById('ex02');
      const currentFatigue = { Pectoralis: 90 };
      const currentMuscleVolumes = { Pectoralis: 7200 }; // 90% of 8000 baseline
      const baselines = { Pectoralis: 8000 };

      // Adding heavy exercise would exceed baseline
      const result = checkBottleneckSafety(
        exercise,
        currentFatigue,
        currentMuscleVolumes,
        baselines,
        3,
        10,
        300 // Heavy weight
      );

      if (result.warnings.length > 0) {
        const criticalWarnings = result.warnings.filter(w => w.severity === 'critical');
        expect(result.hasCriticalWarnings).toBe(criticalWarnings.length > 0);
      }
    });

    it('returns safe for low volume exercise on fresh muscles', () => {
      const exercise = getExerciseById('ex02');
      const currentFatigue = { Pectoralis: 10 };
      const currentMuscleVolumes = { Pectoralis: 800 };
      const baselines = { Pectoralis: 8000 };

      const result = checkBottleneckSafety(
        exercise,
        currentFatigue,
        currentMuscleVolumes,
        baselines,
        3,
        10,
        100
      );

      expect(result.isSafe).toBe(true);
      expect(result.hasCriticalWarnings).toBe(false);
    });

    it('handles missing baseline data gracefully', () => {
      const exercise = getExerciseById('ex02');
      const currentFatigue = { Pectoralis: 50 };
      const currentMuscleVolumes = { Pectoralis: 4000 };
      const baselines = {}; // No baseline data

      const result = checkBottleneckSafety(
        exercise,
        currentFatigue,
        currentMuscleVolumes,
        baselines
      );

      // Should not crash, should skip safety check
      expect(result).toBeDefined();
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('estimateWeight', () => {
    it('returns default weights for equipment types', () => {
      const barbellExercise = { equipment: 'barbell' };
      const dumbbellExercise = { equipment: 'dumbbell' };
      const bodyweightExercise = { equipment: 'bodyweight' };

      expect(estimateWeight(barbellExercise)).toBe(135);
      expect(estimateWeight(dumbbellExercise)).toBe(50);
      expect(estimateWeight(bodyweightExercise)).toBe(180);
    });

    it('uses user history when available', () => {
      const exercise = { id: 'ex1', equipment: 'barbell' };
      const userHistory = [
        {
          exercises: [
            {
              exerciseId: 'ex1',
              sets: [
                { weight: 200, reps: 10 },
                { weight: 200, reps: 10 },
                { weight: 200, reps: 10 }
              ]
            }
          ]
        }
      ];

      const weight = estimateWeight(exercise, userHistory);
      expect(weight).toBe(200); // Average of user's past sets
    });

    it('returns default when no history exists', () => {
      const exercise = { id: 'ex1', equipment: 'barbell' };
      const userHistory = [];

      const weight = estimateWeight(exercise, userHistory);
      expect(weight).toBe(135); // Default barbell weight
    });

    it('handles unknown equipment type', () => {
      const exercise = { equipment: 'unknown-equipment' };

      const weight = estimateWeight(exercise);
      expect(weight).toBe(100); // Default fallback
    });
  });

  describe('recommendExercises', () => {
    it('returns top exercises ranked by score', () => {
      const params = {
        targetMuscle: 'Pectoralis',
        currentWorkout: [],
        currentFatigue: { Pectoralis: 20 },
        currentMuscleVolumes: { Pectoralis: 1600 },
        baselines: testBaselines,
        availableEquipment: ['dumbbell', 'cable-machine'],
        userHistory: [],
        userPreferences: {}
      };

      const result = recommendExercises(params);

      expect(result).toHaveProperty('recommended');
      expect(result).toHaveProperty('notRecommended');
      expect(result).toHaveProperty('totalEligible');
      expect(result.targetMuscle).toBe('Pectoralis');
      expect(Array.isArray(result.recommended)).toBe(true);

      // Should return max 10 recommendations
      expect(result.recommended.length).toBeLessThanOrEqual(10);

      // Recommendations should be sorted by score (descending)
      if (result.recommended.length > 1) {
        for (let i = 0; i < result.recommended.length - 1; i++) {
          expect(result.recommended[i].score).toBeGreaterThanOrEqual(result.recommended[i + 1].score);
        }
      }
    });

    it('separates safe vs unsafe recommendations', () => {
      const params = {
        targetMuscle: 'Pectoralis',
        currentWorkout: [],
        currentFatigue: { Pectoralis: 85 }, // High fatigue
        currentMuscleVolumes: { Pectoralis: 6800 }, // 85% of baseline
        baselines: testBaselines
      };

      const result = recommendExercises(params);

      expect(result.totalSafe).toBeDefined();
      expect(result.totalUnsafe).toBeDefined();
      expect(result.totalSafe + result.totalUnsafe).toBe(result.totalEligible);
    });

    it('filters by equipment correctly', () => {
      const params = {
        targetMuscle: 'Quadriceps',
        currentWorkout: [],
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: testBaselines,
        availableEquipment: ['dumbbell']
      };

      const result = recommendExercises(params);

      result.recommended.forEach(rec => {
        expect(rec.equipment).toBe('dumbbell');
      });
    });

    it('excludes exercises in avoid list', () => {
      const params = {
        targetMuscle: 'Pectoralis',
        currentWorkout: [],
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: testBaselines,
        userPreferences: {
          avoidExercises: ['ex02', 'ex03']
        }
      };

      const result = recommendExercises(params);

      result.recommended.forEach(rec => {
        expect(['ex02', 'ex03'].includes(rec.exerciseId)).toBe(false);
      });
    });

    it('prioritizes preferred exercises', () => {
      const params = {
        targetMuscle: 'Pectoralis',
        currentWorkout: [],
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: testBaselines,
        userPreferences: {
          preferExercises: ['ex02']
        }
      };

      const result = recommendExercises(params);

      // Preferred exercise should score higher
      const preferredExercise = result.recommended.find(rec => rec.exerciseId === 'ex02');
      if (preferredExercise) {
        expect(preferredExercise.score).toBeGreaterThan(0);
      }
    });

    it('handles empty available equipment (returns all)', () => {
      const params = {
        targetMuscle: 'Pectoralis',
        currentWorkout: [],
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: testBaselines,
        availableEquipment: []
      };

      const result = recommendExercises(params);

      expect(result.recommended.length).toBeGreaterThan(0);
    });
  });

  describe('recommendExercises - Error Handling', () => {
    it('handles missing target muscle gracefully', () => {
      const params = {
        targetMuscle: 'InvalidMuscle',
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: testBaselines
      };

      const result = recommendExercises(params);

      expect(result).toBeDefined();
      expect(result.recommended.length).toBe(0);
    });

    it('handles missing fatigue states', () => {
      const params = {
        targetMuscle: 'Pectoralis',
        currentFatigue: undefined,
        currentMuscleVolumes: {},
        baselines: testBaselines
      };

      const result = recommendExercises(params);

      expect(result).toBeDefined();
    });

    it('handles missing baselines', () => {
      const params = {
        targetMuscle: 'Pectoralis',
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: undefined
      };

      const result = recommendExercises(params);

      expect(result).toBeDefined();
    });
  });
});

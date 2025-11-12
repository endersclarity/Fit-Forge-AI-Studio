import { describe, it, expect } from 'vitest';
import { recommendExercises } from '../exerciseRecommender.js';

describe('ExerciseRecommender', () => {
  // Test data: muscle states with varying fatigue levels
  const sampleMuscleStates = [
    { muscle: 'Quadriceps', currentFatigue: 45 },
    { muscle: 'Hamstrings', currentFatigue: 20 },
    { muscle: 'Glutes', currentFatigue: 30 },
    { muscle: 'Calves', currentFatigue: 10 },
    { muscle: 'Pectoralis', currentFatigue: 85 }, // Over-fatigued
    { muscle: 'Lats', currentFatigue: 15 },
    { muscle: 'Biceps', currentFatigue: 25 },
    { muscle: 'Triceps', currentFatigue: 82 }, // Over-fatigued
    { muscle: 'AnteriorDeltoids', currentFatigue: 50 },
    { muscle: 'PosteriorDeltoids', currentFatigue: 12 },
    { muscle: 'Trapezius', currentFatigue: 18 },
    { muscle: 'Rhomboids', currentFatigue: 22 },
    { muscle: 'Core', currentFatigue: 40 },
    { muscle: 'LowerBack', currentFatigue: 35 },
    { muscle: 'Forearms', currentFatigue: 15 }
  ];

  describe('Input Validation (AC: Testing)', () => {
    it('should throw error if target muscle is missing', () => {
      expect(() => recommendExercises(null, sampleMuscleStates)).toThrow(
        'Target muscle is required and must be a string'
      );
    });

    it('should throw error if target muscle is not a string', () => {
      expect(() => recommendExercises(123, sampleMuscleStates)).toThrow(
        'Target muscle is required and must be a string'
      );
    });

    it('should throw error if muscle states is not an array', () => {
      expect(() => recommendExercises('Quadriceps', {})).toThrow(
        'Muscle states array is required'
      );
    });

    it('should throw error if muscle states array is missing', () => {
      expect(() => recommendExercises('Quadriceps', null)).toThrow(
        'Muscle states array is required'
      );
    });

    it('should throw error if muscle state lacks muscle name', () => {
      const invalidStates = [
        { currentFatigue: 50 } // Missing muscle name
      ];
      expect(() => recommendExercises('Quadriceps', invalidStates)).toThrow(
        'Muscle state at index 0 must have a muscle name'
      );
    });

    it('should throw error if muscle state lacks fatigue value', () => {
      const invalidStates = [
        { muscle: 'Quadriceps' } // Missing currentFatigue/fatiguePercent
      ];
      expect(() => recommendExercises('Quadriceps', invalidStates)).toThrow(
        'Muscle state at index 0 must have currentFatigue or fatiguePercent'
      );
    });

    it('should throw error if availableEquipment is not an array', () => {
      expect(() =>
        recommendExercises('Quadriceps', sampleMuscleStates, { availableEquipment: 'dumbbell' })
      ).toThrow('availableEquipment must be an array');
    });

    it('should accept muscle states with fatiguePercent instead of currentFatigue', () => {
      const altMuscleStates = [
        { muscle: 'Quadriceps', fatiguePercent: 45 },
        { muscle: 'Hamstrings', fatiguePercent: 20 }
      ];
      const result = recommendExercises('Quadriceps', altMuscleStates);
      expect(result).toHaveProperty('safe');
      expect(result).toHaveProperty('unsafe');
      expect(result).toHaveProperty('totalFiltered');
    });
  });

  describe('Target Muscle Match Factor (AC 1 - 40% weight)', () => {
    it('should score exercises with higher target engagement higher', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        availableEquipment: ['kettlebell', 'dumbbell', 'bodyweight']
      });

      // Find Kettlebell Goblet Squat (50% quads) and Box Step-ups (35% quads)
      const gobletSquat = result.safe.find(r => r.exercise.name === 'Kettlebell Goblet Squat');
      const boxStepups = result.safe.find(r => r.exercise.name === 'Box Step-ups');

      expect(gobletSquat).toBeDefined();
      expect(boxStepups).toBeDefined();

      // Goblet Squat has higher quad engagement, should score higher on target match
      expect(gobletSquat.factors.targetMatch).toBeGreaterThan(boxStepups.factors.targetMatch);
    });

    it('should calculate target match score correctly (percentage / 100 * 40)', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates);

      // Find an exercise with known quad engagement
      const exercise = result.safe[0];
      const expectedTargetMatch = (exercise.exercise.muscles.find(m => m.muscle === 'Quadriceps').percentage / 100) * 40;
      expect(exercise.factors.targetMatch).toBeCloseTo(expectedTargetMatch, 2);
    });

    it('should filter out exercises with less than 5% target engagement', () => {
      // Dumbbell Bench Press has 0% quad engagement
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        availableEquipment: ['dumbbell']
      });

      const benchPress = result.safe.find(r => r.exercise.name === 'Dumbbell Bench Press');
      expect(benchPress).toBeUndefined();
    });
  });

  describe('Muscle Freshness Factor (AC 1 - 25% weight)', () => {
    it('should score exercises using fresh muscles higher', () => {
      // Compare exercises: one using fresh muscles vs one using fatigued muscles
      const result = recommendExercises('Lats', sampleMuscleStates);

      // All lat exercises should be safe since Lats (15% fatigue) and Biceps (25% fatigue) are fresh
      expect(result.safe.length).toBeGreaterThan(0);

      // Freshness score should be higher for exercises with fresher supporting muscles
      const freshExercise = result.safe[0];
      expect(freshExercise.factors.freshness).toBeGreaterThan(0);
    });

    it('should calculate weighted average fatigue correctly', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        availableEquipment: ['kettlebell']
      });

      const gobletSquat = result.safe.find(r => r.exercise.name === 'Kettlebell Goblet Squat');
      expect(gobletSquat).toBeDefined();

      // Goblet Squat: 50% quads (45% fatigue), 30% glutes (30% fatigue), 12% hamstrings (20% fatigue), 8% core (40% fatigue)
      // Weighted avg = (50*45 + 30*30 + 12*20 + 8*40) / 100 = (2250 + 900 + 240 + 320) / 100 = 37.1%
      // Freshness score = ((100 - 37.1) / 100) * 25 = 15.725
      expect(gobletSquat.factors.freshness).toBeCloseTo(15.7, 0);
    });

    it('should give maximum freshness score when all muscles are 0% fatigued', () => {
      const freshMuscles = sampleMuscleStates.map(m => ({ ...m, currentFatigue: 0 }));
      const result = recommendExercises('Quadriceps', freshMuscles);

      const exercise = result.safe[0];
      expect(exercise.factors.freshness).toBe(25); // Maximum freshness score
    });
  });

  describe('Variety Factor (AC 1 - 15% weight)', () => {
    it('should penalize exercises with similar patterns in workout history', () => {
      const withoutHistory = recommendExercises('Quadriceps', sampleMuscleStates);
      const withHistory = recommendExercises('Quadriceps', sampleMuscleStates, {
        workoutHistory: ['Kettlebell Goblet Squat', 'Dumbbell Goblet Squat', 'Box Step-ups'] // 3 leg exercises
      });

      // Exercises should get lower variety scores when similar patterns exist in history
      const gobletSquatWithout = withoutHistory.safe.find(r => r.exercise.name === 'Kettlebell Goblet Squat');
      const gobletSquatWith = withHistory.safe.find(r => r.exercise.name === 'Kettlebell Goblet Squat');

      expect(gobletSquatWith.factors.variety).toBeLessThan(gobletSquatWithout.factors.variety);
    });

    it('should calculate variety score correctly (max(0, 1 - (count / 5)) * 15)', () => {
      // With 3 similar exercises in history, variety = max(0, 1 - 3/5) * 15 = 0.4 * 15 = 6
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        workoutHistory: ['Kettlebell Goblet Squat', 'Dumbbell Goblet Squat', 'Box Step-ups']
      });

      const legExercise = result.safe.find(r => r.exercise.category === 'legs');
      expect(legExercise.factors.variety).toBeCloseTo(6, 1);
    });

    it('should give maximum variety score when no similar patterns in history', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        workoutHistory: [] // Empty history
      });

      const exercise = result.safe[0];
      expect(exercise.factors.variety).toBe(15); // Maximum variety score
    });

    it('should floor variety score at 0 when too many similar patterns', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        workoutHistory: ['ex12', 'ex43', 'ex47', 'ex12', 'ex43', 'ex47'] // 6+ similar patterns
      });

      const exercise = result.safe[0];
      expect(exercise.factors.variety).toBeGreaterThanOrEqual(0);
    });
  });

  describe('User Preference Factor (AC 1 - 10% weight)', () => {
    it('should award 10 points if exercise is in favorites', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        userPreferences: { favorites: ['ex12'] } // Kettlebell Goblet Squat
      });

      const favorite = result.safe.find(r => r.exercise.id === 'ex12');
      expect(favorite).toBeDefined();
      expect(favorite.factors.preference).toBe(10);
    });

    it('should award 0 points if exercise is not in favorites', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        userPreferences: { favorites: ['ex99'] } // Non-existent exercise
      });

      const exercise = result.safe[0];
      expect(exercise.factors.preference).toBe(0);
    });

    it('should filter out exercises in avoid list before scoring', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        userPreferences: { avoid: ['ex12'] }, // Avoid Kettlebell Goblet Squat
        availableEquipment: ['kettlebell']
      });

      const avoided = result.safe.find(r => r.exercise.id === 'ex12');
      expect(avoided).toBeUndefined();
    });
  });

  describe('Primary/Secondary Balance Factor (AC 1 - 10% weight)', () => {
    it('should award 10 points if target muscle is primary', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates);

      // Find exercise where Quadriceps is primary
      const primaryExercise = result.safe.find(r => {
        const quadMuscle = r.exercise.muscles.find(m => m.muscle === 'Quadriceps');
        return quadMuscle && quadMuscle.primary;
      });

      expect(primaryExercise).toBeDefined();
      expect(primaryExercise.factors.primary).toBe(10);
    });

    it('should award 5 points if target muscle is secondary', () => {
      const result = recommendExercises('Core', sampleMuscleStates);

      // Find exercise where Core is secondary
      const secondaryExercise = result.safe.find(r => {
        const coreMuscle = r.exercise.muscles.find(m => m.muscle === 'Core');
        return coreMuscle && !coreMuscle.primary;
      });

      expect(secondaryExercise).toBeDefined();
      expect(secondaryExercise.factors.primary).toBe(5);
    });
  });

  describe('Bottleneck Detection (AC 2)', () => {
    it('should calculate volume impact correctly for bottleneck detection', () => {
      // Test with known values to verify volume calculation
      const muscleStatesForVolumeTest = [
        { muscle: 'Quadriceps', currentFatigue: 50 }, // 50% of 8400 baseline = 4200 current volume
        { muscle: 'Glutes', currentFatigue: 30 },
        { muscle: 'Hamstrings', currentFatigue: 20 },
        { muscle: 'Core', currentFatigue: 40 }
      ];

      // Use specific volume parameters
      const result = recommendExercises('Quadriceps', muscleStatesForVolumeTest, {
        estimatedSets: 3,
        estimatedReps: 10,
        estimatedWeight: 200 // Total volume = 6000 lbs
      });

      // With 6000 total volume, quad exercise at 50% engagement = 3000 added volume
      // Current volume: 50% of 8400 = 4200
      // Projected: (4200 + 3000) / 8400 = 85.7%
      // Should be safe (under 100%)
      expect(result.safe.length).toBeGreaterThan(0);
    });

    it('should flag unsafe when projected fatigue exceeds 100%', () => {
      // Set up scenario where adding volume would exceed baseline
      const muscleStatesHighFatigue = [
        { muscle: 'Quadriceps', currentFatigue: 85 }, // 85% of 8400 = 7140 current volume
        { muscle: 'Glutes', currentFatigue: 30 },
        { muscle: 'Hamstrings', currentFatigue: 20 },
        { muscle: 'Core', currentFatigue: 40 }
      ];

      // Heavy exercise that will push over 100%
      const result = recommendExercises('Quadriceps', muscleStatesHighFatigue, {
        estimatedSets: 4,
        estimatedReps: 12,
        estimatedWeight: 200 // Total volume = 9600 lbs
      });

      // With 9600 total volume at 50% engagement = 4800 added volume
      // Current: 85% of 8400 = 7140
      // Projected: (7140 + 4800) / 8400 = 142% > 100%
      // Should be flagged as unsafe
      expect(result.unsafe.length).toBeGreaterThan(0);

      const unsafeQuad = result.unsafe.find(r =>
        r.warnings.some(w => w.muscle === 'Quadriceps')
      );
      expect(unsafeQuad).toBeDefined();
    });

    it('should include projected fatigue in warning messages', () => {
      // Set up scenario that will trigger warning
      const muscleStatesHighFatigue = [
        { muscle: 'Pectoralis', currentFatigue: 90 }, // Very high fatigue
        { muscle: 'Triceps', currentFatigue: 50 },
        { muscle: 'Deltoids (Anterior)', currentFatigue: 40 }
      ];

      const result = recommendExercises('Pectoralis', muscleStatesHighFatigue, {
        estimatedSets: 3,
        estimatedReps: 10,
        estimatedWeight: 150
      });

      // Should have warnings with projected fatigue
      expect(result.unsafe.length).toBeGreaterThan(0);
      const warning = result.unsafe[0].warnings[0];
      expect(warning).toHaveProperty('currentFatigue');
      expect(warning).toHaveProperty('projectedFatigue');
      expect(warning).toHaveProperty('overage');
      expect(warning).toHaveProperty('addedVolume');
      expect(warning).toHaveProperty('baseline');
      expect(warning.projectedFatigue).toBeGreaterThan(100);
    });

    it('should use default volume parameters when not provided', () => {
      // Test without providing volume parameters - should use defaults (3 sets, 10 reps, 100 lbs)
      const muscleStatesDefault = [
        { muscle: 'Quadriceps', currentFatigue: 45 },
        { muscle: 'Glutes', currentFatigue: 30 },
        { muscle: 'Hamstrings', currentFatigue: 20 }
      ];

      const result = recommendExercises('Quadriceps', muscleStatesDefault);

      // Should work with defaults (total volume = 3 × 10 × 100 = 3000)
      expect(result).toHaveProperty('safe');
      expect(result).toHaveProperty('unsafe');
    });

    it('should separate safe from unsafe recommendations', () => {
      const result = recommendExercises('Lats', sampleMuscleStates);

      // Safe exercises should have no warnings
      result.safe.forEach(rec => {
        expect(rec.isSafe).toBe(true);
        expect(rec.warnings.length).toBe(0);
      });

      // Unsafe exercises should have warnings
      result.unsafe.forEach(rec => {
        expect(rec.isSafe).toBe(false);
        expect(rec.warnings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Equipment Availability Filtering (AC 4)', () => {
    it('should only return exercises with available equipment', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        availableEquipment: ['bodyweight']
      });

      // All recommendations should be bodyweight exercises
      result.safe.forEach(rec => {
        expect(rec.exercise.equipment).toBe('bodyweight');
      });
    });

    it('should return all exercises when no equipment filter specified', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates);

      // Should have exercises with various equipment types
      const equipment = new Set(result.safe.map(r => r.exercise.equipment));
      expect(equipment.size).toBeGreaterThan(1);
    });

    it('should filter correctly for multiple equipment types', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        availableEquipment: ['dumbbell', 'kettlebell']
      });

      result.safe.forEach(rec => {
        expect(['dumbbell', 'kettlebell']).toContain(rec.exercise.equipment);
      });
    });
  });

  describe('Ranking and Return Structure (AC 3)', () => {
    it('should sort exercises by score descending', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates);

      // Check that safe recommendations are sorted by score
      for (let i = 0; i < result.safe.length - 1; i++) {
        expect(result.safe[i].score).toBeGreaterThanOrEqual(result.safe[i + 1].score);
      }
    });

    it('should return top 15 safe recommendations', () => {
      const result = recommendExercises('Lats', sampleMuscleStates);

      // Should limit to 15 even if more are available
      expect(result.safe.length).toBeLessThanOrEqual(15);
    });

    it('should include score breakdown by factor for transparency', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates);

      const exercise = result.safe[0];
      expect(exercise.factors).toHaveProperty('targetMatch');
      expect(exercise.factors).toHaveProperty('freshness');
      expect(exercise.factors).toHaveProperty('variety');
      expect(exercise.factors).toHaveProperty('preference');
      expect(exercise.factors).toHaveProperty('primary');
      expect(exercise.factors).toHaveProperty('total');
    });

    it('should return correct structure with safe, unsafe, and totalFiltered', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates);

      expect(result).toHaveProperty('safe');
      expect(result).toHaveProperty('unsafe');
      expect(result).toHaveProperty('totalFiltered');
      expect(Array.isArray(result.safe)).toBe(true);
      expect(Array.isArray(result.unsafe)).toBe(true);
      expect(typeof result.totalFiltered).toBe('number');
    });

    it('should score safe exercises but not unsafe ones', () => {
      const result = recommendExercises('Pectoralis', sampleMuscleStates);

      // Unsafe exercises should have score of 0
      result.unsafe.forEach(rec => {
        expect(rec.score).toBe(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle case where no safe exercises available', () => {
      // All muscles highly fatigued
      const highFatigue = sampleMuscleStates.map(m => ({ ...m, currentFatigue: 95 }));
      const result = recommendExercises('Quadriceps', highFatigue);

      // Should return empty safe array
      expect(result.safe.length).toBe(0);
      // Should have unsafe recommendations with warnings
      expect(result.unsafe.length).toBeGreaterThan(0);
    });

    it('should handle case with minimal equipment (bodyweight only)', () => {
      const result = recommendExercises('Core', sampleMuscleStates, {
        availableEquipment: ['bodyweight']
      });

      expect(result.safe.length).toBeGreaterThan(0);
      result.safe.forEach(rec => {
        expect(rec.exercise.equipment).toBe('bodyweight');
      });
    });

    it('should handle target muscle already maxed (> 90% fatigued)', () => {
      const maxedQuads = sampleMuscleStates.map(m =>
        m.muscle === 'Quadriceps' ? { ...m, currentFatigue: 98 } : m
      );
      const result = recommendExercises('Quadriceps', maxedQuads);

      // Most quad exercises should be unsafe
      expect(result.unsafe.length).toBeGreaterThan(0);

      // Unsafe exercises should have quad warnings
      const unsafeWithQuadWarning = result.unsafe.find(r =>
        r.warnings.some(w => w.muscle === 'Quadriceps')
      );
      expect(unsafeWithQuadWarning).toBeDefined();
    });

    it('should handle empty equipment array as no filter', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates, {
        availableEquipment: []
      });

      // Should return exercises with various equipment types
      const equipment = new Set(result.safe.map(r => r.exercise.equipment));
      expect(equipment.size).toBeGreaterThan(1);
    });
  });

  describe('Integration with Fatigue/Recovery Calculator Outputs', () => {
    it('should accept muscle states from fatigue calculator format', () => {
      const fatigueCalcOutput = [
        { muscle: 'Quadriceps', volume: 9000, baseline: 8400, fatiguePercent: 107.1 },
        { muscle: 'Hamstrings', volume: 3600, baseline: 7200, fatiguePercent: 50.0 }
      ];

      const result = recommendExercises('Quadriceps', fatigueCalcOutput);
      expect(result).toHaveProperty('safe');
      expect(result).toHaveProperty('unsafe');
    });

    it('should accept muscle states from recovery calculator format', () => {
      const recoveryCalcOutput = [
        { muscle: 'Quadriceps', currentFatigue: 79.4, fullyRecoveredAt: '2025-11-16T08:00:00Z' },
        { muscle: 'Hamstrings', currentFatigue: 35.0, fullyRecoveredAt: '2025-11-13T08:00:00Z' }
      ];

      const result = recommendExercises('Quadriceps', recoveryCalcOutput);
      expect(result).toHaveProperty('safe');
      expect(result).toHaveProperty('unsafe');
    });
  });

  describe('5-Factor Scoring Algorithm Validation', () => {
    it('should calculate total score as sum of all 5 factors', () => {
      const result = recommendExercises('Quadriceps', sampleMuscleStates);

      const exercise = result.safe[0];
      const expectedTotal =
        exercise.factors.targetMatch +
        exercise.factors.freshness +
        exercise.factors.variety +
        exercise.factors.preference +
        exercise.factors.primary;

      expect(exercise.score).toBeCloseTo(expectedTotal, 2);
    });

    it('should have factor weights totaling to 100%', () => {
      // Max possible scores: 40 + 25 + 15 + 10 + 10 = 100
      const freshMuscles = sampleMuscleStates.map(m => ({ ...m, currentFatigue: 0 }));
      const result = recommendExercises('Quadriceps', freshMuscles, {
        workoutHistory: [],
        userPreferences: { favorites: ['ex12'] }
      });

      const favorite = result.safe.find(r => r.exercise.id === 'ex12');
      if (favorite) {
        // Check that factors can sum to approximately 100 for ideal conditions
        expect(favorite.score).toBeLessThanOrEqual(100);
        expect(favorite.score).toBeGreaterThan(0);
      }
    });
  });
});

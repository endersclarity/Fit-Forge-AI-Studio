import { describe, it, expect } from 'vitest';
import { calculateRecovery } from '../recoveryCalculator.js';

describe('RecoveryCalculator', () => {
  // Test data: muscle states from a hypothetical workout
  const workoutTimestamp = '2025-11-10T08:00:00Z';
  const sampleMuscleStates = [
    { muscle: 'Quadriceps', fatiguePercent: 94.4 },
    { muscle: 'Hamstrings', fatiguePercent: 113.1 },
    { muscle: 'Glutes', fatiguePercent: 72.0 },
    { muscle: 'Calves', fatiguePercent: 0 }, // Not worked
  ];

  describe('Recovery Calculation with Known Elapsed Time (AC 1, 2, 3)', () => {
    it('should calculate correct recovery after 24 hours (15% recovery)', () => {
      const currentTime = '2025-11-11T08:00:00Z'; // 24 hours later
      const result = calculateRecovery(sampleMuscleStates, workoutTimestamp, currentTime);

      // Quadriceps: 94.4 - 15 = 79.4
      const quads = result.muscleStates.find(m => m.muscle === 'Quadriceps');
      expect(quads.currentFatigue).toBe(79.4);

      // Hamstrings: 113.1 - 15 = 98.1
      const hamstrings = result.muscleStates.find(m => m.muscle === 'Hamstrings');
      expect(hamstrings.currentFatigue).toBe(98.1);

      // Glutes: 72.0 - 15 = 57.0
      const glutes = result.muscleStates.find(m => m.muscle === 'Glutes');
      expect(glutes.currentFatigue).toBe(57.0);
    });

    it('should calculate correct recovery after 48 hours (30% recovery)', () => {
      const currentTime = '2025-11-12T08:00:00Z'; // 48 hours later
      const result = calculateRecovery(sampleMuscleStates, workoutTimestamp, currentTime);

      // Quadriceps: 94.4 - 30 = 64.4
      const quads = result.muscleStates.find(m => m.muscle === 'Quadriceps');
      expect(quads.currentFatigue).toBe(64.4);

      // Hamstrings: 113.1 - 30 = 83.1
      const hamstrings = result.muscleStates.find(m => m.muscle === 'Hamstrings');
      expect(hamstrings.currentFatigue).toBe(83.1);
    });

    it('should calculate correct recovery after 72 hours (45% recovery)', () => {
      const currentTime = '2025-11-13T08:00:00Z'; // 72 hours later
      const result = calculateRecovery(sampleMuscleStates, workoutTimestamp, currentTime);

      // Quadriceps: 94.4 - 45 = 49.4
      const quads = result.muscleStates.find(m => m.muscle === 'Quadriceps');
      expect(quads.currentFatigue).toBe(49.4);

      // Hamstrings: 113.1 - 45 = 68.1
      const hamstrings = result.muscleStates.find(m => m.muscle === 'Hamstrings');
      expect(hamstrings.currentFatigue).toBe(68.1);
    });

    it('should apply floor of 0% (muscles cannot have negative fatigue)', () => {
      const lowFatigueMuscle = [{ muscle: 'Biceps', fatiguePercent: 10 }];
      // After 24 hours: 10 - 15 = -5, should be floored to 0
      const currentTime = '2025-11-11T08:00:00Z';
      const result = calculateRecovery(lowFatigueMuscle, workoutTimestamp, currentTime);

      const biceps = result.muscleStates.find(m => m.muscle === 'Biceps');
      expect(biceps.currentFatigue).toBe(0);
    });

    it('should handle partial day recovery correctly', () => {
      // 12 hours = 0.5 days = 7.5% recovery
      const currentTime = '2025-11-10T20:00:00Z';
      const muscle = [{ muscle: 'Pectoralis', fatiguePercent: 80 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      // 80 - 7.5 = 72.5
      const pec = result.muscleStates.find(m => m.muscle === 'Pectoralis');
      expect(pec.currentFatigue).toBe(72.5);
    });
  });

  describe('Recovery Projections (AC 4)', () => {
    it('should project recovery at 24h, 48h, 72h intervals', () => {
      const currentTime = '2025-11-11T08:00:00Z'; // 24 hours after workout
      const result = calculateRecovery(sampleMuscleStates, workoutTimestamp, currentTime);

      const quads = result.muscleStates.find(m => m.muscle === 'Quadriceps');
      // Current: 79.4 (after 24h from workout)
      // Projections from current time:
      expect(quads.projections['24h']).toBe(64.4); // 79.4 - 15
      expect(quads.projections['48h']).toBe(49.4); // 79.4 - 30
      expect(quads.projections['72h']).toBe(34.4); // 79.4 - 45
    });

    it('should floor projections at 0% for muscles that will fully recover', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const muscle = [{ muscle: 'Triceps', fatiguePercent: 20 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const triceps = result.muscleStates.find(m => m.muscle === 'Triceps');
      // Current: 5 (20 - 15)
      expect(triceps.currentFatigue).toBe(5);
      // Projections should be 0
      expect(triceps.projections['24h']).toBe(0); // 5 - 15 = -10, floored to 0
      expect(triceps.projections['48h']).toBe(0);
      expect(triceps.projections['72h']).toBe(0);
    });

    it('should calculate projections relative to current time, not workout time', () => {
      // 48 hours after workout
      const currentTime = '2025-11-12T08:00:00Z';
      const muscle = [{ muscle: 'Deltoids (Anterior)', fatiguePercent: 90 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const delts = result.muscleStates.find(m => m.muscle === 'Deltoids (Anterior)');
      // Current: 90 - 30 = 60
      expect(delts.currentFatigue).toBe(60);
      // Projections from NOW (not from workout):
      expect(delts.projections['24h']).toBe(45); // 60 - 15
      expect(delts.projections['48h']).toBe(30); // 60 - 30
      expect(delts.projections['72h']).toBe(15); // 60 - 45
    });
  });

  describe('Full Recovery Time Calculation (AC 5)', () => {
    it('should calculate when muscle will be fully recovered', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const muscle = [{ muscle: 'Quadriceps', fatiguePercent: 94.4 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const quads = result.muscleStates.find(m => m.muscle === 'Quadriceps');
      // Current fatigue: 79.4
      // Hours to recover: (79.4 / 15) * 24 = 127.04 hours
      // Recovery time: 2025-11-11T08:00:00Z + 127.04 hours
      expect(quads.fullyRecoveredAt).toBeDefined();
      expect(quads.fullyRecoveredAt).not.toBeNull();

      // Verify it's a valid ISO 8601 timestamp
      const recoveryDate = new Date(quads.fullyRecoveredAt);
      expect(recoveryDate.toISOString()).toBe(quads.fullyRecoveredAt);

      // Verify recovery is in the future
      const current = new Date(currentTime);
      expect(recoveryDate.getTime()).toBeGreaterThan(current.getTime());
    });

    it('should return null for fully recovered muscles', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const muscle = [{ muscle: 'Calves', fatiguePercent: 0 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const calves = result.muscleStates.find(m => m.muscle === 'Calves');
      expect(calves.currentFatigue).toBe(0);
      expect(calves.fullyRecoveredAt).toBeNull();
    });

    it('should calculate correct recovery timestamp for muscle with high fatigue', () => {
      const currentTime = '2025-11-11T08:00:00Z'; // 24 hours after workout
      const muscle = [{ muscle: 'Hamstrings', fatiguePercent: 113.1 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const hamstrings = result.muscleStates.find(m => m.muscle === 'Hamstrings');
      // Current: 98.1 (113.1 - 15)
      // Hours to recover: (98.1 / 15) * 24 = 156.96 hours
      // Should be approximately 6.54 days from current time
      expect(hamstrings.fullyRecoveredAt).toBeDefined();

      const recoveryDate = new Date(hamstrings.fullyRecoveredAt);
      const current = new Date(currentTime);
      const hoursDiff = (recoveryDate - current) / (1000 * 60 * 60);
      expect(hoursDiff).toBeCloseTo(156.96, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle muscle already fully recovered', () => {
      const currentTime = '2025-11-17T08:00:00Z'; // 7 days later (105% recovery)
      const muscle = [{ muscle: 'Biceps', fatiguePercent: 80 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const biceps = result.muscleStates.find(m => m.muscle === 'Biceps');
      // 80 - 105 = -25, floored to 0
      expect(biceps.currentFatigue).toBe(0);
      expect(biceps.fullyRecoveredAt).toBeNull();
      expect(biceps.projections['24h']).toBe(0);
      expect(biceps.projections['48h']).toBe(0);
      expect(biceps.projections['72h']).toBe(0);
    });

    it('should handle muscle with fatigue >100%', () => {
      const currentTime = '2025-11-11T08:00:00Z'; // 24 hours later
      const muscle = [{ muscle: 'Erector Spinae', fatiguePercent: 150 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const erector = result.muscleStates.find(m => m.muscle === 'Erector Spinae');
      // 150 - 15 = 135 (still very high)
      expect(erector.currentFatigue).toBe(135);

      // Should still calculate projections correctly
      expect(erector.projections['24h']).toBe(120); // 135 - 15
      expect(erector.projections['48h']).toBe(105); // 135 - 30
      expect(erector.projections['72h']).toBe(90);  // 135 - 45

      // Should have a valid recovery time
      expect(erector.fullyRecoveredAt).not.toBeNull();
    });

    it('should handle multiple muscles with varying fatigue levels', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const result = calculateRecovery(sampleMuscleStates, workoutTimestamp, currentTime);

      // Should process all muscles
      expect(result.muscleStates.length).toBe(sampleMuscleStates.length);

      // Each muscle should have correct structure
      result.muscleStates.forEach(muscle => {
        expect(muscle).toHaveProperty('muscle');
        expect(muscle).toHaveProperty('currentFatigue');
        expect(muscle).toHaveProperty('projections');
        expect(muscle.projections).toHaveProperty('24h');
        expect(muscle.projections).toHaveProperty('48h');
        expect(muscle.projections).toHaveProperty('72h');
        expect(muscle).toHaveProperty('fullyRecoveredAt');
      });
    });

    it('should handle immediate recovery calculation (0 hours elapsed)', () => {
      const currentTime = workoutTimestamp; // Same time as workout
      const muscle = [{ muscle: 'Pectoralis', fatiguePercent: 80 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const pec = result.muscleStates.find(m => m.muscle === 'Pectoralis');
      // No time has passed, fatigue should be unchanged
      expect(pec.currentFatigue).toBe(80);
    });
  });

  describe('Input Validation', () => {
    it('should throw error for null muscle states', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      expect(() => calculateRecovery(null, workoutTimestamp, currentTime)).toThrow('Muscle states array is required');
    });

    it('should throw error for non-array muscle states', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      expect(() => calculateRecovery({}, workoutTimestamp, currentTime)).toThrow('Muscle states array is required');
    });

    it('should throw error for empty muscle states array', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      expect(() => calculateRecovery([], workoutTimestamp, currentTime)).toThrow('Muscle states array cannot be empty');
    });

    it('should throw error for missing workout timestamp', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      expect(() => calculateRecovery(sampleMuscleStates, null, currentTime)).toThrow('Workout timestamp is required');
    });

    it('should throw error for missing current time', () => {
      expect(() => calculateRecovery(sampleMuscleStates, workoutTimestamp, null)).toThrow('Current time is required');
    });

    it('should throw error for invalid workout timestamp format', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      expect(() => calculateRecovery(sampleMuscleStates, 'invalid-date', currentTime)).toThrow('Invalid start time format');
    });

    it('should throw error for invalid current time format', () => {
      expect(() => calculateRecovery(sampleMuscleStates, workoutTimestamp, 'not-a-date')).toThrow('Invalid end time format');
    });

    it('should throw error for muscle state with missing muscle name', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const invalidMuscle = [{ fatiguePercent: 80 }];
      expect(() => calculateRecovery(invalidMuscle, workoutTimestamp, currentTime)).toThrow('must have a muscle name');
    });

    it('should throw error for muscle state with missing fatiguePercent', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const invalidMuscle = [{ muscle: 'Quadriceps' }];
      expect(() => calculateRecovery(invalidMuscle, workoutTimestamp, currentTime)).toThrow('must have a fatiguePercent value');
    });

    it('should throw error for muscle state with non-number fatiguePercent', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const invalidMuscle = [{ muscle: 'Quadriceps', fatiguePercent: '80' }];
      expect(() => calculateRecovery(invalidMuscle, workoutTimestamp, currentTime)).toThrow('fatiguePercent must be a number');
    });

    it('should throw error for negative fatigue', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const invalidMuscle = [{ muscle: 'Quadriceps', fatiguePercent: -10 }];
      expect(() => calculateRecovery(invalidMuscle, workoutTimestamp, currentTime)).toThrow('cannot have negative fatigue');
    });
  });

  describe('Return Data Structure', () => {
    it('should return muscleStates property (not muscles) for exerciseRecommender compatibility', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const result = calculateRecovery(sampleMuscleStates, workoutTimestamp, currentTime);

      // NEW TEST: This should expect muscleStates, not muscles
      expect(result).toHaveProperty('muscleStates');
      expect(result).not.toHaveProperty('muscles');
      expect(Array.isArray(result.muscleStates)).toBe(true);
      expect(result.timestamp).toBe(currentTime);
    });

    it('should return correct structure', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const result = calculateRecovery(sampleMuscleStates, workoutTimestamp, currentTime);

      expect(result).toHaveProperty('muscleStates');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.muscleStates)).toBe(true);
      expect(result.timestamp).toBe(currentTime);
    });

    it('should include all muscle states in response', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const result = calculateRecovery(sampleMuscleStates, workoutTimestamp, currentTime);

      expect(result.muscleStates.length).toBe(sampleMuscleStates.length);

      // Verify all original muscles are present
      sampleMuscleStates.forEach(original => {
        const found = result.muscleStates.find(m => m.muscle === original.muscle);
        expect(found).toBeDefined();
      });
    });

    it('should format numbers to 1 decimal place', () => {
      const currentTime = '2025-11-10T20:00:00Z'; // 12 hours = 7.5% recovery
      const muscle = [{ muscle: 'Pectoralis', fatiguePercent: 80 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const pec = result.muscleStates.find(m => m.muscle === 'Pectoralis');
      // Should be formatted to 1 decimal place
      expect(pec.currentFatigue).toBe(72.5);
      expect(pec.projections['24h']).toBe(57.5);
      expect(pec.projections['48h']).toBe(42.5);
      expect(pec.projections['72h']).toBe(27.5);
    });

    it('should return ISO 8601 formatted timestamps', () => {
      const currentTime = '2025-11-11T08:00:00Z';
      const muscle = [{ muscle: 'Quadriceps', fatiguePercent: 45 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const quads = result.muscleStates.find(m => m.muscle === 'Quadriceps');
      if (quads.fullyRecoveredAt) {
        // Should be valid ISO 8601
        const date = new Date(quads.fullyRecoveredAt);
        expect(date.toISOString()).toBe(quads.fullyRecoveredAt);
        // Verify it contains required ISO 8601 components
        expect(quads.fullyRecoveredAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      }

      // Timestamp should match the input (passed through unchanged)
      expect(result.timestamp).toBe(currentTime);

      // Verify timestamp is valid ISO 8601
      const timestampDate = new Date(result.timestamp);
      expect(isNaN(timestampDate.getTime())).toBe(false);
    });
  });

  describe('Algorithm Validation', () => {
    it('should match reference implementation from logic-sandbox', () => {
      // Test case from calculate-recovery.mjs: Hamstrings at 113.1%
      const currentTime = '2025-11-11T08:00:00Z'; // 24 hours later
      const muscle = [{ muscle: 'Hamstrings', fatiguePercent: 113.1 }];
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const hamstrings = result.muscleStates.find(m => m.muscle === 'Hamstrings');

      // After 1 day: 113.1 - 15 = 98.1
      expect(hamstrings.currentFatigue).toBe(98.1);
    });

    it('should validate 5-day recovery progression', () => {
      // Test progression from logic-sandbox validation
      const muscle = [{ muscle: 'Hamstrings', fatiguePercent: 113.1 }];

      const tests = [
        { hours: 24, expected: 98.1 },   // Day 1
        { hours: 48, expected: 83.1 },   // Day 2
        { hours: 72, expected: 68.1 },   // Day 3
        { hours: 96, expected: 53.1 },   // Day 4
        { hours: 120, expected: 38.1 }   // Day 5
      ];

      tests.forEach(test => {
        const currentTime = new Date(workoutTimestamp);
        currentTime.setHours(currentTime.getHours() + test.hours);
        const result = calculateRecovery(muscle, workoutTimestamp, currentTime.toISOString());

        const hamstrings = result.muscleStates.find(m => m.muscle === 'Hamstrings');
        expect(hamstrings.currentFatigue).toBeCloseTo(test.expected, 1);
      });
    });

    it('should correctly calculate recovery rate: 15% per 24 hours', () => {
      const muscle = [{ muscle: 'Quadriceps', fatiguePercent: 100 }];

      // After exactly 24 hours, should recover 15%
      const currentTime = '2025-11-11T08:00:00Z';
      const result = calculateRecovery(muscle, workoutTimestamp, currentTime);

      const quads = result.muscleStates.find(m => m.muscle === 'Quadriceps');
      expect(quads.currentFatigue).toBe(85); // 100 - 15
    });
  });
});

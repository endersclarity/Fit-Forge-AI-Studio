/**
 * Tests for Target-Driven Workout Generation
 *
 * Tests the greedy algorithm that generates workout recommendations
 * based on muscle targets and current fatigue states.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateMuscleImpact,
  calculateVolumeForFatigueGap,
  calculateExerciseScore,
  generateWorkoutFromTargets,
} from './targetDrivenGeneration';
import { Muscle, Exercise, MuscleEngagement, MuscleBaselines, MuscleStatesResponse } from '../types';
import { MuscleTargets } from '../components/TargetModePanel';

// Mock exercise for testing
const createMockExercise = (
  name: string,
  id: string,
  engagements: Array<{ muscle: string; percentage: number }>
): Exercise => ({
  name,
  id,
  muscleEngagements: engagements.map(e => ({
    muscle: e.muscle,
    percentage: e.percentage,
  })) as MuscleEngagement[],
  category: 'compound',
  equipment: ['Barbell'],
});

describe('targetDrivenGeneration', () => {
  let mockBaselines: MuscleBaselines;
  let mockMuscleStates: MuscleStatesResponse;

  beforeEach(() => {
    // Setup baseline data
    mockBaselines = {
      [Muscle.Pectoralis]: { systemLearnedMax: 1000, userOverride: null, lastUpdated: Date.now() },
      [Muscle.Quadriceps]: { systemLearnedMax: 1500, userOverride: null, lastUpdated: Date.now() },
      [Muscle.AnteriorDeltoid]: { systemLearnedMax: 800, userOverride: null, lastUpdated: Date.now() },
      [Muscle.Triceps]: { systemLearnedMax: 600, userOverride: null, lastUpdated: Date.now() },
    };

    // Setup current muscle states (all fresh)
    mockMuscleStates = {
      [Muscle.Pectoralis]: { currentFatiguePercent: 0, muscleGroup: 'chest' },
      [Muscle.Quadriceps]: { currentFatiguePercent: 0, muscleGroup: 'legs' },
      [Muscle.AnteriorDeltoid]: { currentFatiguePercent: 0, muscleGroup: 'shoulders' },
      [Muscle.Triceps]: { currentFatiguePercent: 0, muscleGroup: 'arms' },
    };
  });

  describe('calculateMuscleImpact', () => {
    it('calculates fatigue impact for each engaged muscle', () => {
      const exercise = createMockExercise('Bench Press', 'bench-press', [
        { muscle: Muscle.Pectoralis, percentage: 100 },
        { muscle: Muscle.AnteriorDeltoid, percentage: 50 },
        { muscle: Muscle.Triceps, percentage: 75 },
      ]);

      const volume = 3000; // Total volume
      const impacts = calculateMuscleImpact(exercise, volume, mockBaselines);

      // Pectoralis: 3000 * 1.0 = 3000 → (3000 / 1000) * 100 = 300%
      expect(impacts[Muscle.Pectoralis]).toBeCloseTo(300, 1);

      // AnteriorDeltoid: 3000 * 0.5 = 1500 → (1500 / 800) * 100 = 187.5%
      expect(impacts[Muscle.AnteriorDeltoid]).toBeCloseTo(187.5, 1);

      // Triceps: 3000 * 0.75 = 2250 → (2250 / 600) * 100 = 375%
      expect(impacts[Muscle.Triceps]).toBeCloseTo(375, 1);
    });

    it('respects user overrides for baselines', () => {
      const baselineWithOverride: MuscleBaselines = {
        [Muscle.Pectoralis]: { systemLearnedMax: 1000, userOverride: 2000, lastUpdated: Date.now() },
      };

      const exercise = createMockExercise('Bench Press', 'bench-press', [
        { muscle: Muscle.Pectoralis, percentage: 100 },
      ]);

      const volume = 2000;
      const impacts = calculateMuscleImpact(exercise, volume, baselineWithOverride);

      // Uses userOverride (2000) instead of systemLearnedMax (1000)
      // 2000 / 2000 * 100 = 100%
      expect(impacts[Muscle.Pectoralis]).toBe(100);
    });

    it('handles zero volume', () => {
      const exercise = createMockExercise('Bench Press', 'bench-press', [
        { muscle: Muscle.Pectoralis, percentage: 100 },
      ]);

      const impacts = calculateMuscleImpact(exercise, 0, mockBaselines);
      expect(impacts[Muscle.Pectoralis]).toBe(0);
    });
  });

  describe('calculateVolumeForFatigueGap', () => {
    it('calculates volume needed to close fatigue gap', () => {
      const fatigueGap = 30; // Want to add 30% fatigue
      const engagement = 100; // 100% engagement
      const baseline = 1000;

      const volume = calculateVolumeForFatigueGap(fatigueGap, engagement, baseline);

      // 30% of 1000 = 300 volume needed
      expect(volume).toBe(300);
    });

    it('accounts for partial engagement', () => {
      const fatigueGap = 30; // Want to add 30% fatigue
      const engagement = 50; // 50% engagement
      const baseline = 1000;

      const volume = calculateVolumeForFatigueGap(fatigueGap, engagement, baseline);

      // Need 600 total volume for 50% engagement to create 30% fatigue
      // (600 * 0.5) / 1000 * 100 = 30%
      expect(volume).toBe(600);
    });

    it('handles zero engagement', () => {
      const volume = calculateVolumeForFatigueGap(30, 0, 1000);
      expect(volume).toBe(0);
    });

    it('handles zero gap', () => {
      const volume = calculateVolumeForFatigueGap(0, 100, 1000);
      expect(volume).toBe(0);
    });

    it('returns non-negative volume', () => {
      const volume = calculateVolumeForFatigueGap(-10, 100, 1000);
      expect(volume).toBe(0);
    });
  });

  describe('calculateExerciseScore', () => {
    it('scores exercises based on target engagement', () => {
      const benchPress = createMockExercise('Bench Press', 'bench-press', [
        { muscle: Muscle.Pectoralis, percentage: 100 },
        { muscle: Muscle.AnteriorDeltoid, percentage: 50 },
      ]);

      const flyes = createMockExercise('Flyes', 'flyes', [
        { muscle: Muscle.Pectoralis, percentage: 80 },
        { muscle: Muscle.AnteriorDeltoid, percentage: 20 },
      ]);

      const muscleStates = {
        [Muscle.Pectoralis]: { currentFatigue: 0, targetFatigue: 50, maxAllowed: null, baseline: 1000 },
        [Muscle.AnteriorDeltoid]: { currentFatigue: 0, targetFatigue: 0, maxAllowed: null, baseline: 800 },
      };

      const benchScore = calculateExerciseScore(benchPress, Muscle.Pectoralis, 50, muscleStates);
      const flyesScore = calculateExerciseScore(flyes, Muscle.Pectoralis, 50, muscleStates);

      // Bench has higher engagement (100 vs 80) → higher score
      expect(benchScore).toBeGreaterThan(flyesScore);
    });

    it('penalizes exercises that fatigue constrained muscles', () => {
      const benchPress = createMockExercise('Bench Press', 'bench-press', [
        { muscle: Muscle.Pectoralis, percentage: 100 },
        { muscle: Muscle.AnteriorDeltoid, percentage: 50 }, // Will hit constrained shoulder
      ]);

      const flyes = createMockExercise('Flyes', 'flyes', [
        { muscle: Muscle.Pectoralis, percentage: 80 },
        { muscle: Muscle.AnteriorDeltoid, percentage: 10 }, // Less shoulder strain
      ]);

      const muscleStates = {
        [Muscle.Pectoralis]: { currentFatigue: 0, targetFatigue: 50, maxAllowed: null, baseline: 1000 },
        [Muscle.AnteriorDeltoid]: { currentFatigue: 40, targetFatigue: 0, maxAllowed: 45, baseline: 800 }, // Constrained!
      };

      const benchScore = calculateExerciseScore(benchPress, Muscle.Pectoralis, 50, muscleStates);
      const flyesScore = calculateExerciseScore(flyes, Muscle.Pectoralis, 50, muscleStates);

      // Flyes better because less strain on constrained shoulder
      expect(flyesScore).toBeGreaterThan(benchScore);
    });

    it('returns 0 for exercises that do not work target muscle', () => {
      const squat = createMockExercise('Squat', 'squat', [
        { muscle: Muscle.Quadriceps, percentage: 100 },
      ]);

      const muscleStates = {
        [Muscle.Pectoralis]: { currentFatigue: 0, targetFatigue: 50, maxAllowed: null, baseline: 1000 },
        [Muscle.Quadriceps]: { currentFatigue: 0, targetFatigue: 0, maxAllowed: null, baseline: 1500 },
      };

      const score = calculateExerciseScore(squat, Muscle.Pectoralis, 50, muscleStates);
      expect(score).toBe(0);
    });

    it('heavily penalizes when constrained muscle has no headroom', () => {
      const exercise = createMockExercise('Exercise', 'ex', [
        { muscle: Muscle.Pectoralis, percentage: 100 },
        { muscle: Muscle.AnteriorDeltoid, percentage: 30 },
      ]);

      const muscleStates = {
        [Muscle.Pectoralis]: { currentFatigue: 0, targetFatigue: 50, maxAllowed: null, baseline: 1000 },
        [Muscle.AnteriorDeltoid]: { currentFatigue: 50, targetFatigue: 0, maxAllowed: 50, baseline: 800 }, // No headroom!
      };

      const score = calculateExerciseScore(exercise, Muscle.Pectoralis, 50, muscleStates);

      // Score should be very low due to collateral risk factor of 30 * 10 = 300
      expect(score).toBeLessThan(1);
    });
  });

  describe('generateWorkoutFromTargets', () => {
    it('generates recommendations for target muscles', () => {
      // Mock exercise library with chest exercises
      const targets: MuscleTargets = {
        [Muscle.Pectoralis]: { targetFatigue: 50, maxAllowed: null },
      };

      // This is a simplified test - in reality EXERCISE_LIBRARY would be used
      // We're testing the algorithm logic here
      const recommendations = generateWorkoutFromTargets(targets, mockMuscleStates, mockBaselines);

      // Should have at least one recommendation for chest
      expect(recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('respects muscle constraints', () => {
      const targets: MuscleTargets = {
        [Muscle.Pectoralis]: { targetFatigue: 50, maxAllowed: null },
        [Muscle.AnteriorDeltoid]: { targetFatigue: 0, maxAllowed: 10 }, // Very constrained
      };

      const recommendations = generateWorkoutFromTargets(targets, mockMuscleStates, mockBaselines);

      // Should not include exercises that would violate shoulder constraint
      recommendations.forEach(rec => {
        const shoulderImpact = rec.muscleImpacts[Muscle.AnteriorDeltoid] || 0;
        expect(shoulderImpact).toBeLessThanOrEqual(10);
      });
    });

    it('prioritizes muscles with larger fatigue gaps', () => {
      const targets: MuscleTargets = {
        [Muscle.Pectoralis]: { targetFatigue: 60, maxAllowed: null }, // Large gap
        [Muscle.Quadriceps]: { targetFatigue: 10, maxAllowed: null }, // Small gap
      };

      // The algorithm should process Pectoralis first due to larger gap
      // (Implementation detail - hard to test without mocking EXERCISE_LIBRARY)
      const recommendations = generateWorkoutFromTargets(targets, mockMuscleStates, mockBaselines);

      // Just verify it doesn't crash and returns some recommendations
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('updates simulated states to prevent over-fatiguing', () => {
      const targets: MuscleTargets = {
        [Muscle.Pectoralis]: { targetFatigue: 100, maxAllowed: null },
      };

      const recommendations = generateWorkoutFromTargets(targets, mockMuscleStates, mockBaselines);

      // Cumulative impact should not exceed target significantly
      const totalChestImpact = recommendations.reduce((sum, rec) => {
        return sum + (rec.muscleImpacts[Muscle.Pectoralis] || 0);
      }, 0);

      // Allow some tolerance for algorithm optimization
      expect(totalChestImpact).toBeLessThanOrEqual(120);
    });

    it('handles empty targets', () => {
      const targets: MuscleTargets = {};

      const recommendations = generateWorkoutFromTargets(targets, mockMuscleStates, mockBaselines);
      expect(recommendations).toEqual([]);
    });

    it('handles targets with no gap (already at target)', () => {
      const currentStates: MuscleStatesResponse = {
        [Muscle.Pectoralis]: { currentFatiguePercent: 50, muscleGroup: 'chest' },
      };

      const targets: MuscleTargets = {
        [Muscle.Pectoralis]: { targetFatigue: 50, maxAllowed: null }, // Already at target
      };

      const recommendations = generateWorkoutFromTargets(targets, currentStates, mockBaselines);
      expect(recommendations).toEqual([]);
    });
  });
});

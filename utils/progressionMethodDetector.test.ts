/**
 * Tests for Progression Method Detector
 *
 * Tests the algorithm that detects whether a workout used weight or reps progression
 * by comparing it to the previous workout.
 */

import { describe, it, expect } from 'vitest';
import { detectProgressionMethod } from './progressionMethodDetector';
import { WorkoutSession, LoggedExercise, LoggedSet } from '../types';

// Helper function to create test workouts
function createWorkout(
  exercises: Array<{ exerciseId: string; sets: Array<{ weight: number; reps: number }> }>,
  progressionMethod?: 'weight' | 'reps'
): WorkoutSession {
  const loggedExercises: LoggedExercise[] = exercises.map(ex => ({
    exerciseId: ex.exerciseId,
    exerciseName: `Exercise ${ex.exerciseId}`,
    sets: ex.sets.map(set => ({
      weight: set.weight,
      reps: set.reps,
      toFailure: false,
      rpe: null,
      notes: null,
    } as LoggedSet)),
  }));

  const workout: WorkoutSession = {
    id: '1',
    name: 'Test Workout',
    type: 'Push',
    variation: 'A',
    startTime: Date.now(),
    endTime: Date.now() + 3600000,
    loggedExercises,
  };

  if (progressionMethod) {
    (workout as any).progressionMethod = progressionMethod;
  }

  return workout;
}

describe('progressionMethodDetector', () => {
  describe('detectProgressionMethod', () => {
    it('defaults to weight for first workout (no previous)', () => {
      const currentWorkout = createWorkout([
        { exerciseId: 'bench-press', sets: [{ weight: 200, reps: 8 }] },
      ]);

      const result = detectProgressionMethod(currentWorkout, null);
      expect(result).toBe('weight');
    });

    describe('weight progression detection', () => {
      it('detects weight increase across exercises', () => {
        const lastWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 200, reps: 8 }] },
          { exerciseId: 'squat', sets: [{ weight: 300, reps: 5 }] },
        ]);

        const currentWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 206, reps: 8 }] }, // +3%
          { exerciseId: 'squat', sets: [{ weight: 309, reps: 5 }] }, // +3%
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('weight');
      });

      it('detects weight increase with multiple sets', () => {
        const lastWorkout = createWorkout([
          {
            exerciseId: 'bench-press',
            sets: [
              { weight: 200, reps: 8 },
              { weight: 200, reps: 7 },
              { weight: 200, reps: 6 },
            ]
          },
        ]);

        const currentWorkout = createWorkout([
          {
            exerciseId: 'bench-press',
            sets: [
              { weight: 205, reps: 8 },
              { weight: 205, reps: 7 },
              { weight: 205, reps: 6 },
            ]
          },
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('weight');
      });
    });

    describe('reps progression detection', () => {
      it('detects reps increase across exercises', () => {
        const lastWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 200, reps: 8 }] },
          { exerciseId: 'squat', sets: [{ weight: 300, reps: 5 }] },
        ]);

        const currentWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 200, reps: 9 }] }, // +1 rep
          { exerciseId: 'squat', sets: [{ weight: 300, reps: 6 }] }, // +1 rep
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('reps');
      });

      it('detects reps increase with multiple sets', () => {
        const lastWorkout = createWorkout([
          {
            exerciseId: 'bench-press',
            sets: [
              { weight: 200, reps: 8 },
              { weight: 200, reps: 7 },
              { weight: 200, reps: 6 },
            ]
          },
        ]);

        const currentWorkout = createWorkout([
          {
            exerciseId: 'bench-press',
            sets: [
              { weight: 200, reps: 9 },
              { weight: 200, reps: 8 },
              { weight: 200, reps: 7 },
            ]
          },
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('reps');
      });
    });

    describe('alternation for ambiguous cases', () => {
      it('alternates when both weight and reps increased similarly', () => {
        const lastWorkout = createWorkout(
          [{ exerciseId: 'bench-press', sets: [{ weight: 200, reps: 8 }] }],
          'weight'
        );

        const currentWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 206, reps: 9 }] }, // Both increased
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('reps'); // Alternates from 'weight' to 'reps'
      });

      it('alternates when neither increased significantly', () => {
        const lastWorkout = createWorkout(
          [{ exerciseId: 'bench-press', sets: [{ weight: 200, reps: 8 }] }],
          'reps'
        );

        const currentWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 200, reps: 8 }] }, // No change
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('weight'); // Alternates from 'reps' to 'weight'
      });

      it('alternates when no common exercises exist', () => {
        const lastWorkout = createWorkout(
          [{ exerciseId: 'bench-press', sets: [{ weight: 200, reps: 8 }] }],
          'weight'
        );

        const currentWorkout = createWorkout([
          { exerciseId: 'squat', sets: [{ weight: 300, reps: 5 }] }, // Different exercise
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('reps'); // Alternates
      });
    });

    describe('threshold detection', () => {
      it('requires >= 2% change to be considered significant', () => {
        const lastWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 200, reps: 8 }] },
        ]);

        // 1% weight increase (below threshold)
        const currentWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 202, reps: 8 }] },
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        // Should alternate since increase is below threshold
        expect(result).toBe('reps'); // Defaults to alternating since no clear method
      });

      it('detects significant increase above 2% threshold', () => {
        const lastWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 200, reps: 8 }] },
        ]);

        // 5% weight increase (above threshold)
        const currentWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 210, reps: 8 }] },
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('weight');
      });
    });

    describe('average calculation across exercises', () => {
      it('averages changes across multiple exercises', () => {
        const lastWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 200, reps: 8 }] },
          { exerciseId: 'incline-press', sets: [{ weight: 180, reps: 8 }] },
          { exerciseId: 'dips', sets: [{ weight: 100, reps: 10 }] },
        ]);

        const currentWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [{ weight: 206, reps: 8 }] }, // +3%
          { exerciseId: 'incline-press', sets: [{ weight: 185, reps: 8 }] }, // +2.8%
          { exerciseId: 'dips', sets: [{ weight: 103, reps: 10 }] }, // +3%
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('weight'); // Average ~3% weight increase
      });
    });

    describe('edge cases', () => {
      it('handles empty exercise lists', () => {
        const lastWorkout = createWorkout([]);
        const currentWorkout = createWorkout([]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('reps'); // Alternates when no exercises
      });

      it('handles exercises with no sets', () => {
        const lastWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [] },
        ]);

        const currentWorkout = createWorkout([
          { exerciseId: 'bench-press', sets: [] },
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('reps'); // No data to compare
      });

      it('handles zero weight or reps', () => {
        const lastWorkout = createWorkout([
          { exerciseId: 'pull-ups', sets: [{ weight: 0, reps: 10 }] }, // Bodyweight
        ]);

        const currentWorkout = createWorkout([
          { exerciseId: 'pull-ups', sets: [{ weight: 0, reps: 12 }] },
        ]);

        const result = detectProgressionMethod(currentWorkout, lastWorkout);
        expect(result).toBe('reps'); // Reps increased
      });
    });
  });
});

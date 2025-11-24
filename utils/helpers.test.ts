/**
 * Tests for Helper Utilities
 *
 * Covers:
 * - getUserLevel (deprecated)
 * - formatDuration
 * - calculateVolume
 * - findPreviousWorkout
 * - isBodyweightExercise
 */

import { describe, it, expect } from 'vitest';
import {
  getUserLevel,
  formatDuration,
  calculateVolume,
  findPreviousWorkout,
  isBodyweightExercise,
} from './helpers';
import { WorkoutSession, Exercise } from '../types';

describe('helpers', () => {
  describe('getUserLevel (deprecated)', () => {
    it('returns level 1 for 0-2 workouts', () => {
      expect(getUserLevel(0)).toEqual({ level: 1, progress: 0, nextLevelWorkouts: 3 });
      expect(getUserLevel(1)).toEqual({ level: 1, progress: expect.any(Number), nextLevelWorkouts: 3 });
      expect(getUserLevel(2)).toEqual({ level: 1, progress: expect.any(Number), nextLevelWorkouts: 3 });
    });

    it('returns level 2 for 3-9 workouts', () => {
      const result = getUserLevel(5);
      expect(result.level).toBe(2);
      expect(result.nextLevelWorkouts).toBe(10);
    });

    it('returns level 3 for 10-19 workouts', () => {
      const result = getUserLevel(15);
      expect(result.level).toBe(3);
      expect(result.nextLevelWorkouts).toBe(20);
    });

    it('returns level 4 for 20+ workouts', () => {
      const result = getUserLevel(25);
      expect(result.level).toBe(4);
      expect(result.progress).toBe(100);
      expect(result.nextLevelWorkouts).toBe(Infinity);
    });
  });

  describe('formatDuration', () => {
    it('formats seconds only', () => {
      expect(formatDuration(30000)).toBe('30s'); // 30 seconds
      expect(formatDuration(5000)).toBe('5s');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(90000)).toBe('1m 30s'); // 1 min 30 sec
      expect(formatDuration(125000)).toBe('2m 5s');
    });

    it('formats hours, minutes, and seconds', () => {
      expect(formatDuration(3665000)).toBe('1h 1m 5s'); // 1 hour 1 min 5 sec
      expect(formatDuration(7200000)).toBe('2h'); // Exactly 2 hours
    });

    it('omits zero components', () => {
      expect(formatDuration(3600000)).toBe('1h'); // 1 hour exactly
      expect(formatDuration(60000)).toBe('1m'); // 1 minute exactly
    });

    it('handles zero duration', () => {
      expect(formatDuration(0)).toBe('0s');
    });

    it('handles very long durations', () => {
      expect(formatDuration(36000000)).toBe('10h'); // 10 hours
    });
  });

  describe('calculateVolume', () => {
    it('calculates volume correctly', () => {
      expect(calculateVolume(10, 100)).toBe(1000);
      expect(calculateVolume(5, 225)).toBe(1125);
      expect(calculateVolume(8, 135)).toBe(1080);
    });

    it('handles zero values', () => {
      expect(calculateVolume(0, 100)).toBe(0);
      expect(calculateVolume(10, 0)).toBe(0);
      expect(calculateVolume(0, 0)).toBe(0);
    });

    it('handles decimal weights', () => {
      expect(calculateVolume(10, 102.5)).toBe(1025);
      expect(calculateVolume(12, 67.5)).toBe(810);
    });
  });

  describe('findPreviousWorkout', () => {
    const createWorkout = (id: string, type: string, variation: 'A' | 'B', endTime: number): WorkoutSession => ({
      id,
      name: `${type} ${variation}`,
      type,
      variation,
      startTime: endTime - 3600000,
      endTime,
      loggedExercises: [],
    });

    it('finds previous workout of same type and variation', () => {
      const workouts: WorkoutSession[] = [
        createWorkout('1', 'Push', 'A', Date.now() - 86400000 * 3), // 3 days ago
        createWorkout('2', 'Push', 'A', Date.now() - 86400000), // 1 day ago
        createWorkout('3', 'Push', 'B', Date.now() - 86400000 * 2),
      ];

      const current = createWorkout('4', 'Push', 'A', Date.now());
      const previous = findPreviousWorkout(current, workouts);

      expect(previous?.id).toBe('2'); // Most recent Push A
    });

    it('returns undefined when no matching workout exists', () => {
      const workouts: WorkoutSession[] = [
        createWorkout('1', 'Pull', 'A', Date.now() - 86400000),
      ];

      const current = createWorkout('2', 'Push', 'A', Date.now());
      const previous = findPreviousWorkout(current, workouts);

      expect(previous).toBeUndefined();
    });

    it('excludes current workout from search', () => {
      const workouts: WorkoutSession[] = [
        createWorkout('1', 'Push', 'A', Date.now() - 86400000), // 1 day ago
        createWorkout('2', 'Push', 'A', Date.now()), // Current
      ];

      const current = workouts[1];
      const previous = findPreviousWorkout(current, workouts);

      expect(previous?.id).toBe('1');
    });

    it('differentiates by variation', () => {
      const workouts: WorkoutSession[] = [
        createWorkout('1', 'Push', 'A', Date.now() - 86400000 * 3),
        createWorkout('2', 'Push', 'B', Date.now() - 86400000),
      ];

      const current = createWorkout('3', 'Push', 'A', Date.now());
      const previous = findPreviousWorkout(current, workouts);

      expect(previous?.id).toBe('1'); // Finds Push A, not Push B
    });

    it('returns most recent matching workout', () => {
      const workouts: WorkoutSession[] = [
        createWorkout('1', 'Push', 'A', Date.now() - 86400000 * 5),
        createWorkout('2', 'Push', 'A', Date.now() - 86400000 * 2),
        createWorkout('3', 'Push', 'A', Date.now() - 86400000),
      ];

      const current = createWorkout('4', 'Push', 'A', Date.now());
      const previous = findPreviousWorkout(current, workouts);

      expect(previous?.id).toBe('3'); // Most recent
    });

    it('handles empty workout array', () => {
      const current = createWorkout('1', 'Push', 'A', Date.now());
      const previous = findPreviousWorkout(current, []);

      expect(previous).toBeUndefined();
    });
  });

  describe('isBodyweightExercise', () => {
    it('identifies bodyweight exercises with array equipment', () => {
      const exercise: Exercise = {
        name: 'Push-ups',
        id: 'push-ups',
        muscleEngagements: [],
        category: 'compound',
        equipment: ['Bodyweight'],
      };

      expect(isBodyweightExercise(exercise)).toBe(true);
    });

    it('identifies TRX exercises', () => {
      const exercise: Exercise = {
        name: 'TRX Rows',
        id: 'trx-rows',
        muscleEngagements: [],
        category: 'compound',
        equipment: ['TRX'],
      };

      expect(isBodyweightExercise(exercise)).toBe(true);
    });

    it('identifies pull-up bar exercises', () => {
      const exercise: Exercise = {
        name: 'Pull-ups',
        id: 'pull-ups',
        muscleEngagements: [],
        category: 'compound',
        equipment: ['Pull-up Bar'],
      };

      expect(isBodyweightExercise(exercise)).toBe(true);
    });

    it('identifies bodyweight in mixed equipment array', () => {
      const exercise: Exercise = {
        name: 'Dips',
        id: 'dips',
        muscleEngagements: [],
        category: 'compound',
        equipment: ['Bodyweight', 'Dip Station'],
      };

      expect(isBodyweightExercise(exercise)).toBe(true);
    });

    it('returns false for weighted exercises', () => {
      const exercise: Exercise = {
        name: 'Bench Press',
        id: 'bench-press',
        muscleEngagements: [],
        category: 'compound',
        equipment: ['Barbell'],
      };

      expect(isBodyweightExercise(exercise)).toBe(false);
    });

    it('handles string equipment field (legacy)', () => {
      const exercise: Exercise = {
        name: 'Push-ups',
        id: 'push-ups',
        muscleEngagements: [],
        category: 'compound',
        equipment: 'Bodyweight' as any,
      };

      expect(isBodyweightExercise(exercise)).toBe(true);
    });

    it('returns false for null exercise', () => {
      expect(isBodyweightExercise(null)).toBe(false);
    });

    it('returns false for undefined exercise', () => {
      expect(isBodyweightExercise(undefined)).toBe(false);
    });

    it('handles empty equipment array', () => {
      const exercise: Exercise = {
        name: 'Exercise',
        id: 'exercise',
        muscleEngagements: [],
        category: 'compound',
        equipment: [],
      };

      expect(isBodyweightExercise(exercise)).toBe(false);
    });
  });
});

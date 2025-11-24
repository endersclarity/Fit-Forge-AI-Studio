/**
 * Tests for Stats Helper Utilities
 *
 * Covers:
 * - calculateStreak
 * - calculateWeeklyStats
 * - findRecentPRs
 * - groupMusclesByRecovery
 * - formatRelativeDate
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateStreak,
  calculateWeeklyStats,
  findRecentPRs,
  groupMusclesByRecovery,
  formatRelativeDate,
} from './statsHelpers';
import { WorkoutResponse, PersonalBestsResponse, MuscleStatesResponse } from '../types';

describe('statsHelpers', () => {
  describe('calculateStreak', () => {
    it('returns 0 for empty workout array', () => {
      expect(calculateStreak([])).toBe(0);
    });

    it('returns 0 when last workout was more than 1 day ago', () => {
      const workouts: WorkoutResponse[] = [
        { id: '1', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() } as any,
      ];

      expect(calculateStreak(workouts)).toBe(0);
    });

    it('calculates streak with workout today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);

      const workouts: WorkoutResponse[] = [
        { id: '1', date: today.toISOString() } as any,
        { id: '2', date: yesterday.toISOString() } as any,
        { id: '3', date: twoDaysAgo.toISOString() } as any,
      ];

      expect(calculateStreak(workouts)).toBe(3);
    });

    it('calculates streak with workout yesterday', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const workouts: WorkoutResponse[] = [
        { id: '1', date: yesterday.toISOString() } as any,
      ];

      expect(calculateStreak(workouts)).toBeGreaterThanOrEqual(1);
    });

    it('stops counting when gap is found', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3); // Gap on day -2

      const workouts: WorkoutResponse[] = [
        { id: '1', date: today.toISOString() } as any,
        { id: '2', date: yesterday.toISOString() } as any,
        { id: '3', date: threeDaysAgo.toISOString() } as any, // Should not count
      ];

      expect(calculateStreak(workouts)).toBe(2);
    });

    it('handles multiple workouts on same day', () => {
      const today = new Date();
      const workouts: WorkoutResponse[] = [
        { id: '1', date: today.toISOString() } as any,
        { id: '2', date: today.toISOString() } as any,
        { id: '3', date: today.toISOString() } as any,
      ];

      expect(calculateStreak(workouts)).toBe(1); // Same day counts as 1
    });
  });

  describe('calculateWeeklyStats', () => {
    it('returns zero for empty workout array', () => {
      const stats = calculateWeeklyStats([]);
      expect(stats).toEqual({ thisWeek: 0, lastWeek: 0 });
    });

    it('counts workouts in current week', () => {
      const today = new Date();
      const workouts: WorkoutResponse[] = [
        { id: '1', date: today.toISOString() } as any,
        { id: '2', date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString() } as any,
      ];

      const stats = calculateWeeklyStats(workouts);
      expect(stats.thisWeek).toBeGreaterThanOrEqual(1);
    });

    it('separates current week from last week', () => {
      const now = new Date();

      // Get current week start (Sunday)
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      // Last week's workout
      const lastWeek = new Date(currentWeekStart);
      lastWeek.setDate(currentWeekStart.getDate() - 7);

      const workouts: WorkoutResponse[] = [
        { id: '1', date: now.toISOString() } as any, // This week
        { id: '2', date: lastWeek.toISOString() } as any, // Last week
      ];

      const stats = calculateWeeklyStats(workouts);
      expect(stats.thisWeek).toBeGreaterThanOrEqual(1);
      expect(stats.lastWeek).toBeGreaterThanOrEqual(1);
    });

    it('ignores workouts older than last week', () => {
      const now = new Date();
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(now.getDate() - 14);

      const workouts: WorkoutResponse[] = [
        { id: '1', date: now.toISOString() } as any,
        { id: '2', date: twoWeeksAgo.toISOString() } as any,
      ];

      const stats = calculateWeeklyStats(workouts);
      expect(stats.thisWeek + stats.lastWeek).toBe(1); // Only counts this week's workout
    });
  });

  describe('findRecentPRs', () => {
    it('returns empty array when no workouts', () => {
      const prs = findRecentPRs({}, []);
      expect(prs).toEqual([]);
    });

    it('finds PRs from last 7 days', () => {
      const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

      const workouts: WorkoutResponse[] = [
        {
          id: '1',
          date: recentDate,
          prs: [
            {
              exercise: 'Bench Press',
              isPR: true,
              isFirstTime: false,
              percentIncrease: 5.2,
            },
          ],
        } as any,
      ];

      const prs = findRecentPRs({}, workouts);
      expect(prs).toHaveLength(1);
      expect(prs[0].exercise).toBe('Bench Press');
      expect(prs[0].improvement).toBe(5.2);
    });

    it('excludes first-time PRs', () => {
      const recentDate = new Date().toISOString();

      const workouts: WorkoutResponse[] = [
        {
          id: '1',
          date: recentDate,
          prs: [
            {
              exercise: 'Squat',
              isPR: true,
              isFirstTime: true, // First time, should exclude
              percentIncrease: 0,
            },
          ],
        } as any,
      ];

      const prs = findRecentPRs({}, workouts);
      expect(prs).toEqual([]);
    });

    it('excludes PRs older than 7 days', () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

      const workouts: WorkoutResponse[] = [
        {
          id: '1',
          date: oldDate,
          prs: [
            {
              exercise: 'Deadlift',
              isPR: true,
              isFirstTime: false,
              percentIncrease: 3.5,
            },
          ],
        } as any,
      ];

      const prs = findRecentPRs({}, workouts);
      expect(prs).toEqual([]);
    });

    it('returns top 3 PRs sorted by improvement', () => {
      const recentDate = new Date().toISOString();

      const workouts: WorkoutResponse[] = [
        {
          id: '1',
          date: recentDate,
          prs: [
            { exercise: 'Exercise A', isPR: true, isFirstTime: false, percentIncrease: 2.0 },
            { exercise: 'Exercise B', isPR: true, isFirstTime: false, percentIncrease: 5.5 },
            { exercise: 'Exercise C', isPR: true, isFirstTime: false, percentIncrease: 3.2 },
            { exercise: 'Exercise D', isPR: true, isFirstTime: false, percentIncrease: 4.1 },
          ],
        } as any,
      ];

      const prs = findRecentPRs({}, workouts);
      expect(prs).toHaveLength(3);
      expect(prs[0].exercise).toBe('Exercise B'); // Highest improvement
      expect(prs[1].exercise).toBe('Exercise D');
      expect(prs[2].exercise).toBe('Exercise C');
    });
  });

  describe('groupMusclesByRecovery', () => {
    it('returns empty groups for null input', () => {
      const groups = groupMusclesByRecovery(null as any);
      expect(groups.ready).toEqual([]);
      expect(groups.recovering).toEqual([]);
      expect(groups.fatigued).toEqual([]);
    });

    it('groups fully recovered muscles as ready', () => {
      const muscleStates: MuscleStatesResponse = {
        Pectoralis: { currentFatiguePercent: 0, daysUntilRecovered: 0 } as any,
        Quadriceps: { currentFatiguePercent: 5, daysUntilRecovered: -1 } as any,
      };

      const groups = groupMusclesByRecovery(muscleStates);
      expect(groups.ready).toHaveLength(2);
      expect(groups.recovering).toHaveLength(0);
      expect(groups.fatigued).toHaveLength(0);
    });

    it('groups muscles recovering in 1-2 days', () => {
      const muscleStates: MuscleStatesResponse = {
        Pectoralis: { currentFatiguePercent: 20, daysUntilRecovered: 1 } as any,
        AnteriorDeltoid: { currentFatiguePercent: 25, daysUntilRecovered: 2 } as any,
      };

      const groups = groupMusclesByRecovery(muscleStates);
      expect(groups.ready).toHaveLength(0);
      expect(groups.recovering).toHaveLength(2);
      expect(groups.fatigued).toHaveLength(0);
    });

    it('groups muscles with 3+ days as fatigued', () => {
      const muscleStates: MuscleStatesResponse = {
        Quadriceps: { currentFatiguePercent: 80, daysUntilRecovered: 3 } as any,
        Hamstrings: { currentFatiguePercent: 90, daysUntilRecovered: 5 } as any,
      };

      const groups = groupMusclesByRecovery(muscleStates);
      expect(groups.ready).toHaveLength(0);
      expect(groups.recovering).toHaveLength(0);
      expect(groups.fatigued).toHaveLength(2);
    });

    it('sorts groups alphabetically', () => {
      const muscleStates: MuscleStatesResponse = {
        Triceps: { currentFatiguePercent: 0, daysUntilRecovered: 0 } as any,
        Biceps: { currentFatiguePercent: 0, daysUntilRecovered: 0 } as any,
        Pectoralis: { currentFatiguePercent: 0, daysUntilRecovered: 0 } as any,
      };

      const groups = groupMusclesByRecovery(muscleStates);
      expect(groups.ready[0].muscle).toBe('Biceps');
      expect(groups.ready[1].muscle).toBe('Pectoralis');
      expect(groups.ready[2].muscle).toBe('Triceps');
    });
  });

  describe('formatRelativeDate', () => {
    it('formats today', () => {
      const today = new Date();
      expect(formatRelativeDate(today.toISOString())).toBe('Today');
      expect(formatRelativeDate(today.getTime())).toBe('Today');
    });

    it('formats yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatRelativeDate(yesterday.toISOString())).toBe('Yesterday');
    });

    it('formats recent days (2-6 days ago)', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(formatRelativeDate(threeDaysAgo.toISOString())).toBe('3 days ago');
    });

    it('formats older dates as absolute', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const result = formatRelativeDate(tenDaysAgo.toISOString());
      expect(result).toMatch(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d+$/);
    });

    it('handles timestamp numbers', () => {
      const today = Date.now();
      expect(formatRelativeDate(today)).toBe('Today');
    });
  });
});

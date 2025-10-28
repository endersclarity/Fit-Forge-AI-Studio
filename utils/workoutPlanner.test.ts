import { describe, it, expect } from 'vitest';
import { calculateForecastedFatigue, formatMuscleImpact } from './workoutPlanner';
import { Muscle, PlannedExercise, MuscleBaselinesResponse, Exercise } from '../types';

// Test exercise data (based on actual EXERCISE_LIBRARY)
const DUMBBELL_BENCH_PRESS: Exercise = {
  id: "ex02",
  name: "Dumbbell Bench Press",
  category: "Push",
  equipment: "Dumbbells",
  difficulty: "Intermediate",
  muscleEngagements: [
    { muscle: Muscle.Pectoralis, percentage: 85 },
    { muscle: Muscle.Triceps, percentage: 35 },
    { muscle: Muscle.Deltoids, percentage: 35 },
  ],
  variation: "A",
};

const PULL_UPS: Exercise = {
  id: "ex04",
  name: "Pull-ups",
  category: "Pull",
  equipment: "Pull-up Bar",
  difficulty: "Intermediate",
  muscleEngagements: [
    { muscle: Muscle.Lats, percentage: 75 },
    { muscle: Muscle.Biceps, percentage: 55 },
    { muscle: Muscle.Rhomboids, percentage: 40 },
  ],
  variation: "Both",
};

const SQUATS: Exercise = {
  id: "ex18",
  name: "Goblet Squat",
  category: "Legs",
  equipment: "Dumbbells",
  difficulty: "Beginner",
  muscleEngagements: [
    { muscle: Muscle.Quadriceps, percentage: 85 },
    { muscle: Muscle.Glutes, percentage: 70 },
    { muscle: Muscle.Hamstrings, percentage: 30 },
    { muscle: Muscle.Core, percentage: 20 },
  ],
  variation: "Both",
};

// Test baselines
const TEST_BASELINES: MuscleBaselinesResponse = {
  [Muscle.Pectoralis]: { systemLearnedMax: 5000, userOverride: null },
  [Muscle.Triceps]: { systemLearnedMax: 3000, userOverride: null },
  [Muscle.Deltoids]: { systemLearnedMax: 3000, userOverride: null },
  [Muscle.Lats]: { systemLearnedMax: 6000, userOverride: null },
  [Muscle.Biceps]: { systemLearnedMax: 2500, userOverride: null },
  [Muscle.Rhomboids]: { systemLearnedMax: 3000, userOverride: null },
  [Muscle.Quadriceps]: { systemLearnedMax: 8000, userOverride: null },
  [Muscle.Glutes]: { systemLearnedMax: 7000, userOverride: null },
  [Muscle.Hamstrings]: { systemLearnedMax: 5000, userOverride: null },
  [Muscle.Trapezius]: { systemLearnedMax: 3000, userOverride: null },
  [Muscle.Forearms]: { systemLearnedMax: 2000, userOverride: null },
  [Muscle.Calves]: { systemLearnedMax: 4000, userOverride: null },
  [Muscle.Core]: { systemLearnedMax: 4000, userOverride: null },
};

describe('calculateForecastedFatigue', () => {
  describe('Single Exercise Calculations', () => {
    it('calculates fatigue for single exercise correctly', () => {
      const planned: PlannedExercise[] = [{
        exercise: DUMBBELL_BENCH_PRESS,
        sets: 3,
        reps: 10,
        weight: 50
      }];

      const result = calculateForecastedFatigue(planned, TEST_BASELINES);

      // 3 sets × 10 reps × 50 lbs = 1500 lbs total volume
      // Pectoralis engagement: 85%
      // 1500 × 0.85 = 1275 lbs
      // 1275 / 5000 × 100 = 25.5%
      expect(result[Muscle.Pectoralis].forecastedFatiguePercent).toBeCloseTo(25.5, 1);
      expect(result[Muscle.Pectoralis].volumeAdded).toBe(1275);
      expect(result[Muscle.Pectoralis].baseline).toBe(5000);
      expect(result[Muscle.Pectoralis].currentFatiguePercent).toBe(0);

      // Triceps engagement: 35%
      // 1500 × 0.35 = 525 lbs
      // 525 / 3000 × 100 = 17.5%
      expect(result[Muscle.Triceps].forecastedFatiguePercent).toBeCloseTo(17.5, 1);
      expect(result[Muscle.Triceps].volumeAdded).toBe(525);

      // Deltoids engagement: 35%
      // 1500 × 0.35 = 525 lbs
      // 525 / 3000 × 100 = 17.5%
      expect(result[Muscle.Deltoids].forecastedFatiguePercent).toBeCloseTo(17.5, 1);
      expect(result[Muscle.Deltoids].volumeAdded).toBe(525);
    });

    it('handles bodyweight exercise (pull-ups)', () => {
      const planned: PlannedExercise[] = [{
        exercise: PULL_UPS,
        sets: 4,
        reps: 8,
        weight: 180  // Bodyweight
      }];

      const result = calculateForecastedFatigue(planned, TEST_BASELINES);

      // 4 sets × 8 reps × 180 lbs = 5760 lbs total volume
      // Lats engagement: 75%
      // 5760 × 0.75 = 4320 lbs
      // 4320 / 6000 × 100 = 72%
      expect(result[Muscle.Lats].forecastedFatiguePercent).toBeCloseTo(72, 1);
      expect(result[Muscle.Lats].volumeAdded).toBe(4320);

      // Biceps engagement: 55%
      // 5760 × 0.55 = 3168 lbs
      // 3168 / 2500 × 100 = 126.72% → capped at 100%
      expect(result[Muscle.Biceps].forecastedFatiguePercent).toBe(100);
      expect(result[Muscle.Biceps].volumeAdded).toBeCloseTo(3168, 1);
    });
  });

  describe('Multiple Exercise Calculations', () => {
    it('combines multiple exercises correctly', () => {
      const planned: PlannedExercise[] = [
        {
          exercise: DUMBBELL_BENCH_PRESS,
          sets: 3,
          reps: 10,
          weight: 50
        },
        {
          exercise: PULL_UPS,
          sets: 3,
          reps: 8,
          weight: 180
        }
      ];

      const result = calculateForecastedFatigue(planned, TEST_BASELINES);

      // Bench: 3×10×50 = 1500 lbs, Pec 85% = 1275 lbs
      // Pull-ups: 3×8×180 = 4320 lbs, Lats 75% = 3240 lbs
      expect(result[Muscle.Pectoralis].forecastedFatiguePercent).toBeCloseTo(25.5, 1);
      expect(result[Muscle.Lats].forecastedFatiguePercent).toBeCloseTo(54, 1);
    });

    it('accumulates fatigue from multiple exercises on same muscle', () => {
      const planned: PlannedExercise[] = [
        {
          exercise: SQUATS,
          sets: 3,
          reps: 12,
          weight: 60
        },
        {
          exercise: PULL_UPS,
          sets: 3,
          reps: 8,
          weight: 180
        }
      ];

      const result = calculateForecastedFatigue(planned, TEST_BASELINES);

      // Squats: 3×12×60 = 2160 lbs
      // Core engagement (squats): 20% = 432 lbs
      // Core from pull-ups: 0 lbs (not engaged)
      // Total core: 432 / 4000 × 100 = 10.8%
      expect(result[Muscle.Core].forecastedFatiguePercent).toBeCloseTo(10.8, 1);
      expect(result[Muscle.Core].volumeAdded).toBe(432);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero exercises (empty plan)', () => {
      const result = calculateForecastedFatigue([], TEST_BASELINES);

      // All muscles should have 0% fatigue
      expect(result[Muscle.Pectoralis].forecastedFatiguePercent).toBe(0);
      expect(result[Muscle.Pectoralis].volumeAdded).toBe(0);
      expect(result[Muscle.Lats].forecastedFatiguePercent).toBe(0);
    });

    it('caps fatigue at 100%', () => {
      const planned: PlannedExercise[] = [{
        exercise: DUMBBELL_BENCH_PRESS,
        sets: 10,
        reps: 20,
        weight: 100
      }];

      const result = calculateForecastedFatigue(planned, TEST_BASELINES);

      // 10×20×100 = 20,000 lbs
      // Pec 85% = 17,000 lbs
      // 17,000 / 5000 × 100 = 340% → capped at 100%
      expect(result[Muscle.Pectoralis].forecastedFatiguePercent).toBe(100);
      expect(result[Muscle.Pectoralis].volumeAdded).toBe(17000);
    });

    it('handles missing baseline (uses default)', () => {
      const emptyBaselines: MuscleBaselinesResponse = {} as MuscleBaselinesResponse;

      const planned: PlannedExercise[] = [{
        exercise: DUMBBELL_BENCH_PRESS,
        sets: 3,
        reps: 10,
        weight: 50
      }];

      const result = calculateForecastedFatigue(planned, emptyBaselines);

      // Should use default baseline of 5000
      // 1500 × 0.85 = 1275 lbs
      // 1275 / 5000 × 100 = 25.5%
      expect(result[Muscle.Pectoralis].forecastedFatiguePercent).toBeCloseTo(25.5, 1);
      expect(result[Muscle.Pectoralis].baseline).toBe(5000);
    });

    it('respects user override baseline over learned max', () => {
      const baselinesWithOverride: MuscleBaselinesResponse = {
        ...TEST_BASELINES,
        [Muscle.Pectoralis]: { systemLearnedMax: 5000, userOverride: 3000 }
      };

      const planned: PlannedExercise[] = [{
        exercise: DUMBBELL_BENCH_PRESS,
        sets: 3,
        reps: 10,
        weight: 50
      }];

      const result = calculateForecastedFatigue(planned, baselinesWithOverride);

      // Should use userOverride of 3000 instead of systemLearnedMax
      // 1275 / 3000 × 100 = 42.5%
      expect(result[Muscle.Pectoralis].forecastedFatiguePercent).toBeCloseTo(42.5, 1);
      expect(result[Muscle.Pectoralis].baseline).toBe(3000);
    });
  });

  describe('Current Fatigue Integration', () => {
    it('adds new fatigue to existing fatigue', () => {
      const currentFatigue = {
        [Muscle.Pectoralis]: 30,
        [Muscle.Triceps]: 15
      };

      const planned: PlannedExercise[] = [{
        exercise: DUMBBELL_BENCH_PRESS,
        sets: 3,
        reps: 10,
        weight: 50
      }];

      const result = calculateForecastedFatigue(
        planned,
        TEST_BASELINES,
        currentFatigue
      );

      // Current: 30%
      // Added: 25.5%
      // Total: 55.5%
      expect(result[Muscle.Pectoralis].currentFatiguePercent).toBe(30);
      expect(result[Muscle.Pectoralis].forecastedFatiguePercent).toBeCloseTo(55.5, 1);

      // Current: 15%
      // Added: 17.5%
      // Total: 32.5%
      expect(result[Muscle.Triceps].currentFatiguePercent).toBe(15);
      expect(result[Muscle.Triceps].forecastedFatiguePercent).toBeCloseTo(32.5, 1);
    });

    it('caps total fatigue at 100% even with existing fatigue', () => {
      const currentFatigue = {
        [Muscle.Pectoralis]: 80
      };

      const planned: PlannedExercise[] = [{
        exercise: DUMBBELL_BENCH_PRESS,
        sets: 3,
        reps: 10,
        weight: 50
      }];

      const result = calculateForecastedFatigue(
        planned,
        TEST_BASELINES,
        currentFatigue
      );

      // Current: 80%
      // Added: 25.5%
      // Total: 105.5% → capped at 100%
      expect(result[Muscle.Pectoralis].currentFatiguePercent).toBe(80);
      expect(result[Muscle.Pectoralis].forecastedFatiguePercent).toBe(100);
    });
  });

  describe('All Muscles Initialized', () => {
    it('returns data for all 13 muscles', () => {
      const planned: PlannedExercise[] = [{
        exercise: DUMBBELL_BENCH_PRESS,
        sets: 3,
        reps: 10,
        weight: 50
      }];

      const result = calculateForecastedFatigue(planned, TEST_BASELINES);

      // Should have all 13 muscles
      const allMuscles = [
        Muscle.Pectoralis,
        Muscle.Triceps,
        Muscle.Deltoids,
        Muscle.Lats,
        Muscle.Biceps,
        Muscle.Rhomboids,
        Muscle.Trapezius,
        Muscle.Forearms,
        Muscle.Quadriceps,
        Muscle.Glutes,
        Muscle.Hamstrings,
        Muscle.Calves,
        Muscle.Core,
      ];

      allMuscles.forEach(muscle => {
        expect(result[muscle]).toBeDefined();
        expect(result[muscle].muscle).toBe(muscle);
        expect(result[muscle].forecastedFatiguePercent).toBeGreaterThanOrEqual(0);
        expect(result[muscle].forecastedFatiguePercent).toBeLessThanOrEqual(100);
      });
    });

    it('sets 0% for untrained muscles', () => {
      const planned: PlannedExercise[] = [{
        exercise: DUMBBELL_BENCH_PRESS,
        sets: 3,
        reps: 10,
        weight: 50
      }];

      const result = calculateForecastedFatigue(planned, TEST_BASELINES);

      // Bench press doesn't engage legs
      expect(result[Muscle.Quadriceps].forecastedFatiguePercent).toBe(0);
      expect(result[Muscle.Glutes].forecastedFatiguePercent).toBe(0);
      expect(result[Muscle.Hamstrings].forecastedFatiguePercent).toBe(0);
      expect(result[Muscle.Calves].forecastedFatiguePercent).toBe(0);
    });
  });
});

describe('formatMuscleImpact', () => {
  it('formats muscle impact for display', () => {
    const impacts = formatMuscleImpact(
      DUMBBELL_BENCH_PRESS,
      3,
      10,
      50,
      TEST_BASELINES
    );

    // Should show Pec, Tri, Delt (all >5% engagement)
    expect(impacts).toHaveLength(3);
    expect(impacts[0]).toMatch(/Pectoralis \+\d+%/);
    expect(impacts[1]).toMatch(/(Triceps|Deltoids) \+\d+%/);
    expect(impacts[2]).toMatch(/(Triceps|Deltoids) \+\d+%/);
  });

  it('orders muscles by impact (highest first)', () => {
    const impacts = formatMuscleImpact(
      DUMBBELL_BENCH_PRESS,
      3,
      10,
      50,
      TEST_BASELINES
    );

    // Pectoralis should be first (highest engagement)
    expect(impacts[0]).toContain('Pectoralis');
  });

  it('filters out muscles with <5% engagement', () => {
    const impacts = formatMuscleImpact(
      SQUATS,
      3,
      12,
      60,
      TEST_BASELINES
    );

    // Squats: Quad 85%, Glutes 70%, Hamstrings 30%, Core 20%
    // All >5%, so should show all 4
    expect(impacts).toHaveLength(4);
  });

  it('handles zero sets/reps/weight', () => {
    const impacts = formatMuscleImpact(
      DUMBBELL_BENCH_PRESS,
      0,
      0,
      0,
      TEST_BASELINES
    );

    // No volume = no impact, but should still return array (empty or with 0%)
    expect(impacts).toBeDefined();
    expect(Array.isArray(impacts)).toBe(true);
  });
});

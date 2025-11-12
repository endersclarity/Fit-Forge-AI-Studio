/**
 * Integration Test Data Fixtures
 *
 * Centralized test data for end-to-end integration tests.
 * Contains validated workout fixtures matching logic-sandbox calculations.
 */

/**
 * Test user ID used across all integration tests
 */
export const TEST_USER_ID = 1;

/**
 * Baseline Workout Fixture
 *
 * Exercises:
 * - ex01: Goblet Squat 3x10@70 lbs
 * - ex03: Romanian Deadlift (RDL) 3x10@100 lbs
 *
 * Expected Fatigue (validated against logic-sandbox):
 * - Quadriceps: 15%
 * - Glutes: 26%
 * - Hamstrings: 31%
 * - Core: 21%
 * - LowerBack: 5%
 */
export const BASELINE_WORKOUT = {
  date: new Date().toISOString(),
  exercises: [
    {
      exercise: 'Goblet Squat', // ex01
      sets: [
        { reps: 10, weight: 70, to_failure: false },
        { reps: 10, weight: 70, to_failure: false },
        { reps: 10, weight: 70, to_failure: false }
      ]
    },
    {
      exercise: 'Romanian Deadlift (RDL)', // ex03
      sets: [
        { reps: 10, weight: 100, to_failure: false },
        { reps: 10, weight: 100, to_failure: false },
        { reps: 10, weight: 100, to_failure: false }
      ]
    }
  ]
};

/**
 * Expected Fatigue Values for BASELINE_WORKOUT
 *
 * These values match the logic-sandbox validated calculations.
 * Use with toBeCloseTo(value, 0) for ±0.5 tolerance.
 */
export const EXPECTED_FATIGUE = {
  Quadriceps: 15,
  Glutes: 26,
  Hamstrings: 31,
  Core: 21,
  LowerBack: 5
};

/**
 * Baseline Exceeding Workout Fixture
 *
 * Exercise:
 * - ex03: Romanian Deadlift (RDL) 3x15@300 lbs
 *
 * Total Volume: 13,500 (3 sets × 15 reps × 300 lbs)
 * Primary Muscle: Hamstrings (45% intensity)
 * Volume for Hamstrings: 6,075 (13,500 × 0.45)
 *
 * Baseline Threshold: 5,200 (Hamstrings baseline)
 * Expected Result: Volume (6,075) exceeds baseline (5,200)
 *                  Should trigger baseline update modal
 */
export const BASELINE_EXCEEDING_WORKOUT = {
  date: new Date().toISOString(),
  exercises: [
    {
      exercise: 'Romanian Deadlift (RDL)', // ex03
      sets: [
        { reps: 15, weight: 300, to_failure: false },
        { reps: 15, weight: 300, to_failure: false },
        { reps: 15, weight: 300, to_failure: false }
      ]
    }
  ]
};

/**
 * Expected Baseline Update Values for BASELINE_EXCEEDING_WORKOUT
 */
export const EXPECTED_BASELINE_UPDATE = {
  muscleName: 'Hamstrings',
  currentBaseline: 5200,
  volumeAchieved: 6075, // Approximate, use toBeCloseTo for assertions
  suggestedBaselineMin: 5200 // Should suggest value > current baseline
};

/**
 * Planned Workout for Forecast Testing
 *
 * Exercises:
 * - ex02: Dumbbell Bench Press 3x10@50 lbs (Primary: Pectoralis 60%)
 * - ex04: Pull-ups 3x8@180 lbs (Primary: Lats 55%)
 *
 * Expected Forecast:
 * - Pectoralis: ~25.5% fatigue, 1,275 volume
 * - Lats: ~19.8% fatigue, 2,376 volume
 */
export const PLANNED_WORKOUT_FORECAST = {
  plannedExercises: [
    {
      exercise: 'Dumbbell Bench Press', // ex02
      sets: [
        { reps: 10, weight: 50 },
        { reps: 10, weight: 50 },
        { reps: 10, weight: 50 }
      ]
    },
    {
      exercise: 'Pull-ups', // ex04
      sets: [
        { reps: 8, weight: 180 },
        { reps: 8, weight: 180 },
        { reps: 8, weight: 180 }
      ]
    }
  ]
};

/**
 * Expected Forecast Values for PLANNED_WORKOUT_FORECAST
 */
export const EXPECTED_FORECAST = {
  Pectoralis: {
    forecastedFatiguePercent: 25.5, // Approximate, use tolerance
    volumeAdded: 1275
  },
  Lats: {
    forecastedFatiguePercent: 19.8, // Approximate, use tolerance
    volumeAdded: 2376
  }
};

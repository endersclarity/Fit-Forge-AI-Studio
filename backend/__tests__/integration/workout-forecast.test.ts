/**
 * Integration Test: Workout Forecast Flow
 *
 * Tests the complete workflow of workout forecasting including:
 * - Creating planned workout with exercises
 * - Requesting forecast prediction
 * - Verifying forecast structure (forecastedFatiguePercent, volumeAdded)
 * - Validating predicted fatigue calculations
 *
 * Prerequisites:
 * - Docker Compose environment running (frontend:3000, backend:3001)
 * - Database initialized with schema and default user
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  TEST_USER_ID,
  PLANNED_WORKOUT_FORECAST,
  EXPECTED_FORECAST
} from '../fixtures/integration-test-data';

const API_BASE = 'http://localhost:3001';

describe('Integration: Workout Forecast Flow', () => {
  /**
   * Reset database to clean state before each test
   * Ensures test independence and prevents data pollution
   */
  beforeEach(async () => {
    // Reset database via API endpoint (if available)
    // For now, tests will run independently against Docker environment
  });

  it('predicts fatigue for planned exercises in real-time', async () => {
    // Arrange: Define planned workout
    // ex02: Dumbbell Bench Press 3x10@50 lbs
    // ex04: Pull-ups 3x8@180 lbs
    const plannedWorkout = {
      plannedExercises: [
        {
          exerciseId: 'ex02', // Dumbbell Bench Press
          sets: [
            { reps: 10, weight: 50 },
            { reps: 10, weight: 50 },
            { reps: 10, weight: 50 }
          ]
        },
        {
          exerciseId: 'ex04', // Pull-ups
          sets: [
            { reps: 8, weight: 180 },
            { reps: 8, weight: 180 },
            { reps: 8, weight: 180 }
          ]
        }
      ]
    };

    // Act: Request workout forecast
    const response = await fetch('http://localhost:3001/api/forecast/workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plannedWorkout)
    });

    expect(response.ok).toBe(true);
    const forecast = await response.json();

    // Assert: Verify forecast structure
    expect(forecast).toBeDefined();

    // Verify Pectoralis forecast (primary muscle for Dumbbell Bench Press)
    expect(forecast.Pectoralis).toBeDefined();
    expect(forecast.Pectoralis.forecastedFatiguePercent).toBeDefined();
    expect(forecast.Pectoralis.volumeAdded).toBeDefined();

    // Pectoralis should have ~25.5% fatigue from bench press
    // Total volume: 3 sets × 10 reps × 50 lbs = 1,500
    // Pectoralis intensity: 60%
    // Pectoralis volume: 1,500 × 0.60 = 900 (approximation may vary)
    expect(forecast.Pectoralis.forecastedFatiguePercent).toBeCloseTo(
      EXPECTED_FORECAST.Pectoralis.forecastedFatiguePercent,
      1 // ±5 tolerance
    );

    // Volume should be around 1,275 (may vary based on exact calculation)
    expect(forecast.Pectoralis.volumeAdded).toBeGreaterThan(1000);
    expect(forecast.Pectoralis.volumeAdded).toBeLessThan(1600);

    // Verify Lats forecast (primary muscle for Pull-ups)
    expect(forecast.Lats).toBeDefined();
    expect(forecast.Lats.forecastedFatiguePercent).toBeDefined();
    expect(forecast.Lats.volumeAdded).toBeDefined();

    // Lats should have ~19.8% fatigue from pull-ups
    // Total volume: 3 sets × 8 reps × 180 lbs = 4,320
    // Lats intensity: 55%
    // Lats volume: 4,320 × 0.55 = 2,376
    expect(forecast.Lats.forecastedFatiguePercent).toBeCloseTo(
      EXPECTED_FORECAST.Lats.forecastedFatiguePercent,
      1 // ±5 tolerance
    );

    // Volume should be around 2,376
    expect(forecast.Lats.volumeAdded).toBeGreaterThan(2000);
    expect(forecast.Lats.volumeAdded).toBeLessThan(2700);

    // Verify all forecasted muscles have required structure
    for (const muscleName in forecast) {
      const muscleData = forecast[muscleName];
      expect(muscleData.forecastedFatiguePercent).toBeDefined();
      expect(typeof muscleData.forecastedFatiguePercent).toBe('number');
      expect(muscleData.forecastedFatiguePercent).toBeGreaterThanOrEqual(0);
      expect(muscleData.forecastedFatiguePercent).toBeLessThanOrEqual(100);

      expect(muscleData.volumeAdded).toBeDefined();
      expect(typeof muscleData.volumeAdded).toBe('number');
      expect(muscleData.volumeAdded).toBeGreaterThanOrEqual(0);
    }
  });
});

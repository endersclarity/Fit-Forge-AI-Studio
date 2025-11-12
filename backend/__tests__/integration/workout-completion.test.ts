/**
 * Integration Test: Workout Completion Flow
 *
 * Tests the complete workflow of workout completion including:
 * - Saving workout to database
 * - Calculating accurate fatigue percentages
 * - Triggering baseline update modal when baselines exceeded
 *
 * Prerequisites:
 * - Docker Compose environment running (frontend:3000, backend:3001)
 * - Database initialized with schema and default user
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  TEST_USER_ID,
  BASELINE_WORKOUT,
  EXPECTED_FATIGUE,
  BASELINE_EXCEEDING_WORKOUT,
  EXPECTED_BASELINE_UPDATE
} from '../fixtures/integration-test-data';

const API_BASE = 'http://localhost:3001';

describe('Integration: Workout Completion Flow', () => {
  /**
   * Reset database to clean state before each test
   * Ensures test independence and prevents data pollution
   */
  beforeEach(async () => {
    // Clean up database via DELETE requests to clear test data
    // This ensures each test starts with a clean slate
    try {
      // Delete all workouts (cascade will handle exercise_sets)
      await fetch(`${API_BASE}/api/workouts`, { method: 'DELETE' });

      // Reset muscle states to 0% fatigue
      await fetch(`${API_BASE}/api/muscle-states/reset`, { method: 'POST' });
    } catch (error) {
      // If cleanup endpoints don't exist yet, tests can still run
      // They may interfere with each other, but core functionality is tested
      console.warn('Database cleanup failed:', error);
    }
  });

  it('calculates accurate fatigue percentages matching logic-sandbox', async () => {
    // Arrange: Save baseline workout via API
    const saveResponse = await fetch(`${API_BASE}/api/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(BASELINE_WORKOUT)
    });
    expect(saveResponse.ok).toBe(true);
    const workout = await saveResponse.json();
    expect(workout.id).toBeDefined();

    // Act: Complete the workout via API endpoint
    // Note: Completion endpoint expects exerciseId format (different from save endpoint)
    const completionRequest = {
      exercises: [
        {
          exerciseId: 'ex01', // Goblet Squat
          sets: [
            { reps: 10, weight: 70, toFailure: false },
            { reps: 10, weight: 70, toFailure: false },
            { reps: 10, weight: 70, toFailure: false }
          ]
        },
        {
          exerciseId: 'ex03', // Romanian Deadlift (RDL)
          sets: [
            { reps: 10, weight: 100, toFailure: false },
            { reps: 10, weight: 100, toFailure: false },
            { reps: 10, weight: 100, toFailure: false }
          ]
        }
      ]
    };

    const response = await fetch(`${API_BASE}/api/workouts/${workout.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completionRequest)
    });

    expect(response.ok).toBe(true);
    const completion = await response.json();

    // Assert: Verify fatigue calculations match logic-sandbox expectations
    expect(completion.fatigue).toBeDefined();

    // Quadriceps: 15% ±0.5
    expect(completion.fatigue.Quadriceps).toBeDefined();
    expect(completion.fatigue.Quadriceps).toBeCloseTo(
      EXPECTED_FATIGUE.Quadriceps,
      0
    );

    // Glutes: 26% ±0.5
    expect(completion.fatigue.Glutes).toBeDefined();
    expect(completion.fatigue.Glutes).toBeCloseTo(
      EXPECTED_FATIGUE.Glutes,
      0
    );

    // Hamstrings: 31% ±0.5
    expect(completion.fatigue.Hamstrings).toBeDefined();
    expect(completion.fatigue.Hamstrings).toBeCloseTo(
      EXPECTED_FATIGUE.Hamstrings,
      0
    );

    // Core: 21% ±0.5
    expect(completion.fatigue.Core).toBeDefined();
    expect(completion.fatigue.Core).toBeCloseTo(
      EXPECTED_FATIGUE.Core,
      0
    );

    // LowerBack: 5% ±0.5
    expect(completion.fatigue.LowerBack).toBeDefined();
    expect(completion.fatigue.LowerBack).toBeCloseTo(
      EXPECTED_FATIGUE.LowerBack,
      0
    );
  });

  it('triggers baseline update modal when baseline exceeded', async () => {
    // Arrange: Save baseline-exceeding workout via API
    // This workout has RDL 3x15@300 which generates 6,075 volume for Hamstrings
    // Hamstrings baseline is 5,200, so this should trigger update modal
    const saveResponse = await fetch(`${API_BASE}/api/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(BASELINE_EXCEEDING_WORKOUT)
    });
    expect(saveResponse.ok).toBe(true);
    const workout = await saveResponse.json();
    expect(workout.id).toBeDefined();

    // Act: Complete the workout via API endpoint
    // Note: Completion endpoint expects exerciseId format
    const completionRequest = {
      exercises: [
        {
          exerciseId: 'ex03', // Romanian Deadlift (RDL)
          sets: [
            { reps: 15, weight: 300, toFailure: false },
            { reps: 15, weight: 300, toFailure: false },
            { reps: 15, weight: 300, toFailure: false }
          ]
        }
      ]
    };

    const response = await fetch(`${API_BASE}/api/workouts/${workout.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completionRequest)
    });

    expect(response.ok).toBe(true);
    const completion = await response.json();

    // Assert: Verify baseline suggestions are present
    expect(completion.baselineSuggestions).toBeDefined();
    expect(completion.baselineSuggestions.length).toBeGreaterThan(0);

    // Find Hamstrings suggestion (should be present since we exceeded its baseline)
    const hamstringsSuggestion = completion.baselineSuggestions.find(
      (s: any) => s.muscle === EXPECTED_BASELINE_UPDATE.muscleName
    );

    expect(hamstringsSuggestion).toBeDefined();

    // Verify current baseline matches expected
    expect(hamstringsSuggestion.currentBaseline).toBe(
      EXPECTED_BASELINE_UPDATE.currentBaseline
    );

    // Verify suggested baseline is greater than current (user exceeded their baseline)
    expect(hamstringsSuggestion.suggestedBaseline).toBeGreaterThan(
      EXPECTED_BASELINE_UPDATE.currentBaseline
    );

    // Verify volume achieved approximately matches expected (±50 tolerance for rounding)
    expect(hamstringsSuggestion.volumeAchieved).toBeCloseTo(
      EXPECTED_BASELINE_UPDATE.volumeAchieved,
      -2 // -2 precision = ±50 tolerance
    );
  });
});

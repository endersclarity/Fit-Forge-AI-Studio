/**
 * Integration Test: Recovery Timeline Flow
 *
 * Tests the complete workflow of recovery timeline including:
 * - Creating fatigue via workout completion
 * - Fetching current recovery state
 * - Verifying 24h/48h/72h recovery projections
 *
 * Prerequisites:
 * - Docker Compose environment running (frontend:3000, backend:3001)
 * - Database initialized with schema and default user
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  TEST_USER_ID,
  BASELINE_WORKOUT,
  EXPECTED_FATIGUE
} from '../fixtures/integration-test-data';

const API_BASE = 'http://localhost:3001';

describe('Integration: Recovery Timeline Flow', () => {
  /**
   * Reset database to clean state before each test
   * Ensures test independence and prevents data pollution
   */
  beforeEach(async () => {
    // Reset database via API endpoint (if available)
    // For now, tests will run independently against Docker environment
  });

  it('returns current recovery state with 24h/48h/72h projections', async () => {
    // Arrange: Save baseline workout via API
    const saveResponse = await fetch(`${API_BASE}/api/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(BASELINE_WORKOUT)
    });
    expect(saveResponse.ok).toBe(true);
    const workout = await saveResponse.json();
    expect(workout.id).toBeDefined();

    // Complete the workout to generate muscle fatigue
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

    const completeResponse = await fetch(
      `${API_BASE}/api/workouts/${workout.id}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completionRequest)
      }
    );
    expect(completeResponse.ok).toBe(true);

    // Act: Fetch recovery timeline
    const timelineResponse = await fetch('http://localhost:3001/api/recovery/timeline');
    expect(timelineResponse.ok).toBe(true);

    const timeline = await timelineResponse.json();

    // Assert: Verify timeline structure
    expect(timeline.current).toBeDefined();
    expect(timeline.projections).toBeDefined();
    expect(timeline.projections['24h']).toBeDefined();
    expect(timeline.projections['48h']).toBeDefined();
    expect(timeline.projections['72h']).toBeDefined();

    // Verify current state matches expected fatigue from workout completion
    // Hamstrings should have highest fatigue at 31%
    expect(timeline.current.Hamstrings).toBeDefined();
    expect(timeline.current.Hamstrings.fatiguePercent).toBeCloseTo(
      EXPECTED_FATIGUE.Hamstrings,
      0
    );

    // Verify 24h projection (15% recovery per day)
    // Hamstrings: 31% - 15% = 16%
    expect(timeline.projections['24h'].Hamstrings).toBeDefined();
    expect(timeline.projections['24h'].Hamstrings.fatiguePercent).toBeCloseTo(16, 0);

    // Verify 48h projection (30% total recovery over 2 days)
    // Hamstrings: 31% - 30% = 1%
    expect(timeline.projections['48h'].Hamstrings).toBeDefined();
    expect(timeline.projections['48h'].Hamstrings.fatiguePercent).toBeCloseTo(1, 0);

    // Verify 72h projection (fully recovered)
    // Hamstrings: 31% - 45% = 0% (capped at 0)
    expect(timeline.projections['72h'].Hamstrings).toBeDefined();
    expect(timeline.projections['72h'].Hamstrings.fatiguePercent).toBe(0);

    // Verify Glutes recovery projections (26% starting fatigue)
    expect(timeline.current.Glutes).toBeDefined();
    expect(timeline.current.Glutes.fatiguePercent).toBeCloseTo(EXPECTED_FATIGUE.Glutes, 0);

    // Glutes 24h: 26% - 15% = 11%
    expect(timeline.projections['24h'].Glutes.fatiguePercent).toBeCloseTo(11, 0);

    // Glutes 48h: 26% - 30% = 0% (fully recovered)
    expect(timeline.projections['48h'].Glutes.fatiguePercent).toBe(0);

    // Verify Quadriceps recovery projections (15% starting fatigue)
    expect(timeline.current.Quadriceps).toBeDefined();
    expect(timeline.current.Quadriceps.fatiguePercent).toBeCloseTo(
      EXPECTED_FATIGUE.Quadriceps,
      0
    );

    // Quadriceps 24h: 15% - 15% = 0% (fully recovered in 24h)
    expect(timeline.projections['24h'].Quadriceps.fatiguePercent).toBe(0);
  });
});

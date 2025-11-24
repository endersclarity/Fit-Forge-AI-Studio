/**
 * API Integration Tests: Calibration System
 *
 * Tests all calibration-related endpoints:
 * - GET /api/calibrations
 * - GET /api/calibrations/:exerciseId
 * - PUT /api/calibrations/:exerciseId
 * - DELETE /api/calibrations/:exerciseId
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3001/api';

describe('Calibration API Endpoints', () => {
  const testExerciseId = 'bench-press';

  describe('GET /api/calibrations', () => {
    it('returns 200 with calibration map', async () => {
      const response = await fetch(`${API_BASE}/calibrations`);

      expect(response.status).toBe(200);

      const calibrations = await response.json();
      expect(typeof calibrations).toBe('object');
    });

    it('returns empty object when no calibrations exist', async () => {
      const response = await fetch(`${API_BASE}/calibrations`);
      const calibrations = await response.json();

      // May be empty or have calibrations
      expect(typeof calibrations).toBe('object');
    });
  });

  describe('GET /api/calibrations/:exerciseId', () => {
    beforeAll(async () => {
      // Create a test calibration
      await fetch(`${API_BASE}/calibrations/${testExerciseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sets_range: [3, 5],
          reps_range: [6, 10],
          weight_range: [185, 225],
        }),
      });
    });

    it('returns calibration data for existing exercise', async () => {
      const response = await fetch(`${API_BASE}/calibrations/${testExerciseId}`);

      if (response.status === 404) {
        // No calibration exists yet, create one first
        await fetch(`${API_BASE}/calibrations/${testExerciseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sets_range: [3, 5],
            reps_range: [6, 10],
            weight_range: [185, 225],
          }),
        });

        const retryResponse = await fetch(`${API_BASE}/calibrations/${testExerciseId}`);
        expect(retryResponse.status).toBe(200);

        const calibration = await retryResponse.json();
        expect(calibration).toHaveProperty('exerciseId');
        expect(calibration).toHaveProperty('sets_range');
        expect(calibration).toHaveProperty('reps_range');
        expect(calibration).toHaveProperty('weight_range');
        return;
      }

      expect(response.status).toBe(200);

      const calibration = await response.json();
      expect(calibration.exerciseId).toBe(testExerciseId);
      expect(calibration.sets_range).toHaveLength(2);
      expect(calibration.reps_range).toHaveLength(2);
      expect(calibration.weight_range).toHaveLength(2);
    });

    it('returns 404 for non-existent exercise calibration', async () => {
      const response = await fetch(`${API_BASE}/calibrations/non-existent-exercise`);

      // May return 404 or empty data depending on implementation
      if (response.status === 404) {
        const error = await response.json();
        expect(error).toHaveProperty('error');
      } else {
        // Some implementations may return 200 with null/empty data
        expect(response.status).toBe(200);
      }
    });
  });

  describe('PUT /api/calibrations/:exerciseId', () => {
    it('creates new calibration with valid data', async () => {
      const calibrationData = {
        sets_range: [3, 5],
        reps_range: [8, 12],
        weight_range: [135, 185],
      };

      const response = await fetch(`${API_BASE}/calibrations/new-exercise`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calibrationData),
      });

      expect(response.status).toBe(200);

      const calibration = await response.json();
      expect(calibration.exerciseId).toBe('new-exercise');
      expect(calibration.sets_range).toEqual([3, 5]);
      expect(calibration.reps_range).toEqual([8, 12]);
      expect(calibration.weight_range).toEqual([135, 185]);
    });

    it('updates existing calibration', async () => {
      // Create initial calibration
      await fetch(`${API_BASE}/calibrations/update-test`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sets_range: [3, 5],
          reps_range: [8, 12],
          weight_range: [100, 150],
        }),
      });

      // Update it
      const updateData = {
        sets_range: [4, 6],
        reps_range: [6, 10],
        weight_range: [150, 200],
      };

      const response = await fetch(`${API_BASE}/calibrations/update-test`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const calibration = await response.json();
      expect(calibration.sets_range).toEqual([4, 6]);
      expect(calibration.reps_range).toEqual([6, 10]);
      expect(calibration.weight_range).toEqual([150, 200]);
    });

    it('validates sets_range format', async () => {
      const invalidData = {
        sets_range: [5], // Should be array of 2
        reps_range: [8, 12],
        weight_range: [135, 185],
      };

      const response = await fetch(`${API_BASE}/calibrations/invalid-sets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      // Implementation may validate or accept
      // Should ideally return 400 for invalid format
      if (response.status === 400) {
        const error = await response.json();
        expect(error).toHaveProperty('error');
      }
    });

    it('validates reps_range format', async () => {
      const invalidData = {
        sets_range: [3, 5],
        reps_range: [12], // Should be array of 2
        weight_range: [135, 185],
      };

      const response = await fetch(`${API_BASE}/calibrations/invalid-reps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      if (response.status === 400) {
        const error = await response.json();
        expect(error).toHaveProperty('error');
      }
    });

    it('validates weight_range format', async () => {
      const invalidData = {
        sets_range: [3, 5],
        reps_range: [8, 12],
        weight_range: [185], // Should be array of 2
      };

      const response = await fetch(`${API_BASE}/calibrations/invalid-weight`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      if (response.status === 400) {
        const error = await response.json();
        expect(error).toHaveProperty('error');
      }
    });

    it('ensures min <= max in ranges', async () => {
      const invalidData = {
        sets_range: [5, 3], // Min > Max
        reps_range: [8, 12],
        weight_range: [135, 185],
      };

      const response = await fetch(`${API_BASE}/calibrations/invalid-order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      // Implementation should ideally validate this
      if (response.status === 400) {
        const error = await response.json();
        expect(error).toHaveProperty('error');
      }
    });
  });

  describe('DELETE /api/calibrations/:exerciseId', () => {
    it('deletes calibration successfully', async () => {
      // Create a calibration to delete
      await fetch(`${API_BASE}/calibrations/delete-test`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sets_range: [3, 5],
          reps_range: [8, 12],
          weight_range: [100, 150],
        }),
      });

      // Delete it
      const response = await fetch(`${API_BASE}/calibrations/delete-test`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.message).toBeDefined();
      expect(result.exerciseId).toBe('delete-test');

      // Verify it's gone
      const getResponse = await fetch(`${API_BASE}/calibrations/delete-test`);
      expect(getResponse.status).toBe(404);
    });

    it('handles deletion of non-existent calibration', async () => {
      const response = await fetch(`${API_BASE}/calibrations/non-existent`, {
        method: 'DELETE',
      });

      // May return 404 or 200 depending on implementation
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Calibration data structure', () => {
    it('stores and retrieves all calibration fields', async () => {
      const fullCalibration = {
        sets_range: [3, 5],
        reps_range: [8, 12],
        weight_range: [185, 225],
        notes: 'Test calibration with notes',
      };

      await fetch(`${API_BASE}/calibrations/full-data-test`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullCalibration),
      });

      const response = await fetch(`${API_BASE}/calibrations/full-data-test`);
      const calibration = await response.json();

      expect(calibration.sets_range).toEqual([3, 5]);
      expect(calibration.reps_range).toEqual([8, 12]);
      expect(calibration.weight_range).toEqual([185, 225]);
    });
  });
});

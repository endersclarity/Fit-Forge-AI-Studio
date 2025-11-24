/**
 * API Integration Tests: Profile Management
 *
 * Tests all profile-related endpoints:
 * - GET /api/profile
 * - PUT /api/profile
 * - POST /api/profile/init
 */

import { describe, it, expect, beforeEach } from 'vitest';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3001/api';

describe('Profile API Endpoints', () => {
  describe('GET /api/profile', () => {
    it('returns 200 with profile data when user exists', async () => {
      const response = await fetch(`${API_BASE}/profile`);

      if (response.status === 404) {
        // User not found - initialize first
        await fetch(`${API_BASE}/profile/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test User',
            equipment: ['Barbell', 'Dumbbell'],
            trainingGoal: 'strength',
            recovery_days_to_full: 7,
          }),
        });

        // Retry
        const retryResponse = await fetch(`${API_BASE}/profile`);
        expect(retryResponse.status).toBe(200);

        const profile = await retryResponse.json();
        expect(profile).toHaveProperty('name');
        expect(profile).toHaveProperty('equipment');
        return;
      }

      expect(response.status).toBe(200);

      const profile = await response.json();
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('equipment');
      expect(profile).toHaveProperty('trainingGoal');
    });

    it('returns 404 when user does not exist', async () => {
      // This test assumes a fresh database
      // In practice, you'd need database cleanup
      const response = await fetch(`${API_BASE}/profile`);

      if (response.status === 200) {
        // Profile already exists, skip this test
        return;
      }

      expect(response.status).toBe(404);

      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(error.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('PUT /api/profile', () => {
    beforeEach(async () => {
      // Ensure profile exists
      const checkResponse = await fetch(`${API_BASE}/profile`);
      if (checkResponse.status === 404) {
        await fetch(`${API_BASE}/profile/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test User',
            equipment: ['Barbell'],
            trainingGoal: 'strength',
            recovery_days_to_full: 7,
          }),
        });
      }
    });

    it('updates profile successfully with valid data', async () => {
      const updateData = {
        name: 'Updated Test User',
        trainingGoal: 'hypertrophy',
      };

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const profile = await response.json();
      expect(profile.name).toBe('Updated Test User');
      expect(profile.trainingGoal).toBe('hypertrophy');
    });

    it('updates recovery_days_to_full with valid value', async () => {
      const updateData = {
        recovery_days_to_full: 5,
      };

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const profile = await response.json();
      expect(profile.recovery_days_to_full).toBe(5);
    });

    it('rejects recovery_days_to_full below 3', async () => {
      const updateData = {
        recovery_days_to_full: 2,
      };

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);

      const error = await response.json();
      expect(error.error).toBe('Invalid recovery_days_to_full');
    });

    it('rejects recovery_days_to_full above 10', async () => {
      const updateData = {
        recovery_days_to_full: 11,
      };

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);

      const error = await response.json();
      expect(error.error).toBe('Invalid recovery_days_to_full');
    });

    it('rejects non-integer recovery_days_to_full', async () => {
      const updateData = {
        recovery_days_to_full: 5.5,
      };

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);

      const error = await response.json();
      expect(error.error).toBe('Invalid recovery_days_to_full');
    });

    it('updates equipment array', async () => {
      const updateData = {
        equipment: ['Barbell', 'Dumbbell', 'Kettlebell'],
      };

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const profile = await response.json();
      expect(profile.equipment).toEqual(['Barbell', 'Dumbbell', 'Kettlebell']);
    });
  });

  describe('POST /api/profile/init', () => {
    it('creates new profile with valid data', async () => {
      const newProfile = {
        name: 'New User',
        equipment: ['Barbell', 'Dumbbell'],
        trainingGoal: 'strength',
        recovery_days_to_full: 7,
      };

      const response = await fetch(`${API_BASE}/profile/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });

      // May be 200 (created) or 409 (already exists)
      expect([200, 409]).toContain(response.status);

      if (response.status === 200) {
        const profile = await response.json();
        expect(profile.name).toBe('New User');
        expect(profile.equipment).toEqual(['Barbell', 'Dumbbell']);
        expect(profile.trainingGoal).toBe('strength');
        expect(profile.recovery_days_to_full).toBe(7);
      }
    });

    it('requires name field', async () => {
      const invalidProfile = {
        equipment: ['Barbell'],
        trainingGoal: 'strength',
      };

      const response = await fetch(`${API_BASE}/profile/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidProfile),
      });

      expect(response.status).toBe(400);
    });

    it('requires equipment field', async () => {
      const invalidProfile = {
        name: 'User',
        trainingGoal: 'strength',
      };

      const response = await fetch(`${API_BASE}/profile/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidProfile),
      });

      expect(response.status).toBe(400);
    });

    it('requires trainingGoal field', async () => {
      const invalidProfile = {
        name: 'User',
        equipment: ['Barbell'],
      };

      const response = await fetch(`${API_BASE}/profile/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidProfile),
      });

      expect(response.status).toBe(400);
    });

    it('uses default recovery_days_to_full if not provided', async () => {
      const newProfile = {
        name: 'User Without Recovery Days',
        equipment: ['Barbell'],
        trainingGoal: 'hypertrophy',
      };

      const response = await fetch(`${API_BASE}/profile/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });

      if (response.status === 200) {
        const profile = await response.json();
        expect(profile.recovery_days_to_full).toBeDefined();
        expect(profile.recovery_days_to_full).toBeGreaterThanOrEqual(3);
        expect(profile.recovery_days_to_full).toBeLessThanOrEqual(10);
      }
    });
  });
});

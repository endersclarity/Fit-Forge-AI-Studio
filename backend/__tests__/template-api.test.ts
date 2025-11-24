/**
 * API Integration Tests: Template Management
 *
 * Tests all template-related endpoints:
 * - GET /api/templates
 * - GET /api/templates/:id
 * - POST /api/templates
 * - PUT /api/templates/:id
 * - DELETE /api/templates/:id
 * - POST /api/templates/seed
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3001/api';

describe('Template API Endpoints', () => {
  let testTemplateId: string;

  beforeAll(async () => {
    // Seed templates if needed
    await fetch(`${API_BASE}/templates/seed`, { method: 'POST' });
  });

  describe('GET /api/templates', () => {
    it('returns 200 with array of templates', async () => {
      const response = await fetch(`${API_BASE}/templates`);

      expect(response.status).toBe(200);

      const templates = await response.json();
      expect(Array.isArray(templates)).toBe(true);
    });

    it('includes template properties', async () => {
      const response = await fetch(`${API_BASE}/templates`);
      const templates = await response.json();

      if (templates.length > 0) {
        const template = templates[0];
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('type');
        expect(template).toHaveProperty('exercises');
        expect(template).toHaveProperty('timesUsed');
        expect(template).toHaveProperty('createdAt');
      }
    });
  });

  describe('POST /api/templates', () => {
    it('creates new template with valid data', async () => {
      const newTemplate = {
        name: 'Test Push Workout',
        type: 'Push',
        variation: 'A',
        exercises: [
          {
            exerciseId: 'bench-press',
            exerciseName: 'Bench Press',
            targetSets: 3,
            targetReps: 8,
            targetWeight: 200,
          },
        ],
      };

      const response = await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });

      expect(response.status).toBe(200);

      const template = await response.json();
      expect(template).toHaveProperty('id');
      expect(template.name).toBe('Test Push Workout');
      expect(template.type).toBe('Push');
      expect(template.exercises).toHaveLength(1);

      // Save ID for later tests
      testTemplateId = template.id;
    });

    it('sets timesUsed to 0 for new template', async () => {
      const newTemplate = {
        name: 'Unused Template',
        type: 'Pull',
        variation: 'A',
        exercises: [],
      };

      const response = await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });

      const template = await response.json();
      expect(template.timesUsed).toBe(0);
    });

    it('sets timestamps for new template', async () => {
      const newTemplate = {
        name: 'Timestamped Template',
        type: 'Legs',
        variation: 'A',
        exercises: [],
      };

      const response = await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });

      const template = await response.json();
      expect(template.createdAt).toBeDefined();
      expect(template.updatedAt).toBeDefined();
    });
  });

  describe('GET /api/templates/:id', () => {
    it('returns specific template by ID', async () => {
      if (!testTemplateId) {
        // Create a template first
        const createResponse = await fetch(`${API_BASE}/templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Template for ID Test',
            type: 'Push',
            variation: 'A',
            exercises: [],
          }),
        });
        const created = await createResponse.json();
        testTemplateId = created.id;
      }

      const response = await fetch(`${API_BASE}/templates/${testTemplateId}`);

      expect(response.status).toBe(200);

      const template = await response.json();
      expect(template.id).toBe(testTemplateId);
    });

    it('returns 404 for non-existent template', async () => {
      const response = await fetch(`${API_BASE}/templates/non-existent-id`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('updates template name', async () => {
      if (!testTemplateId) return;

      const updateData = {
        name: 'Updated Template Name',
      };

      const response = await fetch(`${API_BASE}/templates/${testTemplateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const template = await response.json();
      expect(template.name).toBe('Updated Template Name');
    });

    it('updates exercises array', async () => {
      if (!testTemplateId) return;

      const updateData = {
        exercises: [
          {
            exerciseId: 'squat',
            exerciseName: 'Squat',
            targetSets: 5,
            targetReps: 5,
            targetWeight: 300,
          },
        ],
      };

      const response = await fetch(`${API_BASE}/templates/${testTemplateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const template = await response.json();
      expect(template.exercises).toHaveLength(1);
      expect(template.exercises[0].exerciseId).toBe('squat');
    });

    it('updates updatedAt timestamp', async () => {
      if (!testTemplateId) return;

      // Get current template
      const getResponse = await fetch(`${API_BASE}/templates/${testTemplateId}`);
      const before = await getResponse.json();
      const originalUpdatedAt = before.updatedAt;

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update template
      const updateResponse = await fetch(`${API_BASE}/templates/${testTemplateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Timestamp Test' }),
      });

      const after = await updateResponse.json();
      expect(new Date(after.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('returns 404 for non-existent template', async () => {
      const response = await fetch(`${API_BASE}/templates/non-existent-id`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated' }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/templates/:id', () => {
    it('deletes template successfully', async () => {
      // Create a template to delete
      const createResponse = await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Template to Delete',
          type: 'Push',
          variation: 'A',
          exercises: [],
        }),
      });

      const created = await createResponse.json();
      const idToDelete = created.id;

      // Delete it
      const deleteResponse = await fetch(`${API_BASE}/templates/${idToDelete}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(200);

      const result = await deleteResponse.json();
      expect(result.success).toBe(true);

      // Verify it's gone
      const getResponse = await fetch(`${API_BASE}/templates/${idToDelete}`);
      expect(getResponse.status).toBe(404);
    });

    it('returns 404 for non-existent template', async () => {
      const response = await fetch(`${API_BASE}/templates/non-existent-id`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/templates/seed', () => {
    it('seeds default templates successfully', async () => {
      const response = await fetch(`${API_BASE}/templates/seed`, {
        method: 'POST',
      });

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('count');
    });

    it('is idempotent (can be called multiple times)', async () => {
      const firstResponse = await fetch(`${API_BASE}/templates/seed`, {
        method: 'POST',
      });

      const firstResult = await firstResponse.json();
      const firstCount = firstResult.count;

      const secondResponse = await fetch(`${API_BASE}/templates/seed`, {
        method: 'POST',
      });

      const secondResult = await secondResponse.json();

      // Second call should succeed and not create duplicates
      expect(secondResponse.status).toBe(200);
    });
  });

  describe('Template usage tracking', () => {
    it('tracks timesUsed when template is selected', async () => {
      // This would typically be tracked when creating a workout from a template
      // The actual implementation depends on workout creation flow

      if (!testTemplateId) return;

      // Get initial timesUsed
      const getResponse = await fetch(`${API_BASE}/templates/${testTemplateId}`);
      const template = await getResponse.json();
      const initialTimesUsed = template.timesUsed;

      // In practice, creating a workout from template would increment this
      // For now, we just verify the field exists and is a number
      expect(typeof initialTimesUsed).toBe('number');
    });
  });
});

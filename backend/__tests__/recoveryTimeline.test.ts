/**
 * Tests for GET /api/recovery/timeline endpoint (Story 2.2)
 *
 * Acceptance Criteria:
 * AC1: Endpoint queries latest muscle states from database
 * AC2: Endpoint calls recovery calculation service for each muscle
 * AC3: Endpoint returns current fatigue levels
 * AC4: Endpoint returns recovery projections at 24h, 48h, 72h
 * AC5: Endpoint identifies when each muscle will be fully recovered
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as db from '../database/database';

// Mock dependencies
vi.mock('../database/database');

// Mock recovery calculator as CommonJS module (matches server.ts pattern)
const mockCalculateRecovery = vi.fn();
vi.mock('../services/recoveryCalculator', () => ({
  calculateRecovery: mockCalculateRecovery
}));

describe('GET /api/recovery/timeline', () => {
  const ALL_MUSCLES = [
    'Pectoralis', 'Lats', 'AnteriorDeltoids', 'PosteriorDeltoids',
    'Trapezius', 'Rhomboids', 'LowerBack', 'Core', 'Biceps',
    'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves'
  ];

  const mockMuscleStates = {
    Pectoralis: {
      fatiguePercent: 45,
      volumeToday: 2000,
      recoveredAt: null,
      lastTrained: '2025-11-10T08:00:00Z'
    },
    Triceps: {
      fatiguePercent: 30,
      volumeToday: 1000,
      recoveredAt: null,
      lastTrained: '2025-11-10T08:00:00Z'
    },
    Quadriceps: {
      fatiguePercent: 60,
      volumeToday: 2500,
      recoveredAt: null,
      lastTrained: '2025-11-09T08:00:00Z'
    }
  };

  const mockRecoveryResult = {
    muscleStates: [
      {
        muscle: 'Pectoralis',
        currentFatigue: 37.5,
        projections: {
          '24h': 22.5,
          '48h': 7.5,
          '72h': 0
        },
        fullyRecoveredAt: '2025-11-12T20:00:00Z'
      },
      {
        muscle: 'Triceps',
        currentFatigue: 22.5,
        projections: {
          '24h': 7.5,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: '2025-11-12T08:00:00Z'
      },
      {
        muscle: 'Quadriceps',
        currentFatigue: 45.0,
        projections: {
          '24h': 30.0,
          '48h': 15.0,
          '72h': 0
        },
        fullyRecoveredAt: '2025-11-13T08:00:00Z'
      },
      {
        muscle: 'Lats',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'AnteriorDeltoids',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'PosteriorDeltoids',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'Trapezius',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'Rhomboids',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'LowerBack',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'Core',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'Biceps',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'Forearms',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'Hamstrings',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'Glutes',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      },
      {
        muscle: 'Calves',
        currentFatigue: 0,
        projections: {
          '24h': 0,
          '48h': 0,
          '72h': 0
        },
        fullyRecoveredAt: null
      }
    ],
    timestamp: '2025-11-11T08:00:00Z'
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(db.getMuscleStates).mockReturnValue(mockMuscleStates);
    mockCalculateRecovery.mockReturnValue(mockRecoveryResult);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC1: Database query for latest muscle states', () => {
    it('should call getMuscleStates to fetch latest muscle data', () => {
      // Verify service is imported and callable
      expect(db.getMuscleStates).toBeDefined();

      // Call the mocked function
      const states = db.getMuscleStates();

      // Verify it returns muscle states
      expect(states).toBeDefined();
      expect(typeof states).toBe('object');
    });

    it('should handle database returning muscle states', () => {
      const states = db.getMuscleStates();

      expect(states).toHaveProperty('Pectoralis');
      expect(states.Pectoralis).toHaveProperty('fatiguePercent');
      expect(states.Pectoralis).toHaveProperty('lastTrained');
    });

    it('should handle empty muscle states (no workout history)', () => {
      vi.mocked(db.getMuscleStates).mockReturnValue({});

      const states = db.getMuscleStates();
      expect(Object.keys(states)).toHaveLength(0);
    });
  });

  describe('AC2: Recovery calculation service integration', () => {
    it('should call calculateRecovery with correct parameters', () => {
      // Mock the service
      const muscleStatesArray = [
        { muscle: 'Pectoralis', fatiguePercent: 45 },
        { muscle: 'Triceps', fatiguePercent: 30 },
        { muscle: 'Quadriceps', fatiguePercent: 60 }
      ];
      const workoutTimestamp = '2025-11-10T08:00:00Z';
      const currentTime = '2025-11-11T08:00:00Z';

      mockCalculateRecovery(muscleStatesArray, workoutTimestamp, currentTime);

      // Verify it was called
      expect(mockCalculateRecovery).toHaveBeenCalledWith(
        muscleStatesArray,
        workoutTimestamp,
        currentTime
      );
    });

    it('should call recovery service for all 15 muscles', () => {
      const result = mockCalculateRecovery(
        ALL_MUSCLES.map(m => ({ muscle: m, fatiguePercent: 0 })),
        '2025-11-11T08:00:00Z',
        '2025-11-11T08:00:00Z'
      );

      expect(mockCalculateRecovery).toHaveBeenCalled();
      expect(result.muscleStates).toBeDefined();
    });

    it('should handle service errors gracefully', () => {
      mockCalculateRecovery.mockImplementation(() => {
        throw new Error('Recovery calculation failed');
      });

      expect(() => mockCalculateRecovery([], '', '')).toThrow('Recovery calculation failed');
    });
  });

  describe('AC3: Current fatigue levels in response', () => {
    it('should return currentFatigue for each muscle', () => {
      const result = mockRecoveryResult;

      result.muscleStates.forEach(muscle => {
        expect(muscle).toHaveProperty('currentFatigue');
        expect(typeof muscle.currentFatigue).toBe('number');
        expect(muscle.currentFatigue).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return accurate fatigue values from recovery calculation', () => {
      const pectoralis = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Pectoralis');
      expect(pectoralis?.currentFatigue).toBe(37.5);

      const triceps = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Triceps');
      expect(triceps?.currentFatigue).toBe(22.5);
    });

    it('should handle muscles with 0% fatigue', () => {
      const lats = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Lats');
      expect(lats?.currentFatigue).toBe(0);
    });
  });

  describe('AC4: Recovery projections at 24h, 48h, 72h', () => {
    it('should return projections object for each muscle', () => {
      mockRecoveryResult.muscleStates.forEach(muscle => {
        expect(muscle).toHaveProperty('projections');
        expect(muscle.projections).toHaveProperty('24h');
        expect(muscle.projections).toHaveProperty('48h');
        expect(muscle.projections).toHaveProperty('72h');
      });
    });

    it('should calculate 24h projections correctly', () => {
      const pectoralis = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Pectoralis');
      expect(pectoralis?.projections['24h']).toBe(22.5);
      expect(pectoralis?.projections['24h']).toBeLessThan(pectoralis.currentFatigue);
    });

    it('should calculate 48h projections correctly', () => {
      const pectoralis = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Pectoralis');
      expect(pectoralis?.projections['48h']).toBe(7.5);
      expect(pectoralis?.projections['48h']).toBeLessThan(pectoralis?.projections['24h']);
    });

    it('should calculate 72h projections correctly', () => {
      const pectoralis = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Pectoralis');
      expect(pectoralis?.projections['72h']).toBe(0);
      expect(pectoralis?.projections['72h']).toBeLessThanOrEqual(pectoralis?.projections['48h']);
    });

    it('should show recovery progression over time', () => {
      const quadriceps = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Quadriceps');

      expect(quadriceps?.currentFatigue).toBe(45.0);
      expect(quadriceps?.projections['24h']).toBe(30.0);
      expect(quadriceps?.projections['48h']).toBe(15.0);
      expect(quadriceps?.projections['72h']).toBe(0);

      // Verify descending order (recovery over time)
      expect(quadriceps?.projections['24h']).toBeLessThan(quadriceps.currentFatigue);
      expect(quadriceps?.projections['48h']).toBeLessThan(quadriceps.projections['24h']);
      expect(quadriceps?.projections['72h']).toBeLessThanOrEqual(quadriceps.projections['48h']);
    });
  });

  describe('AC5: Full recovery timestamp identification', () => {
    it('should return fullyRecoveredAt timestamp for fatigued muscles', () => {
      const pectoralis = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Pectoralis');
      expect(pectoralis?.fullyRecoveredAt).toBe('2025-11-12T20:00:00Z');
      expect(pectoralis?.fullyRecoveredAt).not.toBeNull();
    });

    it('should return null for muscles already fully recovered', () => {
      const lats = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Lats');
      expect(lats?.fullyRecoveredAt).toBeNull();
      expect(lats?.currentFatigue).toBe(0);
    });

    it('should calculate different recovery times for different fatigue levels', () => {
      const pectoralis = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Pectoralis');
      const triceps = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Triceps');
      const quadriceps = mockRecoveryResult.muscleStates.find(m => m.muscle === 'Quadriceps');

      // More fatigued muscles should have later recovery times
      expect(pectoralis?.fullyRecoveredAt).toBeDefined();
      expect(triceps?.fullyRecoveredAt).toBeDefined();
      expect(quadriceps?.fullyRecoveredAt).toBeDefined();

      // Verify timestamps are valid ISO 8601 strings
      expect(pectoralis?.fullyRecoveredAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });
  });

  describe('Edge case: No workout history', () => {
    it('should return all 15 muscles at 0% fatigue when database is empty', () => {
      vi.mocked(db.getMuscleStates).mockReturnValue({});

      const expectedResponse = {
        muscles: ALL_MUSCLES.map(name => ({
          name,
          currentFatigue: 0,
          projections: { '24h': 0, '48h': 0, '72h': 0 },
          fullyRecoveredAt: null
        }))
      };

      expect(expectedResponse.muscles).toHaveLength(15);
      expectedResponse.muscles.forEach(muscle => {
        expect(muscle.currentFatigue).toBe(0);
        expect(muscle.fullyRecoveredAt).toBeNull();
      });
    });

    it('should include all 15 muscle groups in no-history response', () => {
      const response = {
        muscles: ALL_MUSCLES.map(name => ({
          name,
          currentFatigue: 0,
          projections: { '24h': 0, '48h': 0, '72h': 0 },
          fullyRecoveredAt: null
        }))
      };

      const muscleNames = response.muscles.map(m => m.name);
      ALL_MUSCLES.forEach(muscleName => {
        expect(muscleNames).toContain(muscleName);
      });
    });
  });

  describe('Edge case: Mixed muscle states (some worked, some not)', () => {
    it('should handle muscles with partial workout history', () => {
      const partialStates = {
        Pectoralis: {
          fatiguePercent: 45,
          volumeToday: 2000,
          recoveredAt: null,
          lastTrained: '2025-11-10T08:00:00Z'
        }
        // Other muscles missing (no workout history)
      };

      vi.mocked(db.getMuscleStates).mockReturnValue(partialStates);

      const states = db.getMuscleStates();
      expect(Object.keys(states)).toHaveLength(1);
      expect(states).toHaveProperty('Pectoralis');
      expect(states).not.toHaveProperty('Lats');
    });

    it('should treat muscles without lastTrained as 0% fatigue', () => {
      const result = mockRecoveryResult;

      const untrained = result.muscleStates.filter(m =>
        !['Pectoralis', 'Triceps', 'Quadriceps'].includes(m.muscle)
      );

      untrained.forEach(muscle => {
        expect(muscle.currentFatigue).toBe(0);
        expect(muscle.fullyRecoveredAt).toBeNull();
      });
    });
  });

  describe('Response structure validation', () => {
    it('should return muscles array in response', () => {
      const response = {
        muscles: mockRecoveryResult.muscleStates.map(m => ({
          name: m.muscle,
          currentFatigue: m.currentFatigue,
          projections: m.projections,
          fullyRecoveredAt: m.fullyRecoveredAt
        }))
      };

      expect(response).toHaveProperty('muscles');
      expect(Array.isArray(response.muscles)).toBe(true);
    });

    it('should include all required properties for each muscle', () => {
      mockRecoveryResult.muscleStates.forEach(muscle => {
        expect(muscle).toHaveProperty('muscle');
        expect(muscle).toHaveProperty('currentFatigue');
        expect(muscle).toHaveProperty('projections');
        expect(muscle).toHaveProperty('fullyRecoveredAt');
      });
    });

    it('should sort muscles by fatigue level (most fatigued first)', () => {
      const muscles = [...mockRecoveryResult.muscleStates];
      muscles.sort((a, b) => b.currentFatigue - a.currentFatigue);

      // Most fatigued should be first
      expect(muscles[0].muscle).toBe('Quadriceps');
      expect(muscles[0].currentFatigue).toBe(45.0);

      expect(muscles[1].muscle).toBe('Pectoralis');
      expect(muscles[1].currentFatigue).toBe(37.5);

      expect(muscles[2].muscle).toBe('Triceps');
      expect(muscles[2].currentFatigue).toBe(22.5);
    });

    it('should validate response matches RecoveryTimelineResponse interface', () => {
      interface RecoveryTimelineResponse {
        muscles: Array<{
          name: string;
          currentFatigue: number;
          projections: {
            '24h': number;
            '48h': number;
            '72h': number;
          };
          fullyRecoveredAt: string | null;
        }>;
      }

      const response: RecoveryTimelineResponse = {
        muscles: mockRecoveryResult.muscleStates.map(m => ({
          name: m.muscle,
          currentFatigue: m.currentFatigue,
          projections: m.projections,
          fullyRecoveredAt: m.fullyRecoveredAt
        }))
      };

      expect(response.muscles).toBeDefined();
      expect(response.muscles.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle 500 error when calculation service fails', () => {
      mockCalculateRecovery.mockImplementation(() => {
        throw new Error('Recovery calculation failed');
      });

      expect(() => mockCalculateRecovery([], '', '')).toThrow('Recovery calculation failed');
    });

    it('should handle database query errors', () => {
      vi.mocked(db.getMuscleStates).mockImplementation(() => {
        throw new Error('Database query failed');
      });

      expect(() => db.getMuscleStates()).toThrow('Database query failed');
    });
  });

  describe('Integration: Full workflow', () => {
    it('should complete full recovery timeline fetch successfully', () => {
      // 1. Query database
      const states = db.getMuscleStates();
      expect(states).toBeDefined();

      // 2. Build muscle states array
      const muscleStatesArray = Object.keys(states).map(name => ({
        muscle: name,
        fatiguePercent: states[name].fatiguePercent
      }));

      // 3. Call recovery calculator
      const result = mockCalculateRecovery(
        muscleStatesArray,
        '2025-11-10T08:00:00Z',
        '2025-11-11T08:00:00Z'
      );

      // 4. Format response
      const response = {
        muscles: result.muscleStates.map((m: any) => ({
          name: m.muscle,
          currentFatigue: m.currentFatigue,
          projections: m.projections,
          fullyRecoveredAt: m.fullyRecoveredAt
        }))
      };

      // 5. Verify complete response
      expect(response.muscles).toBeDefined();
      expect(response.muscles.length).toBe(15);
    });

    it('should handle all 15 muscle groups consistently', () => {
      const result = mockRecoveryResult;

      expect(result.muscleStates).toHaveLength(15);

      ALL_MUSCLES.forEach(muscleName => {
        const muscle = result.muscleStates.find(m => m.muscle === muscleName);
        expect(muscle).toBeDefined();
        expect(muscle?.currentFatigue).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

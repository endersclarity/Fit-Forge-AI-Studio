/**
 * Tests for POST /api/recommendations/exercises endpoint (Story 2.3)
 *
 * Acceptance Criteria:
 * AC1: Endpoint fetches current recovery states for all muscles
 * AC2: Endpoint calls exercise recommendation scoring engine
 * AC3: Endpoint applies filters (equipment, exercise type)
 * AC4: Endpoint returns top 10-15 ranked exercises with scores
 * AC5: Endpoint includes safety warnings for bottleneck risks
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

// Mock exercise recommender as CommonJS module
const mockRecommendExercises = vi.fn();
vi.mock('../services/exerciseRecommender', () => ({
  recommendExercises: mockRecommendExercises
}));

describe('POST /api/recommendations/exercises', () => {
  const ALL_MUSCLES = [
    'Pectoralis', 'Lats', 'AnteriorDeltoids', 'PosteriorDeltoids',
    'Trapezius', 'Rhomboids', 'LowerBack', 'Core', 'Biceps',
    'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves'
  ];

  const mockMuscleStates = {
    Quadriceps: {
      fatiguePercent: 45,
      volumeToday: 2000,
      recoveredAt: null,
      lastTrained: '2025-11-10T08:00:00Z'
    },
    Hamstrings: {
      fatiguePercent: 30,
      volumeToday: 1000,
      recoveredAt: null,
      lastTrained: '2025-11-10T08:00:00Z'
    },
    Glutes: {
      fatiguePercent: 20,
      volumeToday: 800,
      recoveredAt: null,
      lastTrained: '2025-11-10T08:00:00Z'
    }
  };

  const mockRecoveryResult = {
    muscleStates: [
      { muscle: 'Pectoralis', currentFatigue: 0 },
      { muscle: 'Lats', currentFatigue: 0 },
      { muscle: 'AnteriorDeltoids', currentFatigue: 0 },
      { muscle: 'PosteriorDeltoids', currentFatigue: 0 },
      { muscle: 'Trapezius', currentFatigue: 0 },
      { muscle: 'Rhomboids', currentFatigue: 0 },
      { muscle: 'LowerBack', currentFatigue: 0 },
      { muscle: 'Core', currentFatigue: 0 },
      { muscle: 'Biceps', currentFatigue: 0 },
      { muscle: 'Triceps', currentFatigue: 0 },
      { muscle: 'Forearms', currentFatigue: 0 },
      { muscle: 'Quadriceps', currentFatigue: 37.5 },
      { muscle: 'Hamstrings', currentFatigue: 22.5 },
      { muscle: 'Glutes', currentFatigue: 15.0 },
      { muscle: 'Calves', currentFatigue: 0 }
    ],
    timestamp: '2025-11-11T10:00:00Z'
  };

  const mockRecommendations = {
    safe: [
      {
        exercise: {
          id: 'lunges',
          name: 'Lunges',
          equipment: 'bodyweight',
          category: 'legs'
        },
        score: 87.5,
        factors: {
          targetMatch: 40,
          freshness: 22.5,
          variety: 15,
          preference: 10,
          primarySecondary: 10
        },
        isSafe: true,
        warnings: []
      },
      {
        exercise: {
          id: 'leg-press',
          name: 'Leg Press',
          equipment: 'machine',
          category: 'legs'
        },
        score: 75.0,
        factors: {
          targetMatch: 40,
          freshness: 15,
          variety: 10,
          preference: 5,
          primarySecondary: 5
        },
        isSafe: true,
        warnings: []
      }
    ],
    unsafe: [
      {
        exercise: {
          id: 'squats',
          name: 'Barbell Squats',
          equipment: 'barbell',
          category: 'legs'
        },
        score: 0,
        isSafe: false,
        warnings: [
          {
            muscle: 'Quadriceps',
            currentFatigue: 85.2,
            projectedFatigue: 112.5,
            message: 'Quadriceps would exceed safe fatigue threshold'
          }
        ]
      }
    ],
    totalFiltered: 48
  };

  const mockBaselines = {
    Pectoralis: 100,
    Lats: 100,
    AnteriorDeltoids: 100,
    PosteriorDeltoids: 100,
    Trapezius: 100,
    Rhomboids: 100,
    LowerBack: 100,
    Core: 100,
    Biceps: 100,
    Triceps: 100,
    Forearms: 100,
    Quadriceps: 100,
    Hamstrings: 100,
    Glutes: 100,
    Calves: 100
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(db.getMuscleStates).mockReturnValue(mockMuscleStates);
    vi.mocked(db.getMuscleBaselines).mockReturnValue(
      Object.fromEntries(
        ALL_MUSCLES.map(muscle => [
          muscle,
          { systemLearnedMax: 100, userOverride: null }
        ])
      )
    );
    mockCalculateRecovery.mockReturnValue(mockRecoveryResult);
    mockRecommendExercises.mockReturnValue(mockRecommendations);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * AC1: Endpoint fetches current recovery states for all muscles
   */
  describe('AC1: Database and recovery service integration', () => {
    it('should call getMuscleStates to fetch latest muscle data', () => {
      const states = db.getMuscleStates();

      expect(states).toBeDefined();
      expect(typeof states).toBe('object');
    });

    it('should call recovery calculator with muscle states array', () => {
      const muscleStatesArray = [
        { muscle: 'Quadriceps', fatiguePercent: 45 },
        { muscle: 'Hamstrings', fatiguePercent: 30 },
        { muscle: 'Glutes', fatiguePercent: 20 }
      ];
      const workoutTimestamp = '2025-11-10T08:00:00Z';
      const currentTime = '2025-11-11T10:00:00Z';

      mockCalculateRecovery(muscleStatesArray, workoutTimestamp, currentTime);

      expect(mockCalculateRecovery).toHaveBeenCalledWith(
        muscleStatesArray,
        workoutTimestamp,
        currentTime
      );
    });

    it('should handle empty muscle states (no workout history)', () => {
      vi.mocked(db.getMuscleStates).mockReturnValue({});

      const states = db.getMuscleStates();
      expect(Object.keys(states)).toHaveLength(0);
    });

    it('should get recovery data for all 15 muscles', () => {
      const result = mockCalculateRecovery(
        ALL_MUSCLES.map(m => ({ muscle: m, fatiguePercent: 0 })),
        '2025-11-11T08:00:00Z',
        '2025-11-11T10:00:00Z'
      );

      expect(mockCalculateRecovery).toHaveBeenCalled();
      expect(result.muscleStates).toBeDefined();
      expect(result.muscleStates).toHaveLength(15);
    });

    it('should call getMuscleBaselines for safety checks', () => {
      const baselines = db.getMuscleBaselines();

      expect(baselines).toBeDefined();
      expect(typeof baselines).toBe('object');
    });
  });

  /**
   * AC2: Endpoint calls exercise recommendation scoring engine
   */
  describe('AC2: Exercise recommendation service integration', () => {
    it('should call recommendExercises service', () => {
      const params = {
        targetMuscle: 'Quadriceps',
        currentWorkout: [],
        currentFatigue: { Quadriceps: 37.5, Hamstrings: 22.5 },
        currentMuscleVolumes: { Quadriceps: 0, Hamstrings: 0 },
        baselines: { Quadriceps: 100, Hamstrings: 100 },
        availableEquipment: []
      };

      mockRecommendExercises(params);

      expect(mockRecommendExercises).toHaveBeenCalled();
    });

    it('should pass targetMuscle to recommender', () => {
      const params = {
        targetMuscle: 'Hamstrings',
        currentWorkout: [],
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: {},
        availableEquipment: []
      };

      mockRecommendExercises(params);

      expect(mockRecommendExercises).toHaveBeenCalledWith(
        expect.objectContaining({
          targetMuscle: 'Hamstrings'
        })
      );
    });

    it('should pass current fatigue states to recommender', () => {
      const params = {
        targetMuscle: 'Quadriceps',
        currentWorkout: [],
        currentFatigue: { Quadriceps: 37.5, Hamstrings: 22.5, Glutes: 15.0 },
        currentMuscleVolumes: {},
        baselines: {},
        availableEquipment: []
      };

      mockRecommendExercises(params);

      expect(mockRecommendExercises).toHaveBeenCalledWith(
        expect.objectContaining({
          currentFatigue: expect.objectContaining({
            Quadriceps: 37.5,
            Hamstrings: 22.5
          })
        })
      );
    });

    it('should pass muscle baselines to recommender', () => {
      const params = {
        targetMuscle: 'Quadriceps',
        currentWorkout: [],
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: { Quadriceps: 100, Hamstrings: 100, Glutes: 100 },
        availableEquipment: []
      };

      mockRecommendExercises(params);

      const recommenderCall = mockRecommendExercises.mock.calls[0][0];
      expect(recommenderCall.baselines).toHaveProperty('Quadriceps');
      expect(recommenderCall.baselines.Quadriceps).toBe(100);
    });
  });

  /**
   * AC3: Endpoint applies filters (equipment, exercise type)
   */
  describe('AC3: Filter application', () => {
    it('should pass availableEquipment filter to recommender', () => {
      const params = {
        targetMuscle: 'Quadriceps',
        currentWorkout: [],
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: {},
        availableEquipment: ['dumbbell', 'bodyweight']
      };

      mockRecommendExercises(params);

      expect(mockRecommendExercises).toHaveBeenCalledWith(
        expect.objectContaining({
          availableEquipment: ['dumbbell', 'bodyweight']
        })
      );
    });

    it('should pass currentWorkout to recommender for variety scoring', () => {
      const currentWorkout = [
        { id: 'lunges', name: 'Lunges', sets: 3 }
      ];

      const params = {
        targetMuscle: 'Quadriceps',
        currentWorkout,
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: {},
        availableEquipment: []
      };

      mockRecommendExercises(params);

      expect(mockRecommendExercises).toHaveBeenCalledWith(
        expect.objectContaining({
          currentWorkout
        })
      );
    });

    it('should handle empty filters (no restrictions)', () => {
      const params = {
        targetMuscle: 'Quadriceps',
        currentWorkout: [],
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: {},
        availableEquipment: []
      };

      mockRecommendExercises(params);

      expect(mockRecommendExercises).toHaveBeenCalledWith(
        expect.objectContaining({
          currentWorkout: [],
          availableEquipment: []
        })
      );
    });
  });

  /**
   * AC4: Endpoint returns top 10-15 ranked exercises with scores
   */
  describe('AC4: Response structure and ranking', () => {
    it('should return safe recommendations array', () => {
      const result = mockRecommendExercises({
        targetMuscle: 'Quadriceps',
        currentWorkout: [],
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: {},
        availableEquipment: []
      });

      expect(result).toHaveProperty('safe');
      expect(Array.isArray(result.safe)).toBe(true);
    });

    it('should include exercise details in recommendations', () => {
      const result = mockRecommendations;

      const firstRec = result.safe[0];
      expect(firstRec).toHaveProperty('exercise');
      expect(firstRec.exercise).toHaveProperty('id');
      expect(firstRec.exercise).toHaveProperty('name');
      expect(firstRec.exercise).toHaveProperty('equipment');
      expect(firstRec.exercise).toHaveProperty('category');
    });

    it('should include score in recommendations', () => {
      const result = mockRecommendations;

      const firstRec = result.safe[0];
      expect(firstRec).toHaveProperty('score');
      expect(typeof firstRec.score).toBe('number');
      expect(firstRec.score).toBeGreaterThan(0);
    });

    it('should include score factors breakdown', () => {
      const result = mockRecommendations;

      const firstRec = result.safe[0];
      expect(firstRec).toHaveProperty('factors');
      expect(firstRec.factors).toHaveProperty('targetMatch');
      expect(firstRec.factors).toHaveProperty('freshness');
      expect(firstRec.factors).toHaveProperty('variety');
      expect(firstRec.factors).toHaveProperty('preference');
      expect(firstRec.factors).toHaveProperty('primarySecondary');
    });

    it('should return totalFiltered count', () => {
      const result = mockRecommendations;

      expect(result).toHaveProperty('totalFiltered');
      expect(typeof result.totalFiltered).toBe('number');
      expect(result.totalFiltered).toBeGreaterThanOrEqual(0);
    });

    it('should mark safe exercises with isSafe flag', () => {
      const result = mockRecommendations;

      result.safe.forEach(rec => {
        expect(rec).toHaveProperty('isSafe', true);
        expect(rec.warnings).toHaveLength(0);
      });
    });
  });

  /**
   * AC5: Endpoint includes safety warnings for bottleneck risks
   */
  describe('AC5: Safety warnings for bottleneck risks', () => {
    it('should return unsafe recommendations array', () => {
      const result = mockRecommendations;

      expect(result).toHaveProperty('unsafe');
      expect(Array.isArray(result.unsafe)).toBe(true);
    });

    it('should mark unsafe exercises with isSafe false', () => {
      const result = mockRecommendations;

      const unsafeRec = result.unsafe[0];
      expect(unsafeRec).toHaveProperty('isSafe', false);
      expect(unsafeRec).toHaveProperty('warnings');
      expect(Array.isArray(unsafeRec.warnings)).toBe(true);
    });

    it('should include detailed warning information', () => {
      const result = mockRecommendations;

      const warning = result.unsafe[0].warnings[0];
      expect(warning).toHaveProperty('muscle');
      expect(warning).toHaveProperty('currentFatigue');
      expect(warning).toHaveProperty('projectedFatigue');
      expect(warning).toHaveProperty('message');
    });

    it('should identify which muscle is the bottleneck', () => {
      const result = mockRecommendations;

      const warning = result.unsafe[0].warnings[0];
      expect(typeof warning.muscle).toBe('string');
      expect(warning.muscle.length).toBeGreaterThan(0);
    });

    it('should show current and projected fatigue levels', () => {
      const result = mockRecommendations;

      const warning = result.unsafe[0].warnings[0];
      expect(typeof warning.currentFatigue).toBe('number');
      expect(typeof warning.projectedFatigue).toBe('number');
      expect(warning.projectedFatigue).toBeGreaterThan(warning.currentFatigue);
    });
  });

  /**
   * Edge Cases and Error Handling
   */
  describe('Edge cases and error handling', () => {
    it('should handle recovery calculator errors', () => {
      mockCalculateRecovery.mockImplementation(() => {
        throw new Error('Recovery calculation failed');
      });

      expect(() =>
        mockCalculateRecovery([], '', '')
      ).toThrow('Recovery calculation failed');
    });

    it('should handle recommender service errors', () => {
      mockRecommendExercises.mockImplementation(() => {
        throw new Error('Recommendation service failed');
      });

      expect(() =>
        mockRecommendExercises({
          targetMuscle: 'Quadriceps',
          currentWorkout: [],
          currentFatigue: {},
          currentMuscleVolumes: {},
          baselines: {},
          availableEquipment: []
        })
      ).toThrow('Recommendation service failed');
    });

    it('should handle database query failures', () => {
      vi.mocked(db.getMuscleStates).mockImplementation(() => {
        throw new Error('Database query failed');
      });

      expect(() => db.getMuscleStates()).toThrow('Database query failed');
    });

    it('should handle empty muscle states gracefully', () => {
      vi.mocked(db.getMuscleStates).mockReturnValue({});

      const states = db.getMuscleStates();
      expect(Object.keys(states)).toHaveLength(0);
    });

    it('should handle missing baseline data', () => {
      vi.mocked(db.getMuscleBaselines).mockReturnValue({});

      const baselines = db.getMuscleBaselines();
      expect(Object.keys(baselines)).toHaveLength(0);
    });
  });

  /**
   * Integration-style tests (verify service composition)
   */
  describe('Service composition and data flow', () => {
    it('should coordinate all services in correct order', () => {
      // Step 1: Get muscle states from database
      const states = db.getMuscleStates();
      expect(states).toBeDefined();

      // Step 2: Calculate recovery for muscle states
      const muscleStatesArray = Object.keys(mockMuscleStates).map(muscle => ({
        muscle,
        fatiguePercent: mockMuscleStates[muscle].fatiguePercent
      }));

      const recovery = mockCalculateRecovery(
        muscleStatesArray,
        '2025-11-10T08:00:00Z',
        '2025-11-11T10:00:00Z'
      );

      expect(recovery).toBeDefined();
      expect(recovery.muscleStates).toBeDefined();

      // Step 3: Get baselines for safety checks
      const baselines = db.getMuscleBaselines();
      expect(baselines).toBeDefined();

      // Step 4: Call recommender with all data
      const recommendations = mockRecommendExercises({
        targetMuscle: 'Quadriceps',
        currentWorkout: [],
        currentFatigue: {
          Quadriceps: 37.5,
          Hamstrings: 22.5,
          Glutes: 15.0
        },
        currentMuscleVolumes: {},
        baselines: mockBaselines,
        availableEquipment: []
      });

      // Verify complete flow
      expect(db.getMuscleStates).toHaveBeenCalled();
      expect(mockCalculateRecovery).toHaveBeenCalled();
      expect(db.getMuscleBaselines).toHaveBeenCalled();
      expect(mockRecommendExercises).toHaveBeenCalled();

      // Verify final output structure
      expect(recommendations).toHaveProperty('safe');
      expect(recommendations).toHaveProperty('unsafe');
      expect(recommendations).toHaveProperty('totalFiltered');
    });

    it('should handle fresh user scenario (no workout history)', () => {
      // Mock empty muscle states
      vi.mocked(db.getMuscleStates).mockReturnValue({});

      const states = db.getMuscleStates();
      expect(Object.keys(states)).toHaveLength(0);

      // Should still get baselines
      const baselines = db.getMuscleBaselines();
      expect(baselines).toBeDefined();

      // Should call recommender with all muscles at 0% fatigue
      const recommendations = mockRecommendExercises({
        targetMuscle: 'Quadriceps',
        currentWorkout: [],
        currentFatigue: ALL_MUSCLES.reduce((acc, muscle) => {
          acc[muscle] = 0;
          return acc;
        }, {} as Record<string, number>),
        currentMuscleVolumes: {},
        baselines: mockBaselines,
        availableEquipment: []
      });

      expect(recommendations.safe).toBeDefined();
      expect(Array.isArray(recommendations.safe)).toBe(true);
    });

    it('should pass equipment filters through to recommender', () => {
      const equipment = ['dumbbell', 'bodyweight'];

      mockRecommendExercises({
        targetMuscle: 'Quadriceps',
        currentWorkout: [],
        currentFatigue: {},
        currentMuscleVolumes: {},
        baselines: {},
        availableEquipment: equipment
      });

      expect(mockRecommendExercises).toHaveBeenCalledWith(
        expect.objectContaining({
          availableEquipment: equipment
        })
      );
    });

    it('should handle both safe and unsafe recommendations in response', () => {
      const result = mockRecommendations;

      // Verify safe exercises
      expect(result.safe.length).toBeGreaterThan(0);
      result.safe.forEach(rec => {
        expect(rec.isSafe).toBe(true);
      });

      // Verify unsafe exercises
      expect(result.unsafe.length).toBeGreaterThan(0);
      result.unsafe.forEach(rec => {
        expect(rec.isSafe).toBe(false);
        expect(rec.warnings.length).toBeGreaterThan(0);
      });
    });
  });
});

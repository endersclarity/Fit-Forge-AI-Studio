/// <reference types="vite/client" />
// API client for FitForge local backend
// Replaces localStorage with API calls to Express server

import type {
  UserProfile,
  WorkoutSession,
  PersonalBests,
  MuscleBaselines,
  WorkoutTemplate,
  WorkoutResponse,
  MuscleStatesResponse,
  MuscleStatesUpdateRequest,
  MuscleStateData,
  ExerciseCategory,
  Muscle
} from './types';
import { EXERCISE_LIBRARY } from './constants';

// API base URL - uses environment variable in production, localhost in development
// In production (Railway): VITE_API_URL should be set to the backend service URL
// In development: defaults to localhost:3001 (Docker) or localhost:3002 (npm)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Generic API request helper
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Try to parse error response body for structured errors
    let errorData: any;
    try {
      errorData = await response.json();
    } catch (jsonError) {
      // If JSON parsing fails, throw generic error
      throw new Error(`API request failed: ${response.statusText}`);
    }

    // Create error with code property
    const error: any = new Error(errorData.error || `API request failed: ${response.statusText}`);
    if (errorData.code) {
      error.code = errorData.code;
    }
    throw error;
  }

  return response.json();
}

/**
 * Profile API
 */
export const profileAPI = {
  get: async (): Promise<UserProfile> => {
    const response = await apiRequest<any>('/profile');
    // Transform snake_case from backend to camelCase for frontend
    return {
      ...response,
      recoveryDaysToFull: response.recovery_days_to_full,
      // Transform bodyweightHistory dates from ISO strings to timestamps
      bodyweightHistory: response.bodyweightHistory?.map((entry: any) => ({
        date: new Date(entry.date).getTime(),
        weight: entry.weight
      })) || []
    };
  },
  update: async (profile: UserProfile): Promise<UserProfile> => {
    // Transform camelCase to snake_case for backend
    const backendProfile = {
      ...profile,
      recovery_days_to_full: profile.recoveryDaysToFull,
      // Transform bodyweightHistory dates from timestamps to ISO strings
      bodyweightHistory: profile.bodyweightHistory?.map(entry => ({
        date: new Date(entry.date).toISOString(),
        weight: entry.weight
      })) || []
    };
    const response = await apiRequest<any>('/profile', {
      method: 'PUT',
      body: JSON.stringify(backendProfile),
    });
    // Transform response back to camelCase
    return {
      ...response,
      recoveryDaysToFull: response.recovery_days_to_full,
      // Transform bodyweightHistory dates from ISO strings to timestamps
      bodyweightHistory: response.bodyweightHistory?.map((entry: any) => ({
        date: new Date(entry.date).getTime(),
        weight: entry.weight
      })) || []
    };
  },
  init: (data: { name: string; experience: 'Beginner' | 'Intermediate' | 'Advanced'; equipment?: Array<{ name: string; minWeight: number; maxWeight: number; increment: number }> }) =>
    apiRequest<UserProfile>('/profile/init', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/**
 * Workouts API
 */
export const workoutsAPI = {
  getAll: async (): Promise<WorkoutSession[]> => {
    // Backend returns workouts in a different format, need to transform
    const backendWorkouts = await apiRequest<WorkoutResponse[]>('/workouts');
    // Transform backend format to frontend WorkoutSession format
    // Backend has: { id, date, variation, duration_seconds, exercises: [{ exercise, sets }] }
    // Frontend expects: WorkoutSession with loggedExercises
    return backendWorkouts.map((bw) => ({
      id: String(bw.id),
      name: `${bw.variation || 'Unknown'} Workout`,
      type: 'Push' as ExerciseCategory, // TODO: Store workout type in backend
      variation: (bw.variation || 'A') as 'A' | 'B',
      startTime: typeof bw.date === 'string' ? new Date(bw.date).getTime() : bw.date - (bw.duration_seconds || 0) * 1000,
      endTime: typeof bw.date === 'string' ? new Date(bw.date).getTime() : bw.date,
      loggedExercises: [],
      muscleFatigueHistory: {}
    }));
  },
  getLastByCategory: async (category: string): Promise<WorkoutResponse | null> => {
    try {
      return await apiRequest<WorkoutResponse>(`/workouts/last?category=${encodeURIComponent(category)}`);
    } catch (error) {
      // Return null if not found (404)
      return null;
    }
  },
  create: async (workout: WorkoutSession & { category?: string; progressionMethod?: string }): Promise<WorkoutSession & { prs?: import('./types').PRInfo[] }> => {
    // Transform frontend WorkoutSession to backend format
    const backendWorkout = {
      date: workout.endTime,
      category: workout.category || workout.type,
      variation: workout.variation,
      progressionMethod: workout.progressionMethod,
      durationSeconds: Math.floor((workout.endTime - workout.startTime) / 1000),
      exercises: workout.loggedExercises.map(le => {
        // Find exercise name from EXERCISE_LIBRARY
        const exerciseInfo = EXERCISE_LIBRARY.find(e => e.id === le.exerciseId);
        return {
          exercise: exerciseInfo?.name || 'Unknown',
          sets: le.sets.map(s => ({
            weight: s.weight,
            reps: s.reps,
            to_failure: s.to_failure // Include to_failure field
          }))
        };
      })
    };

    const saved = await apiRequest<WorkoutResponse>('/workouts', {
      method: 'POST',
      body: JSON.stringify(backendWorkout),
    });

    // Return the original workout with the backend ID and PRs
    return {
      ...workout,
      id: String(saved.id),
      prs: saved.prs // Include PRs returned from the API
    };
  },
};

/**
 * Muscle States API
 *
 * Note: The old get/update methods that transformed data have been removed.
 * Muscle states are now managed directly by components via fetch().
 * This API only provides the updateNew() method for workout save flow.
 */
export const muscleStatesAPI = {
  /**
   * Update muscle states using new API format
   * Accepts initial_fatigue_percent and last_trained in UTC ISO format
   * Returns calculated muscle states from backend
   */
  updateNew: async (updates: MuscleStatesUpdateRequest): Promise<MuscleStatesResponse> => {
    return await apiRequest<MuscleStatesResponse>('/muscle-states', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

/**
 * Personal Bests API
 */
export const personalBestsAPI = {
  get: () => apiRequest<PersonalBests>('/personal-bests'),
  update: (pbs: PersonalBests) => apiRequest<PersonalBests>('/personal-bests', {
    method: 'PUT',
    body: JSON.stringify(pbs),
  }),
};

/**
 * Muscle Baselines API
 */
export const muscleBaselinesAPI = {
  get: () => apiRequest<MuscleBaselines>('/muscle-baselines'),
  update: (baselines: MuscleBaselines) => apiRequest<MuscleBaselines>('/muscle-baselines', {
    method: 'PUT',
    body: JSON.stringify(baselines),
  }),
};

/**
 * Workout Templates API
 */
export const templatesAPI = {
  getAll: () => apiRequest<WorkoutTemplate[]>('/templates'),
  getById: (id: string) => apiRequest<WorkoutTemplate>(`/templates/${id}`),
  create: (template: Omit<WorkoutTemplate, 'id' | 'timesUsed' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<WorkoutTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    }),
  update: (id: string, template: Partial<WorkoutTemplate>) =>
    apiRequest<WorkoutTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/templates/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Quick-Add API
 */
export const quickAddAPI = {
  /**
   * Log a quick exercise set
   * Creates a minimal workout with a single set
   */
  quickAdd: async (request: import('./types').QuickAddRequest): Promise<import('./types').QuickAddResponse> => {
    return await apiRequest<import('./types').QuickAddResponse>('/quick-add', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Log a quick workout with multiple exercises and sets
   * Creates a complete workout with auto-detected category and variation
   */
  quickWorkout: async (request: import('./types').QuickWorkoutRequest): Promise<import('./types').QuickWorkoutResponse> => {
    return await apiRequest<import('./types').QuickWorkoutResponse>('/quick-workout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

/**
 * Workout Builder API
 */
export const builderAPI = {
  /**
   * Save a builder workout (executed or logged as completed)
   */
  saveBuilderWorkout: async (request: import('./types').BuilderWorkoutRequest): Promise<import('./types').QuickWorkoutResponse> => {
    return await apiRequest<import('./types').QuickWorkoutResponse>('/builder-workout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
};

/**
 * Health check
 */
export const healthCheck = () => apiRequest<{ status: string; timestamp: string }>('/health');

// ============================================
// Exercise Calibration API Functions
// ============================================

/**
 * Get all user calibrations
 */
export async function getUserCalibrations(): Promise<import('./types').CalibrationMap> {
  return apiRequest<import('./types').CalibrationMap>('/calibrations');
}

/**
 * Get calibrations for specific exercise (merged with defaults)
 */
export async function getExerciseCalibrations(
  exerciseId: string
): Promise<import('./types').ExerciseCalibrationData> {
  return apiRequest<import('./types').ExerciseCalibrationData>(`/calibrations/${exerciseId}`);
}

/**
 * Save calibrations for exercise
 */
export async function saveExerciseCalibrations(
  exerciseId: string,
  calibrations: Record<string, number>
): Promise<import('./types').ExerciseCalibrationData> {
  return apiRequest<import('./types').ExerciseCalibrationData>(`/calibrations/${exerciseId}`, {
    method: 'PUT',
    body: JSON.stringify({ calibrations })
  });
}

/**
 * Reset exercise to defaults (remove all calibrations)
 */
export async function deleteExerciseCalibrations(
  exerciseId: string
): Promise<{ message: string; exerciseId: string }> {
  return apiRequest<{ message: string; exerciseId: string }>(`/calibrations/${exerciseId}`, {
    method: 'DELETE'
  });
}

// ============================================
// Exercise History API Functions
// ============================================

export interface ExerciseHistoryResponse {
  exerciseId: string;
  lastPerformed: string | null;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
  totalVolume: number;
  personalRecord: {
    weight: number;
    reps: number;
  } | null;
}

/**
 * Get exercise history (last performance and personal records)
 */
export async function getExerciseHistory(
  exerciseId: string
): Promise<ExerciseHistoryResponse> {
  return apiRequest<ExerciseHistoryResponse>(`/exercise-history/${exerciseId}/latest`);
}

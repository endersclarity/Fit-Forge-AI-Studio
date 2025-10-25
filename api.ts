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

// API base URL - defaults to same origin in production, localhost:3001 in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Profile API
 */
export const profileAPI = {
  get: () => apiRequest<UserProfile>('/profile'),
  update: (profile: UserProfile) => apiRequest<UserProfile>('/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
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
 * Health check
 */
export const healthCheck = () => apiRequest<{ status: string; timestamp: string }>('/health');

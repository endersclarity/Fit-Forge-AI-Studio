// API client for FitForge local backend
// Replaces localStorage with API calls to Express server

import type { UserProfile, WorkoutSession, MuscleStates, PersonalBests, MuscleBaselines } from './types';
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
    const backendWorkouts = await apiRequest<any[]>('/workouts');
    // Transform backend format to frontend WorkoutSession format
    // Backend has: { id, date, variation, duration_seconds, exercises: [{ exercise, sets }] }
    // Frontend expects: WorkoutSession with loggedExercises
    return backendWorkouts.map((bw) => ({
      id: String(bw.id),
      name: `${bw.variation || 'Unknown'} Workout`,
      type: 'Push' as any, // TODO: Store workout type in backend
      variation: (bw.variation || 'A') as 'A' | 'B',
      startTime: bw.date - (bw.duration_seconds || 0) * 1000,
      endTime: bw.date,
      loggedExercises: [],
      muscleFatigueHistory: {}
    }));
  },
  create: async (workout: WorkoutSession): Promise<WorkoutSession> => {
    // Transform frontend WorkoutSession to backend format
    const backendWorkout = {
      date: workout.endTime,
      variation: workout.variation,
      durationSeconds: Math.floor((workout.endTime - workout.startTime) / 1000),
      exercises: workout.loggedExercises.map(le => {
        // Find exercise name from EXERCISE_LIBRARY
        const exerciseInfo = EXERCISE_LIBRARY.find(e => e.id === le.exerciseId);
        return {
          exercise: exerciseInfo?.name || 'Unknown',
          sets: le.sets.map(s => ({
            weight: s.weight,
            reps: s.reps
          }))
        };
      })
    };

    const saved = await apiRequest<any>('/workouts', {
      method: 'POST',
      body: JSON.stringify(backendWorkout),
    });

    // Return the original workout since backend doesn't return full workout
    return workout;
  },
};

/**
 * Muscle States API
 */
export const muscleStatesAPI = {
  get: async (): Promise<MuscleStates> => {
    const backendStates = await apiRequest<any>('/muscle-states');
    // Transform backend format to frontend MuscleStates format
    // Backend has: { fatiguePercent, volumeToday, recoveredAt, lastTrained }
    // Frontend expects: { lastTrained, fatiguePercentage, recoveryDaysNeeded }
    const transformed: any = {};
    for (const [muscle, state] of Object.entries(backendStates as any)) {
      transformed[muscle] = {
        lastTrained: state.lastTrained || 0,
        fatiguePercentage: state.fatiguePercent || 0,
        recoveryDaysNeeded: 0 // Backend doesn't store this, frontend calculates it
      };
    }
    return transformed as MuscleStates;
  },
  update: async (states: MuscleStates): Promise<MuscleStates> => {
    // Transform frontend MuscleStates to backend format
    const backendStates: any = {};
    for (const [muscle, state] of Object.entries(states)) {
      backendStates[muscle] = {
        fatiguePercent: state.fatiguePercentage,
        volumeToday: 0, // Not tracked in frontend currently
        recoveredAt: null, // Calculated from lastTrained + recoveryDaysNeeded
        lastTrained: state.lastTrained
      };
    }

    await apiRequest<any>('/muscle-states', {
      method: 'PUT',
      body: JSON.stringify(backendStates),
    });

    // Return the original states
    return states;
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
 * Health check
 */
export const healthCheck = () => apiRequest<{ status: string; timestamp: string }>('/health');

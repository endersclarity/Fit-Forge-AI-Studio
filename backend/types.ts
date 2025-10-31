// Import shared enums (these are values, not just types)
import { Muscle, DetailedMuscle } from '../types';

// Import shared types
import type {
  MuscleEngagement,
  DetailedMuscleEngagement,
  Exercise,
  ExerciseCategory,
  Equipment,
  Difficulty,
  Variation,
  BaselineUpdate,
  PRInfo,
  MuscleStatesResponse,
  MuscleStateData,
  PersonalBests,
  ExerciseMaxes,
  MuscleBaselinesUpdateRequest,
  PersonalBestsUpdateRequest,
  MuscleStatesUpdateRequest,
  ProfileResponse,
  ProfileUpdateRequest,
  WorkoutExercise,
  WorkoutSaveRequest,
  PersonalBestsResponse,
  MuscleBaselinesResponse,
  HealthCheckResponse,
  ApiErrorResponse,
  QuickAddRequest,
  QuickWorkoutRequest,
  BuilderWorkoutRequest,
  ExerciseCalibrationData,
  CalibrationMap,
  SaveCalibrationRequest,
  DetailedMuscleStatesResponse
} from '../types';

// Re-export shared enums
export { Muscle, DetailedMuscle };

// Re-export shared types
export type {
  MuscleEngagement,
  DetailedMuscleEngagement,
  Exercise,
  ExerciseCategory,
  Equipment,
  Difficulty,
  Variation,
  BaselineUpdate,
  PRInfo,
  MuscleStatesResponse,
  MuscleStateData,
  PersonalBests,
  ExerciseMaxes,
  MuscleBaselinesUpdateRequest,
  PersonalBestsUpdateRequest,
  MuscleStatesUpdateRequest,
  ProfileResponse,
  ProfileUpdateRequest,
  WorkoutExercise,
  WorkoutSaveRequest,
  PersonalBestsResponse,
  MuscleBaselinesResponse,
  HealthCheckResponse,
  ApiErrorResponse,
  QuickAddRequest,
  QuickWorkoutRequest,
  BuilderWorkoutRequest,
  ExerciseCalibrationData,
  CalibrationMap,
  SaveCalibrationRequest,
  DetailedMuscleStatesResponse
};

// ============================================
// BACKEND-SPECIFIC TYPES ONLY
// ============================================

// Backend uses exerciseIds instead of sets (different from frontend)
export interface WorkoutTemplate {
  id: string;
  name: string;
  category: ExerciseCategory;
  variation: 'A' | 'B';
  exerciseIds: string[]; // Backend uses exerciseIds, frontend uses sets
  isFavorite: boolean;
  timesUsed: number;
  createdAt: number;
  updatedAt: number;
}

// Note: These types exist in root but are not exported there, so we define them here
export interface ProfileInitRequest {
  name: string;
  experience: Difficulty;
  equipment?: Array<{
    name: string;
    minWeight: number;
    maxWeight: number;
    increment: number;
  }>;
}

export interface WorkoutRotationState {
  id?: number;
  userId: number;
  currentCycle: 'A' | 'B';
  currentPhase: number;
  lastWorkoutDate: string | null;
  lastWorkoutCategory: ExerciseCategory | null;
  lastWorkoutVariation: 'A' | 'B' | null;
  restDaysCount: number;
  updatedAt?: string;
}

export interface WorkoutRecommendation {
  isRestDay: boolean;
  reason?: string;
  category?: ExerciseCategory;
  variation?: 'A' | 'B';
  phase?: number;
  lastWorkout?: {
    category: ExerciseCategory;
    variation: 'A' | 'B';
    date: string;
    daysAgo: number;
  };
}

export interface RotationSequenceItem {
  category: ExerciseCategory;
  variation: 'A' | 'B';
  restAfter: number;
}

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

// Database Row Types
export interface DatabaseWorkout {
  id: number;
  user_id: number;
  started_at: string;
  ended_at: string | null;
  category: string | null;
  variation: string | null;
  progression_method: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface DatabaseExercise {
  id: number;
  workout_id: number;
  exercise_name: string;
  created_at: string;
}

export interface DatabaseSet {
  id: number;
  exercise_id: number;
  weight: number;
  reps: number;
  to_failure: number; // SQLite stores boolean as 0 or 1
  created_at: string;
}

export interface DatabaseMuscleState {
  id: number;
  user_id: number;
  muscle_name: string;
  initial_fatigue_percent: number;
  last_trained: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabasePersonalBest {
  id: number;
  user_id: number;
  exercise_name: string;
  best_single_set: number | null;
  best_session_volume: number | null;
  rolling_average_max: number | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMuscleBaseline {
  id: number;
  user_id: number;
  muscle_name: string;
  system_learned_max: number;
  user_override: number | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProfile {
  id: number;
  user_id: number;
  name: string;
  experience: string;
  recovery_days_to_full: number;
  created_at: string;
  updated_at: string;
}

// Backend API Response Types

export interface WorkoutResponse {
  id: number;
  date: string;
  category: string | null;
  variation: string | null;
  progression_method: string | null;
  duration_seconds: number | null;
  exercises: Array<{
    exercise: string;
    sets: Array<{
      weight: number;
      reps: number;
      to_failure?: boolean;
    }>;
  }>;
  prs?: PRInfo[];
  created_at?: string;
  updated_baselines?: BaselineUpdate[];
}

export interface QuickAddResponse {
  workout: WorkoutResponse;
  muscle_states: MuscleStatesResponse;
  pr_info?: PRInfo;
  attached_to_active: boolean;
}

export interface QuickWorkoutResponse {
  workout_id: number;
  category: string;
  variation: string;
  duration_seconds: number;
  prs: PRInfo[];
  updated_baselines: BaselineUpdate[];
  muscle_states_updated: boolean;
}

// Metric Calculation Types
export interface ExerciseMetrics {
  exerciseName: string;
  totalVolume: number;
  muscleVolumes: Record<string, number>; // muscle -> volume contribution
}

export interface WorkoutMetrics {
  totalVolume: number;
  muscleVolumes: Record<string, number>;
  exercises: ExerciseMetrics[];
  detectedPRs: PRInfo[];
  baselineUpdates: BaselineUpdate[];
}

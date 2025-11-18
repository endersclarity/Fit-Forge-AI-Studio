import { PlannedExercise } from './savedWorkouts';

export interface CompletedSet {
  weight: number | 'bodyweight';
  reps: number;
  restSeconds: number;
  completedAt: number;
}

export interface ActiveWorkoutState {
  plannedExercises: PlannedExercise[];
  currentExerciseIndex: number;
  exerciseLogs: Record<number, CompletedSet[]>; // exerciseIndex -> logged sets
  startTime: number;
  isRestTimerActive: boolean;
  restTimeRemaining: number;
}

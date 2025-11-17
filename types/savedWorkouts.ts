export interface PlannedSet {
  weight: number | 'bodyweight';
  reps: number;
  restSeconds: number;
}

export interface PlannedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: PlannedSet[];
}

export interface SavedWorkout {
  id: string;
  name: string;
  createdAt: number;
  exercises: PlannedExercise[];
}

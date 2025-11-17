export interface PlannedExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
}

export interface SavedWorkout {
  id: string;
  name: string;
  createdAt: number;
  exercises: PlannedExercise[];
}

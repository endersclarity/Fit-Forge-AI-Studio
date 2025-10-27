import { WorkoutSession, LoggedExercise } from '../types';

/**
 * Detects the progression method used in a workout by comparing it to the last workout.
 * Returns 'weight' if weight increased significantly, 'reps' if reps increased,
 * or alternates if both/neither increased.
 */
export function detectProgressionMethod(
  currentWorkout: WorkoutSession,
  lastWorkout: WorkoutSession | null
): 'weight' | 'reps' {
  // Default to 'weight' if no previous workout
  if (!lastWorkout) {
    return 'weight';
  }

  // If last workout has a method, and current workout is ambiguous, alternate
  const lastMethod = (lastWorkout as any).progressionMethod as 'weight' | 'reps' | null;

  // Build maps of exercise averages for both workouts
  const currentAvg = calculateExerciseAverages(currentWorkout.loggedExercises);
  const lastAvg = calculateExerciseAverages(lastWorkout.loggedExercises);

  let totalWeightChange = 0;
  let totalRepsChange = 0;
  let commonExerciseCount = 0;

  // Compare only common exercises (exercises present in both workouts)
  for (const exerciseId in currentAvg) {
    if (lastAvg[exerciseId]) {
      const current = currentAvg[exerciseId];
      const last = lastAvg[exerciseId];

      // Calculate percentage change
      const weightChange = last.weight > 0 ? (current.weight - last.weight) / last.weight : 0;
      const repsChange = last.reps > 0 ? (current.reps - last.reps) / last.reps : 0;

      totalWeightChange += weightChange;
      totalRepsChange += repsChange;
      commonExerciseCount++;
    }
  }

  // No common exercises - alternate from last method
  if (commonExerciseCount === 0) {
    return lastMethod === 'weight' ? 'reps' : 'weight';
  }

  // Calculate average changes across all common exercises
  const avgWeightChange = totalWeightChange / commonExerciseCount;
  const avgRepsChange = totalRepsChange / commonExerciseCount;

  // Threshold: 2% change is considered significant
  const THRESHOLD = 0.02;

  // If weight increased significantly more than reps
  if (avgWeightChange >= THRESHOLD && avgWeightChange > avgRepsChange) {
    return 'weight';
  }

  // If reps increased significantly more than weight
  if (avgRepsChange >= THRESHOLD && avgRepsChange > avgWeightChange) {
    return 'reps';
  }

  // Ambiguous case (both increased similarly, or neither increased) - alternate
  return lastMethod === 'weight' ? 'reps' : 'weight';
}

/**
 * Calculates average weight and reps per exercise
 */
function calculateExerciseAverages(
  exercises: LoggedExercise[]
): Record<string, { weight: number; reps: number }> {
  const averages: Record<string, { weight: number; reps: number }> = {};

  for (const exercise of exercises) {
    if (exercise.sets.length === 0) continue;

    const totalWeight = exercise.sets.reduce((sum, set) => sum + set.weight, 0);
    const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);
    const setCount = exercise.sets.length;

    averages[exercise.exerciseId] = {
      weight: totalWeight / setCount,
      reps: totalReps / setCount
    };
  }

  return averages;
}

import { useState, useCallback, useEffect, useRef } from 'react';
import { PlannedExercise } from '../types/savedWorkouts';
import { ActiveWorkoutState, CompletedSet } from '../types/activeWorkout';
import { WorkoutSession, ExerciseLog } from '../types';

export function useActiveWorkout(plannedExercises: PlannedExercise[], currentBodyweight: number = 0) {
  const [state, setState] = useState<ActiveWorkoutState>({
    plannedExercises,
    currentExerciseIndex: 0,
    exerciseLogs: {},
    startTime: Date.now(),
    isRestTimerActive: false,
    restTimeRemaining: 0,
  });

  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, []);

  // Rest timer countdown
  useEffect(() => {
    if (state.isRestTimerActive && state.restTimeRemaining > 0) {
      restTimerRef.current = setInterval(() => {
        setState(prev => {
          const newTime = prev.restTimeRemaining - 1;
          if (newTime <= 0) {
            if (restTimerRef.current) {
              clearInterval(restTimerRef.current);
            }
            return {
              ...prev,
              isRestTimerActive: false,
              restTimeRemaining: 0,
            };
          }
          return {
            ...prev,
            restTimeRemaining: newTime,
          };
        });
      }, 1000);
    }

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [state.isRestTimerActive, state.restTimeRemaining]);

  const logSet = useCallback(
    (weight: number | 'bodyweight', reps: number, restSeconds: number) => {
      const completedSet: CompletedSet = {
        weight,
        reps,
        restSeconds,
        completedAt: Date.now(),
      };

      setState(prev => {
        const currentLogs = prev.exerciseLogs[prev.currentExerciseIndex] || [];
        return {
          ...prev,
          exerciseLogs: {
            ...prev.exerciseLogs,
            [prev.currentExerciseIndex]: [...currentLogs, completedSet],
          },
          isRestTimerActive: true,
          restTimeRemaining: restSeconds,
        };
      });
    },
    []
  );

  const switchExercise = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentExerciseIndex: index,
    }));
  }, []);

  const skipRestTimer = useCallback(() => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }
    setState(prev => ({
      ...prev,
      isRestTimerActive: false,
      restTimeRemaining: 0,
    }));
  }, []);

  const getExerciseProgress = useCallback(
    (exerciseIndex: number) => {
      const logs = state.exerciseLogs[exerciseIndex] || [];
      const planned = state.plannedExercises[exerciseIndex];
      return {
        completed: logs.length,
        total: planned.sets.length,
        isComplete: logs.length >= planned.sets.length,
      };
    },
    [state.exerciseLogs, state.plannedExercises]
  );

  const getCurrentSetInfo = useCallback(() => {
    const exerciseIndex = state.currentExerciseIndex;
    const logs = state.exerciseLogs[exerciseIndex] || [];
    const planned = state.plannedExercises[exerciseIndex];

    // Defensive check: if no planned exercise or sets, return safe defaults
    if (!planned || !planned.sets || planned.sets.length === 0) {
      return {
        setNumber: 1,
        totalSets: 0,
        suggestedWeight: 0 as number | 'bodyweight',
        suggestedReps: 10,
        suggestedRest: 90,
      };
    }

    const currentSetIndex = logs.length;

    if (currentSetIndex >= planned.sets.length) {
      // All sets done for this exercise, suggest next set based on last one
      const lastPlannedSet = planned.sets[planned.sets.length - 1];
      return {
        setNumber: currentSetIndex + 1,
        totalSets: planned.sets.length,
        suggestedWeight: lastPlannedSet.weight,
        suggestedReps: lastPlannedSet.reps,
        suggestedRest: lastPlannedSet.restSeconds,
      };
    }

    const plannedSet = planned.sets[currentSetIndex];
    return {
      setNumber: currentSetIndex + 1,
      totalSets: planned.sets.length,
      suggestedWeight: plannedSet.weight,
      suggestedReps: plannedSet.reps,
      suggestedRest: plannedSet.restSeconds,
    };
  }, [state.currentExerciseIndex, state.exerciseLogs, state.plannedExercises]);

  const getElapsedTime = useCallback(() => {
    return Math.floor((Date.now() - state.startTime) / 1000);
  }, [state.startTime]);

  const isWorkoutComplete = useCallback(() => {
    return state.plannedExercises.every((_, index) => {
      const progress = getExerciseProgress(index);
      return progress.isComplete;
    });
  }, [state.plannedExercises, getExerciseProgress]);

  const getWorkoutSessionData = useCallback((): WorkoutSession => {
    const loggedExercises: ExerciseLog[] = [];

    // Convert each exercise's completed sets
    state.plannedExercises.forEach((exercise, index) => {
      const completedSets = state.exerciseLogs[index] || [];

      // Skip exercises with no logged sets
      if (completedSets.length === 0) return;

      loggedExercises.push({
        exerciseId: exercise.exerciseId,
        sets: completedSets.map(set => ({
          weight: set.weight === 'bodyweight' ? currentBodyweight : set.weight,
          reps: set.reps,
          to_failure: false,
        })),
      });
    });

    return {
      id: '',
      name: 'Workout',
      type: 'Push', // Default, can be enhanced later
      variation: 'A',
      startTime: state.startTime,
      endTime: Date.now(),
      loggedExercises,
      muscleFatigueHistory: {},
    };
  }, [state.plannedExercises, state.exerciseLogs, state.startTime, currentBodyweight]);

  const getIncompleteExercises = useCallback(() => {
    return state.plannedExercises.filter((_, index) => {
      const logs = state.exerciseLogs[index] || [];
      return logs.length === 0;
    }).map(ex => ex.exerciseName);
  }, [state.plannedExercises, state.exerciseLogs]);

  return {
    state,
    logSet,
    switchExercise,
    skipRestTimer,
    getExerciseProgress,
    getCurrentSetInfo,
    getElapsedTime,
    isWorkoutComplete,
    getWorkoutSessionData,
    getIncompleteExercises,
  };
}

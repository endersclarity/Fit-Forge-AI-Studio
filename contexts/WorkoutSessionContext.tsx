import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SetData {
  weight: number;
  reps: number;
}

interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetData[];
}

interface WorkoutSessionState {
  exercises: ExerciseLog[];
  startTime: Date | null;
  currentExercise: { id: string; name: string } | null;
}

interface WorkoutSessionContextType {
  session: WorkoutSessionState;
  startSession: () => void;
  selectExercise: (id: string, name: string) => void;
  logSet: (weight: number, reps: number) => void;
  clearCurrentExercise: () => void;
  resetSession: () => void;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextType | null>(null);

export const useWorkoutSession = () => {
  const context = useContext(WorkoutSessionContext);
  if (!context) {
    throw new Error('useWorkoutSession must be used within WorkoutSessionProvider');
  }
  return context;
};

export const WorkoutSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<WorkoutSessionState>({
    exercises: [],
    startTime: null,
    currentExercise: null,
  });

  const startSession = () => {
    setSession({
      exercises: [],
      startTime: new Date(),
      currentExercise: null,
    });
  };

  const selectExercise = (id: string, name: string) => {
    setSession(prev => ({
      ...prev,
      currentExercise: { id, name },
    }));
  };

  const logSet = (weight: number, reps: number) => {
    if (!session.currentExercise) return;

    setSession(prev => {
      const existingIndex = prev.exercises.findIndex(
        e => e.exerciseId === prev.currentExercise!.id
      );

      if (existingIndex >= 0) {
        const updated = [...prev.exercises];
        updated[existingIndex].sets.push({ weight, reps });
        return { ...prev, exercises: updated };
      } else {
        return {
          ...prev,
          exercises: [
            ...prev.exercises,
            {
              exerciseId: prev.currentExercise!.id,
              exerciseName: prev.currentExercise!.name,
              sets: [{ weight, reps }],
            },
          ],
        };
      }
    });
  };

  const clearCurrentExercise = () => {
    setSession(prev => ({ ...prev, currentExercise: null }));
  };

  const resetSession = () => {
    setSession({
      exercises: [],
      startTime: null,
      currentExercise: null,
    });
  };

  return (
    <WorkoutSessionContext.Provider
      value={{
        session,
        startSession,
        selectExercise,
        logSet,
        clearCurrentExercise,
        resetSession,
      }}
    >
      {children}
    </WorkoutSessionContext.Provider>
  );
};

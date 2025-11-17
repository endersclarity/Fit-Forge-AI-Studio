import { useState, useEffect, useCallback } from 'react';
import { SavedWorkout } from '../types/savedWorkouts';

const STORAGE_KEY = 'fitforge_saved_workouts';

export function useSavedWorkouts() {
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedWorkouts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved workouts:', e);
        setSavedWorkouts([]);
      }
    }
  }, []);

  // Save a new workout
  const saveWorkout = useCallback((workout: Omit<SavedWorkout, 'id' | 'createdAt'>) => {
    const newWorkout: SavedWorkout = {
      ...workout,
      id: `workout_${Date.now()}`,
      createdAt: Date.now(),
    };

    setSavedWorkouts(prev => {
      const updated = [...prev, newWorkout];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newWorkout;
  }, []);

  // Delete a workout
  const deleteWorkout = useCallback((id: string) => {
    setSavedWorkouts(prev => {
      const updated = prev.filter(w => w.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get a single workout by ID
  const getWorkout = useCallback((id: string) => {
    return savedWorkouts.find(w => w.id === id);
  }, [savedWorkouts]);

  return {
    savedWorkouts,
    saveWorkout,
    deleteWorkout,
    getWorkout,
  };
}

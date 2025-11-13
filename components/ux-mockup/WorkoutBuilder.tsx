import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExerciseCard from './components/ExerciseCard';
import ExercisePicker from './components/ExercisePicker';
import RestTimer from './components/RestTimer';
import { mockWorkout, exerciseLibrary, WorkoutExercise, Exercise } from './data/mockData';

const WorkoutBuilder: React.FC = () => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>(mockWorkout);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [restTimer, setRestTimer] = useState<{ active: boolean; seconds: number } | null>(null);

  const handleUpdateSet = useCallback((exerciseId: string, setId: string, field: 'reps' | 'weight' | 'completed' | 'toFailure', value: number | boolean) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : ex
      )
    );
  }, []);

  const handleLogSet = useCallback((exerciseId: string, setId: string) => {
    // Mark set as completed
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId ? { ...set, completed: true } : set
              ),
            }
          : ex
      )
    );

    // Auto-start rest timer
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (exercise) {
      setRestTimer({ active: true, seconds: exercise.restTimerSeconds });
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 25, 50]);
    }
  }, [exercises]);

  const handleLogAllRemaining = useCallback((exerciseId: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    // Get last completed set values
    const completedSets = exercise.sets.filter((s) => s.completed);
    if (completedSets.length === 0) return;

    const lastCompleted = completedSets[completedSets.length - 1];
    const remainingSets = exercise.sets.filter((s) => !s.completed);

    // Update remaining sets with last completed values
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                remainingSets.some((rs) => rs.id === set.id)
                  ? {
                      ...set,
                      weight: lastCompleted.weight,
                      reps: lastCompleted.reps,
                      completed: true,
                    }
                  : set
              ),
            }
          : ex
      )
    );

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [exercises]);

  const handleAddExercise = useCallback((exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: `ex-${Date.now()}`,
      name: exercise.name,
      equipment: exercise.equipment,
      muscleGroups: exercise.muscleGroups,
      restTimerSeconds: 90,
      sets: [
        { id: `set-${Date.now()}-1`, reps: 10, weight: 0, completed: false, toFailure: false },
        { id: `set-${Date.now()}-2`, reps: 10, weight: 0, completed: false, toFailure: false },
        { id: `set-${Date.now()}-3`, reps: 10, weight: 0, completed: false, toFailure: false },
      ],
    };
    setExercises((prev) => [...prev, newExercise]);
  }, []);

  const handleSkipRest = useCallback(() => {
    setRestTimer(null);
  }, []);

  const handleRestComplete = useCallback(() => {
    setRestTimer(null);
    // Play completion sound
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-24">
      {/* Rest Timer */}
      {restTimer && restTimer.active && (
        <RestTimer
          initialSeconds={restTimer.seconds}
          onComplete={handleRestComplete}
          onSkip={handleSkipRest}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white shadow-md z-30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">UX Mockup</h1>
            <p className="text-sm text-gray-600 mt-1">
              Modern Workout Builder Demo
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {completedSets}/{totalSets}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Sets Done
            </div>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="px-4 pt-6">
        <AnimatePresence>
          {exercises.map((exercise) => {
            const completedCount = exercise.sets.filter((s) => s.completed).length;
            const totalCount = exercise.sets.length;
            const showLogAllButton =
              (totalCount === 3 && completedCount === 2) ||
              (totalCount === 4 && completedCount === 3);

            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onUpdateSet={(setId, field, value) =>
                  handleUpdateSet(exercise.id, setId, field, value)
                }
                onLogSet={(setId) => handleLogSet(exercise.id, setId)}
                showLogAllButton={showLogAllButton}
                onLogAll={() => handleLogAllRemaining(exercise.id)}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {exercises.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Exercises Yet
          </h3>
          <p className="text-gray-600 text-center">
            Tap the button below to add your first exercise
          </p>
        </motion.div>
      )}

      {/* Add Exercise FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsPickerOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full shadow-2xl flex items-center justify-center z-40 transition-colors"
        style={{
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 10px 40px rgba(37, 99, 235, 0.4)',
        }}
      >
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </motion.button>

      {/* Exercise Picker */}
      <ExercisePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        exercises={exerciseLibrary}
        onSelectExercise={handleAddExercise}
      />
    </div>
  );
};

export default WorkoutBuilder;

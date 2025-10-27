import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { fetchSmartDefaults, SmartDefaults } from '../utils/smartDefaults';
import { quickAddAPI } from '../api';
import ExercisePicker from './ExercisePicker';
import QuickAddForm from './QuickAddForm';

interface QuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// State machine types for multi-exercise, multi-set logging
type QuickWorkoutMode = 'exercise-picker' | 'set-entry' | 'summary';

interface LoggedSet {
  setNumber: number;
  weight: number;
  reps: number;
  toFailure: boolean;
}

interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
}

interface QuickAddState {
  mode: QuickWorkoutMode;
  exercises: LoggedExercise[];
  currentExercise: Exercise | null;
  currentSetNumber: number;
  weight: number;
  reps: number;
  toFailure: boolean;
  smartDefaults: SmartDefaults | null;
  loading: boolean;
  error: string | null;
}

const QuickAdd: React.FC<QuickAddProps> = ({ isOpen, onClose, onSuccess, onToast }) => {
  const [state, setState] = useState<QuickAddState>({
    mode: 'exercise-picker',
    exercises: [],
    currentExercise: null,
    currentSetNumber: 1,
    weight: 0,
    reps: 0,
    toFailure: false,
    smartDefaults: null,
    loading: false,
    error: null,
  });

  // Fetch smart defaults when exercise selected
  useEffect(() => {
    if (state.currentExercise) {
      setState(prev => ({ ...prev, loading: true, error: null }));

      fetchSmartDefaults(state.currentExercise.name)
        .then(defaults => {
          setState(prev => ({
            ...prev,
            smartDefaults: defaults,
            weight: defaults.suggestedWeight || 0,
            reps: defaults.suggestedReps || 0,
            loading: false,
          }));
        })
        .catch(err => {
          console.error('Error fetching smart defaults:', err);
          setState(prev => ({
            ...prev,
            smartDefaults: null,
            weight: 0,
            reps: 10,
            loading: false,
            error: 'Could not load smart defaults',
          }));
        });
    }
  }, [state.currentExercise]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    // Check if any exercises have been logged
    if (state.exercises.length > 0) {
      const confirmDiscard = window.confirm(
        `Discard workout? You have ${state.exercises.length} exercise${state.exercises.length > 1 ? 's' : ''} logged.`
      );
      if (!confirmDiscard) {
        return; // Keep modal open
      }
    }

    // Reset state when closing
    setState({
      mode: 'exercise-picker',
      exercises: [],
      currentExercise: null,
      currentSetNumber: 1,
      weight: 0,
      reps: 0,
      toFailure: false,
      smartDefaults: null,
      loading: false,
      error: null,
    });
    onClose();
  };

  // Handler for exercise selection in picker
  const handleExerciseSelect = (exercise: Exercise) => {
    // Check if exercise already logged
    const alreadyLogged = state.exercises.some(e => e.exerciseId === exercise.id);
    if (alreadyLogged) {
      onToast(`${exercise.name} is already logged. Use "Another Set" to add more sets.`, 'info');
      return;
    }

    setState(prev => ({
      ...prev,
      mode: 'set-entry',
      currentExercise: exercise,
      currentSetNumber: 1,
      toFailure: false, // Reset to-failure for new exercise
    }));
  };

  // Handler for logging a set
  const handleLogSet = () => {
    if (!state.currentExercise) return;

    const newSet: LoggedSet = {
      setNumber: state.currentSetNumber,
      weight: state.weight,
      reps: state.reps,
      toFailure: state.toFailure,
    };

    setState(prev => {
      // Check if this exercise already exists in our exercises array
      const existingExerciseIndex = prev.exercises.findIndex(
        e => e.exerciseId === prev.currentExercise!.id
      );

      let updatedExercises: LoggedExercise[];
      if (existingExerciseIndex >= 0) {
        // Add set to existing exercise
        updatedExercises = prev.exercises.map((ex, idx) =>
          idx === existingExerciseIndex
            ? { ...ex, sets: [...ex.sets, newSet] }
            : ex
        );
      } else {
        // Create new logged exercise
        const newExercise: LoggedExercise = {
          exerciseId: prev.currentExercise!.id,
          exerciseName: prev.currentExercise!.name,
          sets: [newSet],
        };
        updatedExercises = [...prev.exercises, newExercise];
      }

      return {
        ...prev,
        exercises: updatedExercises,
        mode: 'summary',
        currentSetNumber: prev.currentSetNumber + 1,
      };
    });
  };

  // Handler for "Another Set" button
  const handleAnotherSet = () => {
    if (!state.currentExercise) return;

    // Apply 10% rep reduction for smart defaults
    const suggestedReps = Math.max(1, Math.floor(state.reps * 0.9));

    setState(prev => ({
      ...prev,
      mode: 'set-entry',
      reps: suggestedReps,
      // Keep weight and to-failure from last set
    }));
  };

  // Handler for "Add Exercise" button
  const handleAddExercise = () => {
    setState(prev => ({
      ...prev,
      mode: 'exercise-picker',
      currentExercise: null,
      currentSetNumber: 1,
      weight: 0,
      reps: 0,
      toFailure: false,
      smartDefaults: null,
    }));
  };

  // Handler for "Finish Workout" button
  const handleFinishWorkout = async () => {
    if (state.exercises.length === 0) {
      onToast('No exercises logged yet!', 'error');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Call new batch workout API endpoint
      const response = await quickAddAPI.quickWorkout({
        exercises: state.exercises.map(ex => ({
          exercise_name: ex.exerciseName,
          sets: ex.sets.map(s => ({
            weight: s.weight,
            reps: s.reps,
            to_failure: s.toFailure,
          })),
        })),
        timestamp: new Date().toISOString(),
      });

      // Success callback to parent (Dashboard) to refresh data
      onSuccess();

      // Show success message with PRs if any
      const prMessage = response.prs.length > 0
        ? ` 🎉 ${response.prs.length} PR${response.prs.length > 1 ? 's' : ''} detected!`
        : '';
      onToast(`✓ Workout saved! ${state.exercises.length} exercises logged.${prMessage}`, 'success');

      // Reset and close
      setState({
        mode: 'exercise-picker',
        exercises: [],
        currentExercise: null,
        currentSetNumber: 1,
        weight: 0,
        reps: 0,
        toFailure: false,
        smartDefaults: null,
        loading: false,
        error: null,
      });
      onClose();

    } catch (error) {
      console.error('Failed to save workout:', error);
      const errorMessage = 'Failed to save workout. Please try again.';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      onToast(errorMessage, 'error');
    }
  };

  // Handler for back button
  const handleBack = () => {
    if (state.mode === 'set-entry') {
      setState(prev => ({ ...prev, mode: 'summary' }));
    } else if (state.mode === 'summary') {
      setState(prev => ({ ...prev, mode: 'exercise-picker' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Only allow backdrop click to close if no exercises logged
        if (state.exercises.length === 0) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-brand-surface rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Quick Workout Logger</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* Exercise Picker Mode */}
        {state.mode === 'exercise-picker' && (
          <>
            {state.exercises.length > 0 && (
              <div className="mb-4 p-3 bg-brand-muted rounded-lg">
                <p className="text-sm text-slate-400">
                  {state.exercises.length} exercise{state.exercises.length > 1 ? 's' : ''} logged
                </p>
              </div>
            )}
            <ExercisePicker onSelect={handleExerciseSelect} />
          </>
        )}

        {/* Set Entry Mode */}
        {state.mode === 'set-entry' && state.currentExercise && (
          <QuickAddForm
            exercise={state.currentExercise}
            setNumber={state.currentSetNumber}
            weight={state.weight}
            reps={state.reps}
            toFailure={state.toFailure}
            smartDefaults={state.smartDefaults}
            loading={state.loading}
            error={state.error}
            onWeightChange={(weight) => setState(prev => ({ ...prev, weight }))}
            onRepsChange={(reps) => setState(prev => ({ ...prev, reps }))}
            onToFailureChange={(toFailure) => setState(prev => ({ ...prev, toFailure }))}
            onSubmit={handleLogSet}
            onBack={handleBack}
          />
        )}

        {/* Summary Mode */}
        {state.mode === 'summary' && (
          <div className="space-y-4">
            {/* Workout Summary */}
            <div className="space-y-3">
              {state.exercises.map((exercise) => (
                <div key={exercise.exerciseId} className="bg-brand-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{exercise.exerciseName}</h4>
                  <div className="space-y-1">
                    {exercise.sets.map((set) => (
                      <div key={set.setNumber} className="text-sm text-slate-300">
                        Set {set.setNumber}: {set.reps} reps @ {set.weight} lbs
                        {set.toFailure && ' 🔥'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {state.currentExercise && (
                <button
                  onClick={handleAnotherSet}
                  disabled={state.loading}
                  className="w-full bg-brand-muted text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  Another Set ({state.currentExercise.name})
                </button>
              )}
              <button
                onClick={handleAddExercise}
                disabled={state.loading}
                className="w-full bg-brand-muted text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                Add Exercise
              </button>
              <button
                onClick={handleFinishWorkout}
                disabled={state.loading}
                className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                {state.loading ? 'Saving...' : 'Finish Workout'}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default QuickAdd;

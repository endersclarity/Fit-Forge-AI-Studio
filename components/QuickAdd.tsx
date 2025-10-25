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
}

interface QuickAddState {
  selectedExercise: Exercise | null;
  weight: number;
  reps: number;
  toFailure: boolean;
  smartDefaults: SmartDefaults | null;
  loading: boolean;
  error: string | null;
}

const QuickAdd: React.FC<QuickAddProps> = ({ isOpen, onClose, onSuccess }) => {
  const [state, setState] = useState<QuickAddState>({
    selectedExercise: null,
    weight: 0,
    reps: 0,
    toFailure: false,
    smartDefaults: null,
    loading: false,
    error: null,
  });

  // Fetch smart defaults when exercise selected
  useEffect(() => {
    if (state.selectedExercise) {
      setState(prev => ({ ...prev, loading: true, error: null }));

      fetchSmartDefaults(state.selectedExercise.name)
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
  }, [state.selectedExercise]);

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
    // Reset state when closing
    setState({
      selectedExercise: null,
      weight: 0,
      reps: 0,
      toFailure: false,
      smartDefaults: null,
      loading: false,
      error: null,
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!state.selectedExercise) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await quickAddAPI.quickAdd({
        exercise_name: state.selectedExercise.name,
        weight: state.weight,
        reps: state.reps,
        to_failure: state.toFailure,
      });

      // Success callback to parent (Dashboard) to refresh data
      onSuccess();

      // Show success message (we'll implement toast later or use alert for now)
      const prMessage = response.pr_info
        ? ` 🎉 NEW PR: ${response.pr_info.newVolume} lbs (↑${response.pr_info.percentIncrease.toFixed(1)}%)`
        : '';

      alert(`✓ ${state.selectedExercise.name} logged!${prMessage}`);

      // Reset and close
      handleClose();

    } catch (error) {
      console.error('Failed to log exercise:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to log exercise. Please try again.',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-brand-surface rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Quick Add Exercise</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {!state.selectedExercise ? (
          <ExercisePicker
            onSelect={(exercise) => setState(prev => ({ ...prev, selectedExercise: exercise }))}
          />
        ) : (
          <QuickAddForm
            exercise={state.selectedExercise}
            weight={state.weight}
            reps={state.reps}
            toFailure={state.toFailure}
            smartDefaults={state.smartDefaults}
            loading={state.loading}
            error={state.error}
            onWeightChange={(weight) => setState(prev => ({ ...prev, weight }))}
            onRepsChange={(reps) => setState(prev => ({ ...prev, reps }))}
            onToFailureChange={(toFailure) => setState(prev => ({ ...prev, toFailure }))}
            onSubmit={handleSubmit}
            onBack={() => setState(prev => ({ ...prev, selectedExercise: null }))}
          />
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

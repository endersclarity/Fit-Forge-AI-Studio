import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../../contexts/WorkoutSessionContext';
import { workoutsAPI } from '../../api';

const WorkoutSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, resetSession } = useWorkoutSession();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveAndExit = async () => {
    if (session.exercises.length === 0) {
      resetSession();
      navigate('/');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Transform session to match existing WorkoutSession API format
      const now = Date.now();
      const startTime = session.startTime?.getTime() || now;
      const workoutData = {
        id: '', // Will be assigned by backend
        name: 'Custom Workout',
        type: 'Push' as const, // Default category
        variation: 'A' as const,
        startTime,
        endTime: now,
        loggedExercises: session.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets.map(s => ({
            weight: s.weight,
            reps: s.reps,
            to_failure: false,
          })),
        })),
        muscleFatigueHistory: {},
      };

      await workoutsAPI.create(workoutData);
      resetSession();
      navigate('/');
    } catch (err) {
      setError('Failed to save workout. Please try again.');
      setSaving(false);
    }
  };

  const handleAddMore = () => {
    navigate('/workout/select');
  };

  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Workout Summary
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {session.exercises.length} exercises • {totalSets} total sets
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {session.exercises.map((exercise, i) => (
            <div
              key={i}
              className="bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg p-4"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                {exercise.exerciseName}
              </h3>
              <div className="space-y-1">
                {exercise.sets.map((set, j) => (
                  <p key={j} className="text-slate-700 dark:text-slate-300">
                    Set {j + 1}: {set.weight} lbs × {set.reps} reps
                  </p>
                ))}
              </div>
            </div>
          ))}

          {session.exercises.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-500 rounded-lg p-4">
              <p className="text-yellow-700 dark:text-yellow-400">
                No exercises logged yet.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAddMore}
            className="w-full py-3 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors min-h-[48px]"
          >
            Add More Exercises
          </button>

          <button
            onClick={handleSaveAndExit}
            disabled={saving}
            className="w-full py-4 bg-brand-cyan text-brand-dark font-bold text-lg rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            {saving ? 'Saving...' : 'Save & Exit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSummaryPage;

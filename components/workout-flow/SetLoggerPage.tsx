import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../../contexts/WorkoutSessionContext';

const SetLoggerPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, logSet, clearCurrentExercise } = useWorkoutSession();
  const [weight, setWeight] = useState('135');
  const [reps, setReps] = useState('10');

  // Redirect if no exercise selected
  useEffect(() => {
    if (!session.currentExercise) {
      navigate('/workout/select');
    }
  }, [session.currentExercise, navigate]);

  if (!session.currentExercise) {
    return null;
  }

  const currentExerciseSets = session.exercises.find(
    e => e.exerciseId === session.currentExercise!.id
  )?.sets || [];

  const handleLogSet = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (!isNaN(w) && !isNaN(r) && w > 0 && r > 0) {
      logSet(w, r);
      // Keep weight, clear reps for next set
      setReps('');
    }
  };

  const handleDifferentExercise = () => {
    clearCurrentExercise();
    navigate('/workout/select');
  };

  const handleFinish = () => {
    // Don't clear current exercise here - it triggers useEffect redirect
    // Summary page will handle resetting state after save
    navigate('/workout/summary');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {session.currentExercise.name}
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Sets logged: {currentExerciseSets.length}
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">
              Weight (lbs)
            </label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="135"
              className="w-full px-4 py-4 text-4xl font-bold bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none text-center"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">
              Reps
            </label>
            <input
              type="number"
              value={reps}
              onChange={e => setReps(e.target.value)}
              placeholder="10"
              className="w-full px-4 py-4 text-4xl font-bold bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none text-center"
            />
          </div>

          <button
            onClick={handleLogSet}
            disabled={!weight || !reps}
            className="w-full py-4 bg-brand-cyan text-brand-dark font-bold text-xl rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            Log Set
          </button>

          {currentExerciseSets.length > 0 && (
            <div className="bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg p-4">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">
                Logged Sets
              </p>
              <div className="space-y-1">
                {currentExerciseSets.map((set, i) => (
                  <p key={i} className="text-slate-900 dark:text-slate-100">
                    Set {i + 1}: {set.weight} lbs × {set.reps} reps
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDifferentExercise}
              className="flex-1 py-3 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors min-h-[48px]"
            >
              Different Exercise
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors min-h-[48px]"
            >
              Finish Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetLoggerPage;

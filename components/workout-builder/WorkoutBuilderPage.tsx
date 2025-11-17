import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXERCISE_LIBRARY } from '../constants';
import { PlannedExercise } from '../types/savedWorkouts';
import { useSavedWorkouts } from '../hooks/useSavedWorkouts';
import { useWorkoutSession } from '../contexts/WorkoutSessionContext';

type TabType = 'all' | 'byMuscle' | 'categories';

const WorkoutBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveWorkout } = useSavedWorkouts();
  const { startSession, selectExercise } = useWorkoutSession();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedExercises, setSelectedExercises] = useState<PlannedExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-brand-muted">
        <button
          onClick={() => navigate('/')}
          className="text-brand-primary dark:text-brand-accent font-medium"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
          Workout Builder
        </h1>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Exercise Library */}
        <div className="w-2/5 border-r border-slate-200 dark:border-brand-muted flex flex-col">
          <div className="p-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Exercise Library
          </div>
          {/* Search and tabs will go here */}
          <div className="p-4">
            <p className="text-slate-500 dark:text-slate-400">Exercise list placeholder</p>
          </div>
        </div>

        {/* Right Panel - Your Workout */}
        <div className="w-3/5 flex flex-col">
          <div className="p-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Your Workout ({selectedExercises.length} exercises)
          </div>
          <div className="flex-1 p-4">
            {selectedExercises.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">
                No exercises selected. Add from the library.
              </p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Selected exercises placeholder</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-brand-muted bg-white dark:bg-brand-surface flex items-center gap-4">
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Workout name..."
          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
        />
        <button
          onClick={() => {/* Save logic */}}
          className="px-6 py-2 rounded-lg border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
        >
          Save Template
        </button>
        <button
          onClick={() => {/* Start logic */}}
          className="px-6 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
        >
          Start Workout
        </button>
      </div>
    </div>
  );
};

export default WorkoutBuilderPage;

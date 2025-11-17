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

  // Filter exercises based on search and tab
  const getFilteredExercises = () => {
    let exercises = EXERCISE_LIBRARY.filter(ex =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeTab === 'byMuscle') {
      // Group by primary muscle
      const grouped: Record<string, typeof exercises> = {};
      exercises.forEach(ex => {
        const primaryMuscle = ex.muscleEngagements[0]?.muscle || 'Other';
        if (!grouped[primaryMuscle]) grouped[primaryMuscle] = [];
        grouped[primaryMuscle].push(ex);
      });
      return { type: 'grouped' as const, data: grouped };
    }

    if (activeTab === 'categories') {
      // Group by equipment/category
      const grouped: Record<string, typeof exercises> = {};
      exercises.forEach(ex => {
        const category = ex.category;
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(ex);
      });
      return { type: 'grouped' as const, data: grouped };
    }

    return { type: 'flat' as const, data: exercises };
  };

  const handleAddExercise = (exerciseId: string, exerciseName: string) => {
    setSelectedExercises(prev => [
      ...prev,
      {
        exerciseId,
        exerciseName,
        targetSets: 3,
        targetReps: 10,
        targetWeight: undefined,
      },
    ]);
  };

  const handleUpdateExercise = (index: number, field: keyof PlannedExercise, value: number | undefined) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const filteredExercises = getFilteredExercises();

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
          {/* Search */}
          <div className="px-4 pb-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exercises..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Tabs */}
          <div className="px-4 pb-2 flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === 'all'
                  ? 'bg-brand-primary text-white'
                  : 'bg-slate-200 dark:bg-brand-muted text-slate-700 dark:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('byMuscle')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === 'byMuscle'
                  ? 'bg-brand-primary text-white'
                  : 'bg-slate-200 dark:bg-brand-muted text-slate-700 dark:text-slate-300'
              }`}
            >
              By Muscle
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === 'categories'
                  ? 'bg-brand-primary text-white'
                  : 'bg-slate-200 dark:bg-brand-muted text-slate-700 dark:text-slate-300'
              }`}
            >
              Categories
            </button>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto px-4">
            {filteredExercises.type === 'flat' ? (
              <div className="space-y-1">
                {filteredExercises.data.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExercise(ex.id, ex.name)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-muted text-slate-900 dark:text-slate-100 flex items-center justify-between group"
                  >
                    <span>{ex.name}</span>
                    <span className="text-brand-primary opacity-0 group-hover:opacity-100">+</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(filteredExercises.data).map(([group, exercises]) => (
                  <div key={group}>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      {group}
                    </h3>
                    <div className="space-y-1">
                      {exercises.map(ex => (
                        <button
                          key={ex.id}
                          onClick={() => handleAddExercise(ex.id, ex.name)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-muted text-slate-900 dark:text-slate-100 flex items-center justify-between group"
                        >
                          <span>{ex.name}</span>
                          <span className="text-brand-primary opacity-0 group-hover:opacity-100">+</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <div className="space-y-3">
                {selectedExercises.map((ex, index) => (
                  <div
                    key={`${ex.exerciseId}-${index}`}
                    className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-muted rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 cursor-grab">≡</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {ex.exerciseName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400">Sets</label>
                        <input
                          type="number"
                          value={ex.targetSets || ''}
                          onChange={(e) => handleUpdateExercise(index, 'targetSets', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400">Reps</label>
                        <input
                          type="number"
                          value={ex.targetReps || ''}
                          onChange={(e) => handleUpdateExercise(index, 'targetReps', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400">Weight</label>
                        <input
                          type="number"
                          value={ex.targetWeight || ''}
                          onChange={(e) => handleUpdateExercise(index, 'targetWeight', e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="lb"
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

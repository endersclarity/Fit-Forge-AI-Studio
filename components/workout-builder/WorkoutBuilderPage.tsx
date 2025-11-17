import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXERCISE_LIBRARY } from '../../constants';
import { PlannedExercise } from '../../types/savedWorkouts';
import { useSavedWorkouts } from '../../hooks/useSavedWorkouts';
import { useWorkoutSession } from '../../contexts/WorkoutSessionContext';

type CategoryType = 'Push' | 'Pull' | 'Legs' | 'Core' | null;
const EXERCISES_PER_PAGE = 5;

const WorkoutBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveWorkout } = useSavedWorkouts();
  const { startSession, selectExercise } = useWorkoutSession();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedExercises, setSelectedExercises] = useState<PlannedExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Get exercises filtered by category and search
  const getExercisesByCategory = (category: CategoryType) => {
    if (!category) return [];

    let exercises = EXERCISE_LIBRARY.filter(ex => ex.category === category);

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      exercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return exercises;
  };

  // Get paginated exercises for selected category
  const getPaginatedExercises = () => {
    const allExercises = getExercisesByCategory(selectedCategory);
    const startIndex = currentPage * EXERCISES_PER_PAGE;
    const endIndex = startIndex + EXERCISES_PER_PAGE;
    return {
      exercises: allExercises.slice(startIndex, endIndex),
      totalCount: allExercises.length,
      totalPages: Math.ceil(allExercises.length / EXERCISES_PER_PAGE),
      hasMore: endIndex < allExercises.length,
    };
  };

  // Global search across all categories
  const getGlobalSearchResults = () => {
    if (!searchTerm.trim()) return [];
    return EXERCISE_LIBRARY.filter(ex =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    setCurrentPage(0); // Reset to first page when changing category
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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

  const handleSaveTemplate = () => {
    if (!workoutName.trim()) {
      setSaveMessage('Please enter a workout name');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    if (selectedExercises.length === 0) {
      setSaveMessage('Please add at least one exercise');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    saveWorkout({
      name: workoutName.trim(),
      exercises: selectedExercises,
    });

    setSaveMessage('Workout saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleStartWorkout = () => {
    if (selectedExercises.length === 0) {
      setSaveMessage('Please add at least one exercise');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Start session and pre-populate with first exercise
    startSession();

    // Select the first exercise to start logging
    const firstEx = selectedExercises[0];
    selectExercise(firstEx.exerciseId, firstEx.exerciseName);

    // Navigate to logger
    navigate('/workout/log');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-brand-muted">
        <button
          onClick={() => navigate('/')}
          className="text-brand-primary dark:text-brand-accent font-medium mb-4 hover:underline"
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0); // Reset pagination on search
              }}
              placeholder="Search exercises..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Category Grid */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {(['Push', 'Pull', 'Legs', 'Core'] as CategoryType[]).map(category => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-slate-200 dark:bg-brand-muted text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-brand-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto px-4">
            {searchTerm.trim() ? (
              // Global search results
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Search results ({getGlobalSearchResults().length})
                </div>
                <div className="space-y-1">
                  {getGlobalSearchResults().slice(0, 20).map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => handleAddExercise(ex.id, ex.name)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-muted text-slate-900 dark:text-slate-100 flex items-center justify-between group"
                    >
                      <div>
                        <span>{ex.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                          ({ex.category})
                        </span>
                      </div>
                      <span className="text-brand-primary opacity-0 group-hover:opacity-100">+</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : selectedCategory ? (
              // Category exercises with pagination
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {selectedCategory} exercises ({getPaginatedExercises().totalCount})
                </div>
                <div className="space-y-1">
                  {getPaginatedExercises().exercises.map(ex => (
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
                {/* Pagination Controls */}
                {getPaginatedExercises().totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4 pb-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-3 py-1 rounded text-sm bg-slate-200 dark:bg-brand-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Page {currentPage + 1} of {getPaginatedExercises().totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!getPaginatedExercises().hasMore}
                      className="px-3 py-1 rounded text-sm bg-slate-200 dark:bg-brand-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // No category selected
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p className="text-sm">Select a category to browse exercises</p>
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
          onClick={handleSaveTemplate}
          className="px-6 py-2 rounded-lg border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
        >
          Save Template
        </button>
        <button
          onClick={handleStartWorkout}
          className="px-6 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
        >
          Start Workout
        </button>
      </div>

      {/* Save Message Toast */}
      {saveMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg">
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilderPage;

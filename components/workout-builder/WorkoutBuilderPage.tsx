import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EXERCISE_LIBRARY } from '../../constants';
import { PlannedExercise, PlannedSet } from '../../types/savedWorkouts';
import { WorkoutTemplate, UserProfile } from '../../types';
import { templatesAPI } from '../../api';

type CategoryType = 'Push' | 'Pull' | 'Legs' | 'Core' | null;
const EXERCISES_PER_PAGE = 5;
const WEIGHT_OPTIONS: (number | 'bodyweight')[] = [
  'bodyweight',
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
  55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
  110, 120, 130, 140, 150, 175, 200, 225, 250
];

interface WorkoutBuilderPageProps {
  profile: UserProfile;
}

const WorkoutBuilderPage: React.FC<WorkoutBuilderPageProps> = ({ profile }) => {
  const navigate = useNavigate();
  const location = useLocation(); // DEBUG: Testing HMR

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedExercises, setSelectedExercises] = useState<PlannedExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Pre-populate from template if navigated from Edit
  useEffect(() => {
    console.log('WorkoutBuilder useEffect - location.state:', location.state);
    const template = location.state?.template as WorkoutTemplate | undefined;
    console.log('WorkoutBuilder useEffect - template:', template);
    if (template) {
      // Pre-populate from template
      setWorkoutName(template.name);

      const exercises: PlannedExercise[] = template.exerciseIds.map(id => {
        const exercise = EXERCISE_LIBRARY.find(ex => ex.id === id);
        if (!exercise) throw new Error(`Exercise ${id} not found`);

        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: [
            {
              weight: 'bodyweight',
              reps: 10,
              restSeconds: 90,
            },
          ],
        };
      });

      setSelectedExercises(exercises);
    }
  }, [location.state]);

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
        sets: [
          {
            weight: 'bodyweight',
            reps: 10,
            restSeconds: 90,
          },
        ],
      },
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSet = (exerciseIndex: number) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      const exercise = { ...updated[exerciseIndex] };
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets = [
        ...exercise.sets,
        {
          weight: lastSet.weight,
          reps: lastSet.reps,
          restSeconds: lastSet.restSeconds,
        },
      ];
      updated[exerciseIndex] = exercise;
      return updated;
    });
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof PlannedSet,
    value: number | 'bodyweight'
  ) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      const exercise = updated[exerciseIndex];
      exercise.sets[setIndex] = {
        ...exercise.sets[setIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      const exercise = { ...updated[exerciseIndex] };
      if (exercise.sets.length > 1) {
        exercise.sets = exercise.sets.filter((_, i) => i !== setIndex);
        updated[exerciseIndex] = exercise;
      }
      return updated;
    });
  };

  const handleRestChange = (exerciseIndex: number, setIndex: number, delta: number) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      const exercise = { ...updated[exerciseIndex] };
      const currentRest = exercise.sets[setIndex].restSeconds;
      const newRest = Math.max(0, currentRest + delta);
      exercise.sets = exercise.sets.map((set, i) =>
        i === setIndex ? { ...set, restSeconds: newRest } : set
      );
      updated[exerciseIndex] = exercise;
      return updated;
    });
  };

  const handleSaveTemplate = async () => {
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

    try {
      // Extract category from first exercise
      const firstExercise = EXERCISE_LIBRARY.find(ex => ex.id === selectedExercises[0].exerciseId);
      const category = firstExercise?.category || 'Push';

      // Extract exercise IDs
      const exerciseIds = selectedExercises.map(ex => ex.exerciseId);

      // Create template
      await templatesAPI.create({
        name: workoutName.trim(),
        category,
        variation: 'A',
        exerciseIds,
        isFavorite: false,
      });

      setSaveMessage('Workout saved!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save workout template:', error);
      setSaveMessage('Failed to save workout');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleStartWorkout = () => {
    if (selectedExercises.length === 0) {
      setSaveMessage('Please add at least one exercise');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Extract current bodyweight from profile
    const currentBodyweight = profile?.bodyweightHistory
      ?.sort((a, b) => b.date - a.date)[0]?.weight || 0;

    // Navigate to active workout page with planned exercises and bodyweight
    navigate('/workout/active', {
      state: {
        exercises: selectedExercises,
        currentBodyweight: currentBodyweight
      }
    });
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
              <div className="space-y-3 overflow-y-auto">
                {selectedExercises.map((ex, exerciseIndex) => (
                  <div
                    key={`${ex.exerciseId}-${exerciseIndex}`}
                    className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-muted rounded-lg p-3"
                  >
                    {/* Exercise Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 cursor-grab">≡</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {ex.exerciseName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(exerciseIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>

                    {/* Sets */}
                    <div className="space-y-2">
                      {ex.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-brand-dark p-2 rounded"
                        >
                          <span className="text-slate-500 dark:text-slate-400 w-12">
                            Set {setIndex + 1}
                          </span>

                          {/* Weight Dropdown */}
                          <select
                            value={set.weight}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateSet(
                                exerciseIndex,
                                setIndex,
                                'weight',
                                val === 'bodyweight' ? 'bodyweight' : parseInt(val)
                              );
                            }}
                            className="px-2 py-1 rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100 text-xs"
                          >
                            {WEIGHT_OPTIONS.map(w => (
                              <option key={w} value={w}>
                                {w === 'bodyweight' ? 'BW' : `${w} lbs`}
                              </option>
                            ))}
                          </select>

                          <span className="text-slate-500">×</span>

                          {/* Reps Input */}
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              handleUpdateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)
                            }
                            min={1}
                            className="w-14 px-2 py-1 rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100 text-xs text-center"
                          />
                          <span className="text-slate-500 text-xs">reps</span>

                          {/* Rest Timer */}
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleRestChange(exerciseIndex, setIndex, -15)}
                              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                              title="-15s"
                            >
                              -
                            </button>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              🕐 {set.restSeconds}s
                            </span>
                            <button
                              onClick={() => handleRestChange(exerciseIndex, setIndex, 15)}
                              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                              title="+15s"
                            >
                              +
                            </button>
                          </div>

                          {/* Delete Set Button */}
                          {ex.sets.length > 1 && (
                            <button
                              onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                              className="ml-auto text-red-400 hover:text-red-600 text-xs"
                              title="Delete set"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Set Button */}
                    <button
                      onClick={() => handleAddSet(exerciseIndex)}
                      className="mt-2 w-full py-1 text-sm text-brand-primary hover:text-brand-primary/80 border border-dashed border-brand-primary/50 rounded"
                    >
                      + Add Set
                    </button>
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

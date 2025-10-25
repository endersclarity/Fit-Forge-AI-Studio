import React, { useState, useMemo } from 'react';
import { EXERCISE_LIBRARY } from '../constants';
import { Exercise, ExerciseCategory } from '../types';

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
}

const CATEGORIES: ExerciseCategory[] = ['Push', 'Pull', 'Legs', 'Core'];

const ExercisePicker: React.FC<ExercisePickerProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'All'>('All');

  // Get recent exercises from localStorage
  const recentExercises = useMemo(() => {
    try {
      const recent = localStorage.getItem('recentExercises');
      if (!recent) return [];

      const recentIds: string[] = JSON.parse(recent);
      return recentIds
        .map(id => EXERCISE_LIBRARY.find(ex => ex.id === id))
        .filter((ex): ex is Exercise => ex !== undefined)
        .slice(0, 5);
    } catch (error) {
      console.error('Error loading recent exercises:', error);
      return [];
    }
  }, []);

  // Filter exercises based on search and category
  const filteredExercises = useMemo(() => {
    let exercises = EXERCISE_LIBRARY;

    // Filter by category
    if (selectedCategory !== 'All') {
      exercises = exercises.filter(ex => ex.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      exercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        ex.category.toLowerCase().includes(query) ||
        (Array.isArray(ex.equipment)
          ? ex.equipment.some(eq => eq.toLowerCase().includes(query))
          : ex.equipment.toLowerCase().includes(query))
      );
    }

    return exercises;
  }, [searchQuery, selectedCategory]);

  // Group filtered exercises by category
  const groupedExercises = useMemo(() => {
    const groups: Record<ExerciseCategory, Exercise[]> = {
      Push: [],
      Pull: [],
      Legs: [],
      Core: [],
    };

    filteredExercises.forEach(exercise => {
      groups[exercise.category].push(exercise);
    });

    return groups;
  }, [filteredExercises]);

  const handleExerciseSelect = (exercise: Exercise) => {
    // Save to recent exercises
    try {
      const recent = localStorage.getItem('recentExercises');
      let recentIds: string[] = recent ? JSON.parse(recent) : [];

      // Add to front, remove duplicates, limit to 10
      recentIds = [exercise.id, ...recentIds.filter(id => id !== exercise.id)].slice(0, 10);

      localStorage.setItem('recentExercises', JSON.stringify(recentIds));
    } catch (error) {
      console.error('Error saving recent exercise:', error);
    }

    onSelect(exercise);
  };

  const renderExerciseCard = (exercise: Exercise) => {
    const equipmentText = Array.isArray(exercise.equipment)
      ? exercise.equipment.join(', ')
      : exercise.equipment;

    return (
      <button
        key={exercise.id}
        onClick={() => handleExerciseSelect(exercise)}
        className="w-full text-left p-3 bg-brand-muted rounded hover:bg-brand-dark transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{exercise.name}</p>
            <p className="text-xs text-slate-400 mt-1">{equipmentText}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            exercise.difficulty === 'Beginner' ? 'bg-green-600' :
            exercise.difficulty === 'Intermediate' ? 'bg-yellow-600' :
            'bg-red-600'
          }`}>
            {exercise.difficulty}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-brand-muted rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'All'
              ? 'bg-brand-cyan text-brand-dark'
              : 'bg-brand-muted text-slate-300 hover:bg-brand-dark'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-brand-cyan text-brand-dark'
                : 'bg-brand-muted text-slate-300 hover:bg-brand-dark'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Recent Exercises */}
      {!searchQuery && selectedCategory === 'All' && recentExercises.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-400 mb-2">RECENT</h4>
          <div className="space-y-2">
            {recentExercises.map(exercise => renderExerciseCard(exercise))}
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {selectedCategory === 'All' ? (
          // Show all categories with headers
          CATEGORIES.map(category => {
            const exercises = groupedExercises[category];
            if (exercises.length === 0) return null;

            return (
              <div key={category}>
                <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="space-y-2">
                  {exercises.map(exercise => renderExerciseCard(exercise))}
                </div>
              </div>
            );
          })
        ) : (
          // Show selected category only
          <div className="space-y-2">
            {groupedExercises[selectedCategory].map(exercise => renderExerciseCard(exercise))}
          </div>
        )}

        {filteredExercises.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>No exercises found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExercisePicker;

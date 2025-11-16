import React, { useState, useMemo, useEffect } from 'react';
import { EXERCISE_LIBRARY } from '../constants';
import { Exercise, ExerciseCategory, CalibrationMap, ExerciseCalibrationData, Equipment } from '../types';
import { getUserCalibrations, getExerciseCalibrations } from '../api';
import { EngagementViewer } from './EngagementViewer';
import { CalibrationEditor } from './CalibrationEditor';
import { CalibrationBadge } from './CalibrationBadge';

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  availableEquipment?: Equipment[];
}

const CATEGORIES: ExerciseCategory[] = ['Push', 'Pull', 'Legs', 'Core'];

const ExercisePicker: React.FC<ExercisePickerProps> = ({
  onSelect,
  availableEquipment = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'All'>('All');
  const [showAllEquipment, setShowAllEquipment] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem('fitforge.showAllEquipment');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const normalizedEquipment = useMemo(
    () => availableEquipment.filter((item): item is Equipment => Boolean(item)),
    [availableEquipment]
  );

  const toggleShowAllEquipment = () => {
    setShowAllEquipment(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('fitforge.showAllEquipment', JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  };

  // Calibration state
  const [calibrations, setCalibrations] = useState<CalibrationMap>({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [selectedExerciseData, setSelectedExerciseData] = useState<ExerciseCalibrationData | null>(null);

  // Fetch calibrations on mount
  useEffect(() => {
    getUserCalibrations()
      .then(setCalibrations)
      .catch(err => console.error('Failed to load calibrations:', err));
  }, []);

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

    if (!showAllEquipment && normalizedEquipment.length > 0) {
      exercises = exercises.filter(ex => {
        const equipmentList = Array.isArray(ex.equipment) ? ex.equipment : [ex.equipment];
        if (equipmentList.includes('Bodyweight')) return true;
        return equipmentList.some(eq => normalizedEquipment.includes(eq as Equipment));
      });
    }

    return exercises;
  }, [searchQuery, selectedCategory, showAllEquipment, normalizedEquipment]);

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

  const handleViewEngagement = async (e: React.MouseEvent, exerciseId: string) => {
    e.stopPropagation();
    setSelectedExerciseId(exerciseId);
    try {
      const data = await getExerciseCalibrations(exerciseId);
      setSelectedExerciseData(data);
      setViewerOpen(true);
    } catch (error) {
      console.error('Failed to load exercise calibrations:', error);
    }
  };

  const handleEditCalibration = () => {
    setViewerOpen(false);
    setEditorOpen(true);
  };

  const handleCalibrationSaved = () => {
    // Refresh calibrations
    getUserCalibrations()
      .then(setCalibrations)
      .catch(err => console.error('Failed to reload calibrations:', err));
  };

  const renderExerciseCard = (exercise: Exercise) => {
    const equipmentText = Array.isArray(exercise.equipment)
      ? exercise.equipment.join(', ')
      : exercise.equipment;
    const isCalibrated = !!calibrations[exercise.id];

    return (
      <div
        key={exercise.id}
        className="w-full p-3 bg-brand-muted rounded hover:bg-brand-dark transition-colors"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1" onClick={() => handleExerciseSelect(exercise)} style={{ cursor: 'pointer' }}>
            <div className="flex items-center gap-2">
              <p className="font-medium">{exercise.name}</p>
              <CalibrationBadge show={isCalibrated} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{equipmentText}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${
              exercise.difficulty === 'Beginner' ? 'bg-green-600' :
              exercise.difficulty === 'Intermediate' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {exercise.difficulty}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => handleViewEngagement(e, exercise.id)}
          className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">analytics</span>
          View Engagement
        </button>
      </div>
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

      {normalizedEquipment.length > 0 && (
        <div className="rounded-lg border border-brand-muted/40 bg-brand-dark/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Available equipment
              </p>
              {!showAllEquipment ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {normalizedEquipment.map(eq => (
                    <span
                      key={eq}
                      className="rounded-full bg-brand-cyan/20 px-2 py-0.5 text-xs font-semibold text-brand-cyan"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-400">Showing all exercises</p>
              )}
            </div>
            <button
              onClick={toggleShowAllEquipment}
              className="min-w-[96px] rounded-lg bg-brand-muted px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:bg-brand-dark transition-colors"
            >
              {showAllEquipment ? 'Use filter' : 'Show all'}
            </button>
          </div>
          {!showAllEquipment && (
            <div className="mt-2 inline-flex items-center rounded-full bg-brand-cyan/15 px-3 py-1 text-xs font-semibold text-brand-cyan">
              {normalizedEquipment.length} active
            </div>
          )}
        </div>
      )}

      {normalizedEquipment.length > 0 && (
        <div className="rounded-lg border border-brand-muted/40 bg-brand-dark/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Available equipment
              </p>
              {!showAllEquipment ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {normalizedEquipment.map(eq => (
                    <span
                      key={eq}
                      className="rounded-full bg-brand-cyan/20 px-2 py-0.5 text-xs font-semibold text-brand-cyan"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-400">Showing all exercises</p>
              )}
            </div>
            <button
              onClick={toggleShowAllEquipment}
              className="min-w-[96px] rounded-lg bg-brand-muted px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:bg-brand-dark transition-colors"
            >
              {showAllEquipment ? 'Use filter' : 'Show all'}
            </button>
          </div>
          {!showAllEquipment && (
            <div className="mt-2 inline-flex items-center rounded-full bg-brand-cyan/15 px-3 py-1 text-xs font-semibold text-brand-cyan">
              {normalizedEquipment.length} active
            </div>
          )}
        </div>
      )}

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

      {/* Engagement Viewer Modal */}
      <EngagementViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        exerciseId={selectedExerciseId}
        onEdit={handleEditCalibration}
      />

      {/* Calibration Editor Modal */}
      {selectedExerciseData && (
        <CalibrationEditor
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          initialData={selectedExerciseData}
          onSave={handleCalibrationSaved}
        />
      )}
    </div>
  );
};

export default ExercisePicker;

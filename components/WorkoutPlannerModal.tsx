import React, { useState, useEffect, useMemo, useRef } from 'react';
import { EXERCISE_LIBRARY, ALL_MUSCLES } from '../constants';
import {
  PlannedExercise,
  ForecastedMuscleState,
  MuscleStatesResponse,
  MuscleBaselinesResponse,
  Exercise,
  Muscle,
  ExerciseCategory,
  Equipment,
  Variation
} from '../types';
import { calculateForecastedFatigue } from '../utils/workoutPlanner';
import PlannedExerciseList from './PlannedExerciseList';
import { MuscleVisualizationContainer } from './MuscleVisualization/MuscleVisualizationContainer';
import { XIcon, PlusIcon } from './Icons';
import { Sheet, Card, Button } from '../src/design-system/components/primitives';

interface WorkoutPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout: (plannedExercises: PlannedExercise[]) => void;
}

const ExerciseSelector: React.FC<{
  onSelect: (exercise: Exercise) => void;
  onDone: () => void;
  workoutVariation: Variation;
}> = ({ onSelect, onDone, workoutVariation }) => {
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | 'All'>('All');
  const [equipmentFilter, setEquipmentFilter] = useState<Equipment | 'All'>('All');
  const [muscleFilter, setMuscleFilter] = useState<Muscle | 'All'>('All');

  const filteredExercises = useMemo(() => {
    let filtered = EXERCISE_LIBRARY;

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(ex => ex.category === categoryFilter);
    }

    if (equipmentFilter !== 'All') {
      filtered = filtered.filter(ex => {
        if (Array.isArray(ex.equipment)) {
          return ex.equipment.includes(equipmentFilter);
        }
        return ex.equipment === equipmentFilter;
      });
    }

    if (muscleFilter !== 'All') {
      filtered = filtered.filter(ex =>
        ex.muscleEngagements.some(eng => eng.muscle === muscleFilter)
      );
    }

    filtered = filtered.filter(ex => ex.variation === 'Both' || ex.variation === workoutVariation);

    return filtered;
  }, [categoryFilter, equipmentFilter, muscleFilter, workoutVariation]);

  const equipmentOptions: (Equipment | 'All')[] = [
    'All', 'Bodyweight', 'Dumbbells', 'Kettlebell', 'Pull-up Bar', 'TRX', 'Dip Station', 'Bench'
  ];

  return (
    <div className="fixed inset-0 bg-brand-dark z-50 p-4 flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-brand-text">Add Exercise</h2>
        <button
          onClick={onDone}
          className="px-4 py-2 bg-brand-accent text-brand-dark font-medium rounded-lg hover:bg-brand-accent/90 transition-colors"
        >
          Done
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-brand-muted mb-2">CATEGORY</label>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {(['All', 'Push', 'Pull', 'Legs', 'Core'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-brand-accent text-brand-dark font-medium'
                    : 'bg-brand-surface text-brand-text hover:bg-brand-surface/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Filter */}
        <div>
          <label className="block text-xs font-semibold text-brand-muted mb-2">EQUIPMENT</label>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {equipmentOptions.map(eq => (
              <button
                key={eq}
                onClick={() => setEquipmentFilter(eq)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  equipmentFilter === eq
                    ? 'bg-brand-accent text-brand-dark font-medium'
                    : 'bg-brand-surface text-brand-text hover:bg-brand-surface/80'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* Muscle Filter */}
        <div>
          <label className="block text-xs font-semibold text-brand-muted mb-2">MUSCLE</label>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setMuscleFilter('All')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                muscleFilter === 'All'
                  ? 'bg-brand-accent text-brand-dark font-medium'
                  : 'bg-brand-surface text-brand-text hover:bg-brand-surface/80'
              }`}
            >
              All
            </button>
            {ALL_MUSCLES.map(muscle => (
              <button
                key={muscle}
                onClick={() => setMuscleFilter(muscle)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  muscleFilter === muscle
                    ? 'bg-brand-accent text-brand-dark font-medium'
                    : 'bg-brand-surface text-brand-text hover:bg-brand-surface/80'
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 space-y-2">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-brand-muted">
            No exercises found with selected filters
          </div>
        ) : (
          filteredExercises.map(exercise => (
            <button
              key={exercise.id}
              onClick={() => {
                onSelect(exercise);
                onDone();
              }}
              className="w-full text-left p-4 bg-brand-surface rounded-lg border border-brand-muted hover:border-brand-accent/30 hover:bg-brand-surface/80 transition-colors"
            >
              <h3 className="font-medium text-brand-text mb-1">{exercise.name}</h3>
              <div className="flex flex-wrap gap-2 text-xs text-brand-muted">
                <span>{exercise.category}</span>
                <span>•</span>
                <span>{exercise.difficulty}</span>
                <span>•</span>
                <span>
                  {Array.isArray(exercise.equipment)
                    ? exercise.equipment.join(', ')
                    : exercise.equipment}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

const WorkoutPlannerModal: React.FC<WorkoutPlannerModalProps> = ({
  isOpen,
  onClose,
  onStartWorkout
}) => {
  const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>([]);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [muscleBaselines, setMuscleBaselines] = useState<MuscleBaselinesResponse | null>(null);
  const [currentMuscleStates, setCurrentMuscleStates] = useState<MuscleStatesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutVariation, setWorkoutVariation] = useState<Variation>('A');

  // Auto-save / restore dialog state
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);

  // Refs for auto-save (to avoid interval recreation)
  const plannedExercisesRef = useRef(plannedExercises);
  const workoutVariationRef = useRef(workoutVariation);

  // Update refs when state changes
  useEffect(() => {
    plannedExercisesRef.current = plannedExercises;
    workoutVariationRef.current = workoutVariation;
  }, [plannedExercises, workoutVariation]);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (plannedExercisesRef.current.length > 0) {
        localStorage.setItem('workoutPlanner_draft', JSON.stringify({
          plannedExercises: plannedExercisesRef.current,
          workoutVariation: workoutVariationRef.current,
          timestamp: Date.now()
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Restore draft on mount
  useEffect(() => {
    if (!isOpen) return;

    const draft = localStorage.getItem('workoutPlanner_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const dayAgo = Date.now() - (24 * 60 * 60 * 1000);

        if (parsed.timestamp > dayAgo) {
          // Show confirmation dialog
          setShowRestoreDialog(true);
          setPendingDraft(parsed);
        } else {
          // Clear old draft
          localStorage.removeItem('workoutPlanner_draft');
        }
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
  }, [isOpen]);

  // Fetch muscle baselines and current states on mount
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [baselinesRes, statesRes] = await Promise.all([
          fetch('/api/muscle-baselines'),
          fetch('/api/muscle-states')
        ]);

        if (baselinesRes.ok) {
          const baselines = await baselinesRes.json();
          setMuscleBaselines(baselines);
        }

        if (statesRes.ok) {
          const states = await statesRes.json();
          setCurrentMuscleStates(states);
        }
      } catch (error) {
        console.error('Error fetching muscle data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Calculate forecasted states
  const forecastedStates = useMemo<Record<Muscle, ForecastedMuscleState> | null>(() => {
    if (!muscleBaselines) return null;

    // Extract current fatigue from muscle states
    const currentFatigue: Partial<Record<Muscle, number>> = {};
    if (currentMuscleStates) {
      ALL_MUSCLES.forEach(muscle => {
        const state = currentMuscleStates[muscle];
        if (state) {
          currentFatigue[muscle] = state.currentFatiguePercent;
        }
      });
    }

    return calculateForecastedFatigue(plannedExercises, muscleBaselines, currentFatigue);
  }, [plannedExercises, muscleBaselines, currentMuscleStates]);

  // Transform forecasted states to MuscleStatesResponse format for visualization
  const forecastedMuscleStates = useMemo<MuscleStatesResponse | null>(() => {
    if (!forecastedStates) return null;

    const transformed: MuscleStatesResponse = {} as MuscleStatesResponse;
    ALL_MUSCLES.forEach(muscle => {
      const state = forecastedStates[muscle];
      transformed[muscle] = {
        currentFatiguePercent: state.forecastedFatiguePercent,
        initialFatiguePercent: state.forecastedFatiguePercent,
        lastTrained: new Date().toISOString(),
        daysElapsed: 0,
        estimatedRecoveryDays: 0,
        daysUntilRecovered: 0,
        recoveryStatus: 'fatigued' as const
      };
    });
    return transformed;
  }, [forecastedStates]);

  const handleAddExercise = (exercise: Exercise) => {
    const newPlanned: PlannedExercise = {
      exercise,
      sets: 3,
      reps: 10,
      weight: 50
    };
    setPlannedExercises(prev => [...prev, newPlanned]);
  };

  const handleUpdateExercise = (index: number, updated: PlannedExercise) => {
    setPlannedExercises(prev => {
      const newList = [...prev];
      newList[index] = updated;
      return newList;
    });
  };

  const handleRemoveExercise = (index: number) => {
    setPlannedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartWorkout = () => {
    onStartWorkout(plannedExercises);
    setPlannedExercises([]);
    // Clear draft after starting workout
    localStorage.removeItem('workoutPlanner_draft');
    onClose();
  };

  const handleRestoreDraft = () => {
    if (pendingDraft) {
      setPlannedExercises(pendingDraft.plannedExercises);
      setWorkoutVariation(pendingDraft.workoutVariation || 'A');
    }
    setShowRestoreDialog(false);
    setPendingDraft(null);
  };

  const handleStartFresh = () => {
    localStorage.removeItem('workoutPlanner_draft');
    setPendingDraft(null);
    setShowRestoreDialog(false);
  };

  const handleClose = () => {
    if (plannedExercises.length > 0) {
      const confirmed = window.confirm(
        'You have unsaved exercises. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    setPlannedExercises([]);
    onClose();
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isExerciseSelectorOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isExerciseSelectorOpen, plannedExercises]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (isExerciseSelectorOpen) {
    return (
      <ExerciseSelector
        onSelect={handleAddExercise}
        onDone={() => setIsExerciseSelectorOpen(false)}
        workoutVariation={workoutVariation}
      />
    );
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => { if (!open) handleClose(); }}
      height="lg"
      title="Plan Workout"
      description="Design your workout with AI-powered muscle forecasting"
    >
      <div className="space-y-6">

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12 text-brand-muted">Loading muscle data...</div>
            ) : (
              <>
                {/* Two-column layout: Current | Forecasted */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Current State */}
                  <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
                    <h2 className="text-lg font-semibold text-foreground font-display mb-3">Current State</h2>
                    {currentMuscleStates && (
                      <MuscleVisualizationContainer
                        muscleStates={currentMuscleStates}
                        showStats={false}
                      />
                    )}
                  </Card>

                  {/* Forecasted State */}
                  <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-4">
                    <h2 className="text-lg font-semibold text-foreground font-display mb-3">
                      Forecasted (After Workout)
                    </h2>
                    {forecastedMuscleStates && (
                      <MuscleVisualizationContainer
                        muscleStates={forecastedMuscleStates}
                        showStats={false}
                      />
                    )}
                  </Card>
                </div>

                {/* Planned Exercises Section */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground font-display mb-3">
                    Planned Exercises
                  </h2>
                  {muscleBaselines && (
                    <PlannedExerciseList
                      exercises={plannedExercises}
                      onUpdate={handleUpdateExercise}
                      onRemove={handleRemoveExercise}
                      muscleBaselines={muscleBaselines}
                    />
                  )}
                </div>

                {/* Add Exercise Button */}
                <Button
                  onClick={() => setIsExerciseSelectorOpen(true)}
                  variant="secondary"
                  size="lg"
                  className="w-full min-h-[60px] border-2 border-dashed flex items-center justify-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Exercise
                </Button>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handleClose}
              variant="secondary"
              size="lg"
              className="flex-1 min-h-[60px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartWorkout}
              disabled={plannedExercises.length === 0}
              variant="primary"
              size="lg"
              className="flex-1 min-h-[60px]"
            >
              Start This Workout
            </Button>
          </div>

        {/* Draft Restore Dialog */}
        {showRestoreDialog && (
          <Card variant="elevated" className="bg-white/50 backdrop-blur-lg p-6 mt-4">
            <h3 className="text-xl font-bold font-display mb-2 text-foreground">Resume Planning?</h3>
            <p className="text-sm text-gray-600 font-body mb-4">
              You have unsaved work from earlier. Would you like to resume or start fresh?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleRestoreDraft}
                variant="primary"
                size="md"
                className="flex-1 min-h-[60px]"
              >
                Resume
              </Button>
              <Button
                onClick={handleStartFresh}
                variant="secondary"
                size="md"
                className="flex-1 min-h-[60px]"
              >
                Start Fresh
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Sheet>
  );
};

export default WorkoutPlannerModal;

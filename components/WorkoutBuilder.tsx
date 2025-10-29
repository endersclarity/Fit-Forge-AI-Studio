import React, { useState, useEffect } from 'react';
import { BuilderSet, BuilderWorkout, Exercise, MuscleStatesResponse, MuscleBaselines, WorkoutTemplate } from '../types';
import { muscleStatesAPI, muscleBaselinesAPI, builderAPI, templatesAPI } from '../api';
import { EXERCISE_LIBRARY } from '../constants';
import SetConfigurator from './SetConfigurator';
import SetCard from './SetCard';
import SetEditModal from './SetEditModal';
import CurrentSetDisplay from './CurrentSetDisplay';
import SimpleMuscleVisualization from './SimpleMuscleVisualization';

interface WorkoutBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  loadedTemplate?: WorkoutTemplate | null;
}

type BuilderMode = 'planning' | 'executing';

const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onToast,
  loadedTemplate = null,
}) => {
  const [mode, setMode] = useState<BuilderMode>('planning');
  const [workout, setWorkout] = useState<BuilderWorkout>({
    sets: [],
    currentSetIndex: 0,
    startTime: null,
    muscleStatesSnapshot: null,
  });
  const [muscleStates, setMuscleStates] = useState<MuscleStatesResponse>({});
  const [muscleBaselines, setMuscleBaselines] = useState<MuscleBaselines>({} as MuscleBaselines);
  const [loading, setLoading] = useState(true);

  // Execution mode state
  const [restTimerEndTime, setRestTimerEndTime] = useState<number | null>(null);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const [autoAdvanceTimeoutId, setAutoAdvanceTimeoutId] = useState<number | null>(null);
  const [executionMuscleStates, setExecutionMuscleStates] = useState<MuscleStatesResponse>({});

  // Load muscle states/baselines
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Load template if provided
  useEffect(() => {
    if (loadedTemplate) {
      loadTemplate(loadedTemplate);
    }
  }, [loadedTemplate]);

  // Cleanup timeout on unmount or when switching modes
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutId !== null) {
        clearTimeout(autoAdvanceTimeoutId);
      }
    };
  }, [autoAdvanceTimeoutId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [states, baselines] = await Promise.all([
        muscleStatesAPI.get(),
        muscleBaselinesAPI.getAll(),
      ]);
      setMuscleStates(states);
      setMuscleBaselines(baselines);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      onToast('Failed to load muscle data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: WorkoutTemplate) => {
    const sets: BuilderSet[] = template.sets.map((tSet, idx) => {
      // Look up exercise name from EXERCISE_LIBRARY
      const exercise = EXERCISE_LIBRARY.find(e => e.id === tSet.exerciseId);
      const exerciseName = exercise?.name || tSet.exerciseId; // Fallback to ID if not found

      return {
        id: `${Date.now()}-${idx}`,
        exerciseId: tSet.exerciseId,
        exerciseName,
        weight: tSet.weight,
        reps: tSet.reps,
        restTimerSeconds: tSet.restTimerSeconds,
      };
    });
    setWorkout(prev => ({ ...prev, sets }));
    onToast(`Loaded template: ${template.name}`, 'success');
  };

  const calculateForecastedMuscleStates = (): MuscleStatesResponse => {
    // Start with current states
    const forecasted = { ...muscleStates };

    // Calculate volume per muscle from planned sets
    const muscleVolumes: Record<string, number> = {};

    for (const set of workout.sets) {
      const exercise = EXERCISE_LIBRARY.find(e => e.id === set.exerciseId);
      if (!exercise) continue;

      const setVolume = set.weight * set.reps;
      for (const engagement of exercise.muscleEngagements) {
        const muscleName = engagement.muscle;
        const volume = setVolume * (engagement.percentage / 100);
        muscleVolumes[muscleName] = (muscleVolumes[muscleName] || 0) + volume;
      }
    }

    // Add forecasted fatigue to current states
    for (const [muscleName, volume] of Object.entries(muscleVolumes)) {
      const baseline = muscleBaselines[muscleName as any];
      const effectiveMax = baseline?.userOverride || baseline?.systemLearnedMax || 1000;
      const fatigueIncrease = (volume / effectiveMax) * 100;

      forecasted[muscleName] = {
        ...forecasted[muscleName],
        currentFatiguePercent: (forecasted[muscleName]?.currentFatiguePercent || 0) + fatigueIncrease,
      };
    }

    return forecasted;
  };

  const handleAddSet = (config: {
    exercise: Exercise;
    weight: number;
    reps: number;
    restTimerSeconds: number;
  }) => {
    const newSet: BuilderSet = {
      id: `${Date.now()}-${Math.random()}`,
      exerciseId: config.exercise.id,
      exerciseName: config.exercise.name,
      weight: config.weight,
      reps: config.reps,
      restTimerSeconds: config.restTimerSeconds,
    };
    setWorkout(prev => ({
      ...prev,
      sets: [...prev.sets, newSet],
    }));
  };

  const handleDuplicateSet = (set: BuilderSet) => {
    const newSet: BuilderSet = {
      ...set,
      id: `${Date.now()}-${Math.random()}`,
    };
    setWorkout(prev => ({
      ...prev,
      sets: [...prev.sets, newSet],
    }));
    onToast('Set duplicated', 'info');
  };

  const handleDeleteSet = (setId: string) => {
    setWorkout(prev => ({
      ...prev,
      sets: prev.sets.filter(s => s.id !== setId),
    }));
    onToast('Set deleted', 'info');
  };

  const [editingSet, setEditingSet] = useState<BuilderSet | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSet = (set: BuilderSet) => {
    setEditingSet(set);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedSet = (updatedSet: BuilderSet) => {
    setWorkout(prev => ({
      ...prev,
      sets: prev.sets.map(s => s.id === updatedSet.id ? updatedSet : s),
    }));
    setIsEditModalOpen(false);
    setEditingSet(null);
    onToast('Set updated', 'success');
  };

  const handleStartWorkout = () => {
    if (workout.sets.length === 0) {
      onToast('Add at least one set to start', 'error');
      return;
    }
    setWorkout(prev => ({
      ...prev,
      startTime: Date.now(),
      muscleStatesSnapshot: muscleStates,
    }));
    setExecutionMuscleStates(muscleStates); // Initialize with current states
    setMode('executing');
    onToast('Workout started!', 'success');
  };

  const handleSaveTemplate = async () => {
    if (workout.sets.length === 0) {
      onToast('Add at least one set to save template', 'error');
      return;
    }

    const templateName = prompt('Template name:');
    if (!templateName) return;

    try {
      const templateSets = workout.sets.map(s => ({
        exerciseId: s.exerciseId,
        weight: s.weight,
        reps: s.reps,
        restTimerSeconds: s.restTimerSeconds,
      }));

      await templatesAPI.create({
        name: templateName,
        category: 'Push', // TODO: Auto-detect or ask user
        variation: 'A', // TODO: Auto-detect or ask user
        sets: templateSets,
        isFavorite: false,
      });

      onToast('Template saved!', 'success');
    } catch (error) {
      console.error('Failed to save template:', error);
      onToast('Failed to save template', 'error');
    }
  };

  const handleLogAsCompleted = async () => {
    if (workout.sets.length === 0) {
      onToast('Add at least one set to log', 'error');
      return;
    }

    setLoading(true);
    try {
      await builderAPI.saveBuilderWorkout({
        sets: workout.sets.map(s => ({
          exercise_name: s.exerciseName,
          weight: s.weight,
          reps: s.reps,
          rest_timer_seconds: s.restTimerSeconds,
        })),
        timestamp: new Date().toISOString(),
        was_executed: false,
      });

      onSuccess();
      onToast('Workout logged!', 'success');
      handleClose();
    } catch (error) {
      console.error('Failed to log workout:', error);
      onToast('Failed to log workout', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSet = () => {
    const currentSet = workout.sets[workout.currentSetIndex];
    if (!currentSet) return;

    // Clear any existing timeout
    if (autoAdvanceTimeoutId !== null) {
      clearTimeout(autoAdvanceTimeoutId);
    }

    // Mark set as completed
    setCompletedSets(prev => new Set(prev).add(currentSet.id));

    // Update muscle states with real-time fatigue
    const exercise = EXERCISE_LIBRARY.find(e => e.id === currentSet.exerciseId);
    if (exercise) {
      const setVolume = currentSet.weight * currentSet.reps;
      const updatedStates = { ...executionMuscleStates };

      for (const engagement of exercise.muscleEngagements) {
        const muscleName = engagement.muscle;
        const volume = setVolume * (engagement.percentage / 100);
        const baseline = muscleBaselines[muscleName];
        const effectiveMax = baseline?.userOverride || baseline?.systemLearnedMax || 1000;
        const fatigueIncrease = (volume / effectiveMax) * 100;

        updatedStates[muscleName] = {
          ...updatedStates[muscleName],
          currentFatiguePercent: (updatedStates[muscleName]?.currentFatiguePercent || 0) + fatigueIncrease,
        };
      }

      setExecutionMuscleStates(updatedStates);
    }

    // Start rest timer
    setRestTimerEndTime(Date.now() + currentSet.restTimerSeconds * 1000);

    // Auto-advance to next set after rest timer
    const timeoutId = window.setTimeout(() => {
      setWorkout(prev => ({
        ...prev,
        currentSetIndex: prev.currentSetIndex + 1,
      }));
      setRestTimerEndTime(null);
      setAutoAdvanceTimeoutId(null);
    }, currentSet.restTimerSeconds * 1000);

    setAutoAdvanceTimeoutId(timeoutId);
  };

  const handleSkipSet = () => {
    setWorkout(prev => ({
      ...prev,
      currentSetIndex: prev.currentSetIndex + 1,
    }));
    setRestTimerEndTime(null);
  };

  const handleFinishWorkout = async () => {
    if (completedSets.size === 0) {
      onToast('Complete at least one set to finish workout', 'error');
      return;
    }

    setLoading(true);
    try {
      // Only save completed sets
      const completedSetsData = workout.sets
        .filter(s => completedSets.has(s.id))
        .map(s => ({
          exercise_name: s.exerciseName,
          weight: s.weight,
          reps: s.reps,
          rest_timer_seconds: s.restTimerSeconds,
        }));

      await builderAPI.saveBuilderWorkout({
        sets: completedSetsData,
        timestamp: new Date(workout.startTime!).toISOString(),
        was_executed: true,
      });

      onSuccess();
      onToast(`Workout saved! ${completedSets.size} sets completed.`, 'success');
      handleClose();
    } catch (error) {
      console.error('Failed to save workout:', error);
      onToast('Failed to save workout', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (workout.sets.length > 0) {
      const confirm = window.confirm('Discard workout?');
      if (!confirm) return;
    }
    setWorkout({
      sets: [],
      currentSetIndex: 0,
      startTime: null,
      muscleStatesSnapshot: null,
    });
    setMode('planning');
    onClose();
  };

  if (!isOpen) return null;

  if (mode === 'executing') {
    const currentSet = workout.sets[workout.currentSetIndex];
    const isFinished = workout.currentSetIndex >= workout.sets.length;

    if (isFinished) {
      return (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-brand-surface rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-center">Workout Complete!</h3>
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-slate-300">
                {completedSets.size} of {workout.sets.length} sets completed
              </p>
            </div>
            <button
              onClick={handleFinishWorkout}
              disabled={loading}
              className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Finish Workout'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div className="bg-brand-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <header className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Workout in Progress</h3>
            <button onClick={handleClose} className="text-slate-400 hover:text-white text-2xl">
              ×
            </button>
          </header>

          <CurrentSetDisplay
            set={currentSet}
            setNumber={workout.currentSetIndex + 1}
            totalSets={workout.sets.length}
            restTimerEndTime={restTimerEndTime}
            onComplete={handleCompleteSet}
            onSkip={handleSkipSet}
          />

          {/* Muscle Fatigue Visualization */}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Muscle Fatigue</h4>

            {/* Current Progress */}
            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-2">Current Progress</div>
              <SimpleMuscleVisualization
                muscleStates={executionMuscleStates}
                muscleBaselines={muscleBaselines}
              />
            </div>

            {/* Forecasted End State */}
            <div>
              <div className="text-sm text-slate-400 mb-2">Forecasted End State</div>
              <SimpleMuscleVisualization
                muscleStates={calculateForecastedMuscleStates()}
                muscleBaselines={muscleBaselines}
                opacity={0.6}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center text-sm text-slate-400">
            <span>Completed: {completedSets.size} / {workout.sets.length}</span>
            <button
              onClick={() => setMode('planning')}
              className="text-brand-cyan hover:underline"
            >
              Edit Plan
            </button>
          </div>

          <button
            onClick={handleFinishWorkout}
            disabled={completedSets.size === 0 || loading}
            className="w-full mt-4 bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            Finish Workout Early
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="bg-brand-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Build Workout</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-white text-2xl">
            �
          </button>
        </header>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : (
          <>
            <SetConfigurator onAddSet={handleAddSet} />

            {workout.sets.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold mb-2">Planned Sets ({workout.sets.length})</h4>
                {workout.sets.map((set, idx) => (
                  <SetCard
                    key={set.id}
                    set={set}
                    setNumber={idx + 1}
                    onEdit={handleEditSet}
                    onDelete={handleDeleteSet}
                    onDuplicate={handleDuplicateSet}
                  />
                ))}
              </div>
            )}

            {/* Forecasted Muscle Fatigue */}
            {workout.sets.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Forecasted Muscle Fatigue</h4>
                <SimpleMuscleVisualization
                  muscleStates={calculateForecastedMuscleStates()}
                  muscleBaselines={muscleBaselines}
                />
              </div>
            )}

            <div className="mt-6 space-y-2">
              <button
                onClick={handleStartWorkout}
                disabled={workout.sets.length === 0}
                className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                Start Workout
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSaveTemplate}
                  disabled={workout.sets.length === 0}
                  className="w-full bg-brand-muted text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  Save as Template
                </button>
                <button
                  onClick={handleLogAsCompleted}
                  disabled={workout.sets.length === 0 || loading}
                  className="w-full bg-brand-muted text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  Log as Completed
                </button>
              </div>
            </div>
          </>
        )}

        {/* Set Edit Modal */}
        <SetEditModal
          set={editingSet}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSet(null);
          }}
          onSave={handleSaveEditedSet}
        />
      </div>
    </div>
  );
};

export default WorkoutBuilder;

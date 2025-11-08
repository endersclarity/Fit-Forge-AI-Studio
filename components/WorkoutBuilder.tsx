import React, { useState, useEffect, useRef } from 'react';
import { BuilderSet, BuilderWorkout, Exercise, MuscleStatesResponse, MuscleBaselines, WorkoutTemplate, ExerciseCategory, Variation } from '../types';
import { muscleStatesAPI, muscleBaselinesAPI, builderAPI, templatesAPI, getExerciseHistory } from '../api';
import { EXERCISE_LIBRARY } from '../constants';
import SetConfigurator from './SetConfigurator';
import SetCard from './SetCard';
import SetEditModal from './SetEditModal';
import CurrentSetDisplay from './CurrentSetDisplay';
import SimpleMuscleVisualization from './SimpleMuscleVisualization';
import TargetModePanel, { MuscleTargets } from './TargetModePanel';
import { generateWorkoutFromTargets, ExerciseRecommendation } from '../utils/targetDrivenGeneration';
import { generateSetsFromVolume } from '../utils/setBuilder';

interface WorkoutBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  loadedTemplate?: WorkoutTemplate | null;
  currentBodyweight?: number; // Current user bodyweight for bodyweight exercises
}

type BuilderMode = 'planning' | 'executing';
type PlanningMode = 'forward' | 'target';

const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onToast,
  loadedTemplate = null,
  currentBodyweight,
}) => {
  const [mode, setMode] = useState<BuilderMode>('planning');
  const [planningMode, setPlanningMode] = useState<PlanningMode>('forward');
  const [workout, setWorkout] = useState<BuilderWorkout>({
    sets: [],
    currentSetIndex: 0,
    startTime: null,
    muscleStatesSnapshot: null,
  });
  const [muscleStates, setMuscleStates] = useState<MuscleStatesResponse>({});
  const [muscleBaselines, setMuscleBaselines] = useState<MuscleBaselines>({} as MuscleBaselines);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);

  // Execution mode state
  const [restTimerEndTime, setRestTimerEndTime] = useState<number | null>(null);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const [autoAdvanceTimeoutId, setAutoAdvanceTimeoutId] = useState<number | null>(null);
  const [executionMuscleStates, setExecutionMuscleStates] = useState<MuscleStatesResponse>({});

  // Template save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState<ExerciseCategory>('Push');
  const [templateVariation, setTemplateVariation] = useState<Variation>('A');

  // Auto-save / restore dialog state
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);

  // Refs for auto-save (to avoid interval recreation)
  const workoutRef = useRef(workout);
  const modeRef = useRef(mode);
  const planningModeRef = useRef(planningMode);

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

  // Update refs when state changes (for auto-save)
  useEffect(() => {
    workoutRef.current = workout;
    modeRef.current = mode;
    planningModeRef.current = planningMode;
  }, [workout, mode, planningMode]);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (workoutRef.current.sets.length > 0) {
        localStorage.setItem('workoutBuilder_draft', JSON.stringify({
          sets: workoutRef.current.sets,
          mode: modeRef.current,
          planningMode: planningModeRef.current,
          timestamp: Date.now()
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Restore draft on mount
  useEffect(() => {
    if (!isOpen) return;

    const draft = localStorage.getItem('workoutBuilder_draft');
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
          localStorage.removeItem('workoutBuilder_draft');
        }
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
  }, [isOpen]);

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

  const loadTemplate = async (template: WorkoutTemplate) => {
    const sets: BuilderSet[] = [];

    // Validate exerciseIds exists and is an array
    if (!template.exerciseIds || !Array.isArray(template.exerciseIds)) {
      console.error('Invalid template: exerciseIds is not an array', template);
      onToast('Failed to load template: Invalid exercise data', 'error');
      return;
    }

    for (let idx = 0; idx < template.exerciseIds.length; idx++) {
      const exerciseId = template.exerciseIds[idx];

      // Look up exercise from EXERCISE_LIBRARY
      const exercise = EXERCISE_LIBRARY.find(e => e.id === exerciseId);
      if (!exercise) {
        console.warn(`Exercise ${exerciseId} not found in library`);
        continue;
      }

      // Try to fetch exercise history for smart defaults
      let weight = 0;
      let reps = 8;
      let restTimerSeconds = 90;

      try {
        const history = await getExerciseHistory(exerciseId);
        if (history.sets && history.sets.length > 0) {
          // Use the first set from last performance as default
          weight = history.sets[0].weight;
          reps = history.sets[0].reps;
        }
      } catch (error) {
        // If no history, use defaults (0 weight, 8 reps, 90s rest)
        console.log(`No history for ${exerciseId}, using defaults`);
      }

      sets.push({
        id: `${Date.now()}-${idx}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        weight,
        reps,
        restTimerSeconds,
      });
    }

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

  const handleAddSetFromModal = (newSetValues: { weight: number; reps: number; restTimerSeconds: number }) => {
    if (!editingSet) return;

    // Create a new set with the same exercise but new values
    const newSet: BuilderSet = {
      id: `${Date.now()}-${Math.random()}`,
      exerciseId: editingSet.exerciseId,
      exerciseName: editingSet.exerciseName,
      weight: newSetValues.weight,
      reps: newSetValues.reps,
      restTimerSeconds: newSetValues.restTimerSeconds,
    };

    // Find the index of the current set and insert the new set right after it
    setWorkout(prev => {
      const currentIndex = prev.sets.findIndex(s => s.id === editingSet.id);
      if (currentIndex === -1) {
        // If not found, add to end
        return { ...prev, sets: [...prev.sets, newSet] };
      }
      // Insert after the current set
      const newSets = [...prev.sets];
      newSets.splice(currentIndex + 1, 0, newSet);
      return { ...prev, sets: newSets };
    });

    onToast('Set added', 'success');
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

  const handleSaveTemplate = () => {
    if (workout.sets.length === 0) {
      onToast('Add at least one set to save template', 'error');
      return;
    }
    setShowSaveDialog(true);
  };

  const handleConfirmSaveTemplate = async () => {
    if (!templateName.trim()) {
      onToast('Please enter a template name', 'error');
      return;
    }

    try {
      // Extract unique exercise IDs from sets
      const exerciseIds = [...new Set(workout.sets.map(s => s.exerciseId))];

      await templatesAPI.create({
        name: templateName,
        category: templateCategory,
        variation: templateVariation,
        exerciseIds: exerciseIds,  // Send exerciseIds instead of sets
        isFavorite: false,
      });

      onToast('Template saved!', 'success');
      setShowSaveDialog(false);
      setTemplateName('');
      setTemplateCategory('Push');
      setTemplateVariation('A');
      // Clear draft after successful save
      localStorage.removeItem('workoutBuilder_draft');
    } catch (error) {
      console.error('Failed to save template:', error);
      onToast('Failed to save template', 'error');
    }
  };

  const handleRestoreDraft = () => {
    if (pendingDraft) {
      setWorkout((prev) => ({
        ...prev,
        sets: pendingDraft.sets,
      }));
      setMode(pendingDraft.mode || 'planning');
      setPlanningMode(pendingDraft.planningMode || 'forward');
    }
    setShowRestoreDialog(false);
    setPendingDraft(null);
  };

  const handleStartFresh = () => {
    localStorage.removeItem('workoutBuilder_draft');
    setPendingDraft(null);
    setShowRestoreDialog(false);
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
          bodyweight_at_time: s.bodyweightAtTime,
        })),
        timestamp: new Date().toISOString(),
        was_executed: false,
      });

      onSuccess();
      onToast('Workout logged!', 'success');
      // Clear draft after successful log
      localStorage.removeItem('workoutBuilder_draft');
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
          bodyweight_at_time: s.bodyweightAtTime,
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

  const handleGenerateFromTargets = async (targets: MuscleTargets) => {
    setIsGenerating(true);
    try {
      // Generate recommendations using the algorithm
      const recs = generateWorkoutFromTargets(
        targets,
        muscleStates,
        muscleBaselines
      );

      if (recs.length === 0) {
        onToast('No valid exercises found for your targets', 'error');
        setRecommendations([]);
        return;
      }

      setRecommendations(recs);
      onToast(`Generated ${recs.length} exercise recommendations`, 'success');
    } catch (error) {
      console.error('Failed to generate workout:', error);
      onToast('Failed to generate workout', 'error');
      setRecommendations([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptRecommendations = async () => {
    if (recommendations.length === 0) return;

    setLoading(true);
    try {
      // For each recommendation, fetch exercise history and generate sets
      for (const rec of recommendations) {
        let history;
        try {
          history = await getExerciseHistory(rec.exercise.id);
        } catch {
          history = null;
        }

        const breakdown = generateSetsFromVolume(
          rec.targetVolume,
          history?.lastPerformance
        );

        // Add as a set to the workout
        const newSet: BuilderSet = {
          id: `${Date.now()}-${Math.random()}`,
          exerciseId: rec.exercise.id,
          exerciseName: rec.exercise.name,
          weight: breakdown.weight,
          reps: breakdown.reps,
          restTimerSeconds: 90, // Default rest timer
        };

        setWorkout(prev => ({
          ...prev,
          sets: [...prev.sets, newSet],
        }));
      }

      // Clear recommendations and switch back to forward planning mode
      setRecommendations([]);
      setPlanningMode('forward');
      onToast('Recommendations added to workout!', 'success');
    } catch (error) {
      console.error('Failed to add recommendations:', error);
      onToast('Failed to add recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRecommendations = () => {
    setRecommendations([]);
    onToast('Cleared recommendations. Adjust targets and generate again.', 'info');
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
    setPlanningMode('forward');
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
            {/* Planning Mode Toggle */}
            <div className="flex items-center justify-center gap-2 bg-brand-muted p-2 rounded-lg mb-4">
              <button
                onClick={() => setPlanningMode('forward')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  planningMode === 'forward'
                    ? 'bg-brand-cyan text-brand-dark'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Forward Planning
              </button>
              <button
                onClick={() => setPlanningMode('target')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  planningMode === 'target'
                    ? 'bg-brand-cyan text-brand-dark'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Target-Driven
              </button>
            </div>

            {planningMode === 'forward' ? (
              <SetConfigurator onAddSet={handleAddSet} />
            ) : (
              <>
                <TargetModePanel
                  currentMuscleStates={muscleStates}
                  muscleBaselines={muscleBaselines}
                  onGenerate={handleGenerateFromTargets}
                  isGenerating={isGenerating}
                />

                {/* Recommendations Display */}
                {recommendations.length > 0 && (
                  <div className="mt-4 bg-brand-muted p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">Recommendations</h4>
                      <button
                        onClick={handleRegenerateRecommendations}
                        className="text-sm text-brand-cyan hover:underline"
                      >
                        Clear & Regenerate
                      </button>
                    </div>

                    <div className="space-y-2">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-brand-dark p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-white">
                              {rec.exercise.name}
                            </div>
                            <div className="text-sm text-slate-400">
                              Score: {rec.efficiencyScore.toFixed(1)}
                            </div>
                          </div>

                          <div className="text-sm text-slate-300 mb-2">
                            Target Volume: {rec.targetVolume.toFixed(0)} lbs
                          </div>

                          {/* Muscle impacts */}
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(rec.muscleImpacts)
                              .filter(([_, impact]) => impact > 1) // Only show significant impacts
                              .sort(([_, a], [__, b]) => b - a) // Sort by impact
                              .map(([muscle, impact]) => (
                                <div
                                  key={muscle}
                                  className="text-xs px-2 py-1 bg-brand-muted rounded"
                                >
                                  <span className="text-slate-400">{muscle}:</span>{' '}
                                  <span className="text-brand-cyan">
                                    +{impact.toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleAcceptRecommendations}
                      disabled={loading}
                      className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg
                                 hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Accept All Recommendations'}
                    </button>
                  </div>
                )}
              </>
            )}

            {workout.sets.length > 0 ? (
              <>
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

                {/* Forecasted Muscle Fatigue */}
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Forecasted Muscle Fatigue</h4>
                  <SimpleMuscleVisualization
                    muscleStates={calculateForecastedMuscleStates()}
                    muscleBaselines={muscleBaselines}
                  />
                </div>
              </>
            ) : (
              <div className="mt-4 bg-brand-muted p-6 rounded-lg text-center text-slate-400">
                <p className="text-sm">No sets added yet. Select an exercise above to build your workout.</p>
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
          onAddSet={handleAddSetFromModal}
          currentBodyweight={currentBodyweight}
        />

        {/* Draft Restore Dialog */}
        {showRestoreDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-brand-surface p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-2">Resume Planning?</h3>
              <p className="text-sm text-slate-300 mb-4">
                You have unsaved work from earlier. Would you like to resume or start fresh?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreDraft}
                  className="flex-1 bg-brand-cyan text-brand-dark py-2 rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
                >
                  Resume
                </button>
                <button
                  onClick={handleStartFresh}
                  className="flex-1 bg-brand-muted py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Template Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-brand-surface p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Save Template</h3>

              <label className="block mb-4">
                <span className="block text-sm mb-2">Template Name</span>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Upper Body Day 1"
                  className="w-full p-2 rounded bg-brand-muted border border-brand-dark focus:border-brand-cyan focus:outline-none"
                />
              </label>

              <label className="block mb-4">
                <span className="block text-sm mb-2">Workout Category</span>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value as ExerciseCategory)}
                  className="w-full p-2 rounded bg-brand-muted border border-brand-dark focus:border-brand-cyan focus:outline-none"
                >
                  <option value="Push">Push</option>
                  <option value="Pull">Pull</option>
                  <option value="Legs">Legs</option>
                  <option value="Core">Core</option>
                </select>
              </label>

              <label className="block mb-6">
                <span className="block text-sm mb-2">Variation</span>
                <select
                  value={templateVariation}
                  onChange={(e) => setTemplateVariation(e.target.value as Variation)}
                  className="w-full p-2 rounded bg-brand-muted border border-brand-dark focus:border-brand-cyan focus:outline-none"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="Both">Both</option>
                </select>
              </label>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmSaveTemplate}
                  className="flex-1 bg-brand-cyan text-brand-dark py-2 rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
                >
                  Save Template
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setTemplateName('');
                    setTemplateCategory('Push');
                    setTemplateVariation('A');
                  }}
                  className="flex-1 bg-brand-muted py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutBuilder;

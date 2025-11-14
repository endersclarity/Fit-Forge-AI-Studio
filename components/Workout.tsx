
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { EXERCISE_LIBRARY, ALL_MUSCLES } from '../constants';
import { Exercise, ExerciseCategory, LoggedExercise, LoggedSet, WorkoutSession, PersonalBests, UserProfile, MuscleBaselines, Muscle, Variation, Equipment, PlannedExercise } from '../types';
import { calculateVolume, findPreviousWorkout, formatDuration } from '../utils/helpers';
import { PlusIcon, TrophyIcon, XIcon, ChevronUpIcon, ChevronDownIcon, ClockIcon, InfoIcon } from './Icons';
import WorkoutSummaryModal from './WorkoutSummaryModal';
import { RecommendedWorkoutData } from '../App';
import { LastWorkoutSummary } from './LastWorkoutSummary';
import { workoutsAPI, templatesAPI } from '../api';
import { WorkoutResponse } from '../backend/types';
import { calculateProgressiveOverload, ProgressionMethod } from '../utils/progressiveOverload';
import { ProgressiveSuggestionButtons } from './ProgressiveSuggestionButtons';
import { Card, Button, Input, Sheet } from '@/src/design-system/components/primitives';
import FAB from '@/src/design-system/components/patterns/FAB';

type WorkoutStage = "setup" | "tracking" | "summary";

interface WorkoutProps {
  onFinishWorkout: (session: WorkoutSession) => void;
  onCancel: () => void;
  allWorkouts: WorkoutSession[];
  personalBests: PersonalBests;
  userProfile: UserProfile;
  muscleBaselines: MuscleBaselines;
  initialData?: RecommendedWorkoutData | null;
  plannedExercises?: PlannedExercise[] | null;
}

const ExerciseSelector: React.FC<{ onSelect: (exercise: Exercise) => void, onDone: () => void, workoutVariation: Variation }> = ({ onSelect, onDone, workoutVariation }) => {
    const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | 'All'>('All');
    const [equipmentFilter, setEquipmentFilter] = useState<Equipment | 'All'>('All');
    const [muscleFilter, setMuscleFilter] = useState<Muscle | 'All'>('All');

    const filteredExercises = useMemo(() => {
        let filtered = EXERCISE_LIBRARY;

        // Category filter
        if (categoryFilter !== 'All') {
            filtered = filtered.filter(ex => ex.category === categoryFilter);
        }

        // Equipment filter
        if (equipmentFilter !== 'All') {
            filtered = filtered.filter(ex => {
                if (Array.isArray(ex.equipment)) {
                    return ex.equipment.includes(equipmentFilter);
                }
                return ex.equipment === equipmentFilter;
            });
        }

        // Muscle filter
        if (muscleFilter !== 'All') {
            filtered = filtered.filter(ex =>
                ex.muscleEngagements.some(eng => eng.muscle === muscleFilter)
            );
        }

        // Variation filter
        filtered = filtered.filter(ex => ex.variation === 'Both' || ex.variation === workoutVariation);

        return filtered;
    }, [categoryFilter, equipmentFilter, muscleFilter, workoutVariation]);

    const equipmentOptions: (Equipment | 'All')[] = ['All', 'Bodyweight', 'Dumbbells', 'Kettlebell', 'Pull-up Bar', 'TRX', 'Dip Station', 'Bench'];

    const muscleOptions: (Muscle | 'All')[] = ['All', ...ALL_MUSCLES];

    return (
        <div className="fixed inset-0 bg-background z-20 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-display font-bold">Add Exercise</h2>
                <Button
                    onClick={onDone}
                    variant="ghost"
                    className="text-primary font-semibold min-w-[60px] min-h-[60px]"
                    aria-label="Done selecting exercises"
                >
                    Done
                </Button>
            </div>

            {/* Category Filter */}
            <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-400 mb-1">CATEGORY</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {(['All', 'Push', 'Pull', 'Legs', 'Core'] as const).map(cat => (
                        <Button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            variant={categoryFilter === cat ? 'primary' : 'secondary'}
                            size="md"
                            className={`px-4 rounded-full text-sm font-semibold whitespace-nowrap min-w-[60px] min-h-[48px]`}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Equipment Filter */}
            <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-400 mb-1">EQUIPMENT</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {equipmentOptions.map(eq => (
                        <Button
                            key={eq}
                            onClick={() => setEquipmentFilter(eq)}
                            variant={equipmentFilter === eq ? 'primary' : 'secondary'}
                            size="md"
                            className="px-4 rounded-full text-sm font-semibold whitespace-nowrap min-w-[60px] min-h-[48px]"
                        >
                            {eq}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Muscle Filter */}
            <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-400 mb-1">MUSCLE GROUP</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {muscleOptions.map(muscle => (
                        <Button
                            key={muscle}
                            onClick={() => setMuscleFilter(muscle)}
                            variant={muscleFilter === muscle ? 'primary' : 'secondary'}
                            size="md"
                            className="px-4 rounded-full text-sm font-semibold whitespace-nowrap min-w-[60px] min-h-[48px]"
                        >
                            {muscle}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2">
                {filteredExercises.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No exercises match your filters
                    </div>
                ) : (
                    filteredExercises.map(ex => {
                        const equipmentDisplay = Array.isArray(ex.equipment) ? ex.equipment.join(' / ') : ex.equipment;
                        return (
                            <Button
                                key={ex.id}
                                onClick={() => onSelect(ex)}
                                variant="secondary"
                                className="w-full text-left p-4 rounded-lg flex justify-between items-center min-h-[60px] gap-4"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold">{ex.name}</p>
                                    <p className="text-xs text-gray-400">{equipmentDisplay}</p>
                                </div>
                                <PlusIcon className="w-6 h-6 text-primary shrink-0"/>
                            </Button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const RestTimer: React.FC<{
    timer: { remaining: number; initialDuration: number };
    onClose: () => void;
    onAdd: (seconds: number) => void;
}> = ({ timer, onClose, onAdd }) => {
    const progress = timer.initialDuration > 0 ? (timer.remaining / timer.initialDuration) * 100 : 0;
    const minutes = Math.floor(timer.remaining / 60);
    const seconds = timer.remaining % 60;
    const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    return (
        <Card className="fixed inset-x-0 bottom-0 p-4 z-30 shadow-lg rounded-t-2xl max-w-2xl mx-auto border-t border-gray-700 bg-white/50 backdrop-blur-lg">
             <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => onAdd(15)}
                        variant="secondary"
                        size="md"
                        className="text-sm font-semibold min-w-[60px] min-h-[60px]"
                        aria-label="Add 15 seconds to rest timer"
                    >
                        +15s
                    </Button>
                    <span className="text-3xl font-bold font-mono tracking-wider">{timeString}</span>
                </div>
                <Button
                    onClick={onClose}
                    variant="ghost"
                    size="md"
                    className="text-sm font-semibold text-gray-300 min-w-[60px] min-h-[60px]"
                    aria-label={timer.remaining > 0 ? 'Skip rest timer' : 'Close rest timer'}
                >
                    {timer.remaining > 0 ? 'Skip' : 'Done'}
                </Button>
            </div>
        </Card>
    );
};

const FailureTooltip: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="rounded-lg p-6 max-w-sm animate-fade-in bg-white/50 backdrop-blur-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-display font-bold mb-2">What is "To Failure"?</h3>
                <p className="text-sm text-gray-700 mb-3">
                    Mark a set if you <strong>couldn't do one more rep</strong> with good form.
                </p>
                <Card className="bg-gray-100 p-3 rounded-md mb-4">
                    <p className="text-xs text-gray-600 mb-1">Why it matters:</p>
                    <p className="text-xs text-gray-700">
                        Helps FitForge learn your true muscle capacity for personalized recommendations.
                    </p>
                </Card>
                <p className="text-xs text-primary mb-4">
                    <strong>Default:</strong> Last set = failure
                </p>
                <Button
                    onClick={onClose}
                    variant="primary"
                    className="w-full min-h-[48px]"
                    aria-label="Close to-failure explanation"
                >
                    Got it
                </Button>
            </Card>
        </div>
    );
};


const WorkoutTracker: React.FC<WorkoutProps> = ({ onFinishWorkout, onCancel, allWorkouts, personalBests, userProfile, muscleBaselines, initialData, plannedExercises }) => {
  // State for last workout data
  const [lastWorkout, setLastWorkout] = useState<WorkoutResponse | null>(null);
  const [loadingLastWorkout, setLoadingLastWorkout] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>(initialData?.type || "Push");
  const [variationSuggestion, setVariationSuggestion] = useState<{
    suggested: 'A' | 'B';
    lastVariation: 'A' | 'B' | null;
    lastDate: string | null;
    daysAgo: number | null;
  } | null>(null);

  // Helper function to determine default weight for an exercise
  const getDefaultWeight = (exerciseId: string): number => {
    // Priority 1: User's personal best for this exercise
    const pb = personalBests[exerciseId];
    if (pb && pb.bestSingleSet > 0) {
      return Math.round(pb.bestSingleSet * 0.85); // Use 85% of PB as starting point
    }
    // Priority 2: Sensible default based on exercise difficulty
    const exercise = EXERCISE_LIBRARY.find(e => e.id === exerciseId);
    if (exercise?.difficulty === 'Advanced') return 150;
    if (exercise?.difficulty === 'Intermediate') return 100;
    return 75; // Beginner default
  };

  // Helper to generate timestamp-based workout name
  const generateWorkoutName = (type: ExerciseCategory, variation: "A" | "B") => {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${type} ${variation} - ${timestamp}`;
  };

  // Determine if we have any pre-populated data
  const hasPrePopulatedData = !!initialData || !!plannedExercises;

  const [stage, setStage] = useState<WorkoutStage>(hasPrePopulatedData ? "tracking" : "setup");
  const [workoutName, setWorkoutName] = useState(
    initialData
      ? generateWorkoutName(initialData.type, initialData.variation && initialData.variation !== 'Both' ? initialData.variation : 'A')
      : plannedExercises
      ? generateWorkoutName("Push", 'A') // Default for planned workouts
      : ""
  );
  const [workoutType, setWorkoutType] = useState<ExerciseCategory>(initialData?.type || "Push");
  // Fix: Handle cases where the recommended workout variation is "Both" by defaulting to "A".
  const [workoutVariation, setWorkoutVariation] = useState<"A" | "B">(initialData?.variation && initialData.variation !== 'Both' ? initialData.variation : 'A');
  const [startTime, setStartTime] = useState<number>(hasPrePopulatedData ? Date.now() : 0);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>(() => {
    // Priority 1: Use initialData (recommended workout)
    if (initialData) {
      return initialData.suggestedExercises.map(ex => ({
        id: `${ex.id}-${Date.now()}`,
        exerciseId: ex.id,
        sets: [
          { id: `set-1-${Date.now()}`, reps: 8, weight: getDefaultWeight(ex.id), to_failure: false },
          { id: `set-2-${Date.now()}`, reps: 8, weight: getDefaultWeight(ex.id), to_failure: false },
          { id: `set-3-${Date.now()}`, reps: 8, weight: getDefaultWeight(ex.id), to_failure: true }
        ]
      }));
    }

    // Priority 2: Use plannedExercises (from workout planner)
    if (plannedExercises && plannedExercises.length > 0) {
      return plannedExercises.map(planned => ({
        id: `${planned.exercise.id}-${Date.now()}`,
        exerciseId: planned.exercise.id,
        sets: Array.from({ length: planned.sets }, (_, i) => ({
          id: `set-${i + 1}-${Date.now()}-${Math.random()}`,
          reps: planned.reps,
          weight: planned.weight,
          to_failure: i === planned.sets - 1 // Last set defaults to failure
        }))
      }));
    }

    // Default: Empty array
    return [];
  });
  const [isExerciseSelectorOpen, setExerciseSelectorOpen] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [isCapacityPanelOpen, setCapacityPanelOpen] = useState(false);
  const [bodyweightWarning, setBodyweightWarning] = useState<string | null>(null);
  const [showFailureTooltip, setShowFailureTooltip] = useState(false);

  const [finalWorkoutSession, setFinalWorkoutSession] = useState<WorkoutSession | null>(null);

  // Rest Timer State
  const [activeTimer, setActiveTimer] = useState<{ setId: string; initialDuration: number; remaining: number } | null>(null);
  // Fix: Initialize useRef with an argument to prevent "Expected 1 arguments, but got 0" error.
  const timerIntervalRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (initialData && loggedExercises.length > 0) {
        setExpandedExerciseId(loggedExercises[0].id);
    }
  }, [initialData, loggedExercises]);

  // Fetch last workout and variation suggestion when category changes
  useEffect(() => {
    const fetchLastWorkoutData = async () => {
      setLoadingLastWorkout(true);
      try {
        // Fetch last workout
        const lastWorkoutData = await workoutsAPI.getLastByCategory(selectedCategory);
        setLastWorkout(lastWorkoutData);

        // Fetch variation suggestion
        const response = await fetch(`/api/workouts/last?category=${selectedCategory}&includeVariationSuggestion=true`);
        if (response.ok) {
          const suggestionData = await response.json();
          setVariationSuggestion(suggestionData);
          // Auto-set the suggested variation
          setWorkoutVariation(suggestionData.suggested);
        }
      } catch (error) {
        console.error('Error fetching last workout:', error);
        setLastWorkout(null);
        setVariationSuggestion(null);
      } finally {
        setLoadingLastWorkout(false);
      }
    };

    if (stage === "setup") {
      fetchLastWorkoutData();
    }
  }, [selectedCategory, stage]);

  const playBeep = () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
    oscillator.start(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
    oscillator.stop(audioContext.currentTime + 1);
  };

  useEffect(() => {
    if (activeTimer && activeTimer.remaining > 0) {
        timerIntervalRef.current = window.setInterval(() => {
            setActiveTimer(prev => prev ? { ...prev, remaining: prev.remaining - 1 } : null);
        }, 1000);
    } else if (activeTimer && activeTimer.remaining <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        playBeep();
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [activeTimer]);

  const startRestTimer = (setId: string, duration: number = 90) => {
    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch(e) {
            console.error("Web Audio API is not supported in this browser", e);
        }
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setActiveTimer({ setId, initialDuration: duration, remaining: duration });
  };

  const stopRestTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setActiveTimer(null);
  };

  const addRestTime = (seconds: number) => {
    setActiveTimer(prev => prev ? { ...prev, remaining: Math.max(0, prev.remaining + seconds) } : null);
  };

  const startWorkout = () => {
    setStartTime(Date.now());
    // Generate default workout name with timestamp if none provided
    if (!workoutName || workoutName.trim() === '') {
      setWorkoutName(generateWorkoutName(workoutType, workoutVariation));
    }
    setStage("tracking");
    if (loggedExercises.length > 0) {
      setExpandedExerciseId(loggedExercises[0].id);
    }
  };

  // Load template with progressive overload suggestions
  const loadTemplateWithProgression = async (variation: 'A' | 'B') => {
    setLoadingLastWorkout(true); // Reuse existing loading state
    setWorkoutVariation(variation);
    setWorkoutName(generateWorkoutName(selectedCategory, variation));

    try {
      // Fetch all templates
      const allTemplates = await templatesAPI.getAll();

      // Find the template matching the selected category and variation
      const matchingTemplate = allTemplates.find(
        t => t.category === selectedCategory && t.variation === variation
      );

      if (matchingTemplate && matchingTemplate.exerciseIds && matchingTemplate.exerciseIds.length > 0) {
        // Load template exercises with default sets
        const newExercises: LoggedExercise[] = matchingTemplate.exerciseIds.map((exerciseId, idx) => {
          // Find the exercise in the library to get default weight
          const exerciseInfo = EXERCISE_LIBRARY.find(e => e.id === exerciseId);
          const defaultWeight = exerciseInfo ? getDefaultWeight(exerciseId) : 50;

          // Create 3 sets with default values (can be adjusted by user)
          const sets: LoggedSet[] = [
            { id: `set-1-${Date.now()}-${idx}`, reps: 8, weight: defaultWeight, to_failure: false },
            { id: `set-2-${Date.now()}-${idx}`, reps: 8, weight: defaultWeight, to_failure: false },
            { id: `set-3-${Date.now()}-${idx}`, reps: 8, weight: defaultWeight, to_failure: true }
          ];

          return {
            id: `${exerciseId}-${Date.now()}-${idx}`,
            exerciseId,
            sets
          };
        });

        setLoggedExercises(newExercises);
      } else if (lastWorkout && lastWorkout.exercises) {
        // Fallback: If template not found but we have lastWorkout, use progressive overload logic
        const newExercises: LoggedExercise[] = lastWorkout.exercises.map((prevExercise, idx) => {
          const exerciseInfo = EXERCISE_LIBRARY.find(e => e.name === prevExercise.exercise);
          const exerciseId = exerciseInfo?.id || `ex${idx}`;

          const bestSet = prevExercise.sets.reduce((max, set) =>
            (set.weight * set.reps > max.weight * max.reps) ? set : max
          );

          const suggestion = calculateProgressiveOverload(
            { weight: bestSet.weight, reps: bestSet.reps },
            (lastWorkout.progression_method as ProgressionMethod) || null,
            { weight: bestSet.weight, reps: bestSet.reps }
          );

          const sets: LoggedSet[] = prevExercise.sets.map((_, setIdx) => ({
            id: `set-${setIdx + 1}-${Date.now()}-${idx}`,
            reps: suggestion.suggestedReps,
            weight: suggestion.suggestedWeight,
            to_failure: setIdx === prevExercise.sets.length - 1
          }));

          return {
            id: `${exerciseId}-${Date.now()}-${idx}`,
            exerciseId,
            sets
          };
        });

        setLoggedExercises(newExercises);
      } else {
        // No template found and no last workout - start with empty workout
        console.warn(`No template found for ${selectedCategory} ${variation}`);
        setLoggedExercises([]);
      }

      startWorkout();
    } catch (error) {
      console.error('Failed to load template:', error);
      // Fallback to starting empty workout on error
      startWorkout();
    } finally {
      setLoadingLastWorkout(false);
    }
  };

  const addExercise = (exercise: Exercise) => {
    const newLoggedExercise: LoggedExercise = {
      id: `${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      sets: [
        { id: `set-1-${Date.now()}`, reps: 8, weight: getDefaultWeight(exercise.id), to_failure: false },
        { id: `set-2-${Date.now()}`, reps: 8, weight: getDefaultWeight(exercise.id), to_failure: false },
        { id: `set-3-${Date.now()}`, reps: 8, weight: getDefaultWeight(exercise.id), to_failure: true }
      ],
    };
    setLoggedExercises(prev => [...prev, newLoggedExercise]);
    setExpandedExerciseId(newLoggedExercise.id);
    setExerciseSelectorOpen(false);
  };

  const addSet = (exerciseId: string) => {
    setLoggedExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;

      // Unmark the previous last set as "to failure"
      const updatedSets = ex.sets.map((s, idx) =>
        idx === ex.sets.length - 1 ? { ...s, to_failure: false } : s
      );

      // Add new set marked as "to failure" (smart default)
      const newSet: LoggedSet = {
        id: `set-${Date.now()}`,
        reps: 8,
        weight: 100,
        to_failure: true
      };

      return { ...ex, sets: [...updatedSets, newSet] };
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    if (field === 'weight' && (value < 0 || value > 500)) return;
    if (field === 'reps' && (value < 1 || value > 50)) return;

    const finalValue = field === 'reps' ? Math.round(value) : value;

    setLoggedExercises(prev => prev.map(ex =>
      ex.id === exerciseId ? {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: finalValue, bodyweightAtTime: undefined } : s)
      } : ex
    ));
  };

  const toggleSetFailure = (exerciseId: string, setId: string) => {
    setLoggedExercises(prev => prev.map(ex =>
      ex.id === exerciseId ? {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, to_failure: !s.to_failure } : s)
      } : ex
    ));
  };

  const handleWeightBlur = (exerciseId: string, setId: string, currentWeight: number) => {
    const roundedWeight = Math.round(currentWeight / 0.25) * 0.25;
    if (roundedWeight !== currentWeight) {
        updateSet(exerciseId, setId, 'weight', roundedWeight);
    }
  };

  const handleUseBodyweight = (exerciseId: string, setId: string) => {
    const latestWeightEntry = userProfile.bodyweightHistory?.sort((a,b) => b.date - a.date)[0];
    const bodyweight = latestWeightEntry?.weight || 150;

    if (!latestWeightEntry) {
        setBodyweightWarning("Default used - set bodyweight in Profile");
        setTimeout(() => setBodyweightWarning(null), 3000);
    }

    setLoggedExercises(prev =>
        prev.map(ex =>
            ex.id === exerciseId
            ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, weight: bodyweight, bodyweightAtTime: bodyweight } : s) }
            : ex
        )
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
     setLoggedExercises(prev => prev.map(ex =>
      ex.id === exerciseId ? {
        ...ex,
        sets: ex.sets.filter(s => s.id !== setId)
      } : ex
    ));
  };

  const handleOpenSummary = () => {
    const end = Date.now();
    // Fix: Removed call to non-existent 'setEndTime' function.

    const session: WorkoutSession = {
      id: `workout-${startTime}`,
      name: workoutName,
      type: workoutType,
      variation: workoutVariation,
      startTime,
      endTime: end,
      loggedExercises,
      muscleFatigueHistory: {}, // This will be calculated in onFinishWorkout
    };
    setFinalWorkoutSession(session);
    setStage("summary");
    stopRestTimer();
  };

  const getExerciseName = (exerciseId: string) => EXERCISE_LIBRARY.find(e => e.id === exerciseId)?.name || 'Unknown Exercise';

  const muscleCapacityData = useMemo(() => {
    const baselines = muscleBaselines;
    if (!baselines || Object.keys(baselines).length === 0) {
        return { status: 'no_baselines', data: [] };
    }

    const hasSets = loggedExercises.some(ex => ex.sets.length > 0);
    if (!hasSets) {
        return { status: 'no_sets', data: [] };
    }

    const workoutMuscleVolumes: Record<Muscle, number> = ALL_MUSCLES.reduce((acc, muscle) => ({ ...acc, [muscle]: 0 }), {} as Record<Muscle, number>);
    loggedExercises.forEach(loggedEx => {
        const exerciseInfo = EXERCISE_LIBRARY.find(e => e.id === loggedEx.exerciseId);
        if (!exerciseInfo) return;
        const exerciseVolume = loggedEx.sets.reduce((total, set) => total + calculateVolume(set.reps, set.weight), 0);
        exerciseInfo.muscleEngagements.forEach(engagement => {
            workoutMuscleVolumes[engagement.muscle] += exerciseVolume * (engagement.percentage / 100);
        });
    });

    const capacityInfo = Object.entries(workoutMuscleVolumes)
        .map(([muscleStr, volume]) => {
            const muscle = muscleStr as Muscle;
            const muscleBaselineData = baselines[muscle];
            const baseline = muscleBaselineData?.userOverride || muscleBaselineData?.systemLearnedMax || 10000;
            const fatiguePercent = Math.min((volume / baseline) * 100, 100);
            const remainingCapacity = Math.max(0, baseline - volume);
            return {
                muscle,
                fatiguePercent,
                currentVolume: volume,
                remainingCapacity,
            };
        })
        .filter(item => item.fatiguePercent > 5)
        .sort((a, b) => b.fatiguePercent - a.fatiguePercent);

    if (capacityInfo.length === 0) {
        return { status: 'no_fatigue', data: [] };
    }

    return { status: 'ok', data: capacityInfo };
  }, [loggedExercises, muscleBaselines]);

  const getFatigueColor = (percentage: number): string => {
    if (percentage > 70) return "bg-red-500";
    if (percentage > 40) return "bg-yellow-500";
    return "bg-green-500";
  };


  if (stage === "setup") {
    return (
      <div className="p-4 bg-background min-h-screen flex flex-col">
        <div className="flex-grow">
          <h2 className="text-2xl font-display font-bold mb-6">New Workout</h2>

          {/* Workout Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-body font-medium mb-1">Workout Type</label>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value as ExerciseCategory);
                setWorkoutType(e.target.value as ExerciseCategory);
              }}
              className="w-full bg-white/50 backdrop-blur-lg border border-gray-700 rounded-md px-3 py-2 min-h-[60px]"
            >
              <option>Push</option>
              <option>Pull</option>
              <option>Legs</option>
              <option>Core</option>
            </select>
          </div>

          {/* Last Workout Summary */}
          {!loadingLastWorkout && (
            <LastWorkoutSummary
              lastWorkout={lastWorkout}
              category={selectedCategory}
              onLoadTemplate={loadTemplateWithProgression}
              loading={loadingLastWorkout}
            />
          )}

          {loadingLastWorkout && (
            <Card className="p-6 rounded-lg mb-4 text-center bg-white/50 backdrop-blur-lg">
              <p className="text-gray-400">Loading last workout...</p>
            </Card>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium mb-1">Workout Name</label>
              <Input
                type="text"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                placeholder={generateWorkoutName(workoutType, workoutVariation)}
                variant="default"
                size="md"
                className="w-full min-h-[60px]"
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank to use timestamp</p>
            </div>
            <div>
              <label className="block text-sm font-body font-medium mb-1">Workout Variation</label>

              {/* Variation Context */}
              {variationSuggestion && variationSuggestion.lastVariation && (
                <Card className="mb-2 p-3 rounded-md border border-gray-700 bg-white/50 backdrop-blur-lg">
                  <p className="text-sm text-gray-700">
                    <span className="text-gray-600">Last time: </span>
                    <span className="font-semibold">{selectedCategory} {variationSuggestion.lastVariation}</span>
                    <span className="text-gray-500 ml-1">({variationSuggestion.daysAgo} days ago)</span>
                  </p>
                  <p className="text-xs text-primary mt-1">
                    → Today: {selectedCategory} {variationSuggestion.suggested} (Recommended)
                  </p>
                </Card>
              )}

              <div className="flex bg-white/50 backdrop-blur-lg rounded-md p-1">
                <Button
                  onClick={() => setWorkoutVariation("A")}
                  variant={workoutVariation === 'A' ? 'primary' : 'ghost'}
                  className="w-1/2 rounded-md min-h-[60px] font-semibold transition-colors"
                >
                  Workout A
                </Button>
                <Button
                  onClick={() => setWorkoutVariation("B")}
                  variant={workoutVariation === 'B' ? 'primary' : 'ghost'}
                  className="w-1/2 rounded-md min-h-[60px] font-semibold transition-colors"
                >
                  Workout B
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <Button
                onClick={onCancel}
                variant="secondary"
                className="w-full min-h-[60px] font-semibold"
                aria-label="Cancel workout"
            >
                Cancel
            </Button>
            <Button
                onClick={startWorkout}
                variant="primary"
                className="w-full min-h-[60px] font-semibold"
                aria-label="Start workout"
            >
                Start Workout
            </Button>
        </div>
      </div>
    );
  }

  if (stage === "tracking") {
    return (
        <div className="p-4 bg-background min-h-screen flex flex-col relative">
          {bodyweightWarning &&
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg z-10">
                {bodyweightWarning}
            </div>
          }
          <header className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-display font-bold">{workoutName}</h2>
                <p className="text-sm text-gray-400">{workoutType} Day ({workoutVariation})</p>
            </div>
            <Button
                onClick={handleOpenSummary}
                variant="destructive"
                className="min-h-[60px] min-w-[60px]"
                aria-label="Finish workout"
            >
                Finish
            </Button>
          </header>
          <div className="flex-grow space-y-3 overflow-y-auto pb-24">
            {loggedExercises.map(ex => {
              const pb = personalBests[ex.exerciseId];
              const isExpanded = expandedExerciseId === ex.id;
              return (
              <Card key={ex.id} className="rounded-lg bg-white/50 backdrop-blur-lg">
                <Button
                    onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                    variant="ghost"
                    className="w-full p-4 flex justify-between items-center min-h-[60px]"
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${getExerciseName(ex.exerciseId)}`}
                >
                  <h3 className="font-semibold text-lg">{getExerciseName(ex.exerciseId)}</h3>
                  {isExpanded ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
                </Button>
                {isExpanded && <div className="p-4 pt-0">
                    {/* Progressive Suggestion Buttons - only show for first set */}
                    {ex.sets.length === 1 && ex.sets[0].weight === 0 && ex.sets[0].reps === 0 && (
                      <div className="mb-4">
                        <ProgressiveSuggestionButtons
                          exerciseName={getExerciseName(ex.exerciseId)}
                          onSelect={(weight, reps, method) => {
                            // Auto-fill the first set with selected suggestion
                            updateSet(ex.id, ex.sets[0].id, 'weight', weight);
                            updateSet(ex.id, ex.sets[0].id, 'reps', reps);
                          }}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-[auto_1fr_4fr_2fr_3fr] gap-2 text-center text-xs text-gray-400 font-semibold mb-2">
                        <span className="col-span-1 flex items-center justify-center">
                            <button
                                onClick={() => setShowFailureTooltip(true)}
                                className="text-gray-400 hover:text-primary p-1"
                                aria-label="What does to-failure mean?"
                            >
                                <InfoIcon className="w-4 h-4" />
                            </button>
                        </span>
                        <span className="col-span-1">Set</span>
                        <span className="col-span-1">Weight (lbs)</span>
                        <span className="col-span-1">Reps</span>
                        <span className="col-span-1"></span>
                    </div>
                    {ex.sets.map((s, i) => {
                      const setVolume = calculateVolume(s.reps, s.weight);
                      const bestSingleSet = personalBests[ex.exerciseId]?.bestSingleSet || 0;
                      const isNewPR = setVolume > 0 && setVolume > bestSingleSet;
                      const isLastSet = i === ex.sets.length - 1;
                      const toFailure = s.to_failure !== undefined ? s.to_failure : isLastSet;

                      return (
                      <div key={s.id} className="grid grid-cols-[auto_1fr_4fr_2fr_3fr] gap-2 items-center mb-2">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => toggleSetFailure(ex.id, s.id)}
                              className="min-w-[60px] min-h-[60px] p-2 rounded flex items-center justify-center transition-all active:scale-95 gap-2"
                              title={toFailure ? "Taken to failure" : "Not to failure"}
                              aria-label={toFailure ? "Set taken to failure. Click to mark as not to failure." : "Set not to failure. Click to mark as taken to failure."}
                              aria-pressed={toFailure}
                              role="switch"
                            >
                              <div className={`w-7 h-7 rounded border-2 flex items-center justify-center transition-colors ${toFailure ? 'bg-primary border-primary' : 'border-gray-400'}`}>
                                {toFailure && <span className="text-white font-bold text-lg">✓</span>}
                              </div>
                              <span className="text-xs font-semibold text-gray-700">To Failure</span>
                            </button>
                            <span className="text-center font-bold text-gray-700 text-sm">{i + 1}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                value={s.weight}
                                onChange={e => updateSet(ex.id, s.id, 'weight', parseFloat(e.target.value) || 0)}
                                onBlur={e => handleWeightBlur(ex.id, s.id, parseFloat(e.target.value) || 0)}
                                variant="default"
                                size="sm"
                                className="w-full text-center min-h-[60px]"
                            />
                            <Button
                                onClick={() => handleUseBodyweight(ex.id, s.id)}
                                variant="secondary"
                                size="sm"
                                className="text-xs px-2 py-1 whitespace-nowrap h-full"
                                aria-label="Use bodyweight for this set"
                            >
                                Use BW
                            </Button>
                          </div>
                          <div>
                            <Input
                                type="number"
                                value={s.reps}
                                onChange={e => updateSet(ex.id, s.id, 'reps', parseInt(e.target.value) || 0)}
                                variant="default"
                                size="sm"
                                className="w-full text-center min-h-[60px]"
                            />
                          </div>
                          <div className="flex justify-center items-center gap-1">
                            {isNewPR && <TrophyIcon className="w-5 h-5 text-yellow-400" />}
                            <button onClick={() => startRestTimer(s.id)} className="text-gray-400 hover:text-primary p-1"><ClockIcon className="w-5 h-5"/></button>
                            <button onClick={() => removeSet(ex.id, s.id)} className="text-gray-400 hover:text-red-500 p-1"><XIcon className="w-5 h-5"/></button>
                          </div>
                      </div>
                    )})}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-gray-400">
                            {pb && <p>Best Set: {pb.bestSingleSet} lbs</p>}
                        </div>
                        <Button
                            onClick={() => addSet(ex.id)}
                            variant="secondary"
                            size="sm"
                            className="min-h-[60px]"
                            aria-label="Add another set"
                        >
                            Add Set
                        </Button>
                    </div>
                </div>}
              </Card>
            )})}

            <Card className="rounded-lg bg-white/50 backdrop-blur-lg">
                <Button
                    onClick={() => setCapacityPanelOpen(!isCapacityPanelOpen)}
                    variant="ghost"
                    className="w-full p-4 flex justify-between items-center min-h-[60px]"
                    aria-label={`${isCapacityPanelOpen ? 'Collapse' : 'Expand'} muscle capacity panel`}
                >
                    <h3 className="font-semibold text-lg">Muscle Capacity</h3>
                    {isCapacityPanelOpen ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
                </Button>
                <div className={`grid transition-all duration-300 ease-in-out ${isCapacityPanelOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="p-4 pt-0 space-y-3">
                            {muscleCapacityData.status === 'no_baselines' && <p className="text-sm text-gray-400 text-center py-2">Set muscle baselines in Profile to track capacity.</p>}
                            {muscleCapacityData.status === 'no_sets' && <p className="text-sm text-gray-400 text-center py-2">Start logging sets to see muscle fatigue.</p>}
                            {muscleCapacityData.status === 'no_fatigue' && <p className="text-sm text-gray-400 text-center py-2">No significant muscle fatigue yet.</p>}
                            {muscleCapacityData.status === 'ok' && muscleCapacityData.data.map(item => (
                                <div key={item.muscle}>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="font-medium">{item.muscle}</span>
                                        <span className="font-bold">{item.fatiguePercent.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className={`${getFatigueColor(item.fatiguePercent)} h-2 rounded-full`} style={{ width: `${item.fatiguePercent}%` }}></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                        <span>{item.currentVolume.toFixed(0)} lbs</span>
                                        <span>{item.remainingCapacity.toFixed(0)} lbs remaining</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            <Button
                onClick={() => setExerciseSelectorOpen(true)}
                variant="ghost"
                className="w-full border-2 border-dashed border-gray-700 text-gray-700 min-h-[60px] font-semibold flex items-center justify-center gap-2"
                aria-label="Add exercise"
            >
              <PlusIcon className="w-5 h-5"/> Add Exercise
            </Button>
          </div>
          {activeTimer && <RestTimer timer={activeTimer} onClose={stopRestTimer} onAdd={addRestTime} />}
          {isExerciseSelectorOpen && <ExerciseSelector onSelect={addExercise} onDone={() => setExerciseSelectorOpen(false)} workoutVariation={workoutVariation} />}
          <FailureTooltip isOpen={showFailureTooltip} onClose={() => setShowFailureTooltip(false)} />
        </div>
    );
  }

  if (stage === "summary" && finalWorkoutSession) {
    return (
      <WorkoutSummaryModal
        isOpen={true}
        session={finalWorkoutSession}
        personalBests={personalBests}
        muscleBaselines={muscleBaselines}
        allWorkouts={allWorkouts}
        onClose={() => {
          onFinishWorkout(finalWorkoutSession);
          onCancel();
        }}
      />
    );
  }

  return null;
};

export default WorkoutTracker;

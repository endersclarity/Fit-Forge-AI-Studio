
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { EXERCISE_LIBRARY, ALL_MUSCLES } from '../constants';
import { Exercise, ExerciseCategory, LoggedExercise, LoggedSet, WorkoutSession, PersonalBests, UserProfile, MuscleBaselines, Muscle, Variation, Equipment } from '../types';
import { calculateVolume, findPreviousWorkout, formatDuration } from '../utils/helpers';
import { PlusIcon, TrophyIcon, XIcon, ChevronUpIcon, ChevronDownIcon, ClockIcon, InfoIcon } from './Icons';
import WorkoutSummaryModal from './WorkoutSummaryModal';
import { RecommendedWorkoutData } from '../App';
import { LastWorkoutSummary } from './LastWorkoutSummary';
import { workoutsAPI } from '../api';
import { WorkoutResponse } from '../backend/types';
import { calculateProgressiveOverload, ProgressionMethod } from '../utils/progressiveOverload';
import { ProgressiveSuggestionButtons } from './ProgressiveSuggestionButtons';

type WorkoutStage = "setup" | "tracking" | "summary";

interface WorkoutProps {
  onFinishWorkout: (session: WorkoutSession) => void;
  onCancel: () => void;
  allWorkouts: WorkoutSession[];
  personalBests: PersonalBests;
  userProfile: UserProfile;
  muscleBaselines: MuscleBaselines;
  initialData?: RecommendedWorkoutData | null;
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
        <div className="fixed inset-0 bg-brand-dark z-20 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Exercise</h2>
                <button onClick={onDone} className="text-brand-cyan">Done</button>
            </div>

            {/* Category Filter */}
            <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1">CATEGORY</label>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {(['All', 'Push', 'Pull', 'Legs', 'Core'] as const).map(cat => (
                        <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${categoryFilter === cat ? 'bg-brand-cyan text-brand-dark font-semibold' : 'bg-brand-surface'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Equipment Filter */}
            <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1">EQUIPMENT</label>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {equipmentOptions.map(eq => (
                        <button key={eq} onClick={() => setEquipmentFilter(eq)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${equipmentFilter === eq ? 'bg-brand-cyan text-brand-dark font-semibold' : 'bg-brand-surface'}`}>
                            {eq}
                        </button>
                    ))}
                </div>
            </div>

            {/* Muscle Filter */}
            <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1">MUSCLE GROUP</label>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {muscleOptions.map(muscle => (
                        <button key={muscle} onClick={() => setMuscleFilter(muscle)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${muscleFilter === muscle ? 'bg-brand-cyan text-brand-dark font-semibold' : 'bg-brand-surface'}`}>
                            {muscle}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2">
                {filteredExercises.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                        No exercises match your filters
                    </div>
                ) : (
                    filteredExercises.map(ex => {
                        const equipmentDisplay = Array.isArray(ex.equipment) ? ex.equipment.join(' / ') : ex.equipment;
                        return (
                            <button key={ex.id} onClick={() => onSelect(ex)} className="w-full text-left bg-brand-surface p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{ex.name}</p>
                                    <p className="text-xs text-slate-400">{equipmentDisplay}</p>
                                </div>
                                <PlusIcon className="w-5 h-5 text-brand-cyan"/>
                            </button>
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
        <div className="fixed inset-x-0 bottom-0 bg-brand-surface p-4 z-30 shadow-lg rounded-t-2xl max-w-2xl mx-auto border-t border-brand-muted">
             <div className="w-full bg-brand-muted rounded-full h-1.5 mb-3">
                <div className="bg-brand-cyan h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => onAdd(15)} className="text-sm font-semibold bg-brand-muted px-3 py-1 rounded-md">+15s</button>
                    <span className="text-3xl font-bold font-mono tracking-wider">{timeString}</span>
                </div>
                <button onClick={onClose} className="text-sm font-semibold text-slate-300">
                    {timer.remaining > 0 ? 'Skip' : 'Done'}
                </button>
            </div>
        </div>
    );
};

const FailureTooltip: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-brand-surface rounded-lg p-6 max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2">What is "To Failure"?</h3>
                <p className="text-sm text-slate-300 mb-3">
                    Mark a set if you <strong>couldn't do one more rep</strong> with good form.
                </p>
                <div className="bg-brand-muted p-3 rounded-md mb-4">
                    <p className="text-xs text-slate-400 mb-1">Why it matters:</p>
                    <p className="text-xs text-slate-300">
                        Helps FitForge learn your true muscle capacity for personalized recommendations.
                    </p>
                </div>
                <p className="text-xs text-brand-cyan mb-4">
                    <strong>Default:</strong> Last set = failure
                </p>
                <button onClick={onClose} className="w-full bg-brand-cyan text-brand-dark py-2 rounded-lg font-semibold">
                    Got it
                </button>
            </div>
        </div>
    );
};


const WorkoutTracker: React.FC<WorkoutProps> = ({ onFinishWorkout, onCancel, allWorkouts, personalBests, userProfile, muscleBaselines, initialData }) => {
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

  const [stage, setStage] = useState<WorkoutStage>(initialData ? "tracking" : "setup");
  const [workoutName, setWorkoutName] = useState(
    initialData
      ? generateWorkoutName(initialData.type, initialData.variation && initialData.variation !== 'Both' ? initialData.variation : 'A')
      : ""
  );
  const [workoutType, setWorkoutType] = useState<ExerciseCategory>(initialData?.type || "Push");
  // Fix: Handle cases where the recommended workout variation is "Both" by defaulting to "A".
  const [workoutVariation, setWorkoutVariation] = useState<"A" | "B">(initialData?.variation && initialData.variation !== 'Both' ? initialData.variation : 'A');
  const [startTime, setStartTime] = useState<number>(initialData ? Date.now() : 0);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>(
     initialData ? initialData.suggestedExercises.map(ex => ({
        id: `${ex.id}-${Date.now()}`,
        exerciseId: ex.id,
        sets: [
          { id: `set-1-${Date.now()}`, reps: 8, weight: getDefaultWeight(ex.id), to_failure: false },
          { id: `set-2-${Date.now()}`, reps: 8, weight: getDefaultWeight(ex.id), to_failure: false },
          { id: `set-3-${Date.now()}`, reps: 8, weight: getDefaultWeight(ex.id), to_failure: true }
        ]
    })) : []
  );
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
  const loadTemplateWithProgression = (variation: 'A' | 'B') => {
    setWorkoutVariation(variation);
    setWorkoutName(generateWorkoutName(selectedCategory, variation));

    // TODO: Load template exercises from templatesAPI
    // For now, we'll just set up the workout with the selected variation
    // This will be fully implemented when we integrate with WorkoutTemplates

    // If we have a last workout, we can use it to suggest progressive overload
    if (lastWorkout && lastWorkout.exercises) {
      const newExercises: LoggedExercise[] = lastWorkout.exercises.map((prevExercise, idx) => {
        // Find the exercise in the library
        const exerciseInfo = EXERCISE_LIBRARY.find(e => e.name === prevExercise.exercise);
        const exerciseId = exerciseInfo?.id || `ex${idx}`;

        // Get the best set from last workout
        const bestSet = prevExercise.sets.reduce((max, set) =>
          (set.weight * set.reps > max.weight * max.reps) ? set : max
        );

        // Calculate progressive overload
        const suggestion = calculateProgressiveOverload(
          { weight: bestSet.weight, reps: bestSet.reps },
          (lastWorkout.progression_method as ProgressionMethod) || null,
          { weight: bestSet.weight, reps: bestSet.reps }
        );

        // Create sets with suggestions
        const sets: LoggedSet[] = prevExercise.sets.map((_, setIdx) => ({
          id: `set-${setIdx + 1}-${Date.now()}-${idx}`,
          reps: suggestion.suggestedReps,
          weight: suggestion.suggestedWeight,
          to_failure: setIdx === prevExercise.sets.length - 1 // Smart default: last set is to failure
        }));

        return {
          id: `${exerciseId}-${Date.now()}-${idx}`,
          exerciseId,
          sets
        };
      });

      setLoggedExercises(newExercises);
    }

    startWorkout();
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
      <div className="p-4 bg-brand-dark min-h-screen flex flex-col">
        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-6">New Workout</h2>

          {/* Workout Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Workout Type</label>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value as ExerciseCategory);
                setWorkoutType(e.target.value as ExerciseCategory);
              }}
              className="w-full bg-brand-surface border border-brand-muted rounded-md px-3 py-2"
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
            <div className="bg-brand-surface p-6 rounded-lg mb-4 text-center">
              <p className="text-slate-400">Loading last workout...</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Workout Name</label>
              <input
                type="text"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                placeholder={generateWorkoutName(workoutType, workoutVariation)}
                className="w-full bg-brand-surface border border-brand-muted rounded-md px-3 py-2"
              />
              <p className="text-xs text-slate-400 mt-1">Leave blank to use timestamp</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Workout Variation</label>

              {/* Variation Context */}
              {variationSuggestion && variationSuggestion.lastVariation && (
                <div className="mb-2 p-3 bg-brand-surface rounded-md border border-brand-muted">
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-400">Last time: </span>
                    <span className="font-semibold">{selectedCategory} {variationSuggestion.lastVariation}</span>
                    <span className="text-gray-500 ml-1">({variationSuggestion.daysAgo} days ago)</span>
                  </p>
                  <p className="text-xs text-brand-cyan mt-1">
                    → Today: {selectedCategory} {variationSuggestion.suggested} (Recommended)
                  </p>
                </div>
              )}

              <div className="flex bg-brand-surface rounded-md p-1">
                <button
                  onClick={() => setWorkoutVariation("A")}
                  className={`w-1/2 rounded-md py-2 font-semibold transition-colors ${workoutVariation === 'A' ? 'bg-brand-cyan text-brand-dark' : 'text-slate-300'}`}
                >
                  Workout A
                </button>
                <button
                  onClick={() => setWorkoutVariation("B")}
                  className={`w-1/2 rounded-md py-2 font-semibold transition-colors ${workoutVariation === 'B' ? 'bg-brand-cyan text-brand-dark' : 'text-slate-300'}`}
                >
                  Workout B
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={onCancel} className="w-full bg-brand-surface py-3 rounded-lg font-semibold">Cancel</button>
            <button onClick={startWorkout} className="w-full bg-brand-cyan text-brand-dark py-3 rounded-lg font-semibold">Start Workout</button>
        </div>
      </div>
    );
  }

  if (stage === "tracking") {
    return (
        <div className="p-4 bg-brand-dark min-h-screen flex flex-col relative">
          {bodyweightWarning && 
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg z-10">
                {bodyweightWarning}
            </div>
          }
          <header className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold">{workoutName}</h2>
                <p className="text-sm text-slate-400">{workoutType} Day ({workoutVariation})</p>
            </div>
            <button onClick={handleOpenSummary} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg">Finish</button>
          </header>
          <div className="flex-grow space-y-3 overflow-y-auto pb-24">
            {loggedExercises.map(ex => {
              const pb = personalBests[ex.exerciseId];
              const isExpanded = expandedExerciseId === ex.id;
              return (
              <div key={ex.id} className="bg-brand-surface rounded-lg">
                <button onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)} className="w-full p-4 flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{getExerciseName(ex.exerciseId)}</h3>
                  {isExpanded ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
                </button>
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
                    <div className="grid grid-cols-[auto_1fr_4fr_2fr_3fr] gap-2 text-center text-xs text-slate-400 font-semibold mb-2">
                        <span className="col-span-1 flex items-center justify-center">
                            <button
                                onClick={() => setShowFailureTooltip(true)}
                                className="text-slate-400 hover:text-brand-cyan p-1"
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
                          <div className="flex justify-center">
                            <button
                              onClick={() => toggleSetFailure(ex.id, s.id)}
                              className="w-11 h-11 p-2 rounded flex items-center justify-center transition-all active:scale-95"
                              title={toFailure ? "Taken to failure" : "Not to failure"}
                              aria-label={toFailure ? "Set taken to failure. Click to mark as not to failure." : "Set not to failure. Click to mark as taken to failure."}
                              aria-pressed={toFailure}
                              role="switch"
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${toFailure ? 'bg-brand-cyan border-brand-cyan' : 'border-slate-400'}`}>
                                {toFailure && <span className="text-brand-dark font-bold text-sm">✓</span>}
                              </div>
                            </button>
                          </div>
                          <span className="text-center font-bold text-slate-300">{i + 1}</span>
                          <div className="flex items-center gap-1">
                            <input type="number" step="0.25" value={s.weight}
                                onChange={e => updateSet(ex.id, s.id, 'weight', parseFloat(e.target.value) || 0)}
                                onBlur={e => handleWeightBlur(ex.id, s.id, parseFloat(e.target.value) || 0)}
                                className="w-full text-center bg-brand-dark rounded-md p-2" />
                            <button onClick={() => handleUseBodyweight(ex.id, s.id)} className="bg-brand-muted text-xs px-2 py-1 rounded-md whitespace-nowrap h-full">Use BW</button>
                          </div>
                          <div>
                            <input type="number" value={s.reps}
                                onChange={e => updateSet(ex.id, s.id, 'reps', parseInt(e.target.value) || 0)}
                                className="w-full text-center bg-brand-dark rounded-md p-2" />
                          </div>
                          <div className="flex justify-center items-center gap-1">
                            {isNewPR && <TrophyIcon className="w-5 h-5 text-yellow-400" />}
                            <button onClick={() => startRestTimer(s.id)} className="text-slate-400 hover:text-brand-cyan p-1"><ClockIcon className="w-5 h-5"/></button>
                            <button onClick={() => removeSet(ex.id, s.id)} className="text-slate-400 hover:text-red-500 p-1"><XIcon className="w-5 h-5"/></button>
                          </div>
                      </div>
                    )})}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-slate-400">
                            {pb && <p>Best Set: {pb.bestSingleSet} lbs</p>}
                        </div>
                        <button onClick={() => addSet(ex.id)} className="bg-brand-muted text-white font-semibold px-4 py-2 rounded-lg text-sm">Add Set</button>
                    </div>
                </div>}
              </div>
            )})}

            <div className="bg-brand-surface rounded-lg">
                <button onClick={() => setCapacityPanelOpen(!isCapacityPanelOpen)} className="w-full p-4 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Muscle Capacity</h3>
                    {isCapacityPanelOpen ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${isCapacityPanelOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="p-4 pt-0 space-y-3">
                            {muscleCapacityData.status === 'no_baselines' && <p className="text-sm text-slate-400 text-center py-2">Set muscle baselines in Profile to track capacity.</p>}
                            {muscleCapacityData.status === 'no_sets' && <p className="text-sm text-slate-400 text-center py-2">Start logging sets to see muscle fatigue.</p>}
                            {muscleCapacityData.status === 'no_fatigue' && <p className="text-sm text-slate-400 text-center py-2">No significant muscle fatigue yet.</p>}
                            {muscleCapacityData.status === 'ok' && muscleCapacityData.data.map(item => (
                                <div key={item.muscle}>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="font-medium">{item.muscle}</span>
                                        <span className="font-bold">{item.fatiguePercent.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-brand-muted rounded-full h-2">
                                        <div className={`${getFatigueColor(item.fatiguePercent)} h-2 rounded-full`} style={{ width: `${item.fatiguePercent}%` }}></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                                        <span>{item.currentVolume.toFixed(0)} lbs</span>
                                        <span>{item.remainingCapacity.toFixed(0)} lbs remaining</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={() => setExerciseSelectorOpen(true)} className="w-full border-2 border-dashed border-brand-muted text-brand-muted py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <PlusIcon className="w-5 h-5"/> Add Exercise
            </button>
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

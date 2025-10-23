
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { EXERCISE_LIBRARY, ALL_MUSCLES } from '../constants';
import { Exercise, ExerciseCategory, LoggedExercise, LoggedSet, WorkoutSession, PersonalBests, UserProfile, MuscleBaselines, Muscle, Variation } from '../types';
import { calculateVolume, findPreviousWorkout, formatDuration, getUserLevel } from '../utils/helpers';
import { PlusIcon, TrophyIcon, XIcon, ChevronUpIcon, ChevronDownIcon, ClockIcon } from './Icons';

type WorkoutStage = "setup" | "tracking" | "summary";

interface WorkoutProps {
  onFinishWorkout: (session: WorkoutSession) => void;
  onCancel: () => void;
  allWorkouts: WorkoutSession[];
  personalBests: PersonalBests;
  userProfile: UserProfile;
}

const ExerciseSelector: React.FC<{ onSelect: (exercise: Exercise) => void, onDone: () => void, workoutVariation: Variation }> = ({ onSelect, onDone, workoutVariation }) => {
    const [filter, setFilter] = useState<ExerciseCategory | 'All'>('All');
    
    const filteredExercises = useMemo(() => {
        const byCategory = EXERCISE_LIBRARY.filter(ex => filter === 'All' || ex.category === filter);
        return byCategory.filter(ex => ex.variation === 'Both' || ex.variation === workoutVariation);
    }, [filter, workoutVariation]);

    return (
        <div className="fixed inset-0 bg-brand-dark z-20 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Exercise</h2>
                <button onClick={onDone} className="text-brand-cyan">Done</button>
            </div>
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {(['All', 'Push', 'Pull', 'Legs', 'Core'] as const).map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === cat ? 'bg-brand-cyan text-brand-dark font-semibold' : 'bg-brand-surface'}`}>
                        {cat}
                    </button>
                ))}
            </div>
            <div className="flex-grow overflow-y-auto space-y-2">
                {filteredExercises.map(ex => (
                    <button key={ex.id} onClick={() => onSelect(ex)} className="w-full text-left bg-brand-surface p-3 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{ex.name}</p>
                            <p className="text-xs text-slate-400">{ex.equipment}</p>
                        </div>
                        <PlusIcon className="w-5 h-5 text-brand-cyan"/>
                    </button>
                ))}
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


const WorkoutTracker: React.FC<WorkoutProps> = ({ onFinishWorkout, onCancel, allWorkouts, personalBests, userProfile }) => {
  const [stage, setStage] = useState<WorkoutStage>("setup");
  const [workoutName, setWorkoutName] = useState("");
  const [workoutType, setWorkoutType] = useState<ExerciseCategory>("Push");
  const [workoutVariation, setWorkoutVariation] = useState<"A" | "B">("A");
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [isExerciseSelectorOpen, setExerciseSelectorOpen] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [isCapacityPanelOpen, setCapacityPanelOpen] = useState(false);

  const [finalWorkoutSession, setFinalWorkoutSession] = useState<WorkoutSession | null>(null);

  // Rest Timer State
  const [activeTimer, setActiveTimer] = useState<{ setId: string; initialDuration: number; remaining: number } | null>(null);
  const timerIntervalRef = useRef<number>();

  const playBeep = () => {
    // Fix: The AudioContext constructor is called without arguments for broader browser compatibility, resolving an argument error.
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
        clearInterval(timerIntervalRef.current);
        playBeep();
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [activeTimer]);

  const startRestTimer = (setId: string, duration: number = 90) => {
    clearInterval(timerIntervalRef.current);
    setActiveTimer({ setId, initialDuration: duration, remaining: duration });
  };

  const stopRestTimer = () => {
    clearInterval(timerIntervalRef.current);
    setActiveTimer(null);
  };

  const addRestTime = (seconds: number) => {
    setActiveTimer(prev => prev ? { ...prev, remaining: Math.max(0, prev.remaining + seconds) } : null);
  };

  const startWorkout = () => {
    setStartTime(Date.now());
    setStage("tracking");
    if (loggedExercises.length > 0) {
      setExpandedExerciseId(loggedExercises[0].id);
    }
  };

  const addExercise = (exercise: Exercise) => {
    const newLoggedExercise: LoggedExercise = {
      id: `${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      sets: [],
    };
    setLoggedExercises(prev => [...prev, newLoggedExercise]);
    setExpandedExerciseId(newLoggedExercise.id);
    setExerciseSelectorOpen(false);
  };
  
  const addSet = (exerciseId: string) => {
    const newSet: LoggedSet = { id: `set-${Date.now()}`, reps: 8, weight: 100 };
    setLoggedExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex));
  };
  
  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    if (field === 'weight' && (value < 0 || value > 500)) return;
    if (field === 'reps' && (value < 1 || value > 50)) return;
    
    const finalValue = field === 'reps' ? Math.round(value) : value;

    setLoggedExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: finalValue } : s)
      } : ex
    ));
  };

  const handleWeightBlur = (exerciseId: string, setId: string, currentWeight: number) => {
    const roundedWeight = Math.round(currentWeight / 2.5) * 2.5;
    if (roundedWeight !== currentWeight) {
        updateSet(exerciseId, setId, 'weight', roundedWeight);
    }
  };

  const removeSet = (exerciseId: string, setId: string) => {
     setLoggedExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? {
        ...ex,
        sets: ex.sets.filter(s => s.id !== setId)
      } : ex
    ));
  };
  
  const finishWorkout = () => {
    const end = Date.now();
    setEndTime(end);
    // Fix: Add missing muscleFatigueHistory property to conform to WorkoutSession type
    const session: WorkoutSession = {
      id: `workout-${startTime}`,
      name: workoutName,
      type: workoutType,
      variation: workoutVariation,
      startTime,
      endTime: end,
      loggedExercises,
      muscleFatigueHistory: {},
    };
    setFinalWorkoutSession(session);
    onFinishWorkout(session);
    setStage("summary");
    stopRestTimer();
  };

  const getExerciseName = (exerciseId: string) => EXERCISE_LIBRARY.find(e => e.id === exerciseId)?.name || 'Unknown Exercise';

  const userLevel = getUserLevel(allWorkouts.length).level;
  const previousWorkout = finalWorkoutSession ? findPreviousWorkout(finalWorkoutSession, allWorkouts) : null;
  const totalVolume = finalWorkoutSession?.loggedExercises.reduce((total, ex) => total + ex.sets.reduce((exTotal, s) => exTotal + calculateVolume(s.reps, s.weight), 0), 0) || 0;
  const prevTotalVolume = previousWorkout?.loggedExercises.reduce((total, ex) => total + ex.sets.reduce((exTotal, s) => exTotal + calculateVolume(s.reps, s.weight), 0), 0) || 0;
  const volumeChange = prevTotalVolume > 0 ? ((totalVolume - prevTotalVolume) / prevTotalVolume) * 100 : 0;

  const muscleCapacityData = useMemo(() => {
    const baselinesStr = localStorage.getItem('fitforge-muscle-baselines');
    if (!baselinesStr) {
        return { status: 'no_baselines', data: [] };
    }
    const baselines: MuscleBaselines = JSON.parse(baselinesStr);

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
  }, [loggedExercises]);

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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Workout Name</label>
              <input type="text" value={workoutName} onChange={e => setWorkoutName(e.target.value)} placeholder="e.g. Morning Push" className="w-full bg-brand-surface border border-brand-muted rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Workout Type</label>
              <select value={workoutType} onChange={e => setWorkoutType(e.target.value as ExerciseCategory)} className="w-full bg-brand-surface border border-brand-muted rounded-md px-3 py-2">
                <option>Push</option>
                <option>Pull</option>
                <option>Legs</option>
                <option>Core</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Workout Variation</label>
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
            <button onClick={startWorkout} disabled={!workoutName} className="w-full bg-brand-cyan text-brand-dark py-3 rounded-lg font-semibold disabled:bg-brand-muted">Start Workout</button>
        </div>
      </div>
    );
  }

  if (stage === "tracking") {
    return (
        <div className="p-4 bg-brand-dark min-h-screen flex flex-col">
          <header className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold">{workoutName}</h2>
                <p className="text-sm text-slate-400">{workoutType} Day ({workoutVariation})</p>
            </div>
            <button onClick={finishWorkout} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg">Finish</button>
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
                    <div className="grid grid-cols-12 gap-2 text-center text-xs text-slate-400 font-semibold mb-2">
                        <span className="col-span-2">Set</span>
                        <span className="col-span-4">Weight (lbs)</span>
                        <span className="col-span-2">Reps</span>
                        <span className="col-span-4"></span>
                    </div>
                    {ex.sets.map((s, i) => (
                      <div key={s.id} className="grid grid-cols-12 gap-2 items-center mb-2">
                          <span className="text-center font-bold text-slate-300 col-span-2">{i + 1}</span>
                          <div className="col-span-4">
                            <input type="number" step="2.5" value={s.weight} 
                                onChange={e => updateSet(ex.id, s.id, 'weight', parseFloat(e.target.value) || 0)} 
                                onBlur={e => handleWeightBlur(ex.id, s.id, parseFloat(e.target.value) || 0)}
                                className="w-full text-center bg-brand-dark rounded-md p-2" />
                          </div>
                          <div className="col-span-2">
                            <input type="number" value={s.reps} 
                                onChange={e => updateSet(ex.id, s.id, 'reps', parseInt(e.target.value) || 0)} 
                                className="w-full text-center bg-brand-dark rounded-md p-2" />
                          </div>
                          <div className="col-span-4 flex justify-center items-center gap-2">
                            <button onClick={() => startRestTimer(s.id)} className="text-slate-400 hover:text-brand-cyan p-1"><ClockIcon className="w-5 h-5"/></button>
                            <button onClick={() => removeSet(ex.id, s.id)} className="text-slate-400 hover:text-red-500 p-1"><XIcon className="w-5 h-5"/></button>
                          </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-slate-400">
                            {pb && <p>PB: {pb.maxWeight} lbs</p>}
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
        </div>
    );
  }

  if (stage === "summary") {
    return (
      <div className="p-4 bg-brand-dark min-h-screen flex flex-col justify-between">
        <div>
            <h2 className="text-3xl font-bold mb-2 text-center">Workout Complete!</h2>
            <p className="text-center text-slate-400 mb-8">{finalWorkoutSession?.name}</p>

            <div className="grid grid-cols-2 gap-4 text-center mb-8">
                <div className="bg-brand-surface p-4 rounded-lg">
                    <p className="text-2xl font-bold">{formatDuration(endTime - startTime)}</p>
                    <p className="text-sm text-slate-400">Duration</p>
                </div>
                <div className="bg-brand-surface p-4 rounded-lg">
                    <p className="text-2xl font-bold">{totalVolume.toLocaleString()}<span className="text-base text-slate-400"> lbs</span></p>
                    <p className="text-sm text-slate-400">Total Volume</p>
                </div>
            </div>

            {userLevel >= 3 && previousWorkout && (
                <div className="bg-brand-surface p-4 rounded-lg mb-8">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><TrophyIcon className="w-5 h-5 text-yellow-400"/> Progressive Overload</h3>
                    <p>
                        Total volume was <span className={`font-bold ${volumeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{volumeChange.toFixed(1)}% {volumeChange >= 0 ? 'higher' : 'lower'}</span> than your last {finalWorkoutSession?.type} workout.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Previous: {prevTotalVolume.toLocaleString()} lbs</p>
                    <h4 className="font-semibold mt-4 mb-2">Next Time Suggestions:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
                        {finalWorkoutSession?.loggedExercises.slice(0, 2).map(ex => {
                            const sets = ex.sets;
                            if (sets.length === 0) return null;
                            const avgWeight = sets.reduce((sum, s) => sum + s.weight, 0) / sets.length;
                            const targetWeight = (avgWeight * 1.025).toFixed(1).replace(/\.0$/, '');
                            return <li key={ex.id}>For {getExerciseName(ex.exerciseId)}, aim for {sets[0].reps} reps at ~{targetWeight} lbs.</li>
                        })}
                    </ul>
                </div>
            )}
        </div>
        <button onClick={onCancel} className="w-full bg-brand-cyan text-brand-dark py-4 rounded-lg font-bold">Done</button>
      </div>
    );
  }
  
  return null;
};

export default WorkoutTracker;
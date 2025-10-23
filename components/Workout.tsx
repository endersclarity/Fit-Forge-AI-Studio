
import React, { useState, useEffect, useMemo } from 'react';
import { EXERCISE_LIBRARY } from '../constants';
import { Exercise, ExerciseCategory, LoggedExercise, LoggedSet, WorkoutSession, PersonalBests, UserProfile } from '../types';
import { calculateVolume, findPreviousWorkout, formatDuration, getUserLevel } from '../utils/helpers';
import { PlusIcon, TrophyIcon, XIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';

type WorkoutStage = "setup" | "tracking" | "summary";

interface WorkoutProps {
  onFinishWorkout: (session: WorkoutSession) => void;
  onCancel: () => void;
  allWorkouts: WorkoutSession[];
  personalBests: PersonalBests;
  userProfile: UserProfile;
}

const ExerciseSelector: React.FC<{ onSelect: (exercise: Exercise) => void, onDone: () => void }> = ({ onSelect, onDone }) => {
    const [filter, setFilter] = useState<ExerciseCategory | 'All'>('All');
    
    const filteredExercises = useMemo(() => {
        if (filter === 'All') return EXERCISE_LIBRARY;
        return EXERCISE_LIBRARY.filter(ex => ex.category === filter);
    }, [filter]);

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

const WorkoutTracker: React.FC<WorkoutProps> = ({ onFinishWorkout, onCancel, allWorkouts, personalBests, userProfile }) => {
  const [stage, setStage] = useState<WorkoutStage>("setup");
  const [workoutName, setWorkoutName] = useState("");
  const [workoutType, setWorkoutType] = useState<ExerciseCategory>("Push");
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [isExerciseSelectorOpen, setExerciseSelectorOpen] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const [finalWorkoutSession, setFinalWorkoutSession] = useState<WorkoutSession | null>(null);

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

    setLoggedExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      } : ex
    ));
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
    const session: WorkoutSession = {
      id: `workout-${startTime}`,
      name: workoutName,
      type: workoutType,
      startTime,
      endTime: end,
      loggedExercises,
    };
    setFinalWorkoutSession(session);
    onFinishWorkout(session);
    setStage("summary");
  };

  const getExerciseName = (exerciseId: string) => EXERCISE_LIBRARY.find(e => e.id === exerciseId)?.name || 'Unknown Exercise';

  const userLevel = getUserLevel(allWorkouts.length).level;
  const previousWorkout = finalWorkoutSession ? findPreviousWorkout(finalWorkoutSession, allWorkouts) : null;
  const totalVolume = finalWorkoutSession?.loggedExercises.reduce((total, ex) => total + ex.sets.reduce((exTotal, s) => exTotal + calculateVolume(s.reps, s.weight), 0), 0) || 0;
  const prevTotalVolume = previousWorkout?.loggedExercises.reduce((total, ex) => total + ex.sets.reduce((exTotal, s) => exTotal + calculateVolume(s.reps, s.weight), 0), 0) || 0;
  const volumeChange = prevTotalVolume > 0 ? ((totalVolume - prevTotalVolume) / prevTotalVolume) * 100 : 0;


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
                <p className="text-sm text-slate-400">{workoutType} Day</p>
            </div>
            <button onClick={finishWorkout} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg">Finish</button>
          </header>
          <div className="flex-grow space-y-3 overflow-y-auto">
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
                    <div className="grid grid-cols-5 gap-2 text-center text-xs text-slate-400 font-semibold mb-2">
                        <span className="col-span-1">Set</span>
                        <span className="col-span-2">Weight (lbs)</span>
                        <span className="col-span-1">Reps</span>
                        <span className="col-span-1"></span>
                    </div>
                    {ex.sets.map((s, i) => (
                      <div key={s.id} className="grid grid-cols-5 gap-2 items-center mb-2">
                          <span className="text-center font-bold text-slate-300">{i + 1}</span>
                          <div className="col-span-2">
                            <input type="number" step="0.25" value={s.weight} onChange={e => updateSet(ex.id, s.id, 'weight', parseFloat(e.target.value))} className="w-full text-center bg-brand-dark rounded-md p-2" />
                          </div>
                          <div className="col-span-1">
                            <input type="number" value={s.reps} onChange={e => updateSet(ex.id, s.id, 'reps', parseInt(e.target.value))} className="w-full text-center bg-brand-dark rounded-md p-2" />
                          </div>
                          <button onClick={() => removeSet(ex.id, s.id)} className="col-span-1 flex justify-center text-slate-400 hover:text-red-500"><XIcon className="w-5 h-5"/></button>
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
            <button onClick={() => setExerciseSelectorOpen(true)} className="w-full border-2 border-dashed border-brand-muted text-brand-muted py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <PlusIcon className="w-5 h-5"/> Add Exercise
            </button>
          </div>
          {isExerciseSelectorOpen && <ExerciseSelector onSelect={addExercise} onDone={() => setExerciseSelectorOpen(false)} />}
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

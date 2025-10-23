
import React, { useState, useMemo } from 'react';
import { ALL_MUSCLES, EXERCISE_LIBRARY } from '../constants';
// Fix: Added MuscleBaselines import
import { Muscle, MuscleStates, UserProfile, WorkoutSession, MuscleBaselines, LoggedExercise } from '../types';
import { calculateRecoveryPercentage, getDaysSince, getRecoveryColor, getUserLevel, formatDuration } from '../utils/helpers';
// Fix: Added ChevronDownIcon and ChevronUpIcon imports
import { DumbbellIcon, UserIcon, TrophyIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

interface DashboardProps {
  profile: UserProfile;
  workouts: WorkoutSession[];
  muscleStates: MuscleStates;
  onStartWorkout: () => void;
  onNavigateToProfile: () => void;
  onNavigateToBests: () => void;
}

const MuscleRecoveryVisualizer: React.FC<{ muscleStates: MuscleStates, workouts: WorkoutSession[] }> = ({ muscleStates, workouts }) => {
  const [expandedMuscle, setExpandedMuscle] = useState<Muscle | null>(null);

  const muscleBaselines: MuscleBaselines = useMemo(() => {
    try {
      const item = window.localStorage.getItem('fitforge-muscle-baselines');
      return item ? JSON.parse(item) : {};
    } catch (error) {
      console.error("Failed to parse muscle baselines from localStorage", error);
      return {};
    }
  }, []);

  const muscleData = useMemo(() => {
    return ALL_MUSCLES.map(muscle => {
      const status = muscleStates[muscle];
      if (!status || !status.lastTrained) {
        return { muscle, daysSince: Infinity, recovery: 100, recoveryDaysNeeded: 0 };
      }
      const daysSince = getDaysSince(status.lastTrained);
      const recovery = calculateRecoveryPercentage(daysSince, status.recoveryDaysNeeded);
      return { muscle, daysSince: Math.floor(daysSince), recovery, recoveryDaysNeeded: status.recoveryDaysNeeded };
    }).sort((a, b) => {
        if (a.daysSince === Infinity && b.daysSince !== Infinity) return 1;
        if (b.daysSince === Infinity && a.daysSince !== Infinity) return -1;
        if (a.daysSince === Infinity && b.daysSince === Infinity) return 0;
        return a.recovery - b.recovery;
    });
  }, [muscleStates]);

  const getExpandedDetails = (muscle: Muscle) => {
    const baselineData = muscleBaselines[muscle] || { userOverride: null, systemLearnedMax: 0 };
    const baselineCapacity = baselineData.userOverride || baselineData.systemLearnedMax;

    const lastWorkoutForMuscle = workouts
        .filter(w => w.muscleFatigueHistory && w.muscleFatigueHistory[muscle])
        .sort((a, b) => b.endTime - a.endTime)[0];

    let lastSessionVolume = 0;
    if (lastWorkoutForMuscle && lastWorkoutForMuscle.muscleFatigueHistory) {
        const fatiguePercent = lastWorkoutForMuscle.muscleFatigueHistory[muscle]!;
        // Avoid division by zero if baseline is 0
        const baselineForCalc = baselineCapacity > 0 ? baselineCapacity : 1; 
        lastSessionVolume = (fatiguePercent / 100) * baselineForCalc;
    }

    const maxVolume = baselineData.systemLearnedMax;

    return { baselineCapacity, lastSessionVolume, maxVolume };
  };

  return (
    <div className="space-y-2">
      {muscleData.map(({ muscle, daysSince, recovery, recoveryDaysNeeded }) => {
        const isExpanded = expandedMuscle === muscle;
        const daysUntilReady = Math.max(0, Math.ceil(recoveryDaysNeeded - daysSince));
        const details = isExpanded ? getExpandedDetails(muscle) : null;
        
        return (
          <div key={muscle} className="bg-brand-muted rounded-md">
            <button
              onClick={() => setExpandedMuscle(isExpanded ? null : muscle)}
              className="w-full text-left p-3 focus:outline-none"
              aria-expanded={isExpanded}
              aria-controls={`details-${muscle}`}
            >
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium">{muscle}</span>
                <span className="text-slate-400">{recovery < 100 ? `${recovery.toFixed(0)}% Recovered` : 'Fully Recovered'}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2.5">
                <div className={`${getRecoveryColor(recovery)} h-2.5 rounded-full`} style={{ width: `${recovery}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                <span>{daysSince !== Infinity ? `Last trained: ${daysSince}d ago` : 'Not trained yet'}</span>
                 <span>
                    {daysSince !== Infinity ? (
                        recovery < 100 ? `Ready in: ~${daysUntilReady}d` : <span className="text-green-400 font-semibold">Ready now</span>
                    ) : ''}
                </span>
              </div>
            </button>
            <div 
              id={`details-${muscle}`}
              className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    {details && (
                        <div className="p-3 pt-2 border-t border-slate-600/50 text-xs">
                           <div className="flex justify-between items-center py-1">
                               <span className="text-slate-400">Baseline Capacity:</span>
                               <span className="font-semibold">{details.baselineCapacity.toLocaleString()} lbs</span>
                           </div>
                           <div className="flex justify-between items-center py-1">
                               <span className="text-slate-400">Last Session Volume:</span>
                               <span className="font-semibold">{details.lastSessionVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} lbs</span>
                           </div>
                           <div className="flex justify-between items-center py-1">
                               <span className="text-slate-400">All-Time Max Volume:</span>
                               <span className="font-semibold">{details.maxVolume.toLocaleString()} lbs</span>
                           </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        )
      })}
    </div>
  );
};

const WorkoutHistory: React.FC<{ workouts: WorkoutSession[] }> = ({ workouts }) => {
    const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

    const getExerciseName = (id: string) => EXERCISE_LIBRARY.find(e => e.id === id)?.name || 'Unknown Exercise';

    if (workouts.length === 0) {
        return <p className="text-slate-400 text-center py-4">No workouts logged yet. Let's get started!</p>;
    }

    return (
        <div className="space-y-3">
            {workouts.slice().sort((a,b) => b.endTime - a.endTime).slice(0,5).map(workout => {
                const isExpanded = expandedWorkoutId === workout.id;
                return (
                    <div key={workout.id} className="bg-brand-muted rounded-md">
                        <button onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)} className="w-full text-left p-3 focus:outline-none">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{workout.name}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                                        <p>{workout.type} Day {workout.variation && `(${workout.variation})`}</p>
                                        <span>&bull;</span>
                                        <p>{formatDuration(workout.endTime - workout.startTime)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <p className="text-sm text-slate-400">{new Date(workout.endTime).toLocaleDateString()}</p>
                                    {isExpanded ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
                                </div>
                            </div>
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                            <div className="overflow-hidden">
                                <div className="p-3 pt-2 border-t border-slate-600/50 text-xs">
                                    {workout.loggedExercises.map((ex: LoggedExercise) => (
                                        <div key={ex.id} className="mb-2 last:mb-0">
                                            <p className="font-semibold text-slate-300">{getExerciseName(ex.exerciseId)}</p>
                                            <ul className="list-disc list-inside pl-2 text-slate-400">
                                                {ex.sets.map((set, i) => (
                                                    <li key={set.id}>
                                                        Set {i + 1}: {set.bodyweightAtTime 
                                                            ? `Bodyweight (${set.weight} lbs)` 
                                                            : `${set.weight} lbs`} x {set.reps} reps
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ profile, workouts, muscleStates, onStartWorkout, onNavigateToProfile, onNavigateToBests }) => {
  const { level, progress, nextLevelWorkouts } = getUserLevel(workouts.length);

  return (
    <div className="p-4 md:p-6 min-h-screen bg-brand-dark space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
            <DumbbellIcon className="w-8 h-8 text-brand-cyan" />
            <h1 className="text-2xl font-bold tracking-tight">FitForge</h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onNavigateToBests} className="p-2 rounded-full hover:bg-brand-surface">
                <TrophyIcon className="w-6 h-6 text-yellow-400"/>
            </button>
            <button onClick={onNavigateToProfile} className="p-2 rounded-full hover:bg-brand-surface">
                <UserIcon className="w-6 h-6"/>
            </button>
        </div>
      </header>

      <main className="space-y-8">
        <section className="bg-brand-surface p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-1">Welcome back, {profile.name || 'Athlete'}!</h2>
          <p className="text-slate-400 mb-4">You are Level {level}. Ready to forge your strength?</p>
          <div className="w-full bg-brand-muted rounded-full h-2.5">
            <div className="bg-brand-cyan h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">
            {level < 4 ? `${nextLevelWorkouts - workouts.length} workouts to Level ${level + 1}` : "Max level reached!"}
          </p>
        </section>

        <section>
            <button
                onClick={onStartWorkout}
                className="w-full bg-brand-cyan text-brand-dark font-bold py-4 px-4 rounded-lg text-lg hover:bg-cyan-400 transition-colors"
            >
                Start New Workout
            </button>
        </section>

        <section className="bg-brand-surface p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Muscle Recovery</h3>
            <MuscleRecoveryVisualizer muscleStates={muscleStates} workouts={workouts} />
        </section>

        <section className="bg-brand-surface p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Workout History</h3>
            <WorkoutHistory workouts={workouts} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { ALL_MUSCLES } from '../constants';
import { Muscle, MuscleStates, UserProfile, WorkoutSession } from '../types';
import { calculateRecoveryPercentage, getDaysSince, getRecoveryColor, getUserLevel, formatDuration } from '../utils/helpers';
import { DumbbellIcon, UserIcon, TrophyIcon } from './Icons';

interface DashboardProps {
  profile: UserProfile;
  workouts: WorkoutSession[];
  muscleStates: MuscleStates;
  onStartWorkout: () => void;
  onNavigateToProfile: () => void;
  onNavigateToBests: () => void;
}

const MuscleRecoveryVisualizer: React.FC<{ muscleStates: MuscleStates }> = ({ muscleStates }) => {
  const muscleData = ALL_MUSCLES.map(muscle => {
    const status = muscleStates[muscle];
    if (!status || !status.lastTrained) {
      return { muscle, daysSince: Infinity, recovery: 100 };
    }
    const daysSince = getDaysSince(status.lastTrained);
    const recovery = calculateRecoveryPercentage(daysSince, status.recoveryDaysNeeded);
    return { muscle, daysSince: Math.floor(daysSince), recovery };
  }).sort((a, b) => a.recovery - b.recovery);

  return (
    <div className="space-y-3">
      {muscleData.map(({ muscle, daysSince, recovery }) => (
        <div key={muscle}>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-medium">{muscle}</span>
            <span className="text-slate-400">{recovery === 100 ? 'Fully Recovered' : `${recovery.toFixed(0)}% Recovered`}</span>
          </div>
          <div className="w-full bg-brand-muted rounded-full h-2.5">
            <div className={`${getRecoveryColor(recovery)} h-2.5 rounded-full`} style={{ width: `${recovery}%` }}></div>
          </div>
          <div className="text-right text-xs text-slate-500 mt-1">
            {daysSince !== Infinity ? `Last trained ${daysSince}d ago` : 'Not trained yet'}
          </div>
        </div>
      ))}
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
            <MuscleRecoveryVisualizer muscleStates={muscleStates} />
        </section>

        <section className="bg-brand-surface p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Workout History</h3>
            {workouts.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No workouts logged yet. Let's get started!</p>
            ) : (
                <div className="space-y-3">
                    {workouts.slice().sort((a,b) => b.endTime - a.endTime).slice(0,5).map(workout => (
                        <div key={workout.id} className="bg-brand-muted p-3 rounded-md">
                           <div className="flex justify-between items-center">
                                <p className="font-semibold">{workout.name}</p>
                                <p className="text-sm text-slate-400">{new Date(workout.endTime).toLocaleDateString()}</p>
                           </div>
                           <div className="flex justify-between items-center text-xs text-slate-300 mt-1">
                                <p>{workout.type} Day {workout.variation && `(${workout.variation})`}</p>
                                <p>Duration: {formatDuration(workout.endTime - workout.startTime)}</p>
                           </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

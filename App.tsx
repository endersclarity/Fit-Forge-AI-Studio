
import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ALL_MUSCLES, EXERCISE_LIBRARY } from './constants';
import { UserProfile, WorkoutSession, MuscleAnalytics, PersonalBests, Muscle } from './types';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/Workout';
import { calculateVolume } from './utils/helpers';

type View = "dashboard" | "workout";

const App: React.FC = () => {
  const [view, setView] = useState<View>("dashboard");
  const [profile, setProfile] = useLocalStorage<UserProfile>('fitforge-profile', { name: '', experience: 'Beginner' });
  const [workouts, setWorkouts] = useLocalStorage<WorkoutSession[]>('fitforge-workouts', []);
  const [muscleAnalytics, setMuscleAnalytics] = useLocalStorage<MuscleAnalytics>('fitforge-muscle-analytics', 
    ALL_MUSCLES.reduce((acc, muscle) => ({ ...acc, [muscle]: { lastTrained: 0, lastVolume: 0 } }), {} as MuscleAnalytics)
  );
  const [personalBests, setPersonalBests] = useLocalStorage<PersonalBests>('fitforge-pbs', {});

  const handleFinishWorkout = useCallback((session: WorkoutSession) => {
    // 1. Add workout to history
    setWorkouts(prev => [...prev, session]);

    // 2. Update muscle analytics
    const workoutMuscleVolumes: Record<Muscle, number> = ALL_MUSCLES.reduce((acc, muscle) => ({ ...acc, [muscle]: 0 }), {} as Record<Muscle, number>);

    session.loggedExercises.forEach(loggedEx => {
      const exerciseInfo = EXERCISE_LIBRARY.find(e => e.id === loggedEx.exerciseId);
      if (!exerciseInfo) return;
      
      const exerciseVolume = loggedEx.sets.reduce((total, set) => total + calculateVolume(set.reps, set.weight), 0);
      
      exerciseInfo.muscleEngagements.forEach(engagement => {
        workoutMuscleVolumes[engagement.muscle] += exerciseVolume * (engagement.percentage / 100);
      });
    });

    const newAnalytics = { ...muscleAnalytics };
    Object.entries(workoutMuscleVolumes).forEach(([muscle, volume]) => {
      if (volume > 0) {
        newAnalytics[muscle as Muscle] = {
          lastTrained: session.endTime,
          lastVolume: volume,
        };
      }
    });
    setMuscleAnalytics(newAnalytics);

    // 3. Update personal bests
    const newPbs = { ...personalBests };
    session.loggedExercises.forEach(loggedEx => {
        const currentPb = newPbs[loggedEx.exerciseId] || { maxWeight: 0, maxVolume: 0 };
        const exerciseVolume = loggedEx.sets.reduce((total, set) => total + calculateVolume(set.reps, set.weight), 0);
        const maxWeightInSession = Math.max(...loggedEx.sets.map(s => s.weight), 0);
        
        let updated = false;
        if (maxWeightInSession > currentPb.maxWeight) {
            currentPb.maxWeight = maxWeightInSession;
            updated = true;
        }
        if (exerciseVolume > currentPb.maxVolume) {
            currentPb.maxVolume = exerciseVolume;
            updated = true;
        }

        if (updated) {
            newPbs[loggedEx.exerciseId] = currentPb;
        }
    });
    setPersonalBests(newPbs);

    // View is handled by the Workout component itself, just need to provide the cancel function
  }, [workouts, muscleAnalytics, personalBests, setWorkouts, setMuscleAnalytics, setPersonalBests]);

  const startWorkout = () => setView("workout");
  const backToDashboard = () => setView("dashboard");
  
  return (
    <div className="max-w-2xl mx-auto">
      {view === 'dashboard' && (
        <Dashboard 
          profile={profile} 
          setProfile={setProfile}
          workouts={workouts} 
          muscleAnalytics={muscleAnalytics} 
          onStartWorkout={startWorkout}
        />
      )}
      {view === 'workout' && (
        <WorkoutTracker 
          onFinishWorkout={handleFinishWorkout} 
          onCancel={backToDashboard}
          allWorkouts={workouts}
          personalBests={personalBests}
          userProfile={profile}
        />
      )}
    </div>
  );
};

export default App;

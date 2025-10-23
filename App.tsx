import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ALL_MUSCLES, EXERCISE_LIBRARY } from './constants';
import { UserProfile, WorkoutSession, MuscleAnalytics, PersonalBests, Muscle, MuscleBaselines, MuscleBaseline } from './types';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/Workout';
import Profile from './components/Profile';
import { calculateVolume } from './utils/helpers';

type View = "dashboard" | "workout" | "profile";

const App: React.FC = () => {
  const [view, setView] = useState<View>("dashboard");
  const [profile, setProfile] = useLocalStorage<UserProfile>('fitforge-profile', { name: 'Athlete', experience: 'Beginner', bodyweightHistory: [], equipment: [] });
  const [workouts, setWorkouts] = useLocalStorage<WorkoutSession[]>('fitforge-workouts', []);
  const [muscleAnalytics, setMuscleAnalytics] = useLocalStorage<MuscleAnalytics>('fitforge-muscle-analytics', 
    ALL_MUSCLES.reduce((acc, muscle) => ({ ...acc, [muscle]: { lastTrained: 0, lastVolume: 0 } }), {} as MuscleAnalytics)
  );
  const [personalBests, setPersonalBests] = useLocalStorage<PersonalBests>('fitforge-pbs', {});
  const [muscleBaselines, setMuscleBaselines] = useLocalStorage<MuscleBaselines>('fitforge-muscle-baselines',
    ALL_MUSCLES.reduce((acc, muscle) => ({ ...acc, [muscle]: { userOverride: null, systemLearnedMax: 0 } }), {} as MuscleBaselines)
  );

  const handleFinishWorkout = useCallback((session: WorkoutSession) => {
    setWorkouts(prev => [...prev, session]);

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
    
    // Update system learned max in muscle baselines
    setMuscleBaselines(prevBaselines => {
        const newBaselines = { ...prevBaselines };
        let updated = false;
        Object.entries(workoutMuscleVolumes).forEach(([muscle, volume]) => {
            if (volume > newBaselines[muscle as Muscle].systemLearnedMax) {
                newBaselines[muscle as Muscle].systemLearnedMax = Math.round(volume);
                updated = true;
            }
        });
        return updated ? newBaselines : prevBaselines;
    });


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

  }, [muscleAnalytics, personalBests, setWorkouts, setMuscleAnalytics, setPersonalBests, setMuscleBaselines]);

  const navigateTo = (newView: View) => setView(newView);
  
  const renderContent = () => {
    switch(view) {
        case 'dashboard':
            return <Dashboard 
                      profile={profile} 
                      workouts={workouts} 
                      muscleAnalytics={muscleAnalytics} 
                      onStartWorkout={() => navigateTo('workout')}
                      onNavigateToProfile={() => navigateTo('profile')}
                    />;
        case 'workout':
            return <WorkoutTracker 
                      onFinishWorkout={handleFinishWorkout} 
                      onCancel={() => navigateTo('dashboard')}
                      allWorkouts={workouts}
                      personalBests={personalBests}
                      userProfile={profile}
                    />;
        case 'profile':
            return <Profile
                      profile={profile}
                      setProfile={setProfile}
                      muscleBaselines={muscleBaselines}
                      setMuscleBaselines={setMuscleBaselines}
                      onBack={() => navigateTo('dashboard')}
                    />;
        default:
            return <Dashboard 
                      profile={profile} 
                      workouts={workouts} 
                      muscleAnalytics={muscleAnalytics} 
                      onStartWorkout={() => navigateTo('workout')}
                      onNavigateToProfile={() => navigateTo('profile')}
                    />;
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {renderContent()}
    </div>
  );
};

export default App;
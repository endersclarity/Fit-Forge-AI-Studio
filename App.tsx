import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ALL_MUSCLES, EXERCISE_LIBRARY } from './constants';
import { UserProfile, WorkoutSession, PersonalBests, Muscle, MuscleBaselines, MuscleStates } from './types';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/Workout';
import Profile from './components/Profile';
import PersonalBestsComponent from './components/PersonalBests';
import Toast from './components/Toast';
import { calculateVolume } from './utils/helpers';

type View = "dashboard" | "workout" | "profile" | "bests";

const App: React.FC = () => {
  const [view, setView] = useState<View>("dashboard");
  const [profile, setProfile] = useLocalStorage<UserProfile>('fitforge-profile', { name: 'Athlete', experience: 'Beginner', bodyweightHistory: [], equipment: [] });
  const [workouts, setWorkouts] = useLocalStorage<WorkoutSession[]>('fitforge-workouts', []);
  const [muscleStates, setMuscleStates] = useLocalStorage<MuscleStates>('fitforge-muscle-states', 
    ALL_MUSCLES.reduce((acc, muscle) => ({ ...acc, [muscle]: { lastTrained: 0, fatiguePercentage: 0, recoveryDaysNeeded: 0 } }), {} as MuscleStates)
  );
  const [personalBests, setPersonalBests] = useLocalStorage<PersonalBests>('fitforge-pbs', {});
  const [muscleBaselines, setMuscleBaselines] = useLocalStorage<MuscleBaselines>('fitforge-muscle-baselines',
    ALL_MUSCLES.reduce((acc, muscle) => ({ ...acc, [muscle]: { userOverride: null, systemLearnedMax: 0 } }), {} as MuscleBaselines)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleFinishWorkout = useCallback((session: WorkoutSession) => {
    // 1. Calculate muscle volumes for this session
    const workoutMuscleVolumes: Record<Muscle, number> = ALL_MUSCLES.reduce((acc, muscle) => ({ ...acc, [muscle]: 0 }), {} as Record<Muscle, number>);
    session.loggedExercises.forEach(loggedEx => {
      const exerciseInfo = EXERCISE_LIBRARY.find(e => e.id === loggedEx.exerciseId);
      if (!exerciseInfo) return;
      const exerciseVolume = loggedEx.sets.reduce((total, set) => total + calculateVolume(set.reps, set.weight), 0);
      exerciseInfo.muscleEngagements.forEach(engagement => {
        workoutMuscleVolumes[engagement.muscle] += exerciseVolume * (engagement.percentage / 100);
      });
    });

    // 2. Calculate fatigue and update baselines
    const muscleFatigue: Partial<Record<Muscle, number>> = {};
    const newBaselines = { ...muscleBaselines };
    Object.entries(workoutMuscleVolumes).forEach(([muscleStr, volume]) => {
      if (volume <= 0) return;
      const muscle = muscleStr as Muscle;
      const baseline = newBaselines[muscle]?.userOverride || newBaselines[muscle]?.systemLearnedMax || 10000; // default fallback
      const fatiguePercent = Math.min((volume / baseline) * 100, 100);
      muscleFatigue[muscle] = fatiguePercent;

      if (volume > (newBaselines[muscle]?.systemLearnedMax || 0)) {
        newBaselines[muscle].systemLearnedMax = Math.round(volume);
        setToastMessage(`New ${muscle} max: ${Math.round(volume).toLocaleString()} lbs!`);
      }
    });
    setMuscleBaselines(newBaselines);
    session.muscleFatigueHistory = muscleFatigue;

    // 3. Update Muscle States with new fatigue and recovery info
    const newMuscleStates = { ...muscleStates };
    Object.entries(muscleFatigue).forEach(([muscleStr, fatigue]) => {
        const muscle = muscleStr as Muscle;
        // Recovery formula: 1 base day + up to 6 days based on fatigue
        const recoveryDays = 1 + (fatigue / 100) * 6; 
        newMuscleStates[muscle] = {
            lastTrained: session.endTime,
            fatiguePercentage: fatigue,
            recoveryDaysNeeded: recoveryDays
        };
    });
    setMuscleStates(newMuscleStates);

    // 4. Update Workout History
    setWorkouts(prev => [...prev, session]);

    // 5. Update Personal Bests
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

  }, [personalBests, muscleBaselines, muscleStates, setWorkouts, setPersonalBests, setMuscleBaselines, setMuscleStates]);

  const navigateTo = (newView: View) => setView(newView);
  
  const renderContent = () => {
    switch(view) {
        case 'dashboard':
            return <Dashboard 
                      profile={profile} 
                      workouts={workouts} 
                      muscleStates={muscleStates} 
                      onStartWorkout={() => navigateTo('workout')}
                      onNavigateToProfile={() => navigateTo('profile')}
                      onNavigateToBests={() => navigateTo('bests')}
                    />;
        case 'workout':
            return <WorkoutTracker 
                      onFinishWorkout={handleFinishWorkout} 
                      onCancel={() => navigateTo('dashboard')}
                      allWorkouts={workouts}
                      personalBests={personalBests}
                      userProfile={profile}
                      muscleBaselines={muscleBaselines}
                    />;
        case 'profile':
            return <Profile
                      profile={profile}
                      setProfile={setProfile}
                      muscleBaselines={muscleBaselines}
                      setMuscleBaselines={setMuscleBaselines}
                      onBack={() => navigateTo('dashboard')}
                    />;
        case 'bests':
            return <PersonalBestsComponent
                      personalBests={personalBests}
                      onBack={() => navigateTo('dashboard')}
                    />;
        default:
            return <Dashboard 
                      profile={profile} 
                      workouts={workouts} 
                      muscleStates={muscleStates} 
                      onStartWorkout={() => navigateTo('workout')}
                      onNavigateToProfile={() => navigateTo('profile')}
                      onNavigateToBests={() => navigateTo('bests')}
                    />;
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {renderContent()}
    </div>
  );
};

export default App;
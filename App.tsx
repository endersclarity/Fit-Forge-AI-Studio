
import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ALL_MUSCLES, EXERCISE_LIBRARY } from './constants';
import { UserProfile, WorkoutSession, PersonalBests, Muscle, MuscleBaselines, MuscleStates, ExerciseCategory, Exercise, Variation, ExerciseMaxes } from './types';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/Workout';
import Profile from './components/Profile';
import PersonalBestsComponent from './components/PersonalBests';
import Toast from './components/Toast';
import { calculateVolume } from './utils/helpers';

type View = "dashboard" | "workout" | "profile" | "bests";

export interface RecommendedWorkoutData {
    type: ExerciseCategory;
    variation: Variation;
    suggestedExercises: Exercise[];
}

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
  const [recommendedWorkout, setRecommendedWorkout] = useState<RecommendedWorkoutData | null>(null);


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
    
    const allWorkoutsIncludingCurrent = [...workouts, session];

    // 4. Update Personal Bests with new detailed metrics
    const newPbs = { ...personalBests };
    session.loggedExercises.forEach(loggedEx => {
        const exerciseId = loggedEx.exerciseId;
        const currentPb = newPbs[exerciseId] || { bestSingleSet: 0, bestSessionVolume: 0, rollingAverageMax: 0 };
        
        // Calculate metrics for the current session
        const sessionVolume = loggedEx.sets.reduce((total, set) => total + calculateVolume(set.reps, set.weight), 0);
        const bestSetInSession = Math.max(...loggedEx.sets.map(s => calculateVolume(s.reps, s.weight)), 0);
        
        // Update best single set and session volume
        const newBestSingleSet = Math.max(currentPb.bestSingleSet, bestSetInSession);
        const newBestSessionVolume = Math.max(currentPb.bestSessionVolume, sessionVolume);

        // Calculate new rolling average max
        const workoutsWithExercise = allWorkoutsIncludingCurrent
            .filter(w => w.loggedExercises.some(e => e.exerciseId === exerciseId))
            .sort((a, b) => b.endTime - a.endTime);
        
        const last5Workouts = workoutsWithExercise.slice(0, 5);
        
        const bestSetsFromLast5 = last5Workouts.map(w => {
            const ex = w.loggedExercises.find(e => e.exerciseId === exerciseId);
            if (!ex || ex.sets.length === 0) return 0;
            return Math.max(...ex.sets.map(s => calculateVolume(s.reps, s.weight)));
        });

        const newRollingAverage = bestSetsFromLast5.length > 0
            ? bestSetsFromLast5.reduce((a, b) => a + b, 0) / bestSetsFromLast5.length
            : 0;

        newPbs[exerciseId] = {
            bestSingleSet: newBestSingleSet,
            bestSessionVolume: newBestSessionVolume,
            rollingAverageMax: newRollingAverage
        };
    });
    setPersonalBests(newPbs);
    
    // 5. Update Workout History (must be after PB calculations that use it)
    setWorkouts(allWorkoutsIncludingCurrent);
    
    setRecommendedWorkout(null);

  }, [personalBests, muscleBaselines, muscleStates, workouts, setWorkouts, setPersonalBests, setMuscleBaselines, setMuscleStates]);

  const navigateTo = (newView: View) => setView(newView);

  const handleStartRecommendedWorkout = useCallback((data: RecommendedWorkoutData) => {
    setRecommendedWorkout(data);
    setView('workout');
  }, []);

  const handleCancelWorkout = useCallback(() => {
    setRecommendedWorkout(null);
    setView('dashboard');
  }, []);
  
  const renderContent = () => {
    switch(view) {
        case 'dashboard':
            return <Dashboard 
                      profile={profile} 
                      workouts={workouts} 
                      muscleStates={muscleStates} 
                      muscleBaselines={muscleBaselines}
                      onStartWorkout={() => navigateTo('workout')}
                      onStartRecommendedWorkout={handleStartRecommendedWorkout}
                      onNavigateToProfile={() => navigateTo('profile')}
                      onNavigateToBests={() => navigateTo('bests')}
                    />;
        case 'workout':
            return <WorkoutTracker 
                      onFinishWorkout={handleFinishWorkout} 
                      onCancel={handleCancelWorkout}
                      allWorkouts={workouts}
                      personalBests={personalBests}
                      userProfile={profile}
                      muscleBaselines={muscleBaselines}
                      initialData={recommendedWorkout}
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
                      muscleBaselines={muscleBaselines}
                      onStartWorkout={() => navigateTo('workout')}
                      onStartRecommendedWorkout={handleStartRecommendedWorkout}
                      // Fix: Corrected syntax error from "navigate to" to "navigateTo"
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

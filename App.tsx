
import React, { useState, useCallback, useEffect } from 'react';
import { useAPIState } from './hooks/useAPIState';
import { profileAPI, workoutsAPI, muscleStatesAPI, personalBestsAPI, muscleBaselinesAPI, templatesAPI } from './api';
import { ALL_MUSCLES, EXERCISE_LIBRARY } from './constants';
import { UserProfile, WorkoutSession, PersonalBests, Muscle, MuscleBaselines, ExerciseCategory, Exercise, Variation, ExerciseMaxes, WorkoutTemplate, PRInfo } from './types';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/Workout';
import Profile from './components/Profile';
import PersonalBestsComponent from './components/PersonalBests';
import WorkoutTemplates from './components/WorkoutTemplates';
import Analytics from './components/Analytics';
import MuscleBaselinesPage from './components/MuscleBaselinesPage';
import Toast from './components/Toast';
import { PRNotificationManager } from './components/PRNotification';
import { ProfileWizard, WizardData } from './components/onboarding/ProfileWizard';
import { calculateVolume } from './utils/helpers';
import { detectProgressionMethod } from './utils/progressionMethodDetector';

type View = "dashboard" | "workout" | "profile" | "bests" | "templates" | "analytics" | "muscle-baselines";

export interface RecommendedWorkoutData {
    type: ExerciseCategory;
    variation: Variation;
    suggestedExercises: Exercise[];
    sourceTemplate?: WorkoutTemplate;
}

const App: React.FC = () => {
  const [view, setView] = useState<View>("dashboard");
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(false);

  // Initialize default values
  const defaultProfile: UserProfile = { name: 'Athlete', experience: 'Beginner', bodyweightHistory: [], equipment: [] };
  const defaultMuscleBaselines: MuscleBaselines = ALL_MUSCLES.reduce((acc, muscle) => ({ ...acc, [muscle]: { userOverride: null, systemLearnedMax: 0 } }), {} as MuscleBaselines);

  // Replace useLocalStorage with useAPIState
  const [profile, setProfile, profileLoading, profileError] = useAPIState<UserProfile>(profileAPI.get, profileAPI.update, defaultProfile);
  const [workouts, setWorkouts, workoutsLoading, workoutsError] = useAPIState<WorkoutSession[]>(workoutsAPI.getAll, async (newWorkouts) => {
    // For workouts, we only create new ones, not replace the entire array
    // Return the new workouts array as-is for local state
    return newWorkouts;
  }, []);
  // Note: muscleStates removed - Dashboard manages its own state via direct API fetch
  const [personalBests, setPersonalBests, personalBestsLoading, personalBestsError] = useAPIState<PersonalBests>(personalBestsAPI.get, personalBestsAPI.update, {});
  const [muscleBaselines, setMuscleBaselines, muscleBaselinesLoading, muscleBaselinesError] = useAPIState<MuscleBaselines>(muscleBaselinesAPI.get, muscleBaselinesAPI.update, defaultMuscleBaselines);
  const [templates, setTemplates, templatesLoading, templatesError] = useAPIState<WorkoutTemplate[]>(templatesAPI.getAll, async (newTemplates) => newTemplates, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recommendedWorkout, setRecommendedWorkout] = useState<RecommendedWorkoutData | null>(null);
  const [prNotifications, setPrNotifications] = useState<PRInfo[]>([]);

  // Detect first-time user (USER_NOT_FOUND error)
  useEffect(() => {
    if (profileError && (profileError as any).code === 'USER_NOT_FOUND') {
      setIsFirstTimeUser(true);
    }
  }, [profileError]);

  const handleFinishWorkout = useCallback(async (session: WorkoutSession) => {
    try {
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
      await setMuscleBaselines(newBaselines);
      session.muscleFatigueHistory = muscleFatigue;

      // 3. Update Muscle States with new fatigue and recovery info
      // Build the muscle state update payload using new API field names
      const muscleUpdates: Record<string, { initial_fatigue_percent: number; last_trained: string; volume_today: number }> = {};
      Object.entries(muscleFatigue).forEach(([muscleStr, fatigue]) => {
          const muscle = muscleStr as Muscle;
          muscleUpdates[muscle] = {
              initial_fatigue_percent: fatigue,
              last_trained: new Date(session.endTime).toISOString(), // Convert to UTC ISO 8601
              volume_today: workoutMuscleVolumes[muscle] || 0
          };
      });

      // Call API to update muscle states
      // Note: Dashboard will auto-refresh on mount to show updated states
      await muscleStatesAPI.updateNew(muscleUpdates);

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
      await setPersonalBests(newPbs);

      // 5. Detect progression method by comparing to last workout
      const category = session.type;
      const lastWorkoutInCategory = workouts
        .filter(w => w.type === category)
        .sort((a, b) => b.endTime - a.endTime)[0] || null;

      const progressionMethod = detectProgressionMethod(session, lastWorkoutInCategory);

      // Add category and progressionMethod to session for API
      const sessionWithMetadata = {
        ...session,
        category,
        progressionMethod
      };

      // 7. Save new workout to database and update local state
      const savedWorkout = await workoutsAPI.create(sessionWithMetadata);
      await setWorkouts(allWorkoutsIncludingCurrent);

      // Display PR notifications if any were detected
      if (savedWorkout.prs && savedWorkout.prs.length > 0) {
        setPrNotifications(savedWorkout.prs);
      }

      // Display toast notification for baseline updates
      if (savedWorkout.updated_baselines && savedWorkout.updated_baselines.length > 0) {
        const muscleNames = savedWorkout.updated_baselines.map(u => u.muscle).join(', ');
        setToastMessage(`🤖 Muscle capacity updated for ${savedWorkout.updated_baselines.length} muscle${savedWorkout.updated_baselines.length > 1 ? 's' : ''}: ${muscleNames}`);
      }

      setRecommendedWorkout(null);
    } catch (error) {
      console.error('Error saving workout:', error);
      setToastMessage('Failed to save workout. Please try again.');
    }

  }, [personalBests, muscleBaselines, workouts, setWorkouts, setPersonalBests, setMuscleBaselines]);

  const navigateTo = (newView: View) => setView(newView);

  const handleStartRecommendedWorkout = useCallback((data: RecommendedWorkoutData) => {
    setRecommendedWorkout(data);
    setView('workout');
  }, []);

  const handleCancelWorkout = useCallback(() => {
    setRecommendedWorkout(null);
    setView('dashboard');
  }, []);

  const handleSelectTemplate = useCallback((template: WorkoutTemplate) => {
    // Convert template to recommended workout format
    const exercises = template.exerciseIds
      .map(id => EXERCISE_LIBRARY.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => ex !== undefined);

    setRecommendedWorkout({
      type: template.category,
      variation: template.variation,
      suggestedExercises: exercises,
      sourceTemplate: template
    });
    setView('workout');
  }, []);
  
  const handleOnboardingComplete = useCallback(async (wizardData: WizardData) => {
    try {
      // Call backend to initialize profile
      await profileAPI.init({
        name: wizardData.name,
        experience: wizardData.experience!,
        equipment: wizardData.equipment,
      });

      // Reload profile and exit onboarding
      setIsFirstTimeUser(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to initialize profile:', error);
      setToastMessage('Failed to create profile. Please try again.');
    }
  }, []);

  const renderContent = () => {
    // Show onboarding for first-time users
    if (isFirstTimeUser) {
      return <ProfileWizard onComplete={handleOnboardingComplete} />;
    }

    // Show loading state while any critical data is loading (but not if first-time user)
    const isLoading = profileLoading || workoutsLoading || muscleBaselinesLoading;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-brand-dark">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
            <p className="mt-4 text-slate-400">Loading your data...</p>
          </div>
        </div>
      );
    }

    // Show error state if any critical API failed (excluding USER_NOT_FOUND which is handled above)
    const hasError = (profileError && (profileError as any).code !== 'USER_NOT_FOUND') || workoutsError || muscleBaselinesError;
    if (hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-brand-dark p-4">
          <div className="text-center bg-brand-surface p-6 rounded-lg max-w-md">
            <p className="text-red-400 font-semibold mb-2">Failed to connect to backend</p>
            <p className="text-slate-400 text-sm mb-4">
              Make sure the backend server is running at http://localhost:3001
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-cyan text-brand-dark px-4 py-2 rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch(view) {
        case 'dashboard':
            return <Dashboard
                      profile={profile}
                      workouts={workouts}
                      muscleBaselines={muscleBaselines}
                      templates={templates}
                      onStartWorkout={() => navigateTo('workout')}
                      onStartRecommendedWorkout={handleStartRecommendedWorkout}
                      onSelectTemplate={handleSelectTemplate}
                      onNavigateToProfile={() => navigateTo('profile')}
                      onNavigateToBests={() => navigateTo('bests')}
                      onNavigateToTemplates={() => navigateTo('templates')}
                      onNavigateToAnalytics={() => navigateTo('analytics')}
                      onNavigateToMuscleBaselines={() => navigateTo('muscle-baselines')}
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
        case 'templates':
            return <WorkoutTemplates
                      onBack={() => navigateTo('dashboard')}
                      onSelectTemplate={handleSelectTemplate}
                    />;
        case 'analytics':
            return <Analytics />;
        case 'muscle-baselines':
            return <MuscleBaselinesPage />;
        default:
            return <Dashboard
                      profile={profile}
                      workouts={workouts}
                      muscleBaselines={muscleBaselines}
                      templates={templates}
                      onStartWorkout={() => navigateTo('workout')}
                      onStartRecommendedWorkout={handleStartRecommendedWorkout}
                      onSelectTemplate={handleSelectTemplate}
                      onNavigateToProfile={() => navigateTo('profile')}
                      onNavigateToBests={() => navigateTo('bests')}
                      onNavigateToTemplates={() => navigateTo('templates')}
                      onNavigateToAnalytics={() => navigateTo('analytics')}
                      onNavigateToMuscleBaselines={() => navigateTo('muscle-baselines')}
                    />;
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {prNotifications.length > 0 && (
        <PRNotificationManager
          prs={prNotifications}
          onDismissAll={() => setPrNotifications([])}
        />
      )}
      {renderContent()}
    </div>
  );
};

export default App;

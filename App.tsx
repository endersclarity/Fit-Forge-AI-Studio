
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAPIState } from './hooks/useAPIState';
import { profileAPI, workoutsAPI, muscleStatesAPI, personalBestsAPI, muscleBaselinesAPI, templatesAPI } from './api';
import { ALL_MUSCLES, EXERCISE_LIBRARY } from './constants';
import { UserProfile, WorkoutSession, PersonalBests, Muscle, MuscleBaselines, ExerciseCategory, Exercise, Variation, ExerciseMaxes, WorkoutTemplate, PRInfo, PlannedExercise } from './types';
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
import BaselineUpdateModal from './components/BaselineUpdateModal';
import UXMockup from './components/ux-mockup';
import { calculateVolume } from './utils/helpers';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotion } from './src/providers/MotionProvider';
import { pageTransitionVariants, SPRING_TRANSITION } from './src/providers/motion-presets';
import { detectProgressionMethod } from './utils/progressionMethodDetector';
import { ThemeToggle } from './components/common/ThemeToggle';
import { SkeletonBlock } from './components/common/SkeletonBlock';

// Accessibility: Load axe-core in development only
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    import('react-dom').then((ReactDOM) => {
      axe.default(React, ReactDOM, 1000);
    });
  });
}

export interface RecommendedWorkoutData {
    type: ExerciseCategory;
    variation: Variation;
    suggestedExercises: Exercise[];
    sourceTemplate?: WorkoutTemplate;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMotionEnabled } = useMotion();

  const wrapPage = useCallback(
    (node: React.ReactNode) =>
      isMotionEnabled ? (
        <motion.div
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={SPRING_TRANSITION}
        >
          {node}
        </motion.div>
      ) : (
        <>{node}</>
      ),
    [isMotionEnabled]
  );
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
  const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[] | null>(null);

  // Baseline update modal state
  const [baselineUpdates, setBaselineUpdates] = useState<Array<{
    muscle: Muscle;
    oldMax: number;
    newMax: number;
    sessionVolume: number;
  }>>([]);
  const [showBaselineModal, setShowBaselineModal] = useState(false);
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

      // 2. Calculate fatigue and collect potential baseline updates
      const muscleFatigue: Partial<Record<Muscle, number>> = {};
      const pendingUpdates: Array<{
        muscle: Muscle;
        oldMax: number;
        newMax: number;
        sessionVolume: number;
      }> = [];

      Object.entries(workoutMuscleVolumes).forEach(([muscleStr, volume]) => {
        if (volume <= 0) return;
        const muscle = muscleStr as Muscle;
        const baseline = muscleBaselines[muscle]?.userOverride || muscleBaselines[muscle]?.systemLearnedMax || 10000; // default fallback
        const fatiguePercent = Math.min((volume / baseline) * 100, 100);
        muscleFatigue[muscle] = fatiguePercent;

        // Check if this is a new record (session volume exceeds baseline)
        const currentMax = muscleBaselines[muscle]?.systemLearnedMax || 0;
        if (volume > currentMax) {
          pendingUpdates.push({
            muscle,
            oldMax: currentMax,
            newMax: Math.round(volume),
            sessionVolume: Math.round(volume),
          });
        }
      });

      // If there are new records, show modal instead of auto-updating
      if (pendingUpdates.length > 0) {
        setBaselineUpdates(pendingUpdates);
        setShowBaselineModal(true);
        // Don't update baselines yet - wait for user confirmation
      }

      session.muscleFatigueHistory = muscleFatigue;

      // 3. Update Muscle States with new fatigue and recovery info
      // Build the muscle state update payload using new API field names
      const muscleUpdates: Record<string, { initial_fatigue_percent: number; last_trained: string }> = {};
      Object.entries(muscleFatigue).forEach(([muscleStr, fatigue]) => {
          const muscle = muscleStr as Muscle;
          muscleUpdates[muscle] = {
              initial_fatigue_percent: fatigue,
              last_trained: new Date(session.endTime).toISOString() // Convert to UTC ISO 8601
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

      setRecommendedWorkout(null);
    } catch (error) {
      console.error('Error saving workout:', error);
      setToastMessage('Failed to save workout. Please try again.');
    }

  }, [personalBests, muscleBaselines, workouts, setWorkouts, setPersonalBests, setMuscleBaselines]);

  const handleStartRecommendedWorkout = useCallback((data: RecommendedWorkoutData) => {
    setRecommendedWorkout(data);
    navigate('/workout');
  }, [navigate]);

  const handleStartPlannedWorkout = useCallback((planned: PlannedExercise[]) => {
    setPlannedExercises(planned);
    setRecommendedWorkout(null); // Clear recommended workout if present
    navigate('/workout');
  }, [navigate]);

  const handleCancelWorkout = useCallback(() => {
    setRecommendedWorkout(null);
    setPlannedExercises(null);
    navigate('/');
  }, [navigate]);

  // Baseline update modal handlers
  const handleBaselineUpdateConfirm = useCallback(async () => {
    const newBaselines = { ...muscleBaselines };

    baselineUpdates.forEach(({ muscle, newMax }) => {
      newBaselines[muscle].systemLearnedMax = newMax;
    });

    await setMuscleBaselines(newBaselines);

    // Show success toast
    if (baselineUpdates.length === 1) {
      setToastMessage(`New ${baselineUpdates[0].muscle} max: ${baselineUpdates[0].newMax.toLocaleString()} lbs!`);
    } else {
      setToastMessage(`Updated ${baselineUpdates.length} muscle baselines!`);
    }

    setShowBaselineModal(false);
    setBaselineUpdates([]);
  }, [baselineUpdates, muscleBaselines, setMuscleBaselines]);

  const handleBaselineUpdateDecline = useCallback(() => {
    setShowBaselineModal(false);
    setBaselineUpdates([]);
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
    navigate('/workout');
  }, [navigate]);
  
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

  // Show onboarding for first-time users
  if (isFirstTimeUser) {
    return <ProfileWizard onComplete={handleOnboardingComplete} />;
  }

  // Show loading state while any critical data is loading
  const isLoading = profileLoading || workoutsLoading || muscleBaselinesLoading;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark dark:bg-dark-bg-primary p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 bg-slate-700 dark:bg-dark-bg-tertiary rounded w-48 animate-pulse" />
            <div className="h-10 bg-slate-700 dark:bg-dark-bg-tertiary rounded w-24 animate-pulse" />
          </div>

          {/* Main content skeleton - simulating dashboard layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonBlock variant="card" />
            <SkeletonBlock variant="card" />
            <SkeletonBlock variant="card" />
          </div>

          {/* Secondary content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkeletonBlock variant="chart" />
            <div className="space-y-3">
              <SkeletonBlock variant="list-row" />
              <SkeletonBlock variant="list-row" />
              <SkeletonBlock variant="list-row" />
            </div>
          </div>

          <p className="text-center text-slate-400 dark:text-dark-text-muted text-sm">
            Loading your fitness data...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if any critical API failed (excluding USER_NOT_FOUND which is handled above)
  const hasError = (profileError && (profileError as any).code !== 'USER_NOT_FOUND') || workoutsError || muscleBaselinesError;
  if (hasError) {
    // Get backend URL from environment or default
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const isProduction = !backendUrl.includes('localhost');

    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-dark dark:bg-dark-bg-primary p-4">
        <div className="text-center bg-brand-surface dark:bg-dark-bg-secondary p-6 rounded-lg max-w-md">
          <p className="text-red-400 font-semibold mb-2">Failed to connect to backend</p>
          <p className="text-slate-400 dark:text-dark-text-secondary text-sm mb-4">
            {isProduction
              ? 'Unable to connect to the server. Please try again later.'
              : `Make sure the backend server is running at ${backendUrl}`
            }
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only sr-only-focusable bg-brand-cyan text-brand-dark font-bold z-50 fixed top-2 left-2 px-4 py-2 rounded"
      >
        Skip to main content
      </a>

      {/* Theme Toggle - Fixed position in top right */}
      <div className="fixed top-4 right-4 z-40">
        <ThemeToggle />
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {prNotifications.length > 0 && (
        <PRNotificationManager
          prs={prNotifications}
          onDismissAll={() => setPrNotifications([])}
        />
      )}
      <BaselineUpdateModal
        isOpen={showBaselineModal}
        updates={baselineUpdates}
        onConfirm={handleBaselineUpdateConfirm}
        onDecline={handleBaselineUpdateDecline}
      />

      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={wrapPage(
          <Dashboard
            profile={profile}
            workouts={workouts}
            muscleBaselines={muscleBaselines}
            templates={templates}
            onStartWorkout={() => navigate('/workout')}
            onStartPlannedWorkout={handleStartPlannedWorkout}
            onStartRecommendedWorkout={handleStartRecommendedWorkout}
            onSelectTemplate={handleSelectTemplate}
            onNavigateToProfile={() => navigate('/profile')}
            onNavigateToBests={() => navigate('/bests')}
            onNavigateToTemplates={() => navigate('/templates')}
            onNavigateToAnalytics={() => navigate('/analytics')}
            onNavigateToMuscleBaselines={() => navigate('/muscle-baselines')}
          />)} />

          <Route path="/workout" element={wrapPage(
          <WorkoutTracker
            onFinishWorkout={handleFinishWorkout}
            onCancel={handleCancelWorkout}
            allWorkouts={workouts}
            personalBests={personalBests}
            userProfile={profile}
            muscleBaselines={muscleBaselines}
            initialData={recommendedWorkout}
            plannedExercises={plannedExercises}
          />)} />

          <Route path="/profile" element={wrapPage(
          <Profile
            profile={profile}
            setProfile={setProfile}
            muscleBaselines={muscleBaselines}
            setMuscleBaselines={setMuscleBaselines}
            onBack={() => navigate('/')}
          />)} />

          <Route path="/bests" element={wrapPage(
          <PersonalBestsComponent
            personalBests={personalBests}
            onBack={() => navigate('/')}
          />)} />

          <Route path="/templates" element={wrapPage(
          <WorkoutTemplates
            onBack={() => navigate('/')}
            onSelectTemplate={handleSelectTemplate}
          />)} />

          <Route path="/analytics" element={wrapPage(<Analytics />)} />

          <Route path="/muscle-baselines" element={wrapPage(<MuscleBaselinesPage />)} />

          <Route path="/ux-mockup" element={wrapPage(<UXMockup />)} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;

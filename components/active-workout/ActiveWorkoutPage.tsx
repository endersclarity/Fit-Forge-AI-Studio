import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlannedExercise } from '../../types/savedWorkouts';
import { useActiveWorkout } from '../../hooks/useActiveWorkout';
import { workoutsAPI } from '../../api';
import ExerciseListPanel from './ExerciseListPanel';
import SetLoggerPanel from './SetLoggerPanel';
import WorkoutSaveModal from './WorkoutSaveModal';

const ActiveWorkoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'coming-soon' | null>(null);
  const [modalMessage, setModalMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Get planned exercises and current bodyweight from navigation state
  const { exercises: plannedExercises = [], currentBodyweight: stateBodyweight } = location.state as {
    exercises: PlannedExercise[],
    currentBodyweight?: number
  } || { exercises: [], currentBodyweight: undefined };

  // Ensure currentBodyweight has a valid numeric value (fallback to 0 for bodyweight exercises)
  const currentBodyweight = stateBodyweight ?? 0;

  // Redirect if no exercises
  useEffect(() => {
    if (plannedExercises.length === 0) {
      navigate('/workout/builder');
    }
  }, [plannedExercises, navigate]);

  const {
    state,
    logSet,
    switchExercise,
    skipRestTimer,
    getExerciseProgress,
    getCurrentSetInfo,
    getElapsedTime,
    getWorkoutSessionData,
    getIncompleteExercises,
  } = useActiveWorkout(plannedExercises, currentBodyweight);

  // Update elapsed time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(getElapsedTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [getElapsedTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishWorkout = () => {
    const incompleteExercises = getIncompleteExercises();

    if (incompleteExercises.length > 0) {
      setModalMessage(
        `You haven't logged any sets for: ${incompleteExercises.join(', ')}. These exercises will not be saved.`
      );
      setModalType('warning');
      return;
    }

    saveWorkout();
  };

  const saveWorkout = async () => {
    setIsSaving(true);

    try {
      const workoutData = getWorkoutSessionData();

      // Check if there's anything to save
      if (workoutData.loggedExercises.length === 0) {
        setModalMessage('No exercises were logged. Nothing to save.');
        setModalType('error');
        setIsSaving(false);
        return;
      }

      await workoutsAPI.create(workoutData);
      setModalType('success');
    } catch (error) {
      console.error('Failed to save workout:', error);
      setModalMessage(
        error instanceof Error ? error.message : 'Failed to save workout. Please try again.'
      );
      setModalType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalClose = () => {
    setModalType(null);
    setModalMessage('');
  };

  const handleGoToDashboard = () => {
    navigate('/');
  };

  const handleViewHistory = () => {
    navigate('/workout/history');
  };

  const handleConfirmSave = () => {
    setModalType(null);
    saveWorkout();
  };

  if (plannedExercises.length === 0) {
    return null;
  }

  const currentExercise = state.plannedExercises[state.currentExerciseIndex];
  const currentSetInfo = getCurrentSetInfo();
  const completedSets = state.exerciseLogs[state.currentExerciseIndex] || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col">
      {/* Header with Timer */}
      <div className="bg-white dark:bg-brand-surface border-b border-slate-200 dark:border-brand-muted p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/workout/builder')}
            className="text-primary dark:text-primary-light font-medium hover:underline"
          >
            ← Back to Builder
          </button>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatTime(elapsedSeconds)}
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content - Split Panel */}
      <div className="flex-1 flex">
        <ExerciseListPanel
          exercises={state.plannedExercises}
          currentIndex={state.currentExerciseIndex}
          getProgress={getExerciseProgress}
          onSelectExercise={switchExercise}
          onFinishWorkout={handleFinishWorkout}
          isFinishing={isSaving}
        />
        <SetLoggerPanel
          exercise={currentExercise}
          completedSets={completedSets}
          currentSetInfo={currentSetInfo}
          isRestTimerActive={state.isRestTimerActive}
          restTimeRemaining={state.restTimeRemaining}
          onLogSet={logSet}
          onSkipRest={skipRestTimer}
          currentBodyweight={currentBodyweight}
        />
      </div>

      {/* Save Modal */}
      <WorkoutSaveModal
        isOpen={modalType !== null}
        type={modalType || 'success'}
        message={modalMessage}
        onClose={handleModalClose}
        onDashboard={handleGoToDashboard}
        onHistory={handleViewHistory}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
};

export default ActiveWorkoutPage;

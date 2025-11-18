# Save Active Workout Implementation Plan

## Feature Overview
Wire up "Finish Workout" button to save workout data to backend with confirmation modal showing navigation options.

## User Flow
1. User clicks "Finish Workout"
2. If incomplete workout (some exercises have 0 sets) → Show warning modal
3. Convert data and call API
4. On success → Show success modal with:
   - "Go to Dashboard" button
   - "View Workout History" button (shows "Coming Soon" placeholder)
5. On error → Show error modal with details

## Implementation Tasks

### Task 1: Create Success/Error Modal Component
**File:** `components/active-workout/WorkoutSaveModal.tsx`

```typescript
import React from 'react';

interface WorkoutSaveModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'coming-soon';
  message?: string;
  onClose: () => void;
  onDashboard?: () => void;
  onHistory?: () => void;
  onConfirm?: () => void;
}

const WorkoutSaveModal: React.FC<WorkoutSaveModalProps> = ({
  isOpen,
  type,
  message,
  onClose,
  onDashboard,
  onHistory,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-brand-surface rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        {type === 'success' && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">✓</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Workout Saved!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Your workout has been successfully logged.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={onDashboard}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg"
              >
                Go to Dashboard
              </button>
              <button
                onClick={onHistory}
                className="w-full py-3 border border-primary text-primary hover:bg-primary/10 font-medium rounded-lg"
              >
                View Workout History
              </button>
            </div>
          </>
        )}

        {type === 'error' && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                Save Failed
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {message || 'An error occurred while saving your workout.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-200 dark:bg-brand-muted text-slate-900 dark:text-slate-100 font-medium rounded-lg"
            >
              Close
            </button>
          </>
        )}

        {type === 'warning' && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h2 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                Incomplete Workout
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {message}
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={onConfirm}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg"
              >
                Save Anyway
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 font-medium rounded-lg"
              >
                Continue Workout
              </button>
            </div>
          </>
        )}

        {type === 'coming-soon' && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🚧</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Coming Soon
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Workout History page is under development.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-200 dark:bg-brand-muted text-slate-900 dark:text-slate-100 font-medium rounded-lg"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkoutSaveModal;
```

**Verification:** File exists and TypeScript compiles without errors.

---

### Task 2: Add Conversion Function to useActiveWorkout Hook
**File:** `hooks/useActiveWorkout.ts`

Add helper function to convert active workout state to WorkoutSession format:

```typescript
// Add this import at top
import { WorkoutSession, ExerciseLog } from '../types';

// Add this function inside useActiveWorkout, before the return statement:

const getWorkoutSessionData = useCallback((): WorkoutSession => {
  const loggedExercises: ExerciseLog[] = [];

  // Convert each exercise's completed sets
  state.plannedExercises.forEach((exercise, index) => {
    const completedSets = state.exerciseLogs[index] || [];

    // Skip exercises with no logged sets
    if (completedSets.length === 0) return;

    loggedExercises.push({
      exerciseId: exercise.exerciseId,
      sets: completedSets.map(set => ({
        weight: set.weight === 'bodyweight' ? 0 : set.weight,
        reps: set.reps,
        to_failure: false,
      })),
    });
  });

  return {
    id: '',
    name: 'Workout',
    type: 'Push', // Default, can be enhanced later
    variation: 'A',
    startTime: state.startTime,
    endTime: Date.now(),
    loggedExercises,
    muscleFatigueHistory: {},
  };
}, [state.plannedExercises, state.exerciseLogs, state.startTime]);

const getIncompleteExercises = useCallback(() => {
  return state.plannedExercises.filter((_, index) => {
    const logs = state.exerciseLogs[index] || [];
    return logs.length === 0;
  }).map(ex => ex.exerciseName);
}, [state.plannedExercises, state.exerciseLogs]);

// Add to return statement:
return {
  state,
  logSet,
  switchExercise,
  skipRestTimer,
  getExerciseProgress,
  getCurrentSetInfo,
  getElapsedTime,
  isWorkoutComplete,
  getWorkoutSessionData,  // NEW
  getIncompleteExercises, // NEW
};
```

**Verification:** No TypeScript errors, hook returns new functions.

---

### Task 3: Update ActiveWorkoutPage with Save Logic
**File:** `components/active-workout/ActiveWorkoutPage.tsx`

Add imports, state, and save logic:

```typescript
// Add imports at top:
import { workoutsAPI } from '@/api';
import WorkoutSaveModal from './WorkoutSaveModal';

// Add state after existing useState:
const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'coming-soon' | null>(null);
const [modalMessage, setModalMessage] = useState('');
const [isSaving, setIsSaving] = useState(false);

// Update destructuring to include new functions:
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
} = useActiveWorkout(plannedExercises);

// Replace handleFinishWorkout:
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
  setModalType('coming-soon');
};

const handleConfirmSave = () => {
  setModalType(null);
  saveWorkout();
};
```

**Verification:** Functions compile, modal state management in place.

---

### Task 4: Add Modal to ActiveWorkoutPage JSX
**File:** `components/active-workout/ActiveWorkoutPage.tsx`

Add modal component and disable button during save. At the end of the return statement, before the closing `</div>`:

```typescript
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
```

Also update the Finish Workout button in ExerciseListPanel to accept disabled state. In ActiveWorkoutPage JSX:

```typescript
<ExerciseListPanel
  exercises={state.plannedExercises}
  currentIndex={state.currentExerciseIndex}
  getProgress={getExerciseProgress}
  onSelectExercise={switchExercise}
  onFinishWorkout={handleFinishWorkout}
  isFinishing={isSaving}  // NEW PROP
/>
```

**Verification:** Modal renders when modalType is set.

---

### Task 5: Update ExerciseListPanel to Support Disabled State
**File:** `components/active-workout/ExerciseListPanel.tsx`

Add isFinishing prop:

```typescript
interface ExerciseListPanelProps {
  exercises: PlannedExercise[];
  currentIndex: number;
  getProgress: (index: number) => { completed: number; total: number; isComplete: boolean };
  onSelectExercise: (index: number) => void;
  onFinishWorkout: () => void;
  isFinishing?: boolean;  // NEW
}

const ExerciseListPanel: React.FC<ExerciseListPanelProps> = ({
  exercises,
  currentIndex,
  getProgress,
  onSelectExercise,
  onFinishWorkout,
  isFinishing = false,  // NEW
}) => {
  // ... existing code ...

  // Update button at bottom:
  <button
    onClick={onFinishWorkout}
    disabled={isFinishing}
    className="mt-4 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isFinishing ? 'Saving...' : 'Finish Workout'}
  </button>
```

**Verification:** Button shows "Saving..." and is disabled during API call.

---

### Task 6: Restart Docker and Test Full Flow
**Commands:**
```bash
docker-compose restart frontend
```

**Test steps:**
1. Navigate to `/workout/builder`
2. Add 2 exercises (e.g., Pull-up, Dumbbell Row)
3. Click "Start Workout"
4. Log 1 set for Pull-up only
5. Click "Finish Workout"
6. Should see warning modal about incomplete exercises
7. Click "Save Anyway"
8. Should see success modal
9. Click "View Workout History"
10. Should see "Coming Soon" modal
11. Close and click "Go to Dashboard"
12. Should navigate to dashboard

**Verification:** Complete flow works, data saved to backend.

---

## Summary
- Task 1: Modal component with 4 types (success, error, warning, coming-soon)
- Task 2: Data conversion in hook
- Task 3: Save logic with error handling
- Task 4: Modal integration in JSX
- Task 5: Disabled state for button
- Task 6: Docker restart and full testing

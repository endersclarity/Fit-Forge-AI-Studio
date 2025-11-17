# Workout Flow Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace current multi-screen workout setup flow with a minimal 3-screen stateless flow (Exercise Picker → Set Logger → Summary).

**Architecture:** Three independent page components sharing state via React Context. Each page is full-screen with focused purpose. Navigation via React Router.

**Tech Stack:** React, TypeScript, React Router, Tailwind CSS, existing workoutsAPI

---

## Task 1: Create Workout Session Context

**Files:**
- Create: `contexts/WorkoutSessionContext.tsx`
- Test: Manual (context setup, no unit test needed)

**Step 1: Create the context file**

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SetData {
  weight: number;
  reps: number;
}

interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetData[];
}

interface WorkoutSessionState {
  exercises: ExerciseLog[];
  startTime: Date | null;
  currentExercise: { id: string; name: string } | null;
}

interface WorkoutSessionContextType {
  session: WorkoutSessionState;
  startSession: () => void;
  selectExercise: (id: string, name: string) => void;
  logSet: (weight: number, reps: number) => void;
  clearCurrentExercise: () => void;
  resetSession: () => void;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextType | null>(null);

export const useWorkoutSession = () => {
  const context = useContext(WorkoutSessionContext);
  if (!context) {
    throw new Error('useWorkoutSession must be used within WorkoutSessionProvider');
  }
  return context;
};

export const WorkoutSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<WorkoutSessionState>({
    exercises: [],
    startTime: null,
    currentExercise: null,
  });

  const startSession = () => {
    setSession({
      exercises: [],
      startTime: new Date(),
      currentExercise: null,
    });
  };

  const selectExercise = (id: string, name: string) => {
    setSession(prev => ({
      ...prev,
      currentExercise: { id, name },
    }));
  };

  const logSet = (weight: number, reps: number) => {
    if (!session.currentExercise) return;

    setSession(prev => {
      const existingIndex = prev.exercises.findIndex(
        e => e.exerciseId === prev.currentExercise!.id
      );

      if (existingIndex >= 0) {
        const updated = [...prev.exercises];
        updated[existingIndex].sets.push({ weight, reps });
        return { ...prev, exercises: updated };
      } else {
        return {
          ...prev,
          exercises: [
            ...prev.exercises,
            {
              exerciseId: prev.currentExercise!.id,
              exerciseName: prev.currentExercise!.name,
              sets: [{ weight, reps }],
            },
          ],
        };
      }
    });
  };

  const clearCurrentExercise = () => {
    setSession(prev => ({ ...prev, currentExercise: null }));
  };

  const resetSession = () => {
    setSession({
      exercises: [],
      startTime: null,
      currentExercise: null,
    });
  };

  return (
    <WorkoutSessionContext.Provider
      value={{
        session,
        startSession,
        selectExercise,
        logSet,
        clearCurrentExercise,
        resetSession,
      }}
    >
      {children}
    </WorkoutSessionContext.Provider>
  );
};
```

**Step 2: Commit**

```bash
git add contexts/WorkoutSessionContext.tsx
git commit -m "feat: Add WorkoutSessionContext for stateless workout flow"
```

---

## Task 2: Create Exercise Picker Page

**Files:**
- Create: `components/workout-flow/ExercisePickerPage.tsx`

**Step 1: Create the exercise picker component**

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXERCISE_LIBRARY } from '../../constants';
import { useWorkoutSession } from '../../contexts/WorkoutSessionContext';

const ExercisePickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectExercise, startSession, session } = useWorkoutSession();
  const [searchTerm, setSearchTerm] = useState('');

  // Start session on first render if not already started
  React.useEffect(() => {
    if (!session.startTime) {
      startSession();
    }
  }, [session.startTime, startSession]);

  const allExercises = Object.entries(EXERCISE_LIBRARY).flatMap(([category, exercises]) =>
    Object.entries(exercises).map(([name, data]) => ({
      id: `${category}-${name}`,
      name,
      category,
    }))
  );

  const filteredExercises = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectExercise = (id: string, name: string) => {
    selectExercise(id, name);
    navigate('/workout/log');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Select Exercise
          </h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Cancel
          </button>
        </div>

        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full mb-4 px-4 py-3 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan outline-none"
        />

        <div className="space-y-2">
          {filteredExercises.slice(0, 20).map(exercise => (
            <button
              key={exercise.id}
              onClick={() => handleSelectExercise(exercise.id, exercise.name)}
              className="w-full text-left px-4 py-4 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors min-h-[48px]"
            >
              <span className="text-lg font-medium text-slate-900 dark:text-slate-100">
                {exercise.name}
              </span>
              <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                {exercise.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExercisePickerPage;
```

**Step 2: Commit**

```bash
git add components/workout-flow/ExercisePickerPage.tsx
git commit -m "feat: Add ExercisePickerPage with search and selection"
```

---

## Task 3: Create Set Logger Page

**Files:**
- Create: `components/workout-flow/SetLoggerPage.tsx`

**Step 1: Create the set logger component**

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../../contexts/WorkoutSessionContext';

const SetLoggerPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, logSet, clearCurrentExercise } = useWorkoutSession();
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  // Redirect if no exercise selected
  useEffect(() => {
    if (!session.currentExercise) {
      navigate('/workout/select');
    }
  }, [session.currentExercise, navigate]);

  if (!session.currentExercise) {
    return null;
  }

  const currentExerciseSets = session.exercises.find(
    e => e.exerciseId === session.currentExercise!.id
  )?.sets || [];

  const handleLogSet = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (!isNaN(w) && !isNaN(r) && w > 0 && r > 0) {
      logSet(w, r);
      // Keep weight, clear reps for next set
      setReps('');
    }
  };

  const handleDifferentExercise = () => {
    clearCurrentExercise();
    navigate('/workout/select');
  };

  const handleFinish = () => {
    clearCurrentExercise();
    navigate('/workout/summary');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {session.currentExercise.name}
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Sets logged: {currentExerciseSets.length}
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">
              Weight (lbs)
            </label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="135"
              className="w-full px-4 py-4 text-4xl font-bold bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none text-center"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">
              Reps
            </label>
            <input
              type="number"
              value={reps}
              onChange={e => setReps(e.target.value)}
              placeholder="10"
              className="w-full px-4 py-4 text-4xl font-bold bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none text-center"
            />
          </div>

          <button
            onClick={handleLogSet}
            disabled={!weight || !reps}
            className="w-full py-4 bg-brand-cyan text-brand-dark font-bold text-xl rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            Log Set
          </button>

          {currentExerciseSets.length > 0 && (
            <div className="bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg p-4">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">
                Logged Sets
              </p>
              <div className="space-y-1">
                {currentExerciseSets.map((set, i) => (
                  <p key={i} className="text-slate-900 dark:text-slate-100">
                    Set {i + 1}: {set.weight} lbs × {set.reps} reps
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDifferentExercise}
              className="flex-1 py-3 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors min-h-[48px]"
            >
              Different Exercise
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors min-h-[48px]"
            >
              Finish Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetLoggerPage;
```

**Step 2: Commit**

```bash
git add components/workout-flow/SetLoggerPage.tsx
git commit -m "feat: Add SetLoggerPage with large inputs and set tracking"
```

---

## Task 4: Create Workout Summary Page

**Files:**
- Create: `components/workout-flow/WorkoutSummaryPage.tsx`

**Step 1: Create the summary component**

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../../contexts/WorkoutSessionContext';
import { workoutsAPI } from '../../api';

const WorkoutSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, resetSession } = useWorkoutSession();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveAndExit = async () => {
    if (session.exercises.length === 0) {
      resetSession();
      navigate('/');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Transform session to match existing workout API format
      const workoutData = {
        date: session.startTime?.toISOString() || new Date().toISOString(),
        exercises: session.exercises.map(ex => ({
          name: ex.exerciseName,
          sets: ex.sets.map(s => ({
            weight: s.weight,
            reps: s.reps,
            toFailure: false,
          })),
        })),
      };

      await workoutsAPI.create(workoutData);
      resetSession();
      navigate('/');
    } catch (err) {
      setError('Failed to save workout. Please try again.');
      setSaving(false);
    }
  };

  const handleAddMore = () => {
    navigate('/workout/select');
  };

  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Workout Summary
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {session.exercises.length} exercises • {totalSets} total sets
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {session.exercises.map((exercise, i) => (
            <div
              key={i}
              className="bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted rounded-lg p-4"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                {exercise.exerciseName}
              </h3>
              <div className="space-y-1">
                {exercise.sets.map((set, j) => (
                  <p key={j} className="text-slate-700 dark:text-slate-300">
                    Set {j + 1}: {set.weight} lbs × {set.reps} reps
                  </p>
                ))}
              </div>
            </div>
          ))}

          {session.exercises.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-500 rounded-lg p-4">
              <p className="text-yellow-700 dark:text-yellow-400">
                No exercises logged yet.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAddMore}
            className="w-full py-3 bg-white dark:bg-brand-surface border border-slate-300 dark:border-brand-muted text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-brand-muted transition-colors min-h-[48px]"
          >
            Add More Exercises
          </button>

          <button
            onClick={handleSaveAndExit}
            disabled={saving}
            className="w-full py-4 bg-brand-cyan text-brand-dark font-bold text-lg rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            {saving ? 'Saving...' : 'Save & Exit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSummaryPage;
```

**Step 2: Commit**

```bash
git add components/workout-flow/WorkoutSummaryPage.tsx
git commit -m "feat: Add WorkoutSummaryPage with save functionality"
```

---

## Task 5: Wire Up Routes and Provider in App.tsx

**Files:**
- Modify: `App.tsx`

**Step 1: Import new components and provider**

Add at top of App.tsx imports:
```typescript
import { WorkoutSessionProvider } from './contexts/WorkoutSessionContext';
import ExercisePickerPage from './components/workout-flow/ExercisePickerPage';
import SetLoggerPage from './components/workout-flow/SetLoggerPage';
import WorkoutSummaryPage from './components/workout-flow/WorkoutSummaryPage';
```

**Step 2: Wrap app in WorkoutSessionProvider**

Find the return statement in App component and wrap everything inside the Router with WorkoutSessionProvider:

```typescript
// Inside App return, wrap the Routes content
<WorkoutSessionProvider>
  {/* existing AnimatePresence and Routes */}
</WorkoutSessionProvider>
```

**Step 3: Add new routes**

Inside the Routes component, add before the closing `</Routes>`:

```typescript
<Route path="/workout/select" element={<ExercisePickerPage />} />
<Route path="/workout/log" element={<SetLoggerPage />} />
<Route path="/workout/summary" element={<WorkoutSummaryPage />} />
```

**Step 4: Commit**

```bash
git add App.tsx
git commit -m "feat: Wire up workout flow routes and provider"
```

---

## Task 6: Update Dashboard Start Button (Optional)

**Files:**
- Modify: `components/Dashboard.tsx` (find existing "Start Custom Workout" button)

**Step 1: Change navigation target**

Find the existing "Start Custom Workout" or similar button and change its onClick to:

```typescript
onClick={() => navigate('/workout/select')}
```

**Step 2: Commit**

```bash
git add components/Dashboard.tsx
git commit -m "feat: Update Dashboard to use new workout flow"
```

---

## Task 7: Test Full Flow

**Step 1: Manual verification**

1. Start app: `docker-compose up`
2. Go to dashboard
3. Click "Start Workout" (or navigate to `/workout/select`)
4. Pick an exercise
5. Log 2-3 sets with weight/reps
6. Click "Different Exercise" → pick another
7. Log more sets
8. Click "Finish Workout"
9. Verify summary shows all exercises
10. Click "Save & Exit"
11. Verify returns to dashboard

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: Complete workout flow redesign - stateless page-based approach"
```

---

Plan complete and saved to `docs/plans/2025-11-16-workout-flow-implementation-plan.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**

# Workout Builder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a hybrid full-page workout builder that lets users select multiple exercises, optionally set targets, reorder them, and either save as template or start immediately.

**Architecture:** Split-screen layout with exercise library on left, selected exercises on right, action bar at bottom. Uses localStorage for saved workouts (MVP). Integrates with existing WorkoutSessionContext for immediate start.

**Tech Stack:** React, TypeScript, Tailwind CSS, localStorage, react-beautiful-dnd for drag-and-drop

---

### Task 1: Create SavedWorkout TypeScript Interfaces

**Files:**
- Create: `types/savedWorkouts.ts`

**Step 1: Create the types file**

```typescript
export interface PlannedExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
}

export interface SavedWorkout {
  id: string;
  name: string;
  createdAt: number;
  exercises: PlannedExercise[];
}
```

**Step 2: Verify file created**

Run: `ls -la types/savedWorkouts.ts`
Expected: File exists with correct size

**Step 3: Commit**

```bash
git add types/savedWorkouts.ts
git commit -m "feat: add SavedWorkout TypeScript interfaces"
```

---

### Task 2: Create useSavedWorkouts Hook

**Files:**
- Create: `hooks/useSavedWorkouts.ts`

**Step 1: Create the localStorage management hook**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { SavedWorkout } from '../types/savedWorkouts';

const STORAGE_KEY = 'fitforge_saved_workouts';

export function useSavedWorkouts() {
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedWorkouts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved workouts:', e);
        setSavedWorkouts([]);
      }
    }
  }, []);

  // Save a new workout
  const saveWorkout = useCallback((workout: Omit<SavedWorkout, 'id' | 'createdAt'>) => {
    const newWorkout: SavedWorkout = {
      ...workout,
      id: `workout_${Date.now()}`,
      createdAt: Date.now(),
    };

    setSavedWorkouts(prev => {
      const updated = [...prev, newWorkout];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newWorkout;
  }, []);

  // Delete a workout
  const deleteWorkout = useCallback((id: string) => {
    setSavedWorkouts(prev => {
      const updated = prev.filter(w => w.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get a single workout by ID
  const getWorkout = useCallback((id: string) => {
    return savedWorkouts.find(w => w.id === id);
  }, [savedWorkouts]);

  return {
    savedWorkouts,
    saveWorkout,
    deleteWorkout,
    getWorkout,
  };
}
```

**Step 2: Verify file created**

Run: `ls -la hooks/useSavedWorkouts.ts`
Expected: File exists

**Step 3: Commit**

```bash
git add hooks/useSavedWorkouts.ts
git commit -m "feat: add useSavedWorkouts hook for localStorage management"
```

---

### Task 3: Create WorkoutBuilderPage - Basic Structure

**Files:**
- Create: `components/workout-builder/WorkoutBuilderPage.tsx`

**Step 1: Create the basic page layout**

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXERCISE_LIBRARY } from '../constants';
import { PlannedExercise } from '../types/savedWorkouts';
import { useSavedWorkouts } from '../hooks/useSavedWorkouts';
import { useWorkoutSession } from '../contexts/WorkoutSessionContext';

type TabType = 'all' | 'byMuscle' | 'categories';

const WorkoutBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveWorkout } = useSavedWorkouts();
  const { startSession, selectExercise } = useWorkoutSession();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedExercises, setSelectedExercises] = useState<PlannedExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-brand-muted">
        <button
          onClick={() => navigate('/')}
          className="text-brand-primary dark:text-brand-accent font-medium"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
          Workout Builder
        </h1>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Exercise Library */}
        <div className="w-2/5 border-r border-slate-200 dark:border-brand-muted flex flex-col">
          <div className="p-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Exercise Library
          </div>
          {/* Search and tabs will go here */}
          <div className="p-4">
            <p className="text-slate-500 dark:text-slate-400">Exercise list placeholder</p>
          </div>
        </div>

        {/* Right Panel - Your Workout */}
        <div className="w-3/5 flex flex-col">
          <div className="p-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Your Workout ({selectedExercises.length} exercises)
          </div>
          <div className="flex-1 p-4">
            {selectedExercises.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">
                No exercises selected. Add from the library.
              </p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Selected exercises placeholder</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-brand-muted bg-white dark:bg-brand-surface flex items-center gap-4">
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Workout name..."
          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
        />
        <button
          onClick={() => {/* Save logic */}}
          className="px-6 py-2 rounded-lg border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
        >
          Save Template
        </button>
        <button
          onClick={() => {/* Start logic */}}
          className="px-6 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
        >
          Start Workout
        </button>
      </div>
    </div>
  );
};

export default WorkoutBuilderPage;
```

**Step 2: Verify file created**

Run: `ls -la components/workout-builder/`
Expected: Directory created with WorkoutBuilderPage.tsx

**Step 3: Commit**

```bash
git add components/workout-builder/WorkoutBuilderPage.tsx
git commit -m "feat: add WorkoutBuilderPage basic structure with split layout"
```

---

### Task 4: Add Route for WorkoutBuilderPage

**Files:**
- Modify: `App.tsx`

**Step 1: Import the new component**

Find line with WorkoutSummaryPage import and add after it:

```typescript
import WorkoutBuilderPage from './components/workout-builder/WorkoutBuilderPage';
```

**Step 2: Add the route**

Find the line `<Route path="/workout/summary"` and add before it:

```typescript
          <Route path="/workout/builder" element={<WorkoutBuilderPage />} />
```

**Step 3: Verify changes**

Run: `grep -n "workout/builder" App.tsx`
Expected: Shows the new route line

**Step 4: Commit**

```bash
git add App.tsx
git commit -m "feat: add route for WorkoutBuilderPage"
```

---

### Task 5: Implement Exercise Library - Search and Tabs

**Files:**
- Modify: `components/workout-builder/WorkoutBuilderPage.tsx`

**Step 1: Add search input and tab buttons**

Replace the left panel content (after "Exercise Library" header) with:

```typescript
          {/* Search */}
          <div className="px-4 pb-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exercises..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Tabs */}
          <div className="px-4 pb-2 flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === 'all'
                  ? 'bg-brand-primary text-white'
                  : 'bg-slate-200 dark:bg-brand-muted text-slate-700 dark:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('byMuscle')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === 'byMuscle'
                  ? 'bg-brand-primary text-white'
                  : 'bg-slate-200 dark:bg-brand-muted text-slate-700 dark:text-slate-300'
              }`}
            >
              By Muscle
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === 'categories'
                  ? 'bg-brand-primary text-white'
                  : 'bg-slate-200 dark:bg-brand-muted text-slate-700 dark:text-slate-300'
              }`}
            >
              Categories
            </button>
          </div>
```

**Step 2: Restart frontend and verify UI**

Run: `docker-compose restart frontend`
Wait 8 seconds, then navigate to http://localhost:3000/workout/builder
Expected: See search box and three tab buttons

**Step 3: Commit**

```bash
git add components/workout-builder/WorkoutBuilderPage.tsx
git commit -m "feat: add search input and category tabs to exercise library"
```

---

### Task 6: Implement Exercise List with Filtering

**Files:**
- Modify: `components/workout-builder/WorkoutBuilderPage.tsx`

**Step 1: Add filtering logic and exercise list rendering**

Add this helper function inside the component, before the return statement:

```typescript
  // Filter exercises based on search and tab
  const getFilteredExercises = () => {
    let exercises = EXERCISE_LIBRARY.filter(ex =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeTab === 'byMuscle') {
      // Group by primary muscle
      const grouped: Record<string, typeof exercises> = {};
      exercises.forEach(ex => {
        const primaryMuscle = ex.muscleEngagements[0]?.muscle || 'Other';
        if (!grouped[primaryMuscle]) grouped[primaryMuscle] = [];
        grouped[primaryMuscle].push(ex);
      });
      return { type: 'grouped' as const, data: grouped };
    }

    if (activeTab === 'categories') {
      // Group by equipment/category
      const grouped: Record<string, typeof exercises> = {};
      exercises.forEach(ex => {
        const category = ex.category;
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(ex);
      });
      return { type: 'grouped' as const, data: grouped };
    }

    return { type: 'flat' as const, data: exercises };
  };

  const handleAddExercise = (exerciseId: string, exerciseName: string) => {
    setSelectedExercises(prev => [
      ...prev,
      {
        exerciseId,
        exerciseName,
        targetSets: 3,
        targetReps: 10,
        targetWeight: undefined,
      },
    ]);
  };

  const filteredExercises = getFilteredExercises();
```

**Step 2: Replace the exercise list placeholder**

After the tabs div, add:

```typescript
          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto px-4">
            {filteredExercises.type === 'flat' ? (
              <div className="space-y-1">
                {filteredExercises.data.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExercise(ex.id, ex.name)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-muted text-slate-900 dark:text-slate-100 flex items-center justify-between group"
                  >
                    <span>{ex.name}</span>
                    <span className="text-brand-primary opacity-0 group-hover:opacity-100">+</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(filteredExercises.data).map(([group, exercises]) => (
                  <div key={group}>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      {group}
                    </h3>
                    <div className="space-y-1">
                      {exercises.map(ex => (
                        <button
                          key={ex.id}
                          onClick={() => handleAddExercise(ex.id, ex.name)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-muted text-slate-900 dark:text-slate-100 flex items-center justify-between group"
                        >
                          <span>{ex.name}</span>
                          <span className="text-brand-primary opacity-0 group-hover:opacity-100">+</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
```

**Step 3: Remove the old placeholder**

Delete the line: `<p className="text-slate-500 dark:text-slate-400">Exercise list placeholder</p>`

**Step 4: Test in browser**

Navigate to http://localhost:3000/workout/builder
Expected: See list of exercises, search filters them, tabs switch between grouping modes

**Step 5: Commit**

```bash
git add components/workout-builder/WorkoutBuilderPage.tsx
git commit -m "feat: implement exercise list with search and category filtering"
```

---

### Task 7: Implement Selected Exercises List with Target Inputs

**Files:**
- Modify: `components/workout-builder/WorkoutBuilderPage.tsx`

**Step 1: Add update and remove handlers**

Add after handleAddExercise function:

```typescript
  const handleUpdateExercise = (index: number, field: keyof PlannedExercise, value: number | undefined) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };
```

**Step 2: Replace the selected exercises placeholder**

In the right panel, replace the placeholder with:

```typescript
            {selectedExercises.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">
                No exercises selected. Add from the library.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedExercises.map((ex, index) => (
                  <div
                    key={`${ex.exerciseId}-${index}`}
                    className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-muted rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 cursor-grab">≡</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {ex.exerciseName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400">Sets</label>
                        <input
                          type="number"
                          value={ex.targetSets || ''}
                          onChange={(e) => handleUpdateExercise(index, 'targetSets', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400">Reps</label>
                        <input
                          type="number"
                          value={ex.targetReps || ''}
                          onChange={(e) => handleUpdateExercise(index, 'targetReps', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400">Weight</label>
                        <input
                          type="number"
                          value={ex.targetWeight || ''}
                          onChange={(e) => handleUpdateExercise(index, 'targetWeight', e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="lb"
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
```

**Step 3: Test in browser**

Click exercises to add them, verify they appear in right panel with editable inputs
Expected: Can add exercises, edit targets, remove exercises

**Step 4: Commit**

```bash
git add components/workout-builder/WorkoutBuilderPage.tsx
git commit -m "feat: implement selected exercises list with target inputs"
```

---

### Task 8: Implement Save Template and Start Workout Actions

**Files:**
- Modify: `components/workout-builder/WorkoutBuilderPage.tsx`

**Step 1: Add state for save feedback**

Add with other useState hooks:

```typescript
  const [saveMessage, setSaveMessage] = useState('');
```

**Step 2: Implement Save Template handler**

Add after handleRemoveExercise:

```typescript
  const handleSaveTemplate = () => {
    if (!workoutName.trim()) {
      setSaveMessage('Please enter a workout name');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    if (selectedExercises.length === 0) {
      setSaveMessage('Please add at least one exercise');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    saveWorkout({
      name: workoutName.trim(),
      exercises: selectedExercises,
    });

    setSaveMessage('Workout saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleStartWorkout = () => {
    if (selectedExercises.length === 0) {
      setSaveMessage('Please add at least one exercise');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Start session and pre-populate with first exercise
    startSession();

    // Select the first exercise to start logging
    const firstEx = selectedExercises[0];
    selectExercise(firstEx.exerciseId, firstEx.exerciseName);

    // Navigate to logger
    navigate('/workout/log');
  };
```

**Step 3: Wire up buttons in bottom bar**

Replace the button onClick handlers:

```typescript
        <button
          onClick={handleSaveTemplate}
          className="px-6 py-2 rounded-lg border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
        >
          Save Template
        </button>
        <button
          onClick={handleStartWorkout}
          className="px-6 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
        >
          Start Workout
        </button>
```

**Step 4: Add save message display**

After the action bar, add:

```typescript
      {/* Save Message Toast */}
      {saveMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg">
          {saveMessage}
        </div>
      )}
```

**Step 5: Test Save Template**

Add exercises, enter name, click Save Template
Expected: Toast shows "Workout saved!"

**Step 6: Test Start Workout**

Add exercises, click Start Workout
Expected: Navigates to /workout/log with first exercise selected

**Step 7: Commit**

```bash
git add components/workout-builder/WorkoutBuilderPage.tsx
git commit -m "feat: implement save template and start workout actions"
```

---

### Task 9: Update Dashboard - Plan Workout Button

**Files:**
- Modify: `components/Dashboard.tsx`

**Step 1: Find Plan Workout button**

Search for: `aria-label="Plan Workout"`

**Step 2: Update onClick handler**

Change the button's onClick from opening a modal to navigating:

```typescript
                onClick={() => navigate('/workout/builder')}
```

Remove any modal-related state if it was tied to this button.

**Step 3: Verify change**

Run: `grep -n "workout/builder" components/Dashboard.tsx`
Expected: Shows the navigation to builder

**Step 4: Test in browser**

Click "Plan Workout" on Dashboard
Expected: Navigates to /workout/builder

**Step 5: Commit**

```bash
git add components/Dashboard.tsx
git commit -m "feat: update Plan Workout button to navigate to builder"
```

---

### Task 10: Add Saved Workouts Section to Dashboard

**Files:**
- Modify: `components/Dashboard.tsx`

**Step 1: Import the hook**

Add import at top:

```typescript
import { useSavedWorkouts } from '../hooks/useSavedWorkouts';
```

**Step 2: Use the hook in component**

Inside the Dashboard component function, add:

```typescript
  const { savedWorkouts } = useSavedWorkouts();
```

**Step 3: Add Saved Workouts section UI**

Find a good location (after Quick Actions or before Recent Activity). Add:

```typescript
      {/* Saved Workouts Section */}
      {savedWorkouts.length > 0 && (
        <div className="bg-white dark:bg-brand-surface rounded-xl p-6 shadow-sm border border-slate-200 dark:border-brand-muted">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Saved Workouts
          </h2>
          <div className="space-y-3">
            {savedWorkouts.slice(0, 5).map(workout => (
              <div
                key={workout.id}
                className="bg-slate-50 dark:bg-brand-dark rounded-lg p-4 border border-slate-200 dark:border-brand-muted"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {workout.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {workout.exercises.length} exercises
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {workout.exercises.slice(0, 3).map(e => e.exerciseName).join(', ')}
                      {workout.exercises.length > 3 && '...'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Load workout and start
                      startSession();
                      const firstEx = workout.exercises[0];
                      selectExercise(firstEx.exerciseId, firstEx.exerciseName);
                      navigate('/workout/log');
                    }}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
```

**Step 4: Import useWorkoutSession**

Add if not already imported:

```typescript
import { useWorkoutSession } from '../contexts/WorkoutSessionContext';
```

And use it:

```typescript
  const { startSession, selectExercise } = useWorkoutSession();
```

**Step 5: Test in browser**

Save a workout first, then go to Dashboard
Expected: See Saved Workouts section with workout card, Start button works

**Step 6: Commit**

```bash
git add components/Dashboard.tsx
git commit -m "feat: add Saved Workouts section to Dashboard"
```

---

### Task 11: Add Drag-and-Drop Reordering (Optional Enhancement)

**Files:**
- Modify: `components/workout-builder/WorkoutBuilderPage.tsx`

**Step 1: Install react-beautiful-dnd**

Run: `docker-compose exec frontend npm install @hello-pangea/dnd`
(This is the maintained fork of react-beautiful-dnd)

**Step 2: Import the library**

Add at top:

```typescript
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
```

**Step 3: Add reorder handler**

Add after handleRemoveExercise:

```typescript
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedExercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedExercises(items);
  };
```

**Step 4: Wrap selected exercises list with DnD context**

Replace the selected exercises rendering with:

```typescript
            {selectedExercises.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">
                No exercises selected. Add from the library.
              </p>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="exercises">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {selectedExercises.map((ex, index) => (
                        <Draggable key={`${ex.exerciseId}-${index}`} draggableId={`${ex.exerciseId}-${index}`} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-muted rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    {...provided.dragHandleProps}
                                    className="text-slate-400 cursor-grab"
                                  >
                                    ≡
                                  </span>
                                  <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {ex.exerciseName}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemoveExercise(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </div>
                              <div className="flex gap-3">
                                <div className="flex-1">
                                  <label className="text-xs text-slate-500 dark:text-slate-400">Sets</label>
                                  <input
                                    type="number"
                                    value={ex.targetSets || ''}
                                    onChange={(e) => handleUpdateExercise(index, 'targetSets', e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="text-xs text-slate-500 dark:text-slate-400">Reps</label>
                                  <input
                                    type="number"
                                    value={ex.targetReps || ''}
                                    onChange={(e) => handleUpdateExercise(index, 'targetReps', e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="text-xs text-slate-500 dark:text-slate-400">Weight</label>
                                  <input
                                    type="number"
                                    value={ex.targetWeight || ''}
                                    onChange={(e) => handleUpdateExercise(index, 'targetWeight', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="lb"
                                    className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
```

**Step 5: Rebuild container for new dependency**

Run: `docker-compose down && docker-compose up -d --build`
Wait for build to complete

**Step 6: Test drag-and-drop**

Add multiple exercises, drag to reorder
Expected: Exercises reorder smoothly

**Step 7: Commit**

```bash
git add components/workout-builder/WorkoutBuilderPage.tsx package.json package-lock.json
git commit -m "feat: add drag-and-drop reordering for exercises"
```

---

### Task 12: Final Integration Test

**Files:** None (testing only)

**Step 1: Test complete flow**

1. Navigate to Dashboard
2. Click "Plan Workout"
3. Add 3-4 exercises using search and tabs
4. Set targets for some exercises
5. Reorder exercises with drag-and-drop
6. Enter workout name
7. Click "Save Template"
8. Verify toast shows success

**Step 2: Test saved workout on Dashboard**

1. Return to Dashboard
2. Verify Saved Workouts section shows new workout
3. Click "Start" on the saved workout
4. Verify navigates to SetLoggerPage with correct exercise

**Step 3: Test Start Workout directly**

1. Go back to /workout/builder
2. Add exercises
3. Click "Start Workout" (without saving)
4. Verify navigates to logger and can log sets

**Step 4: Verify dark mode**

Toggle dark mode, verify all new UI components render correctly

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: final integration adjustments for workout builder"
```

---

## Plan Complete

Plan saved to `docs/plans/2025-11-16-workout-builder-implementation.md`.

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?

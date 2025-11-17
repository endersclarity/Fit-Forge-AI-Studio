# Set-Based Exercise Cards Implementation Plan

**Feature:** Replace single-value exercise inputs with multiple individually-configurable sets per exercise.

**Date:** 2025-01-17

---

## Task 1: Update Data Model for Multi-Set Support

**File:** `types/savedWorkouts.ts`

**What:** Add PlannedSet interface and update PlannedExercise to contain array of sets.

**Replace entire file with:**
```typescript
export interface PlannedSet {
  weight: number | 'bodyweight';
  reps: number;
  restSeconds: number;
}

export interface PlannedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: PlannedSet[];
}

export interface SavedWorkout {
  id: string;
  name: string;
  createdAt: number;
  exercises: PlannedExercise[];
}
```

**Verification:** TypeScript compiles (will have errors in WorkoutBuilderPage until Task 2).

---

## Task 2: Update handleAddExercise to Create Default Set

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** When adding exercise, create with one default set instead of targetSets/targetReps/targetWeight.

**Replace lines 69-78:**
```typescript
  const handleAddExercise = (exerciseId: string, exerciseName: string) => {
    setSelectedExercises(prev => [
      ...prev,
      {
        exerciseId,
        exerciseName,
        sets: [
          {
            weight: 'bodyweight',
            reps: 10,
            restSeconds: 90,
          },
        ],
      },
    ]);
  };
```

**Verification:** No TypeScript errors for handleAddExercise.

---

## Task 3: Remove Old handleUpdateExercise Function

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Delete the old handleUpdateExercise that updated single values.

**Delete lines 65-71 (after Task 2 renumbering, approximately):**
```typescript
  const handleUpdateExercise = (index: number, field: keyof PlannedExercise, value: number | undefined) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
```

**Verification:** File compiles (UI will break until Task 5).

---

## Task 4: Add Set Management Handlers

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Add functions for adding sets, updating individual sets, and deleting sets.

**Add after handleRemoveExercise function:**
```typescript
  const handleAddSet = (exerciseIndex: number) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      const exercise = updated[exerciseIndex];
      const lastSet = exercise.sets[exercise.sets.length - 1];
      // Copy last set's values for new set
      exercise.sets.push({
        weight: lastSet.weight,
        reps: lastSet.reps,
        restSeconds: lastSet.restSeconds,
      });
      return updated;
    });
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof PlannedSet,
    value: number | 'bodyweight'
  ) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      const exercise = updated[exerciseIndex];
      exercise.sets[setIndex] = {
        ...exercise.sets[setIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      const exercise = updated[exerciseIndex];
      // Don't allow deleting last set
      if (exercise.sets.length > 1) {
        exercise.sets.splice(setIndex, 1);
      }
      return updated;
    });
  };

  const handleRestChange = (exerciseIndex: number, setIndex: number, delta: number) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      const exercise = updated[exerciseIndex];
      const currentRest = exercise.sets[setIndex].restSeconds;
      const newRest = Math.max(0, currentRest + delta);
      exercise.sets[setIndex].restSeconds = newRest;
      return updated;
    });
  };
```

**Verification:** Functions compile without TypeScript errors.

---

## Task 5: Create Weight Options Array

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Add constant for weight dropdown options.

**Add after EXERCISES_PER_PAGE constant (line 9):**
```typescript
const WEIGHT_OPTIONS: (number | 'bodyweight')[] = [
  'bodyweight',
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
  55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
  110, 120, 130, 140, 150, 175, 200, 225, 250
];
```

**Verification:** Constant is defined, no errors.

---

## Task 6: Replace Exercise Card UI with Set-Based Layout

**File:** `components/workout-builder/WorkoutBuilderPage.tsx`

**What:** Replace the single-input card layout with multiple set rows.

**Replace the exercise card rendering (approximately lines 237-288 in the map) with:**
```typescript
                {selectedExercises.map((ex, exerciseIndex) => (
                  <div
                    key={`${ex.exerciseId}-${exerciseIndex}`}
                    className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-brand-muted rounded-lg p-3"
                  >
                    {/* Exercise Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 cursor-grab">≡</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {ex.exerciseName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(exerciseIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>

                    {/* Sets */}
                    <div className="space-y-2">
                      {ex.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-brand-dark p-2 rounded"
                        >
                          <span className="text-slate-500 dark:text-slate-400 w-12">
                            Set {setIndex + 1}
                          </span>

                          {/* Weight Dropdown */}
                          <select
                            value={set.weight}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateSet(
                                exerciseIndex,
                                setIndex,
                                'weight',
                                val === 'bodyweight' ? 'bodyweight' : parseInt(val)
                              );
                            }}
                            className="px-2 py-1 rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100 text-xs"
                          >
                            {WEIGHT_OPTIONS.map(w => (
                              <option key={w} value={w}>
                                {w === 'bodyweight' ? 'BW' : `${w} lbs`}
                              </option>
                            ))}
                          </select>

                          <span className="text-slate-500">×</span>

                          {/* Reps Input */}
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              handleUpdateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)
                            }
                            min={1}
                            className="w-14 px-2 py-1 rounded border border-slate-300 dark:border-brand-muted bg-white dark:bg-brand-dark text-slate-900 dark:text-slate-100 text-xs text-center"
                          />
                          <span className="text-slate-500 text-xs">reps</span>

                          {/* Rest Timer */}
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleRestChange(exerciseIndex, setIndex, -15)}
                              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                              title="-15s"
                            >
                              -
                            </button>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              🕐 {set.restSeconds}s
                            </span>
                            <button
                              onClick={() => handleRestChange(exerciseIndex, setIndex, 15)}
                              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                              title="+15s"
                            >
                              +
                            </button>
                          </div>

                          {/* Delete Set Button */}
                          {ex.sets.length > 1 && (
                            <button
                              onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                              className="ml-auto text-red-400 hover:text-red-600 text-xs"
                              title="Delete set"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Set Button */}
                    <button
                      onClick={() => handleAddSet(exerciseIndex)}
                      className="mt-2 w-full py-1 text-sm text-brand-primary hover:text-brand-primary/80 border border-dashed border-brand-primary/50 rounded"
                    >
                      + Add Set
                    </button>
                  </div>
                ))}
```

**Verification:** UI renders with set rows, add/delete/edit all work.

---

## Task 7: Test Full User Flow

**What:** Verify all functionality works end-to-end.

**Test scenarios:**
1. Add exercise → Shows 1 set with BW, 10 reps, 90s rest
2. Click "Add Set" → Copies previous set values
3. Change weight dropdown → Updates that set only
4. Change reps → Updates that set only
5. Click +/- on rest timer → Changes by 15 seconds
6. Delete a set → Removes it (can't delete last one)
7. Save workout → Saves with multi-set structure
8. Remove entire exercise → Works as before

**Verification:** All scenarios pass without errors.

---

## Task 8: Update localStorage Compatibility (Optional)

**What:** Handle old saved workouts that have targetSets/targetReps/targetWeight.

**Note:** This is optional for now. Old saved workouts will fail to load properly. For MVP, this is acceptable. Future migration can convert old format to new.

---

## Summary

**Files modified:** 2
- `types/savedWorkouts.ts` - New PlannedSet interface, updated PlannedExercise
- `components/workout-builder/WorkoutBuilderPage.tsx` - Multi-set UI and handlers

**Key changes:**
- Each exercise contains array of `PlannedSet` objects
- Each set has: weight (number or 'bodyweight'), reps, restSeconds
- Weight dropdown with 5lb increments + bodyweight option
- Rest timer with +/- 15s buttons
- "Add Set" copies previous set's values
- Each set has delete button (except last one)

**Breaking change:** Old saved workouts with targetSets/targetReps/targetWeight will not load correctly.

**Estimated time:** 45-60 minutes total

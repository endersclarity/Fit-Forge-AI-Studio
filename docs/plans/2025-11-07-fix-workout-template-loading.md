# Fix Workout Template Loading Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the "Load Template" button on workout page to actually load template exercises instead of leaving the workout empty

**Architecture:** The `loadTemplateWithProgression()` function has a TODO comment and doesn't fetch template data from the API. It only loads exercises if there's a `lastWorkout`, which may not exist. We'll implement the missing template loading logic using the templatesAPI.

**Tech Stack:** React, TypeScript, FitForge API

---

## Root Cause

**Location:** `components/Workout.tsx:392-438`

**Error:** No exercises loaded when clicking "Load [Template Name]" button

**Problem:** Function `loadTemplateWithProgression()` has TODO on line 396-398:
```typescript
// TODO: Load template exercises from templatesAPI
// For now, we'll just set up the workout with the selected variation
// This will be fully implemented when we integrate with WorkoutTemplates
```

**Current behavior:** Only loads exercises if `lastWorkout` exists
**Expected behavior:** Load template exercises from templatesAPI based on category and variation

---

## Task 1: Import templatesAPI

**Files:**
- Modify: `components/Workout.tsx:1-15`

**Step 1: Check current imports**

Look for existing API imports around line 10:
```typescript
import { workoutsAPI } from '../api';
```

**Step 2: Add templatesAPI import**

Add after line 10:
```typescript
import { workoutsAPI, templatesAPI } from '../api';
```

**Step 3: Verify import**

Check that line looks like:
```typescript
import { workoutsAPI, templatesAPI } from '../api';
```

**Step 4: Commit**

```bash
git add components/Workout.tsx
git commit -m "feat: import templatesAPI for template loading

Prepare to implement template loading in loadTemplateWithProgression.

Part of: Fix workout template loading (Issue #4, P0)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Implement template loading logic

**Files:**
- Modify: `components/Workout.tsx:392-438`

**Step 1: Replace TODO with template loading**

Find the function starting at line 392. Replace the entire function with:

```typescript
// Load template with progressive overload suggestions
const loadTemplateWithProgression = async (variation: 'A' | 'B') => {
  setWorkoutVariation(variation);
  setWorkoutName(generateWorkoutName(selectedCategory, variation));

  try {
    // Fetch all templates
    const allTemplates = await templatesAPI.getAll();

    // Find the template matching the selected category and variation
    const matchingTemplate = allTemplates.find(
      t => t.category === selectedCategory && t.variation === variation
    );

    if (matchingTemplate && matchingTemplate.exerciseIds && matchingTemplate.exerciseIds.length > 0) {
      // Load template exercises with default sets
      const newExercises: LoggedExercise[] = matchingTemplate.exerciseIds.map((exerciseId, idx) => {
        // Find the exercise in the library to get default weight
        const exerciseInfo = EXERCISE_LIBRARY.find(e => e.id === exerciseId);
        const defaultWeight = exerciseInfo ? getDefaultWeight(exerciseId) : 50;

        // Create 3 sets with default values (can be adjusted by user)
        const sets: LoggedSet[] = [
          { id: `set-1-${Date.now()}-${idx}`, reps: 8, weight: defaultWeight, to_failure: false },
          { id: `set-2-${Date.now()}-${idx}`, reps: 8, weight: defaultWeight, to_failure: false },
          { id: `set-3-${Date.now()}-${idx}`, reps: 8, weight: defaultWeight, to_failure: true }
        ];

        return {
          id: `${exerciseId}-${Date.now()}-${idx}`,
          exerciseId,
          sets
        };
      });

      setLoggedExercises(newExercises);
    } else if (lastWorkout && lastWorkout.exercises) {
      // Fallback: If template not found but we have lastWorkout, use progressive overload logic
      const newExercises: LoggedExercise[] = lastWorkout.exercises.map((prevExercise, idx) => {
        const exerciseInfo = EXERCISE_LIBRARY.find(e => e.name === prevExercise.exercise);
        const exerciseId = exerciseInfo?.id || `ex${idx}`;

        const bestSet = prevExercise.sets.reduce((max, set) =>
          (set.weight * set.reps > max.weight * max.reps) ? set : max
        );

        const suggestion = calculateProgressiveOverload(
          { weight: bestSet.weight, reps: bestSet.reps },
          (lastWorkout.progression_method as ProgressionMethod) || null,
          { weight: bestSet.weight, reps: bestSet.reps }
        );

        const sets: LoggedSet[] = prevExercise.sets.map((_, setIdx) => ({
          id: `set-${setIdx + 1}-${Date.now()}-${idx}`,
          reps: suggestion.suggestedReps,
          weight: suggestion.suggestedWeight,
          to_failure: setIdx === prevExercise.sets.length - 1
        }));

        return {
          id: `${exerciseId}-${Date.now()}-${idx}`,
          exerciseId,
          sets
        };
      });

      setLoggedExercises(newExercises);
    } else {
      // No template found and no last workout - start with empty workout
      console.warn(`No template found for ${selectedCategory} ${variation}`);
      setLoggedExercises([]);
    }

    startWorkout();
  } catch (error) {
    console.error('Failed to load template:', error);
    // Fallback to starting empty workout on error
    startWorkout();
  }
};
```

**Step 2: Verify the changes**

Check that:
- Function is now `async`
- Fetches templates from API
- Finds matching template by category and variation
- Uses `template.exerciseIds` to create exercises
- Has fallback to lastWorkout logic
- Has fallback to empty workout if all else fails
- Calls `startWorkout()` at the end

**Step 3: Test the implementation**

Run: Navigate to workout page in Chrome DevTools
```bash
# Using Chrome DevTools MCP
navigate to: https://fit-forge-ai-studio-production-6b5b.up.railway.app/workout
# Select a category (Push/Pull/Legs)
# Click "Load Push Day A" or similar button
# Verify exercises appear
```

Expected:
- Template exercises load immediately
- All exercises from template appear in workout
- Each exercise has 3 sets with default weights
- No console errors

**Step 4: Commit**

```bash
git add components/Workout.tsx
git commit -m "fix: implement template loading in loadTemplateWithProgression

Replace TODO with actual template loading logic:
- Fetch templates from API
- Find matching template by category and variation
- Create LoggedExercises from template.exerciseIds
- Maintain fallback to lastWorkout progressive overload
- Add error handling with console warnings

Fixes: Workout 'Load Template' button (Issue #4, P0)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Add loading state (optional UX improvement)

**Files:**
- Modify: `components/Workout.tsx:392-438` (loadTemplateWithProgression function)
- Modify: `components/LastWorkoutSummary.tsx` (if button needs loading indicator)

**Step 1: Add loading state to function**

At the start of `loadTemplateWithProgression`, before try block:
```typescript
const loadTemplateWithProgression = async (variation: 'A' | 'B') => {
  setLoadingLastWorkout(true); // Reuse existing loading state
  setWorkoutVariation(variation);
  setWorkoutName(generateWorkoutName(selectedCategory, variation));

  try {
    // ... existing code ...
  } catch (error) {
    // ... existing error handling ...
  } finally {
    setLoadingLastWorkout(false);
  }
};
```

**Step 2: Verify loading state exists**

Check if `loadingLastWorkout` state exists (it should, based on LastWorkoutSummary usage)

**Step 3: Test loading indicator**

Click "Load Template" button and verify:
- Loading indicator appears
- Button is disabled during load
- Loading clears after exercises load

**Step 4: Commit**

```bash
git add components/Workout.tsx
git commit -m "feat: add loading state to template loading

Show loading indicator while fetching template from API.
Improves UX by preventing double-clicks and showing feedback.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Verification Steps

**Happy Path:**
1. Navigate to `/workout`
2. Select "Push" category
3. Click "Load Push Day A" button
4. Verify 6 exercises appear (Dumbbell Bench Press, etc.)
5. Verify each exercise has 3 sets
6. Verify workout can be logged normally

**Edge Cases:**
1. Load template for category with no last workout
2. Load template that doesn't exist in database (should gracefully handle)
3. Load template when API is slow (loading state should show)

**Regression:**
1. Verify lastWorkout fallback still works if template not found
2. Verify starting empty workout still works
3. Verify workout completion flow unchanged

---

## Expected Outcomes

**After Task 1:**
- ✅ templatesAPI imported successfully
- ✅ No TypeScript errors

**After Task 2:**
- ✅ "Load Template" button populates exercises
- ✅ Template exercises appear immediately
- ✅ Workout can be started with loaded exercises
- ✅ Fallback logic still works

**After Task 3:**
- ✅ Loading indicator shows during template fetch
- ✅ Button disabled during load
- ✅ Better UX feedback

---

## Alternative Solutions

**Option B: Use WorkoutBuilder component**
- More complex, requires modal flow
- Already works via Templates page
- Not needed for this fix

**Option C: Cache templates in Workout component**
- Could improve performance
- Adds complexity
- Can be future optimization

**Why Option A is best:**
- Simplest implementation
- Uses existing API
- Maintains consistency with templates page
- Fixes bug with minimal code

---

## Notes

- Template data structure uses `exerciseIds` not `sets` (see Issue #1)
- Default weight comes from `getDefaultWeight()` function
- Progressive overload fallback preserved for when templates don't exist
- Error handling ensures workout can still start even if template fetch fails

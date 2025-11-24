# Issue #9: Workout Builder: Missing 'Start Workout' button and template details not persisting

**Status:** 🔴 Open
**Labels:** none
**Created:** 11/24/2025
**Updated:** 11/24/2025

---

## Problem Description

When using the Workout Builder to create a workout template with detailed set information (weights, reps, rest times), those details are lost when starting the workout from the saved template.

### Issue 1: No "Start Workout" Button in Builder
After meticulously building a workout in the Workout Builder, there's only a "Save Template" button. To actually start the workout, you must:
1. Save the template
2. Navigate back to Dashboard
3. Click "Saved Workouts"
4. Find your template
5. Click "Begin Workout"

**Expected:** Workout Builder should have both "Save Template" AND "Start Workout" buttons.

### Issue 2: Template Details Not Loading
When saving a workout template with specific weights, reps, and rest times, those details are NOT preserved when starting the workout. Only the exercise IDs and default reps are loaded.

**Example:**
- **Saved:** Dumbbell Bench Press: 90 lbs × 10 reps, 90s rest (3 sets)
- **Loaded:** Dumbbell Bench Press: 0 lbs × 10 reps, 90s rest (hardcoded defaults)

All weights are reset to 0, forcing the user to re-enter everything they just meticulously planned.

## Root Cause

### Current Implementation
**WorkoutBuilderPage.tsx (Line 208):**
```typescript
const exerciseIds = selectedExercises.map(ex => ex.exerciseId);

await templatesAPI.create({
  name: workoutName.trim(),
  category,
  variation: 'A',
  exerciseIds,  // ❌ Only saving IDs, losing all set details
  isFavorite: false,
});
```

**WorkoutTemplatesPage.tsx (Lines 95-99):**
```typescript
sets: [
  { weight: 0, reps: 10, restSeconds: 90 },  // ❌ Hardcoded defaults
  { weight: 0, reps: 10, restSeconds: 90 },
  { weight: 0, reps: 10, restSeconds: 90 },
]
```

### Database Schema
The database **already has** a `sets` column ready to store this data:
```sql
CREATE TABLE workout_templates (
  ...
  exercise_ids TEXT, -- DEPRECATED: Old format
  sets TEXT,         -- ✅ JSON array of TemplateSet objects: [{exerciseId, weight, reps, restTimerSeconds}]
  ...
);
```

## Solution

### Changes Needed

1. **Backend Types** (`backend/types.ts`)
   - Update `WorkoutTemplate` interface to include `sets: TemplateSet[]`

2. **Database Functions** (`backend/database/database.ts`)
   - Update `createWorkoutTemplate()` to save `sets` column
   - Update `getWorkoutTemplates()` to load `sets` column
   - Update `updateWorkoutTemplate()` to update `sets` column

3. **Workout Builder** (`components/workout-builder/WorkoutBuilderPage.tsx`)
   - Save full `selectedExercises` array with all set details
   - Add "Start Workout" button alongside "Save Template"

4. **Template Loading** (`components/WorkoutTemplatesPage.tsx`)
   - Load actual saved set details instead of hardcoded defaults
   - Use `template.sets` when available, fallback to defaults only if null

### Data Structure

```typescript
interface TemplateSet {
  exerciseId: string;
  exerciseName: string;
  sets: Array<{
    weight: number | 'bodyweight';
    reps: number;
    restSeconds: number;
  }>;
}
```

## Steps to Reproduce

1. Navigate to Workout Builder
2. Add exercises: Dumbbell Bench Press, Tricep Extension, Kettlebell Press, TRX Pushup, Single Arm Incline Dumbbell Bench Press
3. Set specific weights for each exercise (e.g., 90 lbs, 50 lbs, 70 lbs)
4. Set rest times and reps for each set
5. Save as "Push Day A"
6. Navigate back to Dashboard → Saved Workouts → Push Day A → Begin Workout
7. **Observe:** All weights reset to 0, only exercise IDs and default reps preserved

## Impact

**User Frustration:** High - Users must re-enter all workout details they just planned, defeating the purpose of saving templates.

**Priority:** Medium-High - Core feature not working as expected, significant UX issue.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

**View on GitHub:** https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/9

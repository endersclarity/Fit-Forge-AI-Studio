# Workout Builder - Design Document

**Date:** 2025-11-16
**Status:** Approved
**Approach:** Hybrid Full Page (Split-screen with live preview)

## Overview

Replace the "Plan Workout" button functionality with a new workout builder that allows users to:
1. Build a workout by selecting multiple exercises
2. Optionally set target sets/reps/weight for each exercise
3. Reorder exercises via drag-and-drop
4. Either save as a template OR start the workout immediately

## User Requirements

- **Both options:** Save as template for later OR start immediately
- **Optional targets:** Can specify sets/reps/weight but not required
- **Reordering:** Drag-and-drop to arrange exercises
- **Filtering:** Search + category tabs (All / By Muscle / Categories)
- **Integration:** Uses existing streamlined logging flow (SetLoggerPage)
- **Storage:** New "Saved Workouts" section (separate from Templates for now)

## Architecture

### Route Structure

```
/workout/builder → WorkoutBuilderPage (new hybrid full-page)
```

### Page Layout

**Full-screen split layout:**
- Left Panel (40%): Exercise Library
- Right Panel (60%): Your Workout (selected exercises)
- Bottom Bar: Name input + action buttons

### Left Panel - Exercise Library

```
┌─────────────────────────────┐
│ Exercise Library            │
├─────────────────────────────┤
│ [🔍 Search exercises...]    │
├─────────────────────────────┤
│ [All] [By Muscle] [Categories] │
├─────────────────────────────┤
│ ⊕ Bench Press              │
│ ⊕ Squat                    │
│ ⊕ Deadlift                 │
│ ⊕ Pull-ups                 │
│ ⊕ Shoulder Press           │
│ ...                        │
└─────────────────────────────┘
```

**Features:**
- Real-time search filtering
- Three tabs:
  - **All:** Alphabetical list
  - **By Muscle:** Grouped by target muscle (Chest, Back, Legs, etc.)
  - **Categories:** Grouped by equipment (Barbell, Dumbbell, Bodyweight)
- Click exercise or "+" icon to add to right panel
- Visual feedback on add (brief highlight)

### Right Panel - Your Workout

```
┌─────────────────────────────────────┐
│ Your Workout (3 exercises)         │
├─────────────────────────────────────┤
│ ≡ Bench Press          [×]         │
│   Sets: [3] Reps: [10] Weight: [135] │
├─────────────────────────────────────┤
│ ≡ Squat                [×]         │
│   Sets: [3] Reps: [10] Weight: [ ] │
├─────────────────────────────────────┤
│ ≡ Pull-ups             [×]         │
│   Sets: [3] Reps: [10] Weight: [ ] │
└─────────────────────────────────────┘
```

**Features:**
- Drag handle (≡) for reordering
- Remove button (×) on each exercise
- Inline target inputs (optional, pre-filled with defaults: 3 sets, 10 reps)
- Empty state: "No exercises selected. Add from the library."

### Bottom Action Bar

```
┌─────────────────────────────────────────────────┐
│ [Workout name...        ] [Save Template] [Start Workout] │
└─────────────────────────────────────────────────┘
```

**Save Template flow:**
1. Validate name (required for save)
2. Save to localStorage (MVP) or API
3. Show success toast
4. Stay on page (can continue editing)

**Start Workout flow:**
1. Pre-populate WorkoutSessionContext with selected exercises
2. Navigate to `/workout/log`
3. Name optional (defaults to "Custom Workout")

## Data Model

### SavedWorkout Interface

```typescript
interface SavedWorkout {
  id: string;
  name: string;
  createdAt: number;
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    targetSets?: number;
    targetReps?: number;
    targetWeight?: number;
  }>;
}
```

### Storage

**MVP:** localStorage with key `fitforge_saved_workouts`

```typescript
// Save
const savedWorkouts = JSON.parse(localStorage.getItem('fitforge_saved_workouts') || '[]');
savedWorkouts.push(newWorkout);
localStorage.setItem('fitforge_saved_workouts', JSON.stringify(savedWorkouts));

// Load
const savedWorkouts = JSON.parse(localStorage.getItem('fitforge_saved_workouts') || '[]');
```

**Future:** Migrate to API endpoint for persistence across devices.

## Dashboard Integration

### New "Saved Workouts" Section

**Location:** Below Quick Actions or in its own card

**Layout (card-based list, inspired by FitBod):**
```
┌─────────────────────────────────────┐
│ Saved Workouts (2)                  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────┐     │
│ │ Push Day A                  │     │
│ │ 5 exercises                 │     │
│ │ Bench Press, Incline DB...  │     │
│ │                    [Start]  │     │
│ └─────────────────────────────┘     │
│ ┌─────────────────────────────┐     │
│ │ Leg Day                     │     │
│ │ 4 exercises                 │     │
│ │ Squat, Romanian Deadlift... │     │
│ │                    [Start]  │     │
│ └─────────────────────────────┘     │
└─────────────────────────────────────┘
```

**Each card shows:**
- Workout name (title)
- Exercise count
- Exercise preview (first 2-3 names, comma-separated)
- "Start" button (loads into session, navigates to logger)

**Empty state:** "No saved workouts yet. Create one with Plan Workout."

### Plan Workout Button

- Remains in Quick Actions
- Now navigates to `/workout/builder`
- Keep existing icon (📊)

## Integration with Existing Flow

### Starting a Saved Workout

1. User clicks "Start" on a saved workout card
2. Load saved workout data
3. Pre-populate WorkoutSessionContext:
   ```typescript
   // Set exercises in session
   savedWorkout.exercises.forEach(ex => {
     selectExercise(ex.exerciseId, ex.exerciseName);
     // Optionally show targets as hints in SetLoggerPage
   });
   ```
4. Navigate to `/workout/log` (SetLoggerPage)
5. User logs sets using existing flow
6. Targets shown as hints but not enforced

### SetLoggerPage Enhancements (Future)

Show target hints if available:
```
Target: 3×10 @ 135lb
```

User can deviate from plan freely.

## Files to Create/Modify

### New Files
- `components/workout-builder/WorkoutBuilderPage.tsx` - Main hybrid page
- `hooks/useSavedWorkouts.ts` - localStorage management hook
- `types/savedWorkouts.ts` - TypeScript interfaces

### Modified Files
- `App.tsx` - Add route for `/workout/builder`
- `components/Dashboard.tsx` - Add Saved Workouts section, update Plan Workout button
- `contexts/WorkoutSessionContext.tsx` - Add method to bulk-load exercises

## Success Criteria

1. User can build a workout in one screen (no page transitions during building)
2. Multi-select exercises with search and category filtering
3. Optional target inputs (sets/reps/weight) per exercise
4. Drag-and-drop reordering works smoothly
5. Save as template persists to localStorage
6. Start Workout uses existing streamlined logging flow
7. Dashboard shows saved workouts with Start button
8. Dark mode support throughout

## Out of Scope (Future)

- API persistence (use localStorage for MVP)
- Merging with existing Templates system
- Exercise thumbnails/images
- Superset grouping
- Warm-up/cool-down sections
- Sharing workouts
- Target hints in SetLoggerPage (nice-to-have)

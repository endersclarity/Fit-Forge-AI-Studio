# Workout Flow Redesign - Stateless Page-Based Approach

**Date:** 2025-11-16
**Status:** Design Validated
**Approach:** A - Stateless Page-Based (Full Screen Transitions)

## Problem Statement

Current "Start Custom Workout" flow requires 6+ screens before logging first set:
- Workout type selection
- Naming the workout
- A/B designation
- Template loading prompts
- Planning screens

Users need to log sets immediately. Progressive disclosure should reveal complexity only when needed.

## Design Decision

**Chosen:** Approach A - Stateless Page-Based
- Full-screen transitions between focused screens
- Each screen has ONE purpose
- Summary only visible at end
- Browser back button works naturally

**Rejected Alternatives:**
- B (Modal-based): May feel disruptive, modals add cognitive overhead
- C (FitFlow bottom-up): More complex state management, optimized for multiple sets but user prefers clean transitions

## User Flow

1. **Dashboard** → Click "Start Workout"
2. **Exercise Picker** (`/workout/select`) → Full list, searchable
3. **Set Logger** (`/workout/log`) → Large weight/reps inputs (text-4xl+)
4. Log multiple sets (stays on same screen)
5. "Different Exercise" → Back to picker
6. "Finish Workout" → Summary screen
7. **Summary** (`/workout/summary`) → All logged sets
8. Optional: "Save as Template" → Reuses existing template API
9. "Save & Exit" → Persists to backend, returns to dashboard

## Technical Architecture

### Route Structure
```
/workout/select     → ExercisePickerPage
/workout/log        → SetLoggerPage
/workout/summary    → WorkoutSummaryPage
```

### State Management
React Context or parent component holds session:
```typescript
interface WorkoutSession {
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    sets: Array<{ weight: number; reps: number }>
  }>;
  startTime: Date;
}
```

### Component Responsibilities

**ExercisePickerPage:**
- Displays exercise list (from existing EXERCISE_LIBRARY)
- Searchable/filterable
- Click exercise → Navigate to SetLoggerPage with exercise in state

**SetLoggerPage:**
- Exercise name header
- Large weight input (text-4xl, min 48px touch target)
- Large reps input (text-4xl, min 48px touch target)
- "Log Set" button → Adds to session, stays on page
- "Different Exercise" button → Back to picker
- "Finish Workout" button → Navigate to summary

**WorkoutSummaryPage:**
- Lists all exercises with their sets
- "Save & Exit" → POST to workouts API
- Optional "Save as Template" → POST to templates API (nice-to-have)

## Design Constraints

- **Minimal inputs:** Weight (lbs), Reps only. No RIR, notes, or other clutter
- **Large typography:** text-4xl or text-5xl for input values (gym visibility)
- **Touch targets:** 48px minimum for all interactive elements
- **Dark mode support:** Light-first pattern (bg-slate-50 dark:bg-brand-dark)
- **No new backend work:** Reuses existing workouts and templates APIs

## Implementation Scope

**Core (must have):**
- ExercisePickerPage component
- SetLoggerPage component
- WorkoutSummaryPage component
- Workout session context/state
- Routes in App.tsx
- Backend persistence (uses existing POST /workouts)

**Nice-to-have (defer if complex):**
- "Save as Template" on summary screen
- Rest timer button (optional, small icon)

## Success Criteria

- User can log first set within 2 screens (picker → logger)
- No planning/naming required before logging
- Clean, focused UI with large touch targets
- Existing backend API compatibility maintained

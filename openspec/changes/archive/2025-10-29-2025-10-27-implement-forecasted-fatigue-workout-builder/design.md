# Design: Forecasted Fatigue Workout Builder (MVP)

**Change ID:** `implement-forecasted-fatigue-workout-builder`
**Status:** In Development
**Scope:** MVP - Forward Planning Mode Only

---

## Overview

This design implements an MVP of the forecasted fatigue workout builder, focusing on **forward planning mode**: users manually select exercises and input volume, then see forecasted muscle fatigue before executing the workout.

**Out of Scope for MVP:**
- Volume sliders (0-100%) - use manual entry instead
- Backward mode (target-driven planning)
- Workout templates/saving
- Multi-day planning

---

## Architecture

### Key Insight: Reuse Existing Calculation Logic

The app already calculates muscle fatigue in real-time during workouts. We can extract this logic into a reusable utility function and call it **before** workout execution.

**Existing Calculation (Workout.tsx:528-570):**
```typescript
// For each exercise in workout
const exerciseVolume = sets.reduce((total, set) => total + (set.weight * set.reps), 0);

// For each muscle engagement
const muscleVolume = exerciseVolume * (engagement.percentage / 100);

// Total fatigue for muscle
const fatiguePercent = Math.min((totalMuscleVolume / muscleBaseline) * 100, 100);
```

---

## Data Structures

### PlannedExercise
```typescript
interface PlannedExercise {
  exercise: Exercise;  // From EXERCISE_LIBRARY
  sets: number;
  reps: number;
  weight: number;
}
```

### WorkoutPlan
```typescript
interface WorkoutPlan {
  plannedExercises: PlannedExercise[];
  currentMuscleStates: MuscleStatesResponse;  // From API
  forecastedMuscleStates: Record<Muscle, ForecastedMuscleState>;
}
```

### ForecastedMuscleState
```typescript
interface ForecastedMuscleState {
  muscle: Muscle;
  currentFatiguePercent: number;  // Before workout
  forecastedFatiguePercent: number;  // After planned workout
  volumeAdded: number;  // lbs
  baseline: number;  // lbs
}
```

---

## Components

### 1. WorkoutPlannerModal (New)

**Location:** `components/WorkoutPlannerModal.tsx`

**Responsibility:** Full-screen modal for planning workouts

**State:**
- `plannedExercises: PlannedExercise[]`
- `isExerciseSelectorOpen: boolean`

**UI Layout:**
```
┌─────────────────────────────────────────────┐
│ Plan Workout                          [×]   │
├─────────────────────────────────────────────┤
│ CURRENT STATE        │  FORECASTED STATE    │
│ ┌─────────────────┐  │  ┌─────────────────┐│
│ │ Muscle Viz      │  │  │ Muscle Viz      ││
│ │ (now)           │  │  │ (after planned) ││
│ └─────────────────┘  │  └─────────────────┘│
├──────────────────────┴─────────────────────┤
│ Planned Exercises:                          │
│ 1. Dumbbell Bench Press                     │
│    Sets: [3] Reps: [10] Weight: [50] lbs   │
│    Impact: Pec +40%, Tri +20%, Delt +15%    │
│    [Remove]                                 │
│                                             │
│ [+ Add Exercise]                            │
├─────────────────────────────────────────────┤
│ [Cancel]              [Start This Workout] │
└─────────────────────────────────────────────┘
```

**Props:**
```typescript
interface WorkoutPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout: (plan: PlannedExercise[]) => void;
}
```

---

### 2. PlannedExerciseList (New)

**Location:** `components/PlannedExerciseList.tsx`

**Responsibility:** Display and edit list of planned exercises

**Props:**
```typescript
interface PlannedExerciseListProps {
  exercises: PlannedExercise[];
  onUpdate: (index: number, updated: PlannedExercise) => void;
  onRemove: (index: number) => void;
  muscleBaselines: Record<Muscle, number>;
}
```

**Features:**
- Number inputs for sets, reps, weight
- Shows muscle impact per exercise (e.g., "Pec +40%")
- Remove button per exercise
- Auto-calculates muscle impact in real-time

---

### 3. ForecastVisualization (Reuse + Enhance)

**Approach:** Reuse existing `MuscleVisualization` component

**Changes:**
- Pass forecasted states instead of current states
- Add props to distinguish "Current" vs "Forecasted" labeling

---

## Utility Functions

### calculateForecastedFatigue()

**Location:** `utils/workoutPlanner.ts` (new file)

```typescript
export function calculateForecastedFatigue(
  plannedExercises: PlannedExercise[],
  muscleBaselines: Record<Muscle, number>
): Record<Muscle, ForecastedMuscleState> {

  const muscleVolumes: Record<Muscle, number> = {}
;

  // Initialize all muscles to 0
  ALL_MUSCLES.forEach(muscle => {
    muscleVolumes[muscle] = 0;
  });

  // Calculate volume per muscle
  for (const planned of plannedExercises) {
    const exerciseVolume = planned.sets * planned.reps * planned.weight;

    for (const engagement of planned.exercise.muscleEngagements) {
      muscleVolumes[engagement.muscle] += exerciseVolume * (engagement.percentage / 100);
    }
  }

  // Convert to fatigue percentages
  const result: Record<Muscle, ForecastedMuscleState> = {};

  for (const muscle of ALL_MUSCLES) {
    const baseline = muscleBaselines[muscle] || 1000; // Default if not set
    const volumeAdded = muscleVolumes[muscle];
    const forecastedFatiguePercent = Math.min((volumeAdded / baseline) * 100, 100);

    result[muscle] = {
      muscle,
      currentFatiguePercent: 0, // Will be populated from API
      forecastedFatiguePercent,
      volumeAdded,
      baseline
    };
  }

  return result;
}
```

---

## User Flow

### 1. Opening Planner

```
Dashboard
  → Click "Plan Workout" button (new, next to "Start Custom Workout")
  → WorkoutPlannerModal opens full-screen
  → Fetches current muscle states from API
  → Shows current muscle visualization
```

### 2. Adding Exercises

```
Plan Workout Modal
  → Click "+ Add Exercise"
  → ExerciseSelector modal opens (reuse from Workout.tsx)
  → User selects exercise
  → Exercise added to plannedExercises with default values (3 sets, 10 reps, 50 lbs)
  → User adjusts sets/reps/weight via number inputs
  → Forecasted visualization updates in real-time
```

### 3. Viewing Forecast

```
As user adds/edits/removes exercises:
  → calculateForecastedFatigue() runs
  → Right panel shows forecasted muscle state
  → Color-coded by fatigue level:
    - Green (0-33%): Ready
    - Yellow (34-66%): Moderate
    - Red (67-100%): Fatigued
```

### 4. Starting Workout

```
Plan Workout Modal
  → Click "Start This Workout"
  → Modal closes
  → App navigates to workout execution (existing Workout component)
  → Planned exercises pre-populate as initial exercises
  → User logs sets as normal
```

---

## API Integration

### No New APIs Required

**Existing APIs Used:**
- `GET /api/muscle-states` - Fetch current muscle states
- `GET /api/muscle-baselines` - Fetch muscle baselines for calculation
- `POST /api/workout` - Create workout from plan (existing flow)

---

## State Management

### Option 1: Local Component State (Recommended for MVP)

```typescript
function WorkoutPlannerModal() {
  const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>([]);
  const [muscleBaselines, setMuscleBaselines] = useState<Record<Muscle, number>>({});

  // Fetch on mount
  useEffect(() => {
    fetchMuscleBaselines().then(setMuscleBaselines);
  }, []);

  // Calculate forecast whenever exercises change
  const forecastedStates = useMemo(() =>
    calculateForecastedFatigue(plannedExercises, muscleBaselines),
    [plannedExercises, muscleBaselines]
  );

  return (
    // ... UI
  );
}
```

**Pros:**
- Simple, no global state
- Ephemeral (disappears on close)
- Fast, no persistence overhead

**Cons:**
- Lost on page refresh (acceptable for MVP)

---

## Performance Considerations

### Real-Time Calculation

- `calculateForecastedFatigue()` runs on every exercise add/edit/remove
- Complexity: O(exercises × muscleEngagements) = O(10 × 4) ≈ 40 operations
- Expected performance: <10ms (negligible)
- Use `useMemo` to prevent unnecessary recalculations

### No Backend Calls During Planning

- All calculation happens client-side
- Only API calls: initial fetch of baselines/states
- Fast, responsive UX

---

## Validation & Edge Cases

### 1. No Muscle Baselines Set

**Scenario:** New user hasn't set baselines yet

**Solution:**
- Show warning: "Set muscle baselines in Profile to see accurate forecasts"
- Use default baselines (e.g., 5000 lbs per muscle)
- Still allow planning, but mark forecast as "Estimated"

### 2. Empty Plan

**Scenario:** User clicks "Start This Workout" with no exercises

**Solution:**
- Disable "Start This Workout" button if `plannedExercises.length === 0`
- Show message: "Add at least one exercise to start"

### 3. Invalid Inputs

**Scenario:** User enters 0 or negative values

**Solution:**
- Number inputs have `min="1"` constraint
- Validate on change: `Math.max(1, value)`

### 4. Forecast >100%

**Scenario:** User plans extreme workout (forecast shows >100% fatigue)

**Solution:**
- Cap display at 100% (`Math.min(fatiguePercent, 100)`)
- Show warning: "⚠️ High fatigue - consider reducing volume"

---

## Testing Strategy

### Unit Tests

```typescript
describe('calculateForecastedFatigue', () => {
  it('calculates fatigue for single exercise', () => {
    const planned: PlannedExercise[] = [{
      exercise: DUMBBELL_BENCH_PRESS,
      sets: 3,
      reps: 10,
      weight: 50
    }];
    const baselines = { [Muscle.Pectoralis]: 5000 };
    const result = calculateForecastedFatigue(planned, baselines);

    // 3 sets × 10 reps × 50 lbs = 1500 lbs
    // Pectoralis engagement: 86%
    // 1500 × 0.86 = 1290 lbs
    // 1290 / 5000 × 100 = 25.8%
    expect(result[Muscle.Pectoralis].forecastedFatiguePercent).toBeCloseTo(25.8);
  });

  it('combines multiple exercises correctly', () => {
    // Test cumulative fatigue from multiple exercises
  });

  it('caps fatigue at 100%', () => {
    // Test extreme workout doesn't exceed 100%
  });
});
```

### Integration Tests

1. **Add exercise → Forecast updates**
   - Open planner
   - Add exercise
   - Verify forecasted viz reflects change

2. **Edit sets/reps/weight → Forecast updates**
   - Modify inputs
   - Verify forecast recalculates

3. **Remove exercise → Forecast updates**
   - Remove exercise
   - Verify forecast reverts

4. **Start workout → Pre-populates exercises**
   - Plan workout with 3 exercises
   - Start workout
   - Verify exercises appear in execution mode

### Manual Validation

1. **Plan → Execute → Compare**
   - Plan workout with forecast
   - Execute workout
   - Compare forecasted fatigue vs actual (from Muscle Capacity panel)
   - Track accuracy over 5 workouts
   - Adjust calculation if needed

---

## Future Enhancements (Post-MVP)

### V1.1 - Smart Defaults
- Auto-suggest sets/reps/weight from last workout
- "Repeat Last Workout" quick action

### V1.2 - Volume Sliders
- Add slider UI (0-100% intensity)
- Requires PR tracking and baselines

### V2.0 - Backward Mode
- Set fatigue targets per muscle
- Auto-recommend exercises to hit targets

### V2.1 - Templates
- Save workout plans
- Load previous plans

---

## Implementation Estimate

**Total:** ~40 hours (1 week)

- **Day 1 (8h):**
  - Create `utils/workoutPlanner.ts` with `calculateForecastedFatigue()`
  - Unit tests for calculation logic

- **Day 2 (8h):**
  - Create `WorkoutPlannerModal` component
  - Create `PlannedExerciseList` component
  - Add "Plan Workout" button to Dashboard

- **Day 3 (8h):**
  - Integrate MuscleVisualization for current state
  - Integrate MuscleVisualization for forecasted state
  - Side-by-side layout

- **Day 4 (8h):**
  - Exercise selector integration
  - Real-time forecast updates
  - Muscle impact display per exercise

- **Day 5 (8h):**
  - "Start This Workout" flow
  - Pre-populate exercises in Workout component
  - End-to-end testing
  - Bug fixes and polish

---

## Success Criteria

✅ User can click "Plan Workout" button
✅ User can add exercises to plan (without executing)
✅ User can input sets/reps/weight for each planned exercise
✅ User sees current muscle fatigue state
✅ User sees forecasted post-workout muscle fatigue state
✅ Forecast updates in real-time as exercises added/removed
✅ User can click "Start This Workout" to execute the plan
✅ Planned exercises pre-populate in workout execution mode
✅ Forecast accuracy within ±15% of actual (measured over 10 workouts)

---

## Files to Create

1. `utils/workoutPlanner.ts` - Forecast calculation utility
2. `components/WorkoutPlannerModal.tsx` - Main planning modal
3. `components/PlannedExerciseList.tsx` - Exercise list editor
4. `utils/workoutPlanner.test.ts` - Unit tests

## Files to Modify

1. `components/Dashboard.tsx` - Add "Plan Workout" button
2. `components/Workout.tsx` - Accept pre-populated exercises from plan
3. `types.ts` - Add `PlannedExercise` and `ForecastedMuscleState` types

---

## Dependencies

✅ **Already Exist:**
- Exercise library (constants.ts)
- Muscle engagement data (constants.ts)
- Muscle baselines API (GET /api/muscle-baselines)
- Muscle states API (GET /api/muscle-states)
- MuscleVisualization component
- ExerciseSelector component

❌ **Need to Create:**
- Forecast calculation utility
- Planning UI components
- New TypeScript types

---

## Notes

- This MVP delivers the core "killer feature" value: see fatigue forecast before executing
- Cuts scope from 2-3 weeks to ~1 week by focusing on forward mode only
- Reuses 80% of existing code (calculation logic, visualization, exercise selection)
- Can iterate based on user feedback before investing in volume sliders and backward mode

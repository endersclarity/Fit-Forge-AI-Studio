# Design: Progressive Overload System

**Change ID:** `enable-progressive-overload-system`
**Status:** Draft
**Created:** 2025-10-26

---

## Overview

This document defines the technical architecture, algorithms, and UI/UX patterns for the progressive overload guidance system.

---

## Core Algorithms

### 1. Progressive Suggestion Calculation

**Purpose:** Calculate both +3% weight and +3% reps options from last performance

**Algorithm:**

```typescript
function getProgressiveSuggestions(exerciseName: string): ProgressiveSuggestion | null {
  // Step 1: Get last two workouts containing this exercise
  const lastWorkout = getLastWorkoutWithExercise(exerciseName);
  const previousWorkout = getPreviousWorkoutWithExercise(exerciseName);

  if (!lastWorkout) {
    return null; // No history, user must establish baseline
  }

  // Step 2: Use FIRST set from last workout (best fresh performance)
  const lastSet = lastWorkout.sets[0];

  // Step 3: Determine which method was used last time
  let lastMethod: "weight" | "reps" | "none" = "none";

  if (previousWorkout) {
    const prevSet = previousWorkout.sets[0];

    if (lastSet.weight > prevSet.weight && lastSet.reps === prevSet.reps) {
      lastMethod = "weight"; // Weight increased, reps stayed same
    } else if (lastSet.reps > prevSet.reps && lastSet.weight === prevSet.weight) {
      lastMethod = "reps"; // Reps increased, weight stayed same
    }
    // else: both changed, neither changed, or both decreased → "none"
  }

  // Step 4: Calculate both +3% options
  const weightSuggestion = {
    weight: Math.round(lastSet.weight * 1.03), // Round to nearest lb/kg
    reps: lastSet.reps, // Keep reps same
    method: "weight" as const
  };

  const repsSuggestion = {
    weight: lastSet.weight, // Keep weight same
    reps: Math.ceil(lastSet.reps * 1.03), // Round up (can't do 0.3 reps)
    method: "reps" as const
  };

  // Step 5: Determine recommended method (alternate from last)
  const suggestedMethod = lastMethod === "weight" ? "reps" :
                          lastMethod === "reps" ? "weight" :
                          "reps"; // Default to reps if unclear

  return {
    lastPerformance: lastSet,
    lastMethod: lastMethod,
    weightOption: weightSuggestion,
    repsOption: repsSuggestion,
    suggested: suggestedMethod,
    daysAgo: calculateDaysAgo(lastWorkout.date)
  };
}
```

**Key Design Decisions:**

1. **Use first set as baseline:** First set = freshest state = true capacity indicator
2. **Round weight to whole numbers:** Practical for most equipment (5lb/2kg plates)
3. **Round reps UP:** Can't do partial reps, err on side of challenge
4. **Infer method from history:** Don't need explicit storage, calculate from data
5. **Default to reps:** Safer for joints, easier to achieve, when unsure

---

### 2. Last Method Detection

**Purpose:** Determine which progression method was used in previous workout

**Logic:**

```typescript
function detectLastMethod(
  currentSet: { weight: number; reps: number },
  previousSet: { weight: number; reps: number }
): "weight" | "reps" | "none" {

  const weightIncreased = currentSet.weight > previousSet.weight;
  const repsIncreased = currentSet.reps > previousSet.reps;
  const weightDecreased = currentSet.weight < previousSet.weight;
  const repsDecreased = currentSet.reps < previousSet.reps;

  // Clear weight progression
  if (weightIncreased && !repsIncreased && !repsDecreased) {
    return "weight";
  }

  // Clear reps progression
  if (repsIncreased && !weightIncreased && !weightDecreased) {
    return "reps";
  }

  // Ambiguous or no progression
  return "none";
}
```

**Edge Cases:**

- Both increased → "none" (custom progression, don't assume pattern)
- Both decreased → "none" (deload, injury recovery, don't recommend)
- One up, one down → "none" (unusual, let user decide)
- Same values → "none" (maintenance, no progression)

---

### 3. Variation Intelligence

**Purpose:** Suggest opposite A/B variation for balanced training

**Algorithm:**

```typescript
function suggestWorkoutVariation(category: ExerciseCategory): {
  suggested: "A" | "B";
  lastVariation: "A" | "B" | null;
  lastDate: string | null;
} {
  // Find most recent workout in this category
  const lastWorkout = db.prepare(`
    SELECT variation, date
    FROM workouts
    WHERE user_id = ? AND category = ?
    ORDER BY date DESC
    LIMIT 1
  `).get(1, category);

  if (!lastWorkout) {
    return {
      suggested: "A", // Default to A for first workout
      lastVariation: null,
      lastDate: null
    };
  }

  // Suggest opposite of what was done last time
  const suggested = lastWorkout.variation === "A" ? "B" : "A";

  return {
    suggested,
    lastVariation: lastWorkout.variation,
    lastDate: lastWorkout.date
  };
}
```

**Design Rationale:**

- Simple alternating pattern (A → B → A → B)
- No complex tracking needed, just look at last workout
- User can override if they want to repeat variation
- Encourages balanced muscle development

---

## UI/UX Design

### Two-Button Progressive Interface

**Component Structure:**

```typescript
interface ProgressiveSuggestionButtonsProps {
  exerciseName: string;
  onSelect: (weight: number, reps: number, method: "weight" | "reps") => void;
}

function ProgressiveSuggestionButtons({ exerciseName, onSelect }: Props) {
  const suggestions = useFetch(`/api/progressive-suggestions?exercise=${exerciseName}`);

  if (!suggestions) {
    return <div>No history - establish baseline</div>;
  }

  return (
    <div className="progressive-suggestions">
      {/* Last Performance Context */}
      <div className="last-performance">
        Last: {suggestions.lastPerformance.reps} reps @ {suggestions.lastPerformance.weight}lbs
        <span className="days-ago">({suggestions.daysAgo} days ago)</span>
        {suggestions.lastMethod !== "none" && (
          <span className="last-method">Used: +{suggestions.lastMethod.toUpperCase()}</span>
        )}
      </div>

      {/* Progressive Options */}
      <div className="suggestion-buttons">
        <button
          className={`suggestion-btn ${suggestions.suggested === "weight" ? "recommended" : ""}`}
          onClick={() => onSelect(
            suggestions.weightOption.weight,
            suggestions.weightOption.reps,
            "weight"
          )}
        >
          <div className="method-label">
            {suggestions.suggested === "weight" && "💪"} +WEIGHT
            {suggestions.suggested === "weight" && <span className="rec">(Recommended)</span>}
          </div>
          <div className="values">
            {suggestions.weightOption.reps} reps @ {suggestions.weightOption.weight}lbs
          </div>
        </button>

        <button
          className={`suggestion-btn ${suggestions.suggested === "reps" ? "recommended" : ""}`}
          onClick={() => onSelect(
            suggestions.repsOption.weight,
            suggestions.repsOption.reps,
            "reps"
          )}
        >
          <div className="method-label">
            {suggestions.suggested === "reps" && "💪"} +REPS
            {suggestions.suggested === "reps" && <span className="rec">(Recommended)</span>}
          </div>
          <div className="values">
            {suggestions.repsOption.reps} reps @ {suggestions.repsOption.weight}lbs
          </div>
        </button>
      </div>

      {/* Manual Override */}
      <div className="manual-entry-label">Or enter custom:</div>
    </div>
  );
}
```

**Visual Design:**

```
┌─────────────────────────────────────────────────────┐
│ Pull-ups                                            │
│                                                     │
│ Last: 30 reps @ 200lbs (3 days ago) Used: +REPS   │
│                                                     │
│ ┌──────────────────────┐  ┌──────────────────────┐ │
│ │  💪 +WEIGHT         │  │      +REPS           │ │
│ │  (Recommended)       │  │                      │ │
│ │                      │  │                      │ │
│ │  30 reps @ 206lbs    │  │  31 reps @ 200lbs    │ │
│ └──────────────────────┘  └──────────────────────┘ │
│                                                     │
│ Or enter custom:                                    │
│ Weight: [______]  Reps: [______]                    │
└─────────────────────────────────────────────────────┘
```

**Interaction Flow:**

1. User starts workout (or loads template)
2. For each exercise, progressive suggestions load
3. User sees last performance context
4. User sees both options with visual recommendation
5. User taps preferred button
6. Weight and reps fields auto-fill
7. User can still adjust manually if needed
8. User logs set normally

**Design Principles:**

- **Clarity:** Last performance context always visible
- **Choice:** Both options presented equally (not hidden)
- **Guidance:** Visual indicator on recommended option
- **Speed:** One-tap auto-fill for quick starts
- **Flexibility:** Manual entry remains accessible
- **Progressive Disclosure:** Collapse to compact view after selection (optional)

---

## Data Model

### No Schema Changes Required

All data derived from existing tables:

**Query for Last Performance:**
```sql
-- Get last workout containing this exercise
SELECT w.id, w.date, es.weight, es.reps, es.set_number
FROM workouts w
JOIN exercise_sets es ON w.id = es.workout_id
WHERE w.user_id = ? AND es.exercise_name = ?
ORDER BY w.date DESC, es.set_number ASC
LIMIT 1
```

**Query for Previous Performance:**
```sql
-- Get second-to-last workout containing this exercise
SELECT w.id, w.date, es.weight, es.reps, es.set_number
FROM workouts w
JOIN exercise_sets es ON w.id = es.workout_id
WHERE w.user_id = ? AND es.exercise_name = ?
ORDER BY w.date DESC, es.set_number ASC
LIMIT 1 OFFSET 1
```

**Query for Last Variation:**
```sql
-- Get last workout in category
SELECT variation, date
FROM workouts
WHERE user_id = ? AND category = ?
ORDER BY date DESC
LIMIT 1
```

### TypeScript Types

```typescript
export interface ProgressiveOption {
  weight: number;
  reps: number;
  method: "weight" | "reps";
}

export interface ProgressiveSuggestion {
  lastPerformance: {
    weight: number;
    reps: number;
    date: string;
  };
  lastMethod: "weight" | "reps" | "none";
  weightOption: ProgressiveOption;
  repsOption: ProgressiveOption;
  suggested: "weight" | "reps";
  daysAgo: number;
}

export interface WorkoutVariationSuggestion {
  suggested: "A" | "B";
  lastVariation: "A" | "B" | null;
  lastDate: string | null;
}
```

---

## API Endpoints

### New Endpoint: Progressive Suggestions

**Request:**
```
GET /api/progressive-suggestions?exercise=Pull-ups
```

**Response:**
```json
{
  "lastPerformance": {
    "weight": 200,
    "reps": 30,
    "date": "2025-10-22"
  },
  "lastMethod": "reps",
  "weightOption": {
    "weight": 206,
    "reps": 30,
    "method": "weight"
  },
  "repsOption": {
    "weight": 200,
    "reps": 31,
    "method": "reps"
  },
  "suggested": "weight",
  "daysAgo": 3
}
```

**Error Response (No History):**
```json
{
  "error": "No history found for exercise: Pull-ups"
}
```

### Enhanced Endpoint: Last Workout by Category

**Request:**
```
GET /api/last-workout?category=Push
```

**Response:**
```json
{
  "variation": "A",
  "date": "2025-10-23",
  "suggestedVariation": "B"
}
```

---

## Performance Considerations

### Query Optimization

**Current Performance:**
- Single exercise query: ~5-10ms (with indexes)
- All exercises in template (6 exercises): ~30-60ms
- Acceptable for workout start flow

**Optimization Strategies:**

1. **Batch Queries:** Single query for all exercises in template
```sql
SELECT exercise_name, weight, reps, date
FROM (
  SELECT es.exercise_name, es.weight, es.reps, w.date,
         ROW_NUMBER() OVER (PARTITION BY es.exercise_name ORDER BY w.date DESC, es.set_number ASC) as rn
  FROM exercise_sets es
  JOIN workouts w ON es.workout_id = w.id
  WHERE w.user_id = ? AND es.exercise_name IN (?, ?, ?, ...)
)
WHERE rn <= 2  -- Get last 2 performances for each exercise
```

2. **Cache in Memory:** Store suggestions during workout (clear on save)

3. **Lazy Loading:** Load suggestions as user scrolls to exercise (not critical for MVP)

### UI Performance

- Suggestions load asynchronously (non-blocking)
- Manual entry always available (no waiting)
- Optimistic UI updates (instant feedback)

---

## Edge Cases & Handling

### 1. No History for Exercise
**Scenario:** User tries new exercise
**Handling:** Show "No history" message, allow manual entry, establish baseline

### 2. Only One Previous Workout
**Scenario:** Second time doing exercise
**Handling:** Can calculate +3%, but lastMethod = "none" (no pattern yet)

### 3. Large Weight Gaps
**Scenario:** Last: 200lbs, Suggested: 206lbs, but only 10lb plates available
**Handling:** User adjusts manually to 210lbs, system adapts next time

### 4. Bodyweight Exercises
**Scenario:** Pull-ups with "weight" = bodyweight
**Handling:** Still calculate +3%, user adds vest/belt weight if desired

### 5. Regression (Performance Decreased)
**Scenario:** Last: 30 reps, Previous: 35 reps (went down)
**Handling:** Still suggest +3% from current (30 → 31), help user recover

### 6. Custom Equipment Increments
**Scenario:** Kettlebells (8kg, 12kg, 16kg jumps)
**Handling:** Manual adjustment, future: equipment-aware suggestions

---

## Testing Strategy

### Unit Tests (Backend)

```typescript
describe("getProgressiveSuggestions", () => {
  it("calculates +3% weight correctly", () => {
    // Test: 100lbs → 103lbs
  });

  it("calculates +3% reps correctly", () => {
    // Test: 10 reps → 11 reps (rounds up)
  });

  it("detects weight method from history", () => {
    // Test: 100lbs→105lbs, 10 reps→10 reps = "weight"
  });

  it("detects reps method from history", () => {
    // Test: 100lbs→100lbs, 10 reps→11 reps = "reps"
  });

  it("defaults to reps when method unclear", () => {
    // Test: both changed → suggests "reps"
  });

  it("returns null when no history", () => {
    // Test: new exercise → null
  });
});
```

### Integration Tests

- Load template → suggestions appear for each exercise
- Tap +Weight button → fields auto-fill correctly
- Tap +Reps button → fields auto-fill correctly
- Manual entry overrides suggestions
- Save workout → next time shows new baseline

### Manual Testing Checklist

- [ ] First time exercise shows "No history"
- [ ] Second time shows suggestions but lastMethod = "none"
- [ ] Third time alternates correctly
- [ ] Weight suggestion rounds correctly (e.g., 103.4 → 103)
- [ ] Reps suggestion rounds up (e.g., 10.3 → 11)
- [ ] Recommended option has visual indicator
- [ ] Both buttons are tappable
- [ ] Auto-fill works correctly
- [ ] Manual entry still works
- [ ] Works on mobile (responsive)

---

## Future Enhancements

### Post-MVP Features (Not in This Change)

1. **Custom Progression Percentages**
   - Allow user to set 2%, 5%, 10% instead of fixed 3%
   - Exercise-specific rates (isolation vs compound)

2. **Deload Week Detection**
   - Detect when user consistently struggles
   - Suggest intentional 10% reduction for recovery

3. **Micro-Loading Suggestions**
   - For advanced users with fractional plates
   - Suggest 0.5lb, 1lb micro-increments

4. **Progression Analytics**
   - Charts showing weight/reps progression over time
   - Velocity of progression per exercise
   - Plateau detection

5. **Equipment-Aware Rounding**
   - Know user's available plates/dumbbells
   - Round to achievable increments
   - Suggest "add 2.5lbs each side" instead of just "5lbs total"

---

## Rollback Plan

**If Issues Arise Post-Deployment:**

1. **Quick Disable (< 5 minutes):**
   - Add feature flag: `ENABLE_PROGRESSIVE_SUGGESTIONS = false`
   - Deploy flag change
   - UI reverts to manual entry only

2. **Full Rollback:**
   - Revert commits
   - No database changes to undo
   - No data loss (feature is additive)

3. **Partial Rollback:**
   - Keep backend logic, remove UI buttons
   - Or keep UI, fix calculation bugs independently

---

## Success Criteria

**Definition of Done:**

- [ ] API returns correct progressive suggestions
- [ ] Both options calculate accurately (+3%)
- [ ] Method detection works (weight vs reps)
- [ ] UI displays both buttons with context
- [ ] Recommended option visually indicated
- [ ] Tap button → auto-fills fields
- [ ] Manual entry remains functional
- [ ] No history → graceful fallback
- [ ] Edge cases handled
- [ ] Tests pass (unit + integration)
- [ ] Performance acceptable (< 100ms)
- [ ] Mobile responsive
- [ ] No breaking changes

---

*This design document serves as the technical specification for implementing the progressive overload system. All implementation should follow these patterns and algorithms.*

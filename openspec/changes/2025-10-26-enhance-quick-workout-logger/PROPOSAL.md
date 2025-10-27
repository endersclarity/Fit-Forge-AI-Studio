# Proposal: Enhance Quick Workout Logger for Multi-Set, Multi-Exercise Workouts

**Change ID:** `enhance-quick-workout-logger`
**Status:** Draft
**Created:** 2025-10-26
**Priority:** High (Core UX improvement)

---

## Executive Summary

Transform the current single-set Quick Add feature into a full Quick Workout Logger that supports logging complete workouts retroactively. Users can now log multiple exercises with multiple sets each, all within one modal session, making it trivial to record workouts done away from the computer.

**Problem:** Current Quick Add only logs one set at a time. To log a 3-exercise, 9-set workout, users must open/close the modal 9 times. This makes retroactive logging painful and discourages consistent tracking.

**Solution:** Enhance Quick Add into a stateful workout builder that:
1. Accumulates exercises and sets in-memory before saving
2. Provides "Another Set" button to add sets to current exercise
3. Provides "Add Exercise" button to log additional exercises
4. Saves everything as one workout session on "Finish Workout"
5. Auto-detects workout category/variation from logged exercises

**Impact:** Dramatically improves retroactive logging UX, making it practical to log workouts done hours earlier with multiple exercises and sets.

---

## Why

### Current State

**What Exists:**
- ✅ Quick Add FAB on Dashboard
- ✅ Exercise picker with search
- ✅ Single-set input form with smart defaults (weight/reps from history)
- ✅ `quickAddAPI.quickAdd()` endpoint
- ✅ PR detection on single sets
- ✅ Dashboard auto-refresh after logging

**Pain Points:**
- ❌ Only logs ONE set per modal open
- ❌ To log 3 sets of pushups: open modal → log → close → repeat 3x
- ❌ To log 3-exercise workout (9 sets total): 9 separate modal opens
- ❌ No visual confirmation of what's been logged until closing
- ❌ Each set creates separate "workout" in database (no grouping)
- ❌ Uses browser `alert()` for feedback instead of Toast

### Use Case

**User Story:**
> "I did a workout this morning before work: 3 sets of pushups, 3 sets of pullups, 2 sets of dips. Now I'm at my computer and want to log it. The current Quick Add is tedious - I have to open/close the modal 8 times."

**Desired Experience:**
1. Open Quick Workout Logger
2. Select "Pushups" → enter set 1 → click "Another Set" → enter set 2 → "Another Set" → enter set 3
3. Click "Add Exercise"
4. Select "Pullups" → enter sets 1-3 same way
5. Click "Add Exercise" → select "Dips" → enter sets 1-2
6. Click "Finish Workout"
7. System auto-detects "Pull Day A", saves as one workout, shows PRs if any

---

## What Changes

### New Capabilities

1. **`multi-set-logging`**
   - "Another Set" button keeps modal open after logging set
   - Pre-fills form with previous exercise/weight/reps
   - Increments set number automatically
   - User can modify weight/reps/to-failure for each set
   - Sets accumulate in running summary view

2. **`multi-exercise-logging`**
   - "Add Exercise" button returns to exercise picker
   - Previously logged exercises shown in summary
   - Can log unlimited exercises in one session
   - Each exercise maintains its own set list

3. **`workout-session-summary-view`**
   - After logging each set, modal switches to summary view
   - Shows all logged exercises with set details
   - Format: "Exercise Name: Set X: Y reps @ Z lbs"
   - Three action buttons: "Another Set", "Add Exercise", "Finish Workout"
   - Summary is scrollable if many exercises/sets

4. **`workout-session-grouping`**
   - "Finish Workout" button saves all exercises/sets as ONE workout
   - Backend groups sets by timestamp (within session window)
   - Auto-detects workout category from exercises logged
   - Auto-detects workout variation (A/B) based on history
   - Returns unified workout response with PRs across all exercises

5. **`toast-feedback-integration`**
   - Replace browser `alert()` with Toast component
   - Show toast after each set: "Set X logged! Add another?"
   - Show toast on workout completion: "Workout saved! 2 PRs detected"
   - Non-blocking, branded, consistent with app UX

### Modified Capabilities

**`quick-add-ui` → `quick-workout-logger-ui`**
- Modal title changes from "Quick Add Exercise" to "Quick Workout Logger"
- Modal remains open until "Finish Workout" or user closes
- Modal has 3 states: exercise-picker, set-entry-form, summary-view
- Back navigation: summary → exercise-picker, set-entry → summary
- Close button (X) now asks "Discard workout?" if sets logged

**`quick-add-api` → `quick-workout-logger-api`**
- New endpoint: `POST /api/quick-workout` (batch endpoint)
- Accepts array of exercises with array of sets each
- Returns: workout ID, category, variation, PRs, updated muscle states
- Old endpoint `POST /api/quick-add` remains for backwards compatibility

**`quick-add-history-integration`**
- Smart defaults now consider multi-set patterns
- If user's last "Pushups" workout was 3 sets @ 20 reps, suggest 3 sets
- "Another Set" pre-fills with previous set's values (slightly progressive)

---

## How (High-Level Design)

### Frontend State Machine

```typescript
type QuickWorkoutMode =
  | 'exercise-picker'    // Selecting exercise
  | 'set-entry'          // Entering set details
  | 'summary';           // Viewing logged exercises

interface QuickWorkoutState {
  mode: QuickWorkoutMode;
  exercises: LoggedExercise[];  // Accumulated exercises/sets
  currentExercise: Exercise | null;  // Exercise being logged
  currentSetNumber: number;  // Which set we're on
  smartDefaults: SmartDefaults | null;
}

interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: {
    setNumber: number;
    weight: number;
    reps: number;
    toFailure: boolean;
  }[];
}
```

### UI Flow Transitions

```
exercise-picker
    ↓ (select exercise)
set-entry (set 1)
    ↓ (log set)
summary
    ↓ (another set)
set-entry (set 2)
    ↓ (log set)
summary
    ↓ (add exercise)
exercise-picker
    ↓ (select different exercise)
set-entry (set 1 of new exercise)
    ... repeat ...
summary
    ↓ (finish workout)
API call → Close modal → Toast → Refresh dashboard
```

### API Design

**Request:**
```json
POST /api/quick-workout
{
  "exercises": [
    {
      "exercise_name": "Push-ups",
      "sets": [
        { "weight": 0, "reps": 20, "to_failure": false },
        { "weight": 0, "reps": 18, "to_failure": false },
        { "weight": 0, "reps": 15, "to_failure": true }
      ]
    },
    {
      "exercise_name": "Pull-ups",
      "sets": [
        { "weight": 0, "reps": 10, "to_failure": false },
        { "weight": 0, "reps": 8, "to_failure": true }
      ]
    }
  ],
  "timestamp": "2025-10-26T14:30:00Z"  // When workout actually happened
}
```

**Response:**
```json
{
  "workout_id": 123,
  "category": "Pull",
  "variation": "A",
  "duration_seconds": 1800,  // Estimated based on set count
  "prs": [
    {
      "exercise_name": "Push-ups",
      "type": "best_single_set",
      "old_value": 18,
      "new_value": 20,
      "percent_increase": 11.1
    }
  ],
  "updated_baselines": [
    {
      "muscle": "Chest",
      "old_max": 5000,
      "new_max": 5500
    }
  ],
  "muscle_states_updated": true
}
```

### Backend Logic

1. **Category Auto-Detection:**
   - Analyze logged exercises
   - Count exercises by category (Push/Pull/Legs/Core)
   - Assign workout to majority category
   - If tie, use first exercise's category

2. **Variation Detection (A/B):**
   - Check last workout of same category
   - If last was variation A, assign B
   - If last was variation B or no history, assign A
   - Maintains A/B alternation automatically

3. **Workout Duration Estimation:**
   - Assume 60 seconds rest between sets
   - Assume 30 seconds per set execution
   - `duration = (total_sets * 30) + ((total_sets - 1) * 60)`

4. **Muscle State Updates:**
   - Calculate volume per muscle (sum of all exercises' contributions)
   - Update fatigue percentages based on muscle baselines
   - Update `last_trained` timestamp
   - Same logic as full workout tracking

---

## Success Criteria

**User Experience:**
- User can log 3-exercise, 9-set workout in < 2 minutes
- Modal provides clear feedback on what's been logged
- "Another Set" flow is intuitive (pre-filled, one button)
- "Finish Workout" clearly ends session and saves

**Technical:**
- Single API call saves entire workout (not 9 separate calls)
- Database creates one workout record with multiple exercise_sets
- PR detection works across all logged exercises
- Muscle states update correctly based on total workout volume
- Toast notifications replace alerts

**Quality:**
- All existing quick-add tests pass
- New tests cover multi-set, multi-exercise flows
- No regressions in single-set logging (backwards compatible)
- Accessibility maintained (keyboard nav, screen readers, focus management)

---

## Out of Scope

- Editing previously logged workouts (future enhancement)
- Workout templates integration (separate change)
- Timer/stopwatch during logging (logging is retroactive)
- Exercise notes/comments (future enhancement)
- Rest timer recommendations (future enhancement)

---

## Dependencies

**Depends On:**
- Existing `quick-add-ui` spec (extends it)
- Existing `quick-add-api` spec (extends it)
- `workout-history-display` (integration point)
- `failure-status-tracking` (uses to-failure flag)
- `pr-detection-and-celebration` (displays PRs after workout)

**Enables:**
- Better user adoption (easier logging = more consistent tracking)
- Richer workout history data
- More accurate muscle fatigue tracking
- Foundation for workout templates
- Foundation for workout plan suggestions

---

## Risks & Mitigation

**Risk:** Users accidentally close modal and lose logged sets
**Mitigation:** Add "Discard workout?" confirmation dialog if sets exist

**Risk:** API timeout with large workouts (10+ exercises, 50+ sets)
**Mitigation:** Set reasonable limits (max 20 exercises, max 10 sets per exercise)

**Risk:** Unclear UX flow (when to click what button)
**Mitigation:** Clear visual hierarchy, progressive disclosure, contextual button labels

**Risk:** Category auto-detection fails for mixed workouts
**Mitigation:** Default to "General" category if detection uncertain, allow manual override in future

---

## Alternatives Considered

### Alternative 1: Keep Quick Add, Add Separate "Log Workout" Flow
**Pros:** Cleaner separation, Quick Add stays simple
**Cons:** Two paths to log, confusing for users, duplicated code
**Decision:** Rejected - better to enhance existing flow

### Alternative 2: Always Auto-Save Sets Immediately
**Pros:** No risk of losing data, simpler state management
**Cons:** Harder to "undo" mistakes, creates many API calls, unclear workout boundaries
**Decision:** Rejected - batch save is cleaner

### Alternative 3: Require Category Selection Up Front
**Pros:** Explicit categorization, no auto-detection needed
**Cons:** Extra friction, users may not know category, breaks "quick" promise
**Decision:** Rejected - auto-detection is smarter

---

## Implementation Notes

**Phase 1: Frontend State Management** (4-6 hours)
- Refactor QuickAdd component into state machine
- Add summary view component
- Implement "Another Set" / "Add Exercise" buttons
- Add confirmation dialog on close

**Phase 2: API Endpoint** (3-4 hours)
- Create `POST /api/quick-workout` endpoint
- Implement category/variation auto-detection
- Batch insert exercise_sets
- Trigger PR detection and muscle state updates

**Phase 3: Integration & Polish** (3-4 hours)
- Replace alert() with Toast
- Update Dashboard refresh logic
- Add loading states
- Error handling and edge cases

**Phase 4: Testing** (2-3 hours)
- Unit tests for state machine
- Integration tests for API
- E2E tests for complete flow
- Accessibility audit

**Total Estimate:** 12-17 hours

---

## Questions for Review

1. Should we limit max exercises per workout? (Suggested: 20)
2. Should we limit max sets per exercise? (Suggested: 10)
3. Should "Finish Workout" require at least 1 exercise? (Suggested: Yes)
4. Should we allow editing sets after logging? (Suggested: No, future enhancement)
5. Should timestamp default to "now" or allow user to specify "when workout happened"? (Suggested: Default "now", manual timestamp future)

---

## Next Steps

1. **Review & Approve:** Team reviews proposal, provides feedback
2. **Spec Deltas:** Create detailed spec changes in `specs/` folder
3. **Tasks Breakdown:** Create granular tasks in `tasks.md`
4. **Design Doc:** Create `design.md` with detailed component architecture if needed
5. **Validation:** Run `openspec validate enhance-quick-workout-logger --strict`
6. **Implementation:** Begin work once validated

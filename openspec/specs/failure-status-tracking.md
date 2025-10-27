# Spec: Failure Status Tracking

**Capability:** `failure-status-tracking`
**Status:** Deployed

---

## Overview

This capability enables users to mark individual sets as "to failure" (muscular failure) or "not to failure" (submaximal work). This distinction is critical for:
- Future baseline learning algorithms (requires true maximal data)
- Accurate personal record detection
- Differentiating training intent (max effort vs deload/warm-up)

---

## Requirements

### Requirement: Store Failure Status on Each Set

**Description:** System SHALL record for every exercise set whether it was performed to muscular failure.

**Acceptance Criteria:**
- `exercise_sets` table has `to_failure` column (INTEGER, default 1)
- Column is NOT NULL (every set has a defined failure status)
- Value is 0 (false) or 1 (true)

#### Scenario: User logs a new workout set
**Given:** User is in workout tracking mode
**When:** User logs a set with 100 lbs × 8 reps
**Then:** Set is stored in `exercise_sets` with `to_failure = 1` (default)
**And:** User can see the failure status in the UI

#### Scenario: User marks set as not to failure
**Given:** User completed a warm-up set (60% max effort)
**When:** User unchecks the "to failure" toggle
**Then:** Set is stored with `to_failure = 0`
**And:** This set will not affect PR detection or baseline learning

---

### Requirement: Smart Default - Last Set Auto-Marked

**Description:** System SHALL automatically mark the last set of each exercise as "to failure" unless user overrides.

**Acceptance Criteria:**
- When user adds first set → `to_failure = 1`
- When user adds second set → first set changes to `to_failure = 0`, second set is `to_failure = 1`
- When user adds third set → second set changes to `to_failure = 0`, third set is `to_failure = 1`
- User can manually override any set's failure status

#### Scenario: User adds multiple sets to an exercise
**Given:** User starts logging "Bench Press"
**When:** User logs Set 1 (100 lbs × 8 reps)
**Then:** Set 1 is marked `to_failure = 1`
**When:** User logs Set 2 (100 lbs × 8 reps)
**Then:** Set 1 becomes `to_failure = 0`
**And:** Set 2 is marked `to_failure = 1`
**When:** User logs Set 3 (95 lbs × 10 reps)
**Then:** Set 2 becomes `to_failure = 0`
**And:** Set 3 is marked `to_failure = 1`

#### Scenario: User performs drop set (all sets to failure)
**Given:** User is doing a drop set workout
**When:** User adds Set 2
**Then:** Set 1 auto-unmarked as failure
**When:** User manually re-marks Set 1 as "to failure"
**Then:** Both Set 1 and Set 2 have `to_failure = 1`
**And:** Both sets will count for PR detection

---

### Requirement: UI Toggle for Failure Status

**Description:** System SHALL enable users to mark/unmark sets as "to failure" during workout logging.

**Acceptance Criteria:**
- Each set row has a visible toggle/checkbox for failure status
- Toggle shows checked state for `to_failure = 1`
- Toggle shows unchecked state for `to_failure = 0`
- Clicking toggle immediately updates the set's failure status
- Visual distinction between failure and non-failure sets

#### Scenario: User toggles failure status on a set
**Given:** User has logged a set marked as "to failure"
**When:** User clicks the failure toggle to uncheck it
**Then:** Set's `to_failure` value changes from 1 to 0
**And:** Visual indicator updates (checkbox unchecked)
**And:** Set will not count toward PR detection

#### Scenario: User manually marks early set as failure
**Given:** User failed on Set 2 of 3 (form breakdown)
**When:** User manually checks Set 2's failure toggle
**Then:** Set 2 is marked `to_failure = 1`
**And:** User can complete Set 3 with reduced weight
**And:** Set 3 defaults to `to_failure = 1` but user can unmark it

---

### Requirement: Persist Failure Status with Workout

**Description:** System SHALL save failure status to the database when workout is saved.

**Acceptance Criteria:**
- `POST /api/workouts` accepts `to_failure` field for each set
- Backend inserts `to_failure` value into `exercise_sets` table
- Saved workouts correctly retrieve `to_failure` status for each set

#### Scenario: User saves workout and reviews history
**Given:** User has logged a workout with mixed failure/non-failure sets
**When:** User saves the workout
**Then:** All sets saved with correct `to_failure` values
**When:** User views workout history
**Then:** Each set displays its original failure status
**And:** Failure status is preserved for future reference

---

### Requirement: Migration Handles Existing Data

**Description:** System SHALL apply sensible default failure status to historical data.

**Acceptance Criteria:**
- Migration adds `to_failure` column with `DEFAULT 1`
- All historical sets inherit `to_failure = 1` (assumed max effort)
- No data loss during migration
- Rollback script available if needed

#### Scenario: User has historical workout data
**Given:** Database has 100 historical workouts with 500 sets
**When:** Database migration runs
**Then:** All 500 sets now have `to_failure = 1`
**And:** User can view historical workouts without errors
**And:** User can retroactively change failure status if needed (future feature)

---

### Requirement: Workout Save Request Schema

**Description:** System SHALL include `to_failure` field in workout API schema.

**Schema:**
```typescript
{
  exercise: string,
  sets: [
    {
      weight: number,
      reps: number,
      to_failure: boolean
    }
  ]
}
```

#### Scenario: Frontend sends workout with failure status
**Given:** User logs a workout with 3 sets
**When:** Frontend sends `POST /api/workouts`
**Then:** Request includes `to_failure` field for each set
**And:** Backend accepts and stores the values correctly

---

## Implementation Notes

**Database:**
- SQLite doesn't have native BOOLEAN, use INTEGER (0 or 1)
- Index: `CREATE INDEX idx_exercise_sets_to_failure ON exercise_sets(to_failure)`
- Future queries can filter by failure status for baseline learning

**UI/UX:**
- Keep toggle simple (checkbox or checkmark icon)
- Position near set number for easy access
- Don't require confirmation (single tap to toggle)
- Provide help text: "Mark if you couldn't complete another rep"

**Testing:**
- Test smart defaults with various set counts
- Test manual override scenarios
- Test persistence across save/load
- Test migration with existing data

---

## Implementation

**Deployed:** 2025-10-27
**Change:** `implement-to-failure-tracking-ui`
**Commit:** 91d7924

### UI Components
- Failure checkbox on each set row (44x44px touch target)
- Info icon with educational tooltip modal
- Smart defaults: last set auto-marked as failure
- Visual distinction: cyan checkmark (failure) vs gray border (not failure)
- Full accessibility: ARIA labels, keyboard navigation

### Files
- `components/Workout.tsx`: Core tracking implementation
- `components/Icons.tsx`: InfoIcon component
- `types.ts`: Type definitions with to_failure field

### Testing
- 100% test pass rate (11/11 tests)
- API integration verified
- Accessibility compliance (WCAG 2.1 AA)
- Mobile touch targets validated

---

*Last updated: 2025-10-27*
*Changes: enable-failure-tracking-and-pr-detection, implement-to-failure-tracking-ui*

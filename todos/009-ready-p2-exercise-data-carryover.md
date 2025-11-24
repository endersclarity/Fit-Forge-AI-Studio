---
status: ready
priority: p2
issue_id: "009"
tags: [bug, ux, workout-logging, data-entry-error]
dependencies: []
---

# Exercise Data Incorrectly Carries Over When Switching Exercises

## Problem Statement

When logging a workout, after completing one exercise and moving to the next, the weight/reps/rest values from the previous exercise incorrectly carry over and pre-populate the new exercise's input fields. This causes data entry errors when users don't notice the incorrect pre-populated values, as different exercises use vastly different weights.

## Findings

- **User Impact**: Accidental logging of incorrect data (wrong weights for exercises)
- **Current Behavior**: Previous exercise data carries over to next exercise
- **Expected Behavior**: Each exercise should show its own defaults
- **Location**: Unknown - workout logging form state management
- **Related GitHub Issue**: [#11](https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/11)
- **Related Todo**: Issue #008 (template details) - solving that enables smart defaults here

## Problem Scenario

**Example: Push Day A Workout**

1. User starts workout with 5 exercises
2. User logs **Exercise 1: Dumbbell Bench Press**
   - Enters: 90 lbs × 10 reps, 90s rest
   - Completes 3 sets
3. User moves to **Exercise 2: Tricep Extension**
4. **Observe**: Input fields show **90 lbs** × 10 reps, 90s rest
5. **Problem**:
   - Tricep Extension is bodyweight exercise (BW, not 90 lbs!)
   - Or if weighted, typically 20-30 lbs (not 90 lbs)
6. **Risk**: If user doesn't notice, logs incorrect 90 lbs for tricep extension
7. **Impact**: Data corruption, inaccurate volume tracking, bad recommendations

**Why This Is Problematic:**
- Different exercises use vastly different weights
- Bodyweight exercises need "BW" not previous weight
- Easy to miss during workout (user is focused/tired)
- Creates bad data in system

## Root Cause Analysis

**Likely Cause:**
Workout logging form uses single state object that persists between exercise transitions:

```typescript
// Probable current implementation
const [setData, setSetData] = useState({
  weight: 0,
  reps: 10,
  restSeconds: 90
});

// When user switches exercises, state persists
// Should instead: clear state OR load exercise-specific defaults
```

**Missing Behavior:**
1. No state reset when switching exercises
2. No exercise-specific default loading
3. No distinction between "user entered" vs "default" values

## Proposed Solutions

### Option 1: Clear State Between Exercises (Quick Fix)

**Implementation:**
- Detect exercise change in workout logging component
- Reset input fields to blank or system defaults
- Force user to re-enter values for each exercise

**Pros**:
- Simple to implement (1-2 hours)
- Prevents incorrect carryover
- No dependencies

**Cons**:
- User must re-enter common values (like rest time)
- Doesn't leverage template planning
- No intelligence

**Effort**: Small (1-2 hours)
**Risk**: Very Low

### Option 2: Use Template Defaults (PREFERRED)

**Implementation:**
- If workout started from saved template with set details (Issue #008)
- Load template-specified values for each exercise
- Example: Template says "Tricep Extension: BW × 10 reps, 90s rest"
- Pre-populate with those values when user reaches that exercise

**Pros**:
- Best UX - respects user's planning
- Reduces data entry (user planned ahead)
- Natural tie-in with Issue #008
- Intelligent defaults

**Cons**:
- Depends on Issue #008 being fixed first
- Only works for templated workouts

**Effort**: Medium (3-4 hours) - includes Issue #008 integration
**Risk**: Low
**Dependency**: Issue #008 must be completed first

### Option 3: Use Exercise History (Smart Defaults)

**Implementation:**
- When user switches to new exercise, query database:
  ```sql
  SELECT weight, reps, rest_seconds
  FROM exercise_sets
  WHERE exercise_name = ?
  ORDER BY created_at DESC
  LIMIT 1
  ```
- Pre-populate with user's last logged values for THIS specific exercise
- Example: If user did Tricep Extension last week at 30 lbs, suggest 30 lbs

**Pros**:
- Works for all workouts (templated or not)
- Learns from user's history
- Progressive overload friendly

**Cons**:
- Requires database query per exercise
- May suggest outdated values if user took break
- More complex implementation

**Effort**: Medium (4-5 hours)
**Risk**: Medium (performance considerations)

### Option 4: Hybrid Approach (Best Long-Term)

**Implementation:**
1. First priority: Load template defaults (if workout from template)
2. Second priority: Load exercise history (if no template)
3. Fallback: System defaults (if no template and no history)

**Pros**:
- Best of all worlds
- Intelligent defaults in all scenarios
- Future-proof

**Cons**:
- Most complex implementation
- Requires Issue #008 completion

**Effort**: Medium-Large (5-6 hours)
**Risk**: Medium

## Recommended Action

**Phase 1: Quick Fix (Immediate - P2)**
Implement Option 1 (Clear State) as temporary fix to prevent data corruption.

**Phase 2: Smart Defaults (After Issue #008 - P2)**
Implement Option 2 (Template Defaults) or Option 4 (Hybrid) for intelligent UX.

**Sequencing:**
- If Issue #008 fixed soon: Skip Phase 1, go straight to Phase 2
- If Issue #008 delayed: Do Phase 1 now, Phase 2 later

## Technical Details

**Affected Files:**
- Workout logging component (need to identify exact file)
- State management for set input fields
- Exercise switching logic

**Related Components:**
- Template loading (Issue #008)
- Exercise history queries
- Form state management

**Database Changes**: No

## Resources

- GitHub Issue: [#11](https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/11)
- Related Todo: `008-ready-p2-template-details-not-persisting.md`
- Exercise history query: `backend/database/database.ts`

## Acceptance Criteria

- [ ] Switching exercises clears previous exercise data from inputs
- [ ] Each exercise shows appropriate defaults (template, history, or system)
- [ ] No accidental data entry errors from carryover
- [ ] Bodyweight exercises show "BW" not numeric weight from previous exercise
- [ ] User can still manually override suggested values
- [ ] Tests pass for exercise switching flow
- [ ] Verified with multiple exercise types and combinations

## Work Log

### 2024-11-24 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue discovered during live workout logging
- User noticed 90 lbs bench press values carrying over to tricep extension
- Confirmed as design flaw in state management
- Categorized as P2 IMPORTANT
- Estimated effort: Small-Medium (2-4 hours depending on approach)

**Learnings:**
- State persistence between exercises is problematic
- Different exercises need different defaults
- Ties naturally to Issue #008 (template persistence)
- Quick fix available but smart solution depends on #008

## Notes

**Source:** Triage session on 2024-11-24
**User Quote:** "Depending on what my last entered workout was, even if it was for a different exercise, if I change exercises, it puts in the last entered information from the previous exercise."
**Impact:** Data integrity issue - incorrect weights logged if user doesn't notice
**Dependency:** Consider fixing Issue #008 first for best solution (Option 2 or 4)

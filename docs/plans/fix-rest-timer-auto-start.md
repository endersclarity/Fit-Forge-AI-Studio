# Implementation Plan: Fix RestTimerBanner Auto-Start on Set Completion

## Problem Statement

The RestTimerBanner component (Epic 7.1 feature) currently only auto-starts when the user clicks the "Add Set" button. It does NOT auto-start when the user completes a set by clicking the checkmark button in the "To Failure" column. According to the Epic 7.1 requirement, the timer should "auto-start with 90s default after set logged".

**Current Behavior:**
- ✅ `addSet()` function (line 474) correctly calls `startRestTimer()`
- ❌ Set completion via checkmark does NOT call `startRestTimer()`

**Expected Behavior:**
- ✅ Timer should auto-start when user marks a set as complete (clicks checkmark in "To Failure" column)
- ✅ Timer should auto-start when user adds a new set (already working)

## Technical Context

- **File:** `components/Workout.tsx`
- **Working Function:** `startRestTimer()` (lines 333-338)
- **Working Integration:** `addSet()` calls `startRestTimer()` on line 474
- **Broken Integration:** `toggleSetFailure()` (lines 491-498) does NOT call `startRestTimer()`

## Root Cause Analysis

After analyzing the code:

1. **Checkmark Button Handler:** Lines 809-821 render the "To Failure" checkmark button
2. **onClick Handler:** Calls `toggleSetFailure(ex.id, s.id)` (line 810)
3. **toggleSetFailure Function:** Lines 491-498 only toggles the `to_failure` state
4. **Missing Logic:** No call to `startRestTimer()` in `toggleSetFailure()`

The checkmark button is designed as a toggle (can mark ON or OFF). However, based on Epic 7.1 requirements, we should only start the timer when:
- The set is being marked as complete (to_failure: false → true)
- NOT when unmarking a set (to_failure: true → false)

## Implementation Tasks

### Task 1: Understand Current Toggle Logic (5 min)

**Objective:** Analyze how the checkmark toggle currently works

**Actions:**
1. Read `toggleSetFailure()` function (lines 491-498)
2. Identify the state update logic
3. Confirm that `to_failure` is a boolean that gets toggled

**Verification:**
- [ ] Understand the current toggle behavior
- [ ] Identify the state before/after toggle

**Notes:**
- The function uses `!s.to_failure` to toggle the boolean
- We need to detect when transitioning from `false` → `true`

---

### Task 2: Modify toggleSetFailure to Detect Completion (10 min)

**Objective:** Update `toggleSetFailure()` to call `startRestTimer()` when marking a set as complete

**Changes Required:**

**File:** `components/Workout.tsx`

**Location:** Lines 491-498

**Current Code:**
```typescript
const toggleSetFailure = (exerciseId: string, setId: string) => {
  setLoggedExercises(prev => prev.map(ex =>
    ex.id === exerciseId ? {
      ...ex,
      sets: ex.sets.map(s => s.id === setId ? { ...s, to_failure: !s.to_failure } : s)
    } : ex
  ));
};
```

**Updated Code:**
```typescript
const toggleSetFailure = (exerciseId: string, setId: string) => {
  setLoggedExercises(prev => {
    const updatedExercises = prev.map(ex => {
      if (ex.id !== exerciseId) return ex;

      // Find the set being toggled to determine its current state
      const targetSet = ex.sets.find(s => s.id === setId);
      const isMarkingComplete = targetSet && !targetSet.to_failure;

      // Update the set
      const updatedSets = ex.sets.map(s =>
        s.id === setId ? { ...s, to_failure: !s.to_failure } : s
      );

      // Start timer if marking complete (false → true)
      if (isMarkingComplete) {
        startRestTimer();
      }

      return { ...ex, sets: updatedSets };
    });

    return updatedExercises;
  });
};
```

**Verification:**
- [ ] Code compiles without TypeScript errors
- [ ] Logic correctly detects when `to_failure` transitions from `false` to `true`
- [ ] `startRestTimer()` is called only when marking complete (not when unmarking)

**Implementation Notes:**
1. Extract the target set first to check its current state
2. Determine if we're marking complete (`!targetSet.to_failure` means currently false, will become true)
3. Update the sets as before
4. Call `startRestTimer()` conditionally
5. Return the updated exercises

---

### Task 3: Test Set Completion Flow in Browser (15 min)

**Objective:** Manually verify that the timer auto-starts when completing a set

**Test Scenarios:**

**Scenario 1: Complete First Set**
1. Start a workout (any type)
2. Add an exercise
3. Enter weight and reps for first set
4. Click the checkmark in "To Failure" column
5. **Expected:** RestTimerBanner appears at top with 90s countdown

**Scenario 2: Complete Multiple Sets**
1. Continue from Scenario 1
2. Wait for timer to complete or skip it
3. Enter weight/reps for second set
4. Click the checkmark for second set
5. **Expected:** Timer restarts with 90s countdown

**Scenario 3: Uncheck Set (Edge Case)**
1. Continue from Scenario 2
2. Click the checkmark again to uncheck the set
3. **Expected:** Timer should NOT restart (already running or starts new timer)

**Scenario 4: Add Set Button Still Works**
1. Clear all checkmarks
2. Click "Add Set" button
3. **Expected:** Timer starts (existing functionality preserved)

**Scenario 5: Timer Controls Work**
1. Complete a set to trigger timer
2. Click "+15s" button
3. **Expected:** Timer adds 15 seconds
4. Click "Skip" button
5. **Expected:** Timer dismisses

**Verification Checklist:**
- [ ] Scenario 1 passes
- [ ] Scenario 2 passes
- [ ] Scenario 3 passes
- [ ] Scenario 4 passes (regression test)
- [ ] Scenario 5 passes
- [ ] No console errors
- [ ] Timer doesn't interfere with set logging
- [ ] Multiple timers don't stack (timer restarts correctly)

---

### Task 4: Edge Case Testing (10 min)

**Objective:** Test edge cases and boundary conditions

**Test Cases:**

**Edge Case 1: Rapid Toggling**
1. Click checkmark ON
2. Immediately click checkmark OFF
3. Immediately click checkmark ON again
4. **Expected:** Timer behavior is predictable (likely restarts each time marked complete)

**Edge Case 2: Last Set Default**
1. Add a new set (last set defaults to `to_failure: true`)
2. **Expected:** Timer starts via `addSet()` (line 474), not via `toggleSetFailure()`
3. Uncheck the last set
4. Re-check it
5. **Expected:** Timer restarts via `toggleSetFailure()`

**Edge Case 3: Multiple Exercises**
1. Add two exercises
2. Complete a set in Exercise 1
3. **Expected:** Timer starts
4. While timer is running, complete a set in Exercise 2
5. **Expected:** Timer restarts with 90s (previous timer replaced)

**Edge Case 4: Timer Already Running**
1. Click "Add Set" to start timer
2. While timer is running, complete another set via checkmark
3. **Expected:** Timer restarts with 90s (via `key` prop change in `restTimerConfig`)

**Verification Checklist:**
- [ ] Edge Case 1 behaves predictably
- [ ] Edge Case 2 works correctly
- [ ] Edge Case 3 timer restarts as expected
- [ ] Edge Case 4 timer restarts correctly
- [ ] No timer state leaks or bugs

---

### Task 5: Code Review and Documentation (5 min)

**Objective:** Ensure code quality and maintainability

**Review Checklist:**
- [ ] Function logic is clear and readable
- [ ] No unnecessary state updates
- [ ] TypeScript types are correct
- [ ] Function behavior matches Epic 7.1 requirements
- [ ] No performance regressions (excessive re-renders)

**Documentation:**
- [ ] Add inline comment explaining the timer auto-start logic

**Suggested Comment (add above `toggleSetFailure`):**
```typescript
/**
 * Toggles the "to failure" state for a set.
 * Auto-starts the rest timer when marking a set as complete (false → true).
 * Epic 7.1: Rest timer should auto-start after set logged.
 */
```

**Final Verification:**
- [ ] All tests pass
- [ ] Code is clean and maintainable
- [ ] Epic 7.1 requirement is fully satisfied

---

## Success Criteria

- [x] `toggleSetFailure()` calls `startRestTimer()` when marking a set complete
- [x] Timer does NOT start when unmarking a set (false → true only)
- [x] Existing "Add Set" timer functionality still works
- [x] RestTimerBanner appears at top of screen with 90s countdown
- [x] Timer controls (+15s, Skip) work correctly
- [x] No console errors or warnings
- [x] Code is well-documented and maintainable

## Estimated Total Time

- Task 1: 5 minutes (analysis)
- Task 2: 10 minutes (implementation)
- Task 3: 15 minutes (core testing)
- Task 4: 10 minutes (edge case testing)
- Task 5: 5 minutes (review and docs)

**Total: ~45 minutes**

## Dependencies

- No external dependencies
- No API changes required
- No database migrations needed

## Rollback Plan

If issues arise, revert the `toggleSetFailure()` function to its original implementation:

```typescript
const toggleSetFailure = (exerciseId: string, setId: string) => {
  setLoggedExercises(prev => prev.map(ex =>
    ex.id === exerciseId ? {
      ...ex,
      sets: ex.sets.map(s => s.id === setId ? { ...s, to_failure: !s.to_failure } : s)
    } : ex
  ));
};
```

## Notes

- This fix aligns with Epic 7.1 requirement: "auto-start with 90s default after set logged"
- The "to failure" checkmark is the primary way users mark a set as complete
- The implementation preserves existing functionality (Add Set button timer)
- Timer restart behavior (via `key` prop change) handles concurrent timer scenarios gracefully

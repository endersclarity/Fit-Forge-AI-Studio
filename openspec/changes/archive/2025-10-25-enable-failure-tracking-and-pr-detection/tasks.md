# Tasks: Enable Failure Tracking and PR Detection

**Change ID:** `enable-failure-tracking-and-pr-detection`
**Status:** Completed
**Completed:** 2025-10-24

---

## Task Overview

This change is broken into 3 phases with 12 total tasks. Each task delivers visible progress and includes validation steps.

**Estimated Total Time:** 8-10 hours

---

## Phase 1: Database & Backend Foundation (3-4 hours)

### Task 1.1: Database schema migration
**Estimate:** 1 hour
**Depends on:** None

**Work:**
1. Create migration script to add `to_failure` column to `exercise_sets`:
   ```sql
   ALTER TABLE exercise_sets ADD COLUMN to_failure INTEGER DEFAULT 1;
   CREATE INDEX IF NOT EXISTS idx_exercise_sets_to_failure ON exercise_sets(to_failure);
   ```
2. Test migration on development database
3. Verify existing sets inherit `to_failure = 1`
4. Document rollback procedure

**Validation:**
```sql
-- Verify column exists
PRAGMA table_info(exercise_sets);

-- Verify existing data intact
SELECT COUNT(*), SUM(to_failure) FROM exercise_sets;
-- Should show all existing sets have to_failure = 1
```

**Deliverable:** Migration applied, database schema updated

---

### Task 1.2: Update backend types and API
**Estimate:** 1.5 hours
**Depends on:** Task 1.1

**Work:**
1. Update `backend/types.ts` to include `to_failure` in set interface
2. Modify `POST /api/workouts` to accept `to_failure` field
3. Update `saveWorkout()` function in `backend/database/database.ts`
4. Ensure `to_failure` value persists to database
5. Test with Postman/curl

**Validation:**
```bash
curl -X POST http://localhost:3002/api/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-24",
    "category": "Push",
    "variation": "A",
    "exercises": [{
      "exercise": "Bench Press",
      "sets": [
        {"weight": 100, "reps": 8, "to_failure": true},
        {"weight": 100, "reps": 8, "to_failure": false}
      ]
    }]
  }'

# Verify in database
SELECT exercise_name, weight, reps, to_failure FROM exercise_sets ORDER BY id DESC LIMIT 2;
```

**Deliverable:** Backend accepts and stores `to_failure` field

---

### Task 1.3: Implement PR detection algorithm
**Estimate:** 2 hours
**Depends on:** Task 1.2

**Work:**
1. Create `detectPR()` function in `backend/database/database.ts`
2. Implement volume calculation (weight × reps)
3. Query `personal_bests` table for previous best
4. Compare current volume to previous best
5. Return PR info if detected:
   ```typescript
   {
     isPR: boolean,
     exercise: string,
     newVolume: number,
     previousVolume: number,
     improvement: number,
     percentIncrease: number,
     isFirstTime: boolean
   }
   ```
6. Skip PR detection if `to_failure = 0`

**Validation:**
```typescript
// Test cases
detectPR('Bench Press', 105, 10, true, 1000)
// Should return isPR=true, improvement=50

detectPR('Bench Press', 95, 10, false, 1000)
// Should return isPR=false (not to failure)

detectPR('New Exercise', 100, 8, true, null)
// Should return isPR=true, isFirstTime=true
```

**Deliverable:** PR detection algorithm working

---

### Task 1.4: Update personal_bests table on PR
**Estimate:** 1 hour
**Depends on:** Task 1.3

**Work:**
1. Modify `saveWorkout()` to call `detectPR()` for each set with `to_failure = 1`
2. If PR detected, update `personal_bests` table:
   - New exercise → INSERT
   - Breaking PR → UPDATE `best_single_set` and `updated_at`
3. Return PR info in API response for frontend notification
4. Test with multiple scenarios

**Validation:**
```sql
-- Before workout
SELECT * FROM personal_bests WHERE exercise_name = 'Bench Press';
-- best_single_set: 800

-- Log workout with 840 volume

-- After workout
SELECT * FROM personal_bests WHERE exercise_name = 'Bench Press';
-- best_single_set: 840, updated_at: [current timestamp]
```

**Deliverable:** Personal bests automatically updated when PR detected

---

## Phase 2: Frontend UI (3-4 hours)

### Task 2.1: Update frontend types
**Estimate:** 0.5 hour
**Depends on:** Task 1.2

**Work:**
1. Update `types.ts` to include `to_failure` in `LoggedSet` interface
2. Add `PRInfo` interface for PR detection results
3. Update `WorkoutResponse` type to include `prs` array
4. Test TypeScript compilation

**Validation:**
```bash
npm run build  # Should compile without errors
```

**Deliverable:** Frontend types match backend API

---

### Task 2.2: Add toggle UI for failure status
**Estimate:** 2 hours
**Depends on:** Task 2.1

**Work:**
1. Update `components/Workout.tsx` to add toggle button to each set row
2. Add state management for `to_failure` status per set
3. Implement toggle click handler (flip boolean)
4. Add visual distinction (checkmark icon or checkbox)
5. Position toggle near set number for easy access
6. Add hover text: "Mark if you couldn't complete another rep"

**Validation:**
- Toggle appears on each set row
- Clicking toggle updates state immediately
- Visual feedback shows checked/unchecked state
- Check browser console for errors

**Deliverable:** Failure status toggle functional in UI

---

### Task 2.3: Implement smart default (last set = failure)
**Estimate:** 1.5 hours
**Depends on:** Task 2.2

**Work:**
1. When user adds new set, mark it `to_failure = true`
2. When user adds another set, previous set becomes `to_failure = false`
3. Update `addSet()` function logic in `Workout.tsx`
4. Ensure toggle state persists correctly
5. Allow manual override (user can check/uncheck any set)

**Validation:**
- Add 3 sets to an exercise
- Verify only last set has `to_failure = true`
- Manually check first set
- Verify both first and last have `to_failure = true`

**Deliverable:** Smart defaults working, last set auto-marked

---

### Task 2.4: Create PR celebration notification component
**Estimate:** 2 hours
**Depends on:** Task 2.1

**Work:**
1. Create `components/PRNotification.tsx`
2. Design toast-style notification:
   - Icon: 🎉 or 🏆
   - Message: "NEW PR! {exercise}: {weight} lbs × {reps} reps"
   - Subtext: "Previous best: {prev} (+{improvement})"
3. Add slide-down animation
4. Auto-dismiss after 5 seconds
5. Manual dismiss on tap
6. Position at top-center (non-modal)

**Validation:**
- Trigger notification manually with mock data
- Verify animation smooth
- Verify auto-dismiss works
- Verify manual dismiss works
- Check responsive design

**Deliverable:** PR notification component complete

---

### Task 2.5: Integrate PR notification into workout flow
**Estimate:** 1 hour
**Depends on:** Task 2.4, Task 1.4

**Work:**
1. Update `Workout.tsx` to parse `prs` array from API response
2. Display `PRNotification` when workout saved and PRs detected
3. Handle multiple PRs (queue or display sequentially)
4. Clear notification state after display

**Validation:**
- Log workout with PR
- Verify notification appears immediately
- Test with multiple PRs
- Verify notifications don't overlap

**Deliverable:** PR notifications integrated into workout saving

---

## Phase 3: Testing & Polish (2 hours)

### Task 3.1: End-to-end testing
**Estimate:** 1 hour
**Depends on:** All previous tasks

**Work:**
1. Test complete user workflow:
   - Log first workout (establish baseline)
   - Log second workout with PR
   - Verify PR notification appears
   - Verify `personal_bests` updated
   - Log third workout with non-failure sets
   - Verify no PR detection for non-failure
2. Test edge cases:
   - Tie (same volume as previous)
   - First-time exercise
   - Breaking old PR (months ago)
   - Drop set (all sets to failure)
3. Test smart defaults with various set counts
4. Verify database records correct data

**Validation:**
```sql
-- Check failure status distribution
SELECT to_failure, COUNT(*) FROM exercise_sets GROUP BY to_failure;

-- Check PR updates
SELECT * FROM personal_bests ORDER BY updated_at DESC LIMIT 5;

-- Verify only failure sets counted
SELECT * FROM exercise_sets WHERE to_failure = 1 ORDER BY id DESC LIMIT 10;
```

**Deliverable:** All workflows tested and working

---

### Task 3.2: Documentation and cleanup
**Estimate:** 0.5 hour
**Depends on:** Task 3.1

**Work:**
1. Add JSDoc comments to PR detection functions
2. Document database schema changes in README
3. Remove debug console.log statements
4. Format code consistently
5. Update user-facing help text if needed

**Validation:**
- Code review passes
- Documentation is clear
- No console errors/warnings

**Deliverable:** Clean, documented code

---

### Task 3.3: Performance validation (optional)
**Estimate:** 0.5 hour
**Depends on:** Task 3.1

**Work:**
1. Test with large dataset (100+ workouts, 1000+ sets)
2. Measure PR detection query performance
3. Verify index on `to_failure` improves query speed
4. Check frontend rendering performance with toggle UI

**Validation:**
```bash
# Time PR detection
# Expected: <50ms per workout save
```

**Deliverable:** Performance validated

---

## Task Dependencies Diagram

```
Phase 1 (Backend)
  1.1 (DB Migration)
    ↓
  1.2 (Backend API)
    ↓
  1.3 (PR Detection Algorithm)
    ↓
  1.4 (Update Personal Bests)

Phase 2 (Frontend)
  2.1 (Frontend Types) ←── 1.2
    ↓
  2.2 (Toggle UI) ←── 2.1
    ↓
  2.3 (Smart Defaults) ←── 2.2
    ↓
  2.4 (PR Notification Component) ←── 2.1
    ↓
  2.5 (Integration) ←── 2.4, 1.4

Phase 3 (Testing)
  3.1 (E2E Testing) ←── 2.5
    ↓
  3.2 (Documentation)
    ↓
  3.3 (Performance) [optional]
```

---

## Parallelization Opportunities

**After Task 1.2:**
- Task 1.3 (PR Algorithm) + Task 2.1 (Frontend Types) can run in parallel

**After Task 2.1:**
- Task 2.2 (Toggle UI) + Task 2.4 (Notification) can start mockups in parallel

---

## Rollback Plan

If issues arise, rollback in reverse order:

1. **UI Issues (Phase 2):** Remove toggle UI and PR notifications, revert Workout.tsx
2. **PR Detection Issues (Phase 1.3-1.4):** Disable PR detection, keep `to_failure` flag
3. **API Issues (Phase 1.2):** Backend ignores `to_failure` field (defaults to 1)
4. **DB Issues (Phase 1.1):** Run rollback migration:
   ```sql
   DROP INDEX IF EXISTS idx_exercise_sets_to_failure;
   ALTER TABLE exercise_sets DROP COLUMN to_failure;
   ```

---

## Success Metrics

After completion, verify:

- ✅ `exercise_sets` table has `to_failure` column
- ✅ Last set automatically marked as "to failure"
- ✅ User can toggle failure status on any set
- ✅ PR detection works for volume-based comparisons
- ✅ PR notification appears when record broken
- ✅ `personal_bests` table automatically updated
- ✅ Non-failure sets excluded from PR detection
- ✅ Builds compile without errors (frontend and backend)
- ✅ No console errors in browser

---

*Total estimated time: 8-10 hours across 3 phases, 12 tasks*

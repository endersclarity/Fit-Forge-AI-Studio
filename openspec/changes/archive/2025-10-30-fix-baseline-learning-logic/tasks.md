# Implementation Tasks: fix-baseline-learning-logic

**Change ID:** fix-baseline-learning-logic
**Estimated Total Effort:** 3-4 hours

---

## Phase 1: Backend Logic Fix (1-2 hours)

### Task 1.1: Remove to_failure filter from baseline learning query
**File:** `backend/database/database.ts`
**Function:** `updateMuscleBaselinesFromWorkout()`
**Lines:** ~510-544

**Actions:**
1. Locate SQL query that selects exercise_sets with `to_failure = 1` filter
2. Remove `AND to_failure = 1` condition from WHERE clause
3. Update query to select ALL sets: `WHERE workout_id = ?`
4. Add comment: `// Process ALL sets - to_failure flag preserved for PR detection, not baseline learning`

**Validation:**
- Query returns all sets in workout, not just failure sets
- TypeScript compiles without errors
- No other code depends on filtered result

---

### Task 1.2: Change aggregation from MAX to SUM
**File:** `backend/database/database.ts`
**Function:** `learnMuscleBaselinesFromWorkout()`
**Lines:** 540-542

**Actions:**
1. **CRITICAL CODE CHANGE**: Replace MAX tracking with SUM accumulation
2. **Current (broken) code:**
   ```typescript
   if (!muscleVolumes[muscleName] || muscleVolume > muscleVolumes[muscleName]) {
     muscleVolumes[muscleName] = muscleVolume;  // MAX single-set volume
   }
   ```
3. **New (correct) code:**
   ```typescript
   // Sum all set volumes to measure total session capacity
   muscleVolumes[muscleName] = (muscleVolumes[muscleName] || 0) + muscleVolume;
   ```
4. Update comment (line 515) from "Track max volume" to "Track total session volume"
5. Update comment (line 518) from "Process each failure set" to "Process each set"

**Validation:**
- All sets contribute to `muscleVolumes` accumulator via addition (+)
- No conditional logic checking if value is greater than existing
- Session volume = SUM of all set volumes per muscle
- Example: 3 sets of 850 units each = 2,550 total (not 850 max)

---

### Task 1.3: Verify baseline comparison logic unchanged
**File:** `backend/database/database.ts`
**Function:** `updateMuscleBaselinesFromWorkout()`
**Lines:** ~549-578

**Actions:**
1. Confirm comparison still uses: `if (observedVolume > currentBaseline.system_learned_max)`
2. Verify ratchet behavior preserved (only increase, never decrease)
3. Ensure `updated_baselines` array still returned in response
4. No changes needed to comparison logic (just input data changed)

**Validation:**
- Baseline updates when observed > current (regardless of to_failure)
- Baseline never decreases
- Response format unchanged

---

## Phase 2: Update Specifications (30 minutes)

### Task 2.1: Mark baseline-learning-engine spec as superseded
**File:** `openspec/specs/baseline-learning-engine/spec.md`

**Actions:**
1. Add note at top: "**SUPERSEDED**: See `fix-baseline-learning-logic` change for corrected requirements"
2. Add link to new spec: `specs/baseline-learning-accuracy/spec.md`
3. Do NOT delete old spec (preserve history)
4. Mark with status: `[DEPRECATED - Contained logical flaw]`

**Validation:**
- Old spec clearly marked as superseded
- Link to corrected spec provided
- Historical record preserved

---

### Task 2.2: Verify new spec completeness
**File:** `openspec/changes/fix-baseline-learning-logic/specs/baseline-learning-accuracy/spec.md`

**Actions:**
1. Review all scenarios cover edge cases
2. Confirm MODIFIED/REMOVED sections clearly document changes
3. Verify implementation notes match actual code structure
4. Check cross-references to related specs

**Validation:**
- All scenarios have Given/When/Then structure
- Changes from old spec clearly documented
- No ambiguities or missing details

---

## Phase 3: Test Updates (1 hour)

### Task 3.1: Add test for non-failure sets updating baselines
**File:** `backend/__tests__/database.test.ts` (or create if missing)

**Actions:**
1. Create test case: "Updates baseline from non-failure sets when volume exceeds current"
2. Setup: Set baseline to 1,000
3. Log workout: 3 sets of 100×10 with `to_failure = 0` (total: 2,550 volume)
4. Assert: Baseline updated to 2,550
5. Assert: `updated_baselines` array includes update

**Validation:**
- Test passes with new logic
- Test would FAIL with old logic (confirms fix works)

---

### Task 3.2: Add test for mixed failure/non-failure sets
**File:** `backend/__tests__/database.test.ts`

**Actions:**
1. Create test case: "Calculates session volume from both failure and non-failure sets"
2. Log workout with 2 non-failure sets (1,000 units each) + 1 failure set (500 units)
3. Assert: Total session volume = 2,500 units
4. Assert: Baseline updated to 2,500 (all sets counted)

**Validation:**
- Both set types contribute to total
- Accurate session volume calculation

---

### Task 3.3: Remove or update obsolete test cases
**File:** `backend/__tests__/database.test.ts`

**Actions:**
1. Find test: "User does submaximal workout (no baseline updates)"
2. Update OR remove (this behavior is now WRONG)
3. If similar test exists asserting "no update without failure sets", remove it
4. Update any tests that assume to_failure filter exists

**Validation:**
- No tests assert incorrect behavior
- All tests align with corrected logic

---

## Phase 4: Data Migration (MANDATORY - 2 hours)

⚠️ **CRITICAL**: This phase is MANDATORY because changing MAX→SUM makes all existing baselines incorrect.

### Task 4.1: Create baseline rebuild script
**File:** `backend/scripts/rebuild-baselines.ts` (new file)

**Actions:**
1. Create script that calls `rebuildMuscleBaselines()` function with NEW SUM logic
2. Add before/after comparison showing magnitude change (e.g., 850 → 2,550)
3. Add dry-run mode to preview changes without committing
4. Add warnings about breaking change in baseline semantics
5. Document that this MUST be run after deploying code changes

**Validation:**
- Script executes without errors
- Baselines recalculated using SUM aggregation from ALL historical sets
- User sees clear comparison of old vs new values
- Script warns about 3-5x magnitude increase

---

### Task 4.2: Run migration on existing data (MANDATORY)
**When:** Immediately after deploying code changes
**Risk:** Until migration runs, baselines are incorrect and fatigue calculations may be wrong

**Actions:**
1. **BEFORE migration:**
   - Backup database
   - Document current baseline values for comparison
   - Verify fatigue system won't break during migration
2. **Run migration:**
   - Execute rebuild script in dry-run mode
   - Review proposed baseline changes (expect 3-5x increase)
   - Verify new baselines >= old baselines * number_of_sets
   - Execute migration (cannot be skipped)
3. **AFTER migration:**
   - Verify all baselines updated successfully
   - Check fatigue calculations still work
   - Confirm no data corruption

**Validation:**
- Database backup exists
- New baselines are 3-5x larger than old baselines (SUM vs MAX)
- All muscles have updated baselines
- No data loss or corruption
- Fatigue system still functional (investigate separately if needed)

---

## Phase 5: Validation & Documentation (30 minutes)

### Task 5.1: Manual testing
**Actions:**
1. Start application with fixed code
2. Log workout with ALL sets marked `to_failure = 0`
3. Set initial baseline to 1,000
4. Log 3 sets totaling 2,500 volume
5. Verify baseline updates to 2,500
6. Check API response includes `updated_baselines` array

**Validation:**
- Non-failure sets trigger baseline updates
- UI shows accurate baseline values
- No errors in console or logs

---

### Task 5.2: Run OpenSpec validation
**Command:** `openspec validate fix-baseline-learning-logic --strict`

**Actions:**
1. Run validation command
2. Fix any issues reported
3. Ensure all specs, tasks, and proposal validate cleanly
4. Verify no broken references

**Validation:**
- Validation passes with zero errors
- All cross-references resolve
- Spec structure follows conventions

---

### Task 5.3: Update CHANGELOG
**File:** `CHANGELOG.md`

**Actions:**
1. Add entry under "Fixed" section
2. Document: "Corrected muscle baseline learning to process all logged sets, not just failure sets"
3. Explain impact: "Baselines now accurately reflect actual muscle capacity from complete workout history"
4. Reference OpenSpec change: `fix-baseline-learning-logic`

**Validation:**
- CHANGELOG entry clear and accurate
- User impact explained
- Technical details appropriate

---

## Completion Checklist

Before marking this change as complete:

### Code Changes (Both Required)
- [ ] Change 1: Removed `AND to_failure = 1` filter from query (line 507)
- [ ] Change 2: Replaced MAX tracking with SUM accumulation (lines 540-542)
- [ ] All Phase 1 tasks completed (backend logic fixed)

### Specs and Tests
- [ ] All Phase 2 tasks completed (specs updated, old spec marked superseded)
- [ ] All Phase 3 tasks completed (tests passing with new behavior)
- [ ] New tests validate SUM aggregation, not MAX
- [ ] Obsolete tests removed (no tests expecting to_failure filter)

### Migration (MANDATORY)
- [ ] Phase 4 completed (data migration executed successfully)
- [ ] Database backup created before migration
- [ ] Baselines rebuilt using SUM aggregation from all historical sets
- [ ] New baselines verified to be 3-5x larger than old values
- [ ] Fatigue system verified to still work after migration

### Validation
- [ ] Phase 5 completed (validation passing)
- [ ] Manual testing confirms both changes work correctly
- [ ] No regressions in existing features
- [ ] Code reviewed and committed
- [ ] OpenSpec validation passes: `openspec validate fix-baseline-learning-logic --strict`

### Documentation
- [ ] CHANGELOG updated with breaking change warning
- [ ] Migration impact documented for users
- [ ] Baseline semantics change clearly communicated

---

## Rollback Plan

If issues discovered after deployment:

1. **Immediate:** Revert backend code changes
2. **Database:** Restore baseline values from backup if migration was run
3. **Tests:** Revert test changes
4. **Investigation:** Analyze what went wrong, update proposal
5. **Re-attempt:** Fix issues and re-deploy with additional validation

---

## Dependencies

**Depends on:**
- None (standalone bug fix)

**Blocks:**
- Any feature depending on accurate baseline values
- Workout recommendation features
- Capacity-based training algorithms

**Related:**
- `pr-detection-and-celebration` - Unaffected (still uses to_failure flag)
- `failure-status-tracking` - Unaffected (still tracks flag)

---

## Notes for Implementer

**Key principle:** Every logged set is proof the user's muscles handled that volume. Use it to learn.

**Common pitfall:** Don't overthink warm-up sets. If user logs them, they count. Future enhancement could add warm-up flagging if needed.

**Testing tip:** Best way to verify fix is to log a workout with zero failure sets and confirm baseline still updates. Old code would leave baseline unchanged (broken behavior).

**Migration consideration:** Rebuilding baselines from history is optional but recommended. Users will appreciate seeing their baselines reflect all their hard work, not just their failure sets.

# Proposal: Fix Baseline Learning Logic

**Change ID:** `fix-baseline-learning-logic`
**Status:** Draft → **SUPERSEDED**
**Created:** 2025-10-29
**Author:** System
**Superseded By:** `fix-critical-data-bugs`
**Superseded Date:** 2025-10-29

---

## ⚠️ STATUS: SUPERSEDED

**This proposal has been SUPERSEDED by `fix-critical-data-bugs` proposal.**

**Decision Made:** Path A (Remove Backend Baseline Learning) was chosen and implemented.

### Why This Was Superseded:

During implementation investigation, a **critical race condition** was discovered:

- **Frontend** (App.tsx:73-88): Already implements baseline learning CORRECTLY
  - Uses SUM of ALL sets ✅
  - Processes all exercises ✅
  - Updates baselines appropriately ✅

- **Backend** (database.ts:502-581): Implemented baseline learning INCORRECTLY
  - Uses MAX of to_failure sets only ❌
  - Runs AFTER frontend update ❌
  - OVERWRITES frontend's correct values ❌

### What Was Done Instead:

**Backend baseline learning was REMOVED entirely** (implemented in `fix-critical-data-bugs`):
- Deleted `learnMuscleBaselinesFromWorkout()` function
- Removed function call from `saveWorkout()`
- Removed `updated_baselines` from API response
- Frontend baseline learning preserved (already works correctly)

**Result:** This proposal is now OBSOLETE. The backend baseline learning system no longer exists, so there is nothing to fix. Frontend handles all baseline learning correctly.

---

**The original proposal follows below, preserved for reference:**

---

## Problem Statement

The current muscle baseline learning algorithm contains a fundamental logical flaw that undermines its core purpose: measuring actual muscle capacity.

**Current Broken Behavior:**
- System ONLY updates `muscle_baselines.system_learned_max` from sets marked as `to_failure = 1`
- Sets marked `to_failure = 0` are completely ignored for baseline learning
- Result: Users can perform workouts that PROVE higher muscle capacity, but the system ignores this evidence

**Why This Is Wrong:**

1. **Logged volume proves capacity**: If a user logs "Bench Press: 100 lbs × 10 reps", they factually moved 1,000 lbs of volume. This is empirical proof their muscles handled that load.

2. **"To failure" is training strategy, not capacity measurement**: Whether the user stopped at 10 reps voluntarily or because they physically couldn't do 11 is irrelevant to the fact that they DID 10 reps.

3. **Baselines get stuck below actual capacity**: A user could log multiple workouts with 3,000 units of volume (not to failure), while their baseline remains at 1,000 units, causing the system to wildly underestimate their actual capacity.

4. **Defeats the purpose of learning**: The baseline learning system exists to understand what the user's muscles can handle. Ignoring logged performance data contradicts this goal.

**Real-World Example:**

```
Scenario: User logs Push workout
- Exercise: Bench Press - 100 lbs × 10 reps (to_failure = 0)
- Exercise: Bench Press - 100 lbs × 10 reps (to_failure = 0)
- Exercise: Bench Press - 100 lbs × 10 reps (to_failure = 0)
- Total Pectoralis volume: ~2,550 units

Current baseline: 1,000 units
System behavior: Ignores all evidence, baseline stays at 1,000
Correct behavior: User proved 2,550 capacity, baseline should update to 2,550
```

---

## Proposed Solution

**Fix baseline learning to accurately measure muscle capacity through two critical changes:**

### Core Principle
**Every logged set is proof of capacity.** If the user logged it, their muscles handled it. Use it to learn.

### What Changes

This proposal makes **TWO distinct changes** to fix baseline learning:

#### Change 1: Remove `to_failure` Filter
- **Current**: Only processes sets with `to_failure = 1` (line 507)
- **New**: Process ALL logged sets, regardless of `to_failure` flag
- **Impact**: System learns from all performance data, not just self-declared failure sets

#### Change 2: Switch from MAX to SUM Aggregation
- **Current**: Tracks MAXIMUM single-set volume per muscle (lines 540-542)
  ```typescript
  if (!muscleVolumes[muscleName] || muscleVolume > muscleVolumes[muscleName]) {
    muscleVolumes[muscleName] = muscleVolume;  // MAX
  }
  ```
- **New**: Track TOTAL session volume per muscle (sum all sets)
  ```typescript
  muscleVolumes[muscleName] = (muscleVolumes[muscleName] || 0) + muscleVolume;  // SUM
  ```
- **Impact**: Baselines represent total muscle capacity in a session, not single-set capacity
- **Rationale**: For fatigue/recovery systems, we need to know "How much total work can this muscle handle per session?" not "What's the heaviest single set?"

#### What Stays The Same
3. **Ratchet model preserved**: Still only update when observed > current baseline (never decrease)
4. **"To failure" flag preserved**: Keep for future training strategy features (progression recommendations, PR detection, etc.)

### What Stays The Same
- Muscle engagement percentage calculations
- Volume calculation formulas (weight × reps × engagement%)
- Baseline ratchet behavior (only increase, never decrease)
- Database schema (no changes needed)
- API response structure (optional `updated_baselines` array)

---

## Impact Analysis

### Benefits
- ✅ **Accurate capacity measurement**: System learns from all actual performance data
- ✅ **Faster baseline calibration**: Reaches accurate baselines more quickly
- ✅ **Better workout recommendations**: Future features get realistic capacity data
- ✅ **Logical consistency**: System behavior matches user mental model
- ✅ **No user-facing changes**: Purely improves internal accuracy

### Risks
- ⚠️ **Baseline inflation from warm-up sets**: If users log light warm-up sets, these could inflate session volume
  - **Mitigation**: This is already a problem with current system (just affects failure sets only)
  - **Future solution**: Add warm-up set flagging if needed (separate feature)

### Breaking Changes

⚠️ **CRITICAL: This changes baseline semantics and requires data migration**

#### Breaking Change: Baseline Magnitude Increase
- **Current baselines**: Represent max single-set volume (e.g., 850 units)
- **New baselines**: Represent total session volume (e.g., 2,550 units for 3 sets)
- **Impact**: New baselines will be 3-5x larger than current values
- **Migration Required**: ALL existing baselines must be rebuilt from workout history

#### What This Breaks:
1. **Fatigue calculations**: Any code using `baseline / volume_today` ratios will get different percentages
2. **Workout recommendations**: Features assuming baselines = single-set capacity will be incorrect
3. **Historical comparisons**: Old baseline values cannot be compared to new values
4. **Data integrity**: Existing baseline values become meaningless after this change

#### What Doesn't Break:
- ✅ API response structure unchanged (still returns `updated_baselines` array)
- ✅ Database schema unchanged (same columns, different semantics)
- ✅ `to_failure` data preserved for other features
- ✅ Volume calculation formulas unchanged

---

## Success Criteria

1. **All logged sets contribute to baseline learning**: Any set with weight × reps > 0 counts toward muscle volume
2. **Baselines track actual capacity**: After workout, baseline >= highest observed session volume
3. **No regression in existing features**: Workout logging, PR detection, etc. continue working
4. **Tests validate behavior**: Unit tests confirm all sets processed, not just failure sets

---

## Scope

### In Scope
1. **Change 1: Remove to_failure filter**
   - Remove `AND to_failure = 1` from query (line 507)
   - Update query to: `WHERE workout_id = ?`

2. **Change 2: Switch MAX to SUM aggregation**
   - Replace lines 540-542 max-tracking logic
   - Change from: `if (muscleVolume > muscleVolumes[muscleName])`
   - Change to: `muscleVolumes[muscleName] = (muscleVolumes[muscleName] || 0) + muscleVolume`

3. **Data migration (MANDATORY)**
   - Rebuild all baselines from complete workout history
   - Script to show before/after comparison
   - Verify new baselines >= old baselines (ratchet preserved)

4. **Tests and specs**
   - Update unit tests to validate new behavior
   - Update `baseline-learning-engine` spec to reflect corrected logic

### Out of Scope
- Changing `to_failure` flag collection (keep it for future features)
- Adding warm-up set detection (future enhancement)
- Modifying PR detection logic (separate concern)
- Changing database schema (same columns, different semantics)

---

## Related Specifications

- **MODIFIED**: `baseline-learning-engine` - Remove "to failure" requirement from all scenarios
- **Related**: `pr-detection-and-celebration` - Uses `to_failure` flag (unchanged)
- **Related**: `failure-status-tracking` - Tracks flag (unchanged)

---

## Implementation Phases

1. **Phase 1**: Update baseline learning algorithm (backend)
2. **Phase 2**: Update specification to reflect correct logic
3. **Phase 3**: Add/update tests to validate all sets processed
4. **Phase 4**: Validate existing workouts, rebuild baselines if needed

---

## Open Questions

1. ~~Should we rebuild existing baselines from historical workout data after deploying this fix?~~ **RESOLVED**
   - **Decision**: YES - Migration is MANDATORY, not optional
   - **Reason**: Changing MAX→SUM makes all existing baseline values incorrect
   - **Implementation**: Add migration script to Phase 4 tasks

2. ~~Do we need to preserve backward compatibility with old spec?~~ **RESOLVED**
   - **Decision**: NO - This is a fundamental fix, not backward compatible
   - **Reason**: Old spec contained logical flaw, new spec fixes it
   - **Impact**: Mark old spec as superseded, link to new spec

3. **NEW**: What happens to fatigue calculations during migration?
   - **Risk**: If fatigue system uses baselines, calculations will be wrong during migration
   - **Recommendation**: Investigate fatigue system first (separate task)
   - **Mitigation**: May need to pause fatigue calculations during migration

---

## Validation Plan

- [ ] Unit tests confirm all logged sets contribute to volume calculation
- [ ] Integration tests verify baseline updates occur with `to_failure = 0` sets
- [ ] Manual testing: Log workout with no failure sets, verify baseline updates
- [ ] Spec validation passes with `openspec validate fix-baseline-learning-logic --strict`

---

## Estimated Effort

- **Backend code changes**: 1-2 hours (two distinct changes to implement)
- **Test updates**: 1 hour (add new tests, remove obsolete tests)
- **Spec updates**: 30 minutes (mark old spec superseded)
- **Data migration (MANDATORY)**: 2 hours (script + validation + execution)
- **Fatigue system investigation**: 1 hour (verify impact of baseline changes)
- **Total**: 5-6 hours (increased from 3-4 due to mandatory migration)

---

## References

- Discussion: User feedback revealing logical flaw
- Current implementation: `backend/database/database.ts:540-581`
- Related spec: `openspec/specs/baseline-learning-engine/spec.md`

---

## Cross-References

**Related Proposals:**
- `fix-critical-data-bugs` - Discovered race condition between frontend and backend baseline learning
  - May supersede this proposal by removing backend baseline learning entirely
  - See: `openspec/changes/fix-critical-data-bugs/specs/baseline-race-condition-fix/spec.md`

**Implementation Recommendation:**
Review `fix-critical-data-bugs` proposal FIRST before implementing this proposal. The simpler solution may be to remove the broken backend code rather than fix it.

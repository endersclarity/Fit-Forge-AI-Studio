---
status: ready
priority: p3
issue_id: "006"
tags: [validation, bodyweight, volume-calculation, data-quality]
dependencies: ["001", "002"]
---

# Validate Bodyweight Exercise Volume Calculations

## Problem Statement

The workout data shows bodyweight exercises with calculated loads (Push-up and TRX Pushup show weight=200, TRX Tricep Extension shows weight=0). The muscle fatigue calculation must correctly interpret these values and calculate accurate volume. We need to verify the bodyweight calculation logic is correct and that the fatigue calculation uses it properly.

## Findings

- **Workout data shows**:
  - Push-up: weight=200 (likely user bodyweight)
  - TRX Pushup: weight=200 (bodyweight)
  - TRX Tricep Extension: weight=0 (why zero?)
- **Questions**:
  - Is 200 lbs accurate bodyweight for user?
  - Does weight=200 mean full bodyweight or percentage?
  - Why does TRX Tricep Extension show weight=0?
  - Are TRX exercises using correct bodyweight multipliers?
- Location: Bodyweight calculation logic (workout logging), volume calculation in muscle fatigue
- **Impact**: Incorrect volume → incorrect fatigue → bad recommendations

**Problem Scenario:**
1. User performs 10 push-ups at 200 lbs bodyweight
2. System calculates volume as: 10 reps × 200 lbs = 2,000 lbs
3. But push-ups use ~64% of bodyweight
4. Actual volume should be: 10 reps × 128 lbs = 1,280 lbs
5. If calculation uses wrong value, fatigue will be overestimated
6. Result: System says muscles more fatigued than reality

**TRX Extension Mystery:**
- Why does TRX Tricep Extension show weight=0?
- Should it calculate bodyweight percentage?
- Or is zero correct because resistance is minimal?

## Proposed Solutions

### Option 1: Validate and Document Current Logic (Recommended)
- **Pros**:
  - Understand what's actually happening
  - Document intended behavior
  - Verify correctness before building on it
- **Cons**:
  - Requires investigation time
- **Effort**: Small (1-2 hours)
- **Risk**: Low

**Steps:**
1. Find bodyweight calculation code (workout logging)
2. Verify: Does weight=200 mean full bodyweight or adjusted?
3. Check if bodyweight multipliers are applied
4. Understand why TRX Tricep Extension = 0
5. Document the calculation logic
6. Verify fatigue calculation uses values correctly

### Option 2: Implement Bodyweight Multipliers
- **Pros**:
  - More accurate volume calculations
  - Researched percentages for each exercise
- **Cons**:
  - May duplicate existing logic
  - Could break if already implemented
- **Effort**: Medium (2-4 hours)
- **Risk**: Medium - may conflict with existing code

## Recommended Action

**Execute Option 1** - Validate current logic first, then fix if needed

**Research Required:**
- Push-up: ~64% of bodyweight
- TRX Pushup: ~70% of bodyweight (more unstable)
- TRX Tricep Extension: ~50% of bodyweight (or less?)

**Validation Questions:**
1. Where is bodyweight stored? (user profile?)
2. When is bodyweight applied to exercises?
3. Are multipliers already implemented?
4. Why does one TRX exercise show 200 and another show 0?

## Technical Details

- **Affected Files**:
  - Workout logging code (where weight=200 is set)
  - User profile (bodyweight storage)
  - Exercise database (bodyweight multipliers)
  - Muscle fatigue calculation (volume calculation)

- **Related Components**:
  - Bodyweight exercise tracking
  - Volume calculation formula
  - Exercise database with multipliers
  - User profile bodyweight

- **Database Changes**:
  - No changes expected
  - May document schema if unclear

## Resources

- Original finding: docs/investigations/muscle-fatigue-investigation-plan.md (Phase 3.3)
- Test data: Workout ID 60 bodyweight exercises
- Related issue: #001 (volume calculation must be correct)
- Related issue: #002 (exercise database may include multipliers)

## Acceptance Criteria

- [ ] Bodyweight calculation logic documented
- [ ] Understand where weight=200 comes from
- [ ] Understand why TRX Tricep Extension shows weight=0
- [ ] Verify bodyweight multipliers applied (or document as TODO)
- [ ] Volume calculation uses correct values
- [ ] Push-up volume matches expected calculation
- [ ] TRX Pushup volume accounts for instability
- [ ] TRX Tricep Extension volume is correct (even if zero)
- [ ] Tests verify bodyweight exercise volume calculations
- [ ] Documentation explains bodyweight exercise handling

## Work Log

### 2025-10-31 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue identified during muscle fatigue investigation triage
- Categorized as P3 NICE-TO-HAVE (validation, likely already correct)
- Estimated effort: Small (1-2 hours validation)
- Marked as dependent on Issue #001 and #002

**Learnings:**
- Bodyweight logic already exists (weight=200 in data)
- Need to verify it's correct before relying on it
- Recent commits mention bodyweight exercise tracking (8d029b0)
- TRX Extension showing weight=0 is curious - needs investigation
- This affects volume accuracy for fatigue calculation

## Notes

Source: Triage session on 2025-10-31

From investigation plan Phase 3.3 - Volume Calculation for Bodyweight Exercises:
- Current state: Push-ups show weight=200 (user bodyweight)
- Verify this is correct approach
- Document how TRX exercises calculate load
- Ensure volume formula accounts for bodyweight correctly

Priority set to P3 because:
- Logic appears to already exist (weight field populated)
- More of a validation/verification task than implementation
- Likely to find it's already correct
- Important for accuracy but not blocking
- Can investigate during Phase 1.3 of Issue #001

**Recent commit reference:**
- 8d029b0: "fix: integrate historical workout data and fix bodyweight exercise tracking"
- Suggests bodyweight logic was recently worked on
- Should review this commit during investigation

**Expected volume calculations:**
```
Push-up (10 reps at 200 lbs bodyweight, 64% multiplier):
  10 × (200 × 0.64) = 1,280 lbs total volume

TRX Pushup (19 reps at 200 lbs bodyweight, 70% multiplier):
  19 × (200 × 0.70) = 2,660 lbs total volume

TRX Tricep Extension (8 reps at ??? bodyweight):
  Need to determine correct calculation
```

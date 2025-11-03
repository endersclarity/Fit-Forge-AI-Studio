---
status: ready
priority: p2
issue_id: "003"
tags: [bug, date-handling, timezone, data-quality]
dependencies: []
---

# Date/Time Handling May Cause Workout Matching Failures

## Problem Statement

The workout data shows inconsistent date formats that could cause matching failures in muscle state calculations. The workout date is stored as "2025-10-29T00:00:00.000Z" (ISO 8601 UTC) while created_at is "2025-10-31 02:15:53" (different format). If the muscle state calculation queries workouts by date range and has conversion errors, it might not find workouts that actually exist.

## Findings

- **Date format inconsistency**:
  - `date`: "2025-10-29T00:00:00.000Z" (ISO 8601 UTC)
  - `created_at`: "2025-10-31 02:15:53" (different format, no timezone)
- Location: Backend muscle state calculation queries, date comparison logic
- **Risk**: Date comparison bugs could filter out valid workouts

**Problem Scenario:**
1. Muscle state calculation queries: "Get workouts from last 30 days"
2. Current date: 2025-10-31 in local timezone
3. Workout date: 2025-10-29T00:00:00.000Z in UTC
4. Date comparison uses wrong timezone or format conversion
5. Workout not matched/found in date range query
6. Result: Missing fatigue data even though workout exists in database

**daysElapsed Calculation Risk:**
- Need to calculate days between workout date and current date
- Timezone differences could cause off-by-one errors
- Example: UTC midnight vs local midnight difference

## Proposed Solutions

### Option 1: Investigate and Normalize (Recommended)
- **Pros**:
  - Identifies actual issues vs theoretical
  - Documents timezone handling strategy
  - Prevents future date bugs
- **Cons**:
  - Requires careful testing
- **Effort**: Small (1-2 hours)
- **Risk**: Low

**Steps:**
1. Investigate date handling in workout queries
2. Ensure all dates normalized to UTC for comparison
3. Document timezone handling strategy
4. Add validation tests for date range queries
5. Verify daysElapsed calculation uses correct date math
6. Test edge cases (midnight boundaries, daylight saving)

### Option 2: Standardize Date Storage Format
- **Pros**:
  - Clean, consistent data model
  - Easier maintenance
- **Cons**:
  - May require migration
  - Could be premature optimization
- **Effort**: Medium (2-4 hours with migration)
- **Risk**: Medium - migration could break existing code

## Recommended Action

**Execute Option 1** - Investigate as part of Issue #001 Phase 1.5, then fix if needed

## Technical Details

- **Affected Files**:
  - Backend workout query functions
  - Muscle state calculation date comparisons
  - Database schema (date column types)
  - Date utility functions

- **Related Components**:
  - Workout history queries
  - Recovery time calculations
  - Historical tracking
  - Date display in UI

- **Database Changes**:
  - No changes expected
  - May document intended date storage format

## Resources

- Original finding: docs/investigations/muscle-fatigue-investigation-plan.md (Phase 1.5)
- Test case: Workout ID 60 date comparison
- Related issue: #001 (may be sub-task of investigation)

## Acceptance Criteria

- [ ] All date formats documented
- [ ] Timezone handling strategy defined (UTC vs local)
- [ ] Date comparison logic verified to work correctly
- [ ] daysElapsed calculation produces correct values
- [ ] Workout date range queries return expected workouts
- [ ] Edge cases tested (midnight, timezone boundaries)
- [ ] No off-by-one errors in day calculations
- [ ] Tests for date handling added

## Work Log

### 2025-10-31 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue identified during muscle fatigue investigation triage
- Categorized as P2 IMPORTANT (potential bug, needs verification)
- Estimated effort: Small (1-2 hours)
- Flagged for investigation in Phase 1.5

**Learnings:**
- Date format inconsistency observed in API responses
- Could be benign or could cause real bugs
- Need to verify actual behavior vs theoretical risk
- This is part of overall investigation phase

## Notes

Source: Triage session on 2025-10-31

This is likely investigated as part of Issue #001 Phase 1.5 (Date/Time Handling Analysis). May not require separate implementation if investigation shows no issues.

Priority set to P2 because:
- Could be theoretical rather than actual bug
- Investigation phase will reveal if this is real problem
- Lower priority than core integration work
- Should be checked but not blocking

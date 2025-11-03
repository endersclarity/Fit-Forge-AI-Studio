---
status: ready
priority: p3
issue_id: "005"
tags: [robustness, error-handling, edge-case, logging]
dependencies: ["001"]
---

# Graceful Handling of Unknown Exercises

## Problem Statement

When muscle fatigue calculation encounters an exercise that doesn't exist in the exercise database, the system must handle it gracefully rather than crashing or silently producing incorrect results. This is important for robustness, user experience, and debugging.

## Findings

- **Risk**: Users may log custom exercises or exercise names that don't match database
- **Impact**: Calculation could crash, skip muscle, or produce incorrect fatigue data
- **User experience**: System should work even with incomplete exercise database
- Location: backend/database/analytics.ts (exercise lookup in calculation function)
- **Debugging**: Need visibility into which exercises are unknown

**Problem Scenario:**
1. User logs workout with custom exercise "My Special Pushup Variation"
2. Muscle fatigue calculation tries to lookup exercise
3. Exercise not found in database
4. System crashes with unhandled error OR
5. System silently skips exercise with no feedback OR
6. System assigns default/incorrect muscle mappings
7. Result: Poor user experience or incorrect data

## Proposed Solutions

### Option 1: Log Warning and Skip Exercise (Recommended)
- **Pros**:
  - Non-breaking behavior
  - Provides visibility through logs
  - Allows system to continue functioning
  - Can track which exercises need to be added
- **Cons**:
  - Incomplete fatigue data (but doesn't crash)
  - Requires monitoring logs
- **Effort**: Small (< 1 hour)
- **Risk**: Low

**Implementation:**
```typescript
const exerciseData = await getExerciseData(exercise.exercise);
if (!exerciseData) {
  console.warn(`Unknown exercise: ${exercise.exercise}`);
  // TODO: Track unknown exercises for database expansion
  continue; // Skip this exercise
}
```

### Option 2: Prompt User to Map Muscles
- **Pros**:
  - Complete data even for custom exercises
  - User can define their own exercises
- **Cons**:
  - Interrupts workout flow
  - Complex UI implementation
  - Most users won't know muscle involvement percentages
- **Effort**: Large (8+ hours)
- **Risk**: Medium - UX complexity

### Option 3: Use Default Muscle Mapping
- **Pros**:
  - Non-breaking
  - Provides some fatigue data
- **Cons**:
  - Incorrect muscle attribution
  - May mislead users
  - False sense of accuracy
- **Effort**: Small (1 hour)
- **Risk**: High - produces incorrect data

## Recommended Action

**Execute Option 1** - Log warning and skip unknown exercises

**Rationale:**
- Honest about data limitations
- Non-breaking behavior
- Helps identify exercises to add to database
- Simple implementation
- Can enhance later with Option 2 if needed

**Enhancement Path:**
1. Start with logging and skipping
2. Collect unknown exercise names from logs
3. Periodically add popular unknown exercises to database
4. Eventually: Allow users to map custom exercises (Option 2)

## Technical Details

- **Affected Files**:
  - backend/database/analytics.ts (muscle state calculation)
  - backend/services/exercise-lookup.ts (lookup function)
  - backend/utils/logger.ts (logging)
  - backend/monitoring/metrics.ts (track unknown exercise rate)

- **Related Components**:
  - Muscle fatigue calculation
  - Exercise database
  - Logging and monitoring
  - Future: Custom exercise creation UI

- **Database Changes**:
  - No changes required
  - Future: May add user_custom_exercises table

## Resources

- Original finding: docs/investigations/muscle-fatigue-investigation-plan.md (Phase 4.1, Phase 5)
- Related issue: #001 (must implement this during calculation function)
- Related issue: #002 (exercise database must exist first)

## Acceptance Criteria

- [ ] Unknown exercises don't crash the system
- [ ] Warning logged for each unknown exercise with exercise name
- [ ] Warning includes workout ID and user ID for debugging
- [ ] Calculation continues and processes remaining exercises
- [ ] User sees muscle fatigue for known exercises only
- [ ] Unknown exercise count tracked in monitoring/metrics
- [ ] Documentation explains behavior for unknown exercises
- [ ] Tests verify graceful handling of unknown exercises

## Work Log

### 2025-10-31 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue identified during muscle fatigue investigation triage
- Categorized as P3 NICE-TO-HAVE (robustness, not critical for MVP)
- Estimated effort: Small (< 1 hour)
- Marked as dependent on Issue #001

**Learnings:**
- This is an edge case that needs handling but isn't blocking
- Simple solution (log and skip) is sufficient for MVP
- Can enhance later based on user needs
- Important for system robustness and debugging
- Helps identify exercise database gaps

## Notes

Source: Triage session on 2025-10-31

From investigation plan:
- Phase 4.1 Task 5: Handle edge cases including unknown exercises
- Phase 5 Step 5: Edge cases and polish including graceful error handling

Priority set to P3 because:
- Not blocking MVP (database can be seeded with common exercises)
- Edge case that may be rare initially
- Simple implementation (< 1 hour)
- Nice to have for robustness
- Can be implemented during Phase 5 polish

**Should be implemented but not urgent - include in Phase 5 of Issue #001**

Example log output:
```
[WARN] Unknown exercise encountered: "My Special Pushup Variation"
  Workout ID: 60
  User ID: 1
  Skipping exercise in muscle fatigue calculation
  Consider adding to exercise database if frequently used
```

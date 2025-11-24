---
status: ready
priority: p3
issue_id: "010"
tags: [investigation, feature, workout-logging, training-intensity]
dependencies: []
---

# Missing "To Failure" Tracking in Workout Logging

## Problem Statement

During workout logging, there is no visible "To Failure" button or toggle to indicate whether a set was taken to muscular failure or stopped short (submaximal/RIR > 0). The database has a `to_failure` column that defaults all sets to "failure = true", but users have no control over this setting.

## Findings

- **Database Column Exists**: `exercise_sets.to_failure INTEGER DEFAULT 1`
- **All Sets Default to Failure**: No way to mark submaximal sets
- **No UI Control**: Workout logging interface has no toggle/button
- **Location**: `backend/database/schema.sql:56`
- **Related GitHub Issue**: [#10](https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/10)
- **Uncertainty**: Was this intentionally excluded or just not implemented yet?

## Investigation Questions

### 1. Was this feature intentionally removed?
- [ ] Check git history for "to failure" related commits
- [ ] Search for removed UI components
- [ ] Look for architectural decision records
- [ ] Check for issues/PRs discussing removal

### 2. Was this feature planned but not implemented?
- [ ] Database column suggests it was planned (schema.sql:56)
- [ ] Check if backend accepts `to_failure` parameter
- [ ] Review architectural documents for original intent
- [ ] Check PRD or requirements docs

### 3. Current State Assessment
- [ ] All sets currently marked as `to_failure = 1` (true)
- [ ] No UI to change this value
- [ ] Backend may support it but UI doesn't expose it
- [ ] No "Greasing the Groove" or submaximal training support

## Why This Feature Matters

**Training Science:**
- **Intensity Tracking**: Distinguishing true maximal effort vs autoregulated
- **Recovery Estimation**: Failure sets require more recovery time
- **Progressive Overload**: Knowing if user truly couldn't do another rep
- **Training Styles**: Supporting both max-effort and submaximal methodologies

**Use Cases:**
1. **Periodization**: Some weeks call for submaximal work (deload)
2. **Greasing the Groove**: Intentional submaximal training for skill/frequency
3. **Autoregulation**: Stopping short when feeling fatigued
4. **Injury Prevention**: Not pushing to failure when recovering

**Example Scenarios:**
- User doing 3 sets bench press, pushes last set to failure, others stopped at RIR 2
- User doing daily pullup practice (submaximal sets throughout day)
- User in deload week (all sets stopped short of failure)

## Database Schema

**Current Schema** (`backend/database/schema.sql:56`):
```sql
CREATE TABLE IF NOT EXISTS exercise_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  weight REAL NOT NULL CHECK(weight >= 0 AND weight <= 10000),
  reps INTEGER NOT NULL CHECK(reps > 0 AND reps <= 1000),
  set_number INTEGER NOT NULL,
  to_failure INTEGER DEFAULT 1, -- ✅ Column exists
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);
```

**Index Exists**:
```sql
CREATE INDEX IF NOT EXISTS idx_exercise_sets_to_failure ON exercise_sets(to_failure);
```

## Proposed Solutions

### Phase 1: Investigation (Required First)

**Tasks:**
- [ ] Search codebase for "to_failure" or "toFailure" references
- [ ] Check git log for related changes: `git log --all --grep="failure" --oneline`
- [ ] Review architectural documents in `docs/` directory
- [ ] Check backend endpoint to see if it accepts `to_failure` parameter
- [ ] Look for related GitHub issues (#5 mentions this)
- [ ] Document findings and recommendations

**Effort**: Small (1 hour)
**Risk**: None (investigation only)

### Phase 2: Implementation (If Warranted)

**Option A: Simple Toggle (Minimalist)**

Add checkbox/toggle per set:
- [ ] "Taken to failure" checkbox in set logging UI
- Default: checked for last set, unchecked for others
- User can toggle any set

**Pros**:
- Simple implementation
- Clear user control
- Matches database schema

**Cons**:
- Takes up UI space
- May clutter interface

**Effort**: Small (2-3 hours)
**Risk**: Low

**Option B: Smart Defaults with Override**

Automatically mark last set of each exercise as "to failure":
- Last set: `to_failure = 1` (default)
- Other sets: `to_failure = 0` (default)
- User can tap to toggle any set

**Pros**:
- Intelligent defaults (last set usually hardest)
- Less manual work for user
- Common training pattern

**Cons**:
- Assumes user's training style
- May need override frequently

**Effort**: Small (2-3 hours)
**Risk**: Low

**Option C: Training Mode Selection**

Add workout mode selection:
- "Max Effort" mode: All sets to failure
- "Autoregulated" mode: User marks which sets
- "Submaximal" mode: No sets to failure (GTG training)

**Pros**:
- Supports multiple training philosophies
- Fewer toggles during workout
- Sets expectation upfront

**Cons**:
- More complex implementation
- May overwhelm beginners

**Effort**: Medium (4-5 hours)
**Risk**: Medium

## Recommended Action

**Step 1: Investigation (P3 - Low Priority)**
Complete Phase 1 investigation to determine:
- Was this intentionally excluded?
- Is backend ready?
- What was original intent?

**Step 2: Decision Gate**
Based on findings:
- If intentionally excluded with good reason → Close issue
- If planned but not implemented → Proceed to Phase 2
- If unclear → Consult with stakeholders

**Step 3: Implementation (If Approved)**
Recommend Option B (Smart Defaults) for best UX/effort balance.

## Technical Details

**Affected Files:**
- Database schema: `backend/database/schema.sql:56` (already exists)
- Backend types: May need `toFailure` field in TypeScript types
- Backend endpoint: `POST /api/workouts` (check if parameter supported)
- Workout logging UI: Add toggle/checkbox component
- Set logging component: State management for `to_failure` flag

**Related Components:**
- Workout save/calculation logic
- Recovery estimation (may use `to_failure` data)
- Volume calculations (may weight failure sets differently)

**Database Changes**: None (column exists)

## Resources

- GitHub Issue: [#10](https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/10)
- Related Issue: [#5](https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/5) - Implement To Failure Tracking UI
- Database schema: `backend/database/schema.sql:56`
- Database index: `backend/database/schema.sql:168`

## Acceptance Criteria

**Phase 1 (Investigation):**
- [ ] Git history reviewed for "to failure" changes
- [ ] Architectural documents checked for intent
- [ ] Backend parameter support verified
- [ ] Findings documented with recommendation

**Phase 2 (Implementation - if approved):**
- [ ] UI control added to set logging interface
- [ ] `to_failure` flag passed to backend on workout save
- [ ] Default behavior implemented (smart or manual)
- [ ] Backend correctly stores flag in database
- [ ] Users can mark sets as failure or submaximal
- [ ] Tests pass for `to_failure` tracking
- [ ] Verified with multiple workout scenarios

## Work Log

### 2024-11-24 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue discovered during workout logging session
- User noticed no way to indicate set intensity
- Database column exists but UI doesn't expose it
- Categorized as P3 INVESTIGATION (nice-to-have)
- Estimated effort: Small (1 hour investigation, 2-3 hours implementation)

**Learnings:**
- Database schema includes `to_failure` column (defaults to 1)
- Index exists for the column (suggests it was planned for use)
- Related GitHub Issue #5 mentions this feature
- May tie into recovery estimation accuracy

## Notes

**Source:** Triage session on 2024-11-24
**User Question:** "Did we decide to abandon that? Or if we did decide to have it and it's just not there?"
**Priority Rationale:** P3 because core workout logging works, this enhances training accuracy
**Investigation First:** Need to determine if this was intentional omission or incomplete implementation

# Root Cause Analysis - 2025-11-12

## Symptoms Summary
1. No user exists in database (user_id=1 missing)
2. Profile API returns 500: "Cannot read properties of undefined (reading 'name')"
3. Muscle states API returns 500: "no such column: fatigue_percent"
4. Template seeding fails: "FOREIGN KEY constraint failed"
5. Workout builder completely non-functional

## Analysis Process

### Tracing the Cascade
```
Missing User (user_id=1)
    ↓
Profile API fails (no user to read)
    ↓
Template seeding fails (foreign key constraint - needs user_id)
    ↓
Muscle states not initialized (functions assume user_id=1 exists)
    ↓
Detailed muscle states empty (depends on muscle_states)
    ↓
Queries for muscle data fail
    ↓
Workout builder broken (needs muscle state data)
```

### Why No User Exists
- Schema.sql comment: "Removed default user initialization (will be done through onboarding flow)"
- Referenced OpenSpec document doesn't exist in repository
- No onboarding flow was ever implemented
- Result: Gap in initialization sequence

### Why This Wasn't Caught
- Previous database had user data from manual creation or old initialization
- Fresh database creation exposes the gap
- No initialization guard or fallback behavior

## Root Cause

**Primary Cause:** Incomplete refactoring - default user initialization was removed without replacement

**The Refactoring:**
1. Old behavior: User automatically created on database initialization
2. Intent: Move to "onboarding flow" for better UX
3. What happened: Old code removed, new code never implemented
4. Result: Fresh installations completely broken

**Why it causes all symptoms:**
1. No user exists → Profile API fails (TypeError: cannot read 'name' of undefined)
2. No user exists → Template seeding fails (FOREIGN KEY constraint - needs user_id=1)
3. No user exists → Muscle states functions fail (all query for user_id=1)
4. Empty muscle states → detailed_muscle_states never populated
5. Empty tables → Queries fail or return empty results
6. Missing data → Workout builder cannot function

## Dependencies
```
User Record (user_id=1)
    └─> Profile API
    └─> Workout Templates
    └─> Muscle States
        └─> Detailed Muscle States
            └─> Fatigue Calculations
                └─> Workout Builder
                └─> Recovery Dashboard
                └─> Exercise Recommendations
```

## Confidence Level
**HIGH**

**Reasoning:**
- Hypothesis explains ALL observed symptoms
- Logs confirm schema created but seed failed
- Error messages directly trace to missing user
- Schema comments confirm intentional removal
- No alternative explanation fits the evidence

## Alternative Hypotheses Considered

### 1. Schema Corruption
- **Ruled out:** Logs show "Database schema initialized" successfully
- Schema.sql executed without errors

### 2. Docker Volume Issues
- **Ruled out:** Database file was deleted and recreated fresh
- New database created from current schema.sql

### 3. Onboarding Flow Exists But Not Triggered
- **Ruled out:** Diagnosis found no onboarding flow code
- No API endpoint for user creation/registration
- Flow was planned but never implemented

### 4. Migration Timing Issue
- **Ruled out:** No migrations involved - fresh database from schema.sql
- Seed function runs after schema, fails on missing user

## Recommended Fix Strategy

**Option 1: Revert - Add Back Default User** ❌
- Pros: Simple, quick
- Cons: Reverses the refactoring intent
- Verdict: Not recommended

**Option 2: Implement Full Onboarding Flow** ❌
- Pros: Proper fix, matches refactoring intent
- Cons: Out of scope for triage, requires significant work
- Verdict: Future enhancement, not for triage

**Option 3: Defensive Initialization Guard** ✅ RECOMMENDED
- Pros: Respects refactoring intent, makes app resilient, minimal code
- Cons: Still hardcoded user, not true "onboarding"
- Verdict: Best for triage - fixes immediate problem without reverting architecture

**Recommended Approach:**
Add initialization guard that:
1. Checks if user_id=1 exists on database init
2. If not, creates default user with sensible defaults
3. Allows future onboarding flow to replace it
4. Makes app resilient to missing data
5. Documents temporary nature for future work

## Next Phase
Proceed to Phase 3: Solution Planning with Option 3 approach

---
status: ready
priority: p1
issue_id: "002"
tags: [data, infrastructure, exercise-database, muscle-mappings, blocker]
dependencies: []
---

# Exercise Database and Muscle Involvement Mappings May Be Missing

## Problem Statement

For muscle fatigue calculations to work, the system requires an exercise database with muscle involvement mappings. The logged workout contains exercises like "Incline Dumbbell Bench Press", "Push-up", "TRX Pushup", and "TRX Tricep Extension". These exercises must exist in the exercise database with complete muscle involvement data (which muscles are worked and at what percentage).

Without this mapping data, the system cannot convert workout exercises into muscle-specific fatigue values, making the entire muscle tracking system non-functional.

## Findings

- **Workout exercises requiring mappings**:
  - "Incline Dumbbell Bench Press"
  - "Push-up" (showing weight=200, bodyweight)
  - "TRX Pushup" (showing weight=200, bodyweight)
  - "TRX Tricep Extension" (showing weight=0)

- **Unknown status**: Exercise database existence not yet verified
- Location: backend/data/exercises.json (suspected) or backend/database/exercises.ts
- **Blocker**: This is a prerequisite for muscle fatigue calculation to function

**Problem Scenario:**
1. Muscle fatigue calculation function tries to process workout
2. Attempts to lookup "TRX Pushup" in exercise database
3. Exercise not found (database missing or incomplete)
4. System cannot determine which muscles were trained
5. Calculation either fails, crashes, or silently skips exercise
6. Result: Incorrect or completely missing fatigue data

**Required Data for Each Exercise:**
- Exercise name (exact match to logged workout)
- List of muscles involved
- Involvement percentage per muscle (0-100%)
- Role designation (primary, secondary, stabilizer)

## Proposed Solutions

### Option 1: Investigate First, Then Create or Update (Recommended)
- **Pros**:
  - Avoids duplicate work if database exists
  - Can leverage existing structure
  - Understands current state before changes
- **Cons**:
  - Requires investigation phase first
- **Effort**: Variable (1-2 hours if exists, 4-6 hours if needs creation)
- **Risk**: Low - methodical approach

**Steps:**
1. Search codebase for exercise database files
2. Check if exercises.json, exercises.ts, or database table exists
3. If exists: Verify structure and add missing exercises
4. If missing: Create complete exercise database
5. Validate all four exercises from workout ID 60 are included
6. Add graceful error handling for unknown exercises

### Option 2: Create From Scratch Immediately
- **Pros**:
  - Fast start if database truly missing
  - Clean slate design
- **Cons**:
  - May duplicate existing work
  - Could miss existing patterns
- **Effort**: Medium (4-6 hours)
- **Risk**: Medium - may conflict with existing data

## Recommended Action

**Execute Option 1** - Investigate existence first, then create or update as needed

**Required Data Structure Example:**
```typescript
{
  "Incline Dumbbell Bench Press": {
    "equipment": ["dumbbells", "bench"],
    "muscles": [
      { "name": "Pectoralis", "involvement": 80, "role": "primary" },
      { "name": "Deltoids", "involvement": 40, "role": "primary" },
      { "name": "Triceps", "involvement": 50, "role": "primary" }
    ]
  },
  "Push-up": {
    "equipment": ["bodyweight"],
    "bodyweightMultiplier": 0.64,
    "muscles": [
      { "name": "Pectoralis", "involvement": 70, "role": "primary" },
      { "name": "Triceps", "involvement": 50, "role": "primary" },
      { "name": "Deltoids", "involvement": 30, "role": "secondary" }
    ]
  },
  "TRX Pushup": {
    "equipment": ["trx", "bodyweight"],
    "bodyweightMultiplier": 0.70,
    "muscles": [
      { "name": "Pectoralis", "involvement": 75, "role": "primary" },
      { "name": "Triceps", "involvement": 55, "role": "primary" },
      { "name": "Deltoids", "involvement": 35, "role": "secondary" },
      { "name": "Core", "involvement": 20, "role": "stabilizer" }
    ]
  },
  "TRX Tricep Extension": {
    "equipment": ["trx", "bodyweight"],
    "bodyweightMultiplier": 0.50,
    "muscles": [
      { "name": "Triceps", "involvement": 90, "role": "primary" },
      { "name": "Core", "involvement": 20, "role": "stabilizer" }
    ]
  }
}
```

## Technical Details

- **Affected Files**:
  - backend/data/exercises.json (if JSON storage)
  - backend/database/exercises.ts (if TypeScript/code)
  - database/migrations/*_exercises.sql (if database table)
  - backend/services/exercise-lookup.ts (lookup logic)

- **Related Components**:
  - Muscle fatigue calculation function
  - Exercise selection during workout logging
  - Workout recommendations
  - Exercise finder/search

- **Database Changes**:
  - May need to create exercises table if using database storage
  - Schema: exercise_name, muscle_name, involvement_percent, role

## Resources

- Original finding: docs/investigations/muscle-fatigue-investigation-plan.md (Phase 1.3)
- Test data: Workout ID 60 exercises provide validation set
- Related issue: #001 (blocked until this is resolved)

## Acceptance Criteria

- [ ] Exercise database location identified (file or database table)
- [ ] All four exercises from workout ID 60 are present:
  - [ ] "Incline Dumbbell Bench Press"
  - [ ] "Push-up"
  - [ ] "TRX Pushup"
  - [ ] "TRX Tricep Extension"
- [ ] Each exercise has complete muscle involvement data
- [ ] Involvement percentages are realistic (researched/validated)
- [ ] Primary, secondary, and stabilizer muscles designated correctly
- [ ] Bodyweight exercises have appropriate multipliers
- [ ] Exercise lookup function exists and works
- [ ] Graceful error handling for unknown exercises (log warning, don't crash)
- [ ] Documentation of data structure and usage
- [ ] Tests for exercise lookup functionality

## Work Log

### 2025-10-31 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue identified during muscle fatigue investigation triage
- Categorized as P1 CRITICAL (blocks core functionality)
- Estimated effort: Medium (1-6 hours depending on existence)
- Marked as blocker for Issue #001

**Learnings:**
- Workout uses mix of equipment-based and bodyweight exercises
- Bodyweight exercises already calculate loads (weight=200 for push-ups)
- TRX exercises are variants requiring specific mappings
- System needs to handle unknown exercises gracefully
- This is foundational infrastructure for muscle tracking

## Notes

Source: Triage session on 2025-10-31

This is a critical dependency for muscle fatigue integration. The investigation plan (Phase 1.3) includes specific tasks for:
- Finding exercise database location
- Searching for specific exercises
- Verifying muscle involvement mappings
- Checking mapping format and structure

Investigation should be done as part of Phase 1 of Issue #001, but may become its own implementation task if database needs creation.

**Priority consideration**: This could be investigated in parallel with API endpoint tracing (Phase 1.1) to maximize efficiency.

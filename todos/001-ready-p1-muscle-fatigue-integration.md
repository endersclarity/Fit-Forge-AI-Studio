---
status: ready
priority: p1
issue_id: "001"
tags: [bug, missing-implementation, core-feature, muscle-fatigue, integration]
dependencies: []
---

# Muscle Fatigue Calculation Not Integrated with Workout Data

## Problem Statement

The muscle fatigue visualization system is completely disconnected from workout data. Despite having a Push workout logged in the database (ID 60, dated Oct 29, 2025), all muscle states return null for lastTrained and 0% fatigue. This represents a complete failure of FitForge's core value proposition - muscle-aware training.

## Findings

- **Evidence of disconnect**: Workout ID 60 exists in database with 4 exercises (Incline Dumbbell Bench Press, Push-ups, TRX Pushup, TRX Tricep Extension)
- **API returns empty data**: GET /api/muscle-states returns all muscles with currentFatiguePercent: 0, lastTrained: null
- **Frontend is correct**: UI properly displays the zero data it receives from backend
- **Root cause**: Backend muscle state calculation either doesn't exist or isn't connected to workout data
- Location: backend/database/analytics.ts (suspected), API route handlers for /api/muscle-states and /api/muscle-states/detailed
- **User impact**: Cannot trust workout recommendations, core feature non-functional

**Problem Scenario:**
1. User logs Push workout on Oct 29, 2025
2. Workout saves successfully to database (workout ID 60 confirmed)
3. User views muscle fatigue visualization on Oct 31, 2025 (2 days later)
4. API returns all muscles: 0% fatigued, "Never trained"
5. Expected: Pectoralis ~40-60% fatigued, Triceps ~40-60% fatigued, Deltoids ~40-60% fatigued
6. User cannot trust system or make informed training decisions

## Proposed Solutions

### Option 1: Complete Investigation → Design → Implementation Pipeline (Recommended)
- **Pros**:
  - Systematic approach prevents incomplete fixes
  - Documents architecture for future maintenance
  - Identifies exact root cause before coding
  - Phased rollout allows validation at each step
- **Cons**:
  - Longer initial investigation time
  - More planning overhead
- **Effort**: Large (10-18 hours over 1-2 days)
- **Risk**: Low - methodical approach reduces chance of bugs

**Implementation Phases:**
1. **Phase 1: Investigation** (2-4 hours) - Trace API endpoints, examine calculation logic, verify exercise database
2. **Phase 2: Root Cause** (1 hour) - Test hypotheses, confirm missing vs broken
3. **Phase 3: Architecture** (1-2 hours) - Design data flow, define fatigue model
4. **Phase 4: Implementation** (4-8 hours) - Build calculation function, integrate with API
5. **Phase 5: Validation** (1-2 hours) - Test with workout ID 60, verify UI updates

### Option 2: Quick Fix with Basic Integration
- **Pros**:
  - Faster initial result
  - Shows progress quickly
- **Cons**:
  - May miss edge cases
  - Risk of incomplete implementation
  - Harder to maintain without documentation
- **Effort**: Medium (4-6 hours)
- **Risk**: Medium - may require rework

## Recommended Action

**Execute Option 1** - Follow the complete investigation plan documented in `docs/investigations/muscle-fatigue-investigation-plan.md`

**Rationale:**
- This is P0 critical affecting core value proposition
- Workout ID 60 provides perfect test case for validation
- Systematic approach prevents introducing new bugs
- Foundation for future features (historical tracking, progressive overload)
- User has already noticed the issue and is waiting for fix

## Technical Details

- **Affected Files**:
  - backend/database/analytics.ts (muscle state calculation)
  - backend/src/routes/*.ts (API endpoint handlers)
  - backend/data/exercises.json (exercise-to-muscle mappings, if exists)
  - Database: workouts table, potential muscle_states table

- **Related Components**:
  - Muscle Recovery Status visualization
  - Muscle Heat Map
  - Workout Recommendations
  - Historical tracking
  - Exercise database and muscle involvement mappings

- **Database Changes**:
  - No schema changes expected
  - Will read from existing workouts table
  - May need to verify exercise database structure

## Resources

- Original finding: docs/investigations/muscle-fatigue-disconnection.md
- Investigation plan: docs/investigations/muscle-fatigue-investigation-plan.md
- Test case: Workout ID 60 (2025-10-29, Push workout)
- Chrome DevTools verification: Confirmed via network request inspection

## Acceptance Criteria

- [ ] Workout ID 60 shows Pectoralis currentFatiguePercent > 0
- [ ] Workout ID 60 shows Triceps currentFatiguePercent > 0
- [ ] Workout ID 60 shows Deltoids currentFatiguePercent > 0
- [ ] lastTrained = "2025-10-29T00:00:00.000Z" for push muscles
- [ ] daysElapsed = actual days since workout (2 on Oct 31)
- [ ] currentFatiguePercent decreases over time (recovery curve works)
- [ ] UI muscle visualization displays colored muscles (not all gray)
- [ ] Muscle heat map shows correct recovery status
- [ ] Workout recommendations consider fatigued muscles
- [ ] Multiple workouts aggregate correctly
- [ ] Bodyweight exercise volumes calculate correctly
- [ ] Unknown exercises handled gracefully (log warning, don't crash)
- [ ] API response time < 500ms
- [ ] Tests pass
- [ ] Code reviewed

## Work Log

### 2025-10-31 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue discovered during Chrome DevTools investigation and systematic analysis
- Verified workout data exists but muscle states show all nulls/zeros
- Confirmed frontend correctly displays backend data (issue is backend)
- Categorized as P1 CRITICAL
- Estimated effort: Large (10-18 hours)
- Created comprehensive investigation plan with 6 phases

**Learnings:**
- Recent commits show bodyweight workout logging was added (fix: 8d029b0)
- Muscle fatigue integration was never connected to new workout system
- Perfect test case available: workout ID 60 from Oct 29
- User explicitly mentioned "trying to get it connected" - confirms ongoing work
- This is foundational for all muscle-aware features

## Notes

Source: Triage session on 2025-10-31

Investigation plan provides complete roadmap with:
- 4 hypothesis scenarios (most likely: integration never implemented)
- Detailed investigation tasks for each phase
- Architecture design with fatigue model formula
- Phased rollout strategy (MVP → Complete → Polish)
- Risk mitigation and rollback plan
- Success metrics and monitoring strategy

Next step: Begin Phase 1 investigation immediately

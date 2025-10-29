# Tasks: Implement Dual-Layer Muscle Tracking

## Overview

**Change ID:** `2025-10-29-implement-dual-layer-muscle-tracking`
**Total Estimated Effort:** 16-24 hours
**Phases:** 4
**Dependencies:** EMG research data (`docs/emg-research-reference.md`)

---

## Phase 1: Foundation & Schema (4-6 hours)

### Task 1.1: Add DetailedMuscle enum
**Estimated:** 1 hour
**File:** `types.ts`

- [ ] Add `DetailedMuscle` enum with 42 muscles
- [ ] Organize by anatomical groups (chest, shoulders, rotator cuff, etc.)
- [ ] Add JSDoc comments with anatomical notes
- [ ] Export enum from types module

**Validation:** TypeScript compiles without errors

---

### Task 1.2: Create detailed_muscle_states table
**Estimated:** 1.5 hours
**Files:** `backend/database/schema.sql`, `backend/database/migrations/`

- [ ] Add CREATE TABLE statement for `detailed_muscle_states`
- [ ] Include all columns: id, user_id, detailed_muscle_name, visualization_muscle_name, role, fatigue_percent, volume_today, last_trained, baseline_capacity, baseline_source, baseline_confidence
- [ ] Add CHECK constraints for role and confidence enums
- [ ] Add foreign key to muscle_baselines
- [ ] Create indexes on user_id, visualization_muscle_name, role
- [ ] Write migration script for existing databases

**Validation:**
- Migration runs successfully
- Indexes created
- Foreign keys enforce referential integrity

---

### Task 1.3: Implement mapping functions
**Estimated:** 1.5 hours
**File:** `backend/database/mappings.ts` (new)

- [ ] Create `DETAILED_TO_VIZ_MAP` constant mapping all 42 detailed muscles to 13 viz muscles
- [ ] Write `getVisualizationMuscle(detailed: DetailedMuscle): VisualizationMuscle` function
- [ ] Write `getDetailedMuscles(viz: VisualizationMuscle): DetailedMuscle[]` function
- [ ] Write `determineRole(detailed: DetailedMuscle): 'primary' | 'secondary' | 'stabilizer'` helper
- [ ] Add unit tests for mapping completeness

**Validation:**
- All 42 detailed muscles map to exactly one viz muscle
- Reverse mapping returns correct sets
- Tests pass

---

### Task 1.4: Initialize detailed baselines
**Estimated:** 2 hours
**Files:** `backend/database/database.ts`, `scripts/initialize-detailed-muscles.ts`

- [ ] Write `initializeDetailedMuscleStates(userId: number)` function
- [ ] For each viz muscle baseline, create detailed muscle records
- [ ] Inherit full baseline capacity conservatively
- [ ] Set `baseline_source = 'inherited'` and `baseline_confidence = 'low'`
- [ ] Create migration script for existing users
- [ ] Add transaction handling

**Validation:**
- Existing user gets 42 detailed muscle records
- All inherit correct baseline from parent group
- No data loss on existing muscle_baselines

---

## Phase 2: Data Population (4-6 hours)

### Task 2.1: Add detailedMuscleEngagements type
**Estimated:** 30 min
**Files:** `types.ts`, `constants.ts`

- [ ] Add `DetailedMuscleEngagement` interface
- [ ] Add optional `detailedMuscleEngagements` field to `Exercise` interface
- [ ] Update Exercise type exports

**Validation:** TypeScript compiles, no breaking changes

---

### Task 2.2: Populate Push exercises with detailed data
**Estimated:** 2 hours
**File:** `constants.ts`

- [ ] Update all 12 Push exercises with `detailedMuscleEngagements`
- [ ] Reference EMG research for percentages
- [ ] Categorize each muscle as primary/secondary/stabilizer
- [ ] Add citation comments where available
- [ ] Examples: Push-up, Dumbbell Bench Press, Shoulder Press, TRX Pushup, Dips

**Validation:**
- All Push exercises have detailed engagements
- Percentages match EMG research document
- Roles correctly assigned

---

### Task 2.3: Populate Pull exercises with detailed data
**Estimated:** 2 hours
**File:** `constants.ts`

- [ ] Update all 15 Pull exercises with detailed data
- [ ] Include rotator cuff muscles where appropriate
- [ ] Examples: Pull-ups (all variations), Rows, Bicep Curls, Face Pulls
- [ ] Validate against research

**Validation:** All Pull exercises updated

---

### Task 2.4: Populate Legs and Core exercises
**Estimated:** 1.5 hours
**File:** `constants.ts`

- [ ] Update all 10 Legs exercises
- [ ] Update all 5 Core exercises
- [ ] Include glute subdivisions, hamstring heads, quad components
- [ ] Add core stabilizers (obliques, erector spinae)

**Validation:** All 40 exercises have complete detailed muscle data

---

## Phase 3: Smart Recommendations (4-6 hours)

### Task 3.1: Refactor recommendation scoring
**Estimated:** 2.5 hours
**File:** `backend/database/recommendations.ts`

- [ ] Update `calculateOpportunityScore()` to use detailed muscles
- [ ] Weight fatigue by engagement percentage and role
- [ ] Detect limiting factors at detailed muscle level
- [ ] Maintain backward compatibility for exercises without detailed data

**Validation:**
- Recommendations use detailed data when available
- Legacy exercises still work
- Unit tests pass

---

### Task 3.2: Generate detailed explanations
**Estimated:** 1.5 hours
**File:** `backend/database/recommendations.ts`

- [ ] Implement `generateDetailedReason()` function
- [ ] List fresh muscles when score is high
- [ ] List limiting factors when score is low
- [ ] Format for readability ("Targets fresh: Posterior Deltoid")

**Validation:**
- Explanations mention specific detailed muscles
- Reasons are actionable and clear

---

### Task 3.3: Add aggregation for visualization
**Estimated:** 2 hours
**File:** `backend/database/database.ts`

- [ ] Implement `calculateVisualizationFatigue()` function
- [ ] Filter to primary/secondary movers only
- [ ] Calculate weighted average
- [ ] Fallback to viz muscle if no detailed data

**Validation:**
- Dashboard shows correct aggregated percentages
- Stabilizers excluded from display
- Performance acceptable (<5% regression)

---

## Phase 4: Advanced UI Toggle (4-6 hours)

### Task 4.1: Add settings toggle
**Estimated:** 1.5 hours
**Files:** `components/Settings.tsx`, `types.ts`

- [ ] Add `muscleDetailLevel: 'simple' | 'detailed'` to UserSettings
- [ ] Create radio button group in Settings UI
- [ ] Add help text explaining each option
- [ ] Persist to localStorage
- [ ] Default to 'simple'

**Validation:**
- Setting persists across page reloads
- Toggle works in Settings screen

---

### Task 4.2: Create DetailedMuscleCard component
**Estimated:** 2.5 hours
**File:** `components/DetailedMuscleCard.tsx` (new)

- [ ] Accept `muscle` and `detailedView` props
- [ ] Fetch detailed muscle states from API
- [ ] Group by role (primary, secondary, stabilizer)
- [ ] Show aggregate at top
- [ ] List primary movers with bars
- [ ] List secondary movers
- [ ] Collapsible stabilizers section
- [ ] Style consistently with existing cards

**Validation:**
- Component renders correctly
- Shows breakdown when detailedView=true
- Matches design mockup

---

### Task 4.3: Integrate toggle in Dashboard
**Estimated:** 1 hour
**File:** `components/Dashboard.tsx`

- [ ] Read `muscleDetailLevel` from settings
- [ ] Conditionally render SimpleMuscleCard vs DetailedMuscleCard
- [ ] Pass setting through component tree
- [ ] Ensure smooth transition between views

**Validation:**
- Simple view unchanged from current
- Detailed view shows breakdowns
- Toggle works without page refresh

---

### Task 4.4: Add API endpoint for detailed muscles
**Estimated:** 1 hour
**Files:** `backend/server.ts`, `backend/database/database.ts`

- [ ] Add GET `/api/muscle-states/detailed` endpoint
- [ ] Return all 42 detailed muscle states
- [ ] Include role, fatigue, baseline
- [ ] Cache for performance

**Validation:**
- Endpoint returns correct data structure
- Performance acceptable
- Frontend can consume data

---

## Phase 5: Testing & Validation (2-4 hours)

### Task 5.1: Performance benchmarking
**Estimated:** 1 hour

- [ ] Measure dashboard load time before implementation
- [ ] Measure dashboard load time after implementation
- [ ] Verify <5% regression requirement
- [ ] Profile slow queries if needed
- [ ] Add indexes if performance degrades

**Validation:** Dashboard loads within acceptable time

---

### Task 5.2: Data validation script
**Estimated:** 1 hour
**File:** `scripts/validate-detailed-muscles.ts`

- [ ] Verify all 42 detailed muscles have records
- [ ] Check all 40 exercises have detailed engagements
- [ ] Validate role assignments
- [ ] Confirm mappings are complete

**Validation:** Script passes all checks

---

### Task 5.3: User testing
**Estimated:** 1-2 hours

- [ ] Test with existing user data
- [ ] Verify recommendations improve
- [ ] Test advanced view toggle
- [ ] Collect feedback from power users
- [ ] Document any issues

**Validation:** No critical bugs, recommendations feel "smarter"

---

### Task 5.4: Documentation
**Estimated:** 1 hour

- [ ] Update CHANGELOG.md
- [ ] Add section to ARCHITECTURE.md explaining dual-layer system
- [ ] Document new API endpoint
- [ ] Add comments in code for complex logic

**Validation:** Documentation complete and accurate

---

## Parallelizable Work

These tasks can be done concurrently:

- **Phase 2 (Data Population):** All four sub-tasks can run in parallel (different exercise categories)
- **Phase 3.1 & 3.2:** Recommendation scoring and explanation generation
- **Phase 4.1 & 4.2:** Settings toggle and detailed card component

---

## Critical Path

```
1.1 → 1.2 → 1.3 → 1.4 (Foundation must complete first)
       ↓
    2.1 → 2.2-2.4 (Data population)
       ↓
    3.1 → 3.2 → 3.3 (Recommendations)
       ↓
    4.1 → 4.2 → 4.3 → 4.4 (UI)
       ↓
    5.1 → 5.2 → 5.3 → 5.4 (Testing)
```

---

## Risk Mitigation

**Risk:** Performance degradation
**Mitigation:** Benchmark early (Task 5.1), add indexes proactively

**Risk:** Data migration failures
**Mitigation:** Write reversible migrations, test on copy of production DB

**Risk:** UI complexity overwhelming users
**Mitigation:** Default to simple view, clear help text, optional advanced mode

---

## Completion Checklist

- [ ] All 42 detailed muscles tracked in database
- [ ] All 40 exercises have detailed muscle engagements
- [ ] Recommendations use detailed data
- [ ] Advanced view toggle works
- [ ] Performance within 5% of baseline
- [ ] No breaking changes to existing features
- [ ] Documentation updated
- [ ] User testing complete

---

*Total: 20 tasks across 5 phases*
*Estimated: 16-24 hours*

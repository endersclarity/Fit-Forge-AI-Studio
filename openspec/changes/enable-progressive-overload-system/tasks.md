# Tasks: Enable Progressive Overload System

**Change ID:** `enable-progressive-overload-system`
**Estimated Time:** 11-15 hours (1.5-2 days)
**Status:** Not Started

---

## Phase 1: Backend Progressive Calculation (3-4 hours)

### Task 1.1: Implement Last Performance Query

**File:** `backend/database/database.ts`
**Location:** After `learnMuscleBaselinesFromWorkout()` function
**Time:** 1 hour

**Steps:**
1. Create `getLastPerformanceForExercise(exerciseName: string)` function
2. Query most recent workout containing exercise
3. Return first set data (weight, reps, date)
4. Handle no history case (return null)
5. Test with existing workout data

**Validation:**
- [ ] Function returns most recent performance
- [ ] Returns null when no history
- [ ] Uses first set (not highest volume set)
- [ ] Query performance <10ms

**Files Modified:**
- `backend/database/database.ts` (~30 lines added)

---

### Task 1.2: Implement Progressive Calculation Function

**File:** `backend/database/database.ts`
**Location:** After Task 1.1 function
**Time:** 1.5 hours

**Steps:**
1. Create `getProgressiveSuggestions(exerciseName: string)` function
2. Call `getLastPerformanceForExercise()` and `getPreviousPerformanceForExercise()`
3. Calculate +3% weight (round to nearest integer)
4. Calculate +3% reps (round up with Math.ceil)
5. Detect last method used (weight/reps/none)
6. Determine recommended method (alternating logic)
7. Calculate days ago from last performance
8. Return complete ProgressiveSuggestion object

**Validation:**
- [ ] +3% weight calculated correctly
- [ ] +3% reps calculated correctly (rounds up)
- [ ] Method detection works (weight vs reps)
- [ ] Alternating recommendation logic correct
- [ ] Returns null when no history

**Files Modified:**
- `backend/database/database.ts` (~60 lines added)

---

### Task 1.3: Create API Endpoint

**File:** `backend/server.ts`
**Location:** After existing /api/workouts endpoints
**Time:** 30 minutes

**Steps:**
1. Add GET endpoint: `/api/progressive-suggestions`
2. Accept query param: `exercise` (exercise name)
3. Call `getProgressiveSuggestions(exerciseName)`
4. Return JSON response or 404 if no history
5. Add error handling

**Validation:**
- [ ] Endpoint returns correct JSON structure
- [ ] Returns 404 when no history
- [ ] Error handling works
- [ ] CORS configured correctly

**Files Modified:**
- `backend/server.ts` (~20 lines added)

---

### Task 1.4: Update TypeScript Types

**File:** `backend/types.ts`
**Location:** After WorkoutResponse interface
**Time:** 15 minutes

**Steps:**
1. Define `ProgressiveOption` interface
2. Define `ProgressiveSuggestion` interface
3. Export types

**Validation:**
- [ ] No TypeScript errors
- [ ] Types match API response structure
- [ ] Autocomplete works

**Files Modified:**
- `backend/types.ts` (~25 lines added)

---

## Phase 2: Variation Tracking (1-1.5 hours)

### Task 2.1: Implement Variation Query

**File:** `backend/database/database.ts`
**Time:** 30 minutes

**Steps:**
1. Create `getLastVariationForCategory(category: string)` function
2. Query most recent workout in category
3. Return variation and date
4. Handle no history case

**Validation:**
- [ ] Returns last variation correctly
- [ ] Returns null when no history in category
- [ ] Query performance acceptable

**Files Modified:**
- `backend/database/database.ts` (~20 lines added)

---

### Task 2.2: Create Variation API Endpoint

**File:** `backend/server.ts`
**Time:** 30 minutes

**Steps:**
1. Add GET endpoint: `/api/last-workout`
2. Accept query param: `category`
3. Call `getLastVariationForCategory()`
4. Calculate suggested variation (opposite)
5. Return JSON response

**Validation:**
- [ ] Returns last variation and suggested
- [ ] Handles no history gracefully
- [ ] Error handling works

**Files Modified:**
- `backend/server.ts` (~15 lines added)

---

### Task 2.3: Update Workout Save to Include Variation

**File:** `backend/database/database.ts`
**Time:** 15 minutes

**Steps:**
1. Verify `saveWorkout()` includes variation in INSERT
2. Ensure variation field is saved correctly
3. Test with template-based workouts

**Validation:**
- [ ] Variation saved with workout
- [ ] Can query variation later

**Files Modified:**
- `backend/database/database.ts` (verification only, no changes needed)

---

## Phase 3: Two-Button UI Component (4-5 hours)

### Task 3.1: Create ProgressiveSuggestionButtons Component

**File:** `components/ProgressiveSuggestionButtons.tsx` (new)
**Time:** 2 hours

**Steps:**
1. Create functional component with props interface
2. Fetch progressive suggestions via API
3. Display last performance context
4. Render +WEIGHT and +REPS buttons
5. Highlight recommended option
6. Handle button clicks (call onSelect callback)
7. Show "No history" message when applicable
8. Add loading and error states
9. Style with existing brand colors

**Validation:**
- [ ] Component renders correctly
- [ ] API call works
- [ ] Both buttons tappable
- [ ] Recommended option highlighted
- [ ] No history case handled
- [ ] Loading state displays
- [ ] Mobile responsive

**Files Created:**
- `components/ProgressiveSuggestionButtons.tsx` (~120 lines)

---

### Task 3.2: Integrate into Workout Tracker

**File:** `components/Workout.tsx`
**Time:** 1.5 hours

**Steps:**
1. Import ProgressiveSuggestionButtons component
2. Add component above weight/reps inputs for each exercise
3. Handle onSelect callback (auto-fill weight/reps fields)
4. Ensure manual entry still works
5. Test with multiple sets per exercise
6. Handle edge cases (no history, first set, subsequent sets)

**Validation:**
- [ ] Buttons appear for each exercise
- [ ] Button tap auto-fills fields
- [ ] Manual entry still functional
- [ ] Multiple sets work correctly
- [ ] No breaking changes

**Files Modified:**
- `components/Workout.tsx` (~40 lines added)

---

### Task 3.3: Add Variation Context to Workout Start

**File:** `components/Dashboard.tsx` or `App.tsx`
**Time:** 1 hour

**Steps:**
1. Fetch last variation when user starts workout
2. Display "Last time: Push A → Today: Push B" context
3. Allow user to override suggested variation
4. Pass selected variation to workout save

**Validation:**
- [ ] Variation context displays correctly
- [ ] User can override suggestion
- [ ] Variation saved with workout

**Files Modified:**
- `components/Dashboard.tsx` (~30 lines)
- OR `App.tsx` (depending on where "Start Workout" lives)

---

### Task 3.4: Update Frontend Types

**File:** `types.ts`
**Time:** 15 minutes

**Steps:**
1. Copy ProgressiveOption interface from backend
2. Copy ProgressiveSuggestion interface from backend
3. Ensure type compatibility

**Validation:**
- [ ] No TypeScript errors
- [ ] Types match backend

**Files Modified:**
- `types.ts` (~25 lines added)

---

## Phase 4: Testing & Polish (2-3 hours)

### Task 4.1: Backend Unit Tests

**File:** `backend/database/database.test.ts` (new or existing)
**Time:** 1 hour

**Tests to Write:**
1. +3% weight calculation
2. +3% reps calculation (rounds up)
3. Method detection (weight increase)
4. Method detection (reps increase)
5. Method detection (both/neither)
6. Alternating recommendation
7. Edge cases (bodyweight, low reps, high reps)
8. No history returns null

**Validation:**
- [ ] All tests pass
- [ ] Edge cases covered
- [ ] Coverage >80%

**Files Created/Modified:**
- `backend/database/database.test.ts` (~100 lines)

---

### Task 4.2: End-to-End Workflow Testing

**Manual Test Plan**
**Time:** 1 hour

**Test Scenarios:**
1. **First time exercise**
   - No history → shows "No history" message
   - User enters baseline manually
   - Next time → shows suggestions

2. **Progressive suggestions displayed**
   - Last performance shown correctly
   - Both buttons render
   - Recommended option highlighted
   - Days ago calculated correctly

3. **Button tap auto-fills**
   - Tap +WEIGHT → fields populate
   - Tap +REPS → fields populate
   - Values are correct (+3%)

4. **Manual override**
   - User types custom values
   - System accepts and saves
   - Next time adapts to new baseline

5. **Variation intelligence**
   - Last Push A → suggests Push B
   - User can override
   - Variation saved with workout

6. **Multiple sets**
   - First set uses suggestion
   - Subsequent sets can repeat or adjust
   - All sets logged correctly

**Validation:**
- [ ] All scenarios pass
- [ ] No bugs found
- [ ] UX smooth and intuitive

---

### Task 4.3: Responsive & Accessibility Testing

**Time:** 30 minutes

**Tests:**
1. Desktop layout (buttons side-by-side)
2. Mobile layout (responsive)
3. Touch targets ≥44px on mobile
4. Keyboard navigation works
5. Screen reader announces recommendations
6. Color contrast meets WCAG standards

**Validation:**
- [ ] Works on desktop
- [ ] Works on mobile (iOS/Android)
- [ ] Accessible via keyboard
- [ ] Screen reader friendly

---

### Task 4.4: Performance Testing

**Time:** 30 minutes

**Tests:**
1. API response time for suggestions (<50ms)
2. UI render time (<100ms)
3. No performance degradation on workout save
4. Multiple exercises load quickly

**Acceptance Criteria:**
- [ ] API responds <50ms
- [ ] UI renders <100ms
- [ ] No noticeable slowdown

---

## Task Dependencies

```
Phase 1 (Backend Calculation)
├─ 1.1 Last Performance Query [blocks: 1.2]
├─ 1.2 Progressive Calculation [depends: 1.1] [blocks: 1.3, 3.1]
├─ 1.3 API Endpoint [depends: 1.2]
└─ 1.4 TypeScript Types [parallel with: 1.1, 1.2]

Phase 2 (Variation Tracking)
├─ 2.1 Variation Query [blocks: 2.2]
├─ 2.2 API Endpoint [depends: 2.1] [blocks: 3.3]
└─ 2.3 Verify Workout Save [parallel with: 2.1, 2.2]

Phase 3 (UI)
├─ 3.1 Buttons Component [depends: 1.2, 1.3] [blocks: 3.2]
├─ 3.2 Integrate into Workout [depends: 3.1]
├─ 3.3 Variation Context [depends: 2.2]
└─ 3.4 Frontend Types [parallel with: 3.1]

Phase 4 (Testing)
├─ 4.1 Backend Tests [depends: Phase 1]
├─ 4.2 E2E Testing [depends: Phase 3]
├─ 4.3 Accessibility [depends: 3.2]
└─ 4.4 Performance [depends: 1.3, 3.2]
```

---

## Parallel Work Opportunities

**Backend & Types Can Work in Parallel:**
- Tasks 1.1, 1.2, 1.4 can be developed simultaneously
- Tasks 2.1, 2.2, 2.3 can run in parallel

**Within UI Phase:**
- Task 3.4 (Frontend Types) can run parallel with 3.1 (Component creation)

---

## Definition of Done

**For Each Task:**
- [ ] Code written and compiles
- [ ] TypeScript errors resolved
- [ ] Manual testing completed
- [ ] Committed with clear message

**For Each Phase:**
- [ ] All phase tasks completed
- [ ] Integration tested
- [ ] No blockers for next phase

**For Full Change:**
- [ ] All tasks completed
- [ ] All tests passing (unit + E2E)
- [ ] No regressions detected
- [ ] Performance acceptable
- [ ] Responsive on mobile
- [ ] Accessible
- [ ] Ready for production deployment

---

## Rollback Plan

**If Issues Arise Post-Deployment:**

1. **Quick Disable (< 10 minutes):**
   - Add environment variable: `ENABLE_PROGRESSIVE_SUGGESTIONS=false`
   - Redeploy
   - UI reverts to manual entry only

2. **Partial Rollback:**
   - Keep backend, remove UI buttons
   - Or keep UI, fix backend bugs independently

3. **Full Rollback:**
   - Revert commits for all phases
   - No database changes to undo (feature is additive)
   - No data loss

---

## Progress Tracking

**Phase 1: Backend Progressive Calculation**
- [ ] Task 1.1 (1h)
- [ ] Task 1.2 (1.5h)
- [ ] Task 1.3 (30m)
- [ ] Task 1.4 (15m)

**Phase 2: Variation Tracking**
- [ ] Task 2.1 (30m)
- [ ] Task 2.2 (30m)
- [ ] Task 2.3 (15m)

**Phase 3: Two-Button UI**
- [ ] Task 3.1 (2h)
- [ ] Task 3.2 (1.5h)
- [ ] Task 3.3 (1h)
- [ ] Task 3.4 (15m)

**Phase 4: Testing & Polish**
- [ ] Task 4.1 (1h)
- [ ] Task 4.2 (1h)
- [ ] Task 4.3 (30m)
- [ ] Task 4.4 (30m)

**Total:** 11-15 hours estimated

---

## Notes

- Backend changes are backward compatible (no breaking changes)
- Frontend changes are additive (manual entry preserved)
- No database migrations required (uses existing schema)
- Can be deployed incrementally (backend first, then UI)
- Feature can be feature-flagged if needed

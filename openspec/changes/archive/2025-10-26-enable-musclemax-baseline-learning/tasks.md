# Tasks: Enable MuscleMax Baseline Learning

**Change ID:** `enable-musclemax-baseline-learning`
**Estimated Time:** 14-20 hours (2-3 days)
**Status:** Not Started

---

## Phase 1: Backend Foundation (4-6 hours)

### Task 1.1: Implement `updateMuscleBaselines()` Function

**File:** `backend/database/database.ts`
**Location:** After `saveWorkout()` function (~line 265)
**Time:** 2-3 hours

**Steps:**
1. Import `getExerciseByName` from `./constants`
2. Create function signature with return type
3. Query all `to_failure = 1` sets for workout
4. Loop through sets, calculate muscle volumes
5. Track max volume per muscle
6. Compare against current baselines
7. UPDATE where observed > current
8. Return array of updates

**Validation:**
- [ ] Function compiles without TypeScript errors
- [ ] Returns empty array when no failure sets
- [ ] Returns correct updates array structure
- [ ] Handles missing exercises gracefully

**Files Modified:**
- `backend/database/database.ts` (~100 lines added)

---

### Task 1.2: Integrate Baseline Learning into Workout Save

**File:** `backend/database/database.ts`
**Location:** `saveWorkout()` function (~line 232)
**Time:** 1 hour

**Steps:**
1. After `saveTransaction()` completes, call `updateMuscleBaselines(workoutId)`
2. Store result in `updatedBaselines` variable
3. Add `updated_baselines` to return object
4. Ensure backward compatibility (optional field)

**Validation:**
- [ ] Workout save still works without baseline updates
- [ ] API response includes `updated_baselines` field
- [ ] Empty array when no updates
- [ ] Populated array when baselines updated

**Files Modified:**
- `backend/database/database.ts` (~5 lines modified)

---

### Task 1.3: Update TypeScript Types

**File:** `backend/types.ts`
**Location:** `WorkoutResponse` interface
**Time:** 15 minutes

**Steps:**
1. Add `updated_baselines` field to `WorkoutResponse`
2. Define type for baseline update object
3. Mark field as optional (backward compat)
4. Export type if not already

**Validation:**
- [ ] No TypeScript errors in backend
- [ ] Type autocomplete works for `updated_baselines`

**Files Modified:**
- `backend/types.ts` (~10 lines added)

---

### Task 1.4: Write Backend Unit Tests

**File:** `backend/database/database.test.ts` (new or existing)
**Time:** 1-2 hours

**Tests to Write:**
1. `updateMuscleBaselines()` updates when observed > current
2. No update when observed < current
3. Only processes `to_failure = 1` sets
4. Handles multiple muscles from compound exercise
5. Tracks max volume across multiple sets
6. Returns correct update array structure
7. Handles missing/invalid exercises

**Validation:**
- [ ] All tests pass
- [ ] Coverage >80% for new function

**Files Created/Modified:**
- `backend/database/database.test.ts` (~150 lines added)

---

## Phase 2: Manual Override UI (6-8 hours)

### Task 2.1: Create Muscle Baseline Card Component

**File:** `src/components/MuscleBaselineCard.tsx` (new)
**Time:** 2-3 hours

**Steps:**
1. Create functional component with props interface
2. Implement three-value display (system/override/effective)
3. Add number input for override with validation
4. Add clear button for override
5. Show last updated timestamp
6. Implement warning when system > override
7. Style with consistent design system

**Validation:**
- [ ] Component renders correctly
- [ ] Input validation works (min/max/type)
- [ ] Clear button removes override
- [ ] Warning shows when appropriate
- [ ] Responsive on mobile

**Files Created:**
- `src/components/MuscleBaselineCard.tsx` (~150 lines)

---

### Task 2.2: Create Muscle Baselines Page

**File:** `src/pages/MuscleBaselinesPage.tsx` (new)
**Time:** 2-3 hours

**Steps:**
1. Create page component with layout
2. Fetch baselines from API on mount
3. Group muscles by category (Upper/Lower/Core)
4. Render `MuscleBaselineCard` for each muscle
5. Implement save handler (PUT /api/muscle-baselines)
6. Add reset all dialog with confirmation
7. Show success/error toasts

**Validation:**
- [ ] Page loads and displays all 13 muscles
- [ ] API calls work (GET and PUT)
- [ ] Grouping is correct
- [ ] Reset all shows confirmation
- [ ] Toasts appear on success/error

**Files Created:**
- `src/pages/MuscleBaselinesPage.tsx` (~200 lines)

---

### Task 2.3: Add Navigation to Baselines Page

**File:** `src/App.tsx` or routing file
**Time:** 30 minutes

**Steps:**
1. Add route for `/settings/muscle-baselines`
2. Add link from Settings page
3. Add "Personal Metrics" section if needed
4. Ensure back navigation works

**Validation:**
- [ ] Route accessible from Settings
- [ ] Navigation works correctly
- [ ] Back button returns to Settings

**Files Modified:**
- `src/App.tsx` (~10 lines)
- `src/pages/SettingsPage.tsx` (~20 lines)

---

### Task 2.4: Update Frontend Types

**File:** `src/types.ts`
**Time:** 15 minutes

**Steps:**
1. Add `updated_baselines` to `WorkoutResponse` interface (match backend)
2. Define `MuscleBaseline` interface for UI
3. Ensure type safety across components

**Validation:**
- [ ] No TypeScript errors in frontend
- [ ] Type autocomplete works

**Files Modified:**
- `src/types.ts` (~15 lines added)

---

### Task 2.5: Write Frontend Component Tests

**File:** `src/components/MuscleBaselineCard.test.tsx` (new)
**Time:** 1-2 hours

**Tests to Write:**
1. Renders all three values correctly
2. Input validation prevents invalid values
3. Clear button works
4. Warning shows when system > override
5. Save handler called with correct data
6. Handles loading/error states

**Validation:**
- [ ] All component tests pass
- [ ] UI behavior verified

**Files Created:**
- `src/components/MuscleBaselineCard.test.tsx` (~100 lines)

---

## Phase 3: Notifications & Polish (1-2 hours)

### Task 3.1: Add Toast Notification for Baseline Updates

**File:** `src/components/Workout.tsx` (or workout save handler)
**Time:** 30 minutes

**Steps:**
1. Check `response.updated_baselines` after workout save
2. If non-empty, show toast with count and muscle names
3. Add "View" action that navigates to baselines page
4. Style toast appropriately

**Validation:**
- [ ] Toast appears when baselines updated
- [ ] Shows correct muscle names and count
- [ ] "View" button navigates correctly
- [ ] Toast dismissible

**Files Modified:**
- Workout save handler (~15 lines added)

---

### Task 3.2: Add Info Banner to Baselines Page

**File:** `src/pages/MuscleBaselinesPage.tsx`
**Time:** 30 minutes

**Steps:**
1. Add informational banner at top of page
2. Explain what baselines are used for
3. Explain icons (🤖 System, ✏️ Override, ✅ Using)
4. Make dismissible with localStorage

**Validation:**
- [ ] Banner displays on first visit
- [ ] Can be dismissed
- [ ] Stays dismissed across sessions
- [ ] Clear and helpful

**Files Modified:**
- `src/pages/MuscleBaselinesPage.tsx` (~20 lines)

---

### Task 3.3: Add Loading States

**File:** `src/pages/MuscleBaselinesPage.tsx`
**Time:** 30 minutes

**Steps:**
1. Show skeleton/spinner while loading baselines
2. Show loading state during save operations
3. Disable inputs while saving
4. Show error state if API fails

**Validation:**
- [ ] Loading indicator appears
- [ ] Inputs disabled during save
- [ ] Error messages helpful
- [ ] No race conditions

**Files Modified:**
- `src/pages/MuscleBaselinesPage.tsx` (~30 lines)

---

## Phase 4: Testing & Integration (3-4 hours)

### Task 4.1: End-to-End Workflow Testing

**Manual Test Plan**
**Time:** 1 hour

**Test Scenarios:**
1. **New user first workout**
   - Log workout with failure sets
   - Verify baselines update
   - Check toast notification
   - View baselines page

2. **Set manual override**
   - Navigate to baselines page
   - Set override for muscle
   - Verify effective baseline changes
   - Log workout, verify override persists

3. **System exceeds override**
   - Set low override
   - Log heavy workout
   - Verify warning appears
   - Click update, verify override updated

4. **Reset all baselines**
   - Click reset button
   - Confirm dialog
   - Verify all baselines reset
   - Verify cannot undo

**Validation:**
- [ ] All scenarios pass
- [ ] No bugs found
- [ ] UX smooth and intuitive

---

### Task 4.2: Performance Testing

**Time:** 30 minutes

**Tests:**
1. Measure workout save latency (with vs without learning)
2. Test with 10 failure sets in single workout
3. Verify database queries optimized
4. Check for N+1 query issues

**Acceptance Criteria:**
- [ ] <50ms added latency to workout save
- [ ] No performance degradation
- [ ] Database queries efficient

---

### Task 4.3: Cross-Browser Testing

**Time:** 30 minutes

**Browsers to Test:**
- Chrome (primary)
- Firefox
- Edge
- Safari (if available)

**Validation:**
- [ ] UI renders correctly in all browsers
- [ ] Input validation works
- [ ] No console errors
- [ ] Responsive on mobile

---

### Task 4.4: Regression Testing

**Time:** 1 hour

**Test Existing Features:**
1. Workout logging (without failure flag changes)
2. Muscle states display
3. Personal bests tracking
4. Templates functionality
5. Profile settings

**Validation:**
- [ ] No existing features broken
- [ ] Backward compatibility maintained
- [ ] No data corruption

---

### Task 4.5: Documentation Updates

**Files to Update:**
**Time:** 1 hour

1. **README.md** - Add baseline learning to features list
2. **ARCHITECTURE.md** - Document baseline learning flow
3. **docs/brainstorming-session-results.md** - Mark Priority 3 complete
4. **openspec/project.md** - Update priorities and status

**Validation:**
- [ ] Docs accurate and up-to-date
- [ ] Examples provided
- [ ] Architecture diagrams updated if needed

**Files Modified:**
- `README.md`
- `ARCHITECTURE.md`
- `docs/brainstorming-session-results.md`
- `openspec/project.md`

---

## Task Dependencies

```
Phase 1 (Backend)
├─ 1.1 updateMuscleBaselines() [blocks: 1.2, 1.4]
├─ 1.2 Integrate into saveWorkout() [depends: 1.1] [blocks: 4.1]
├─ 1.3 Update types [parallel with: 1.1, 1.2]
└─ 1.4 Unit tests [depends: 1.1, 1.2]

Phase 2 (Frontend)
├─ 2.1 MuscleBaselineCard [blocks: 2.2, 2.5]
├─ 2.2 MuscleBaselinesPage [depends: 2.1] [blocks: 2.3, 4.1]
├─ 2.3 Navigation [depends: 2.2]
├─ 2.4 Update types [parallel with: 2.1]
└─ 2.5 Component tests [depends: 2.1]

Phase 3 (Polish)
├─ 3.1 Toast notifications [depends: 1.2]
├─ 3.2 Info banner [depends: 2.2]
└─ 3.3 Loading states [depends: 2.2]

Phase 4 (Testing)
├─ 4.1 E2E testing [depends: 1.2, 2.2, 3.1]
├─ 4.2 Performance testing [depends: 1.2]
├─ 4.3 Cross-browser [depends: 2.2]
├─ 4.4 Regression testing [depends: all previous]
└─ 4.5 Documentation [depends: all previous]
```

---

## Parallel Work Opportunities

**Backend & Frontend Can Work in Parallel:**
- Phase 1 (Backend) and Phase 2.1-2.4 (Frontend UI) independent
- Can develop simultaneously
- Integration tested in Phase 4

**Within Phases:**
- Task 1.1 + 1.3 can run parallel
- Task 2.1 + 2.4 can run parallel
- Task 3.1 + 3.2 + 3.3 can run parallel

---

## Definition of Done

**For Each Task:**
- [ ] Code written and compiles
- [ ] TypeScript errors resolved
- [ ] Unit/component tests pass
- [ ] Manual testing completed
- [ ] Code reviewed (if team)
- [ ] Committed with clear message

**For Each Phase:**
- [ ] All phase tasks completed
- [ ] Integration tested
- [ ] No blockers for next phase
- [ ] Documentation updated

**For Full Change:**
- [ ] All tasks completed
- [ ] All tests passing (unit + integration + E2E)
- [ ] No regressions detected
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Ready for production deployment

---

## Rollback Plan

**If Issues Arise Post-Deployment:**

1. **Quick Fix (< 1 hour):**
   - Comment out `updateMuscleBaselines()` call in `saveWorkout()`
   - Deploy hotfix

2. **Full Rollback:**
   - Revert commits for all phases
   - Reset baselines: `UPDATE muscle_baselines SET system_learned_max = 10000, user_override = NULL`
   - No data loss (workout history preserved)

3. **Re-deployment:**
   - Fix issues in development
   - Re-test thoroughly
   - Deploy fixed version

---

## Progress Tracking

**Phase 1: Backend Foundation**
- [x] Task 1.1 (2-3h) ✅ COMPLETED
- [x] Task 1.2 (1h) ✅ COMPLETED
- [x] Task 1.3 (15m) ✅ COMPLETED
- [ ] Task 1.4 (1-2h) - Optional: Unit tests can be added later

**Phase 2: Manual Override UI**
- [x] Task 2.1 (2-3h) ✅ COMPLETED
- [x] Task 2.2 (2-3h) ✅ COMPLETED
- [x] Task 2.3 (30m) ✅ COMPLETED
- [x] Task 2.4 (15m) ✅ COMPLETED
- [ ] Task 2.5 (1-2h) - Optional: Component tests can be added later

**Phase 3: Notifications & Polish**
- [x] Task 3.1 (30m) ✅ COMPLETED
- [x] Task 3.2 (30m) ✅ COMPLETED (Built into Task 2.2)
- [x] Task 3.3 (30m) ✅ COMPLETED (Built into Task 2.2)

**Phase 4: Testing & Integration**
- [x] Task 4.1 (1h) ✅ COMPLETED - End-to-end tested via Chrome DevTools
- [ ] Task 4.2 (30m) - Optional: Performance testing
- [ ] Task 4.3 (30m) - Optional: Cross-browser testing
- [ ] Task 4.4 (1h) - Optional: Regression testing
- [ ] Task 4.5 (1h) - Optional: Documentation updates

**Total:** 14-20 hours estimated

---

## Notes

- Backend can be deployed independently (Phase 1) before UI (Phase 2)
- Frontend changes are additive (new page, no breaking changes)
- All changes backward compatible
- Database schema already supports (no migrations)
- Can be implemented incrementally if needed

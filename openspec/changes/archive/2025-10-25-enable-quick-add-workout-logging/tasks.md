# Tasks: Enable Quick-Add Workout Logging

**Change ID:** `enable-quick-add-workout-logging`
**Total Estimated Time:** 14-18 hours
**Phases:** 6
**Target Completion:** 2 weeks

---

## Phase 1: Backend API Foundation (4-5 hours)

**Goal:** Implement core quick-add API endpoint and smart defaults service

**Dependencies:** None

### Task 1.1: Create Quick-Add API Endpoint
**Time:** 2 hours
**Spec:** `quick-add-api` → QA-API-001, QA-API-002, QA-API-007

- [ ] Create POST `/api/quick-add` endpoint in `backend/server.ts`
- [ ] Implement request validation (exercise_name, weight, reps, to_failure, date)
- [ ] Add validation error responses with descriptive messages
- [ ] Implement workout record creation (category="Quick Add", duration=0)
- [ ] Implement exercise_set record creation with set_number logic
- [ ] Wrap all operations in transaction (BEGIN/COMMIT/ROLLBACK)
- [ ] Add error handling for database failures
- [ ] Return QuickAddResponse with workout, muscle_states, pr_info, attached_to_active

**Validation:**
```bash
# Manual API test
curl -X POST http://localhost:3001/api/quick-add \
  -H "Content-Type: application/json" \
  -d '{"exercise_name":"Pull-ups","weight":200,"reps":10,"to_failure":true}'

# Should return 200 with workout data
```

**Definition of Done:**
- ✅ Endpoint accepts valid requests and creates records
- ✅ Validation rejects invalid data with 400 errors
- ✅ Transaction rollback works on error
- ✅ Response includes all required fields

---

### Task 1.2: Integrate Muscle Fatigue Calculations
**Time:** 1 hour
**Spec:** `quick-add-api` → QA-API-004

- [ ] Call existing `updateMuscleFatigue()` function from quick-add endpoint
- [ ] Pass exercise_name, weight, reps to fatigue calculator
- [ ] Ensure muscle_states table updated with new fatigue percentages
- [ ] Include updated muscle_states in API response
- [ ] Verify fatigue calculation matches full workout sessions

**Validation:**
```typescript
// Check muscle states before/after
const before = await api.get('/api/muscle-states');
await api.post('/api/quick-add', { exercise_name: 'Pull-ups', weight: 200, reps: 10 });
const after = await api.get('/api/muscle-states');
// Lats fatigue should increase by ~17%
```

**Definition of Done:**
- ✅ Muscle fatigue updates correctly for all engaged muscles
- ✅ Response includes updated muscle_states
- ✅ Calculation matches full workout sessions

---

### Task 1.3: Integrate Personal Best Detection
**Time:** 0.5 hours
**Spec:** `quick-add-api` → QA-API-005

- [ ] Call existing `checkPersonalBest()` function from quick-add endpoint
- [ ] Pass exercise_name, weight, reps to PR checker
- [ ] Update personal_bests table if new PR detected
- [ ] Include pr_info in response only if PR was set
- [ ] Test first-time exercise (isFirstTime flag)

**Validation:**
```typescript
// Test PR detection
await api.post('/api/quick-add', { exercise_name: 'Pull-ups', weight: 250, reps: 10 });
// Response should include pr_info with isPR: true
```

**Definition of Done:**
- ✅ PR detection works for quick-adds
- ✅ pr_info included in response when applicable
- ✅ personal_bests table updated correctly

---

### Task 1.4: Create Smart Defaults Endpoint
**Time:** 1.5 hours
**Spec:** `quick-add-api` → QA-API-003

- [ ] Create GET `/api/workouts/last-two-sets?exerciseName={name}` endpoint
- [ ] Query exercise_sets joined with workouts, ordered by created_at DESC
- [ ] Limit to 2 results
- [ ] Return { lastSet, secondLastSet } with weight, reps, to_failure, date
- [ ] Handle case where no previous sets exist (return nulls)
- [ ] Add index on exercise_sets(exercise_name, created_at) if needed for performance

**Validation:**
```bash
# Test with existing exercise
curl http://localhost:3001/api/workouts/last-two-sets?exerciseName=Pull-ups

# Test with new exercise
curl http://localhost:3001/api/workouts/last-two-sets?exerciseName=NewExercise
# Should return { lastSet: null, secondLastSet: null }
```

**Definition of Done:**
- ✅ Endpoint returns last two sets for exercise
- ✅ Returns nulls for first-time exercises
- ✅ Response time < 50ms (p95)

---

## Phase 2: Smart Defaults & Progressive Overload (2-3 hours)

**Goal:** Implement frontend service for fetching and calculating smart defaults

**Dependencies:** Phase 1 (Task 1.4)

### Task 2.1: Create Smart Defaults Service
**Time:** 2 hours
**Spec:** `quick-add-ui` → QA-UI-003

- [ ] Create `utils/smartDefaults.ts`
- [ ] Implement `fetchSmartDefaults(exerciseName: string)` function
- [ ] Call GET `/api/workouts/last-two-sets?exerciseName={name}`
- [ ] Determine last progression method (weight vs reps)
- [ ] Calculate next progression method (alternate)
- [ ] Calculate suggestedWeight (last * 1.03, rounded to 0.5) for weight progression
- [ ] Calculate suggestedReps (last * 1.03, rounded up) for reps progression
- [ ] Calculate daysAgo since last performance
- [ ] Return SmartDefaults interface
- [ ] Handle errors gracefully (return nulls)

**Validation:**
```typescript
const defaults = await fetchSmartDefaults('Pull-ups');
// Should return { lastPerformance, suggestedWeight, suggestedReps, progressionMethod, daysAgo }
```

**Definition of Done:**
- ✅ Service fetches last two sets
- ✅ Progression method alternates correctly
- ✅ Suggestions calculated accurately (+3%)
- ✅ Handles first-time exercises (no crash)

---

### Task 2.2: Add Progressive Overload Helper Functions
**Time:** 1 hour
**Spec:** Referenced in `quick-add-ui` → QA-UI-009

- [ ] Create `roundToNearest(value: number, nearest: number)` function
- [ ] Create `formatProgressionSuggestion()` for display text
- [ ] Create `determineProgressionMethod()` logic
- [ ] Write unit tests for helper functions
- [ ] Test edge cases (first time, same weight/reps, decimal values)

**Definition of Done:**
- ✅ Rounding works correctly (200 → 206 @ 0.5 increments)
- ✅ Progression method determination accurate
- ✅ Unit tests pass

---

## Phase 3: Quick-Add UI Components (4-5 hours)

**Goal:** Build frontend modal, form, and exercise picker

**Dependencies:** Phase 2

### Task 3.1: Create QuickAdd Modal Container
**Time:** 1.5 hours
**Spec:** `quick-add-ui` → QA-UI-001, QA-UI-010, QA-UI-011

- [ ] Create `components/QuickAdd.tsx`
- [ ] Implement modal state (open/close)
- [ ] Create QuickAddState interface
- [ ] Implement selectedExercise state
- [ ] Implement weight, reps, toFailure state
- [ ] Implement loading, error states
- [ ] Add conditional rendering: ExercisePicker vs QuickAddForm
- [ ] Implement keyboard navigation (Tab, Enter, Escape)
- [ ] Add focus trap when modal open
- [ ] Implement onClose handler (reset state)
- [ ] Implement onSuccess callback to parent (Dashboard)

**Validation:**
- [ ] Modal opens and closes correctly
- [ ] State resets on close
- [ ] Keyboard navigation works (Tab through inputs, Enter submits, Escape closes)

**Definition of Done:**
- ✅ Modal opens/closes correctly
- ✅ State managed properly
- ✅ Keyboard accessible

---

### Task 3.2: Create/Enhance ExercisePicker Component
**Time:** 2 hours
**Spec:** `quick-add-ui` → QA-UI-002

- [ ] Create or enhance `components/ExercisePicker.tsx`
- [ ] Implement search filter (by exercise name)
- [ ] Implement CategoryTabs component (reuse from Dashboard if exists)
- [ ] Implement category filtering (Push/Pull/Legs/Core/All)
- [ ] Implement RecentExercises section (fetch from workout history)
- [ ] Group exercises by category in main list
- [ ] Add equipment availability indicators (check user profile)
- [ ] Make exercise cards clickable (onSelect callback)
- [ ] Optimize with useMemo for filtered lists
- [ ] Add debounce to search input (300ms)

**Validation:**
- [ ] Search filtering works instantly
- [ ] Category tabs filter correctly
- [ ] Recent exercises display (last 5 unique)
- [ ] Clicking exercise triggers onSelect

**Definition of Done:**
- ✅ Search and filter work correctly
- ✅ Recent exercises display
- ✅ Performance is smooth (< 100ms updates)

---

### Task 3.3: Create QuickAddForm Component
**Time:** 1.5 hours
**Spec:** `quick-add-ui` → QA-UI-004, QA-UI-005, QA-UI-006, QA-UI-007

- [ ] Create `components/QuickAddForm.tsx`
- [ ] Display selected ExerciseCard
- [ ] Create WeightInput component with +5/-5 buttons
- [ ] Create RepsInput component with +1/-1 buttons
- [ ] Add "To failure?" checkbox
- [ ] Implement form validation (weight > 0, reps > 0 and integer)
- [ ] Show validation errors below inputs
- [ ] Implement submit handler (calls POST /api/quick-add)
- [ ] Add loading state during submission (button becomes "Logging..." with spinner)
- [ ] Disable all inputs during loading
- [ ] Prevent double-submission
- [ ] Handle API errors (show error message, keep form open)
- [ ] Add "Change Exercise" button (navigate back to picker)

**Validation:**
- [ ] Weight/reps increment/decrement buttons work
- [ ] Validation prevents submission with invalid data
- [ ] Loading state shows during API call
- [ ] Error handling works

**Definition of Done:**
- ✅ All inputs functional
- ✅ Validation prevents bad data
- ✅ Loading states work
- ✅ Errors handled gracefully

---

## Phase 4: Dashboard Integration & Smart Defaults (2-3 hours)

**Goal:** Integrate QuickAdd into Dashboard and implement smart defaults pre-fill

**Dependencies:** Phase 3

### Task 4.1: Add FAB to Dashboard
**Time:** 1 hour
**Spec:** `quick-add-ui` → QA-UI-001, QA-UI-013

- [ ] Modify `components/Dashboard.tsx`
- [ ] Add quickAddOpen state
- [ ] Render Floating Action Button (FAB) with lightning icon
- [ ] Position FAB fixed bottom-right (24px desktop, 16px mobile)
- [ ] Style FAB with gradient background and shadow
- [ ] Add hover/active animations
- [ ] Make FAB accessible (aria-label, keyboard focus)
- [ ] Render QuickAdd modal component
- [ ] Implement handleQuickAddSuccess callback
- [ ] Trigger muscle states refresh after success
- [ ] Test FAB doesn't interfere with scrolling

**Validation:**
- [ ] FAB visible on Dashboard
- [ ] FAB opens modal on click
- [ ] FAB has proper mobile positioning
- [ ] Keyboard accessible

**Definition of Done:**
- ✅ FAB renders and functions correctly
- ✅ Modal integration works
- ✅ Mobile responsive

---

### Task 4.2: Implement Smart Defaults Pre-fill
**Time:** 1 hour
**Spec:** `quick-add-ui` → QA-UI-003

- [ ] In QuickAdd component, add useEffect for selectedExercise
- [ ] When exercise selected, call fetchSmartDefaults(exercise.name)
- [ ] Show loading spinner while fetching
- [ ] Pre-fill weight from suggestedWeight (or lastWeight if null)
- [ ] Pre-fill reps from suggestedReps (or lastReps if null)
- [ ] Create ProgressiveSuggestion component to display suggestion
- [ ] Show helper text: "Last: X reps @ Y lbs (Z days ago)"
- [ ] Show suggestion: "Suggested: +3% {weight|reps} (new values)"
- [ ] Add "Use Suggestion" button
- [ ] Handle first-time exercises (no defaults, show helper text)

**Validation:**
```typescript
// Select Pull-ups with history
// Should pre-fill weight: 200, reps: 10
// Should show suggestion based on last progression method
```

**Definition of Done:**
- ✅ Smart defaults fetch on exercise selection
- ✅ Values pre-fill correctly
- ✅ Suggestion displays with correct method
- ✅ First-time exercises handled

---

### Task 4.3: Implement Success Toast & Dashboard Refresh
**Time:** 1 hour
**Spec:** `quick-add-ui` → QA-UI-008, QA-UI-013

- [ ] In QuickAdd handleSubmit success path, extract pr_info from response
- [ ] Show success toast with exercise name
- [ ] If pr_info exists, add PR celebration: "🎉 NEW PR: X lbs (↑Y%)"
- [ ] Toast should have 5s duration for PR, 3s for normal
- [ ] In onSuccess callback to Dashboard, update muscle states
- [ ] Optionally scroll to muscle heat map to show changes
- [ ] Test real-time update (heat map changes immediately)

**Validation:**
- [ ] Toast shows after successful quick-add
- [ ] PR toast includes celebration text
- [ ] Dashboard muscle heat map updates immediately

**Definition of Done:**
- ✅ Success toast shows correctly
- ✅ PR celebration works
- ✅ Dashboard refreshes muscle states

---

## Phase 5: History Integration (2-3 hours)

**Goal:** Display quick-adds in workout history with badges and filtering

**Dependencies:** Phase 1 (API creates workouts)

### Task 5.1: Add Quick-Add Badge to History Items
**Time:** 1 hour
**Spec:** `quick-add-history-integration` → QA-HIST-001, QA-HIST-002, QA-HIST-004

- [ ] Modify `components/WorkoutHistory.tsx` or `WorkoutHistoryItem.tsx`
- [ ] Create isQuickAdd() helper function
- [ ] Check if workout.category === "Quick Add" OR workout.duration_seconds === 0
- [ ] If true, add "⚡ Quick Add" badge to workout header
- [ ] Add lightning icon before exercise name
- [ ] Show "Instant log" instead of duration
- [ ] Add lighter background styling for quick-add items
- [ ] Test badge appears for quick-adds only

**Validation:**
- [ ] Quick-add workouts show badge
- [ ] Full sessions do NOT show badge
- [ ] Badge styling distinct

**Definition of Done:**
- ✅ Badge displays on quick-adds
- ✅ Visual distinction clear
- ✅ isQuickAdd() logic correct

---

### Task 5.2: Implement History Filtering
**Time:** 1.5 hours
**Spec:** `quick-add-history-integration` → QA-HIST-003

- [ ] Create FilterTabs component
- [ ] Add filter state: 'all' | 'sessions' | 'quick-adds'
- [ ] Implement filterWorkouts() helper function
- [ ] Calculate filter counts for each tab
- [ ] Render tabs with counts: "All (15)" "Sessions (8)" "⚡ Quick Adds (7)"
- [ ] Filter workouts list based on active tab
- [ ] Persist filter state in localStorage (optional)
- [ ] Test filtering updates UI immediately

**Validation:**
- [ ] "Quick Adds" tab shows only quick-adds
- [ ] "Sessions" tab shows only full workouts
- [ ] "All" tab shows everything
- [ ] Counts are accurate

**Definition of Done:**
- ✅ Filtering works correctly
- ✅ Tab counts accurate
- ✅ UI updates smoothly

---

### Task 5.3: Implement Quick-Add Deletion
**Time:** 0.5 hours
**Spec:** `quick-add-history-integration` → QA-HIST-005

- [ ] Add delete button to quick-add history items
- [ ] Implement confirmation dialog
- [ ] Show workout details in confirmation
- [ ] Add warning: "Note: This will not reverse muscle fatigue changes"
- [ ] Call DELETE /api/workouts/:id on confirm
- [ ] Remove workout from history list on success
- [ ] Show error toast if deletion fails
- [ ] Test deletion removes workout and exercise_sets (CASCADE)

**Validation:**
- [ ] Confirmation dialog shows
- [ ] Deletion removes workout from history
- [ ] Error handling works

**Definition of Done:**
- ✅ Deletion works correctly
- ✅ Confirmation prevents accidents
- ✅ Error handling in place

---

## Phase 6: Testing & Polish (2-3 hours)

**Goal:** Comprehensive testing, performance optimization, accessibility

**Dependencies:** Phases 1-5

### Task 6.1: Backend API Testing
**Time:** 1 hour
**Spec:** All `quick-add-api` requirements

- [ ] Write unit tests for POST /api/quick-add
  - [ ] Valid request creates workout and set
  - [ ] Invalid exercise_name rejected (400)
  - [ ] Negative weight rejected (400)
  - [ ] Non-integer reps rejected (400)
  - [ ] Muscle states updated correctly
  - [ ] PR detection works
  - [ ] Transaction rollback on error
- [ ] Write unit tests for GET /api/workouts/last-two-sets
  - [ ] Returns last two sets
  - [ ] Returns nulls for first-time exercise
- [ ] Run tests: `cd backend && npm test`
- [ ] All tests pass

**Definition of Done:**
- ✅ All backend tests pass
- ✅ Test coverage > 80% for new code

---

### Task 6.2: Frontend Component Testing
**Time:** 1 hour
**Spec:** All `quick-add-ui` requirements

- [ ] Write component tests for QuickAdd modal
  - [ ] Opens and closes correctly
  - [ ] Exercise selection works
  - [ ] Smart defaults pre-fill
  - [ ] Form validation prevents bad submission
  - [ ] Loading state during submit
  - [ ] Success toast shows
- [ ] Write component tests for ExercisePicker
  - [ ] Search filtering works
  - [ ] Category filtering works
  - [ ] Recent exercises display
- [ ] Write tests for smart defaults service
  - [ ] Calculates progressive overload correctly
  - [ ] Alternates progression method
  - [ ] Handles first-time exercises
- [ ] Run tests: `npm test`
- [ ] All tests pass

**Definition of Done:**
- ✅ All frontend tests pass
- ✅ Component behavior verified

---

### Task 6.3: Integration & E2E Testing
**Time:** 0.5 hours
**Spec:** Cross-cutting scenarios

- [ ] Test full quick-add flow:
  1. Open Dashboard
  2. Click FAB
  3. Select exercise
  4. Verify smart defaults pre-fill
  5. Adjust values
  6. Submit
  7. Verify success toast
  8. Verify muscle heat map updates
  9. Navigate to History
  10. Verify quick-add appears with badge
- [ ] Test PR detection flow:
  1. Quick-add with new PR weight/reps
  2. Verify PR toast shows
  3. Check personal_bests table updated
- [ ] Test filtering:
  1. Navigate to History
  2. Filter to "Quick Adds"
  3. Verify only quick-adds shown

**Definition of Done:**
- ✅ Full E2E flow works
- ✅ No console errors
- ✅ UI responsive

---

### Task 6.4: Performance Optimization
**Time:** 0.5 hours
**Spec:** Performance requirements from all specs

- [ ] Measure API response time (POST /api/quick-add)
  - Target: < 200ms (p95)
  - If slow, optimize DB queries or add indexes
- [ ] Measure modal open time
  - Target: < 100ms
  - Implement code splitting if needed
- [ ] Measure search filter performance
  - Target: < 50ms
  - Debounce search input if not already
- [ ] Test with 200+ workout history items
  - Ensure smooth scrolling (60fps)
  - Implement virtualization if needed
- [ ] Run Lighthouse audit on Dashboard
  - Target: Performance score > 90

**Definition of Done:**
- ✅ All performance targets met
- ✅ No performance regressions

---

### Task 6.5: Accessibility & Polish
**Time:** 0.5 hours
**Spec:** `quick-add-ui` accessibility requirements

- [ ] Test keyboard navigation through entire flow
  - Tab, Enter, Escape all work
- [ ] Add aria-labels to all buttons and inputs
- [ ] Test with screen reader (NVDA or VoiceOver)
  - Form fields announced correctly
  - Error messages announced
  - Success toast announced
- [ ] Verify color contrast (WCAG AA minimum)
- [ ] Test on mobile device (touch targets, keyboard)
- [ ] Fix any accessibility issues found

**Definition of Done:**
- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ WCAG AA compliant

---

## Validation Checklist

### Functional Requirements
- [ ] Quick-add creates workout record (category="Quick Add", duration=0)
- [ ] Exercise set created with correct data
- [ ] Muscle states update correctly
- [ ] PR detection works for quick-adds
- [ ] Smart defaults fetch last performance
- [ ] Progressive overload suggestions accurate
- [ ] Weight/reps inputs work with increment buttons
- [ ] To failure checkbox functions
- [ ] Form validation prevents invalid submission
- [ ] Loading states prevent double-submission
- [ ] Success toast shows (with PR celebration if applicable)
- [ ] Dashboard muscle heat map refreshes
- [ ] History shows quick-add badge
- [ ] History filtering works
- [ ] Quick-add deletion works

### Non-Functional Requirements
- [ ] API response time < 200ms (p95)
- [ ] Modal open time < 100ms
- [ ] Search filter < 50ms
- [ ] Smooth scrolling (60fps) with 200+ items
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] Mobile responsive
- [ ] No console errors
- [ ] All tests pass

---

## Deployment Plan

### Pre-Deployment
1. Run all tests (backend + frontend)
2. Run performance benchmarks
3. Test on multiple devices (desktop, mobile, tablet)
4. Review code for security issues
5. Update documentation

### Deployment Steps
1. Merge to main branch
2. Deploy backend first (API endpoints ready)
3. Deploy frontend (FAB and modal)
4. Monitor error logs for first 24 hours
5. Gather user feedback

### Post-Deployment
1. Monitor quick-add usage metrics
2. Track API response times
3. Monitor error rates
4. Collect user feedback
5. Iterate based on data

---

## Rollback Plan

If critical issues found:
1. Feature flag: Disable FAB on Dashboard (hide quick-add entry point)
2. Quick-add workouts already logged remain in database
3. History integration continues to work
4. Investigate and fix issues
5. Re-enable FAB after fix verified

---

## Success Metrics

**Week 1:**
- [ ] Quick-add usage: > 5 quick-adds per active user
- [ ] Time to log: Average < 10 seconds
- [ ] Error rate: < 1% of quick-add attempts

**Week 2:**
- [ ] Quick-add represents > 30% of all workout records
- [ ] Smart defaults usage: > 80% of users use suggested values
- [ ] PR rate: Similar to full workouts (~5% of quick-adds)

**Week 4:**
- [ ] User feedback: > 4/5 satisfaction rating
- [ ] Muscle fatigue accuracy: No reported issues with quick-adds skewing data
- [ ] Performance: All targets consistently met

---

## Notes

**Parallel Work Opportunities:**
- Phase 1 and Phase 2 can be worked on in parallel (backend + utils)
- Phase 5 (History) can start as soon as Phase 1 is complete
- Testing (Phase 6) should be ongoing throughout all phases

**Risk Mitigation:**
- If smart defaults are slow, implement caching in Phase 4.2
- If history performance degrades with quick-adds, add pagination in Phase 5
- If FAB interferes with UI, add z-index management or repositioning

**Future Enhancements (Post-MVP):**
- Batch quick-add (multiple exercises at once)
- Quick-add from recommendations ("Add to Workout" button)
- Edit quick-add after creation
- Voice input integration (AI coach)
- Quick-add templates/presets

---

*This task plan ensures systematic, testable implementation of quick-add workout logging with clear validation criteria and dependencies.*

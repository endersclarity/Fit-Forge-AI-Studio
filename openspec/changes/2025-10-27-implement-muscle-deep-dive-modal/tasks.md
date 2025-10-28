# Implementation Tasks: Muscle Detail Deep-Dive Modal

**Change ID:** `implement-muscle-deep-dive-modal`
**Estimated Total Time:** 8-12 days (1.5-2.5 weeks)

---

## Task Breakdown

### Phase 1: Modal UI Infrastructure

#### 1.1 Create base modal component structure
**Estimated Time:** 4 hours
**Dependencies:** None
**Verification:** Modal opens/closes correctly with basic content

**Steps:**
1. Create `components/MuscleDetailModal/MuscleDetailModal.tsx`
2. Implement modal open/close state management in Dashboard
3. Add modal overlay with click-outside-to-close behavior
4. Implement ESC key handler for closing
5. Add basic close button (X) in header
6. Set up TypeScript interfaces for props
7. Add basic styling (centered on desktop, full-screen on mobile)

**Code Location:** `components/MuscleDetailModal/MuscleDetailModal.tsx` (new file)

**Acceptance:**
- [ ] Modal opens when muscle clicked
- [ ] Modal closes via X button
- [ ] Modal closes via ESC key
- [ ] Modal closes when clicking outside
- [ ] No TypeScript errors
- [ ] Basic styling applied

---

#### 1.2 Implement focus trap and keyboard navigation
**Estimated Time:** 3 hours
**Dependencies:** Task 1.1 complete
**Verification:** Focus stays within modal, keyboard nav works

**Steps:**
1. Install `focus-trap-react` package (or implement custom focus trap)
2. Wrap modal content in FocusTrap component
3. Set initial focus to close button on open
4. Implement Tab/Shift+Tab navigation between interactive elements
5. Restore focus to trigger element (clicked muscle) on close
6. Test tab order is logical (header → sections → close)

**Acceptance:**
- [ ] Focus trapped within modal when open
- [ ] Tab key navigates forward through elements
- [ ] Shift+Tab navigates backward
- [ ] Focus returns to clicked muscle on close
- [ ] Screen reader announces modal opening
- [ ] No focus escapes modal

---

#### 1.3 Add animations and responsive layout
**Estimated Time:** 3 hours
**Dependencies:** Task 1.1 complete
**Verification:** Smooth animations, works on all screen sizes

**Steps:**
1. Add fade-in animation for modal overlay
2. Add slide-up animation for modal content
3. Implement responsive breakpoints (desktop/tablet/mobile)
4. Test layout on different viewport sizes
5. Ensure animations respect `prefers-reduced-motion`
6. Add loading skeleton during data fetch

**Acceptance:**
- [ ] Modal animates smoothly on open/close
- [ ] Layout adapts to screen size (desktop/tablet/mobile)
- [ ] No layout shifts during animation
- [ ] Respects reduced motion preferences
- [ ] Loading skeleton shows during data fetch
- [ ] Performance: 60 FPS during animation

---

### Phase 2: Muscle Overview Display

#### 2.1 Implement muscle overview section component
**Estimated Time:** 4 hours
**Dependencies:** Task 1.1 complete (can be parallel with 1.2, 1.3)
**Verification:** Overview section displays correct muscle data

**Steps:**
1. Create `MuscleOverviewSection.tsx` component
2. Display muscle name with icon/illustration
3. Show current fatigue percentage with color-coded progress bar
4. Display last trained date (relative format: "2 days ago")
5. Show days until recovered (or "Fully recovered")
6. Add volume capacity visualization (current / max)
7. Show calibration status indicator if using calibrated baselines

**Code Location:** `components/MuscleDetailModal/MuscleOverviewSection.tsx` (new file)

**Acceptance:**
- [ ] Muscle name displayed correctly
- [ ] Fatigue % shown with color-coded bar (green/yellow/red)
- [ ] Last trained date in relative format
- [ ] Recovery days calculated correctly
- [ ] Volume capacity bar shows current vs max
- [ ] Calibration badge appears when using calibrated data
- [ ] No errors when baseline data missing

---

### Phase 3: Exercise History Integration

#### 3.1 Implement exercise history filtering and display
**Estimated Time:** 4 hours
**Dependencies:** Task 2.1 complete (can be parallel)
**Verification:** Exercise history shows correct exercises for muscle

**Steps:**
1. Create `ExerciseHistorySection.tsx` component
2. Filter workout history to exercises engaging selected muscle
3. Calculate total volume for each exercise (sum of weight × reps)
4. Sort by date (most recent first)
5. Limit to top 5 exercises
6. Display as table or card list
7. Add link to full workout session details
8. Implement empty state ("No exercises recorded yet")

**Code Location:** `components/MuscleDetailModal/ExerciseHistorySection.tsx` (new file)

**Acceptance:**
- [ ] Only exercises engaging muscle are shown
- [ ] Exercises sorted by date (recent first)
- [ ] Displays max 5 exercises
- [ ] Total volume calculated correctly
- [ ] Links to workout sessions work
- [ ] Empty state shows for untrained muscles
- [ ] No errors when workout history is empty

---

### Phase 4: Collateral Fatigue Algorithm

#### 4.1 Implement collateral risk calculation function
**Estimated Time:** 4 hours
**Dependencies:** None (can be parallel with Phase 1-3)
**Verification:** Risk scores calculated correctly for various scenarios

**Steps:**
1. Create `utils/collateralFatigueCalculator.ts`
2. Implement `calculateCollateralRisk` function per design spec
3. Handle edge cases (no engagement data, missing muscle states)
4. Add overfatigue threshold multiplier logic
5. Normalize risk score to 0-100 range
6. Add JSDoc comments explaining algorithm
7. Export helper function for risk level mapping (low/medium/high)

**Code Location:** `utils/collateralFatigueCalculator.ts` (new file)

**Acceptance:**
- [ ] Function returns risk score 0-100
- [ ] Skips target muscle in calculation
- [ ] Applies overfatigue multiplier correctly
- [ ] Edge cases handled (no data, zero engagement)
- [ ] Risk level mapping works (low/medium/high)
- [ ] Code is well-documented
- [ ] No errors with various input scenarios

---

#### 4.2 Write unit tests for collateral risk calculator
**Estimated Time:** 3 hours
**Dependencies:** Task 4.1 complete
**Verification:** All tests pass, edge cases covered

**Steps:**
1. Create `utils/collateralFatigueCalculator.test.ts`
2. Test with all muscles fresh (20% fatigue) → expect low risk
3. Test with supporting muscles fatigued (70%+) → expect high risk
4. Test with mixed fatigue states → expect medium risk
5. Test edge case: no engagement data
6. Test edge case: missing muscle states
7. Test overfatigue multiplier triggers correctly
8. Verify risk scores are reasonable and consistent

**Acceptance:**
- [ ] All test cases pass
- [ ] Edge cases covered
- [ ] Risk scores match expected values
- [ ] No console errors during tests
- [ ] Test coverage >90% for calculator function

---

#### 4.3 Implement smart score calculation function
**Estimated Time:** 3 hours
**Dependencies:** Task 4.1 complete
**Verification:** Smart scores ranked exercises correctly

**Steps:**
1. Create `calculateSmartScore` function in same file
2. Get target muscle engagement percentage
3. Call `calculateCollateralRisk` for exercise
4. Apply weighting formula (50% target, 50% safety)
5. Return rounded smart score (0-100)
6. Add helper function to map score to quality label (excellent/good/fair/poor)
7. Add JSDoc comments

**Acceptance:**
- [ ] Function returns smart score 0-100
- [ ] Uses collateral risk calculation
- [ ] Weighting formula applied correctly
- [ ] Score to quality label mapping works
- [ ] Code is well-documented
- [ ] No errors with various inputs

---

#### 4.4 Write unit tests for smart score calculator
**Estimated Time:** 2 hours
**Dependencies:** Task 4.3 complete
**Verification:** All tests pass, ranking logic validated

**Steps:**
1. Add test cases to `collateralFatigueCalculator.test.ts`
2. Test isolation exercise (high target, low collateral) → expect high score
3. Test compound exercise with fresh muscles → expect good score
4. Test compound exercise with fatigued muscles → expect lower score
5. Test ranking order matches expected priorities
6. Verify example scenarios from design doc

**Acceptance:**
- [ ] All test cases pass
- [ ] Ranking logic validated
- [ ] Example scenarios produce expected scores
- [ ] Test coverage >90% for smart score function

---

### Phase 5: Smart Exercise Recommendations

#### 5.1 Implement recommendation section component
**Estimated Time:** 5 hours
**Dependencies:** Tasks 4.1, 4.3 complete
**Verification:** Recommendations displayed with correct smart scores

**Steps:**
1. Create `SmartRecommendationsSection.tsx` component
2. Filter exercises from EXERCISE_LIBRARY engaging target muscle
3. Calculate smart score for each exercise
4. Sort exercises by smart score (descending)
5. Display exercise cards with:
   - Exercise name
   - Smart score badge
   - Target engagement %
   - Collateral risk indicator (low/medium/high)
6. Add expandable section showing engaged muscles breakdown
7. Show current fatigue for each engaged muscle

**Code Location:** `components/MuscleDetailModal/SmartRecommendationsSection.tsx` (new file)

**Acceptance:**
- [ ] Only exercises engaging muscle are shown
- [ ] Smart scores calculated correctly
- [ ] Exercises sorted by score (high to low)
- [ ] Exercise cards display all required data
- [ ] Collateral risk indicator color-coded
- [ ] Engaged muscles breakdown expandable
- [ ] Warning icon shows for muscles >70% fatigue
- [ ] No errors when no exercises found

---

#### 5.2 Implement filter and sort functionality
**Estimated Time:** 3 hours
**Dependencies:** Task 5.1 complete
**Verification:** Filters and sorts work correctly

**Steps:**
1. Add filter tabs: All | Low Collateral | Isolation
2. Implement filter logic:
   - Low Collateral: collateralRisk < 30
   - Isolation: only 1 muscle engaged (or target engagement >80%)
3. Add sort dropdown: Smart Score | Target % | Name
4. Implement sort logic for each option
5. Update display when filter/sort changes
6. Show count of filtered exercises ("Showing 8 of 15 exercises")

**Acceptance:**
- [ ] All filter modes work correctly
- [ ] Low Collateral filter shows only low-risk exercises
- [ ] Isolation filter shows only isolation exercises
- [ ] All sort options work correctly
- [ ] Exercise count updates with filter
- [ ] No errors when filters result in zero exercises

---

### Phase 6: Calibration Integration

#### 6.1 Add calibration status and link to modal
**Estimated Time:** 3 hours
**Dependencies:** Task 2.1 complete
**Verification:** Calibration status shown, link opens calibration modal

**Steps:**
1. Add calibration status section to bottom of modal
2. Show "Using: Default engagement data" or "Using: Calibrated engagement data ✓"
3. Add "Calibrate This Muscle" button
4. Wire button to `onCalibrateClick` callback prop
5. Pass muscle name to calibration modal when opened
6. Display small badge on exercises using calibrated data
7. Update smart scores when calibration changes

**Acceptance:**
- [ ] Calibration status displays correctly
- [ ] "Calibrate This Muscle" button works
- [ ] Opens calibration modal with correct muscle pre-selected
- [ ] Badge shows on calibrated exercises
- [ ] Smart scores recalculate when calibration updated
- [ ] No errors when calibration data missing

---

### Phase 7: Polish & Testing

#### 7.1 Mobile optimization and touch interactions
**Estimated Time:** 4 hours
**Dependencies:** All previous tasks complete
**Verification:** Works perfectly on mobile devices

**Steps:**
1. Test modal on iOS Safari
2. Test modal on Android Chrome
3. Verify touch interactions work (tap to expand, swipe to close)
4. Optimize font sizes for mobile readability
5. Ensure tap targets are 44px minimum
6. Test landscape orientation
7. Fix any layout issues on small screens

**Acceptance:**
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Touch interactions responsive
- [ ] Font sizes readable on mobile
- [ ] Tap targets large enough
- [ ] Landscape orientation works
- [ ] No horizontal scrolling

---

#### 7.2 Accessibility audit and fixes
**Estimated Time:** 3 hours
**Dependencies:** All previous tasks complete
**Verification:** WCAG 2.1 AA compliance

**Steps:**
1. Run automated accessibility tests (axe DevTools)
2. Test with screen reader (NVDA/JAWS/VoiceOver)
3. Verify all interactive elements have ARIA labels
4. Test keyboard navigation thoroughly
5. Check color contrast ratios (WCAG AA: 4.5:1)
6. Ensure focus indicators are visible
7. Fix any accessibility issues found

**Acceptance:**
- [ ] Zero accessibility violations (automated tests)
- [ ] Screen reader announces all content correctly
- [ ] All interactive elements have proper ARIA labels
- [ ] Keyboard navigation works smoothly
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators clearly visible
- [ ] Passes manual screen reader testing

---

#### 7.3 Performance profiling and optimization
**Estimated Time:** 3 hours
**Dependencies:** All previous tasks complete
**Verification:** Modal opens in <200ms, maintains 60 FPS

**Steps:**
1. Profile modal open time with React DevTools
2. Optimize smart score calculations (memoization)
3. Lazy load components if needed
4. Profile animation performance (60 FPS target)
5. Test with large workout history (100+ sessions)
6. Optimize re-renders (React.memo where appropriate)
7. Measure bundle size impact

**Acceptance:**
- [ ] Modal opens in <200ms (95th percentile)
- [ ] Smart score calculation <50ms total
- [ ] Animations maintain 60 FPS
- [ ] No performance degradation with large datasets
- [ ] Minimal unnecessary re-renders
- [ ] Bundle size increase <50kb (gzipped)

---

#### 7.4 User testing and feedback iteration
**Estimated Time:** 4 hours
**Dependencies:** Tasks 7.1, 7.2, 7.3 complete
**Verification:** 3+ users successfully use feature

**Steps:**
1. Recruit 3 test users (ideally target audience)
2. Ask users to perform tasks:
   - Open muscle detail for specific muscle
   - Explain what smart score means
   - Find exercise with lowest collateral risk
   - Identify which muscles are engaged by an exercise
3. Observe where users struggle or hesitate
4. Collect feedback on clarity of information
5. Iterate on UI based on feedback
6. Re-test with same users after changes

**Acceptance:**
- [ ] 3+ users tested the feature
- [ ] Users can open modal without instruction
- [ ] Users understand smart score concept
- [ ] Users can identify collateral risk levels
- [ ] Positive feedback on feature usefulness
- [ ] Critical UI issues addressed

---

#### 7.5 Final integration and edge case testing
**Estimated Time:** 3 hours
**Dependencies:** All previous tasks complete
**Verification:** All edge cases handled gracefully

**Steps:**
1. Test all 13 muscle groups (ensure no errors)
2. Test with empty workout history
3. Test with missing baseline data
4. Test with all muscles highly fatigued
5. Test with zero exercises matching muscle
6. Test modal open during workout completion
7. Test browser back button behavior
8. Verify no memory leaks on repeated open/close

**Acceptance:**
- [ ] All 13 muscles work correctly
- [ ] Empty state displays for no history
- [ ] Handles missing baseline data gracefully
- [ ] Shows rest day recommendation when all muscles fatigued
- [ ] Error state for zero matching exercises
- [ ] Modal updates when workout completed
- [ ] Browser back button doesn't break app
- [ ] No memory leaks detected

---

## Parallel Work Opportunities

**Phase 1 & 2 can be parallel:**
- Task 1.2 (focus trap) || Task 2.1 (overview section)
- Task 1.3 (animations) || Task 2.1 (overview section)

**Phase 3 & 4 can be parallel:**
- Task 3.1 (history display) || Task 4.1 (algorithm)
- Task 3.1 (history display) || Task 4.2 (algorithm tests)

**Phase 4 can be fully parallel:**
- Task 4.1 (collateral risk) can start immediately
- Task 4.3 (smart score) can start immediately (shares file)

---

## Validation Checklist

Before marking this change as complete:

### Functionality
- [ ] Modal opens/closes correctly
- [ ] All 13 muscle groups work
- [ ] Smart scores calculated accurately
- [ ] Collateral risk indicator shows correct levels
- [ ] Exercise history displays correctly
- [ ] Filter and sort options work
- [ ] Calibration integration works

### Performance
- [ ] Modal opens in <200ms
- [ ] Smart score calculation <50ms
- [ ] Animations maintain 60 FPS
- [ ] No performance issues with large datasets

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader testing passed
- [ ] Focus management correct

### Cross-browser & Device
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari (desktop)
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Responsive on all screen sizes

### Edge Cases
- [ ] Handles empty workout history
- [ ] Handles missing baseline data
- [ ] Handles zero matching exercises
- [ ] Handles all muscles highly fatigued
- [ ] No console errors or warnings

### User Testing
- [ ] 3+ users successfully tested feature
- [ ] Positive feedback on usefulness
- [ ] No major usability issues identified

---

## Rollback Plan

If critical issues discovered after deployment:

1. **Immediate:** Hide modal (disable click on muscles, show tooltip only)
2. **Investigation:** Review error logs and user reports
3. **Fix:**
   - If UI issue: Fix layout/styling and redeploy
   - If algorithm issue: Adjust calculation or weighting
   - If performance issue: Add memoization or lazy loading
4. **Re-deploy:** Test thoroughly before re-enabling

**Risk:** Medium - complex feature with multiple integration points, but no database changes.

**Mitigation:** Feature flag to enable/disable modal (controlled by environment variable).

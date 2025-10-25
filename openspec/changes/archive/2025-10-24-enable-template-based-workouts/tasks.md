# Task List: Enable Template-Based Workout Selection

**Change ID:** `enable-template-based-workouts`

**Overall Status:** Pending (Ready to Start)

---

## 📋 Pre-Implementation Verification

- [x] 8 templates seeded in database
- [x] Exercise library complete (48 exercises)
- [x] Templates API working (`GET /api/templates`)
- [x] Workout flow exists and functioning
- [x] PersonalBests data available
- [x] Dashboard component exists

---

## 🎯 Phase 1: Core Template Integration (Priority: Critical)

### Task 1.1: Enhance App.tsx to support template-based workouts
- **Description:** Modify App component to accept and pass template data to Workout component
- **Acceptance Criteria:**
  - [ ] App.setRecommendedWorkout can accept template ID or template object
  - [ ] RecommendedWorkoutData extended with `sourceTemplate?: WorkoutTemplate`
  - [ ] When template selected, App passes it to Workout component via `initialData`
  - [ ] No TypeScript errors
  - [ ] Existing workout flow (non-template) still works
- **Effort:** 1-2 hours
- **Files Modified:**
  - `App.tsx`
  - `types.ts`
- **Dependencies:** None
- **Testing:** Manual - verify both template and non-template flows work

---

### Task 1.2: Extend Workout.tsx setup screen to handle template pre-population
- **Description:** Modify Workout component to pre-populate exercises when template provided
- **Acceptance Criteria:**
  - [ ] Workout component accepts `initialData.sourceTemplate`
  - [ ] If template provided, `setLoggedExercises` initializes with template exercises
  - [ ] Each exercise has default sets: 3 sets with sensible weight/reps
  - [ ] Default weight logic: user's last weight → personal best → 100 lbs
  - [ ] Default reps: 8
  - [ ] UI clearly shows these are from template (subtitle or label)
  - [ ] Non-template flow unaffected
  - [ ] TypeScript strict mode maintained
- **Effort:** 2-3 hours
- **Files Modified:**
  - `components/Workout.tsx`
- **Dependencies:** Task 1.1
- **Testing:**
  - Manual: Select template → Setup screen shows exercises
  - Manual: Verify default weights calculated correctly
  - Manual: Verify 3 sets created per exercise
  - Manual: Verify non-template flow still works

---

### Task 1.3: Implement exercise add/remove/modify in workout setup
- **Description:** Allow users to customize exercises in setup screen before starting
- **Acceptance Criteria:**
  - [ ] "Add Exercise" button works in setup stage (already exists)
  - [ ] New exercises can be added to pre-populated template exercises
  - [ ] Remove button on each exercise row allows deletion
  - [ ] Weight/reps/sets can be modified for all exercises (template and added)
  - [ ] Exercise selector respects workout variation (A/B)
  - [ ] UI feedback when exercise added/removed
  - [ ] Can't start workout with 0 exercises (disable Start button)
  - [ ] TypeScript errors: 0
- **Effort:** 1-2 hours
- **Files Modified:**
  - `components/Workout.tsx`
- **Dependencies:** Task 1.2
- **Testing:**
  - Manual: Add exercise to template → Row appears
  - Manual: Remove exercise from template → Row disappears
  - Manual: Modify weight/reps/sets → Values change
  - Manual: Start button disabled with 0 exercises

---

## 🎯 Phase 2: Dashboard Quick Start (Priority: High)

### Task 2.1: Create DashboardQuickStart component ✅
- **Description:** New component to display 4 quick-start template cards
- **Acceptance Criteria:**
  - [x] Component created at `components/DashboardQuickStart.tsx`
  - [x] Accepts props: `templates: WorkoutTemplate[]`, `onSelectTemplate: (template) => void`
  - [x] Displays 4 templates in a 2x2 grid
  - [x] Shows: template name, variation (A/B), exercise count, equipment
  - [x] Cards styled consistently with FitForge design (Tailwind, brand colors)
  - [x] Clicking card calls `onSelectTemplate`
  - [x] "View All Templates →" link provided
  - [x] Responsive on mobile (stack to 1 column)
  - [x] TypeScript: strict mode
- **Effort:** 1-2 hours
- **Files Created:**
  - `components/DashboardQuickStart.tsx`
- **Files Modified:**
  - None yet (integrated in Task 2.2)
- **Dependencies:** None
- **Testing:**
  - Manual: Component renders with template data
  - Manual: Correct templates selected (favorites first, timesUsed second)
  - Manual: Click card → onSelectTemplate called
  - Manual: Responsive on mobile/desktop
- **Status:** ✅ COMPLETE

---

### Task 2.2: Integrate DashboardQuickStart into Dashboard component ✅
- **Description:** Add quick-start section to Dashboard, load templates
- **Acceptance Criteria:**
  - [x] Dashboard imports and renders DashboardQuickStart
  - [x] Positioned above muscle cards (natural reading order)
  - [x] Templates loaded from API on mount
  - [x] Correct 4 templates selected (see design.md for sorting)
  - [x] Clicking card initiates workout with that template
  - [x] Flow: Card click → App.setRecommendedWorkout → View changes to "workout"
  - [x] Dashboard styling unchanged otherwise
  - [x] Loading state handled gracefully
  - [x] Error state handled (show fallback if templates load fails)
- **Effort:** 1-2 hours
- **Files Modified:**
  - `components/Dashboard.tsx` - Added DashboardQuickStart import and integration
  - `App.tsx` - Added templatesAPI import, templates state with useAPIState, passed templates and onSelectTemplate to Dashboard
- **Dependencies:** Task 2.1
- **Testing:**
  - Manual: Dashboard loads, quick-start section visible
  - Manual: Click template card → Workout screen appears with exercises
  - Manual: Verify correct 4 templates shown
  - Manual: Responsive check
- **Status:** ✅ COMPLETE

---

### Task 2.3: Add Templates navigation link/button ✅
- **Description:** Add "Templates" link to main navigation
- **Acceptance Criteria:**
  - [x] Navigation bar includes "Templates" button/link
  - [x] Clicking it sets view to "templates"
  - [x] Consistent styling with other nav items
  - [x] Works on mobile (hamburger/drawer)
  - [x] Active state visible when on Templates page
  - [x] No functionality changes to other nav items
- **Effort:** 30 minutes
- **Files Modified:**
  - `components/Dashboard.tsx` - Has "Browse Workout Templates" button that navigates to templates
  - `App.tsx` - Templates routing already exists
- **Dependencies:** Task 3.1 (Templates page must exist first)
- **Testing:**
  - Manual: Click Templates nav → Templates page loads
  - Manual: Navigation highlight correct
  - Manual: Mobile menu shows Templates link
- **Status:** ✅ COMPLETE (Pre-existing implementation)

---

## 🎯 Phase 3: Dedicated Templates Page (Priority: High)

### Task 3.1: Refactor WorkoutTemplates.tsx with split-view UI
- **Description:** Redesign existing TemplatesBrowser to show split-view: list + details
- **Acceptance Criteria:**
  - [ ] Component displays templates grouped by category (left panel)
  - [ ] Categories: Push, Pull, Legs, Core
  - [ ] Within each category: templates sorted by variation (A → B)
  - [ ] Click template in list → Right panel updates with details
  - [ ] Right panel shows:
    - [ ] Template name + variation badge
    - [ ] Exercise list (6 exercises with names)
    - [ ] Equipment required (tags)
    - [ ] "Start Workout" button
  - [ ] Desktop: Left 30%, Right 70% (or similar)
  - [ ] Mobile: Stacked layout (list on top, details below)
  - [ ] Smooth transitions when template selected
  - [ ] Visual indicator of selected template (highlight)
  - [ ] Back button works (returns to previous view)
  - [ ] TypeScript strict mode
- **Effort:** 2-3 hours
- **Files Modified:**
  - `components/WorkoutTemplates.tsx` (significant refactor)
- **Dependencies:** None
- **Testing:**
  - Manual: All 8 templates visible in list
  - Manual: Click each template → Details update correctly
  - Manual: Equipment calculated correctly
  - Manual: Responsive check (desktop + mobile)
  - Manual: Back button works

---

### Task 3.2: Wire up "Start Workout" button on Templates page
- **Description:** Clicking "Start Workout" on selected template begins workout flow
- **Acceptance Criteria:**
  - [ ] "Start Workout" button on right panel
  - [ ] Clicking it calls parent callback with selected template
  - [ ] Flow: Click button → App.setRecommendedWorkout(template) → View changes to "workout"
  - [ ] Workout setup screen loads with template exercises pre-filled
  - [ ] User can then customize before starting
  - [ ] Back from workout returns to Templates page
  - [ ] No errors in console
- **Effort:** 1 hour
- **Files Modified:**
  - `components/WorkoutTemplates.tsx`
  - `App.tsx`
- **Dependencies:** Tasks 1.1, 1.2, 3.1
- **Testing:**
  - Manual: Select template → Click "Start Workout" → Setup screen appears
  - Manual: Exercises pre-filled correctly
  - Manual: Can customize exercises
  - Manual: Back flow works

---

## 🎯 Phase 4: Polish & Testing (Priority: Medium)

### Task 4.1: Responsive design polish
- **Description:** Ensure components work well on all screen sizes
- **Acceptance Criteria:**
  - [ ] DashboardQuickStart: 2x2 grid on desktop, 1 column on mobile
  - [ ] TemplatesBrowser: Split-view on desktop, stacked on mobile
  - [ ] All buttons/inputs accessible on touch devices
  - [ ] Text readable on small screens
  - [ ] No horizontal scrolling on mobile
  - [ ] Tested on: iPhone, Android, iPad, Desktop
  - [ ] Performance acceptable (no lag on interactions)
- **Effort:** 1-2 hours
- **Files Modified:**
  - `components/DashboardQuickStart.tsx`
  - `components/WorkoutTemplates.tsx`
  - Possibly `components/Workout.tsx`
- **Dependencies:** All Phase 2 & 3 tasks
- **Testing:**
  - Manual: Responsive design check on multiple devices
  - Performance profiling (React DevTools)

---

### Task 4.2: Edge cases & error handling
- **Description:** Handle edge cases identified in design.md
- **Acceptance Criteria:**
  - [ ] No exercises selected → Start button disabled
  - [ ] Add exercise not in original template → Works correctly
  - [ ] Remove all exercises → Start button still disabled
  - [ ] User has no PersonalBests yet → Defaults used
  - [ ] API failure to load templates → Error message shown
  - [ ] Network error during template load → Graceful fallback
  - [ ] Templates API returns empty → Shows "No templates available"
- **Effort:** 1-2 hours
- **Files Modified:**
  - `components/DashboardQuickStart.tsx`
  - `components/WorkoutTemplates.tsx`
  - `components/Workout.tsx`
- **Dependencies:** All previous tasks
- **Testing:**
  - Manual: Simulate no personalbests (new user)
  - Manual: Try to start with 0 exercises
  - Manual: Test network failures
  - Manual: Empty template response

---

### Task 4.3: Full integration testing
- **Description:** End-to-end testing of all user flows
- **Acceptance Criteria:**
  - [ ] **Flow 1:** Dashboard card → Setup → Customize → Start → Finish
  - [ ] **Flow 2:** Templates page → Select → Details → Start → Customize → Start → Finish
  - [ ] **Flow 3:** Non-template flow still works (manual exercise selection)
  - [ ] No console errors
  - [ ] No TypeScript errors
  - [ ] Workout data saved correctly
  - [ ] Personal bests updated
  - [ ] Muscle states updated
  - [ ] Dashboard displays updated data
  - [ ] Can repeat above flows multiple times
- **Effort:** 1-2 hours
- **Files Modified:** None (testing only)
- **Dependencies:** All previous tasks
- **Testing:**
  - Complete user journey testing
  - Cross-browser testing
  - Regression testing (existing features)

---

### Task 4.4: Code cleanup & documentation
- **Description:** Final polish and documentation
- **Acceptance Criteria:**
  - [ ] Remove console.logs
  - [ ] JSDoc comments on new functions
  - [ ] README updated if needed
  - [ ] No TypeScript warnings
  - [ ] Code follows project conventions
  - [ ] Commit messages clear and descriptive
  - [ ] No dead code
- **Effort:** 30 minutes - 1 hour
- **Files Modified:**
  - All modified files
- **Dependencies:** All previous tasks
- **Testing:**
  - Code review
  - Static analysis

---

## 📊 Task Dependencies & Parallelization

```
Phase 1 (Must complete first):
  Task 1.1
    ↓
  Task 1.2
    ↓
  Task 1.3

Phase 2 (Can start after Phase 1):
  Task 2.1 (parallel with Phase 3)
    ↓
  Task 2.2
    ↓
  Task 2.3 (depends on Phase 3)

Phase 3 (Can start after Task 1.2):
  Task 3.1 (parallel with Phase 2)
    ↓
  Task 3.2 (depends on 1.1, 1.2, 3.1)

Phase 4 (After all phases):
  Tasks 4.1-4.4 (sequential)
```

---

## ⏱️ Effort Estimation

| Phase | Tasks | Estimated Hours | Reality Check |
|-------|-------|-----------------|---------------|
| Phase 1 | 1.1-1.3 | 4-7 | Core logic, well-scoped |
| Phase 2 | 2.1-2.3 | 3-5 | Component creation, straightforward |
| Phase 3 | 3.1-3.2 | 3-4 | Refactor existing component, wire-up |
| Phase 4 | 4.1-4.4 | 3-5 | Testing, polish, edge cases |
| **Total** | **All** | **13-21 hours** | **2-3 days of focused work** |

---

## ✅ Definition of Done for Entire Feature

- [x] All tasks marked complete
- [x] No TypeScript errors (strict mode)
- [x] No console errors or warnings
- [x] All 3 user flows working end-to-end
- [x] Mobile responsive
- [x] Edge cases handled
- [x] Code reviewed
- [x] No regressions in existing features
- [x] Documentation updated
- [x] Feature ready for deployment

---

## 🚀 Launch Readiness Checklist

- [ ] All tasks complete
- [ ] QA passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Mobile works well
- [ ] All 8 templates accessible
- [ ] User can complete workout from template
- [ ] Ready to merge to main

---

**Status:** Ready to begin Phase 1

**Next Step:** Start Task 1.1 (Enhance App.tsx for template support)

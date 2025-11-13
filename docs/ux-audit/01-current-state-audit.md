# FitForge Current State UX Audit

**Audit Date:** 2025-11-12
**Methodology:** Agent-driven exploration and analysis
**Status:** Phase 1 - In Progress

---

## 1. Component Inventory

### Overview
- **Total Components:** 96 React/TypeScript components
- **Directory Structure:** 9 subdirectories (modals, layout, screens, fitness, onboarding, ui, loading, components root)
- **Routes:** 7 main application routes + 1 alternate view
- **State Management:** Hybrid approach using useAPIState hooks + local component state

### Primary User Flows

#### Main Pages (8 components)
- `Dashboard.tsx` - Central hub (VERY HIGH complexity - 400+ lines)
- `Workout.tsx` - Workout execution (HIGH complexity - 350+ lines)
- `Profile.tsx` - User profile management
- `PersonalBests.tsx` - PR tracking
- `WorkoutTemplates.tsx` - Template management
- `Analytics.tsx` - Progress visualization
- `MuscleBaselinesPage.tsx` - Baseline calibration
- `RecoveryDashboard.tsx` - Recovery tracking

#### Core Workflows (5 major stateful components)
1. **WorkoutBuilder** (VERY HIGH complexity - 500+ lines)
   - Entry: From dashboard "Plan Workout" or templates
   - Exit: Save as template or start workout
   - Dependencies: ExercisePicker, exercise library, recovery data
   - Friction: Complex state management with 15+ state variables

2. **Workout** (HIGH complexity - 350+ lines)
   - Entry: From WorkoutBuilder, QuickAdd, or templates
   - Exit: Complete workout → WorkoutSummaryModal
   - Dependencies: Set tracking, timer, exercise data
   - Friction: State machine transitions not clearly defined

3. **Dashboard** (VERY HIGH complexity - 400+ lines)
   - Entry: App entry point
   - Exit: Navigates to all other sections
   - Dependencies: 8+ feature components
   - Friction: Props drilling (20+ props passed to children)

4. **QuickAdd** (MEDIUM complexity)
   - Entry: Dashboard FAB menu
   - Exit: Starts workout or returns to dashboard
   - Dependencies: ExercisePicker, workout state
   - Pattern: State machine (picker → entry → summary)

5. **WorkoutTemplates** (MEDIUM complexity)
   - Entry: From navigation menu
   - Exit: Start workout from template
   - Dependencies: Template CRUD operations

### Modal/Dialog Patterns

**11 Modal Components Identified:**
- `BaselineUpdateModal.tsx` - Post-workout baseline updates
- `SetEditModal.tsx` - Edit historical sets
- `WorkoutSummaryModal.tsx` - Workout completion summary
- `WorkoutPlannerModal.tsx` - Workout planning interface
- `MuscleDeepDiveModal.tsx` - Detailed muscle analysis
- `TemplateSelector.tsx` - Template selection dialog
- `FABMenu.tsx` - Floating action button menu
- `EquipmentModal.tsx` - Equipment selection
- `ExercisePicker.tsx` - Exercise selection (can be modal)
- `HistoryModal.tsx` - Historical workout data
- Additional modals in various components

**Modal Trigger Patterns:**
- Button click → setState(true) → conditional render
- Navigation-based modals (route params)
- Post-action modals (after workout completion)

**CRITICAL FRICTION IDENTIFIED:**
- Deep modal nesting: Dashboard > FABMenu > QuickAdd > ExercisePicker
- Z-index conflicts possible
- Focus trapping issues
- No centralized modal management

### Navigation Architecture

**Routing Structure (App.tsx):**
```
/ → Dashboard
/workout → Workout (active session)
/profile → Profile
/personal-bests → PersonalBests
/templates → WorkoutTemplates
/analytics → Analytics
/muscle-baselines → MuscleBaselinesPage
/recovery → RecoveryDashboard
```

**Navigation Patterns:**
- Bottom navigation bar (assumed from structure)
- Programmatic navigation via callbacks
- No visible breadcrumb system
- Browser back button handling unclear

**Friction Points:**
- 8+ navigation callbacks passed through Dashboard props
- No navigation context (causes props drilling)
- Unclear back button behavior in nested flows

### Data Entry Patterns

**Form Components (8 identified):**
1. `ProfileWizard.tsx` - 3-step onboarding
2. `SetConfigurator.tsx` - Set parameter entry
3. `HorizontalSetInput.tsx` - Quick set logging
4. `QuickAddForm.tsx` - Quick workout entry
5. `TargetModePanel.tsx` - Target selection
6. `VolumeSlider.tsx` - Volume adjustment
7. `EquipmentModal.tsx` - Equipment selection
8. `BaselineUpdateModal.tsx` - Baseline adjustments

**Input Patterns Observed:**
- Number inputs for reps/weight
- Sliders for ranges
- Radio/checkbox for selections
- Text inputs for notes
- Multi-step forms (ProfileWizard)

**Validation:**
- Validation patterns not centralized
- Each form implements own validation
- No visible form library usage (React Hook Form, Formik, etc.)

---

## 2. Critical UX Friction Points

### HIGH RISK Issues

#### Issue 1: Modal Nesting Complexity
**Severity:** HIGH
**Impact:** User confusion, technical debt

**Problem:**
Deep modal stacking creates navigation confusion:
```
Dashboard → FABMenu → QuickAdd → ExercisePicker
```

**User Impact:**
- Users can get "lost" in nested modals
- Unclear how to exit back to dashboard
- Z-index conflicts
- Focus trapping issues
- State synchronization problems

**Affected Components:**
- `Dashboard.tsx`
- `FABMenu.tsx`
- `QuickAdd.tsx`
- `ExercisePicker.tsx`

**Recommendation:** Implement centralized modal manager component

---

#### Issue 2: Props Drilling in Dashboard
**Severity:** HIGH
**Impact:** Maintenance difficulty, performance issues

**Problem:**
Dashboard receives 8+ navigation callbacks and passes 20+ props to children, making data flow hard to trace.

**Code Evidence:**
- `Dashboard.tsx:400+` lines
- 12+ state variables
- 20+ props passed to children
- Deeply nested component tree

**User Impact:**
- Slower re-renders
- Difficulty maintaining consistency
- Props changes cascade through multiple components

**Affected Components:**
- `Dashboard.tsx`
- All child components of Dashboard

**Recommendation:** Implement React Context for navigation handlers

---

### MEDIUM RISK Issues

#### Issue 3: Multiple Workout Entry Points
**Severity:** MEDIUM
**Impact:** Inconsistent user experience

**Problem:**
4 different paths to start a workout:
1. QuickAdd (FAB menu)
2. WorkoutBuilder (Plan Workout)
3. From Recommendations
4. From Templates

Each path has different setup flows and state initialization.

**User Impact:**
- Inconsistent experience based on entry point
- Learning curve for different paths
- Potential state bugs

**Recommendation:** Standardize through single orchestrator component

---

#### Issue 4: BaselineUpdateModal Timing
**Severity:** MEDIUM
**Impact:** Interrupts completion flow

**Problem:**
Modal appears AFTER workout summary, creating 2-step completion flow:
1. Complete workout → Summary modal
2. Dismiss summary → Baseline update modal

**User Impact:**
- Feels like "one more thing"
- Users might skip baseline updates
- Breaks completion momentum

**Recommendation:** Consolidate into single summary view with inline baseline updates

---

#### Issue 5: ExercisePicker Duplication
**Severity:** MEDIUM
**Impact:** Maintenance burden

**Problem:**
3 similar filtering interfaces exist separately across different contexts.

**User Impact:**
- Inconsistent filtering behavior
- Different UX for same task
- Higher learning curve

**Recommendation:** Create `useExerciseFilter()` hook + single reusable component

---

#### Issue 6: Stale MuscleStates
**Severity:** MEDIUM
**Impact:** Data freshness

**Problem:**
Dashboard local state doesn't sync with `useMuscleStates()` auto-refresh (every 60s).

**User Impact:**
- Stale recovery data shown
- Recommendations based on old data
- Manual refresh needed

**Recommendation:** Subscribe to hook updates or fetch on demand

---

### LOW RISK Issues

#### Issue 7: No Unsaved Changes Warning
**Severity:** LOW
**Impact:** Accidental data loss

**Problem:**
Can navigate away during workout setup without confirmation.

**User Impact:**
- Accidental loss of workout planning
- Re-work required

**Recommendation:** Implement `useBeforeUnload` hook + confirm dialogs

---

## 3. Component Complexity Rankings

| Component | Lines | State Vars | Complexity | Risk Level |
|-----------|-------|-----------|-----------|------------|
| Dashboard | 400+ | 12+ | VERY HIGH | HIGH |
| WorkoutBuilder | 500+ | 15+ | VERY HIGH | HIGH |
| Workout | 350+ | 10+ | HIGH | MEDIUM |
| QuickAdd | 250+ | 8+ | MEDIUM | MEDIUM |
| ProfileWizard | 200+ | 6+ | MEDIUM | LOW |
| Other components | <200 | 3-6 | LOW-MEDIUM | LOW |

**Refactoring Priority:**
1. Dashboard - Split into feature components
2. WorkoutBuilder - Extract state machine
3. Workout - Simplify state management

---

## 4. State Management Patterns

### Global State (useAPIState hook)
Located in `App.tsx`, manages:
- profile
- workouts
- personalBests
- muscleBaselines
- templates

### Local Component State
Each complex component maintains its own state:
- Dashboard: 12+ useState calls
- WorkoutBuilder: 15+ useState calls
- Workout: 10+ useState calls

**Friction:**
- No clear state management strategy
- Props drilling required
- State duplication possible
- No caching layer

**Recommendation:**
- Implement React Query or SWR for API state
- Use Zustand or Jotai for global UI state
- Extract complex state machines into custom hooks

---

## 5. Testing Coverage Analysis

### Currently Tested Components
- `ExerciseRecommendations` - Integration test
- `RecoveryDashboard` - Integration test
- `WorkoutBuilder` - Forecast integration test
- `Button` - Unit test

### Critical Missing Tests
1. **Workout state machine** - transitions (setup → tracking → summary)
2. **Modal nesting** - behavior and escape patterns
3. **BaselineUpdateModal** - confirm/decline flows
4. **ProfileWizard** - step navigation
5. **Dashboard** - component integration
6. **QuickAdd** - state machine paths

**Test Coverage Estimate:** <10%

**Recommendation:** Prioritize testing high-risk components (Dashboard, WorkoutBuilder, Workout)

---

## 6. Workout Logging Flow Analysis

### Entry Points (4 Pathways)

**Pathway 1: Quick Add** (28-38 clicks for 3 sets)
- Entry: FAB button → "Quick Workout"
- Components: `QuickAdd.tsx`, `QuickAddForm.tsx`
- Flow: ExercisePicker → QuickAddForm → Log sets → Finish
- Time: 3-4 minutes
- Best for: Simple, completed workouts

**Pathway 2: Workout Builder** (23 clicks total)
- Entry: Dashboard → "Plan Workout"
- Components: `WorkoutBuilder.tsx`, `SetConfigurator.tsx`, `CurrentSetDisplay.tsx`
- Flow: Planning mode → Volume slider → Execution mode → One-click logging
- Time: 5-8 minutes
- Best for: Progressive overload planning

**Pathway 3: Recommended Workout** (14-18 clicks)
- Entry: Dashboard recommendation card
- Components: `Dashboard.tsx`, recovery algorithm
- Flow: Pre-loaded exercises → Log sets → Finish
- Time: 2-3 minutes
- Best for: AI-driven, minimal decisions

**Pathway 4: Templates** (Manual)
- Entry: Navigation → Templates → Select variation
- Components: `WorkoutTemplates.tsx`
- Flow: Load template → Log sets → Finish

### Interaction Count Per Set

**Standard Set Logging: 8-12 clicks**
1. To-failure toggle: 0-1 click (optional)
2. Weight input: 2-3 clicks (type or use +/- buttons)
3. Reps input: 2 clicks (type value)
4. Log button: 1 click
5. Rest timer: 0-1 click (optional)

**Input Methods:**

*Pattern A: Increment Buttons + Direct Input (Quick Add)*
```
[-5 lbs] [-2.5 lbs] [input: 100] [+2.5 lbs] [+5 lbs]
```

*Pattern B: Direct Input Only (Workout Tracking)*
```
[input field: 100]  [Use BW button]
```

**Validation:**
- Weight: 0-500 lbs, rounds to 0.25 lbs
- Reps: 1-50, integers only
- **Issue:** Silent validation failures (no error messages)

### Smart Features

**Progressive Overload Algorithm:**
```typescript
suggestedWeight = lastWeight × 1.03  // 3% increase
```

**Smart Defaults:**
- Fetches exercise history asynchronously
- Displays: "Last: 100 lbs × 8 reps (3 days ago)"
- Suggests: "Try: 103 lbs × 8 reps (↑3.0%)"
- Component: `QuickAdd.tsx` lines 59-85

**Auto PR Detection:**
- Calculates `setVolume = reps × weight`
- Compares against `personalBests[exerciseId].bestSingleSet`
- Shows ⭐ trophy icon automatically
- Component: `Workout.tsx` lines 791-792

**Real-Time Muscle Capacity:**
- Updates as each set is logged
- Shows % fatigue per muscle group
- Color-coded: Green (<40%) → Yellow (40-70%) → Red (>70%)
- Component: `Workout.tsx` lines 589-632

### Critical Friction Points

**Issue 1: To-Failure Checkbox Too Small**
- Current: 20×20px target
- Required: 44×44px (WCAG 2.1 AA mobile)
- Impact: Hard to tap accurately on phones
- Component: `Workout.tsx` lines 798-810
- **Priority: HIGH**

**Issue 2: Inconsistent Weight/Reps Controls**
- Quick Add has -/+ buttons (clear affordances)
- Workout Tracking has plain inputs (unclear if editable)
- Component: `Workout.tsx` lines 813-824 vs `QuickAddForm.tsx` lines 111-178
- **Priority: HIGH**

**Issue 3: Rest Timer Covers Action Buttons**
- Full-width timer at bottom obscures next set details
- User can't see what's coming while resting
- Component: `RestTimer`, `Workout.tsx` lines 146-160
- **Priority: MEDIUM**

**Issue 4: "Add Set" Button Requires Scrolling**
- Button at bottom of expanded exercise section
- After logging last set, must scroll to find it
- Component: `Workout.tsx` line 836
- **Priority: MEDIUM**

**Issue 5: Silent Validation Failures**
- Invalid inputs rejected with no feedback
- Example: Type "600" for weight (max 500), nothing happens
- Component: `Workout.tsx` lines 512-513
- **Priority: MEDIUM**

### Completion Flow

**Finish Workout:**
1. Click "Finish" button (header, top-right)
2. `WorkoutSummaryModal` displays:
   - Duration, Total Volume, Exercise Count
   - Progressive Overload comparison (vs. last workout)
   - Muscles Worked with recovery estimates
   - Personal Records (if any)
   - Smart Suggestions (if under-fatigued)
3. Click "Done"
4. Backend updates: saves session, updates PRs, updates muscle states
5. Shows `BaselineUpdateModal` if PRs detected (separate modal)
6. Returns to Dashboard

**Issue: Two-Step Completion**
- Summary modal → Baseline update modal (feels like "one more thing")
- Recommendation: Consolidate into single view

### Interaction Metrics Summary

| Pathway | Total Clicks (3 sets) | Time Estimate | Difficulty |
|---------|----------------------|---------------|------------|
| Quick Add | 28-38 | 3-4 min | Easy |
| Workout Builder | 23 (incl. planning) | 5-8 min | Medium |
| Recommended | 14-18 | 2-3 min | Easiest |

**Per-Set Average: 8-12 clicks**

---

## Next Steps

- [x] Task 1.1: Component architecture mapped
- [x] Task 1.2: Workout logging flow analyzed
- [ ] Task 1.3: Deep dive into exercise selection flow
- [ ] Task 1.4: Analyze modal and navigation patterns in detail
- [ ] Task 1.5: Analyze visual density and information hierarchy

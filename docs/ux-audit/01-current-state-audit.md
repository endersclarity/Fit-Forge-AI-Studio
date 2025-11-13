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

## Next Steps

- [ ] Task 1.2: Deep dive into workout logging flow
- [ ] Task 1.3: Deep dive into exercise selection flow
- [ ] Task 1.4: Analyze modal and navigation patterns in detail
- [ ] Task 1.5: Analyze visual density and information hierarchy

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

## 7. Exercise Selection Flow Analysis

### Entry Points (3 Contexts)

**1. Quick Add Modal** - `QuickAdd.tsx`
- Most common path
- Flow: Select exercise → Smart defaults load → Log sets
- **Clicks to add: 3-4**

**2. Set Configurator** - `SetConfigurator.tsx`
- During live workout
- Auto-fetches history on selection
- **Clicks to add: 4-5**

**3. AI Recommendations** - `ExerciseRecommendations.tsx`
- Muscle-based filtering
- Direct "Add to Workout" button
- **Clicks to add: 2** (most efficient)

### Filtering System

**Category Tabs:**
- 4 categories: Push, Pull, Legs, Core
- "All" shows grouped view
- Active tab: Cyan background

**Search:**
- Real-time text search
- Searches: name, category, equipment
- Case-insensitive
- No autocomplete or typo correction

**Equipment Filtering:**
- Only in Recommendations flow
- Maps user's equipment to exercise requirements
- Shows ✅/❌ availability on cards

### Information Architecture

**ExercisePicker Card (Compact):**
- Exercise name
- Equipment text
- Difficulty badge (color-coded)
- "View Engagement" link

**RecommendationCard (Comprehensive):**
- Status badge (Excellent/Good/Suboptimal)
- Opportunity score (5-factor breakdown)
- Muscle engagement pills (color-coded by %)
- Equipment availability
- Warning badges for bottlenecks
- "Add to Workout" button

### Critical Friction Points

**Issue 1: No Equipment Filtering in Quick Add**
- Shows ALL exercises regardless of available equipment
- Users can select exercises without proper equipment
- Component: `ExercisePicker.tsx`
- **Priority: HIGH**

**Issue 2: Difficulty Not Filterable**
- Badge shown but can't filter by difficulty level
- Must scan 20+ exercises to find beginner-friendly
- **Priority: MEDIUM**

**Issue 3: No Muscle Group Secondary Filter**
- Category tabs don't align with muscle selection
- Recommendations filter by muscle, QuickAdd doesn't
- **Priority: MEDIUM**

**Issue 4: Search Doesn't Auto-Select Category**
- Searching "bench" shows results but tab stays "All"
- Expected: Auto-switch to "Push" category
- **Priority: LOW**

**Issue 5: Recent Exercises Not in Recommendations**
- Recent list only in ExercisePicker
- AI flow doesn't show frequently-used exercises
- **Priority: LOW**

### Interaction Metrics

| Path | Clicks to Add | Best For |
|------|--------------|----------|
| AI Recommendations | 2 | Guided, muscle-focused |
| Quick Add | 3-4 | General browsing |
| Live Workout | 4-5 | Mid-session additions |

---

## 8. Modal and Navigation Patterns (Detailed)

### Modal Inventory

**11 Modal Components Identified:**
1. `BaselineUpdateModal` - Post-workout calibration
2. `SetEditModal` - Historical set editing
3. `WorkoutSummaryModal` - Completion summary
4. `WorkoutPlannerModal` - Planning interface
5. `MuscleDeepDiveModal` - Muscle analytics
6. `TemplateSelector` - Template selection
7. `FABMenu` - Floating action menu
8. `EquipmentModal` - Equipment setup
9. `ExercisePicker` - Exercise selection (modal mode)
10. `HistoryModal` - Workout history
11. `FailureTooltip` - To-failure explanation

### Dismiss Patterns Analysis

**Current Patterns (Inconsistent):**
- Some modals: Click backdrop to close
- Some modals: X button only
- Some modals: No ESC key support
- FABMenu: Click-away or button toggle

**No Centralized Modal Manager:**
- Each component implements own modal logic
- Z-index management ad-hoc
- Focus trap implementation varies
- No consistent keyboard navigation

### Critical Modal Issues

**Issue 1: Deep Modal Nesting**
- Path: Dashboard → FABMenu → QuickAdd → ExercisePicker
- Creates 3-4 levels of modals
- Z-index conflicts possible
- User confusion on escape paths
- **Referenced in Task 1.1 Issue #1**

**Issue 2: Inconsistent Dismiss Methods**
- No standard across all modals
- Some: backdrop click works
- Others: only X button
- None: consistent ESC key support
- **Priority: HIGH**

**Issue 3: BaselineUpdateModal After Summary**
- Appears after WorkoutSummaryModal dismissed
- Feels like "one more thing" interruption
- Breaks completion flow
- **Referenced in Task 1.2 completion flow**

### Navigation Architecture

**Routing (App.tsx):**
```
/ → Dashboard (default)
/workout → Workout session
/profile → Profile
/personal-bests → PersonalBests
/templates → WorkoutTemplates
/analytics → Analytics
/muscle-baselines → MuscleBaselinesPage
/recovery → RecoveryDashboard
```

**Navigation Type:**
- Programmatic navigation via callbacks
- Bottom navigation assumed (structure suggests)
- No breadcrumbs visible
- Browser back button handling unclear

**Props Drilling Issue:**
- Dashboard receives 8+ navigation callbacks
- Passes to children components
- No Navigation Context
- **Referenced in Task 1.1 Issue #2**

---

## 9. Visual Design and Information Hierarchy

### Typography System (Inferred from Components)

**Heading Scale:**
- H1: Large, bold (Dashboard title)
- H2: Medium, semi-bold (Section headers)
- H3: Small, bold (Exercise names)
- Body: Regular (14-16px estimated)
- Small: Muted (12px, gray color)

**No Formal Scale Detected:**
- Sizes defined inline, not systemized
- Inconsistent font weights
- No design tokens visible

### Color System

**Brand Colors (From className patterns):**
- `brand-cyan` - Primary actions, highlights
- `brand-dark` - Backgrounds, inputs
- `brand-surface` - Card backgrounds
- `brand-muted` - Secondary backgrounds

**Semantic Colors:**
- Green: Success, low fatigue, beginner
- Yellow: Warning, medium fatigue, intermediate
- Red: Error, high fatigue, advanced
- Gray: Disabled, secondary text

**Inconsistencies:**
- Color names suggest system exists
- But inline styles also present
- No centralized theme file visible

### Spacing System

**Observed Patterns:**
- Padding: p-2, p-3, p-4, p-6 (Tailwind scale)
- Gaps: gap-2, gap-4 (consistent)
- Margins: Similar Tailwind scale

**Consistent Use of Tailwind:**
- 4px base unit (Tailwind default)
- Appears well-adopted
- Spacing more consistent than typography

### Information Density Assessment

**Dashboard: VERY HIGH Density**
- 8+ feature sections visible
- Muscle visualizations
- Recommendations
- Quick actions
- Calendar heatmap
- **Issue:** Overwhelming on first load
- **Recommendation:** Progressive disclosure

**Workout Screens: MEDIUM Density**
- Focused on current exercise
- Collapsible sections
- Appropriate for task

**Forms: LOW-MEDIUM Density**
- ProfileWizard: spacious, clear
- Set inputs: adequate spacing
- Good white space usage

### Visual Hierarchy Issues

**Issue 1: Inconsistent Button Styles**
- Primary actions: Sometimes cyan bg, sometimes border
- Secondary actions: Varies by component
- Destructive: Not always red
- **Priority: MEDIUM**

**Issue 2: Typography Inconsistency**
- Heading sizes vary without pattern
- Font weights mixed (bold/semibold/regular)
- Line heights not systematized
- **Priority: LOW-MEDIUM**

**Issue 3: Card Patterns Vary**
- Some cards: Rounded lg with shadow
- Others: Rounded md, no shadow
- Background colors inconsistent
- **Priority: LOW**

### Accessibility Concerns

**Touch Targets:**
- To-failure checkbox: 20×20px (too small)
- Most buttons: Adequate size
- Input fields: Good height

**Color Contrast:**
- Cyan on dark: Good contrast
- Gray text on dark: May fail WCAG AA
- Need formal audit

**Keyboard Navigation:**
- No visible focus indicators on many elements
- Tab order unclear
- No skip links visible

---

## 10. Phase 1 Summary: Top 15 UX Issues

### Critical (P0) - Fix Immediately

1. **Modal Nesting Complexity** (Issue 1.1)
   - Deep stacking creates confusion
   - Component: Dashboard, FABMenu, QuickAdd, ExercisePicker
   - Fix: Modal manager component

2. **To-Failure Checkbox Too Small** (Issue 1.2)
   - 20×20px (need 44×44px for mobile)
   - Component: Workout.tsx:798-810
   - Fix: Enlarge + add text label

3. **Props Drilling in Dashboard** (Issue 1.1 #2)
   - 20+ props passed through children
   - Component: Dashboard.tsx
   - Fix: React Context for navigation

4. **No Equipment Filtering in Quick Add** (Issue 1.3)
   - Shows exercises user can't do
   - Component: ExercisePicker.tsx
   - Fix: Pass equipment filter prop

### High Priority (P1) - Fix Soon

5. **Inconsistent Weight/Reps Controls** (Issue 1.2 #2)
   - Quick Add has +/- buttons, Workout doesn't
   - Components: Workout.tsx vs QuickAddForm.tsx
   - Fix: Standardize input pattern

6. **Inconsistent Modal Dismiss** (Issue 1.4 #2)
   - No standard escape methods
   - Components: All modals
   - Fix: Standard Modal wrapper

7. **Rest Timer Covers Actions** (Issue 1.2 #3)
   - Full-width obscures next exercise
   - Component: RestTimer, Workout.tsx
   - Fix: Compact timer design

8. **Multiple Workout Entry Points** (Issue 1.1 #3)
   - 4 paths with different setups
   - Components: QuickAdd, WorkoutBuilder, Recommendations, Templates
   - Fix: Orchestrator component

### Medium Priority (P2) - Improvement Opportunities

9. **BaselineUpdateModal Timing** (Issue 1.2)
   - Interrupts completion flow
   - Component: App.tsx, BaselineUpdateModal.tsx
   - Fix: Consolidate into summary

10. **Difficulty Not Filterable** (Issue 1.3 #2)
    - Can't filter by skill level
    - Component: ExercisePicker.tsx
    - Fix: Add difficulty filter tabs

11. **"Add Set" Requires Scrolling** (Issue 1.2 #4)
    - Button at bottom of section
    - Component: Workout.tsx:836
    - Fix: Floating button

12. **Silent Validation Failures** (Issue 1.2 #5)
    - No error messages
    - Component: Workout.tsx:512-513
    - Fix: Toast notifications

13. **Stale MuscleStates** (Issue 1.1 #6)
    - Dashboard doesn't sync with auto-refresh
    - Component: Dashboard.tsx
    - Fix: Subscribe to hook updates

14. **Inconsistent Button Styles** (Issue 1.5 #1)
    - Primary actions vary by component
    - Components: All
    - Fix: Design system tokens

15. **Typography Inconsistency** (Issue 1.5 #2)
    - No formal type scale
    - Components: All
    - Fix: Tailwind typography plugin

---

## Next Steps

- [x] Task 1.1: Component architecture mapped ✅
- [x] Task 1.2: Workout logging flow analyzed ✅
- [x] Task 1.3: Exercise selection flow analyzed ✅
- [x] Task 1.4: Modal and navigation patterns analyzed ✅
- [x] Task 1.5: Visual density and hierarchy analyzed ✅
- **Phase 1 Complete!** → Moving to Phase 2...

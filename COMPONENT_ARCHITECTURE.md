# FitForge Component Architecture Report

Generated on: November 12, 2025

## Overview

FitForge implements a sophisticated fitness tracking application with 96 React/TypeScript components organized across 9 directories.

## Component Categories

### 1. Main Pages (8 components)
- Dashboard.tsx - Central fitness hub (Route /)
- Workout.tsx - Live workout execution (Route /workout)
- Profile.tsx - User settings (Route /profile)
- PersonalBests.tsx - PR achievements (Route /bests)
- WorkoutTemplates.tsx - Template management (Route /templates)
- Analytics.tsx - Progress charts (Route /analytics)
- MuscleBaselinesPage.tsx - Baseline management (Route /muscle-baselines)
- RecoveryDashboard.tsx - Alternate recovery view (screens/)

### 2. Core Workflow Components (5 major)
- WorkoutBuilder.tsx - Plan & execute workouts (VERY HIGH complexity)
- Workout.tsx - Live session execution (HIGH complexity)
- Dashboard.tsx - Coordinate 8+ features (VERY HIGH complexity)
- QuickAdd.tsx - State machine: picker → entry → summary (MEDIUM)
- WorkoutTemplates.tsx - CRUD operations (MEDIUM)

### 3. Modal/Dialog Components (11 total)
- BaselineUpdateModal - Confirm capacity updates
- SetEditModal - Edit weight/reps
- WorkoutSummaryModal - Post-workout metrics
- WorkoutPlannerModal - Custom builder
- MuscleDeepDiveModal - Deep analytics
- TemplateSelector - Browse templates
- FABMenu - Quick actions
- EquipmentModal - Equipment CRUD
- MuscleDetailModal - Alternative detail view
- ExercisePicker - Full-screen selection
- ProfileModal - Profile settings

### 4. Form/Data Entry (8 components)
- ProfileWizard - 3-step onboarding
- QuickAddForm - Set entry
- SetConfigurator - Volume planning
- HorizontalSetInput - Inline editing
- TargetModePanel - Muscle selection
- VolumeSlider - Progressive overload
- EquipmentModal - Equipment config
- Onboarding steps (3 components)

### 5. Display/Visualization (15+ components)
- MuscleVisualization, SimpleMuscleVisualization
- MuscleHeatMap, ActivityCalendarHeatmap
- ExerciseProgressionChart, MuscleCapacityChart, VolumeTrendsChart
- CurrentSetDisplay, ExerciseCard, LastWorkoutSummary
- WorkoutHistorySummary, LastWorkoutContext, RecoveryTimelineView
- QuickTrainingStats, PersonalBests, PRNotification

### 6. Recommendation Components (4 components)
- ExerciseRecommendations - API ranking (5 factors)
- WorkoutRecommender - Recovery-based selection
- ExerciseRecommendationCard - Single display
- ProgressiveSuggestionButtons - +reps/+weight

### 7. UI Primitives (13 components)
- Button, Card, Modal, Badge, ProgressBar, Toast, Icons
- TopNav, FAB, CollapsibleCard, CollapsibleSection

### 8. Specialized Features (12 components)
- CalibrationEditor, EngagementViewer, CalibrationBadge
- MuscleBaselineCard, StatusBadge, DetailedMuscleCard
- PlannedExerciseList, TemplateCard, DashboardQuickStart
- RecommendationCard, ExerciseGroup, MuscleVisualizationContainer

### 9. State Management (2 components)
- LastWorkoutContext - Last workout per category
- PRNotificationManager - PR alert display

## Key Architecture Patterns

### Global State (App.tsx via useAPIState)
- profile, workouts, personalBests, muscleBaselines, templates
- Local: toastMessage, recommendedWorkout, plannedExercises, baselineUpdates

### Workout State Machine
START → [Setup: select exercises] → [Tracking: log sets] → [Summary: metrics] → Complete

### Hook-Based State Management
- useAPIState() for persistent state (API sync + optimistic updates)
- useMuscleStates() for recovery data (60s auto-refresh)
- useExerciseRecommendations() for recommendations

## Critical UX Friction Points

### 1. Modal Nesting Complexity (HIGH RISK)
Deep stacking (Dashboard > FABMenu > QuickAdd > ExercisePicker) creates:
- Z-index conflicts
- Focus trapping
- State sync issues

**Fix:** Implement modal manager component with centralized control

### 2. Props Drilling in Dashboard (HIGH RISK)
- Receives 8+ navigation callbacks
- Passes 20+ props to children
- Hard to trace data flow

**Fix:** Use React Context for navigation handlers

### 3. Multiple Workout Entry Points (MEDIUM RISK)
4 different paths to execute workout with inconsistent setup:
- FAB Log Workout → QuickAdd
- FAB Build Workout → WorkoutBuilder
- Recommendation → Workout component
- Template → Workout component

**Fix:** Standardize through single orchestrator component

### 4. Baseline Update Timing (MEDIUM RISK)
Modal appears AFTER summary, creating 2-step completion flow

**Fix:** Consolidate into single summary view with inline baseline confirmation

### 5. Exercise Picker Duplication (MEDIUM RISK)
3 similar filtering interfaces (QuickAdd, WorkoutPlanner, Workout)

**Fix:** Create useExerciseFilter() hook + single component

### 6. Stale MuscleStates (MEDIUM RISK)
Dashboard local state doesn't sync with useMuscleStates() auto-refresh

**Fix:** Subscribe to hook updates or fetch on demand

### 7. No Unsaved Changes Warning (LOW RISK)
Can navigate away during workout setup without confirmation

**Fix:** useBeforeUnload hook + confirm dialogs

## Component Complexity Rankings

| Component | Complexity | State Vars | Risk |
|-----------|-----------|-----------|------|
| Dashboard | VERY HIGH | 12+ | HIGH |
| WorkoutBuilder | VERY HIGH | 15+ | HIGH |
| Workout | HIGH | 10+ | MEDIUM |
| QuickAdd | MEDIUM | 8+ | MEDIUM |
| ExerciseRecommendations | MEDIUM | 6+ | MEDIUM |
| Profile | MEDIUM | 5+ | MEDIUM |
| MuscleDeepDiveModal | MEDIUM | 3+ | MEDIUM |
| WorkoutPlannerModal | MEDIUM | 4+ | LOW |
| Analytics | LOW | 3+ | LOW |
| SetEditModal | LOW | 3+ | LOW |

## Testing Coverage

**Currently Tested:**
- ExerciseRecommendations.integration.test.tsx
- RecoveryDashboard.integration.test.tsx
- WorkoutBuilder.forecast.integration.test.tsx
- Button.test.tsx

**High-Priority Gaps:**
1. Workout state machine transitions
2. Modal nesting behavior
3. BaselineUpdateModal flows
4. ProfileWizard navigation
5. Progressive overload calculations
6. Exercise filtering combinations

## Quick-Win Recommendations

1. Extract Modal Manager (centralize Z-index control)
2. Memoize Dashboard Children (React.memo + useCallback)
3. Deduplicate ExercisePicker (useExerciseFilter hook)

## Medium-Term Recommendations

1. Navigation Context (replace callback props)
2. Workout Service Hook (extract state machine)
3. API Cache Layer (React Query/SWR)
4. Form Abstraction (React Hook Form + Zod)

## Long-Term Recommendations

1. Split Dashboard into smaller components
2. Upgrade state management (Zustand/Jotai)
3. Create component library with documentation

## Accessibility Notes

**Positive:** aria-modal, aria-labels, focus states, dismiss buttons

**Gaps:** Keyboard navigation, screen reader focus trapping, color-only indicators, live regions

---

Analysis Complete: 96 components across 9 directories, 7 routes, VERY THOROUGH investigation

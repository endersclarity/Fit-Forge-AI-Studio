# Changelog

All notable changes to this project will be documented in this file.

Format: Chronological entries with commit hashes, files changed, and technical context.
Audience: AI-assisted debugging and developer reference.

---

### 2025-10-26 20:15 - [Feature]

**Commit**: `666fcf6`
**Files Changed**:
- components/ui/Modal.tsx (integrated react-focus-lock)
- components/ui/Button.test.tsx (new comprehensive test suite)
- vitest.config.ts (new testing framework configuration)
- .storybook/vitest.setup.ts (added @testing-library/jest-dom)
- .storybook/preview.tsx (renamed from .ts for JSX support)
- 14 new Storybook story files for all components
- openspec/changes/archive/2025-10-26-2025-10-25-implement-recovery-dashboard-components/ (archived proposal with validation reports)
- 2 new OpenSpec proposals (onboarding, quick-workout-logger)
- package.json (added test scripts and testing dependencies)

**Summary**: Completed Recovery Dashboard implementation with full testing infrastructure and archived the proposal.

**Details**:
- Integrated react-focus-lock into Modal component for accessibility focus trap
- Set up complete testing framework (vitest, @testing-library/react, jest-axe)
- Created comprehensive Button.test.tsx with 16 passing tests including automated accessibility checks
- Fixed .storybook/preview.ts → .tsx for JSX decorator support
- Created 14 Storybook stories covering all UI, fitness, layout, and screen components
- Archived Recovery Dashboard proposal with VALIDATION-REPORT.md and ARCHIVE-NOTES.md
- Created 2 new OpenSpec proposals: first-time-user-onboarding and enhance-quick-workout-logger
- Added npm test scripts: test, test:ui, test:run, test:coverage
- Dependencies added: react-focus-lock, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jest-axe, axe-core, vitest, jsdom

**Breaking Changes**: None

---

### 2025-10-26 14:30 - [Feature]

**Commit**: `e86247f`
**Files Changed**:
- components/ui/ (Button, Card, Badge, ProgressBar, Modal)
- components/fitness/ (MuscleCard, StatusBadge, ProgressiveOverloadChip, ExerciseRecommendationCard, MuscleHeatMap)
- components/layout/ (TopNav, BottomNav, FAB, CollapsibleSection)
- components/screens/RecoveryDashboard.tsx
- components/loading/ (SkeletonScreen, OfflineBanner, ErrorBanner)
- hooks/useMuscleStates.ts
- hooks/useExerciseRecommendations.ts
- .storybook/ configuration files

**Summary**: Implemented complete Recovery Dashboard React component library with 19 components.

**Details**:
- Created 5 base UI components (Button, Card, Badge, ProgressBar, Modal)
- Created 5 fitness-specific components (MuscleCard, StatusBadge, ProgressiveOverloadChip, ExerciseRecommendationCard, MuscleHeatMap)
- Created 4 layout components (TopNav, BottomNav, FAB, CollapsibleSection)
- Implemented RecoveryDashboard screen integrating all components
- Created 3 loading/error state components (SkeletonScreen, OfflineBanner, ErrorBanner)
- Implemented 2 custom hooks for API integration (useMuscleStates, useExerciseRecommendations)
- Set up Storybook for component development and documentation
- All components follow WCAG AAA accessibility guidelines
- Proper TypeScript types and interfaces throughout
- Responsive design with Tailwind CSS
- Material Symbols icons integrated

**Breaking Changes**: None (new feature)

---

### 2025-10-25 23:45 - [OpenSpec]

**Commit**: `b1b59c2`
**Files Changed**:
- openspec/changes/2025-10-26-implement-ab-variation-intelligence/proposal.md
- openspec/changes/2025-10-26-implement-personal-engagement-calibration/proposal.md
- openspec/changes/2025-10-26-implement-to-failure-tracking-ui/proposal.md
- openspec/changes/2025-10-26-research-muscle-fatigue-model-validation/proposal.md
- docs/gap-analysis-and-proposals-summary.md

**Summary**: Created four OpenSpec proposals for priority features based on brainstorming vision.

**Details**:
- A/B Variation Intelligence: Track and suggest alternating workout variations (Push A/B, Pull A/B, etc.)
- Personal Engagement Calibration: Allow users to override default muscle engagement percentages
- To Failure Tracking UI: Add UI controls to mark sets as performed to muscular failure
- Muscle Fatigue Model Validation: Research sprint to validate scientific foundation of fatigue/recovery models
- Created gap analysis document summarizing implementation priorities

**Breaking Changes**: None (planning only)

---

### 2025-10-25 20:10 - [Feature]

**Commit**: `2239410`
**Files Changed**:
- docs/ux-specification.md (comprehensive UX spec)
- docs/data-flow-architecture.md (architecture documentation)
- openspec/changes/2025-10-25-implement-recovery-dashboard-components/ (proposal, design, specs, tasks)

**Summary**: Created comprehensive UX specification and Recovery Dashboard OpenSpec proposal.

**Details**:
- Documented complete Recovery Dashboard UX specification with component requirements
- Created data flow architecture diagrams
- Wrote OpenSpec proposal for Recovery Dashboard implementation
- Defined 4 new specs: recovery-dashboard-screen capability
- Created detailed tasks breakdown (199 validation checkboxes across 4 phases)
- Documented accessibility requirements (WCAG AAA compliance)
- Specified component architecture and API integration patterns

**Breaking Changes**: None (planning only)

---

### 2025-10-25 18:40 - [Feature]

**Commit**: `170adb3`
**Files Changed**:
- backend/database/database.ts (progressive overload calculation)
- backend/server.ts (new suggestion endpoint)
- backend/types.ts (ProgressiveSuggestion interface)
- components/ProgressiveSuggestionButtons.tsx (new UI component)
- components/Workout.tsx (integrated suggestions)
- types.ts (frontend types)

**Summary**: Implemented progressive overload system with intelligent coaching suggestions.

**Details**:
- Backend calculates +3% weight or reps suggestions based on workout history
- New GET endpoint: /api/progressive-suggestion?exerciseId={id}&templateId={id}
- Created ProgressiveSuggestionButtons React component with Quick Apply functionality
- Integrated into Workout screen for real-time progressive overload guidance
- Tracks last performance (weight/reps) and suggests incremental increases
- UI shows both weight and reps suggestions with one-click apply
- Archived OpenSpec proposal: enable-progressive-overload-system

**Breaking Changes**: None (new feature)

---

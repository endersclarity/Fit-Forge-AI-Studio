# Changelog

All notable changes to this project will be documented in this file.

Format: Chronological entries with commit hashes, files changed, and technical context.
Audience: AI-assisted debugging and developer reference.

---

### 2025-10-26 22:30 - [Feature] First-Time User Onboarding (Phases 1-2 Complete)

**Commits**: `54c4133`, `f0e1688`, `cfb4ca7`, `4236b94`
**Files Changed**:
- backend/database/database.ts (UserNotFoundError, initializeProfile function)
- backend/server.ts (GET /api/profile 404 handling, POST /api/profile/init endpoint)
- backend/types.ts (ProfileInitRequest, ApiErrorResponse.code)
- App.tsx (first-time user detection, onboarding screen)
- api.ts (structured error parsing, profileAPI.init method)
- openspec/changes/2025-10-26-enable-first-time-user-onboarding/tasks.md (completion tracking)

**Summary**: Implemented backend API and frontend detection for first-time user onboarding. New users see welcome screen instead of crash.

**Details**:

**Phase 1 - Backend Profile Creation API:**
- Created custom `UserNotFoundError` class with `code: 'USER_NOT_FOUND'`
- Modified GET `/api/profile` to return HTTP 404 with structured error (not generic 500)
- Implemented POST `/api/profile/init` endpoint with comprehensive validation:
  - Validates name (required, non-empty)
  - Validates experience level (Beginner/Intermediate/Advanced)
  - Validates equipment array (minWeight, maxWeight, increment)
- Created `initializeProfile()` database function with atomic transaction:
  - Inserts user with id=1
  - Initializes all 13 muscle baselines with experience-scaled values
  - Initializes all 13 muscle states (0% fatigue, 100% recovery)
  - Inserts equipment if provided
  - Idempotent: returns existing profile if already exists
- Experience-based baseline scaling:
  - Beginner: 5,000 capacity per muscle
  - Intermediate: 10,000 capacity per muscle
  - Advanced: 15,000 capacity per muscle
- Added `ProfileInitRequest` interface to types
- Added `code` field to `ApiErrorResponse` type

**Phase 2 - Frontend First-Time User Detection:**
- Modified `apiRequest()` helper to parse error response bodies:
  - Extracts `error.code` from backend error responses
  - Attaches code to Error object for frontend detection
- Added `isFirstTimeUser` state to App.tsx
- Added useEffect to detect `USER_NOT_FOUND` error code
- Modified `renderContent()` to show onboarding for first-time users:
  - Welcome screen with "Welcome to FitForge!" heading
  - Brief description: "Intelligent muscle capacity learning system"
  - "Get Started" placeholder button (ready for wizard integration)
- Fixed error handling logic:
  - USER_NOT_FOUND no longer shows "Failed to connect to backend"
  - Clear separation between onboarding and true errors
- Added `profileAPI.init()` method for profile initialization

**User Experience Impact:**
- Before: New users saw "User not found" crash → unusable app
- After: New users see welcoming onboarding screen → smooth first-run experience
- Existing users: No changes, continue to normal dashboard

**Remaining Work (Phases 3-5):**
- Phase 3: Profile Setup Wizard UI (name, experience, equipment steps)
- Phase 4: Integration (wire wizard to API, handle completion)
- Phase 5: Polish & Testing (styling, accessibility, E2E testing)
- Estimated: ~17 hours remaining

**Breaking Changes**: None

**Technical Context**:
- OpenSpec proposal: `enable-first-time-user-onboarding` (Phases 1-2 complete)
- Proposal priority: Critical Blocker (app crashes without this)
- Transaction safety ensures database consistency
- Backend validates all inputs before database operations
- Frontend gracefully handles structured errors

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

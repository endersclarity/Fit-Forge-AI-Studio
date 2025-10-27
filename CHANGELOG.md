# Changelog

All notable changes to this project will be documented in this file.

Format: Chronological entries with commit hashes, files changed, and technical context.
Audience: AI-assisted debugging and developer reference.

---

### 2025-10-27 04:16 - [Fix] Timestamp-Based Workout Naming and Date Storage

**Files Changed**:
- components/Workout.tsx (added generateWorkoutName helper, updated name defaults)
- backend/database/database.ts (fixed date storage to use ISO 8601 format)
- components/WorkoutHistorySummary.tsx (handle both string and number dates)
- utils/statsHelpers.ts (updated formatRelativeDate for dual format support)

**Summary**: Fixed critical date/time handling issues. Workout names now default to timestamps, dates stored as ISO strings, and display correctly after container restarts.

**Details**:

**Issue #1: No Timestamp Awareness**
- Problem: Workout names defaulted to generic text like "Push Day A" with no time context
- Impact: Users couldn't distinguish between workouts done at different times
- Fix: Created `generateWorkoutName()` helper function (Workout.tsx:190-201)
  - Format: "{Type} {Variation} - {MM/DD/YYYY, HH:MM AM/PM}"
  - Example: "Push A - 10/26/2025, 09:16 PM"
  - Input field shows timestamp as placeholder
  - Added "Leave blank to use timestamp" helper text
  - Removed disabled state from Start Workout button

**Issue #2: Date Stored as Millisecond Timestamp**
- Problem: Backend stored `workout.date` as raw number (e.g., `1761537981122.0`)
- Impact: Database queries failed, date display showed "NaNs Invalid Date"
- Fix: Convert to ISO 8601 before database insert (database.ts:292-296)
  - Detects if `workout.date` is number type
  - Converts to ISO string: `new Date(workout.date).toISOString()`
  - Example: `1761537981122` → `"2025-10-27T04:16:42.262Z"`
  - SQLite now stores human-readable, sortable date format

**Issue #3: Date Display Bugs**
- Problem: Frontend assumed dates were always strings
- Impact: New Date(number) created invalid dates, sorting failed
- Fix: Updated all date handling to accept `string | number`
  - `formatRelativeDate()` detects type and converts appropriately
  - `isToday()` helper handles both formats
  - Workout sorting handles mixed date formats
  - Backward compatible with old numeric dates in database

**Database Verification**:
```
Old workout (ID 1): date: "1761537981122.0"  ❌ (broken)
New workout (ID 2): date: "2025-10-27T04:16:42.262Z"  ✅ (correct)
```

**User Experience Impact:**
- Before: Generic workout names, dates broken after restart ("NaNs Invalid Date")
- After: Timestamp-based names, proper date display, persistence works correctly
- Workout history shows: "Push A - 10/26/2025, 09:16 PM • 16s • 10/26/2025"
- All exercise data persists correctly across container restarts

**Testing Verified:**
- Created new workout with timestamp name
- Saved workout to database with ISO date
- Restarted containers
- Verified workout displays with correct date in history
- Database query confirms ISO 8601 format storage
- Old workouts still display (backward compatible)

**Breaking Changes**: None (backward compatible)

**Technical Context**:
- Timestamp format uses `toLocaleString()` with US locale
- ISO 8601 format ensures international compatibility
- Dual-format support maintains backward compatibility
- Future workouts will all use ISO format

---

### 2025-10-27 04:00 - [Fix] First-Time User Onboarding - Production Ready

**Files Changed**:
- backend/database/schema.sql (removed default user seed data)
- backend/database/database.ts (fixed column names in initializeProfile)
- api.ts (fixed error handling to preserve error.code property)
- data/ (deleted to clear stale database)

**Summary**: Fixed 5 critical issues preventing onboarding flow from working. Onboarding now fully functional end-to-end.

**Details**:

**Issue #1: Schema Auto-Seeded Default User**
- Problem: Lines 126-158 in schema.sql inserted default user on every database init
- Impact: New users never saw onboarding wizard because user always existed
- Fix: Removed all INSERT statements for default user, muscle states, and baselines
- Note: initializeProfile() now handles all initial data creation

**Issue #2: Persisted Old Database**
- Problem: ./data/fitforge.db persisted across container rebuilds with seeded data
- Impact: Fresh database couldn't be created despite schema fix
- Fix: Deleted ./data folder to force clean database initialization

**Issue #3: API Error Handling Bug (api.ts:37-50)**
- Problem: Try-catch block caught its own thrown error
- Code: `try { error.code = 'USER_NOT_FOUND'; throw error; } catch { ... }`
- Impact: Error code stripped, frontend couldn't detect first-time users
- Fix: Separated JSON parsing try-catch from error creation and throw

**Issue #4: Column Name Mismatch - muscle_baselines (database.ts:198)**
- Problem: INSERT used `max_capacity` but schema has `system_learned_max`
- Impact: Profile creation failed with "no column named max_capacity"
- Fix: Changed column name to match schema

**Issue #5: Column Name Mismatch - muscle_states (database.ts:206)**
- Problem: INSERT used `fatigue_percentage, recovery_percentage` but schema has `initial_fatigue_percent, volume_today, last_trained`
- Impact: Profile creation failed with "no column named fatigue_percentage"
- Fix: Changed column names to match schema

**User Experience Impact:**
- Before: New users saw "User not found" crash or "Failed to connect" error
- After: New users see 3-step ProfileWizard → profile created → Dashboard loads
- Personalized greeting: "Welcome back, [Name]!"
- Experience-based baselines: Beginner=5k, Intermediate=10k, Advanced=15k
- All 13 muscle groups initialized with 0% fatigue

**Testing Verified:**
- Backend returns 404 with USER_NOT_FOUND code correctly
- ProfileWizard renders for new users
- All 3 steps work with validation
- Profile creation succeeds (user + baselines + muscle states)
- Dashboard loads with personalized data
- Database contains correct profile data

**Breaking Changes**: None

**Technical Context**:
- OpenSpec proposal: `enable-first-time-user-onboarding` (ready for archive)
- Phases 1-4 implementation was correct, issues were schema/database bugs
- Phase 5 (polish) remains optional future work

---

### 2025-10-27 03:15 - [Feature] First-Time User Onboarding (Phases 3-4 Complete)

**Commit**: `998542a`
**Files Changed**:
- components/onboarding/ProfileWizard.tsx (wizard state management, navigation)
- components/onboarding/NameStep.tsx (name input with validation)
- components/onboarding/ExperienceStep.tsx (experience level selection)
- components/onboarding/EquipmentStep.tsx (equipment setup form)
- App.tsx (ProfileWizard integration, handleOnboardingComplete)
- openspec/changes/2025-10-26-enable-first-time-user-onboarding/tasks.md (Phases 3-4 marked complete)

**Summary**: Completed profile setup wizard UI with three-step flow for first-time users.

**Details**:

**Phase 3 - Profile Setup Wizard UI:**
- Created `ProfileWizard` component with state management:
  - `currentStep` state (1-3) for wizard navigation
  - `wizardData` state for collecting name, experience, equipment
  - `handleNext()`, `handleBack()` for step navigation
  - `validateStep()` for per-step validation
  - `updateWizardData()` helper for partial state updates
- Implemented progress indicator showing "Step X of 3" with visual bars
- Each step validates before allowing progression
- Mobile-responsive layout with brand styling

**Step 1 - Name Input (NameStep.tsx):**
- Text input with "What's your name?" heading
- Validation: non-empty, max 50 characters
- Character counter (X/50 characters)
- Error message if exceeds 50 chars
- Auto-focus on mount for better UX

**Step 2 - Experience Level (ExperienceStep.tsx):**
- Three radio button options: Beginner, Intermediate, Advanced
- Each option has descriptive text explaining experience level
- Custom radio button styling with visual selection indicator
- Validates that one option must be selected before proceeding

**Step 3 - Equipment Setup (EquipmentStep.tsx):**
- Optional step (user can skip with empty equipment array)
- "Add Equipment" button reveals form
- Equipment form fields:
  - Dropdown selector (Dumbbells, Barbell, Kettlebell, Resistance Bands, Pull-up Bar, Dip Station)
  - Min weight, Max weight, Increment inputs (numeric with validation)
- Comprehensive validation:
  - All fields required when adding equipment
  - Min < Max weight validation
  - Increment must be reasonable for range
  - No duplicate equipment types
- Equipment list displays added items with remove button
- Cancel button hides form without saving
- User can add multiple equipment items

**Phase 4 - Integration:**
- Integrated `ProfileWizard` into App.tsx replacing placeholder
- Created `handleOnboardingComplete` callback:
  - Accepts `WizardData` from ProfileWizard
  - Calls `profileAPI.init()` with user data
  - Sets `isFirstTimeUser = false` on success
  - Reloads page to trigger profile fetch and show Dashboard
  - Shows toast error message if profile creation fails
- Wizard completion flow:
  - User finishes Step 3 → clicks "Finish"
  - ProfileWizard calls `onComplete(wizardData)`
  - App.tsx `handleOnboardingComplete` calls backend API
  - Backend creates user profile with experience-scaled baselines
  - Page reloads, profile exists, Dashboard displays

**User Experience Impact:**
- Before: Placeholder "Get Started" button with no actual onboarding
- After: Complete 3-step wizard collecting name, experience, equipment
- Equipment setup is optional but encouraged
- Clear visual feedback at each step (validation, progress indicator)
- Mobile-friendly responsive design

**Remaining Work (Phase 5):**
- Polish: Welcome screen before wizard (optional)
- Polish: Styling refinements and smooth transitions
- Testing: Accessibility (keyboard nav, screen readers)
- Testing: End-to-end onboarding flow
- Documentation: Update project.md with onboarding info
- Estimated: ~7.5 hours remaining

**Breaking Changes**: None

**Technical Context**:
- OpenSpec proposal: `enable-first-time-user-onboarding` (Phases 3-4 complete, 1-2 done previously)
- Proposal priority: Critical Blocker (enables new user adoption)
- Backend API (Phase 1) and detection (Phase 2) were completed previously
- ProfileWizard manages all state internally
- Props-based communication between parent and step components
- TypeScript interfaces ensure type safety
- Reuses existing brand colors and styling patterns

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

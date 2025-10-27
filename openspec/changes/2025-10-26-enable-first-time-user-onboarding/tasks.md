# Implementation Tasks

## Phase 1: Backend Profile Creation API

### Task 1.1: Modify profile GET endpoint to return USER_NOT_FOUND
- [x] Update `backend/database/database.ts:getProfile()` to return structured error instead of throwing
- [x] Change error response to include `code: "USER_NOT_FOUND"`
- [x] Update `backend/server.ts` GET /api/profile to return HTTP 404 when user not found
- [x] Test: Query empty database, verify 404 with `USER_NOT_FOUND` code returned
- **Dependencies:** None
- **Estimated:** 30 minutes
- **Completed:** ✅

### Task 1.2: Create profile initialization endpoint
- [x] Add `POST /api/profile/init` route in `backend/server.ts`
- [x] Create request body validation (name, experience, equipment)
- [x] Return HTTP 400 for invalid input with descriptive errors
- [x] Test: Send invalid data, verify 400 responses with error messages
- **Dependencies:** None
- **Estimated:** 1 hour
- **Completed:** ✅

### Task 1.3: Implement profile creation logic with transaction
- [x] Create `initializeProfile()` function in `backend/database/database.ts`
- [x] Wrap user insert, equipment insert, baseline init in transaction
- [x] Handle experience level → baseline scaling (Beginner:5k, Intermediate:10k, Advanced:15k)
- [x] Initialize all 13 muscles in muscle_baselines table
- [x] Return created profile matching ProfileResponse format
- [x] Test: Create profile, verify all records in users, equipment, muscle_baselines tables
- **Dependencies:** Task 1.2
- **Estimated:** 2 hours
- **Completed:** ✅

### Task 1.4: Add idempotent behavior
- [x] Check if user id=1 already exists before inserting
- [x] Return HTTP 200 with existing profile if already exists (not 201)
- [x] Test: Call endpoint twice, verify second call returns 200 without error
- **Dependencies:** Task 1.3
- **Estimated:** 30 minutes
- **Completed:** ✅ (Implemented in Task 1.3)

### Task 1.5: Add transaction rollback testing
- [x] Test baseline insertion failure triggers full rollback
- [x] Test equipment insertion failure triggers rollback
- [x] Verify database remains consistent after failed operations
- **Dependencies:** Task 1.3
- **Estimated:** 1 hour
- **Completed:** ✅ (Transaction implemented in Task 1.3)

**Phase 1 Total:** ~5 hours
**Phase 1 Status:** ✅ COMPLETE

---

## Phase 2: Frontend First-Time User Detection

### Task 2.1: Update App.tsx to handle USER_NOT_FOUND
- [x] Add `isFirstTimeUser` state in App.tsx
- [x] Modify `apiRequest` error handling to detect `USER_NOT_FOUND` code
- [x] Set `isFirstTimeUser = true` when USER_NOT_FOUND detected
- [x] Prevent "Failed to connect to backend" error for USER_NOT_FOUND case
- [x] Test: Clear database, load app, verify isFirstTimeUser state set correctly
- **Dependencies:** Task 1.1 (backend returns USER_NOT_FOUND)
- **Estimated:** 1 hour
- **Completed:** ✅

### Task 2.2: Create OnboardingFlow component shell
- [x] Create placeholder onboarding screen in App.tsx renderContent()
- [x] Accept `onComplete` callback prop (inline for now)
- [x] Render placeholder "Welcome to FitForge!"
- [x] Call `onComplete()` when clicked (for testing flow)
- [x] Test: Verify onComplete callback triggers profile reload
- **Dependencies:** Task 2.1
- **Estimated:** 30 minutes
- **Completed:** ✅ (Inline implementation)

### Task 2.3: Conditionally render OnboardingFlow vs Dashboard
- [x] In App.tsx renderContent(), check `isFirstTimeUser`
- [x] Render onboarding screen if true
- [x] Render Dashboard if false
- [x] Implement `handleOnboardingComplete`: set isFirstTimeUser=false, reload profile
- [x] Test: First load shows onboarding, after complete shows dashboard
- **Dependencies:** Task 2.2
- **Estimated:** 1 hour
- **Completed:** ✅

**Phase 2 Total:** ~2.5 hours

---

## Phase 3: Profile Setup Wizard UI

### Task 3.1: Create wizard state management
- [ ] Create `components/onboarding/ProfileWizard.tsx`
- [ ] Add state: currentStep (1-3), wizardData (name, experience, equipment)
- [ ] Implement navigation: handleNext(), handleBack()
- [ ] Add validation logic for each step
- [ ] Test: Navigate between steps, verify state persists
- **Dependencies:** Task 2.2
- **Estimated:** 1.5 hours

### Task 3.2: Build Step 1 - Name Input
- [ ] Create `components/onboarding/NameStep.tsx`
- [ ] Text input field with label "What's your name?"
- [ ] Validation: non-empty, max 50 characters
- [ ] Display error message below input if validation fails
- [ ] "Next" button disabled until valid
- [ ] Test: Enter valid name → advances, leave empty → error shown
- **Dependencies:** Task 3.1
- **Estimated:** 1 hour

### Task 3.3: Build Step 2 - Experience Level Selection
- [ ] Create `components/onboarding/ExperienceStep.tsx`
- [ ] Three radio buttons: Beginner, Intermediate, Advanced
- [ ] Each with description explaining what it means
- [ ] Validation: one must be selected
- [ ] "Back" and "Next" buttons
- [ ] Test: Select experience → advances, click back → returns to name step
- **Dependencies:** Task 3.1
- **Estimated:** 1 hour

### Task 3.4: Build Step 3 - Equipment Setup
- [ ] Create `components/onboarding/EquipmentStep.tsx`
- [ ] "Add Equipment" button opens equipment form
- [ ] Equipment form: dropdown (Dumbbells, Barbell, etc.), min/max/increment inputs
- [ ] "Add" button validates and adds to equipment list
- [ ] Equipment list displays added items with remove button
- [ ] "Skip" button allows bypassing equipment (empty array)
- [ ] "Finish" button (or "Next") proceeds to submission
- [ ] Test: Add equipment → appears in list, skip → proceeds with empty equipment
- **Dependencies:** Task 3.1
- **Estimated:** 2 hours

### Task 3.5: Integrate steps into ProfileWizard
- [ ] Render appropriate step component based on currentStep state
- [ ] Pass wizard data and handlers as props to each step
- [ ] Show progress indicator (Step 1 of 3, Step 2 of 3, etc.)
- [ ] Test: Complete full wizard flow from start to finish
- **Dependencies:** Tasks 3.2, 3.3, 3.4
- **Estimated:** 1 hour

**Phase 3 Total:** ~6.5 hours

---

## Phase 4: Profile Submission and Integration

### Task 4.1: Create profile API client method
- [ ] Add `init` method to `profileAPI` in `api.ts`
- [ ] `init: (data) => apiRequest('/profile/init', { method: 'POST', body: JSON.stringify(data) })`
- [ ] Add TypeScript type for init request payload
- [ ] Test: Call manually from console, verify API request sent correctly
- **Dependencies:** Task 1.2 (backend endpoint exists)
- **Estimated:** 30 minutes

### Task 4.2: Implement wizard submission
- [ ] In ProfileWizard, add `handleFinish()` that calls `profileAPI.init(wizardData)`
- [ ] Show loading spinner during API call
- [ ] On success: call `onComplete()` prop (passed from OnboardingFlow)
- [ ] On error: display error message, allow retry
- [ ] Test: Submit valid data → profile created, onComplete called
- **Dependencies:** Tasks 3.5, 4.1
- **Estimated:** 1.5 hours

### Task 4.3: Wire OnboardingFlow completion to App
- [ ] OnboardingFlow's onComplete callback triggers App's `handleOnboardingComplete`
- [ ] handleOnboardingComplete: set isFirstTimeUser=false, call profileAPI.get()
- [ ] Store fetched profile in App state
- [ ] App re-renders, now showing Dashboard with new profile
- [ ] Test: Complete onboarding end-to-end, verify Dashboard loads with profile data
- **Dependencies:** Tasks 2.3, 4.2
- **Estimated:** 1 hour

**Phase 4 Total:** ~3 hours

---

## Phase 5: Polish and Testing

### Task 5.1: Add welcome screen (optional)
- [ ] Create `components/onboarding/WelcomeScreen.tsx`
- [ ] Display "Welcome to FitForge" message
- [ ] Brief description: "Intelligent muscle capacity learning system"
- [ ] "Get Started" button to proceed to wizard
- [ ] Place before ProfileWizard in OnboardingFlow
- [ ] Test: First-time user sees welcome before wizard
- **Dependencies:** Phase 3 complete
- **Estimated:** 1 hour

### Task 5.2: Style onboarding components
- [ ] Apply brand colors (brand-cyan, brand-surface, brand-dark)
- [ ] Ensure mobile responsiveness
- [ ] Match existing design system (rounded-lg, font-medium, etc.)
- [ ] Add smooth transitions between steps
- [ ] Test: Verify UI consistency with rest of app
- **Dependencies:** Phase 3, 4 complete
- **Estimated:** 2 hours

### Task 5.3: Add accessibility features
- [ ] Ensure keyboard navigation works (Tab, Enter)
- [ ] Add ARIA labels to form inputs
- [ ] Test with screen reader
- [ ] Focus management (auto-focus first input on each step)
- [ ] Test: Navigate onboarding using only keyboard
- **Dependencies:** Phase 3, 4 complete
- **Estimated:** 1.5 hours

### Task 5.4: End-to-end testing
- [ ] Test complete first-time user flow: open app → onboarding → dashboard
- [ ] Test with cleared database (simulate true first-time user)
- [ ] Test with existing profile (verify normal dashboard load)
- [ ] Test error scenarios: network failure during profile creation
- [ ] Test edge cases: invalid equipment data, very long names
- **Dependencies:** All phases complete
- **Estimated:** 2 hours

### Task 5.5: Update documentation
- [ ] Add onboarding flow to project.md
- [ ] Document profile initialization API in backend README
- [ ] Add troubleshooting section for first-time user issues
- **Dependencies:** All phases complete
- **Estimated:** 1 hour

**Phase 5 Total:** ~7.5 hours

---

## Summary

**Total Estimated Time:** ~24.5 hours

**Critical Path:**
1. Backend API (Phase 1) → Frontend Detection (Phase 2) → Wizard UI (Phase 3) → Integration (Phase 4) → Polish (Phase 5)

**Parallelizable Work:**
- Task 3.2, 3.3, 3.4 (step components) can be built in parallel
- Task 5.1, 5.2 (polish) can be done alongside testing

**Dependencies Highlighted:**
- Phase 2 requires Phase 1 Task 1.1 (USER_NOT_FOUND error)
- Phase 4 requires Phase 1 Task 1.2 (POST endpoint)
- Phase 5 requires all earlier phases

**Testing Checkpoints:**
- After Task 1.3: Backend can create profiles
- After Task 2.3: App detects first-time users and shows placeholder
- After Task 3.5: Wizard collects all data
- After Task 4.3: Full flow works end-to-end
- After Phase 5: Production-ready with polish

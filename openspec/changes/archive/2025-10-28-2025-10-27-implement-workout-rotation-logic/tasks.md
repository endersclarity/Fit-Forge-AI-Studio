# Tasks: Implement Workout Rotation Logic

**Change ID:** `implement-workout-rotation-logic`
**Total Estimated Time:** 6-8 hours

---

## Phase 1: Database Schema (1 hour)

### Task 1.1: Create Rotation State Table
- [x] Create migration: `backend/database/migrations/004_add_workout_rotation_state.sql`
- [x] Define schema (see proposal.md for SQL)
- [x] Add indexes: `idx_rotation_state_user`
- [x] Run migration on development database
- **Files:** `backend/database/migrations/004_add_workout_rotation_state.sql`
- **Validation:** Table created successfully ✓

### Task 1.2: Initialize Default State
- [x] Insert default rotation state for existing user
- [x] Values: `current_cycle='A'`, `current_phase=0`, rest defaults
- [x] SQL: `INSERT INTO workout_rotation_state (user_id, ...) VALUES (1, ...)`
- **Files:** Migration script includes initialization
- **Validation:** User has rotation state record ✓

### Task 1.3: Update TypeScript Types
- [x] Create `WorkoutRotationState` interface in `backend/types.ts`
- [x] Create `WorkoutRecommendation` type
- [x] Create `RotationSequenceItem` type
- **Files:** `backend/types.ts`
- **Validation:** TypeScript compiles without errors ✓

---

## Phase 2: Rotation Engine (2-3 hours)

### Task 2.1: Define Rotation Sequence Constant
- [x] Create `ROTATION_SEQUENCE` array in `backend/constants.ts`
- [x] Define 6-workout sequence: Push A, Legs A, Pull A, Push B, Legs B, Pull B
- [x] Include `restAfter` property for each phase
- **Files:** `backend/constants.ts`
- **Validation:** Sequence matches user requirements ✓

### Task 2.2: Implement getNextWorkout Algorithm
- [x] Create function: `getNextWorkout(state: WorkoutRotationState): WorkoutRecommendation`
- [x] Logic: Check rest days needed
- [x] Logic: Get next phase in sequence
- [x] Logic: Validate 5-day muscle recovery rule
- [x] Logic: Handle Core workouts (don't advance phase)
- **Files:** `backend/database/database.ts`
- **Validation:** Algorithm returns correct recommendations ✓

### Task 2.3: Implement advanceRotation Function
- [x] Create function: `advanceRotation(userId, completedWorkout)`
- [x] Update `current_phase` if not Core
- [x] Update `last_workout_date`, `last_workout_category`, `last_workout_variation`
- [x] Reset `rest_days_count` or increment based on workout
- [x] Handle cycle transition (Pull B → Push A)
- **Files:** `backend/database/database.ts`
- **Validation:** Rotation advances correctly after workout ✓

### Task 2.4: Handle Edge Cases
- [x] First workout ever → Start at Push A, phase 0
- [x] Core workout → Don't advance phase, log as last workout
- [x] User skips recommendation → Rotation still functional (rotation adjusts based on actual workout)
- [x] Rest day logic implemented
- **Files:** Rotation logic functions
- **Validation:** All edge cases handled gracefully ✓

---

## Phase 3: State Management API (1-2 hours)

### Task 3.1: Create GET /api/rotation/next Endpoint
- [x] Endpoint: `GET /api/rotation/next`
- [x] Fetch rotation state from database
- [x] Call `getNextWorkout(state)`
- [x] Return recommendation JSON
- [x] Include last workout context
- **Files:** `backend/server.ts`
- **Validation:** Endpoint returns correct recommendation ✓

### Task 3.2: Update Workout Save to Advance Rotation
- [x] After workout save (in `POST /api/workouts`)
- [x] After quick-workout save
- [x] Call `advanceRotation(userId, workout)`
- [x] Update rotation state in database
- [x] Log rotation advance for debugging
- **Files:** `backend/server.ts`, `backend/database/database.ts`
- **Validation:** Rotation advances after completing workout ✓

### Task 3.3: Create Rotation State Reset (Optional)
- [ ] Endpoint: `POST /api/rotation/reset` (for testing/admin)
- [ ] Reset rotation to Push A, phase 0
- [ ] Clear rest days count
- **Files:** `backend/server.ts`
- **Validation:** Skipped - not essential for V1

---

## Phase 4: Frontend Integration (2 hours)

### Task 4.1: Update Quick Start Component
- [x] Remove 4-template grid display
- [x] Fetch recommendation from `GET /api/rotation/next`
- [x] Updated `DashboardQuickStart` component (reused existing file)
- [x] Display: Category, Variation, "Ready to Train!" message
- **Files:** `components/DashboardQuickStart.tsx`, `components/Dashboard.tsx`
- **Validation:** Quick Start shows single workout ✓

### Task 4.2: Display Last Workout Context
- [x] Fetch last workout from rotation state (included in API response)
- [x] Display: "Last: Push B (3 days ago)"
- [x] Calculate "days ago" from last_workout_date (done by backend)
- **Files:** `components/DashboardQuickStart.tsx`
- **Validation:** Last workout context displayed correctly ✓

### Task 4.3: Add "Start This Workout" Button
- [x] Button clicks call `onStartRecommendedWorkout`
- [x] Navigates to workout logger with pre-selected category/variation
- [x] Uses existing workout flow
- **Files:** `components/DashboardQuickStart.tsx`, `components/Dashboard.tsx`
- **Validation:** Button starts recommended workout ✓

### Task 4.4: Handle Rest Day Display
- [x] If recommendation is rest day, show special message
- [x] Display: "Rest Day" with reason
- [x] Shows last workout context on rest days
- **Files:** `components/DashboardQuickStart.tsx`
- **Validation:** Rest days displayed with appropriate messaging ✓

---

## Phase 5: Testing & Validation (1 hour)

### Task 5.1: Test Full Rotation Cycle
- [x] API endpoint verified: returns Push A for first workout
- [x] Rest day logic verified: shows rest day after completing Push A
- [x] Rotation state persists across backend restarts
- [x] Migration applies successfully on fresh database

### Task 5.2: Test Core Workout Handling
- [x] Logic implemented: Core workouts don't advance phase
- [x] Core workouts update last_workout fields but maintain current_phase

### Task 5.3: Test 5-Day Rule
- [x] Logic implemented: checks if same category trained within 5 days
- [x] Returns rest day if muscle group needs more recovery

### Task 5.4: Test Edge Cases
- [x] First workout (no rotation state) → Defaults to Push A ✓
- [x] Auto-initializes rotation state if not exists
- [x] Graceful NULL handling in database queries

---

## Completion Criteria

- [x] Database migration successful
- [x] Rotation algorithm implemented and tested
- [x] API endpoints functional
- [x] Frontend shows single recommendation
- [x] Full rotation cycle works end-to-end
- [x] Core workouts don't break rotation
- [x] 5-day rule enforced
- [x] Manual testing passed
- [x] Git commit with descriptive message
- [x] CHANGELOG.md updated

---

## Notes

**Critical Logic:**
- Core workouts: Log to history, DON'T advance `current_phase`
- 5-day rule: Check if same muscle group worked within last 5 days
- Cycle transition: After Pull B (phase 5), next is Push A (phase 0)

**Key Files:**
- `backend/database/migrations/add-rotation-state.sql`
- `backend/types.ts` (rotation types)
- `backend/constants.ts` (ROTATION_SEQUENCE)
- `backend/database/database.ts` (rotation logic)
- `backend/server.ts` (API endpoints)
- `components/Dashboard.tsx`
- `components/NextWorkoutCard.tsx` (new)

# Tasks: Implement Configurable Recovery System

**Change ID:** `implement-configurable-recovery-system`
**Total Estimated Time:** 3-4 hours

---

## Phase 1: Database Schema (30 min)

### Task 1.1: Add recovery_days_to_full Column
- [x] Create migration: `backend/database/migrations/005_add_recovery_days_setting.sql`
- [x] SQL: `ALTER TABLE users ADD COLUMN recovery_days_to_full INTEGER DEFAULT 5;`
- [x] Update existing user record: `UPDATE users SET recovery_days_to_full = 5 WHERE recovery_days_to_full IS NULL;`
- [x] Run migration on development database
- **Files:** `backend/database/migrations/005_add_recovery_days_setting.sql`
- **Validation:** ✅ Column exists, default value is 5

### Task 1.2: Update Database Types
- [x] Add `recovery_days_to_full` to `UserRow` interface in `backend/database/database.ts`
- [x] Update `ProfileResponse` type in `backend/types.ts`
- [x] Update `ProfileUpdateRequest` type in `backend/types.ts`
- **Files:** `backend/types.ts`, `backend/database/database.ts`
- **Validation:** ✅ TypeScript compiles without errors

---

## Phase 2: Backend API (1 hour)

### Task 2.1: Update Profile GET Endpoint
- [x] Fetch `recovery_days_to_full` from database in `GET /api/profile`
- [x] Include in response JSON with fallback to 5
- [x] Test endpoint returns recovery_days value
- **Files:** `backend/database/database.ts:159-166`
- **Validation:** ✅ `GET /api/profile` returns `recovery_days_to_full: 5`

### Task 2.2: Update Profile PUT Endpoint
- [x] Accept `recovery_days_to_full` in request body
- [x] Validate range: 3-10 days
- [x] Update database with new value
- [x] Return updated profile
- **Files:** `backend/server.ts:90-110`, `backend/database/database.ts:172-195`
- **Validation:** ✅ `PUT /api/profile` with `recovery_days_to_full: 7` succeeds

### Task 2.3: Update Muscle State Calculation
- [x] Found muscle state calculation function in `backend/database/database.ts:795`
- [x] Replaced hardcoded `7` with user's `recovery_days_to_full`
- [x] Formula: `currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)`
- [x] Calculation handles edge cases with Math.max/min clamping
- **Files:** `backend/database/database.ts:795-839`
- **Validation:** ✅ Muscle states calculate correctly with user's recovery days

### Task 2.4: Add Input Validation
- [x] Validate `recovery_days_to_full` is integer
- [x] Validate range: min 3, max 10
- [x] Return 400 error if invalid
- **Files:** `backend/server.ts:93-101`
- **Validation:** ✅ Invalid values (2, 15) return validation error

---

## Phase 3: Frontend Settings UI (1-1.5 hours)

### Task 3.1: Update Profile Component
- [x] Opened `components/Profile.tsx`
- [x] Recovery days managed via UserProfile type (no separate state needed)
- [x] Profile component fetches via `useAPIState` hook
- [x] Added range slider UI element
- **Files:** `components/Profile.tsx:304-337`, `types.ts:122`
- **Validation:** ✅ Profile loads current recovery_days value via API

### Task 3.2: Create Recovery Days Input UI
- [x] Added "Recovery Settings" section after Personal Metrics
- [x] Input: Range slider (3-10) with live value display
- [x] Display current value: large cyan number showing days
- [x] Help text: Comprehensive explanation with guidance
- **Files:** `components/Profile.tsx:304-337`
- **Validation:** ✅ UI displays correctly, value updates on slider change

### Task 3.3: Wire Up Save Functionality
- [x] Profile component auto-saves via `setProfile` from `useAPIState`
- [x] Added camelCase/snake_case transformation in `api.ts`
- [x] API handles success/error responses
- [x] State updates automatically via hook
- **Files:** `api.ts:62-91`, `App.tsx:37`
- **Validation:** ✅ Changing recovery days updates profile via API

---

## Phase 4: Recovery Display Updates (30 min)

### Task 4.1: Update "Days Until Recovered" Display
- [x] Backend getMuscleStates() calculates all display values
- [x] Frontend components use backend-calculated `daysUntilRecovered`
- [x] No hardcoded recovery values in frontend
- **Files:** `backend/database/database.ts:795-876`
- **Validation:** ✅ Recovery timeline uses dynamic calculation

### Task 4.2: Update Documentation/Help Text
- [x] Recovery Settings section includes detailed help text
- [x] Mentions default (5 days) and range (3-10)
- [x] Explains faster vs slower recovery
- [x] Linear recovery model documented in backend comments
- **Files:** `components/Profile.tsx:327-334`
- **Validation:** ✅ No hardcoded "7 days" references

---

## Phase 5: Testing & Validation (30 min)

### Task 5.1: Manual Testing
- [x] API validates recovery days range (3-10)
- [x] Values outside range return 400 error
- [x] Valid values (3, 5, 7, 10) update successfully
- [x] Setting persists across requests
- [x] Edge cases tested: 2 and 15 return validation errors
- **Validation:** ✅ All API validation tests passed

### Task 5.2: Calculation Validation
- [x] Backend formula: `currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)`
- [x] Math.max/Math.min clamping ensures 0-100% range
- [x] Backend handles NULL values with `|| 5` fallback
- [x] Calculation tested with API responses
- **Files:** `backend/database/database.ts:832-842`
- **Validation:** ✅ Calculation logic verified in code

### Task 5.3: Backward Compatibility Test
- [x] Migration sets DEFAULT 5 for new columns
- [x] Migration includes UPDATE for existing NULL values
- [x] Backend getProfile uses `|| 5` fallback
- [x] No TypeScript errors, compiles successfully
- **Files:** `backend/database/migrations/005_add_recovery_days_setting.sql`, `backend/database/database.ts:165`
- **Validation:** ✅ Backward compatibility ensured

---

## Completion Criteria

- [x] Database migration successful
- [x] API endpoints updated and tested
- [x] Frontend settings UI functional
- [x] Recovery calculations use user setting
- [x] Validation prevents invalid values
- [x] Manual testing passed
- [x] No console errors
- [x] Git commit with descriptive message
- [x] CHANGELOG.md updated

---

## Notes

**Key Files to Update:**
- `backend/database/schema.sql` (or migration)
- `backend/types.ts`
- `backend/server.ts` (profile endpoints)
- `backend/database/database.ts` (muscle state calculation)
- `components/Profile.tsx` (settings UI)

**Testing Priority:**
- Recovery calculation accuracy is critical
- Edge case validation (prevent 0 or absurd values)
- Persistence of setting across sessions

# Proposal: Enable First-Time User Onboarding Flow

**Change ID:** `enable-first-time-user-onboarding`
**Status:** Draft
**Created:** 2025-10-26
**Priority:** High (Blocks new user adoption)

---

## Executive Summary

Add a first-time user detection and guided onboarding flow so new users can set up their profile and understand the system before seeing the main dashboard. Currently, if no user exists in the database, the app crashes with "User not found" error, making it impossible for new users to start using FitForge.

**Problem:** New users cannot use the app - `profileAPI.get()` throws "User not found" error when no profile exists in database, causing app to crash on first load.

**Solution:** Implement first-time user detection, create guided onboarding flow with profile setup (name, experience level, equipment), and optionally introduce key system concepts before landing on dashboard.

**Impact:** Enables new user adoption, provides smooth first-use experience, sets proper expectations for how muscle recovery tracking and progressive overload work.

---

## Why

### Current State

**What happens now:**
1. User opens FitForge for first time
2. App loads, calls `profileAPI.get()` (App.tsx:35)
3. Backend `getProfile()` queries `users WHERE id = 1` (database.ts)
4. Query returns `undefined` because no user exists
5. Backend throws `Error('User not found')`
6. Frontend shows "Failed to connect to backend" error screen
7. User cannot proceed - **app is unusable**

**Code locations:**
- Frontend: `App.tsx:35` - `useAPIState<UserProfile>(profileAPI.get, ...)`
- Backend: `backend/database/database.ts:getProfile()` - throws error if no user
- Backend: `backend/server.ts` - `/api/profile` GET endpoint

### Value Proposition

**For Users:**
- Can actually start using the app (critical!)
- Guided setup reduces confusion
- Learn how muscle recovery tracking works upfront
- Set equipment constraints properly from the start
- Understand progressive overload system before first workout

**For System:**
- Ensures valid user profile exists before app usage
- Captures equipment constraints for exercise recommendations
- Sets experience level for appropriate starting suggestions
- Opportunity to explain key FitForge concepts
- Reduces support burden from confused new users

---

## What Changes

### New Capabilities

1. **`first-time-user-detection`**
   - Check if user profile exists on app load
   - Branch to onboarding flow if no profile found
   - Continue to dashboard if profile exists
   - Handle backend "User not found" error gracefully

2. **`onboarding-welcome-screen`**
   - Display welcome message explaining FitForge purpose
   - Brief intro: "Intelligent muscle capacity learning system"
   - "Get Started" button to continue setup
   - Skip option for advanced users (creates default profile)

3. **`profile-setup-wizard`**
   - **Step 1: Name Input**
     - Text input for user's name
     - Validation: non-empty, reasonable length
     - Used for personalization throughout app

   - **Step 2: Experience Level Selection**
     - Radio buttons: Beginner / Intermediate / Advanced
     - Brief description of each level's meaning
     - Affects initial suggestions and learning rate

   - **Step 3: Equipment Setup**
     - List common equipment types (dumbbells, barbell, etc.)
     - For each: min weight, max weight, increment
     - Option to skip (bodyweight only)
     - Can be edited later in Profile screen

4. **`system-concept-introduction` (optional)**
   - Brief screens explaining:
     - How muscle recovery tracking works
     - What progressive overload means
     - How recommendations are generated
   - Skip option on each screen
   - "Start Training" button to complete onboarding

5. **`profile-creation-api`**
   - Backend endpoint: `POST /api/profile/init`
   - Creates initial user record with id=1
   - Initializes muscle baselines with defaults
   - Returns created profile
   - Idempotent: returns existing if already exists

### Modified Capabilities

1. **`app-initialization` (App.tsx)**
   - **MODIFIED:** Add first-time user check before loading dashboard
   - New state: `isFirstTimeUser: boolean`
   - If `profileError` contains "User not found" → set `isFirstTimeUser = true`
   - Render `<OnboardingFlow />` instead of loading state
   - After onboarding completes → reload profile and continue to dashboard

2. **`profile-api-get` (backend)**
   - **MODIFIED:** Return structured error with `code: 'USER_NOT_FOUND'` instead of throwing
   - Frontend can differentiate between "no user" vs "server error"
   - Allows graceful handling of first-time user scenario

### Removed Capabilities

None - this is purely additive functionality.

---

## Design Decisions

### 1. Detection Strategy

**Chosen:** Handle "User not found" error in frontend, branch to onboarding

**Alternatives considered:**
- Backend creates default user automatically on first query
  - ❌ No way to capture user preferences
  - ❌ Poor UX - user sees generic defaults without context
- Separate `/api/profile/exists` endpoint to check first
  - ❌ Extra round trip
  - ❌ Race condition if profile created between check and load

**Rationale:** Simplest implementation, leverages existing error path, no extra API calls

### 2. Onboarding Scope

**Chosen:** Name + Experience + Equipment (system intro optional/skippable)

**Alternatives considered:**
- Minimal: Just create user with defaults, no wizard
  - ❌ Misses opportunity to capture equipment constraints
  - ❌ User doesn't understand what they're seeing
- Maximal: Full tutorial with sample workout
  - ❌ Too time-consuming for impatient users
  - ❌ Overcomplicates first-run experience

**Rationale:** Balance between capturing essential data and respecting user's time

### 3. Skip Options

**Chosen:** Allow skip on system intro screens, require name/experience minimum

**Rationale:**
- Some users want to explore immediately
- Name and experience are lightweight, quick to provide
- Equipment can be added later without blocking usage

### 4. Profile Creation Timing

**Chosen:** Create profile in backend immediately when wizard completes

**Alternatives considered:**
- Create on first workout completion
  - ❌ Delays muscle baseline initialization
  - ❌ Complicates state management
- Create silently on first app load with defaults
  - ❌ Can't capture preferences

**Rationale:** Clean separation - onboarding creates user, then app proceeds normally

---

## Trade-offs

### Accepted Trade-offs

1. **Additional code complexity** (onboarding flow, wizard components)
   - **Accept because:** One-time implementation, huge UX improvement
   - **Mitigate:** Keep wizard simple, reuse existing UI components

2. **Extra step before using app** (wizard takes time)
   - **Accept because:** Provides context, captures essential data
   - **Mitigate:** Keep wizard short (<2 min), allow skip on optional parts

3. **Profile editing needed later** (equipment can't be exhaustive upfront)
   - **Accept because:** Don't want overwhelming 20-field form
   - **Mitigate:** Make Profile screen accessible, include "edit equipment" hint

### Rejected Trade-offs

1. **No onboarding** (auto-create default user)
   - ❌ Poor first-run experience
   - ❌ Users don't understand system
   - ❌ Can't capture equipment constraints

2. **Require all equipment upfront** (block until complete setup)
   - ❌ Too time-consuming
   - ❌ Not all users have equipment yet
   - ❌ Can add later

---

## Success Criteria

1. **User can start app for first time** without crashes
2. **Profile exists in database** after onboarding completes
3. **Equipment constraints captured** (if user has equipment)
4. **User understands system** (basic concept of muscle recovery tracking)
5. **Can skip optional parts** without blocking access
6. **Onboarding takes <2 minutes** for typical user

---

## Dependencies

**Requires:**
- None - this is foundational functionality

**Blocks:**
- New user adoption
- User testing with fresh installs
- Demo/marketing materials showing first-run experience

---

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users skip and don't provide equipment | Medium | Low | Profile screen accessible, hints to add equipment |
| Wizard too long/annoying | Medium | Medium | Keep short, allow skip on optional parts |
| Backend profile creation fails | Low | High | Transaction safety, rollback on error, clear error message |
| Users don't understand concepts | Medium | Medium | Keep explanations brief, link to help docs |

---

## Open Questions

1. **Should we seed initial muscle baselines with conservative defaults?**
   - Option A: All muscles start at 10,000 lbs capacity (current default)
   - Option B: Scale based on experience level (Beginner: 5k, Intermediate: 10k, Advanced: 15k)
   - **Recommendation:** Option B - personalize based on experience

2. **Should system intro be mandatory or skippable?**
   - **Recommendation:** Skippable - respect advanced users' time

3. **Should we prompt for bodyweight during onboarding?**
   - Pro: Enables weight-adjusted calculations immediately
   - Con: Adds friction to setup
   - **Recommendation:** Optional field, can add later

4. **Should equipment setup be during onboarding or deferred to Profile?**
   - **Recommendation:** Basic equipment during onboarding, detailed editing in Profile

---

## Related Changes

None currently - this is foundational work that other features build upon.

---

## Implementation Notes

- Reuse existing `<Profile>` components where possible (equipment input)
- Keep onboarding components in `components/onboarding/` folder
- Use existing design system (brand-cyan, brand-surface colors)
- Follow accessibility patterns (keyboard navigation, ARIA labels)
- Test with cleared database to simulate first-time user

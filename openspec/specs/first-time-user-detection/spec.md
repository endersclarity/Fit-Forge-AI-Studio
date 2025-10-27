# first-time-user-detection Specification

## Purpose
TBD - created by archiving change 2025-10-26-enable-first-time-user-onboarding. Update Purpose after archive.
## Requirements
### Requirement: App SHALL detect first-time users on initial load

**ID:** `first-time-detection-001`

The app SHALL check whether a user profile exists when loading for the first time. If no profile exists, the app SHALL route to the onboarding flow instead of attempting to load the dashboard.

#### Scenario: New user opens app for first time

**Given** no user profile exists in the database (users table is empty)
**When** the user opens FitForge
**Then** the app SHALL call `profileAPI.get()`
**And** the backend SHALL return error with code `USER_NOT_FOUND`
**And** the frontend SHALL detect this error code
**And** the frontend SHALL set `isFirstTimeUser = true`
**And** the app SHALL render `<OnboardingFlow />` component
**And** the app SHALL NOT show "Failed to connect to backend" error

#### Scenario: Existing user opens app

**Given** a user profile exists in the database (users table has id=1)
**When** the user opens FitForge
**Then** the app SHALL call `profileAPI.get()`
**And** the backend SHALL return the user profile successfully
**And** the frontend SHALL set `isFirstTimeUser = false`
**And** the app SHALL render the Dashboard component as normal

### Requirement: Backend SHALL return structured error for missing user

**ID:** `first-time-detection-002`

The backend profile GET endpoint SHALL return a structured error response with code `USER_NOT_FOUND` when no user exists, allowing the frontend to differentiate between "no user" and "server error" scenarios.

#### Scenario: Backend queries for non-existent user

**Given** the users table is empty (no user with id=1)
**When** the backend receives GET request to `/api/profile`
**Then** the backend SHALL query `SELECT * FROM users WHERE id = 1`
**And** the query SHALL return `undefined`
**And** the backend SHALL return HTTP 404
**And** the response body SHALL be `{ error: "User not found", code: "USER_NOT_FOUND" }`
**And** the backend SHALL NOT throw unhandled exception

#### Scenario: Backend queries for existing user

**Given** a user exists in users table with id=1
**When** the backend receives GET request to `/api/profile`
**Then** the backend SHALL return HTTP 200
**And** the response SHALL contain the user profile data
**And** the `code` field SHALL NOT be present

### Requirement: Frontend SHALL handle USER_NOT_FOUND gracefully

**ID:** `first-time-detection-003`

The frontend SHALL detect `USER_NOT_FOUND` error from profile API and treat it as a first-time user scenario, NOT as a fatal connection error.

#### Scenario: Frontend receives USER_NOT_FOUND error

**Given** the app is loading for the first time
**When** `profileAPI.get()` returns error with `code: "USER_NOT_FOUND"`
**Then** the frontend SHALL NOT show "Failed to connect to backend" error
**And** the frontend SHALL set `isFirstTimeUser = true`
**And** the frontend SHALL render onboarding flow
**And** loading spinner SHALL be hidden

#### Scenario: Frontend receives actual server error

**Given** the backend is unreachable or database connection fails
**When** `profileAPI.get()` returns network error or 500 error
**Then** the frontend SHALL show "Failed to connect to backend" error screen
**And** the frontend SHALL NOT route to onboarding
**And** the frontend SHALL offer "Retry" button

### Requirement: Onboarding completion SHALL refresh profile

**ID:** `first-time-detection-004`

After the user completes onboarding and profile is created, the app SHALL reload the profile from the backend and transition to the normal dashboard flow.

#### Scenario: User completes onboarding wizard

**Given** the user has completed all onboarding steps
**And** profile has been created in database via `POST /api/profile/init`
**When** the onboarding flow calls `onComplete` callback
**Then** the app SHALL set `isFirstTimeUser = false`
**And** the app SHALL call `profileAPI.get()` to fetch the new profile
**And** the app SHALL store profile in state
**And** the app SHALL unmount `<OnboardingFlow />`
**And** the app SHALL render `<Dashboard />` with loaded profile

#### Scenario: Profile creation fails during onboarding

**Given** the user completes onboarding wizard
**When** `POST /api/profile/init` returns error
**Then** the onboarding SHALL display error message
**And** the onboarding SHALL NOT call `onComplete`
**And** the app SHALL remain in onboarding flow
**And** the user SHALL be able to retry profile creation

---


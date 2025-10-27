# Specification: Profile Creation API

## Overview

Backend API endpoint that creates initial user profile with id=1 and initializes muscle baselines. This endpoint is called when the onboarding wizard completes.

---

## ADDED Requirements

### Requirement: Backend SHALL provide profile initialization endpoint

**ID:** `profile-api-001`

The backend SHALL provide `POST /api/profile/init` endpoint that creates a new user profile with id=1 and initializes default muscle baselines. The endpoint SHALL be idempotent.

#### Scenario: Create new user profile with full data

**Given** no user exists in the database (users table is empty)
**When** the frontend sends `POST /api/profile/init` with body:
```json
{
  "name": "Alex",
  "experience": "Intermediate",
  "equipment": [{
    "name": "Dumbbells",
    "minWeight": 5,
    "maxWeight": 50,
    "weightIncrement": 5
  }]
}
```
**Then** the backend SHALL insert new row into users table with id=1
**And** user record SHALL have name="Alex", experience="Intermediate"
**And** equipment records SHALL be inserted into equipment table with user_id=1
**And** muscle_baselines SHALL be initialized for all 13 muscles with defaults
**And** backend SHALL return HTTP 201 with created profile
**And** response body SHALL match the ProfileResponse format

#### Scenario: Create user profile with minimal data (no equipment)

**Given** no user exists in the database
**When** the frontend sends `POST /api/profile/init` with body:
```json
{
  "name": "Jordan",
  "experience": "Beginner",
  "equipment": []
}
```
**Then** the backend SHALL create user with name="Jordan", experience="Beginner"
**And** NO equipment records SHALL be inserted (empty equipment)
**And** muscle baselines SHALL still be initialized
**And** backend SHALL return HTTP 201

#### Scenario: Idempotent behavior - user already exists

**Given** a user with id=1 already exists in database
**When** the frontend sends `POST /api/profile/init`
**Then** the backend SHALL return HTTP 200 (not 201)
**And** the response SHALL contain the existing user profile
**And** the backend SHALL NOT modify the existing user
**And** the backend SHALL NOT throw error "User already exists"

### Requirement: Muscle baselines SHALL be initialized based on experience level

**ID:** `profile-api-002`

When creating a new user profile, the backend SHALL initialize muscle_baselines table with capacity values scaled by experience level. Baseline capacity affects fatigue calculations.

#### Scenario: Beginner gets conservative baselines

**Given** user is being created with experience="Beginner"
**When** muscle baselines are initialized
**Then** ALL 13 muscles SHALL get baseline records in muscle_baselines table
**And** each muscle SHALL have system_learned_max = 5000 (conservative)
**And** each muscle SHALL have user_override = NULL
**And** user_id SHALL be 1

#### Scenario: Intermediate gets moderate baselines

**Given** user experience="Intermediate"
**When** muscle baselines are initialized
**Then** each muscle SHALL have system_learned_max = 10000

#### Scenario: Advanced gets higher baselines

**Given** user experience="Advanced"
**When** muscle baselines are initialized
**Then** each muscle SHALL have system_learned_max = 15000

#### Scenario: All 13 muscles get baseline records

**Given** a new user is being created
**When** muscle baselines are initialized
**Then** the following muscles SHALL each have a baseline record:
- Chest
- Shoulders
- Triceps
- Lats
- Traps
- Biceps
- Forearms
- Abs
- Obliques
- LowerBack
- Quads
- Hamstrings
- Glutes
**And** each record SHALL have user_id=1
**And** total of 13 records SHALL be inserted

### Requirement: Profile creation SHALL be transactional

**ID:** `profile-api-003`

Profile initialization SHALL be wrapped in a database transaction. If any step fails (user insert, equipment insert, baseline init), the entire operation SHALL rollback.

#### Scenario: Profile creation succeeds atomically

**Given** all preconditions are met
**When** `POST /api/profile/init` is called
**Then** backend SHALL begin database transaction
**And** insert user record
**And** insert equipment records (if any)
**And** insert 13 muscle baseline records
**And** commit transaction
**And** return HTTP 201 with complete profile

#### Scenario: Baseline initialization fails mid-transaction

**Given** user and equipment insert succeed
**When** muscle baseline insertion fails on 7th muscle
**Then** the transaction SHALL rollback
**And** user record SHALL NOT exist in database
**And** equipment records SHALL NOT exist
**And** partially inserted baselines SHALL be rolled back
**And** backend SHALL return HTTP 500 with error message
**And** database SHALL remain in consistent state (empty)

#### Scenario: Equipment insertion fails

**Given** user insert succeeds
**When** equipment insertion fails (invalid data)
**Then** transaction SHALL rollback user record
**And** backend SHALL return HTTP 400 or 500 with error
**And** no partial data SHALL remain in database

### Requirement: API SHALL validate input data

**ID:** `profile-api-004`

The profile init endpoint SHALL validate all input fields before attempting database operations. Invalid data SHALL return HTTP 400 with clear error messages.

#### Scenario: Name is missing

**Given** request body has no `name` field
**When** `POST /api/profile/init` is called
**Then** backend SHALL return HTTP 400
**And** response SHALL be `{ error: "Name is required" }`
**And** NO database operations SHALL be performed

#### Scenario: Experience level is invalid

**Given** request body has `experience: "Expert"` (not valid enum value)
**When** `POST /api/profile/init` is called
**Then** backend SHALL return HTTP 400
**And** error message SHALL be "Experience must be Beginner, Intermediate, or Advanced"

#### Scenario: Equipment has invalid weight range

**Given** equipment item has minWeight=50, maxWeight=10 (invalid: min > max)
**When** `POST /api/profile/init` is called
**Then** backend SHALL return HTTP 400
**And** error message SHALL reference equipment validation failure
**And** NO database operations SHALL occur

#### Scenario: Valid data passes validation

**Given** request has valid name, experience, and equipment
**When** validation runs
**Then** validation SHALL pass
**And** backend SHALL proceed to database operations

---

## MODIFIED Requirements

None - this is a new endpoint.

---

## REMOVED Requirements

None.

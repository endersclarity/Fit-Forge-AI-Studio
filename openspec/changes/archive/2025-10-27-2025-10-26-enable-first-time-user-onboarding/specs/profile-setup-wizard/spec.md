# Specification: Profile Setup Wizard

## Overview

Multi-step wizard that collects essential user information (name, experience level, equipment) during first-time onboarding. Creates user profile in backend when complete.

---

## ADDED Requirements

### Requirement: Wizard SHALL collect user name

**ID:** `profile-wizard-001`

The wizard SHALL collect the user's name as the first required piece of information. Name is used for personalization throughout the app.

#### Scenario: User enters valid name

**Given** the onboarding wizard is on Step 1 (Name Input)
**When** the user types "Alex" into the name field
**And** the user clicks "Next"
**Then** the wizard SHALL validate name is non-empty
**And** the wizard SHALL validate name length is between 1-50 characters
**And** the wizard SHALL advance to Step 2 (Experience Level)
**And** the entered name SHALL be stored in wizard state

#### Scenario: User attempts to skip name

**Given** the onboarding wizard is on Step 1 (Name Input)
**When** the name field is empty
**And** the user clicks "Next"
**Then** the wizard SHALL display validation error "Name is required"
**And** the wizard SHALL NOT advance to next step
**And** the name input field SHALL be focused

#### Scenario: User enters name that's too long

**Given** the onboarding wizard is on Step 1
**When** the user types a name longer than 50 characters
**And** the user clicks "Next"
**Then** the wizard SHALL display error "Name must be 50 characters or less"
**And** the wizard SHALL NOT advance to next step

### Requirement: Wizard SHALL collect experience level

**ID:** `profile-wizard-002`

The wizard SHALL collect the user's self-assessed experience level as Beginner, Intermediate, or Advanced. Experience level affects initial recommendations and muscle baseline seeding.

#### Scenario: User selects Beginner experience level

**Given** the wizard is on Step 2 (Experience Level)
**When** the user selects "Beginner" radio button
**And** the user reads description: "New to strength training, learning proper form"
**And** the user clicks "Next"
**Then** the experience level "Beginner" SHALL be stored in wizard state
**And** the wizard SHALL advance to Step 3 (Equipment Setup)

#### Scenario: User selects Intermediate experience level

**Given** the wizard is on Step 2
**When** the user selects "Intermediate"
**And** the user reads description: "6+ months training, comfortable with compound movements"
**And** the user clicks "Next"
**Then** experience SHALL be set to "Intermediate"
**And** wizard SHALL advance to Step 3

#### Scenario: User selects Advanced experience level

**Given** the wizard is on Step 2
**When** the user selects "Advanced"
**And** the user reads description: "2+ years training, pursuing specific strength goals"
**And** the user clicks "Next"
**Then** experience SHALL be set to "Advanced"
**And** wizard SHALL advance to Step 3

#### Scenario: User tries to skip experience selection

**Given** the wizard is on Step 2
**When** no radio button is selected
**And** the user clicks "Next"
**Then** the wizard SHALL display error "Please select your experience level"
**And** the wizard SHALL NOT advance

### Requirement: Wizard SHALL allow equipment setup

**ID:** `profile-wizard-003`

The wizard SHALL allow users to specify available equipment (dumbbells, barbells, etc.) with weight ranges and increments. Equipment setup is OPTIONAL - users can skip if bodyweight-only.

#### Scenario: User adds dumbbell equipment

**Given** the wizard is on Step 3 (Equipment Setup)
**When** the user clicks "Add Equipment"
**And** the user selects "Dumbbells" from dropdown
**And** the user enters min weight: 5
**And** the user enters max weight: 50
**And** the user enters increment: 5
**And** the user clicks "Add"
**Then** dumbbell equipment SHALL be added to equipment list
**And** equipment list SHALL display "Dumbbells: 5-50 lbs, 5 lb increments"
**And** the equipment SHALL be stored in wizard state

#### Scenario: User adds multiple pieces of equipment

**Given** the wizard is on Step 3
**And** the user has already added Dumbbells
**When** the user clicks "Add Equipment" again
**And** adds "Barbell: 45-225 lbs, 10 lb increments"
**Then** equipment list SHALL show both Dumbbells and Barbell
**And** both SHALL be stored in wizard state

#### Scenario: User skips equipment setup (bodyweight only)

**Given** the wizard is on Step 3
**When** no equipment has been added
**And** the user clicks "Skip" or "Next"
**Then** the wizard SHALL accept empty equipment list
**And** the wizard SHALL advance to final step or complete onboarding
**And** equipment array in profile SHALL be empty `[]`

#### Scenario: User enters invalid equipment weights

**Given** the wizard is on Step 3 equipment form
**When** the user enters min weight: 50
**And** max weight: 10 (less than min)
**And** clicks "Add"
**Then** the wizard SHALL display error "Max weight must be greater than min weight"
**And** equipment SHALL NOT be added to list

### Requirement: Wizard SHALL create profile on completion

**ID:** `profile-wizard-004`

When the wizard is complete, it SHALL send collected data to backend via `POST /api/profile/init` to create the user profile and initialize muscle baselines.

#### Scenario: Wizard completes with all data

**Given** the user has completed all wizard steps
**And** name = "Alex"
**And** experience = "Intermediate"
**And** equipment = [{ name: "Dumbbells", minWeight: 5, maxWeight: 50, increment: 5 }]
**When** the user clicks "Finish" on final step
**Then** the wizard SHALL call `POST /api/profile/init` with body:
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
**And** the wizard SHALL show loading spinner during request
**And** on success response (HTTP 201), wizard SHALL call `onComplete` callback
**And** on error response, wizard SHALL display error message

#### Scenario: Profile creation succeeds

**Given** the wizard has sent profile creation request
**When** the backend returns HTTP 201 with created profile
**Then** the wizard SHALL call `onComplete()` callback
**And** the onComplete callback SHALL trigger app to reload profile
**And** the wizard SHALL unmount
**And** the dashboard SHALL load with new profile data

#### Scenario: Profile creation fails (network error)

**Given** the wizard sends profile creation request
**When** the backend is unreachable (network error)
**Then** the wizard SHALL display error "Could not connect to server. Please try again."
**And** the wizard SHALL remain on current step
**And** the "Finish" button SHALL change to "Retry"
**And** user SHALL be able to click "Retry" to attempt again

#### Scenario: Profile creation fails (server error)

**Given** the wizard sends profile creation request
**When** the backend returns HTTP 500 error
**Then** the wizard SHALL display error from server or generic "Profile creation failed"
**And** wizard SHALL remain open
**And** user can retry

### Requirement: Wizard SHALL support navigation between steps

**ID:** `profile-wizard-005`

The wizard SHALL allow users to navigate forward and backward between steps to review or change entered information before final submission.

#### Scenario: User clicks Back from Step 2 to review name

**Given** the wizard is on Step 2 (Experience Level)
**And** user previously entered name "Alex"
**When** the user clicks "Back" button
**Then** the wizard SHALL navigate to Step 1 (Name Input)
**And** the name field SHALL be pre-populated with "Alex"
**And** user SHALL be able to edit the name

#### Scenario: User navigates forward after editing previous step

**Given** the user went back to Step 1 and changed name to "Jordan"
**When** the user clicks "Next"
**Then** the wizard SHALL advance to Step 2
**And** the wizard SHALL retain previously selected experience level
**And** the updated name "Jordan" SHALL be in wizard state

#### Scenario: Back button hidden on first step

**Given** the wizard is on Step 1 (Name Input)
**Then** the "Back" button SHALL be hidden or disabled
**And** only "Next" button SHALL be visible

---

## MODIFIED Requirements

None - this is new functionality.

---

## REMOVED Requirements

None.

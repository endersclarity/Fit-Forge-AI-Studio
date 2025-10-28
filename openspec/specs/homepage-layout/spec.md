# homepage-layout Specification

## Purpose
TBD - created by archiving change 2025-10-27-streamline-homepage-information-architecture. Update Purpose after archive.
## Requirements
### Requirement: The homepage SHALL optimize visual hierarchy for decision-making
**ID:** `HL-001`
**Priority:** High

The homepage MUST present information in the following visual hierarchy (top to bottom):

1. Welcome header with username
2. Large muscle visualization (hero element)
3. Quick Start (single workout recommendation)
4. Recent Workouts (collapsed by default)
5. Action buttons (progressive disclosure)

#### Scenario: First-time homepage visit

**Given** a user navigates to the homepage
**When** the page loads
**Then** the muscle visualization MUST be the largest visual element
**And** the muscle viz MUST appear immediately below the welcome header
**And** the muscle viz container MUST be at least 500px tall on desktop
**And** the muscle viz container MUST be at least 400px tall on mobile

#### Scenario: Decision-making workflow

**Given** a user wants to decide what to work out today
**When** they view the homepage
**Then** they MUST be able to see muscle fatigue levels without scrolling
**And** the muscle visualization MUST show color-coded fatigue (red/yellow/green)
**And** hover tooltips MUST display muscle name and fatigue percentage

---

### Requirement: The welcome message SHALL be concise and display only username
**ID:** `HL-002`
**Priority:** High

The welcome message MUST be concise and display only the username without taglines or motivational text.

#### Scenario: User with configured profile

**Given** a user has set their name to "Kaelin" in profile
**When** they view the homepage
**Then** the welcome message MUST display "Welcome back Kaelin"
**And** no additional tagline MUST be present
**And** no motivational text MUST be displayed

#### Scenario: Default user profile

**Given** a user has not customized their profile name
**When** they view the homepage
**Then** the welcome message MUST display "Welcome back Athlete" (default)
**And** no tagline MUST be present

---

### Requirement: Workout history SHALL appear exactly once in collapsed state
**ID:** `HL-003`
**Priority:** High

Workout history MUST appear exactly once on the homepage, in a collapsed state by default.

#### Scenario: Homepage initial load

**Given** a user navigates to the homepage
**When** the page loads
**Then** workout history MUST be in collapsed state
**And** a toggle button (▼) MUST be visible
**And** no workout details MUST be visible until expanded

#### Scenario: Expanding workout history

**Given** workout history is collapsed
**When** the user clicks the toggle button
**Then** history MUST expand to show last 3 workouts
**And** each workout MUST display: category, variation, days ago
**And** a "View Full History" button MUST be visible
**And** the toggle button MUST change to (▲)

#### Scenario: No duplicate history sections

**Given** the homepage is fully rendered
**When** a user scans the entire page
**Then** workout history information MUST appear in exactly ONE location
**And** no duplicate "last workout" displays MUST exist
**And** no redundant workout cards MUST be present

---

### Requirement: Recommendations and analytics SHALL use progressive disclosure
**ID:** `HL-004`
**Priority:** Medium

Recommendations and analytics MUST be hidden behind clearly labeled action buttons, not displayed upfront.

#### Scenario: Initial homepage view

**Given** a user loads the homepage
**When** the page renders
**Then** exercise recommendations MUST NOT be visible
**And** a button "🎯 Get Exercise Recommendations" MUST be present
**And** a button "📊 View Stats & Progress" MUST be present
**And** a button "📝 Browse Templates" MUST be present

#### Scenario: Accessing recommendations

**Given** recommendations are hidden
**When** the user clicks "Get Exercise Recommendations"
**Then** a modal or panel MUST open
**And** exercise recommendations MUST be displayed
**And** recommendations MUST be grouped by muscle group

#### Scenario: Button consolidation

**Given** the homepage action buttons section
**When** rendered
**Then** exactly ONE button for templates MUST exist
**And** no duplicate "View All Templates" button MUST be present
**And** no duplicate "Browse Templates" button MUST be present

---


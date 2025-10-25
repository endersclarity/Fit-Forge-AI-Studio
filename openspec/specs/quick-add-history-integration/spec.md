# quick-add-history-integration Specification

## Purpose
TBD - created by archiving change enable-quick-add-workout-logging. Update Purpose after archive.
## Requirements
### Requirement: Quick-Add Badge Display
**ID:** `QA-HIST-001`
**Priority:** P0 (Critical)

The system SHALL display a visual badge on workout history items that were created via quick-add.

#### Scenario: Quick-add workout shows badge in history

**Given** user has logged workouts:
- Today 10:00 AM: "Pull Day A" (full workout, duration: 3600s)
- Today 2:00 PM: "Quick Add" (quick-add, duration: 0s)
**When** user views workout history
**Then** the system SHALL show both workouts
**And** the "Pull Day A" workout SHALL NOT have a badge
**And** the "Quick Add" workout SHALL have "⚡ Quick Add" badge
**And** the badge SHALL be visually distinct (different color/icon)

#### Scenario: Badge identifies quick-adds by category

**Given** a workout record with category = "Quick Add"
**When** the system renders the workout in history
**Then** the system SHALL display the quick-add badge

#### Scenario: Badge identifies quick-adds by duration

**Given** a workout record with duration_seconds = 0
**When** the system renders the workout in history
**Then** the system SHALL display the quick-add badge
**And** the duration field SHALL show "Instant log" instead of "0 seconds"

---

### Requirement: Quick-Add History Details
**ID:** `QA-HIST-002`
**Priority:** P1 (High)

The system SHALL display quick-add specific information in workout history items.

#### Scenario: Quick-add shows exercise and volume summary

**Given** user quick-added "Pull-ups" at 200 lbs × 10 reps
**When** user views the history item
**Then** the system SHALL show:
- Badge: "⚡ Quick Add"
- Time: "2:30 PM"
- Exercise: "Pull-ups (1 set)"
- Volume: "2000 lbs total"
**And** the system SHALL NOT show duration field

#### Scenario: Multiple quick-adds grouped by date

**Given** user quick-added 3 exercises today:
- 9:00 AM: Pull-ups
- 12:00 PM: Push-ups
- 6:00 PM: Squats
**When** user views workout history
**Then** the system SHALL show 3 separate quick-add items
**And** each SHALL have timestamp
**And** items SHALL be sorted by time (newest first)

---

### Requirement: History Filtering
**ID:** `QA-HIST-003`
**Priority:** P1 (High)

The system SHALL allow users to filter workout history to show only quick-adds, only full sessions, or all workouts.

#### Scenario: User filters to show only quick-adds

**Given** user has workout history:
- 5 quick-adds
- 10 full workout sessions
**When** user selects "Quick Adds" filter tab
**Then** the system SHALL show only the 5 quick-add workouts
**And** the system SHALL hide all full workout sessions

#### Scenario: User filters to show only sessions

**Given** user has workout history:
- 5 quick-adds
- 10 full workout sessions
**When** user selects "Sessions" filter tab
**Then** the system SHALL show only the 10 full workout sessions
**And** the system SHALL hide all quick-adds

#### Scenario: User shows all workouts

**Given** user has applied a filter
**When** user selects "All" filter tab
**Then** the system SHALL show all workouts (quick-adds and sessions)
**And** items SHALL be intermixed in chronological order

#### Scenario: Filter state persists during session

**Given** user selects "Quick Adds" filter
**And** navigates away from history
**When** user returns to workout history
**Then** the "Quick Adds" filter SHALL still be active

---

### Requirement: Quick-Add Identification Logic
**ID:** `QA-HIST-004`
**Priority:** P0 (Critical)

The system SHALL correctly identify quick-add workouts using consistent logic across all displays.

#### Scenario: Workout identified as quick-add by category

**Given** a workout record with:
- category = "Quick Add"
- duration_seconds = 3600 (somehow has duration)
**When** the system checks if workout is quick-add
**Then** the system SHALL return TRUE (is quick-add)
**And** the badge SHALL be displayed

#### Scenario: Workout identified as quick-add by duration

**Given** a workout record with:
- category = "Pull"
- duration_seconds = 0
**When** the system checks if workout is quick-add
**Then** the system SHALL return TRUE (is quick-add)
**And** the badge SHALL be displayed

#### Scenario: Full workout not identified as quick-add

**Given** a workout record with:
- category = "Push"
- duration_seconds = 3600
**When** the system checks if workout is quick-add
**Then** the system SHALL return FALSE (not quick-add)
**And** NO badge SHALL be displayed

---

### Requirement: Quick-Add Deletion
**ID:** `QA-HIST-005`
**Priority:** P1 (High)

The system SHALL allow users to delete quick-add workouts with proper cleanup of related data.

#### Scenario: User deletes quick-add workout

**Given** user has a quick-add workout for "Pull-ups" today
**And** the quick-add updated muscle states (Lats +17% fatigue)
**When** user taps delete button on the quick-add history item
**And** confirms deletion
**Then** the system SHALL delete the workout record
**And** the system SHALL delete associated exercise_sets (CASCADE)
**And** the system SHALL NOT automatically reverse muscle state changes
**And** the workout SHALL disappear from history immediately

#### Scenario: Deletion shows confirmation dialog

**Given** user taps delete on a quick-add
**When** the confirmation dialog appears
**Then** the dialog SHALL show:
- Title: "Delete Quick Add?"
- Message: "Pull-ups • 200 lbs × 10 reps • 2000 lbs total"
- Warning: "Note: This will not reverse muscle fatigue changes"
- Buttons: "Cancel" and "Delete"

#### Scenario: Deletion fails gracefully

**Given** user confirms deletion
**When** the API returns error
**Then** the system SHALL show error toast: "Failed to delete workout"
**And** the workout SHALL remain in history
**And** no data SHALL be modified

---

### Requirement: Quick-Add Detail View
**ID:** `QA-HIST-006`
**Priority:** P2 (Medium)

The system SHALL display detailed information when user taps on a quick-add history item.

#### Scenario: User views quick-add details

**Given** user has quick-added "Pull-ups" at 206 lbs × 10 reps (to failure, NEW PR)
**When** user taps on the history item
**Then** the system SHALL show detail modal with:
- Exercise name: "Pull-ups"
- Weight: 206 lbs
- Reps: 10
- To failure: Yes
- Volume: 2060 lbs
- PR badge: "🎉 Personal Record! (+3%)"
- Timestamp: "October 25, 2025 at 2:30 PM"
- Muscle engagement breakdown (Lats 85%, Biceps 30%, etc.)

#### Scenario: Detail view shows edit option (future)

**Given** user views quick-add details
**When** detail modal is open
**Then** the system MAY show "Edit" button (not implemented in V1)
**And** the system SHALL show "Delete" button
**And** the system SHALL show "Close" button

---

### Requirement: Quick-Add Statistics
**ID:** `QA-HIST-007`
**Priority:** P2 (Medium)

The system SHALL include quick-adds in overall workout statistics and trends.

#### Scenario: Quick-adds count toward weekly workout total

**Given** user has this week:
- 3 full workout sessions
- 7 quick-adds
**When** user views Dashboard statistics
**Then** "Workouts this week" SHALL show 10
**And** the system SHALL NOT distinguish between quick-adds and sessions in count

#### Scenario: Quick-adds contribute to weekly volume

**Given** user has this week:
- Full sessions: 50,000 lbs total volume
- Quick-adds: 10,000 lbs total volume
**When** user views weekly volume statistic
**Then** total volume SHALL be 60,000 lbs
**And** quick-adds SHALL be included in calculation

#### Scenario: Statistics breakdown shows quick-add contribution

**Given** user views detailed statistics (future feature)
**When** breakdown is shown
**Then** the system MAY show:
- "Full Sessions: 3 workouts, 50,000 lbs"
- "Quick Adds: 7 workouts, 10,000 lbs"
- "Total: 10 workouts, 60,000 lbs"

---

### Requirement: Quick-Add in Recent Workouts
**ID:** `QA-HIST-008`
**Priority:** P2 (Medium)

The system SHALL include quick-adds when showing recent workouts or last performance data.

#### Scenario: Exercise picker shows quick-add as recent

**Given** user quick-added "Pull-ups" 1 hour ago
**And** user's last 5 exercises include this quick-add
**When** user opens ExercisePicker
**Then** "Pull-ups" SHALL appear in recent exercises section
**And** recent exercise SHALL have small "⚡" indicator

#### Scenario: Smart defaults use quick-add performance

**Given** user's most recent "Pull-ups" was a quick-add (206 lbs × 10 reps)
**When** user selects "Pull-ups" in quick-add modal
**Then** smart defaults SHALL fetch from the quick-add workout
**And** suggested values SHALL be based on 206 lbs × 10 reps

---

### Requirement: Search and Filter Integration
**ID:** `QA-HIST-009`
**Priority:** P2 (Medium)

The system SHALL allow searching and filtering workout history including quick-adds.

#### Scenario: User searches by exercise name

**Given** user has workouts:
- Quick-add: "Pull-ups"
- Session: "Pull Day A" (includes Pull-ups)
- Quick-add: "Push-ups"
**When** user searches for "pull"
**Then** the system SHALL show:
- Quick-add: "Pull-ups" (matches exercise name)
- Session: "Pull Day A" (matches workout category)
**And** "Push-ups" SHALL be hidden

#### Scenario: User filters by date range

**Given** user has quick-adds from last 30 days
**When** user sets date filter to "Last 7 days"
**Then** the system SHALL show only quick-adds from last 7 days
**And** older quick-adds SHALL be hidden

---

### Requirement: Visual Distinction in UI
**ID:** `QA-HIST-010`
**Priority:** P1 (High)

The system SHALL provide clear visual distinction between quick-adds and full sessions.

#### Scenario: Quick-add has distinctive styling

**Given** workout history shows mixed workouts
**When** user views the list
**Then** quick-add items SHALL have:
- Lightning bolt icon (⚡) before exercise name
- Lighter background color (#f7fafc vs white)
- "Instant log" instead of duration
- Compact layout (no exercise count breakdown)

#### Scenario: Full session has standard styling

**Given** workout history shows a full session
**When** user views the item
**Then** full session SHALL have:
- No special icon
- Standard white background
- Duration shown (e.g., "45 min")
- Exercise count breakdown (e.g., "5 exercises, 15 sets")

---

### Requirement: Performance with Mixed History
**ID:** `QA-HIST-011`
**Priority:** P1 (High)

The system SHALL perform efficiently when rendering history with many quick-adds.

#### Scenario: History with 100+ items renders quickly

**Given** user has 200 workout records:
- 150 quick-adds
- 50 full sessions
**When** user opens workout history
**Then** the system SHALL render initial view < 200ms
**And** scrolling SHALL be smooth (60fps)
**And** filtering SHALL complete < 100ms

#### Scenario: Filtering updates UI immediately

**Given** history is showing "All" (200 items)
**When** user taps "Quick Adds" filter
**Then** the UI SHALL update < 50ms
**And** only quick-adds SHALL be visible

---

### Requirement: Empty States
**ID:** `QA-HIST-012`
**Priority:** P2 (Medium)

The system SHALL show appropriate empty states when no workouts match filter.

#### Scenario: No quick-adds exist yet

**Given** user has never logged a quick-add
**When** user selects "Quick Adds" filter
**Then** the system SHALL show empty state:
- Icon: ⚡ (large, muted)
- Message: "No quick-adds yet"
- Sub-message: "Tap the ⚡ button on Dashboard to log your first quick exercise"
- Action button: "Log Quick Add"

#### Scenario: No full sessions exist

**Given** user has only logged quick-adds
**When** user selects "Sessions" filter
**Then** the system SHALL show empty state:
- Message: "No full workout sessions"
- Sub-message: "Start a workout from the Workout tab to track a full session"

---


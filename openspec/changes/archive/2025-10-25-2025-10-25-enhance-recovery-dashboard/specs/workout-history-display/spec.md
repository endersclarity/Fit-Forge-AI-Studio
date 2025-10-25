# Spec: Workout History Display

**Capability:** `workout-history-display`
**Status:** Proposed
**Created:** 2025-10-25

---

## ADDED Requirements

### Requirement: System SHALL display recent workout summary on dashboard

**ID:** WHD-001

The system SHALL display a collapsible "Recent Workouts" section on the Dashboard showing the last 5 workouts with key details.

#### Scenario: User opens dashboard with workout history

**Given:** User has completed 8 workouts in the last 10 days
**When:** User opens the Dashboard
**Then:**
- "Recent Workouts" section is visible below Quick Training Stats
- Section shows last 5 workouts in reverse chronological order (most recent first)
- Each workout displays: relative date, category, variation, duration
- Section is expanded by default on desktop
- Section is collapsed by default on mobile (< 768px)

**Example:**
```
Recent Workouts ▼
─────────────────────────────────────
Today       | Push A  | 45m
Yesterday   | Pull B  | 38m
3 days ago  | Legs A  | 52m
5 days ago  | Core    | 20m
6 days ago  | Push B  | 47m
```

---

### Requirement: System SHALL format workout dates as relative time

**ID:** WHD-002

The system SHALL display workout dates as human-readable relative time (e.g., "Today", "Yesterday", "3 days ago") for workouts within the last 7 days, and as absolute dates (e.g., "Jan 15") for older workouts.

#### Scenario: Display today's workout

**Given:** User completed a workout earlier today at 10:00 AM
**When:** User views workout history at 3:00 PM
**Then:** Workout date displays as "Today"

---

#### Scenario: Display yesterday's workout

**Given:** User completed a workout yesterday
**When:** User views workout history
**Then:** Workout date displays as "Yesterday"

---

#### Scenario: Display workout from 3 days ago

**Given:** User completed a workout 3 days ago
**When:** User views workout history
**Then:** Workout date displays as "3 days ago"

---

#### Scenario: Display old workout (> 7 days)

**Given:** User completed a workout 15 days ago (January 10, 2025)
**When:** User views workout history
**Then:** Workout date displays as "Jan 10" (absolute date format)

---

### Requirement: System SHALL highlight today's workouts distinctly

**ID:** WHD-003

The system SHALL visually distinguish workouts completed today with a green left border and subtle background tint.

#### Scenario: User has trained today

**Given:**
- User completed "Push A" workout today at 9:00 AM
- User completed "Pull B" workout today at 5:00 PM
**When:** User views workout history
**Then:**
- Both workouts have green left border (4px, border-green-400)
- Both workouts have subtle green background (bg-green-900/10)
- Other workouts have standard background (bg-brand-muted)

---

### Requirement: System SHALL display PR indicators on workouts

**ID:** WHD-004

The system SHALL show a "🎉 PR" badge on workout rows that contain any personal records.

#### Scenario: Workout contains PR

**Given:** User's "Push A" workout from yesterday included a bench press PR (best single set)
**When:** User views workout history
**Then:**
- "Push A" row displays "🎉 PR" badge next to duration
- Badge is color-coded (text-green-400)

---

#### Scenario: Workout contains no PRs

**Given:** User's "Pull B" workout from 3 days ago had no personal records
**When:** User views workout history
**Then:** "Pull B" row displays no PR badge

---

### Requirement: System SHALL persist collapse state in localStorage

**ID:** WHD-005

The system SHALL remember the user's expand/collapse preference for the "Recent Workouts" section using localStorage key `dashboard-history-expanded`.

#### Scenario: User collapses section

**Given:** "Recent Workouts" section is currently expanded
**When:** User clicks header to collapse section
**Then:**
- Section collapses with smooth animation (200ms)
- localStorage stores: `{ "dashboard-history-expanded": false }`
- Chevron icon rotates from down to up

---

#### Scenario: User returns after collapsing

**Given:** User previously collapsed "Recent Workouts" section
**When:** User refreshes page or navigates back to Dashboard
**Then:**
- Section loads in collapsed state
- localStorage value respected

---

### Requirement: System SHALL show empty state when no workouts exist

**ID:** WHD-006

The system SHALL display a helpful empty state when user has no workout history.

#### Scenario: New user with no workouts

**Given:** User has never logged a workout
**When:** User views Dashboard
**Then:**
- "Recent Workouts" section shows empty state
- Empty state displays: "No workouts yet. Start your first workout to see history here!"
- "Start Workout" button is prominently displayed
- Section is expanded to show the empty state message

---

### Requirement: System SHALL limit display to 5 most recent workouts

**ID:** WHD-007

The system SHALL display only the 5 most recent workouts in the summary view, regardless of total workout count.

#### Scenario: User has 100 workouts

**Given:** User has 100 workouts in history
**When:** User views "Recent Workouts" section
**Then:**
- Exactly 5 workouts are displayed
- Workouts are the 5 most recent by date
- Oldest displayed workout is #5 (6th-100th workouts not shown)
- "See full history" link is present (future feature, currently shows toast)

---

### Requirement: System SHALL display workout duration in human-readable format

**ID:** WHD-008

The system SHALL format workout duration_seconds as "Xm" (minutes only) for workouts under 60 minutes, and "Xh Ym" for longer workouts.

#### Scenario: Short workout (under 60 min)

**Given:** Workout duration is 2700 seconds (45 minutes)
**When:** Workout displays in history
**Then:** Duration shows as "45m"

---

#### Scenario: Long workout (over 60 min)

**Given:** Workout duration is 5460 seconds (1 hour 31 minutes)
**When:** Workout displays in history
**Then:** Duration shows as "1h 31m"

---

#### Scenario: Exact hour duration

**Given:** Workout duration is 3600 seconds (60 minutes)
**When:** Workout displays in history
**Then:** Duration shows as "1h 0m"

---

### Requirement: System SHALL be keyboard accessible

**ID:** WHD-009

The system SHALL support keyboard navigation for the collapsible header and workout rows.

#### Scenario: Keyboard user navigates to section

**Given:** User navigates with Tab key
**When:** Focus reaches "Recent Workouts" header
**Then:**
- Header receives visible focus indicator (ring-2 ring-green-500)
- Enter or Space key toggles collapse/expand
- Escape key collapses section if expanded

---

### Requirement: System SHALL be responsive on mobile devices

**ID:** WHD-010

The system SHALL adapt layout for mobile screens (< 768px) with optimized spacing and default collapsed state.

#### Scenario: Mobile user loads dashboard

**Given:** User opens Dashboard on mobile device (width 375px)
**When:** Page loads
**Then:**
- "Recent Workouts" section is collapsed by default
- When expanded, workout rows stack vertically
- Date, category, variation, duration each on own line or wrapped appropriately
- Touch targets are at least 44px tall

---

## Implementation Notes

**Component Location:** `components/WorkoutHistorySummary.tsx`

**Props Interface:**
```typescript
interface WorkoutHistorySummaryProps {
  workouts: WorkoutSession[];
  personalBests: PersonalBestsResponse;
  maxDisplay?: number; // default 5
}
```

**Dependencies:**
- `utils/helpers.ts::formatDuration()` (already exists)
- `hooks/useLocalStorage.ts` (already exists)
- `types.ts` (WorkoutSession interface)

**Styling:**
- Uses existing FitForge brand colors
- Consistent with other collapsible sections
- Tailwind CSS utility classes

---

*This specification defines the workout history summary display that provides users with immediate context about recent training activity.*

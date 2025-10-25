# training-statistics-summary Specification

## Purpose
TBD - created by archiving change enhance-recovery-dashboard. Update Purpose after archive.
## Requirements
### Requirement: System SHALL calculate current training streak

**ID:** TSS-001

The system SHALL calculate consecutive days with at least one workout, counting backward from today until a gap day is found.

#### Scenario: User has 5-day streak

**Given:**
- Today (Oct 25): 1 workout
- Yesterday (Oct 24): 1 workout
- Oct 23: 2 workouts
- Oct 22: 1 workout
- Oct 21: 1 workout
- Oct 20: 0 workouts (gap)
- Oct 19: 1 workout

**When:** Streak is calculated
**Then:** Streak = 5 days (Oct 21-25, breaks at Oct 20)

---

#### Scenario: User worked out today, breaking no-workout yesterday

**Given:**
- Today (Oct 25): 1 workout
- Yesterday (Oct 24): 0 workouts
- Oct 23: 1 workout

**When:** Streak is calculated
**Then:** Streak = 1 day (only today, breaks at yesterday)

---

#### Scenario: User has never worked out

**Given:** No workouts in history
**When:** Streak is calculated
**Then:** Streak = 0 days

---

#### Scenario: User last worked out 3 days ago

**Given:**
- Today (Oct 25): 0 workouts
- Yesterday (Oct 24): 0 workouts
- Oct 23: 0 workouts
- Oct 22: 1 workout

**When:** Streak is calculated
**Then:** Streak = 0 days (streak is broken, not counting past workouts)

---

### Requirement: System SHALL calculate weekly workout counts

**ID:** TSS-002

The system SHALL count workouts in current week (Sunday-Saturday) and previous week for comparison.

#### Scenario: Compare current week to previous week

**Given:**
- Current week (Oct 20-26): 4 workouts (Sun, Tue, Thu, Sat)
- Last week (Oct 13-19): 3 workouts (Mon, Wed, Fri)

**When:** Weekly stats calculated
**Then:**
- This week: 4 workouts
- Last week: 3 workouts
- Change indicator: ↑ from 3 (increased)

---

#### Scenario: Current week has fewer workouts

**Given:**
- Current week: 2 workouts
- Last week: 5 workouts

**When:** Weekly stats calculated
**Then:**
- This week: 2 workouts
- Last week: 5 workouts
- Change indicator: ↓ from 5 (decreased)

---

#### Scenario: Same workout count

**Given:**
- Current week: 4 workouts
- Last week: 4 workouts

**When:** Weekly stats calculated
**Then:**
- This week: 4 workouts
- Last week: 4 workouts
- Change indicator: → (no change)

---

### Requirement: System SHALL identify recent personal records

**ID:** TSS-003

The system SHALL find personal records set within the last 7 days and display top 2 PRs.

#### Scenario: Multiple PRs in last week

**Given:**
- Oct 25: Pull-ups PR (best single set), 20% improvement
- Oct 24: Bench Press PR (best session volume), 15% improvement
- Oct 22: Squats PR (best single set), 25% improvement
- Oct 15: Deadlift PR (8 days ago, outside window)

**When:** Recent PRs calculated
**Then:**
- Displays: 2 PRs (Squats 25%, Pull-ups 20%)
- Sorted by improvement percentage (highest first)
- Deadlift not included (> 7 days ago)

---

#### Scenario: No recent PRs

**Given:** No personal records set in last 7 days
**When:** Recent PRs calculated
**Then:**
- PR count: 0
- Display: "No recent PRs" or "0 new"

---

#### Scenario: Only 1 PR in last week

**Given:** Bench Press PR on Oct 23 (12% improvement)
**When:** Recent PRs calculated
**Then:**
- Displays: 1 PR (Bench Press 12%)
- No padding with empty slots

---

### Requirement: System SHALL display streak with visual emphasis

**ID:** TSS-004

The system SHALL show current streak with fire emoji and prominent styling.

#### Scenario: Active streak display

**Given:** Current streak = 7 days
**When:** Quick Stats renders
**Then:**
- Display: "🔥 Streak"
- Value: "7 days" (text-2xl font-bold)
- Color: Green if >= 3 days, yellow if 1-2 days, gray if 0

---

#### Scenario: No streak

**Given:** Current streak = 0 days
**When:** Quick Stats renders
**Then:**
- Display: "🔥 Streak"
- Value: "0 days" (text-slate-400)
- Encouragement text: "Start today!" (text-xs)

---

### Requirement: System SHALL display weekly stats with trend indicator

**ID:** TSS-005

The system SHALL show this week's workout count with visual comparison to last week.

#### Scenario: Workouts increased this week

**Given:**
- This week: 5 workouts
- Last week: 3 workouts

**When:** Weekly stats render
**Then:**
- Display: "📊 This Week"
- Value: "5 workouts"
- Trend: "↑ from 3" (text-green-400)

---

#### Scenario: Workouts decreased this week

**Given:**
- This week: 2 workouts
- Last week: 4 workouts

**When:** Weekly stats render
**Then:**
- Display: "📊 This Week"
- Value: "2 workouts"
- Trend: "↓ from 4" (text-red-400)

---

#### Scenario: No change in workout count

**Given:**
- This week: 3 workouts
- Last week: 3 workouts

**When:** Weekly stats render
**Then:**
- Display: "📊 This Week"
- Value: "3 workouts"
- Trend: "→ same" (text-slate-400)

---

### Requirement: System SHALL display PR count with clickable details

**ID:** TSS-006

The system SHALL show count of recent PRs and allow users to click for details.

#### Scenario: User clicks PR count

**Given:** 2 PRs in last 7 days (Pull-ups, Bench Press)
**When:** User clicks "2 new" in PR card
**Then:**
- Toast notification displays:
  - "Recent Personal Records (Last 7 Days)"
  - "• Pull-ups: Best Single Set (+20%)"
  - "• Bench Press: Session Volume (+15%)"
- Toast auto-dismisses after 5 seconds

---

#### Scenario: No PRs to display

**Given:** 0 PRs in last 7 days
**When:** PR card renders
**Then:**
- Display: "🏆 PRs"
- Value: "0 new" (text-slate-400)
- Card is not clickable (no hover effect)

---

### Requirement: System SHALL layout stats responsively

**ID:** TSS-007

The system SHALL display Quick Stats in a responsive grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop).

#### Scenario: Desktop layout

**Given:** Screen width > 1024px
**When:** Quick Stats renders
**Then:**
- 3 cards in single row
- Streak | This Week | PRs
- Equal width columns (grid-cols-3)

---

#### Scenario: Tablet layout

**Given:** Screen width between 768px and 1024px
**When:** Quick Stats renders
**Then:**
- 2 cards per row
- Streak | This Week (row 1)
- PRs (row 2, spans 2 columns or centered)

---

#### Scenario: Mobile layout

**Given:** Screen width < 768px
**When:** Quick Stats renders
**Then:**
- 1 card per row (stacked vertically)
- Streak (row 1)
- This Week (row 2)
- PRs (row 3)

---

### Requirement: System SHALL use consistent card styling

**ID:** TSS-008

The system SHALL display each stat in a card with consistent visual design matching FitForge brand.

#### Scenario: Stat card visual design

**Given:** Any stat card (Streak, Weekly, or PR)
**When:** Card renders
**Then:**
- Background: bg-brand-muted
- Padding: p-4
- Rounded corners: rounded-md
- Label: text-sm text-slate-400 uppercase tracking-wide
- Value: text-2xl font-bold
- Subtitle: text-xs text-slate-500 (for trend or count)

---

### Requirement: System SHALL handle edge case of first workout ever

**ID:** TSS-009

The system SHALL display appropriate messages for brand new users with no workout history.

#### Scenario: First time user

**Given:** User has never logged a workout
**When:** Quick Stats renders
**Then:**
- Streak: "0 days" with "Start your streak today!"
- This Week: "0 workouts" with "Get started!"
- PRs: "0 new" with "Build your baseline"

---

### Requirement: System SHALL calculate week boundaries correctly

**ID:** TSS-010

The system SHALL define weeks as Sunday 00:00:00 to Saturday 23:59:59 in user's local timezone.

#### Scenario: Saturday workout counts for current week

**Given:**
- Today: Saturday Oct 26 at 11:00 PM
- User completes workout

**When:** Weekly stats calculated
**Then:** Workout counts toward "This Week" (current week ends midnight)

---

#### Scenario: Sunday workout starts new week

**Given:**
- Today: Sunday Oct 27 at 1:00 AM
- User completes workout

**When:** Weekly stats calculated
**Then:** Workout counts toward "This Week" (new week started midnight)

---

### Requirement: System SHALL be purely presentational (no state)

**ID:** TSS-011

The system SHALL receive all calculated stats as props and render without internal state or side effects.

#### Scenario: QuickTrainingStats component design

**Given:** Component receives props:
```typescript
{
  streak: 5,
  weeklyStats: { thisWeek: 4, lastWeek: 3 },
  recentPRs: [
    { exercise: 'Pull-ups', type: 'single', improvement: 20 },
    { exercise: 'Bench Press', type: 'volume', improvement: 15 }
  ]
}
```

**When:** Component renders
**Then:**
- No useState, useEffect, or API calls
- Purely transforms props to JSX
- Wrapped in React.memo for performance
- Can be unit tested easily

---

### Requirement: System SHALL recalculate on data changes

**ID:** TSS-012

The system SHALL recalculate statistics when workouts or personal bests change (via useMemo in Dashboard).

#### Scenario: User completes workout

**Given:**
- Current streak: 3 days
- This week: 4 workouts
- User completes new workout today

**When:** Dashboard receives updated workout data from API
**Then:**
- useMemo recalculates: streak becomes 4 days
- useMemo recalculates: this week becomes 5 workouts
- QuickTrainingStats re-renders with new values

---


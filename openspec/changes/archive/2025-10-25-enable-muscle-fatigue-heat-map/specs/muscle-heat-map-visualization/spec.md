# Spec: Muscle Heat Map Visualization

**Capability:** `muscle-heat-map-visualization`
**Change:** `enable-muscle-fatigue-heat-map`
**Status:** Proposed

---

## Overview

This capability provides a visual "heat map" of muscle fatigue status on the Dashboard home screen. Users can instantly see which muscles are ready to train and which need more recovery time through color-coded progress bars and clear status indicators.

---

## ADDED Requirements

###  Requirement: Display Fatigue Percentage with Progress Bar

**Description:** System SHALL display fatigue percentage for each muscle with a visual progress bar.

**Acceptance Criteria:**
- Each muscle shows fatigue percentage (0-100%)
- Progress bar fills proportionally to fatigue level
- Progress bar width = fatigue percentage
- Text label shows exact percentage: "85% fatigued"

#### Scenario: User views fully recovered muscle
**Given:** User opens Dashboard
**And:** Lats were last trained 5 days ago (fully recovered)
**When:** User views muscle heat map
**Then:** Lats shows "0% fatigued" or "Fully recovered"
**And:** Progress bar is empty (0% width)
**And:** Status shows 🟢 green color

#### Scenario: User views partially fatigued muscle
**Given:** User opens Dashboard
**And:** Pectoralis was trained 2 days ago (partial recovery)
**When:** User views muscle heat map
**Then:** Pectoralis shows "60% fatigued"
**And:** Progress bar fills to 60% width
**And:** Status shows 🟡 yellow color

---

### Requirement: Color-Code by Fatigue Level

**Description:** System SHALL use color coding to indicate muscle recovery status.

**Acceptance Criteria:**
- Green (bg-green-500): 0-33% fatigued = Ready to train
- Yellow (bg-yellow-500): 34-66% fatigued = Recovering
- Red (bg-red-500): 67-100% fatigued = Needs rest
- Color applies to progress bar fill
- Smooth transitions between colors

#### Scenario: Muscle transitions from fatigued to ready
**Given:** User's Triceps are at 70% fatigue (red)
**When:** 2 days pass and fatigue drops to 30%
**Then:** Progress bar color changes from red to green
**And:** Visual transition is smooth (CSS transition)

#### Scenario: Muscle at threshold boundary
**Given:** User's Deltoids are at exactly 33% fatigue
**When:** User views heat map
**Then:** Progress bar shows green (threshold is ≤33%)

#### Scenario: Muscle at 67% fatigue
**Given:** User's Quadriceps are at 67% fatigue
**When:** User views heat map
**Then:** Progress bar shows red (threshold is ≥67%)

---

### Requirement: Show Last Trained and Days Since

**Description:** System SHALL display when each muscle was last trained and how many days ago.

**Acceptance Criteria:**
- "Last trained: Xd ago" appears below progress bar
- Days calculated from current date
- If never trained: display "Never trained"
- Updates daily (not real-time seconds/minutes)

#### Scenario: User views muscle trained 3 days ago
**Given:** Pectoralis was last trained on January 1st
**And:** Today is January 4th
**When:** User views heat map
**Then:** Displays "Last trained: 3d ago"

#### Scenario: User views never-trained muscle
**Given:** User has never performed exercises targeting Core
**When:** User views heat map
**Then:** Core displays "Never trained"
**And:** Shows 0% fatigue (fully ready)

---

### Requirement: Display Recovery Time Estimate

**Description:** System SHALL show how many days until muscle is fully recovered or indicate if ready now.

**Acceptance Criteria:**
- If fatigue ≤ 33%: Display "Ready now" in green text
- If fatigue > 33%: Display "Ready in Xd" based on recovery curve
- Use existing recovery calculation formula
- Clear visual distinction between ready and recovering

#### Scenario: Muscle is ready to train
**Given:** Lats are at 15% fatigue (below 33% threshold)
**When:** User views heat map
**Then:** Displays "Ready now" in green, bold text
**And:** User can confidently train this muscle

#### Scenario: Muscle needs 2 more days
**Given:** Pectoralis is at 85% fatigue
**And:** Recovery formula indicates 2 days until <33% fatigue
**When:** User views heat map
**Then:** Displays "Ready in 2d"
**And:** Text color is slate-400 (not green)

---

### Requirement: Handle Data Loading and Errors

**Description:** System SHALL gracefully handle loading states and API errors.

**Acceptance Criteria:**
- Show loading skeleton while fetching muscle states
- Display error message if API fails
- Fallback to empty state if no data
- Don't crash if muscle_states returns null

#### Scenario: API is loading
**Given:** User opens Dashboard
**And:** GET /api/muscle-states is in progress
**When:** Component renders
**Then:** Shows loading skeleton for muscle list
**And:** No muscle data displayed yet

#### Scenario: API returns error
**Given:** Backend is unavailable
**When:** GET /api/muscle-states fails
**Then:** Displays "Unable to load muscle data" message
**And:** Provides retry button
**And:** App doesn't crash

---

## MODIFIED Requirements

### Requirement: Dashboard Muscle Recovery Section

**Description:** System SHALL update the Dashboard's "Muscle Recovery" section to use enhanced heat map visualization.

**Before:**
```tsx
<section>
  <h3>Muscle Recovery</h3>
  <MuscleRecoveryVisualizer
    muscleStates={muscleStates}
    workouts={workouts}
    muscleBaselines={muscleBaselines}
  />
</section>
```

**After:**
```tsx
<section>
  <h3>Muscle Fatigue Heat Map</h3>
  <MuscleFatigueHeatMap
    muscleStates={muscleStates}
    workouts={workouts}
    muscleBaselines={muscleBaselines}
  />
</section>
```

**Changes:**
- Section title updated to "Muscle Fatigue Heat Map"
- Component displays fatigue % instead of recovery %
- Color coding based on fatigue thresholds
- Categorized by Push/Pull/Legs/Core (handled in separate spec)

#### Scenario: User navigates to Dashboard
**Given:** User logs into FitForge
**When:** Dashboard loads
**Then:** "Muscle Fatigue Heat Map" section appears
**And:** All 13 muscles display with fatigue data
**And:** Heat map is prominently visible (not buried)

---

## Implementation Notes

**Data Transformation:**
```typescript
// Convert recovery % to fatigue %
const fatiguePercent = 100 - recoveryPercent;

// OR if muscle_states already provides fatiguePercentage:
const fatiguePercent = muscleState.fatiguePercentage;
```

**Color Logic:**
```typescript
function getFatigueColor(fatiguePercent: number): string {
  if (fatiguePercent <= 33) return 'bg-green-500';
  if (fatiguePercent <= 66) return 'bg-yellow-500';
  return 'bg-red-500';
}
```

**Recovery Estimate:**
```typescript
function getRecoveryEstimate(daysSince: number, recoveryDaysNeeded: number): string {
  const daysUntilReady = Math.max(0, Math.ceil(recoveryDaysNeeded - daysSince));
  if (daysUntilReady === 0) return 'Ready now';
  return `Ready in ${daysUntilReady}d`;
}
```

**Responsive Design:**
- Mobile: Single column, full width progress bars
- Desktop: Potentially 2-column layout (optional enhancement)
- Progress bars always visible (no overflow hidden)

**Performance:**
- Use `useMemo` for fatigue calculations
- Don't recalculate on every render
- Only re-compute when `muscleStates` prop changes

**Accessibility:**
- ARIA label on progress bar: `aria-label="Pectoralis: 85% fatigued, ready in 1 day"`
- Semantic HTML: `<section>`, `<h3>`, `<div role="progressbar">`
- Keyboard navigable (handled in exercise discovery spec)

---

## Testing Checklist

**Visual Testing:**
- [ ] Green color appears for 0-33% fatigue
- [ ] Yellow color appears for 34-66% fatigue
- [ ] Red color appears for 67-100% fatigue
- [ ] Progress bars fill correctly (match percentage)
- [ ] Text labels show correct values

**Data Accuracy:**
- [ ] Fatigue % matches actual muscle state
- [ ] "Last trained" shows correct days ago
- [ ] "Ready in Xd" matches recovery formula
- [ ] "Never trained" appears for untrained muscles

**Edge Cases:**
- [ ] All muscles fatigued (all red)
- [ ] All muscles recovered (all green)
- [ ] Mixed fatigue levels display correctly
- [ ] Loading state shows skeleton
- [ ] Error state shows message and retry button

---

*This spec ensures the heat map provides clear, actionable visual feedback to users about which muscles are ready to train.*

# Spec: Recovery Timeline Visualization

**Capability:** `recovery-timeline-visualization`
**Status:** Proposed
**Created:** 2025-10-25

---

## ADDED Requirements

### Requirement: System SHALL group muscles by recovery status

**ID:** RTV-001

The system SHALL organize muscles into three distinct groups based on daysUntilRecovered from muscle states API: "Ready Now", "Recovering Soon", and "Still Fatigued".

#### Scenario: Mixed recovery states

**Given:**
- Lats: daysUntilRecovered = 0 (fully recovered)
- Biceps: daysUntilRecovered = -1 (ready for 1 day)
- Rhomboids: daysUntilRecovered = 0.5 (ready in 12 hours)
- Pecs: daysUntilRecovered = 1.2 (ready in 1.2 days)
- Deltoids: daysUntilRecovered = 1.8 (ready in 1.8 days)
- Triceps: daysUntilRecovered = 3.5 (ready in 3.5 days)
- Core: daysUntilRecovered = 5 (ready in 5 days)

**When:** Recovery Timeline renders
**Then:**
- **"Ready Now"** group contains: Lats, Biceps, Rhomboids (daysUntilRecovered <= 0)
- **"Recovering Soon"** group contains: Pecs, Deltoids (0 < daysUntilRecovered <= 2)
- **"Still Fatigued"** group contains: Triceps, Core (daysUntilRecovered > 2)

---

### Requirement: System SHALL display group headers with status indicators

**ID:** RTV-002

The system SHALL display each recovery group with a distinct icon, color, and muscle count.

#### Scenario: Render recovery groups

**Given:**
- Ready Now: 5 muscles
- Recovering Soon: 2 muscles
- Still Fatigued: 3 muscles

**When:** Timeline displays
**Then:**
- **Ready Now** header shows: "✅ READY NOW (5 muscles)" in green (text-green-400)
- **Recovering Soon** header shows: "⏳ RECOVERING SOON (2 muscles)" in yellow (text-yellow-400)
- **Still Fatigued** header shows: "🔴 STILL FATIGUED (3 muscles)" in red (text-red-400)

---

### Requirement: System SHALL show recovery countdown for each muscle

**ID:** RTV-003

The system SHALL display days until recovered next to each muscle in "Recovering Soon" and "Still Fatigued" groups.

#### Scenario: Display recovery countdown

**Given:**
- Pecs: daysUntilRecovered = 1.2
- Deltoids: daysUntilRecovered = 1.8
- Triceps: daysUntilRecovered = 3.5

**When:** Muscles render in timeline
**Then:**
- Pecs displays: "Pecs (1d)" - rounded down to nearest day
- Deltoids displays: "Deltoids (2d)" - rounded up to nearest day
- Triceps displays: "Triceps (4d)" - rounded up to nearest day

**Rounding Logic:**
- If days < 1: Round up to "1d" (always show at least 1 day)
- If days >= 1: Use `Math.ceil()` to round up

---

### Requirement: System SHALL make muscle names clickable

**ID:** RTV-004

The system SHALL allow users to click any muscle name to open the existing muscle detail modal (reuse from MuscleFatigueHeatMap).

#### Scenario: User clicks muscle in timeline

**Given:** User viewing Recovery Timeline
**When:** User clicks "Lats" in "Ready Now" group
**Then:**
- Muscle modal opens (same modal as heat map uses)
- Modal shows exercises targeting Lats
- Modal displays muscle engagement percentages
- Escape key or X button closes modal

---

### Requirement: System SHALL persist collapse state in localStorage

**ID:** RTV-005

The system SHALL remember the user's expand/collapse preference for the "Recovery Timeline" section using localStorage key `dashboard-timeline-expanded`.

#### Scenario: User expands timeline

**Given:** "Recovery Timeline" section is currently collapsed
**When:** User clicks header to expand section
**Then:**
- Section expands with smooth animation (200ms)
- localStorage stores: `{ "dashboard-timeline-expanded": true }`
- Chevron icon rotates from right to down

---

#### Scenario: User returns after expanding

**Given:** User previously expanded "Recovery Timeline" section
**When:** User refreshes page or navigates back to Dashboard
**Then:**
- Section loads in expanded state
- localStorage value respected

---

### Requirement: System SHALL show empty state for fully recovered body

**ID:** RTV-006

The system SHALL display a positive empty state when all muscles are fully recovered.

#### Scenario: All muscles ready

**Given:** All 13 muscles have daysUntilRecovered <= 0
**When:** Recovery Timeline displays
**Then:**
- Section shows: "✅ All muscle groups fully recovered!"
- Message styled in green (text-green-400)
- Suggestion: "Ready for any workout type"
- No groups displayed (no "Ready Now" group when all ready)

---

### Requirement: System SHALL sort muscles alphabetically within groups

**ID:** RTV-007

The system SHALL display muscles in alphabetical order within each recovery group for easy scanning.

#### Scenario: Multiple muscles in each group

**Given:**
- Ready Now: Rhomboids, Lats, Biceps, Core, Trapezius
- Recovering Soon: Pecs, Deltoids
- Still Fatigued: Triceps, Quadriceps, Glutes

**When:** Timeline renders
**Then:**
- Ready Now displays: Biceps, Core, Lats, Rhomboids, Trapezius
- Recovering Soon displays: Deltoids, Pecs
- Still Fatigued displays: Glutes, Quadriceps, Triceps

---

### Requirement: System SHALL handle never-trained muscles

**ID:** RTV-008

The system SHALL treat muscles with no lastTrained date as fully recovered (daysUntilRecovered = 0).

#### Scenario: New user with some muscles never trained

**Given:**
- Lats: lastTrained = null (never trained)
- Pecs: lastTrained = "2025-10-24", daysUntilRecovered = 2

**When:** Timeline renders
**Then:**
- Lats appears in "Ready Now" group
- Pecs appears in "Recovering Soon" group

---

### Requirement: System SHALL collapse by default on mobile devices

**ID:** RTV-009

The system SHALL start in collapsed state on mobile screens (< 768px) to save vertical space.

#### Scenario: Mobile user loads dashboard

**Given:** User opens Dashboard on mobile device (width 375px)
**When:** Page loads for the first time
**Then:**
- "Recovery Timeline" section is collapsed
- localStorage stores: `{ "dashboard-timeline-expanded": false }`
- User can manually expand if desired

---

### Requirement: System SHALL be keyboard accessible

**ID:** RTV-010

The system SHALL support keyboard navigation for all interactive elements.

#### Scenario: Keyboard user navigates timeline

**Given:** User navigates with Tab key
**When:** Focus reaches muscle names
**Then:**
- Each muscle name is focusable
- Visible focus indicator displayed (ring-2 ring-green-500)
- Enter key opens muscle modal
- Escape key closes modal

---

### Requirement: System SHALL use visual icons for status groups

**ID:** RTV-011

The system SHALL use distinct emoji/icons for each recovery status to aid visual scanning and accessibility.

#### Scenario: Visual status indicators

**Given:** Timeline is expanded
**When:** User scans the groups
**Then:**
- Ready Now: ✅ (green checkmark)
- Recovering Soon: ⏳ (hourglass)
- Still Fatigued: 🔴 (red circle)
- Icons provide visual redundancy (not color alone)

---

### Requirement: System SHALL display muscle count in group headers

**ID:** RTV-012

The system SHALL show the count of muscles in each group to provide quick status awareness.

#### Scenario: Render group counts

**Given:**
- Ready Now: 5 muscles
- Recovering Soon: 3 muscles
- Still Fatigued: 2 muscles

**When:** Headers render
**Then:**
- "✅ READY NOW (5 muscles)"
- "⏳ RECOVERING SOON (3 muscles)"
- "🔴 STILL FATIGUED (2 muscles)"

---

### Requirement: System SHALL hide empty groups

**ID:** RTV-013

The system SHALL not display groups that contain zero muscles to avoid visual clutter.

#### Scenario: No muscles in "Still Fatigued"

**Given:**
- Ready Now: 8 muscles
- Recovering Soon: 5 muscles
- Still Fatigued: 0 muscles

**When:** Timeline renders
**Then:**
- "Ready Now" and "Recovering Soon" groups are visible
- "Still Fatigued" group is not displayed
- No empty state shown for that group

---

## Implementation Notes

**Component Location:** `components/RecoveryTimelineView.tsx`

**Props Interface:**
```typescript
interface RecoveryTimelineViewProps {
  muscleStates: MuscleStatesResponse;
  onMuscleClick: (muscle: Muscle) => void; // Reuse existing modal handler
}
```

**Grouping Algorithm:**
```typescript
function groupMusclesByRecovery(muscleStates: MuscleStatesResponse) {
  const ready: Muscle[] = [];
  const recovering: Muscle[] = [];
  const fatigued: Muscle[] = [];

  Object.entries(muscleStates).forEach(([muscle, state]) => {
    const days = state.daysUntilRecovered;
    if (days <= 0) ready.push(muscle as Muscle);
    else if (days <= 2) recovering.push(muscle as Muscle);
    else fatigued.push(muscle as Muscle);
  });

  return {
    ready: ready.sort(),
    recovering: recovering.sort(),
    fatigued: fatigued.sort()
  };
}
```

**Dependencies:**
- `types.ts` (MuscleStatesResponse, Muscle)
- `hooks/useLocalStorage.ts` (for collapse state)
- Dashboard's existing muscle modal (reuse)

**Styling:**
- Consistent with FitForge brand colors
- Green/Yellow/Red status colors
- Smooth transitions (200ms)

---

*This specification defines the recovery timeline visualization that helps users understand muscle recovery progress at a glance.*

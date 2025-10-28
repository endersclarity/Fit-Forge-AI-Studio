# Spec: Muscle Visualization Hover Events

**Capability ID:** `muscle-visualization-hover-events`
**Type:** Bug Fix / Enhancement
**Related Change:** `fix-muscle-hover-tooltip-wiring`
**Status:** Added

---

## Overview

Wire up hover event handlers in the MuscleVisualization component to enable the existing tooltip UI to display when users hover over muscle regions. This completes the progressive disclosure Level 2 design that was implemented but never connected.

---

## ADDED Requirements

### Requirement: Hover State Management

The MuscleVisualization component must track which muscle region the user is currently hovering over and expose this state to child components.

#### Scenario: User hovers over a muscle region

**Given** the muscle visualization is rendered with muscle states data
**When** the user moves their mouse cursor over a muscle region
**Then** the component sets `hoveredMuscle` state to an object containing:
- `name`: The Muscle enum value (e.g., "Pectoralis")
- `fatigue`: The current fatigue percentage for that muscle (0-100)

**And** the component invokes the `onMuscleHover` callback prop with the muscle name (if callback provided)

#### Scenario: User moves cursor away from muscle region

**Given** the user is hovering over a muscle region (hoveredMuscle state is set)
**When** the user moves their mouse cursor outside the muscle region
**Then** the component sets `hoveredMuscle` state to `null`
**And** the component invokes the `onMuscleHover` callback prop with `null` (if callback provided)

#### Scenario: User rapidly moves cursor across multiple muscles

**Given** the muscle visualization is rendered
**When** the user rapidly moves their cursor across multiple muscle regions
**Then** the `hoveredMuscle` state updates smoothly without lag
**And** no "stuck" hover states occur
**And** the tooltip position follows the cursor at 15px offset
**And** 60 FPS performance is maintained during hover movements

---

### Requirement: Hover Event Handler Implementation

The MuscleVisualization component must implement a hover event handler that integrates with the react-body-highlighter Model component.

#### Scenario: Hover handler receives muscle stats from Model component

**Given** the Model component triggers a hover event with IMuscleStats data
**When** the handleHover function is invoked
**Then** the function maps the muscle ID to a FitForge Muscle name using REVERSE_MUSCLE_MAP
**And** the function looks up the current fatigue percentage from muscleStates prop
**And** the function sets hoveredMuscle state with name and fatigue data

#### Scenario: Hover handler receives null when mouse exits

**Given** the Model component triggers a hover exit event (null stats)
**When** the handleHover function is invoked with null
**Then** the function sets hoveredMuscle state to null immediately
**And** the tooltip disappears from the UI

#### Scenario: Hover handler maps unmapped muscle ID

**Given** the Model component triggers hover with an unmapped muscle ID
**When** the handleHover function attempts to map the ID via REVERSE_MUSCLE_MAP
**Then** the function finds no matching Muscle name
**And** the function does not update hoveredMuscle state
**And** the function logs a warning to console (dev mode only)

---

### Requirement: Tooltip Display Integration

The existing tooltip UI must render when hoveredMuscle state is populated with valid data.

#### Scenario: Tooltip renders on hover

**Given** hoveredMuscle state is set to `{ name: "Pectoralis", fatigue: 45.2 }`
**When** the MuscleVisualization component renders
**Then** the tooltip is rendered in the DOM
**And** the tooltip displays "Pectoralis" as the muscle name
**And** the tooltip displays "45.2% fatigue"
**And** the tooltip displays "Moderate work" as the status text (33-66% range)
**And** the tooltip is positioned at mousePosition.x + 15px, mousePosition.y + 15px

#### Scenario: Tooltip shows correct status text for green zone

**Given** hoveredMuscle state has fatigue value of 25%
**When** the tooltip renders
**Then** the status text displays "Ready to train"

#### Scenario: Tooltip shows correct status text for yellow zone

**Given** hoveredMuscle state has fatigue value of 50%
**When** the tooltip renders
**Then** the status text displays "Moderate work"

#### Scenario: Tooltip shows correct status text for red zone

**Given** hoveredMuscle state has fatigue value of 75%
**When** the tooltip renders
**Then** the status text displays "Needs recovery"

---

### Requirement: Edge Case Handling

The hover functionality must handle edge cases gracefully without errors or unexpected behavior.

#### Scenario: User hovers during loading state

**Given** the muscle visualization is in loading state (loading prop is true)
**When** the user attempts to hover over the loading spinner area
**Then** no hover events are triggered
**And** no errors occur

#### Scenario: User hovers during error state

**Given** the muscle visualization is in error state (error prop is set)
**When** the user hovers over the error message area
**Then** no hover events are triggered
**And** no errors occur

#### Scenario: User hovers on a selected muscle

**Given** a muscle is currently selected (in selectedMuscles Set)
**And** that muscle has the glow animation active
**When** the user hovers over the selected muscle
**Then** the hover tooltip still appears
**And** the tooltip data is correct
**And** the glow animation continues (not interrupted)

#### Scenario: Component unmounts while user is hovering

**Given** the user is hovering over a muscle (hoveredMuscle state is set)
**When** the component unmounts (user navigates away)
**Then** no errors occur
**And** no memory leaks from event listeners
**And** state is cleaned up properly

---

### Requirement: Touch Device Behavior

The hover tooltip must not interfere with touch device interactions.

#### Scenario: Touch device user taps muscle

**Given** the user is on a touch device (no mouse/cursor)
**When** the user taps on a muscle region
**Then** the click handler is triggered (muscle selection)
**And** the hover tooltip does not appear
**And** no hover state is set

#### Scenario: Tooltip has pointer-events: none

**Given** the tooltip is rendered
**When** the user moves their cursor over the tooltip itself
**Then** the cursor passes through the tooltip (pointer-events: none)
**And** the tooltip does not block interaction with underlying muscles
**And** hovering over tooltip does not clear the hover state

---

## ADDED Requirements

**None** - This is purely wiring existing infrastructure, no new requirements added.

---

## REMOVED Requirements

**None** - This is additive only, no requirements removed.

---

## Technical Notes

### Implementation Approach

1. **Check react-body-highlighter API support:**
   - Verify if `onHover` prop exists on Model component
   - If not supported, use alternative approach (CSS hover + DOM queries)

2. **Add handleHover function:**
   ```typescript
   const handleHover = (stats: IMuscleStats | null) => {
     if (!stats) {
       setHoveredMuscle(null);
       if (onMuscleHover) onMuscleHover(null);
       return;
     }

     const muscleName = REVERSE_MUSCLE_MAP[stats.muscle];
     if (muscleName) {
       const fatiguePercent = muscleStates[muscleName]?.currentFatiguePercent ?? 0;
       setHoveredMuscle({ name: muscleName, fatigue: fatiguePercent });
       if (onMuscleHover) onMuscleHover(muscleName);
     }
   };
   ```

3. **Wire to Model component:**
   ```typescript
   <Model
     onHover={handleHover}
     // ... other props
   />
   ```

### Performance Considerations

- **No debouncing needed** for MVP - hover state updates are lightweight
- **Memoize REVERSE_MUSCLE_MAP** - already a static object, no computation needed
- **Profile with React DevTools** - verify 60 FPS maintained during rapid hover

### Accessibility Considerations

- **Keyboard navigation:** Future enhancement - tooltip should appear on focus
- **Screen readers:** Tooltip text is already in DOM, screen readers can access
- **High contrast mode:** Existing tooltip styles already support high contrast

---

## Test Coverage

### Unit Tests

Not required for this bug fix - component-level testing via manual QA is sufficient.

### Integration Tests

**Test:** Hover over all muscle groups
- Verify all 13 muscles trigger tooltip
- Verify correct muscle names displayed
- Verify correct fatigue percentages displayed

**Test:** Rapid hover movements
- Verify no stuck tooltips
- Verify smooth position tracking
- Verify performance maintained

### Manual QA Checklist

- [ ] Hover triggers tooltip on all anterior muscles
- [ ] Hover triggers tooltip on all posterior muscles
- [ ] Tooltip shows correct muscle name
- [ ] Tooltip shows correct fatigue percentage
- [ ] Tooltip shows correct status text (Ready/Moderate/Needs recovery)
- [ ] Tooltip follows cursor at 15px offset
- [ ] Tooltip clears when mouse exits muscle
- [ ] No lag during rapid hover movements
- [ ] Works with selected muscles (glow animation active)
- [ ] Works in Chrome browser
- [ ] Works in Firefox browser
- [ ] Touch devices don't trigger tooltip
- [ ] No console errors or warnings

---

## Related Specs

- **muscle-visualization-interactions** (parent capability)
- **muscle-deep-dive-modal** (future Level 3 progressive disclosure)

---

## References

- **Component:** `components/MuscleVisualization.tsx`
- **Brainstorming Doc:** `docs/brainstorming-session-results-2025-10-27.md` (progressive disclosure)
- **Design Doc:** `openspec/changes/2025-10-27-implement-muscle-visualization-feature/design.md`

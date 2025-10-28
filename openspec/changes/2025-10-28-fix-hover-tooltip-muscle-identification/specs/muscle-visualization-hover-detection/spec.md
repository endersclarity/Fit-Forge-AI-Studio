# Spec: Muscle Visualization Hover Detection

**Capability:** `muscle-visualization-hover-detection`
**Type:** Core Feature (Bug Fix)
**Status:** Modified
**Related:** `muscle-visualization-interactions` (parent capability)

---

## MODIFIED Requirements

### Requirement: System MUST identify muscle from polygon coordinates

**Priority:** High
**Rationale:** Accurate muscle identification is critical for tooltip correctness and user trust

The muscle visualization hover detection system SHALL use polygon SVG coordinate strings to determine which muscle was hovered, rather than color-based matching.

**Implementation:**
- Import `anteriorData` and `posteriorData` from react-body-highlighter library source
- Build reverse mapping: polygon coordinates → muscle ID
- Use polygon's `points` attribute for lookup on hover
- Convert muscle ID to FitForge muscle name using existing REVERSE_MUSCLE_MAP

**Success Criteria:**
- 100% accuracy: Hovering any polygon shows correct muscle name
- Zero color-based lookups: No dependency on fill color for muscle identification
- Performance maintained: Lookup completes in <1ms

#### Scenario: User hovers over upper back polygon showing Rhomboids

**Given** the muscle states show Rhomboids at 11% fatigue
**And** the polygon for Rhomboids is rendered with coordinates "31.0638298 38.7234043..."
**When** user moves mouse over the Rhomboids polygon
**Then** system reads polygon's `points` attribute
**And** system looks up coordinates in polygon-to-muscle map
**And** system finds muscle ID "upper-back"
**And** system converts "upper-back" to "Rhomboids" via REVERSE_MUSCLE_MAP
**And** tooltip displays "Rhomboids, 11% fatigue, Ready to train"

#### Scenario: User hovers over chest polygon with same color as biceps

**Given** Pectoralis has 87% fatigue (red color)
**And** another unrelated muscle also has 87% fatigue (same red color)
**And** both polygons render with identical RGB fill values
**When** user hovers over the Pectoralis polygon
**Then** system reads polygon coordinates, NOT fill color
**And** system correctly identifies "Pectoralis" regardless of color overlap
**And** tooltip shows "Pectoralis, 87% fatigue, Needs recovery"

#### Scenario: User rapidly moves mouse across multiple muscles

**Given** user moves mouse quickly from Trapezius to Lats to Biceps
**When** mouse enters each new polygon
**Then** system performs coordinate lookup for each polygon
**And** tooltip updates to show correct muscle name immediately
**And** no stale or incorrect muscle names appear
**And** performance remains smooth (60 FPS maintained)

---

### Requirement: System MUST build polygon coordinate map on component mount

**Priority:** High
**Rationale:** One-time initialization prevents repeated map building on every hover

The system SHALL construct the polygon coordinate mapping once when the muscle visualization component mounts, and SHALL reuse the map for all subsequent hover detections.

**Implementation:**
- Create `buildPolygonMap()` function that processes anteriorData and posteriorData
- Store map in useRef for persistence across re-renders
- Build map in useEffect with empty dependency array (runs once)
- Map stores trimmed coordinate strings as keys, muscle IDs as values

**Success Criteria:**
- Map built exactly once per component instance
- Map contains all polygons from anteriorData and posteriorData (~66+ entries)
- Map persists across component re-renders
- No memory leaks from map storage

#### Scenario: Component mounts for the first time

**Given** the MuscleVisualization component is rendering
**And** anteriorData contains 13 muscle definitions with multiple polygons each
**And** posteriorData contains 14 muscle definitions with multiple polygons each
**When** component mounts and useEffect runs
**Then** system calls buildPolygonMap()
**And** system iterates through all anteriorData muscle definitions
**And** system iterates through all posteriorData muscle definitions
**And** system creates Map entry for each unique polygon coordinate string
**And** map contains at least 66 coordinate → muscle ID mappings
**And** map is stored in useRef for future lookups

#### Scenario: Component re-renders due to prop changes

**Given** polygon map was built on initial mount
**And** map is stored in polygonMapRef
**When** component re-renders due to muscleStates prop update
**Then** buildPolygonMap() is NOT called again
**And** existing map in polygonMapRef is reused
**And** hover detection continues to use cached map
**And** no performance degradation from unnecessary rebuilds

---

### Requirement: System MUST handle missing or invalid polygon coordinates gracefully

**Priority:** Medium
**Rationale:** Defensive programming prevents crashes from unexpected data

When polygon coordinates cannot be found in the mapping or are invalid, the system SHALL fail gracefully without breaking the UI.

**Implementation:**
- Check if polygon has `points` attribute
- Trim whitespace from coordinates before lookup
- Return null if coordinates not found in map
- Log warning in development mode only
- Display no tooltip if muscle cannot be identified

**Success Criteria:**
- No crashes or errors when polygon coordinates missing
- No console errors in production
- Development warnings help debugging
- User sees no tooltip rather than incorrect tooltip

#### Scenario: Polygon has malformed points attribute

**Given** a polygon element exists in the SVG
**And** polygon's `points` attribute is empty or null
**When** user hovers over the malformed polygon
**Then** system attempts to read `points` attribute
**And** system receives null or undefined
**And** system skips lookup and returns early
**And** no tooltip is displayed
**And** no JavaScript errors are thrown

#### Scenario: Polygon coordinates not found in map

**Given** polygon has valid coordinates "99.99 88.88 77.77..."
**And** these coordinates do not exist in polygonMapRef map
**When** user hovers over this polygon
**Then** system looks up coordinates in map
**And** map.get() returns undefined
**And** system logs warning: "Polygon coordinates not found: 99.99 88.88..." (dev mode only)
**And** no tooltip is displayed
**And** no JavaScript errors are thrown

---

### Requirement: System MUST NOT use color for muscle identification

**Priority:** Critical
**Rationale:** Color-based matching is fundamentally broken and causes wrong muscle names

The system SHALL completely remove color-based muscle identification logic and SHALL rely solely on polygon coordinates.

**Implementation:**
- Remove color RGB extraction code
- Remove color-to-muscles map building
- Remove unique colors Set logic
- Remove frequency groups sorting and matching
- Delete ~45 lines of color-matching code
- Keep only coordinate-based lookup in mouseenter handler

**Success Criteria:**
- Zero references to fill color in hover detection code
- No color maps or color-based lookups
- Code is simpler and more maintainable
- Net reduction of ~15 lines of code

#### Scenario: Two muscles have identical fatigue percentages

**Given** Lats has 0% fatigue (green color: rgb(99, 198, 114))
**And** Biceps has 0% fatigue (same green color: rgb(99, 198, 114))
**And** both muscles render with identical fill colors
**When** user hovers over Lats polygon
**Then** system reads Lats polygon coordinates, NOT color
**And** system identifies muscle as "upper-back" → "Lats"
**And** tooltip shows "Lats, 0% fatigue, Ready to train"
**When** user then hovers over Biceps polygon
**Then** system reads Biceps polygon coordinates, NOT color
**And** system identifies muscle as "biceps" → "Biceps"
**And** tooltip shows "Biceps, 0% fatigue, Ready to train"
**And** no color-based logic is involved in either detection

#### Scenario: Muscle fatigue percentage changes during session

**Given** Trapezius starts at 13% fatigue (light green)
**And** user completes workout and Trapezius increases to 45% fatigue (yellow)
**And** polygon fill color changes from green to yellow
**When** user hovers over Trapezius polygon before workout
**Then** tooltip shows "Trapezius, 13% fatigue" (using coordinates)
**When** user hovers over same Trapezius polygon after workout
**Then** tooltip still shows "Trapezius" name correctly
**And** tooltip shows updated "45% fatigue"
**And** coordinate-based detection works regardless of color change

---

### Requirement: System MUST maintain compatibility with existing REVERSE_MUSCLE_MAP

**Priority:** High
**Rationale:** Consistent muscle name resolution across click and hover interactions

The hover detection SHALL use the same REVERSE_MUSCLE_MAP that click handlers use, ensuring consistent muscle name resolution across all interactions.

**Implementation:**
- Use REVERSE_MUSCLE_MAP to convert library muscle IDs to FitForge muscle names
- Share same mapping logic as onClick handler
- No duplicate or divergent muscle name mappings
- Consistent behavior between hover and click

**Success Criteria:**
- Hovering and clicking same polygon show same muscle name
- No conflicts between hover and click muscle identification
- Single source of truth for muscle ID → name conversion

#### Scenario: User hovers then clicks same muscle

**Given** user hovers over Deltoids polygon
**And** tooltip shows "Deltoids, 87% fatigue, Needs recovery"
**When** user clicks on the Deltoids polygon
**Then** click handler receives muscle ID "front-deltoids" from library
**And** click handler uses REVERSE_MUSCLE_MAP["front-deltoids"] → "Deltoids"
**And** both hover and click resolve to same muscle name: "Deltoids"
**And** no discrepancy between hover tooltip and click behavior

#### Scenario: Multiple FitForge muscles map to same library muscle ID

**Given** both "Lats" and "Rhomboids" map to library muscle ID "upper-back"
**And** REVERSE_MUSCLE_MAP["upper-back"] → "Lats" (first match)
**When** user hovers over any upper-back polygon
**Then** system looks up "upper-back" in REVERSE_MUSCLE_MAP
**And** system gets "Lats" as muscle name
**And** tooltip shows "Lats" (even if polygon is technically Rhomboids)
**And** this matches click behavior (which also shows "Lats")
**And** consistent experience across hover and click

---

## Implementation Notes

**Import Path:**
```typescript
import { anteriorData, posteriorData } from 'react-body-highlighter/src/assets';
```

**Data Structure:**
```typescript
interface ISVGModelData {
  muscle: Muscle;  // Library muscle ID: "chest", "upper-back", etc.
  svgPoints: string[];  // Array of coordinate strings
}
```

**Polygon Map Type:**
```typescript
Map<string, string>  // Map<coordinates, muscleId>
```

**Lookup Flow:**
```
polygon.getAttribute('points')
  → trim whitespace
  → polygonMap.get(coordinates)
  → muscleId ("upper-back")
  → REVERSE_MUSCLE_MAP[muscleId]
  → muscleName ("Lats")
```

---

## Testing Requirements

**Manual Testing:**
- Hover all 13 muscle groups in both views
- Verify correct names and fatigue percentages
- Test rapid mouse movements
- Test muscle boundary transitions

**Production Validation:**
- Build production bundle
- Verify import path works in production
- Test in Chrome, Firefox, Edge
- Verify no console errors

---

## Success Metrics

- **Accuracy:** 100% of hover interactions show correct muscle name
- **Performance:** <1ms coordinate lookup time
- **Reliability:** 0 console errors during normal operation
- **Code Quality:** Net reduction of 15+ lines of code

---

*This spec replaces broken color-based muscle identification with accurate coordinate-based lookup.*

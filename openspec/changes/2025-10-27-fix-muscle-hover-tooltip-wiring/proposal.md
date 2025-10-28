# Proposal: Fix Muscle Hover Tooltip Wiring

**Change ID:** `fix-muscle-hover-tooltip-wiring`
**Type:** Bug Fix
**Status:** Draft
**Created:** 2025-10-27
**Priority:** Medium (Polish on existing MVP)
**Depends On:** `implement-muscle-visualization-feature` (Phase 1, 2, 4 complete)

---

## Executive Summary

The muscle visualization component includes a fully-designed hover tooltip UI (lines 172-193 in `MuscleVisualization.tsx`) that displays muscle name, exact fatigue percentage, and recovery status text. However, the tooltip is never displayed because the `hoveredMuscle` state (line 132) is declared but never set - no hover event handlers are wired up to populate it.

**Problem:** Users cannot see detailed muscle information on hover despite the tooltip UI being implemented and ready.

**Solution:** Wire up hover event handlers in the `MuscleVisualization` component to populate `hoveredMuscle` state when users hover over muscle regions, enabling the existing tooltip UI to display.

**Impact:**
- **Completes progressive disclosure Level 2** from brainstorming document
- **Improves discoverability** of exact fatigue percentages without requiring clicks
- **Zero UI changes** - purely wiring existing components together
- **Quick fix** - estimated 1-2 hours total implementation time

---

## Why

### Current State

**What Exists:**
- ✅ Tooltip UI component rendered conditionally (lines 172-193)
- ✅ Mouse position tracking (`mousePosition` state, `handleMouseMove` handler)
- ✅ Tooltip follows cursor with offset
- ✅ Displays muscle name, fatigue %, and status text
- ✅ Styled with proper z-index and pointer-events handling

**What's Broken:**
- ❌ `hoveredMuscle` state is never set (always `null`)
- ❌ No event handler to detect when mouse enters/leaves muscle regions
- ❌ `onMuscleHover` prop exists but is never called
- ❌ Tooltip never renders because `hoveredMuscle && (...)` condition is always false

**Evidence:**
```typescript
// MuscleVisualization.tsx:132 - State declared but never set
const [hoveredMuscle, setHoveredMuscle] = useState<{ name: Muscle; fatigue: number } | null>(null);

// MuscleVisualization.tsx:39 - Prop defined but never invoked
onMuscleHover?: (muscle: Muscle | null) => void;

// MuscleVisualization.tsx:141-147 - Click handler exists, but no hover handler
const handleClick = (stats: IMuscleStats) => {
  const muscleName = REVERSE_MUSCLE_MAP[stats.muscle];
  if (muscleName && onMuscleClick) {
    onMuscleClick(muscleName);
  }
};

// MISSING: handleHover function to set hoveredMuscle state
```

### Value Proposition

**For Users:**
- **Instant feedback:** See exact fatigue percentage without clicking
- **Reduced friction:** Hover is faster than click for information gathering
- **Better UX:** Progressive disclosure - glance → hover → click
- **Desktop optimization:** Takes advantage of mouse precision

**For System:**
- **Completes MVP:** Progressive disclosure Level 2 per brainstorming doc
- **Zero risk:** No new UI, no API changes, pure wiring
- **Foundation for analytics:** Can track hover patterns to understand user behavior

**Evidence from Brainstorming Document:**
> **Level 2: Hover**
> - Hover over muscle → Tooltip appears
> - Shows: Muscle name, Exact fatigue percentage

This was defined as part of the MVP progressive disclosure strategy but was not completed.

---

## What Changes

### Modified Capabilities

**`muscle-visualization-interactions`** (existing spec)
- MODIFIED: Add hover event handler implementation
- MODIFIED: Wire up `onMuscleHover` callback to `setHoveredMuscle`
- MODIFIED: Clear hover state when mouse leaves muscle region

### New Capabilities

**None** - This is a bug fix that wires up existing infrastructure.

### Removed Capabilities

**None** - This is additive only.

---

## Design

### Technical Approach

The `react-body-highlighter` library's `<Model>` component already supports an `onHover` callback (similar to the `onClick` handler already implemented). We need to:

1. **Add hover handler function** in `MuscleVisualization.tsx`:
   ```typescript
   const handleHover = (stats: IMuscleStats | null) => {
     if (!stats) {
       // Mouse left muscle region
       setHoveredMuscle(null);
       if (onMuscleHover) onMuscleHover(null);
       return;
     }

     // Mouse entered muscle region
     const muscleName = REVERSE_MUSCLE_MAP[stats.muscle];
     if (muscleName) {
       const fatiguePercent = muscleStates[muscleName]?.currentFatiguePercent ?? 0;
       setHoveredMuscle({ name: muscleName, fatigue: fatiguePercent });
       if (onMuscleHover) onMuscleHover(muscleName);
     }
   };
   ```

2. **Pass handler to Model component**:
   ```typescript
   <Model
     data={data}
     highlightedColors={colors}
     type={type}
     onClick={handleClick}
     onHover={handleHover}  // Add this line
     style={{ /* ... */ }}
     bodyColor="#2d3748"
   />
   ```

3. **Verify react-body-highlighter API** supports `onHover` prop
   - If not, use CSS hover detection + DOM event listeners as fallback
   - Or use SVG `onMouseEnter`/`onMouseLeave` events directly

### Edge Cases

1. **Rapid hover movements:** Debounce hover state updates if performance issues occur
2. **Touch devices:** Tooltip should not activate on touch (already handled with pointer-events: none)
3. **Keyboard navigation:** Tooltip should appear when muscle is focused via keyboard (future enhancement)
4. **Muscle unmount during hover:** Clear hover state in cleanup function

---

## Implementation Phases

### Phase 1: Research API Support (30 min)
- Check `react-body-highlighter` documentation for `onHover` support
- Test if `onHover` callback is available
- Document API signature if different from `onClick`

### Phase 2: Implement Handler (30 min)
- Add `handleHover` function to `MuscleVisualization.tsx`
- Wire up to `<Model>` component
- Test hover state updates in browser DevTools

### Phase 3: Testing & Polish (30 min)
- Test hover on all 13 muscle groups (front + back)
- Verify tooltip positioning follows cursor correctly
- Check edge cases (rapid movements, leaving component)
- Test on different screen sizes

**Total Estimated Time:** 1.5 hours

---

## Acceptance Criteria

This fix is considered complete when:

1. **Hover triggers tooltip:** Moving mouse over any muscle region displays tooltip
2. **Tooltip shows correct data:** Muscle name and fatigue percentage match muscle states API
3. **Tooltip follows cursor:** Tooltip positioned 15px offset from cursor (as designed)
4. **Hover clears on exit:** Moving mouse away from muscle clears tooltip immediately
5. **No performance issues:** No lag or jank during rapid hover movements
6. **Works on all muscles:** All 13 muscle groups (front + back) respond to hover
7. **Desktop only:** Touch devices do not trigger tooltip (existing pointer-events: none works)

---

## Risks & Mitigation

### Risk: react-body-highlighter doesn't support onHover callback
**Likelihood:** Medium
**Impact:** Low (alternative approaches available)
**Mitigation:**
- Use CSS `:hover` pseudo-class + DOM query to detect hovered elements
- Add `onMouseEnter`/`onMouseLeave` to SVG paths directly
- Use MutationObserver to track hover class changes

### Risk: Performance issues with hover state updates
**Likelihood:** Low
**Impact:** Low (minor UX degradation)
**Mitigation:**
- Debounce state updates with requestAnimationFrame
- Memoize REVERSE_MUSCLE_MAP lookups
- Profile with React DevTools to verify 60 FPS maintained

---

## Dependencies

**Requires:**
- ✅ `implement-muscle-visualization-feature` Phase 1, 2, 4 complete
- ✅ `react-body-highlighter` package installed
- ✅ Tooltip UI component implemented (MuscleVisualization.tsx:172-193)

**Blocks:**
- None - this is a polish fix on existing functionality

**Related:**
- `implement-muscle-deep-dive-modal` (future proposal for Level 3 progressive disclosure)

---

## Success Metrics

**Functional:**
- 100% of muscle regions trigger tooltip on hover
- Zero console errors or warnings during hover interactions
- Tooltip appears within 50ms of hover (perceived as instant)

**Qualitative:**
- User feedback mentions "easy to see fatigue percentages"
- Reduced click interactions on muscle visualization (users get info from hover instead)

---

## Open Questions

1. **Does react-body-highlighter support onHover natively?**
   - **Action:** Check library documentation and source code
   - **Timeline:** Before implementation phase 2

2. **Should we debounce hover state updates?**
   - **Proposal:** No debouncing for MVP, add only if performance issues observed
   - **Rationale:** Simple implementation first, optimize if needed

3. **Should hovering a muscle also highlight it visually (in addition to tooltip)?**
   - **Proposal:** No - existing CSS `:hover` brightness effect is sufficient
   - **Rationale:** Don't confuse hover with selection (which has glow animation)

---

## References

### Internal Documentation
- **Muscle Viz Implementation:** `openspec/changes/2025-10-27-implement-muscle-visualization-feature/`
- **Brainstorming Session:** `docs/brainstorming-session-results-2025-10-27.md` (lines 298-322 on progressive disclosure)
- **Component Code:** `components/MuscleVisualization.tsx` (lines 132, 172-193)

### External Resources
- **react-body-highlighter:** https://github.com/giavinh79/react-body-highlighter
- **React Hover Events:** https://react.dev/learn/responding-to-events#handling-hover-events

---

## Stakeholder Sign-Off

**Product Owner (Kaelen Jennings):** Approved - "This should have been working already. Quick fix to complete the MVP."

**Technical Lead:** Approved - "Simple wiring change, low risk, high value."

---

*This proposal documents a bug fix to wire up the existing hover tooltip UI that was implemented but never connected to actual hover events.*

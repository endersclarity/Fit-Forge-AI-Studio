# Implementation Tasks: Muscle Visualization Feature

**Change ID:** `implement-muscle-visualization-feature`
**Status:** Draft
**Estimated Total Time:** 8-13 days (64-104 hours)

---

## Task Overview

This implementation transforms the muscle visualization POC into a production-ready feature with full interactivity, accessibility, mobile support, and data synchronization.

**Dependencies:**
- ✅ Research POC complete (`research-muscle-visualization-poc`)
- ✅ react-body-highlighter installed
- ✅ MuscleVisualization.tsx component exists
- ⏳ Personal engagement calibration (optional, can integrate later)

---

## Phase 1: Interactive Core (2-3 days)

**Goal:** Implement click behavior, muscle selection, and exercise filtering

### Task 1.1: Implement Muscle Selection State Management
**Time:** 4 hours
**Files:**
- Create `src/components/MuscleVisualization/MuscleVisualizationContainer.tsx`
- Create `src/components/MuscleVisualization/useMuscleVisualization.ts` (custom hook)

**Acceptance Criteria:**
- [ ] Container component manages selected muscles as `Set<Muscle>`
- [ ] Selection state persists to localStorage
- [ ] State updates trigger re-renders of child components
- [ ] Clear selection function available

**Implementation Details:**
```typescript
// useMuscleVisualization.ts
export function useMuscleVisualization() {
  const [selectedMuscles, setSelectedMuscles] = useState<Set<Muscle>>(
    () => {
      const saved = localStorage.getItem('muscle-viz-selection');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
  );

  const toggleMuscle = (muscle: Muscle) => {
    setSelectedMuscles(prev => {
      const next = new Set(prev);
      if (next.has(muscle)) {
        next.delete(muscle);
      } else {
        next.add(muscle);
      }
      localStorage.setItem('muscle-viz-selection', JSON.stringify([...next]));
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedMuscles(new Set());
    localStorage.removeItem('muscle-viz-selection');
  };

  return { selectedMuscles, toggleMuscle, clearSelection };
}
```

---

### Task 1.2: Add Visual Selection Feedback
**Time:** 3 hours
**Files:**
- Modify `src/components/MuscleVisualization/MuscleVisualization.tsx`
- Create `src/components/MuscleVisualization/styles.module.css`

**Acceptance Criteria:**
- [ ] Selected muscles display 2px white outline
- [ ] Selected muscles have drop-shadow glow effect
- [ ] Selection animates smoothly (300ms transition)
- [ ] Hover state works independently of selection state

**CSS Implementation:**
```css
.muscle-region {
  transition: fill 0.3s ease-in-out,
              stroke 0.2s ease-in-out,
              opacity 0.2s ease-in-out;
  cursor: pointer;
}

.muscle-region.selected {
  stroke: white;
  stroke-width: 2px;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
}

.muscle-region:hover {
  opacity: 0.85;
  filter: brightness(1.1);
}
```

---

### Task 1.3: Integrate Exercise List Filtering
**Time:** 4 hours
**Files:**
- Modify `src/components/Dashboard.tsx`
- Modify exercise recommendation display logic

**Acceptance Criteria:**
- [ ] Selecting muscle filters exercise list (OR logic for multi-select)
- [ ] Exercise list header shows "Exercises for [Muscle Names]"
- [ ] Exercises sorted by engagement percentage for selected muscles
- [ ] Clearing selection shows all exercises again

**Implementation:**
```typescript
// In Dashboard.tsx
const [selectedMuscles, setSelectedMuscles] = useState<Set<Muscle>>(new Set());

const filteredExercises = useMemo(() => {
  if (selectedMuscles.size === 0) return allExercises;

  return allExercises
    .filter(exercise => {
      // Show exercises that target ANY selected muscle (OR logic)
      return Array.from(selectedMuscles).some(muscle =>
        exercise.muscleEngagement[muscle] > 0
      );
    })
    .sort((a, b) => {
      // Sort by total engagement of selected muscles
      const aTotal = Array.from(selectedMuscles).reduce(
        (sum, m) => sum + (a.muscleEngagement[m] || 0), 0
      );
      const bTotal = Array.from(selectedMuscles).reduce(
        (sum, m) => sum + (b.muscleEngagement[m] || 0), 0
      );
      return bTotal - aTotal;
    });
}, [allExercises, selectedMuscles]);
```

---

### Task 1.4: Add Clear Selection Controls
**Time:** 2 hours
**Files:**
- Create `src/components/MuscleVisualization/MuscleSelectionControls.tsx`

**Acceptance Criteria:**
- [ ] "Clear Selection" button appears when muscles selected
- [ ] Button disappears when no muscles selected
- [ ] ESC key clears selection
- [ ] Button has accessible label and keyboard support

---

### Task 1.5: Add Multi-Select UI Hint
**Time:** 1 hour
**Files:**
- Modify `MuscleVisualizationContainer.tsx`

**Acceptance Criteria:**
- [ ] Hint text appears after first muscle selected
- [ ] Hint: "Click more muscles to refine your search"
- [ ] Hint fades out after 3 seconds or second selection
- [ ] Hint doesn't appear if user has seen it before (localStorage flag)

---

## Phase 2: Data Synchronization (1-2 days)

**Goal:** Implement real-time updates, loading states, and error handling

### Task 2.1: Add Refresh Mechanism
**Time:** 3 hours
**Files:**
- Add refresh button to `MuscleVisualizationContainer.tsx`
- Implement manual refresh handler in `Dashboard.tsx`

**Acceptance Criteria:**
- [ ] Refresh button fetches latest muscle states from API
- [ ] Loading spinner displays during refresh
- [ ] Muscle colors update immediately after data fetch
- [ ] Error message shown if refresh fails

---

### Task 2.2: Implement Optimistic Updates on Workout Completion
**Time:** 4 hours
**Files:**
- Modify workout completion handler in `Dashboard.tsx`
- Create `calculateEstimatedFatigue` utility function

**Acceptance Criteria:**
- [ ] After logging workout, muscle states update immediately (optimistic)
- [ ] API call confirms update in background
- [ ] Actual states replace optimistic states after API response
- [ ] Optimistic update reverts if API call fails

**Implementation:**
```typescript
async function handleWorkoutComplete(workout: Workout) {
  // Optimistic update
  const estimated = calculateEstimatedFatigue(workout, muscleStates);
  setMuscleStates(estimated);

  try {
    await api.post('/api/workouts', workout);
    const actual = await api.get('/api/muscle-states');
    setMuscleStates(actual);
  } catch (error) {
    setMuscleStates(previousMuscleStates); // Revert
    showError('Failed to update muscle states');
  }
}
```

---

### Task 2.3: Add Loading and Error States
**Time:** 3 hours
**Files:**
- Create loading skeleton in `MuscleVisualizationContainer.tsx`
- Create error display component

**Acceptance Criteria:**
- [ ] Loading spinner shows while fetching muscle data
- [ ] Skeleton/placeholder displays during initial load
- [ ] Error message displays if API call fails
- [ ] Retry button available in error state
- [ ] Graceful degradation if data unavailable

---

## Phase 3: Accessibility Foundation (2-3 days)

**Goal:** WCAG 2.1 AA compliance, keyboard navigation, screen reader support

### Task 3.1: Implement Keyboard Navigation
**Time:** 4 hours
**Files:**
- Modify `MuscleVisualization.tsx` to handle keyboard events

**Acceptance Criteria:**
- [ ] Tab key navigates through muscle regions
- [ ] Visible focus ring (3px blue outline) on focused muscle
- [ ] Enter/Space selects focused muscle
- [ ] ESC clears all selections
- [ ] Logical tab order (top to bottom, left to right)

**Implementation:**
```typescript
const handleKeyDown = (e: KeyboardEvent, muscle: Muscle) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleMuscle(muscle);
  } else if (e.key === 'Escape') {
    clearSelection();
  }
};

// In SVG:
<g
  tabIndex={0}
  onKeyDown={(e) => handleKeyDown(e, muscle)}
  role="button"
  aria-pressed={isSelected}
>
  {/* paths */}
</g>
```

---

### Task 3.2: Add ARIA Labels and Roles
**Time:** 3 hours
**Files:**
- Modify `MuscleVisualization.tsx` with ARIA attributes

**Acceptance Criteria:**
- [ ] Each muscle has `role="button"`
- [ ] Each muscle has descriptive `aria-label`
- [ ] Selected muscles have `aria-pressed="true"`
- [ ] Live region announces selection changes
- [ ] SVG has `<title>` and `<desc>` tags

**ARIA Label Format:**
```typescript
const getAriaLabel = (muscle: Muscle, fatigue: number, isSelected: boolean) => {
  const status = fatigue < 33 ? 'ready to train' :
                 fatigue < 66 ? 'moderate work' :
                 'needs recovery';
  const selectedText = isSelected ? ', selected' : ', not selected';
  return `${muscle}, ${fatigue}% fatigued, ${status}${selectedText}, press Enter to ${isSelected ? 'deselect' : 'select'}`;
};
```

---

### Task 3.3: Implement Screen Reader Announcements
**Time:** 3 hours
**Files:**
- Add live region to `MuscleVisualizationContainer.tsx`

**Acceptance Criteria:**
- [ ] Selection changes announced via `aria-live="polite"`
- [ ] Announcement format: "[Muscle] selected. Showing X exercises."
- [ ] Clear selection announced: "All selections cleared. Showing all exercises."
- [ ] Announcements don't interrupt user flow

---

### Task 3.4: Add Color-Blind Support (Patterns)
**Time:** 4 hours
**Files:**
- Add SVG pattern definitions to `MuscleVisualization.tsx`
- Modify color mapping to include patterns

**Acceptance Criteria:**
- [ ] Green muscles: No pattern (solid)
- [ ] Yellow muscles: Diagonal lines pattern
- [ ] Red muscles: Dots pattern
- [ ] Patterns visible but don't obscure colors
- [ ] User preference toggle for patterns (accessibility settings)

**Pattern Definitions:**
```xml
<defs>
  <pattern id="moderate-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
    <path d="M0,8 l8,-8" stroke="#000" stroke-width="1" opacity="0.3"/>
  </pattern>
  <pattern id="fatigued-dots" width="8" height="8" patternUnits="userSpaceOnUse">
    <circle cx="4" cy="4" r="2" fill="#000" opacity="0.3"/>
  </pattern>
</defs>
```

---

### Task 3.5: Test with Screen Readers
**Time:** 3 hours
**Tools:** NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS)

**Acceptance Criteria:**
- [ ] Muscle regions announced correctly
- [ ] Selection state announced correctly
- [ ] Exercise filter changes announced
- [ ] Keyboard navigation works with screen reader active
- [ ] No orphaned or confusing announcements

---

## Phase 4: Mobile Optimization (1-2 days)

**Goal:** Responsive layout, touch interactions, performance on mobile devices

### Task 4.1: Implement Responsive Layout
**Time:** 3 hours
**Files:**
- Modify `MuscleVisualizationDual.tsx` with responsive grid
- Add media queries to `styles.module.css`

**Acceptance Criteria:**
- [ ] Mobile (<768px): Stacked vertical layout
- [ ] Tablet (768-1024px): Side-by-side, reduced size
- [ ] Desktop (>1024px): Side-by-side, full size
- [ ] SVG scales appropriately at all breakpoints
- [ ] No horizontal scrolling on mobile

**Responsive CSS:**
```css
/* Mobile */
@media (max-width: 768px) {
  .muscle-viz-dual {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .muscle-viz-view {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .muscle-viz-dual {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .muscle-viz-dual {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}
```

---

### Task 4.2: Optimize Touch Interactions
**Time:** 3 hours
**Files:**
- Add touch event handlers to `MuscleVisualization.tsx`

**Acceptance Criteria:**
- [ ] Tap selects muscle (touchend event)
- [ ] Long-press (>500ms) opens engagement modal
- [ ] Touch targets minimum 44x44px
- [ ] No accidental selections during scrolling
- [ ] Touch feedback (ripple effect on tap)

**Touch Handlers:**
```typescript
const handleTouchStart = (e: TouchEvent, muscle: Muscle) => {
  touchTimer.current = setTimeout(() => {
    // Long press detected
    openEngagementModal(muscle);
  }, 500);
};

const handleTouchEnd = (e: TouchEvent, muscle: Muscle) => {
  if (touchTimer.current) {
    clearTimeout(touchTimer.current);
    // Short tap = selection
    toggleMuscle(muscle);
  }
};
```

---

### Task 4.3: Performance Optimization for Mobile
**Time:** 3 hours
**Files:**
- Optimize SVG rendering
- Add lazy loading

**Acceptance Criteria:**
- [ ] Front view loads first, back view lazy loads
- [ ] Animations disabled in low-power mode
- [ ] 60 FPS maintained on iPhone SE and Pixel 5
- [ ] Bundle size impact <100KB gzipped

---

## Phase 5: Calibration Integration (1 day)

**Goal:** Show calibration indicators, integrate with calibration system

### Task 5.1: Add Calibration Indicator Badges
**Time:** 3 hours
**Files:**
- Add badge overlay to `MuscleVisualization.tsx`

**Acceptance Criteria:**
- [ ] Calibrated muscles show small "settings" icon badge
- [ ] Badge positioned at top-right of muscle region
- [ ] Badge visible but doesn't obstruct fatigue color
- [ ] Badge has tooltip explaining calibration

---

### Task 5.2: Integrate Calibration Data
**Time:** 3 hours
**Files:**
- Fetch calibration status from API
- Modify tooltip to show calibration status

**Acceptance Criteria:**
- [ ] Tooltip shows "🔧 Calibrated" for calibrated muscles
- [ ] Fatigue calculations reflect calibrated engagement percentages
- [ ] Link to calibration modal from muscle click (Ctrl/Cmd+click)

---

## Phase 6: Polish & Launch (1-2 days)

**Goal:** Animations, onboarding, analytics, final testing

### Task 6.1: Add Animation Transitions
**Time:** 3 hours
**Files:**
- Add CSS animations to `styles.module.css`

**Acceptance Criteria:**
- [ ] Selection glow pulses subtly (2s loop)
- [ ] Color transitions smooth (300ms)
- [ ] Tooltip fades in/out (200ms)
- [ ] Respect prefers-reduced-motion

---

### Task 6.2: Implement Onboarding Tooltips
**Time:** 3 hours
**Files:**
- Create onboarding tooltip component

**Acceptance Criteria:**
- [ ] First-time users see "Click muscles to filter exercises" tooltip
- [ ] Tooltip dismisses after 10 seconds or user interaction
- [ ] Tooltip shown only once (localStorage flag)

---

### Task 6.3: Add Analytics Instrumentation
**Time:** 2 hours
**Files:**
- Add analytics events to interactions

**Acceptance Criteria:**
- [ ] Track muscle_selected events
- [ ] Track muscle_deselected events
- [ ] Track clear_selection events
- [ ] Track exercise_filtered_by_muscle events

---

### Task 6.4: Final Testing and Bug Fixes
**Time:** 8 hours
**Testing Checklist:**
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual testing on Chrome, Firefox, Safari, Edge
- [ ] Mobile testing on iOS Safari and Android Chrome
- [ ] Accessibility audit passing (axe, Pa11y)
- [ ] Screen reader testing complete
- [ ] Performance audit passing (Lighthouse >90)
- [ ] User acceptance testing with 3 users

---

## Validation Criteria

The implementation is considered complete when:

1. **Functional:**
   - [ ] All interaction requirements met (click, multi-select, clear, filter)
   - [ ] All data sync requirements met (refresh, optimistic updates, errors)

2. **Accessible:**
   - [ ] WCAG 2.1 AA compliant (automated + manual tests)
   - [ ] Keyboard navigation works flawlessly
   - [ ] Screen readers announce correctly

3. **Mobile:**
   - [ ] Responsive layout works on all breakpoints
   - [ ] Touch interactions smooth and accurate
   - [ ] Performance >60 FPS on target devices

4. **Quality:**
   - [ ] Unit test coverage >80%
   - [ ] Zero console errors or warnings
   - [ ] Lighthouse scores: Performance >90, Accessibility 100

5. **User Tested:**
   - [ ] 3 users successfully complete tasks without instruction
   - [ ] Positive feedback on visual clarity and ease of use

---

## Risk Mitigation

**If behind schedule:**
- Defer Phase 5 (Calibration Integration) - can add later
- Defer onboarding tooltips - not critical for launch
- Defer analytics instrumentation - can add post-launch

**If performance issues:**
- Simplify SVG paths on mobile
- Reduce animation complexity
- Lazy load back view

**If accessibility issues:**
- Budget extra time for manual screen reader testing
- Consult WCAG expert if needed
- Use automated tools early and often

---

## Dependencies & Blockers

**External Dependencies:**
- ✅ react-body-highlighter library (already installed)
- ✅ Muscle states API endpoint (functional)
- ⏳ Calibration API endpoint (optional for Phase 5)

**Internal Dependencies:**
- ✅ POC completed and validated
- ⏳ Exercise recommendation component refactor (can work in parallel)

**No Known Blockers**

---

## Success Metrics

**Development Metrics:**
- Code review approval on first submission: 80% of PRs
- Zero critical bugs in first 2 weeks post-launch
- Unit test coverage >80%

**User Metrics:**
- 80%+ of users interact with muscle viz in first session
- Average 3+ muscle clicks per dashboard visit
- 50%+ of workouts started from muscle → exercise flow

---

*This task plan provides a complete roadmap for implementing the muscle visualization feature, with clear acceptance criteria, time estimates, and validation checkpoints.*

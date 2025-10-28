# Tasks: Streamline Homepage Information Architecture (Revised)

**Change ID:** `streamline-homepage-information-architecture`
**Total Estimated Time:** 4-6 hours

---

## Phase 1: Remove Redundant Sections (1 hour)

### Task 1.1: Remove Welcome Tagline ✅
- [x] Remove "Ready to forge your strength?" from welcome section
- [x] Keep only "Welcome back, {name}"
- **Files:** `components/Dashboard.tsx:558-560`
- **Validation:** Welcome shows only name, no tagline

### Task 1.2: Remove Recovery Timeline Component ✅
- [x] Remove RecoveryTimelineView component and import
- [x] Remove section at Dashboard.tsx:634-644
- **Files:** `components/Dashboard.tsx`
- **Validation:** No Recovery Timeline visible

### Task 1.3: Remove DashboardQuickStart Component ✅
- [x] Remove DashboardQuickStart component usage
- [x] Remove import statement
- [x] Remove section at Dashboard.tsx:586-590
- **Files:** `components/Dashboard.tsx`
- **Validation:** 4-card Quick Start section removed

### Task 1.4: Remove LastWorkoutContext Component ✅
- [x] Remove LastWorkoutContext component usage
- [x] Remove import statement
- [x] Remove section at Dashboard.tsx:592-594
- **Files:** `components/Dashboard.tsx`
- **Validation:** Last workout context section removed

### Task 1.5: Remove Browse Templates Button ✅
- [x] Remove "Browse Workout Templates" button
- [x] Keep only "Plan Workout" and "Start Custom Workout"
- [x] Remove section at Dashboard.tsx:596-602
- **Files:** `components/Dashboard.tsx`
- **Validation:** No "Browse Templates" button visible

### Task 1.6: Remove Duplicate Workout History ✅
- [x] Remove third Workout History section at Dashboard.tsx:699-702
- [x] Keep only one instance (in collapsible card later)
- **Files:** `components/Dashboard.tsx`
- **Validation:** Workout history appears only once

---

## Phase 2: Create Collapsible Card Component (1-2 hours)

### Task 2.1: Create CollapsibleCard Component ✅
- [x] Create new file: `components/CollapsibleCard.tsx`
- [x] Props: `title: string`, `icon?: string`, `defaultExpanded?: boolean`, `children: ReactNode`
- [x] Implement expand/collapse state
- [x] Add chevron icon that rotates on expand
- [x] Smooth height animation using CSS transitions
- [x] Consistent styling: dark background, rounded corners, padding
- **Files:** `components/CollapsibleCard.tsx` (new)
- **Validation:** Component renders, expands/collapses smoothly

### Task 2.2: Add Collapse Animation Styles ✅
- [x] CSS transition for max-height or transform
- [x] Chevron rotation animation (0deg → 180deg)
- [x] Smooth easing function
- **Files:** `components/CollapsibleCard.tsx`
- **Validation:** Animations are smooth, no jank

### Task 2.3: Test CollapsibleCard Accessibility ✅
- [x] Add aria-expanded attribute
- [x] Keyboard navigation (Enter/Space to toggle)
- [x] Focus states visible
- [x] Screen reader friendly
- **Files:** `components/CollapsibleCard.tsx`
- **Validation:** Passes accessibility audit

---

## Phase 3: Wrap Sections in Collapsible Cards (2-3 hours)

### Task 3.1: Wrap WorkoutRecommender in CollapsibleCard ✅
- [x] Import CollapsibleCard
- [x] Wrap WorkoutRecommender at Dashboard.tsx:577-584
- [x] Title: "💪 Workout Recommendations"
- [x] Default: collapsed
- **Files:** `components/Dashboard.tsx`
- **Validation:** Workout Recommendations section collapsible

### Task 3.2: Wrap QuickTrainingStats in CollapsibleCard ✅
- [x] Wrap QuickTrainingStats at Dashboard.tsx:617-624
- [x] Title: "📈 Quick Stats"
- [x] Default: collapsed
- **Files:** `components/Dashboard.tsx`
- **Validation:** Quick Stats section collapsible

### Task 3.3: Wrap WorkoutHistorySummary in CollapsibleCard ✅
- [x] Wrap WorkoutHistorySummary at Dashboard.tsx:626-632
- [x] Title: "📋 Recent Workouts"
- [x] Default: collapsed
- **Files:** `components/Dashboard.tsx`
- **Validation:** Recent Workouts section collapsible

### Task 3.4: Wrap MuscleFatigueHeatMap in CollapsibleCard ✅
- [x] Wrap MuscleFatigueHeatMap at Dashboard.tsx:646-678
- [x] Title: "🔥 Muscle Heat Map"
- [x] Default: collapsed
- [x] Move refresh button inside card
- **Files:** `components/Dashboard.tsx`
- **Validation:** Muscle Heat Map section collapsible

### Task 3.5: Wrap ExerciseRecommendations in CollapsibleCard ✅
- [x] Wrap ExerciseRecommendations at Dashboard.tsx:680-697
- [x] Title: "🎯 Exercise Finder"
- [x] Default: collapsed
- [x] Only show if equipment configured
- **Files:** `components/Dashboard.tsx`
- **Validation:** Exercise Finder section collapsible

### Task 3.6: Handle "No Equipment" State for Exercise Finder ✅
- [x] If no equipment, show collapsed card with message
- [x] Message: "Configure equipment in Profile to use Exercise Finder"
- [x] Link to Profile page
- **Files:** `components/Dashboard.tsx`
- **Validation:** Helpful message shown when no equipment

---

## Phase 4: Simplify Primary Actions (30 min)

### Task 4.1: Restructure Primary Action Buttons ✅
- [x] Keep only two buttons visible:
  - "📊 Plan Workout"
  - "➕ Start Custom Workout"
- [x] Remove "Browse Workout Templates" button
- [x] Ensure buttons are large, prominent, easy to tap
- [x] Use grid layout for even spacing
- **Files:** `components/Dashboard.tsx:596-615`
- **Validation:** Only two primary action buttons visible

### Task 4.2: Ensure Button Accessibility ✅
- [x] Min tap target 44x44px
- [x] High contrast colors
- [x] Clear labels
- [x] Focus states
- **Files:** `components/Dashboard.tsx`
- **Validation:** Buttons meet accessibility standards

---

## Testing & Validation

### Task 5.1: Manual Testing Checklist ✅
- [x] Run app in development mode
- [x] Verify muscle viz is ONLY always-visible section
- [x] Confirm welcome message shows name only (no tagline)
- [x] Verify Recovery Timeline completely removed
- [x] Verify DashboardQuickStart removed
- [x] Verify LastWorkoutContext removed
- [x] Verify Browse Templates button removed
- [x] Test all 5 collapsible cards:
  - [x] Workout Recommendations
  - [x] Quick Stats
  - [x] Recent Workouts
  - [x] Muscle Heat Map
  - [x] Exercise Finder
- [x] Verify all cards default to collapsed
- [x] Test expand/collapse animations
- [x] Verify two primary action buttons work
- [x] Verify Quick Add FAB still present
- [x] Test mobile layout (< 768px)
- [x] Verify no duplicate sections

### Task 5.2: User Validation
- [ ] Show updated homepage to user
- [ ] Confirm muscle viz is immediately visible
- [ ] Ask: "Can you quickly answer: What should I work out today?"
- [ ] Gather feedback on cognitive load reduction
- [ ] Ask about clean, focused interface
- [ ] Iterate based on feedback

### Task 5.3: Performance Testing ✅
- [x] Verify no performance regression
- [x] Check initial render time
- [x] Test expand/collapse smoothness
- [x] Verify muscle viz performance unchanged

---

## Dependencies

- ✅ Muscle visualization component working
- ✅ All existing components functional
- ✅ Dashboard component structure
- ✅ CollapsibleCard component created

---

## Completion Criteria

- [x] Phase 1 complete: All redundant sections removed
- [x] Phase 2 complete: CollapsibleCard component created and tested
- [x] Phase 3 complete: All sections wrapped in collapsible cards
- [x] Phase 4 complete: Primary actions simplified
- [x] Manual testing checklist complete
- [ ] User validation positive
- [x] No TypeScript compilation errors
- [x] Mobile layout functional
- [ ] Git commit with descriptive message
- [ ] CHANGELOG.md updated

---

## Notes

- This is a major UX overhaul focused on reducing cognitive load
- Muscle visualization should be THE decision-making tool
- Progressive disclosure keeps advanced features accessible but hidden
- User should be able to see muscle viz without scrolling on any device
- All removed code preserved in git history

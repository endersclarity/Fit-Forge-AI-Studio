# Tasks: Enhance Recovery Dashboard

**Change ID:** `enhance-recovery-dashboard`
**Status:** Completed
**Created:** 2025-10-25
**Completed:** 2025-10-25

---

## Overview

**Estimated Total Time:** 10-13 hours

This implementation plan breaks down the enhanced recovery dashboard into 4 sequential phases, with each phase delivering visible user value.

---

## Phase 1: Statistics Calculation Layer (2-3 hours)

**Goal:** Create reusable calculation functions that power all dashboard enhancements.

### Task 1.1: Create stats utility module
- [x] Create `utils/statsHelpers.ts` file
- [x] Define TypeScript interfaces:
  - `PRHighlight`
  - `WeeklyStats`
- [x] Set up Jest test file (optional for V1)

**Verification:** File created, types compile

---

### Task 1.2: Implement streak calculation
- [x] Write `calculateStreak(workouts: WorkoutSession[]): number` function
- [x] Handle edge cases:
  - No workouts (return 0)
  - Workout today only (return 1)
  - Consecutive days with multiple workouts per day
  - Streak broken (gap > 1 day)
- [x] Test manually with sample data

**Algorithm:**
```typescript
// 1. Sort workouts by date descending
// 2. Check if workout exists for today
// 3. Count backward consecutive days
// 4. Break on first gap > 1 day
```

**Verification:** Test cases pass:
- No workouts → 0
- Today only → 1
- 5 consecutive days → 5
- Gap yesterday → 0

---

### Task 1.3: Implement weekly stats calculation
- [x] Write `calculateWeeklyStats(workouts: WorkoutSession[]): WeeklyStats` function
- [x] Define week boundaries (Sunday 00:00 - Saturday 23:59)
- [x] Handle timezone correctly (use user's local time)
- [x] Count workouts in current week vs last week

**Verification:** Test cases pass:
- Current week: 4, Last week: 3 → `{ thisWeek: 4, lastWeek: 3 }`
- Week boundary handling (Saturday/Sunday)

---

### Task 1.4: Implement PR finder
- [x] Write `findRecentPRs(personalBests, workouts): PRHighlight[]` function
- [x] Filter PRs from last 7 days
- [x] Calculate improvement percentage
- [x] Sort by improvement (highest first)
- [x] Return top 2-3 PRs

**Verification:** Test with mock data:
- PRs in last 7 days appear
- Older PRs excluded
- Sorted correctly

---

### Task 1.5: Implement recovery grouping
- [x] Write `groupMusclesByRecovery(muscleStates): RecoveryGroups` function
- [x] Group muscles:
  - Ready: daysUntilRecovered <= 0
  - Recovering: 0 < days <= 2
  - Fatigued: days > 2
- [x] Sort each group alphabetically
- [x] Handle muscles never trained (lastTrained = null)

**Verification:** Test with mock muscle states:
- Correct grouping
- Alphabetical sorting
- Never-trained muscles → "Ready"

---

**Phase 1 Deliverable:** All calculation functions working, tested, and ready to use.

---

## Phase 2: Quick Training Stats Component (2-3 hours)

**Goal:** Create and integrate the statistics summary cards at top of dashboard.

### Task 2.1: Create QuickTrainingStats component
- [x] Create `components/QuickTrainingStats.tsx`
- [x] Define props interface
- [x] Implement purely presentational component (no state)
- [x] Wrap in React.memo for performance

**Component Structure:**
```tsx
interface QuickTrainingStatsProps {
  streak: number;
  weeklyStats: { thisWeek: number; lastWeek: number };
  recentPRs: PRHighlight[];
}
```

**Verification:** Component compiles, accepts props

---

### Task 2.2: Implement streak card
- [x] Display fire emoji + "Streak" label
- [x] Show streak value (bold, large)
- [x] Color based on streak:
  - Green if >= 3 days
  - Yellow if 1-2 days
  - Gray if 0 days
- [x] Show encouragement text if streak = 0

**Verification:** Visual check with different streak values

---

### Task 2.3: Implement weekly stats card
- [x] Display chart emoji + "This Week" label
- [x] Show this week's count
- [x] Calculate and display trend vs last week:
  - ↑ from X (green if increased)
  - ↓ from X (red if decreased)
  - → same (gray if equal)

**Verification:** Visual check with different weekly counts

---

### Task 2.4: Implement PR card
- [x] Display trophy emoji + "PRs" label
- [x] Show PR count: "X new"
- [x] Make clickable if PRs exist
- [x] On click: Show toast with PR details
  - Exercise names
  - PR type (single/volume)
  - Improvement percentage

**Verification:** Click shows toast with correct PR data

---

### Task 2.5: Implement responsive grid layout
- [x] Use Tailwind grid utilities:
  - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- [x] Test on mobile (1 column)
- [x] Test on tablet (2 columns)
- [x] Test on desktop (3 columns)

**Verification:** Responsive layout works on all screen sizes

---

### Task 2.6: Integrate into Dashboard
- [x] Import `QuickTrainingStats` in `Dashboard.tsx`
- [x] Add useMemo calculations:
  ```tsx
  const streak = useMemo(() => calculateStreak(workouts), [workouts]);
  const weeklyStats = useMemo(() => calculateWeeklyStats(workouts), [workouts]);
  const recentPRs = useMemo(() => findRecentPRs(personalBests, workouts), [personalBests, workouts]);
  ```
- [x] Place component at top of Dashboard (before muscle heat map)
- [x] Pass calculated values as props

**Verification:** Stats display correctly on Dashboard

---

**Phase 2 Deliverable:** Quick Stats cards visible and working at top of Dashboard.

---

## Phase 3: Workout History Summary (2-3 hours)

**Goal:** Display recent workout history in collapsible section.

### Task 3.1: Create WorkoutHistorySummary component
- [x] Create `components/WorkoutHistorySummary.tsx`
- [x] Define props interface:
  ```tsx
  interface WorkoutHistorySummaryProps {
    workouts: WorkoutSession[];
    personalBests: PersonalBestsResponse;
    maxDisplay?: number; // default 5
  }
  ```
- [x] Set up useState for collapse state
- [x] Use `useLocalStorage` hook for persistence

**Verification:** Component compiles

---

### Task 3.2: Implement collapsible section header
- [x] Create header with title: "Recent Workouts"
- [x] Add chevron icon (rotate on expand/collapse)
- [x] Handle click to toggle state
- [x] Persist state in localStorage: `dashboard-history-expanded`
- [x] Smooth animation (200ms transition)

**Verification:** Header toggles section, state persists across refresh

---

### Task 3.3: Format workout dates (relative time)
- [x] Create helper: `formatRelativeDate(date: string): string`
- [x] Logic:
  - Today → "Today"
  - Yesterday → "Yesterday"
  - 2-6 days ago → "X days ago"
  - > 7 days → "Jan 15" (absolute)
- [x] Use in workout rows

**Verification:** Test with various dates:
- Workout today shows "Today"
- Workout 3 days ago shows "3 days ago"
- Workout 15 days ago shows "Jan 15"

---

### Task 3.4: Implement workout row display
- [x] Create row for each workout (up to 5 most recent)
- [x] Display: date | category | variation | duration
- [x] Format duration using existing `formatDuration()` helper
- [x] Highlight today's workouts:
  - Green left border (border-l-4 border-green-400)
  - Subtle green background (bg-green-900/10)

**Verification:** Workout rows display correctly

---

### Task 3.5: Add PR indicators
- [x] Check if workout contains any PRs
- [x] Logic: Compare workout date to personal_bests.updated_at
- [x] If PR found: Display "🎉 PR" badge
- [x] Style badge (text-green-400)

**Verification:** PR badge shows on workouts that set PRs

---

### Task 3.6: Implement empty state
- [x] Detect when workouts.length === 0
- [x] Display message: "No workouts yet. Start your first workout to see history here!"
- [x] Show prominent "Start Workout" button
- [x] Keep section expanded to show message

**Verification:** Empty state shows for new users

---

### Task 3.7: Implement responsive mobile layout
- [x] Default collapsed on mobile (< 768px)
- [x] Adjust row layout for small screens
- [x] Ensure touch targets are 44px minimum

**Verification:** Mobile layout works, collapsed by default

---

### Task 3.8: Integrate into Dashboard
- [x] Import `WorkoutHistorySummary` in Dashboard.tsx
- [x] Place below Quick Stats, above Recovery Timeline
- [x] Pass workouts and personalBests as props

**Verification:** Workout history displays on Dashboard

---

**Phase 3 Deliverable:** Recent workout history visible and collapsible on Dashboard.

---

## Phase 4: Recovery Timeline Visualization (3-4 hours)

**Goal:** Display muscle recovery timeline in grouped, collapsible view.

### Task 4.1: Create RecoveryTimelineView component
- [x] Create `components/RecoveryTimelineView.tsx`
- [x] Define props interface:
  ```tsx
  interface RecoveryTimelineViewProps {
    muscleStates: MuscleStatesResponse;
    onMuscleClick: (muscle: Muscle) => void;
  }
  ```
- [x] Set up useState for collapse state
- [x] Use `useLocalStorage` hook for persistence

**Verification:** Component compiles

---

### Task 4.2: Implement collapsible section header
- [x] Create header with title: "Recovery Timeline"
- [x] Add chevron icon
- [x] Handle click to toggle state
- [x] Persist state in localStorage: `dashboard-timeline-expanded`
- [x] Default collapsed on mobile, expanded on desktop

**Verification:** Header toggles section, persists state

---

### Task 4.3: Implement muscle grouping logic
- [x] Use `groupMusclesByRecovery()` helper from Phase 1
- [x] Transform muscleStates into three groups:
  - Ready Now (daysUntilRecovered <= 0)
  - Recovering Soon (0 < days <= 2)
  - Still Fatigued (days > 2)
- [x] Sort each group alphabetically

**Verification:** Muscle grouping works with test data

---

### Task 4.4: Implement group headers with status
- [x] Create header for each non-empty group
- [x] Display: icon + label + count
  - ✅ READY NOW (5 muscles)
  - ⏳ RECOVERING SOON (2 muscles)
  - 🔴 STILL FATIGUED (3 muscles)
- [x] Color code headers:
  - Green (text-green-400)
  - Yellow (text-yellow-400)
  - Red (text-red-400)

**Verification:** Group headers display correctly

---

### Task 4.5: Implement muscle list for each group
- [x] Display muscles as clickable list items
- [x] Show muscle name
- [x] For "Recovering Soon" and "Still Fatigued":
  - Show countdown: "Pecs (2d)"
  - Round up days: `Math.ceil(daysUntilRecovered)`
- [x] For "Ready Now":
  - Just muscle name, no countdown

**Verification:** Muscle lists display with correct countdown

---

### Task 4.6: Connect to existing muscle modal
- [x] Reuse Dashboard's existing muscle detail modal
- [x] Pass `onMuscleClick` handler from Dashboard
- [x] Clicking muscle name opens modal
- [x] Modal shows exercises for that muscle (existing behavior)

**Verification:** Clicking muscle opens correct modal

---

### Task 4.7: Implement empty state (all recovered)
- [x] Detect when all muscles are in "Ready Now" group
- [x] Display positive message:
  - "✅ All muscle groups fully recovered!"
  - "Ready for any workout type"
- [x] Style in green

**Verification:** All-recovered state shows correctly

---

### Task 4.8: Hide empty groups
- [x] Don't render groups with 0 muscles
- [x] Example: If no "Still Fatigued" muscles, don't show that group

**Verification:** Empty groups are not displayed

---

### Task 4.9: Implement keyboard accessibility
- [x] Make muscle names focusable (tabIndex={0})
- [x] Add visible focus indicators (ring-2 ring-green-500)
- [x] Enter key opens muscle modal
- [x] Escape key closes modal

**Verification:** Keyboard navigation works

---

### Task 4.10: Integrate into Dashboard
- [x] Import `RecoveryTimelineView` in Dashboard.tsx
- [x] Place below Workout History, above Muscle Heat Map
- [x] Pass muscleStates and onMuscleClick handler

**Verification:** Recovery timeline displays on Dashboard

---

**Phase 4 Deliverable:** Recovery timeline visualization complete and integrated.

---

## Final Polish & Testing (1-2 hours)

### Task 5.1: Visual polish
- [x] Ensure consistent spacing between all Dashboard sections (space-y-6)
- [x] Verify color consistency across all new components
- [x] Check animations are smooth (200ms transitions)
- [x] Verify mobile responsive behavior

**Verification:** Visual consistency audit passes

---

### Task 5.2: Performance check
- [x] Verify useMemo prevents unnecessary recalculations
- [x] Check React DevTools for unnecessary re-renders
- [x] Ensure Dashboard loads in < 500ms
- [x] Test with 100+ workouts (stress test)

**Verification:** Performance metrics acceptable

---

### Task 5.3: Accessibility audit
- [x] All interactive elements keyboard accessible
- [x] Focus indicators visible
- [x] Screen reader announces stats correctly
- [x] Color contrast meets WCAG AA standards

**Verification:** Accessibility checklist complete

---

### Task 5.4: Edge case testing
- [x] Test with brand new user (no data)
- [x] Test with partial data (some muscles never trained)
- [x] Test with all muscles fatigued
- [x] Test with all muscles recovered
- [x] Test on different screen sizes

**Verification:** All edge cases handled gracefully

---

### Task 5.5: Documentation update
- [x] Add JSDoc comments to new components
- [x] Update ARCHITECTURE.md if needed
- [x] Update README with new dashboard features
- [x] Take screenshots for handoff docs

**Verification:** Documentation complete

---

## Testing Checklist

**Functional Testing:**
- [x] Quick Stats display correctly on first load
- [x] Streak calculation accurate
- [x] Weekly stats show correct trend
- [x] PR count and details accurate
- [x] Workout history shows last 5 workouts
- [x] Workout dates formatted correctly (relative time)
- [x] Today's workouts highlighted
- [x] PR badges show on correct workouts
- [x] Recovery timeline groups muscles correctly
- [x] Muscle countdown displays accurately
- [x] Collapse/expand works for all sections
- [x] Collapse state persists across refresh
- [x] Mobile layout doesn't overflow
- [x] Desktop shows 3-column stats

**Edge Cases:**
- [x] New user with no workouts (empty states)
- [x] User with 100+ workouts (performance)
- [x] Muscles never trained (show as "Ready")
- [x] All muscles fatigued
- [x] All muscles recovered
- [x] Workout done today (highlight works)
- [x] Single workout in history
- [x] Multiple workouts same day

**Accessibility:**
- [x] Keyboard navigation works
- [x] Screen reader announces correctly
- [x] Focus indicators visible
- [x] Color contrast adequate
- [x] Touch targets 44px minimum (mobile)

**Responsive:**
- [x] Mobile (375px): 1 column layout, sections collapsed
- [x] Tablet (768px): 2 column stats
- [x] Desktop (1280px): 3 column stats
- [x] No horizontal scroll on any size

---

## Success Criteria

**User Experience:**
- ✅ User can see training status at a glance
- ✅ User understands recent workout history
- ✅ User knows when muscles will recover
- ✅ User feels motivated by streak and PRs
- ✅ Dashboard loads fast (< 500ms)

**Technical Quality:**
- ✅ All TypeScript strict mode compliant
- ✅ No console errors or warnings
- ✅ Components are React.memo optimized
- ✅ Calculations use useMemo
- ✅ Responsive on all screen sizes
- ✅ Accessible (keyboard, screen reader)

**Maintainability:**
- ✅ Pure functions easy to test
- ✅ Components well-documented
- ✅ Clear separation of concerns
- ✅ Consistent with existing codebase patterns

---

## Dependencies & Blockers

**External Dependencies:**
- None (uses existing React, TypeScript, Tailwind)

**Internal Dependencies:**
- ✅ Muscle states API (exists)
- ✅ Workouts API (exists)
- ✅ Personal bests API (exists)
- ✅ useLocalStorage hook (exists)
- ✅ formatDuration helper (exists)

**Parallel Work:**
- ✅ Can work on this while other features in progress
- ✅ No database changes required
- ✅ No API changes required
- ✅ No conflicts with existing features

**Potential Blockers:**
- None identified

---

## Rollout Plan

**Incremental Deployment:**
1. Ship Phase 1 + 2 first (Quick Stats only)
2. Gather feedback, monitor performance
3. Ship Phase 3 (Workout History)
4. Ship Phase 4 (Recovery Timeline)
5. Final polish and documentation

**Rollback Plan:**
- New components are isolated (easy to remove)
- No database changes (nothing to migrate)
- Can hide sections with CSS if issues arise
- Can revert git commit if critical bugs

**Low Risk:**
- Pure additive feature
- No breaking changes
- Can ship incrementally

---

*This task breakdown provides a clear, sequential implementation path with verifiable deliverables at each phase.*

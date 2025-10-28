# Proposal: Streamline Homepage Information Architecture

**Change ID:** `streamline-homepage-information-architecture`
**Created:** 2025-10-27
**Updated:** 2025-10-28 (Revised for aggressive progressive disclosure)
**Status:** Draft
**Priority:** High
**Estimated Effort:** 4-6 hours

---

## Why

First real-world user testing revealed severe information overload on the homepage, making it difficult for users to quickly answer the fundamental question: "What should I work out today?" The muscle visualization—the app's primary decision-making tool—was buried among redundant information and duplicate UI elements.

## What Changes

This change restructures the homepage to prioritize decision-making over information density using **aggressive progressive disclosure**:
- Muscle visualization becomes the ONLY hero element (large, prominent, always visible)
- Welcome message simplified from "Welcome back {name}, ready to forge strength" to "Welcome back {name}"
- ALL secondary sections collapse behind expandable cards (default: collapsed)
- Collapsible sections: Workout Recommendations, Quick Stats, History, Heat Map, Exercise Finder
- Primary actions remain visible: "Plan Workout" and "Start Custom Workout" buttons
- Remove ALL redundant sections (Recovery Timeline, duplicate history displays)
- Remove tagline completely

---

## Problem Statement

Based on first real-world user testing (USER_FEEDBACK.md, 2025-10-27), the homepage suffers from severe information overload and redundancy:

1. **Workout history appears THREE times** in different sections
2. **Duplicate buttons:** "Browse Workout Templates" and "View All Templates"
3. **Unnecessary tagline:** "Welcome back tester, ready to forge strength" is silly/redundant
4. **Quick Start shows 4 templates** when it should only show THE NEXT logical workout
5. **Recovery information duplicated** (timeline box + muscle viz)
6. **Workout recommendations shown upfront** instead of progressive disclosure
7. **Muscle visualization not prominent enough** - should be THE primary decision-making tool

**User Quote:**
> "Don't need workout recommendations 'up front' - should be progressive disclosure. Homepage should lead with large, clear muscular structure visualization showing current fatigue levels."

---

## Goals

### Primary Goal
Transform homepage from information-dense dashboard into **decision-focused command center** where muscle fatigue visualization is the hero element.

### Success Criteria
1. ✅ Muscle visualization is the largest, most prominent element on homepage
2. ✅ Workout history appears exactly ONCE (not three times)
3. ✅ No duplicate buttons for same action
4. ✅ Quick Start shows only ONE recommended workout (not 4 templates)
5. ✅ Welcome message is concise: "Welcome back [Name]" (no tagline)
6. ✅ Recovery timeline removed (redundant with muscle viz color coding)
7. ✅ Recommendations hidden behind progressive disclosure (button/modal)

---

## Proposed Solution

### Visual Hierarchy (Top to Bottom)

```
┌─────────────────────────────────────────────────────┐
│ Welcome back Kaelin                    [Profile 👤] │
├─────────────────────────────────────────────────────┤
│                                                     │
│         🧍 LARGE MUSCLE VISUALIZATION               │
│         (Color-coded fatigue heat map)              │
│         Interactive hover with percentages          │
│         4 selected - Click to filter                │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [📊 Plan Workout]                                   │
│ [➕ Start Custom Workout]                            │
├─────────────────────────────────────────────────────┤
│ 💪 Workout Recommendations                     [▼] │
├─────────────────────────────────────────────────────┤
│ 📈 Quick Stats                                 [▼] │
├─────────────────────────────────────────────────────┤
│ 📋 Recent Workouts                             [▼] │
├─────────────────────────────────────────────────────┤
│ 🔥 Muscle Heat Map                             [▼] │
├─────────────────────────────────────────────────────┤
│ 🎯 Exercise Finder                             [▼] │
└─────────────────────────────────────────────────────┘
                    [+ Quick Add] (FAB)
```

### Key Changes

1. **Muscle Visualization** - The ONLY always-visible content section (hero element)
2. **Welcome Message** - Simplified to: `Welcome back ${userName}` (remove tagline)
3. **Primary Actions** - Two large buttons always visible: "Plan Workout" and "Start Custom Workout"
4. **Workout Recommendations** - Collapsed card, expands to show recommended workout + exercises
5. **Quick Stats** - Collapsed card, expands to show streak/weekly stats/PRs
6. **Recent Workouts** - Collapsed card, expands to show last 5 workouts
7. **Muscle Heat Map** - Collapsed card, expands to show detailed muscle fatigue percentages
8. **Exercise Finder** - Collapsed card, expands to show exercise recommendations filtered by selected muscles
9. **Remove Recovery Timeline** - Completely removed (redundant with muscle viz)
10. **Remove Duplicate Sections** - Remove all three instances of workout history, keep only one
11. **Remove DashboardQuickStart** - Redundant with Workout Recommendations card

---

## Capabilities

This change introduces/modifies the following capabilities:

1. **`homepage-layout`** (MODIFIED)
   - The homepage MUST optimize visual hierarchy for decision-making
   - The muscle visualization MUST be the hero element
   - Secondary features MUST use progressive disclosure

2. **`quick-start-recommendation`** (MODIFIED)
   - Quick Start MUST show a single workout recommendation (not 4 templates)
   - Recommendations SHALL be based on rotation logic (future: separate proposal)
   - The display MUST show last workout context

3. **`workout-history-display`** (MODIFIED)
   - Workout history MUST be collapsed by default
   - The display MUST show the last 3 workouts only
   - A link to full history modal/page MUST be provided

---

## Out of Scope

1. **Workout Rotation Logic** - Will be separate proposal
2. **Forecasted Fatigue Builder** - Separate epic-level proposal
3. **Navigation Icon Clarity** - Separate UI cleanup proposal
4. **Configurable Recovery Days** - Separate settings proposal

---

## Dependencies

- ✅ Muscle visualization already implemented (commit 9a36287)
- ✅ Dashboard component exists (`components/Dashboard.tsx`)
- ✅ Workout history API working (`GET /api/workouts`)
- ⚠️  Rotation logic not yet implemented (will use simple heuristic for now)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users expect recommendations upfront | Medium | Add clear button "Get Exercise Recommendations" |
| Collapsed history hides recent activity | Low | Default to expanded on first 3 visits |
| Large muscle viz pushes content down | Low | Optimize mobile layout, allow scroll |
| Quick Start without rotation logic | Medium | Use simple "opposite variation" heuristic |

---

## Implementation Phases

### Phase 1: Remove Redundant Sections (1 hour)
- Remove welcome tagline "Ready to forge your strength?"
- Remove Recovery Timeline component completely
- Remove DashboardQuickStart component (4 template cards)
- Remove LastWorkoutContext component
- Remove duplicate "Browse Templates" button
- Remove third instance of Workout History

### Phase 2: Create Collapsible Card Component (1-2 hours)
- Create reusable `<CollapsibleCard>` component
- Props: title, icon, defaultExpanded, children
- Consistent styling across all cards
- Smooth expand/collapse animation
- Chevron icon indicator

### Phase 3: Wrap Sections in Collapsible Cards (2-3 hours)
- Wrap WorkoutRecommender in CollapsibleCard ("Workout Recommendations")
- Wrap QuickTrainingStats in CollapsibleCard ("Quick Stats")
- Wrap WorkoutHistorySummary in CollapsibleCard ("Recent Workouts")
- Wrap MuscleFatigueHeatMap in CollapsibleCard ("Muscle Heat Map")
- Wrap ExerciseRecommendations in CollapsibleCard ("Exercise Finder")
- All default to collapsed state

### Phase 4: Simplify Primary Actions (30 min)
- Keep only two primary action buttons visible:
  - "📊 Plan Workout" (opens WorkoutPlannerModal)
  - "➕ Start Custom Workout" (starts blank workout)
- Remove "Browse Templates" button (redundant)
- Ensure buttons are prominent and easy to tap

---

## Testing Plan

### Manual Testing Checklist
- [ ] Muscle viz is ONLY always-visible content section
- [ ] Welcome message shows "Welcome back {name}" only (no tagline)
- [ ] Recovery Timeline completely removed
- [ ] DashboardQuickStart (4 cards) completely removed
- [ ] LastWorkoutContext component removed
- [ ] Browse Templates button removed
- [ ] All 5 collapsible cards present and collapsed by default:
  - [ ] Workout Recommendations
  - [ ] Quick Stats
  - [ ] Recent Workouts
  - [ ] Muscle Heat Map
  - [ ] Exercise Finder
- [ ] Clicking card header expands/collapses smoothly
- [ ] Two primary action buttons visible: Plan Workout, Start Custom Workout
- [ ] Quick Add FAB still present in bottom-right
- [ ] Mobile layout clean and readable
- [ ] No duplicate sections visible

### User Validation
- [ ] User can see muscle viz immediately (no scrolling needed)
- [ ] User confirms massive reduction in cognitive load
- [ ] User can quickly answer: "What should I work out today?"
- [ ] User appreciates clean, focused interface

---

## Rollback Plan

If changes negatively impact UX:
1. Git revert to previous commit
2. Keep muscle viz size increase (universally positive)
3. Re-add removed sections one at a time based on user feedback

---

## Related

- **User Feedback:** USER_FEEDBACK.md (2025-10-27 entry)
- **Future Proposals:**
  - Workout Rotation Logic System
  - Navigation Icon Clarity
  - Configurable Recovery System
  - Forecasted Fatigue Workout Builder

---

## Notes

This proposal directly addresses the #1 complaint from first user testing session: information overload and lack of clear visual hierarchy. The muscle visualization should be the "at a glance" tool for deciding what to train today.

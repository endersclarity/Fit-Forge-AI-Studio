# Proposal: Enable Muscle Fatigue Heat Map

**Change ID:** `enable-muscle-fatigue-heat-map`
**Status:** Implemented
**Created:** 2025-10-24
**Implemented:** 2025-10-24
**Author:** Development Team
**Priority:** 2 (Core visualization feature)

---

## Why

Users currently cannot quickly assess which muscles are ready to train because fatigue data exists but isn't prominently visualized. This undermines the core FitForge vision: answering "what can I train RIGHT NOW?" at a glance.

**User Pain Points:**
- "What can I train today?" - can't quickly see which muscles are recovered
- "I don't know if my chest is ready for another push workout"
- "I have to guess whether I've given my muscles enough rest"
- "I open the app and have no immediate guidance on what's ready to work"
- "The muscle fatigue data exists but I can't see it without digging"

---

## Problem Statement

**Current Behavior:**
- Muscle fatigue data exists in `muscle_states` table (fatigue_percent, last_trained, volume_today)
- Recovery calculations work correctly
- Data is tracked for all 13 muscle groups
- BUT: No prominent visualization on the home screen
- Users must navigate or guess which muscles are recovered

**Why This Matters:**
1. **Vision Misalignment** - FitForge is meant to be an "intelligent muscle capacity learning system" that guides users, not just a logger
2. **Cognitive Load** - Users must remember or calculate recovery status manually
3. **Missed Training Opportunities** - Users might skip workouts thinking they're not recovered when they actually are
4. **Reduced Engagement** - Without visual feedback, users can't see their recovery progress
5. **Blocks Future Features** - Smart exercise recommendations need visible muscle status

---

## Proposed Solution

Implement a **Muscle Fatigue Heat Map** that:

1. **Displays prominently on home screen (Dashboard)** - First thing user sees when opening app
2. **Shows all 13 muscle groups** - Categorized by Push/Pull/Legs/Core
3. **Visualizes fatigue with progress bars** - 0-100% fatigue level with color coding
4. **Color codes by recovery status** - 🟢 Green (0-33% fatigued, ready), 🟡 Yellow (34-66%, recovering), 🔴 Red (67-100%, needs rest)
5. **Displays recovery metadata** - "Last trained" timestamp and "days since" for each muscle
6. **Provides recovery time estimates** - "Ready now" or "Ready in X days"
7. **Interactive muscle exploration** - Tap muscle to see exercises that target it
8. **Updates in real-time** - Reflects changes immediately after logging workouts

**Core Innovation:**
At-a-glance visual answer to "what can I train today?" without mental calculation or guesswork.

---

## User Experience

### Before (Current State)
```
User opens app → Dashboard displays but no muscle visualization
Must remember: "Did I do push 2 days ago? Is that enough rest?"
Guesses whether muscles are recovered
No visual feedback on recovery progress
```

### After (Proposed)
```
User opens app → Immediately sees Muscle Fatigue Heat Map:

PUSH MUSCLES
🔴 Pectoralis: 85% fatigued | Last trained: 2 days ago | Ready in 1 day
🔴 Deltoids: 78% fatigued | Last trained: 2 days ago | Ready in 2 days
🟡 Triceps: 60% fatigued | Last trained: 3 days ago | Ready now

PULL MUSCLES
🟢 Lats: 15% fatigued | Last trained: 5 days ago | Ready now
🟢 Rhomboids: 10% fatigued | Last trained: 5 days ago | Ready now
🟢 Biceps: 0% fatigued | Last trained: 6 days ago | Ready now

LEGS MUSCLES
🟢 Quadriceps: 25% fatigued | Last trained: 4 days ago | Ready now
...

User taps "Lats" → Modal shows:
  "Exercises that work Lats:"
  - Pull-ups (85% engagement)
  - Dumbbell Row (75% engagement)
  - Dumbbell Pullover (60% engagement)

User instantly knows: "Pull day is ready! Push day needs more rest."
```

---

## Success Criteria

1. **Heat map displays on Dashboard/home screen** - Visible immediately on app launch
2. **All 13 muscles visible and grouped correctly** - Push (3), Pull (5), Legs (4), Core (1)
3. **Fatigue percentages accurate** - Pulling from muscle_states table via /api/muscle-states
4. **Color coding works correctly** - Green (0-33%), Yellow (34-66%), Red (67-100%)
5. **Progress bars render properly** - Visual representation of fatigue percentage
6. **Recovery metadata displays** - "Last trained" date and "days since" accurate
7. **Recovery time estimates shown** - "Ready now" or "Ready in X days" based on recovery curve
8. **Tap interaction functional** - Shows muscle-specific exercises in modal/expandable view
9. **Real-time updates work** - Heat map refreshes after workout logged
10. **Mobile responsive** - Works on small screens, scrollable if needed

---

## Implementation Scope

### In Scope
- Dashboard component modification to display heat map
- Muscle categorization component (Push/Pull/Legs/Core groups)
- Fatigue percentage visualization with progress bars
- Color-coding logic based on thresholds (0-33%, 34-66%, 67-100%)
- "Last trained" and "days since" display
- Recovery time estimate calculation ("Ready in X days")
- Tap/click handler to show exercises for selected muscle
- Modal or expandable view showing muscle-specific exercises
- Real-time data fetching from GET /api/muscle-states
- CSS styling for heat map layout (responsive design)
- List view visualization (MVP)

### Out of Scope
- 3D body model with interactive muscles (future enhancement - estimated 2-4 weeks additional)
- Baseline learning algorithm (Priority 4+, requires research sprint)
- Personal calibration of muscle engagement percentages (future)
- Muscle-specific recovery formulas (V1 uses universal curve)
- Smart exercise recommendations algorithm (separate feature, depends on this)
- Historical fatigue trends/charts (future analytics dashboard)
- Manual fatigue adjustment controls (keep automatic for V1)
- Custom color threshold settings (fixed thresholds for V1)

---

## Dependencies

**Requires:**
- ✅ `muscle_states` table (exists - has fatigue_percent, last_trained, volume_today, recovered_at)
- ✅ GET /api/muscle-states endpoint (exists)
- ✅ Recovery calculation formula (exists in utils - 5-day non-linear curve)
- ✅ Exercise database with muscle engagement data (exists in constants.ts - 48 exercises)
- ✅ Dashboard component (exists, needs modification)

**Enables:**
- Smart exercise recommendations (can recommend based on fresh muscles)
- Optimal muscle pairing algorithm (needs visible muscle status)
- Improved user engagement and motivation
- Workout planning intelligence ("You should do Pull day, your back is ready")

**Blocks:**
- Nothing (standalone visualization feature)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users confused by fatigue percentages | Medium | Add help text: "Higher % = more fatigued, needs rest. Lower % = ready to train." |
| Color thresholds feel arbitrary | Low | Document reasoning in UI tooltip, make adjustable in future settings |
| "Last trained" shows null for never-trained muscles | Low | Display "Never trained" instead of null/undefined date |
| Visual clutter on small mobile screens | Medium | Responsive design, collapsible category groups, scrollable list |
| Fatigue data inaccurate (V1 uses hardcoded 10,000 baselines) | Medium | Acknowledge V1 limitations in brainstorming doc, note that it's still useful for relative comparisons |
| Users expect to manually adjust fatigue | Low | Keep automatic for V1, add "Why is this number X?" help text, defer manual adjustment to future |
| Performance issues with frequent API calls | Low | Fetch once on mount, refresh only after workout logged, implement caching |

---

## Alternatives Considered

### Alternative 1: Simple Text List (No Colors, No Bars)
- **Rejected:** Less engaging, harder to scan quickly at a glance
- Visual "heat map" concept requires color coding and progress bars
- Users need immediate visual feedback, not text parsing

### Alternative 2: 3D Body Model with Clickable Muscles
- **Deferred:** Too complex for MVP, requires 3D rendering library (Three.js)
- Estimated 2-4 weeks additional development (per brainstorming doc)
- Start with list view, upgrade to 3D in future iteration

### Alternative 3: Only Show "Ready" Muscles (Hide Fatigued Ones)
- **Rejected:** Users want full picture of all muscle status
- Seeing gradual progress (85% → 60% → 30% over days) is motivating
- Need to know what NOT to train as much as what to train

### Alternative 4: Separate "Recovery" Screen/Tab
- **Rejected:** Violates "open app → instant info" core principle
- Heat map should be first thing user sees on home screen (Dashboard)
- Extra navigation reduces engagement

### Alternative 5: Show Only Muscle Categories, Not Individual Muscles
- **Rejected:** Not granular enough - "Push" category has 3 muscles that might have different fatigue levels
- Users need per-muscle visibility (pecs might be fatigued but triceps recovered)

---

## Open Questions

1. **Should the heat map be collapsible/hideable?**
   - Answer: No - it's the primary feature of the home screen. Always visible.

2. **What if a muscle has 0% fatigue but was trained 10 days ago?**
   - Answer: Show it as fully recovered (green). The recovery formula handles this correctly.

3. **Should we show recovery time estimate? (e.g., "Ready in 2 days")**
   - Answer: Yes - this adds significant value. Show "Ready now" or "Ready in X days" based on recovery curve calculation.

4. **How to handle muscles never trained before?**
   - Answer: Display "Never trained" for last_trained, show 0% fatigue (green), "Ready now".

5. **Should tapping a muscle navigate to a new screen or show a modal?**
   - Answer: Modal/expandable view to keep user on home screen. Faster interaction, less navigation.

6. **What order to show muscles in each category?**
   - Answer: Logical anatomical order (top to bottom):
     - Push: Pectoralis, Deltoids, Triceps
     - Pull: Lats, Rhomboids, Trapezius, Biceps, Forearms
     - Legs: Quadriceps, Hamstrings, Glutes, Calves
     - Core: Core

7. **Should categories be collapsible?**
   - Answer: Optional enhancement - start with all expanded, add collapse controls if space becomes issue

---

## V1 Limitations (Acknowledged)

Per brainstorming session document (docs/brainstorming-session-results.md), this V1 implementation has known limitations that are **acceptable** for MVP:

**Limitation 1: Hardcoded Baselines**
- Uses 10,000 baseline for all muscles (not personalized)
- Future: Baseline learning algorithm (Priority 4+, requires research sprint)

**Limitation 2: Universal Recovery Curve**
- Same 5-day non-linear recovery for all muscle groups
- Future: Muscle-specific recovery rates based on research

**Limitation 3: Approximate Muscle Capacity**
- Rough approximation of actual individual capacity
- Future: Personal calibration system

**Why V1 Is Still Valuable:**
- ✅ Shows **relative** fatigue between muscles
- ✅ Tracks workout history impact accurately
- ✅ Provides visual feedback on recovery progress
- ✅ Improves UX even with imperfect data
- ✅ Enables data collection for future algorithm improvements

**Philosophy:** Ship imperfect, iterate with real data. V1 provides value now, improves with research-backed models later.

---

## Related Changes

- **Depends on:** None (all required infrastructure exists)
- **Enables:**
  - Future smart exercise recommendations (Priority 3+)
  - Future optimal muscle pairing algorithm
  - Improved workout planning intelligence
- **Related to:**
  - `enable-smart-workout-continuation` (both improve workout planning experience)
  - `enable-failure-tracking-and-pr-detection` (better data quality improves heat map accuracy over time)

---

## Next Steps

1. Review and approve this proposal
2. Create `design.md` (component structure, data flow, UI mockups)
3. Write spec deltas for capabilities:
   - `muscle-heat-map-visualization` (core UI component with progress bars and color coding)
   - `muscle-category-grouping` (Push/Pull/Legs/Core organization)
   - `exercise-discovery-by-muscle` (tap interaction to show exercises)
4. Create `tasks.md` with phased implementation steps
5. Validate with `openspec validate enable-muscle-fatigue-heat-map --strict`
6. Begin implementation (estimated 1 week for MVP)

---

*This proposal addresses Priority 2 from the FitForge brainstorming session (docs/brainstorming-session-results.md) and implements the core "what can I train RIGHT NOW?" vision through visual muscle fatigue feedback.*

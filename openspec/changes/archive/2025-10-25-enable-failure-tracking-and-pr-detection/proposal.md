# Proposal: Enable Failure Tracking and PR Detection

**Change ID:** `enable-failure-tracking-and-pr-detection`
**Status:** Proposed
**Created:** 2025-10-24
**Author:** Development Team
**Priority:** 3 (Foundational for future baseline learning)

---

## Why

Users currently have no way to distinguish between max-effort sets (trained to failure) and submaximal work (greasing the groove, warm-ups, deload weeks). This missing data:

1. **Prevents baseline learning** - System can't infer muscle capacity without knowing which sets hit true failure
2. **Misses motivation opportunities** - Personal records go unnoticed and uncelebrated
3. **Lacks training context** - Can't differentiate between intentional submaximal work and underperformance
4. **Reduces data quality** - All sets treated equally regardless of effort level

**User Pain Points:**
- "Did I just break my PR? I'm not sure..."
- "I can't tell if I'm actually progressing"
- "The app doesn't recognize when I push myself harder"
- "I'm doing light work today but the system thinks it's my max"

---

## Problem Statement

**Current Behavior:**
- Every set is treated as maximum effort
- No distinction between failure sets and submaximal work
- Personal bests are tracked but not automatically detected
- No celebration when users break records
- System cannot learn individual muscle capacity (future feature blocker)

**Why This Matters:**
1. **Baseline Learning Dependency** - Future muscle capacity inference requires knowing which sets hit failure (constraint satisfaction algorithm needs true maximal data points)
2. **Motivation Loss** - Achieving a PR without recognition reduces training satisfaction
3. **Data Pollution** - Warm-up sets and deload work pollute the dataset
4. **Training Flexibility** - Users can't indicate intentional submaximal training days

---

## Proposed Solution

Implement a **Failure Tracking and PR Detection System** that:

1. **Tracks "to failure" status** - Boolean flag on each set indicating if it was taken to muscular failure
2. **Smart defaults** - Last set of each exercise automatically marked as "to failure" (user can override)
3. **PR detection** - Automatically detect when a set exceeds previous best (volume-based: weight × reps)
4. **Celebration UI** - Simple, non-intrusive notification when PR is broken
5. **Personal bests updates** - Automatically update `personal_bests` table

**Core Innovation:**
Differentiate training intent (max effort vs submaximal) to enable future intelligent features while providing immediate motivational value.

---

## User Experience

### Before (Current State)
```
User logs set: Bench Press 8 reps @ 105 lbs
System stores: ✓ Data saved
No indication this is a new PR (previous best: 8 @ 100 lbs)
No way to mark this as max effort
```

### After (Proposed)
```
User logs set: Bench Press 8 reps @ 105 lbs
System detects: 🎉 NEW PR! Previous best: 8 @ 100 lbs (+5 lbs)
Set automatically marked as "to failure" (last set)
Personal bests table updated automatically
```

**Additional Scenarios:**

**Scenario 1: Greasing the Groove**
```
User doing submaximal work (60% max)
Last set defaults to "to failure" ✓
User taps toggle to unmark: "Not to failure today"
System respects user intent, doesn't pollute baseline data
```

**Scenario 2: Early Failure**
```
User hits failure on set 2 of 3 (form breakdown)
Set 2: User manually marks "to failure" ✓
Set 3: User doesn't complete it or does reduced weight
System accurately records where failure occurred
```

---

## Success Criteria

1. **Failure tracking works** - Each set has `to_failure` boolean flag
2. **Smart defaults function** - Last set auto-marked as "to failure"
3. **Manual override available** - User can toggle failure status on any set
4. **PR detection accurate** - Detects volume-based PRs (weight × reps > previous best)
5. **Celebration appears** - UI shows notification when PR broken
6. **Personal bests update** - `personal_bests` table automatically updated
7. **No false positives** - Warm-up sets and deload work properly excluded

---

## Implementation Scope

### In Scope
- Add `to_failure` boolean column to `exercise_sets` table
- Backend logic to update `personal_bests` when PR detected
- Frontend toggle UI for marking/unmarking failure sets
- PR detection algorithm (volume comparison)
- Celebration notification UI (simple toast/banner)
- Smart default: last set = to failure

### Out of Scope
- Historical PR trends/charts (future analytics feature)
- Baseline learning algorithm (Priority 4+, requires research)
- Muscle-specific capacity inference (future)
- Form quality tracking (moonshot)
- Comparison with other users (not applicable for single-user app)

---

## Dependencies

**Requires:**
- Existing `exercise_sets` table (✅ exists)
- Existing `personal_bests` table (✅ exists)
- Current workout logging system (✅ exists)

**Enables:**
- Future baseline learning algorithm (Priority 4+)
- Historical analytics (better data quality)
- Muscle capacity inference (requires failure data)

**Blocks:**
- Nothing (standalone feature)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users forget to toggle non-failure sets | Medium | Smart default (last set only), clear UI labeling |
| False PR detection (deload week) | Low | User can unmark "to failure" before logging set |
| Database migration fails | High | Test migration thoroughly, provide rollback script |
| Notification fatigue | Low | Simple, non-modal notification (dismisses automatically) |
| Confusion about "to failure" definition | Medium | Add help text: "Couldn't complete another rep with good form" |

---

## Alternatives Considered

### Alternative 1: Manual PR Entry Only
- **Rejected:** Too much manual work, error-prone
- Users would forget to log PRs
- No automatic detection of progress

### Alternative 2: Effort Rating (1-10 scale)
- **Rejected:** Too subjective, requires thinking during workout
- Violates "data-driven, not survey-driven" philosophy
- Boolean (failure/not failure) is clearer and more objective

### Alternative 3: Only Track Best Sets (No Failure Flag)
- **Rejected:** Loses critical context for baseline learning
- Can't distinguish between max effort and submaximal work
- Pollutes future machine learning with bad data

### Alternative 4: Automatic Failure Detection via Velocity
- **Deferred:** Requires sensors/equipment not available
- Moonshot feature for future with camera/accelerometer integration
- Start with manual tracking, upgrade later

---

## Open Questions

1. **What if user hits failure on every set?**
   - Answer: That's valid (drop sets, cluster sets). System should support it.

2. **Should warm-up sets be hidden from PR detection?**
   - Answer: No - if user doesn't mark them "to failure," they won't affect PRs. Simple.

3. **How to handle PR ties (same weight × reps)?**
   - Answer: No notification (not a new record), but update `updated_at` timestamp

4. **What if previous PR was 3 years ago?**
   - Answer: Still a valid comparison. Show it with date: "PR! (Previous: 3 years ago)"

5. **Should celebration differ based on PR magnitude?**
   - Answer: V1 = simple. Future = maybe add levels (🎉 +5%, 🔥 +10%, ⭐ +20%)

---

## Related Changes

- **Depends on:** None (standalone feature)
- **Enables:** Future baseline learning algorithm proposal
- **Related to:** `enable-smart-workout-continuation` (both improve workout tracking quality)

---

## Next Steps

1. Review and approve this proposal
2. Create `design.md` (database migration strategy)
3. Write spec deltas for each capability:
   - `failure-status-tracking` - Boolean flag and UI toggle
   - `pr-detection-algorithm` - Volume comparison logic
   - `pr-celebration-ui` - Notification system
4. Create `tasks.md` with implementation steps
5. Validate with `openspec validate enable-failure-tracking-and-pr-detection --strict`
6. Begin implementation

---

*This proposal addresses Priority 3 from the FitForge brainstorming session (docs/brainstorming-session-results.md) and provides foundational data for future muscle capacity learning algorithms.*

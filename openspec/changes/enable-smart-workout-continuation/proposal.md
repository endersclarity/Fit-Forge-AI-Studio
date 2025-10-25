# Proposal: Enable Smart Workout Continuation

**Change ID:** `enable-smart-workout-continuation`
**Status:** Draft
**Created:** 2025-10-24
**Author:** Development Team

---

## Why

Users currently face friction when continuing their structured workout programs because the system doesn't track which variation they performed last or provide guidance on progressive overload. This leads to inconsistent training, manual tracking overhead, and reduced training effectiveness.

---

## Problem Statement

Currently, users must manually remember:
- Which workout variation (A or B) they performed last time
- What weights and reps they used in their previous session
- How to apply progressive overload to improve over time

This creates friction and reduces the effectiveness of structured training because:

1. **No variation tracking** - The system doesn't track whether the user did "Push A" or "Push B" last time
2. **No workout history context** - Users can't see what they did in their previous session when starting a new workout
3. **No progressive overload guidance** - Users must manually calculate +3% weight or +3% reps
4. **Inefficient workout setup** - Users start from scratch each time instead of building on previous performance

**User Pain Points:**
- "Which variation did I do last time?"
- "What weight did I use for bench press in my last Push workout?"
- "Am I actually progressing or just spinning my wheels?"
- "How much weight should I add to keep improving?"

---

## Proposed Solution

Implement a **Smart Workout Continuation System** that:

1. **Tracks workout variations** - Records which variation (A/B) was used for each category
2. **Suggests next variation** - Recommends the opposite variation to ensure balance (did A → suggest B)
3. **Auto-populates previous performance** - Shows last workout's exercises, weights, and reps
4. **Provides progressive overload suggestions** - Calculates +3% weight OR +3% reps (alternating)
5. **Displays clear progression UI** - Shows "Last time vs This time" for motivation

**Core Innovation:**
Alternate between weight and reps progression to attack muscle adaptation from multiple angles and prevent plateaus.

---

## User Experience

### Before (Current State)
```
User opens app → Workout screen → Selects exercises from scratch
No context about previous workout
No guidance on what to do next
```

### After (Proposed)
```
User opens app → Workout screen →
  "Last workout: Push B (3 days ago)
   Suggested: Push A"

  [Load Push A Template] button

Exercises auto-populated with:
  Bench Press: 8 reps @ 100 lbs → Suggested: 9 reps @ 100 lbs (+3% reps)
  Push-ups: 30 reps @ 200 lbs → Suggested: 30 reps @ 200 lbs (+0% - already at PR)
```

---

## Success Criteria

1. **Variation tracking works** - System correctly identifies last variation used per category
2. **Smart suggestions appear** - UI shows recommended opposite variation
3. **Auto-population functions** - Previous workout exercises and stats load automatically
4. **Progressive overload calculates correctly** - +3% weight or +3% reps displayed accurately
5. **Alternating progression works** - Weight and reps progression alternate between sessions
6. **User can override** - Can still manually change exercises, weights, or variations

---

## Implementation Scope

### In Scope
- Database schema changes to track `category` and `variation` on workouts table
- API endpoint to fetch "last workout by category"
- Progressive overload calculation formula (+3% weight/reps, alternating)
- UI component showing last workout summary with suggestions
- "Load Previous Workout" functionality with suggested increments
- Alternation tracking (did weight last time → suggest reps this time)

### Out of Scope
- Personal best detection (Priority 3)
- "To failure" tracking (Priority 3)
- Historical analytics/charts (Future)
- Custom progression percentages (using fixed 3% for MVP)
- Template editing/creation (already exists separately)

---

## Dependencies

**Requires:**
- Existing workout logging system (✅ exists)
- Existing workout templates with variations (✅ exists)
- Personal bests table for max detection (✅ exists)

**Blocks:**
- Muscle fatigue heat map (depends on accurate workout tracking)
- Smart exercise recommendations (needs workout history context)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users don't understand +3% suggestion | Medium | Clear UI labels: "Last time: 100 lbs → Try: 103 lbs (+3 lbs)" |
| Progressive overload too aggressive for beginners | Low | Use 3% as conservative starting point, document override ability |
| Database migration fails | High | Test schema changes thoroughly, provide rollback script |
| Confusion between variation tracking and templates | Medium | Clear naming: "Last Push A" vs "Push A Template" |

---

## Alternatives Considered

### Alternative 1: Fixed Progressive Overload (always +5 lbs)
- **Rejected:** Not percentage-based, doesn't scale with strength levels
- Different exercises need different increments (push-ups vs bench press)

### Alternative 2: Always Suggest Same Variation
- **Rejected:** Leads to muscle adaptation and plateaus
- A/B variation system already exists in templates

### Alternative 3: AI-Generated Workout Suggestions
- **Deferred:** Too complex for MVP, needs baseline learning first
- Keep it simple: track history, suggest opposite variation, show +3%

---

## Open Questions

1. **What if user hasn't done a category before?**
   - Answer: Default to variation "A", no previous data to show

2. **What if user did variation A twice in a row?**
   - Answer: Still suggest B next time (based on last workout, not count)

3. **Should we round 3% calculations?**
   - Answer: Yes, round to nearest 0.5 lb for weights, nearest whole number for reps

4. **What if previous workout was 4+ weeks ago?**
   - Answer: Show it anyway with note "(4 weeks ago)" - user can decide if still relevant

5. **How to handle exercises not in previous workout?**
   - Answer: Show exercise from template with no previous data, no suggestion

---

## Related Changes

- **Depends on:** None (standalone feature)
- **Enables:** Priority 3 (Failure tracking & PR detection)
- **Related to:** Workout Templates (uses existing A/B system)

---

## Next Steps

1. Review and approve this proposal
2. Create detailed design.md (if needed)
3. Write spec deltas for each capability
4. Create tasks.md with implementation steps
5. Validate with `openspec validate enable-smart-workout-continuation --strict`
6. Begin implementation

---

*This proposal addresses Priority 1 from the FitForge brainstorming session (docs/brainstorming-session-results.md).*

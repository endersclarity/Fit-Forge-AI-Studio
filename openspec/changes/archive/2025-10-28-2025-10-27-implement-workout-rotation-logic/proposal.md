# Proposal: Implement Workout Rotation Logic

**Change ID:** `implement-workout-rotation-logic`
**Created:** 2025-10-27
**Status:** Draft
**Priority:** High
**Estimated Effort:** 6-8 hours

---

## Problem Statement

Based on user feedback (USER_FEEDBACK.md, 2025-10-27), the user has a specific workout rotation schedule that the app doesn't currently understand:

**User's Rotation:**
- **Pattern:** 2 days on, 1 day off, 1 day on, 1 day off (repeating)
- **Rule:** Never more than 5 days before hitting same muscle group again
- **Sequence:** Push A → Leg A → [rest] → Pull A → [rest or Core] → Push B → Leg B → [rest] → Pull B → [cycle repeats]
- **Core:** Optional/random, doesn't interfere with main rotation (Push/Pull/Legs)
- **Variation Rule:** Cycle through all "A" variations before moving to "B" variations

**Current Issue:**
> "Quick Start currently shows: Push Day A, Core Day A, Core Day B, Leg Day A. **Should only show THE NEXT logical workout based on rotation**."

**Impact:**
- Quick Start shows 4 templates instead of THE NEXT workout
- No intelligence about what workout should come next
- User must manually decide based on mental tracking

---

## Goals

### Primary Goal
Implement intelligent workout rotation tracking that understands the user's schedule and recommends the NEXT logical workout.

### Success Criteria
1. ✅ Quick Start shows exactly ONE recommended workout
2. ✅ Recommendation follows explicit rotation sequence
3. ✅ System tracks: current cycle position, last workout, rest days
4. ✅ Never recommends same muscle group within 5 days
5. ✅ Core workouts are recognized as optional (don't advance rotation)
6. ✅ A/B variation cycling works correctly (all A's before B's)

---

## Proposed Solution

### Rotation State Model

Track rotation state per user:

```typescript
interface WorkoutRotationState {
  currentCycle: 'A' | 'B';              // Which variation cycle
  currentPhase: number;                  // Position in 8-workout sequence (0-7)
  lastWorkoutDate: string;               // ISO 8601
  lastWorkoutCategory: ExerciseCategory; // Push/Pull/Legs/Core
  lastWorkoutVariation: 'A' | 'B';
  restDaysCount: number;                 // Consecutive rest days so far
}
```

### Rotation Sequence Definition

```typescript
const ROTATION_SEQUENCE = [
  { category: 'Push', variation: 'A', restAfter: 0 },      // Day 1
  { category: 'Legs', variation: 'A', restAfter: 1 },      // Day 2 → rest
  { category: 'Pull', variation: 'A', restAfter: 1 },      // Day 4 → rest or Core
  { category: 'Push', variation: 'B', restAfter: 0 },      // Day 6
  { category: 'Legs', variation: 'B', restAfter: 1 },      // Day 7 → rest
  { category: 'Pull', variation: 'B', restAfter: 0 },      // Day 9
  // Cycle repeats from Push A
];
```

### Recommendation Algorithm

```typescript
function getNextWorkout(state: WorkoutRotationState): WorkoutRecommendation {
  // 1. Check if rest day needed
  if (state.restDaysCount < expectedRestDays) {
    return { isRestDay: true, reason: 'Scheduled rest day' };
  }

  // 2. Get next workout in sequence
  const nextPhase = (state.currentPhase + 1) % ROTATION_SEQUENCE.length;
  const nextWorkout = ROTATION_SEQUENCE[nextPhase];

  // 3. Validate 5-day rule (no same muscle within 5 days)
  if (withinLastNDays(state.lastWorkoutCategory, nextWorkout.category, 5)) {
    return { isRestDay: true, reason: 'Muscle group needs more recovery' };
  }

  // 4. Return recommendation
  return {
    category: nextWorkout.category,
    variation: nextWorkout.variation,
    phase: nextPhase,
  };
}
```

### Database Schema

Add `workout_rotation_state` table:

```sql
CREATE TABLE IF NOT EXISTS workout_rotation_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  current_cycle TEXT NOT NULL DEFAULT 'A',
  current_phase INTEGER NOT NULL DEFAULT 0,
  last_workout_date TEXT,
  last_workout_category TEXT,
  last_workout_variation TEXT,
  rest_days_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Capabilities

This change introduces:

1. **`workout-rotation-tracking`** (NEW)
   - Tracks current position in rotation sequence
   - Maintains cycle state (A vs B)
   - Counts rest days

2. **`next-workout-recommendation`** (NEW)
   - Calculates next logical workout
   - Enforces 5-day muscle recovery rule
   - Handles Core as optional (doesn't advance sequence)

3. **`quick-start-recommendation`** (MODIFIED)
   - Shows single workout (not 4 templates)
   - Uses rotation logic for recommendation
   - Displays last workout context

---

## Implementation Phases

### Phase 1: Database Schema (1 hour)
- Create `workout_rotation_state` table
- Add migration script
- Initialize default state for existing user
- Update TypeScript types

### Phase 2: Rotation Engine (2-3 hours)
- Define `ROTATION_SEQUENCE` constant
- Implement `getNextWorkout()` algorithm
- Handle edge cases (first workout, Core insertion, rest days)
- Validate 5-day muscle recovery rule
- Write unit tests for algorithm

### Phase 3: State Management API (1-2 hours)
- Create `GET /api/rotation/next` endpoint (returns next recommended workout)
- Create `POST /api/rotation/complete` endpoint (advances rotation after workout)
- Update rotation state when workout is logged
- Handle Core workouts (don't advance phase)

### Phase 4: Frontend Integration (2 hours)
- Update Quick Start to call `/api/rotation/next`
- Display single recommended workout
- Show last workout context ("Last: Push B, 3 days ago")
- Add "Start This Workout" button
- Remove 4-template grid display

### Phase 5: Testing & Validation (1 hour)
- Test full rotation cycle (8 workouts)
- Test Core insertion (doesn't break sequence)
- Test 5-day rule enforcement
- Test rest day logic
- Test edge cases (first workout, missing data)

---

## Out of Scope

1. **Custom rotation patterns** - V1 uses hardcoded sequence, user can't customize
2. **Smart rest day suggestions** - Uses fixed pattern, no ML
3. **Deload weeks** - Future enhancement
4. **Multiple rotation templates** - V1 supports one pattern only

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| User's actual rotation differs from model | High | Make rotation sequence configurable in future |
| Core workouts confuse rotation logic | Medium | Special handling: Core doesn't advance phase |
| User skips recommended workout | Medium | Allow manual workout selection, rotation adjusts |
| 5-day rule too strict | Low | User can override recommendation |

---

## Dependencies

- ✅ Workout logging system working
- ✅ Exercise categories (Push/Pull/Legs/Core) defined
- ✅ Variation (A/B) tracking in workouts table
- ⚠️  Need to verify workout completion triggers rotation update

---

## Testing Plan

### Algorithm Testing
- [ ] Sequence: Push A → Legs A → Rest → Pull A → Rest → Push B → ...
- [ ] Rest days: 2 on, 1 off, 1 on, 1 off pattern
- [ ] Core: Can be inserted without breaking sequence
- [ ] 5-day rule: Same muscle not recommended within 5 days
- [ ] Cycle transition: After Pull B, returns to Push A

### Integration Testing
- [ ] Complete Push A → rotation advances to Legs A
- [ ] Complete Core → rotation stays at current phase
- [ ] Skip recommended workout → rotation still works
- [ ] First workout ever → starts at Push A, phase 0

---

## Design Decisions

### Why Hardcoded Sequence?
V1 uses hardcoded rotation sequence to match user's explicit request. Future versions can make this configurable.

### Why Separate Table?
`workout_rotation_state` is separate from `workouts` because it's **stateful metadata**, not historical data. Rotation state advances forward, doesn't care about workout history beyond "last workout."

### How Does Core Work?
Core workouts are logged to history but DON'T advance `current_phase`. This allows user to insert Core anywhere without breaking the rotation sequence.

---

## Related

- **User Feedback:** USER_FEEDBACK.md (2025-10-27 entry)
- **Related Proposals:**
  - Homepage Information Architecture (uses rotation for Quick Start)
  - Configurable Recovery System (5-day rule aligns with recovery model)

- **Future Enhancements:**
  - Custom rotation patterns (user-defined sequences)
  - Deload week integration
  - Smart rest day suggestions based on fatigue

---

## Notes

**User's Explicit Requirements:**
> "Sequence: Push A → Leg A → [day off] → Pull A → [day off or Core] → Push B → Leg B → [day off] → Pull B"
> "Never more than 5 days before hitting same muscle group again"
> "Cycle through all 'A' variations before moving to 'B' variations"

This proposal implements these requirements exactly.

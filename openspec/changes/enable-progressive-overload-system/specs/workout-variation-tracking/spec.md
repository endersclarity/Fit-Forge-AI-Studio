# Spec: Workout Variation Tracking

**Capability:** `workout-variation-tracking`
**Status:** Draft
**Change:** `enable-progressive-overload-system`

---

## Overview

The workout variation tracking capability enables intelligent A/B workout suggestions by tracking which variation was used in the last workout and recommending the opposite for balanced muscle development.

**Core Behavior:** When a user starts a workout in a specific category (Push/Pull/Legs/Core), the system detects which variation (A or B) was used last time and suggests the opposite.

---

## ADDED Requirements

### Requirement: Track Last Variation Per Category

**Description:** System SHALL track which workout variation (A or B) was used in the most recent workout for each category.

**Acceptance Criteria:**
- Queries most recent workout by category
- Returns variation field ("A" or "B")
- Returns workout date
- Returns null if no history in category
- Query optimized for performance

#### Scenario: User has workout history in category

**Given:** User's last three workouts:
- 2025-10-23: Push A
- 2025-10-21: Pull B
- 2025-10-19: Push B
**When:** System queries last variation for "Push"
**Then:** Returns: { variation: "A", date: "2025-10-23" }
**And:** Ignores Pull workout (different category)

#### Scenario: User has no history in category

**Given:** User has never done a "Legs" workout
**When:** System queries last variation for "Legs"
**Then:** Returns null
**And:** System defaults to suggesting "A"

---

### Requirement: Suggest Opposite Variation

**Description:** System SHALL recommend the opposite variation from what was used last time to ensure balanced training.

**Acceptance Criteria:**
- If last variation was "A", suggest "B"
- If last variation was "B", suggest "A"
- If no history, default to "A"
- Suggestion is advisory (user can override)

#### Scenario: Suggest opposite after A

**Given:** Last Push workout was variation "A"
**When:** User starts new Push workout
**Then:** System suggests variation "B"
**And:** UI shows: "Last time: Push A → Today: Push B (suggested)"

#### Scenario: Suggest opposite after B

**Given:** Last Pull workout was variation "B"
**When:** User starts new Pull workout
**Then:** System suggests variation "A"

#### Scenario: First workout in category

**Given:** No previous Legs workouts
**When:** User starts Legs workout
**Then:** System suggests variation "A" (default)
**And:** UI shows: "First time doing Legs!"

---

### Requirement: Display Variation Context

**Description:** System SHALL display clear context about last variation and suggestion to help user make informed choice.

**Acceptance Criteria:**
- Shows last variation used
- Shows date of last workout
- Shows suggested variation
- Allows user override
- Context visible before workout starts

#### Scenario: Show complete variation context

**Given:** Last Push A workout was 3 days ago
**When:** User taps "Start Workout" on dashboard
**Then:** UI displays:
```
Push Workout
Last time: Push A (3 days ago)
Suggested: Push B (for balance)

[Start Push B] [Start Push A instead]
```

---

### Requirement: Save Variation in Workout

**Description:** System SHALL save the selected variation when workout is logged for future tracking.

**Acceptance Criteria:**
- Variation field stored in workouts table
- Accepts "A" or "B" values
- Required for template-based workouts
- Optional for custom workouts (defaults to null)

#### Scenario: Save variation with workout

**Given:** User selects "Start Push B"
**And:** User completes workout with exercises
**When:** Workout is saved
**Then:** Database stores: category = "Push", variation = "B"
**And:** Next time, system will suggest "Push A"

---

## MODIFIED Requirements

None. This capability extends workout logging without modifying existing behavior.

---

## REMOVED Requirements

None.

---

## Dependencies

**Required:**
- ✅ `workouts` table with category and variation fields (already exists)
- ✅ Workout templates with A/B variations defined

**Consumed Capabilities:**
- `workout-history-display`: Provides historical workout data

**Provides To:**
- `progressive-suggestion-ui`: Variation context for workout start
- Future: `template-recommendation`: Intelligent template suggestions

---

## Implementation Notes

**File:** `backend/database/database.ts`

**New Function:**
```typescript
function getLastVariationForCategory(
  category: ExerciseCategory
): { variation: "A" | "B"; date: string } | null {
  // Query most recent workout in category
}
```

**Modified Endpoint:**
```typescript
// GET /api/last-workout?category=Push
{
  "lastVariation": "A",
  "lastDate": "2025-10-23",
  "suggested": "B"
}
```

---

## Testing Coverage

**Unit Tests:**
- Query last variation by category ✓
- Opposite variation logic ✓
- Default to "A" when no history ✓
- Save variation with workout ✓

**Integration Tests:**
- Full workflow: Start workout → shows context → save → next time shows opposite ✓

---

## Success Criteria

- ✅ Accurately tracks last variation per category
- ✅ Correctly suggests opposite variation
- ✅ Displays clear context in UI
- ✅ Variation saved with workout
- ✅ No breaking changes to existing workflow

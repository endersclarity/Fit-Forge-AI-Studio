# Design: Smart Workout Continuation

**Change ID:** `enable-smart-workout-continuation`
**Last Updated:** 2025-10-24

---

## Architecture Overview

This feature adds intelligence to workout sessions by tracking workout variations and providing progressive overload suggestions based on historical performance.

```
┌─────────────────────────────────────────────────────────────┐
│                    Workout Component (UI)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Last Workout Summary Card                            │  │
│  │  - Category + Variation (e.g., "Push B")             │  │
│  │  - Days since last workout                            │  │
│  │  - Suggested next variation                           │  │
│  │  - [Load Template] button                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Exercise List with Suggestions                       │  │
│  │  - Exercise name                                       │  │
│  │  - Last performance (e.g., "12 reps @ 50 lbs")       │  │
│  │  - Suggested performance (e.g., "12 reps @ 52 lbs")   │  │
│  │  - Progression type badge ("+3% WEIGHT" | "+3% REPS") │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  GET /api/workouts/last?category=Push                      │
│  - Returns last workout for category with exercises         │
│  - Includes variation, date, all sets                      │
│                                                             │
│  POST /api/workouts (enhanced)                             │
│  - Saves category + variation with workout                 │
│  - Tracks progression_method (weight | reps)               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│  workouts table (modified)                                  │
│  + category TEXT (Push/Pull/Legs/Core)                     │
│  + variation TEXT (A/B) already exists                     │
│  + progression_method TEXT (weight/reps)                   │
│                                                             │
│  Queries:                                                   │
│  - Get last workout by category                            │
│  - Get exercise sets for workout                           │
│  - Determine last progression method used                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Progressive Overload Calculator                 │
│  calculateProgressiveOverload(exercise, lastPerformance)    │
│  - Reads last progression method                            │
│  - Alternates: weight → reps → weight → reps               │
│  - Applies +3% to appropriate metric                        │
│  - Rounds to practical increments                           │
│  - Checks against personal bests (don't suggest below PR)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### Enhanced `workouts` Table

```sql
ALTER TABLE workouts ADD COLUMN category TEXT;
ALTER TABLE workouts ADD COLUMN progression_method TEXT;

-- Note: variation TEXT already exists
```

**Fields:**
- `category`: "Push" | "Pull" | "Legs" | "Core"
- `variation`: "A" | "B" (already exists)
- `progression_method`: "weight" | "reps" | null

**Why these fields:**
- `category` enables "last Push workout" queries
- `variation` tracks A vs B alternation
- `progression_method` enables alternating progression strategy

---

## Progressive Overload Algorithm

### Core Formula

```typescript
function calculateProgressiveOverload(
  lastPerformance: { weight: number; reps: number },
  lastProgressionMethod: 'weight' | 'reps' | null,
  personalBest: { weight: number; reps: number }
): {
  suggestedWeight: number;
  suggestedReps: number;
  progressionMethod: 'weight' | 'reps';
  percentIncrease: number;
} {
  // Determine next progression method (alternate)
  const nextMethod = lastProgressionMethod === 'weight' ? 'reps' : 'weight';

  let suggestedWeight = lastPerformance.weight;
  let suggestedReps = lastPerformance.reps;

  if (nextMethod === 'weight') {
    // Increase weight by 3%, keep reps same
    const increase = lastPerformance.weight * 0.03;
    suggestedWeight = roundToNearestHalf(lastPerformance.weight + increase);
  } else {
    // Increase reps by 3%, keep weight same
    const increase = Math.ceil(lastPerformance.reps * 0.03);
    suggestedReps = lastPerformance.reps + Math.max(1, increase);
  }

  // Safety check: don't suggest below personal best
  if (suggestedWeight < personalBest.weight) {
    suggestedWeight = personalBest.weight;
  }

  return {
    suggestedWeight,
    suggestedReps,
    progressionMethod: nextMethod,
    percentIncrease: 3.0
  };
}

function roundToNearestHalf(value: number): number {
  return Math.round(value * 2) / 2; // 0.5 lb increments
}
```

### Alternation Logic

**Session 1 (Baseline):**
- Push A: Bench Press 8 reps @ 100 lbs
- Progression method: `null` (first time)

**Session 2:**
- Last method: `null` → Default to `weight`
- Suggestion: 8 reps @ 103 lbs (+3% weight)
- Record: `progression_method = 'weight'`

**Session 3:**
- Last method: `weight` → Switch to `reps`
- Suggestion: 9 reps @ 100 lbs (+3% reps, back to base weight)
- Record: `progression_method = 'reps'`

**Session 4:**
- Last method: `reps` → Switch to `weight`
- Suggestion: 9 reps @ 103 lbs (+3% weight using new rep count)
- Record: `progression_method = 'weight'`

---

## API Design

### New Endpoint: Get Last Workout by Category

```
GET /api/workouts/last?category={Push|Pull|Legs|Core}
```

**Response:**
```json
{
  "id": 42,
  "date": "2025-10-20",
  "category": "Push",
  "variation": "B",
  "progression_method": "weight",
  "duration_seconds": 3600,
  "exercises": [
    {
      "exercise": "Bench Press",
      "sets": [
        { "weight": 100, "reps": 8 },
        { "weight": 100, "reps": 8 },
        { "weight": 100, "reps": 7 }
      ]
    }
  ]
}
```

### Enhanced Endpoint: Save Workout

```
POST /api/workouts
```

**Request Body (enhanced):**
```json
{
  "date": "2025-10-24",
  "category": "Push",
  "variation": "A",
  "progression_method": "reps",
  "duration_seconds": 3000,
  "exercises": [
    {
      "exercise": "Bench Press",
      "sets": [
        { "weight": 100, "reps": 9 },
        { "weight": 100, "reps": 9 }
      ]
    }
  ]
}
```

---

## UI Components

### 1. Last Workout Summary Card

**Location:** Top of Workout screen, before exercise selection

**Contents:**
- Header: "Continue from last {category} workout"
- Last workout date: "Push B - 3 days ago"
- Suggested next: "Try Push A today"
- Action: [Load Push A Template] button

**State:**
- If no previous workout: Show "Start your first {category} workout!"
- If >7 days ago: Show warning icon "(8 days ago - may need adjustment)"

### 2. Exercise Row with Suggestions

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ Bench Press                              [+3% WEIGHT] │
│ Last: 8 reps @ 100 lbs                                │
│ Try:  8 reps @ 103 lbs ↑                              │
│                                                        │
│ [Set 1] Weight: 103  Reps: 8    [Log Set]            │
└────────────────────────────────────────────────────────┘
```

**Elements:**
- Exercise name (bold)
- Badge showing progression method (+3% WEIGHT | +3% REPS)
- "Last:" row showing previous performance
- "Try:" row showing suggested performance with up arrow
- Input fields pre-populated with suggested values
- User can override any value

### 3. Variation Toggle

**Location:** Below last workout summary

**Options:**
- Variation A (radio button)
- Variation B (radio button)

**Default:** Opposite of last variation used

---

## Data Flow

### 1. Load Workout Screen

```
User navigates to Workout →
  UI calls GET /api/workouts/last?category=Push →
    Backend queries workouts table →
      ORDER BY date DESC LIMIT 1 WHERE category='Push' →
        Returns workout with exercises and sets →
          UI displays last workout summary →
            UI suggests opposite variation →
              User clicks [Load Template] →
                UI populates exercises from template →
                  For each exercise:
                    Lookup last performance from previous workout →
                      Calculate progressive overload →
                        Display suggestion in UI →
                          Pre-populate input fields
```

### 2. Save Workout

```
User logs sets and clicks Save →
  UI collects all data including:
    - category (from template or manual selection)
    - variation (from toggle)
    - progression_method (determined by which metric increased) →
      POST /api/workouts with full payload →
        Backend inserts into workouts table →
          Backend inserts exercise_sets →
            Backend updates muscle_states →
              Backend updates personal_bests if new PR →
                Return success →
                  UI shows confirmation
```

---

## Progressive Overload Decision Tree

```
For each exercise:
  ┌─────────────────────────────────┐
  │ Get last performance            │
  │ (weight, reps from last workout)│
  └────────────┬────────────────────┘
               │
               ↓
  ┌─────────────────────────────────┐
  │ Get last progression method     │
  │ (weight or reps)                │
  └────────────┬────────────────────┘
               │
               ↓
  ┌─────────────────────────────────┐
  │ Determine next method           │
  │ (alternate from last)           │
  └────────────┬────────────────────┘
               │
         ┌─────┴─────┐
         │           │
    [weight]     [reps]
         │           │
         ↓           ↓
  ┌──────────┐  ┌──────────┐
  │ +3% lbs  │  │ +3% reps │
  └──────────┘  └──────────┘
         │           │
         └─────┬─────┘
               ↓
  ┌─────────────────────────────────┐
  │ Round to practical increment    │
  │ (0.5 lbs, whole reps)           │
  └────────────┬────────────────────┘
               │
               ↓
  ┌─────────────────────────────────┐
  │ Check against personal best     │
  │ (ensure >= PR)                  │
  └────────────┬────────────────────┘
               │
               ↓
  ┌─────────────────────────────────┐
  │ Return suggestion               │
  └─────────────────────────────────┘
```

---

## Edge Cases & Handling

### Case 1: No Previous Workout for Category
**Scenario:** User starts their first "Pull" workout ever
**Handling:**
- Don't show last workout summary card
- Show "Start your first Pull workout!"
- Default to variation A
- No progressive overload suggestions (no baseline)
- Record this workout as future baseline

### Case 2: Exercise Not in Previous Workout
**Scenario:** Template has "Dumbbell Flyes" but last workout didn't include it
**Handling:**
- Show exercise from template
- No "Last:" row
- No suggestion
- User enters baseline performance
- Future workouts can build on this

### Case 3: User Exceeds Suggestion Significantly
**Scenario:** Suggested 103 lbs, user logs 110 lbs
**Handling:**
- Allow it (user may feel stronger)
- Check if new personal best → update PR
- Next workout bases on actual (110 lbs), not suggestion

### Case 4: User Does Same Variation Twice in a Row
**Scenario:** Did Push A, system suggests Push B, user selects Push A again
**Handling:**
- Allow user override
- Still track progression_method
- Suggestion logic remains: opposite of last is SUGGESTED, not enforced

### Case 5: Very Old Last Workout (>30 days)
**Scenario:** Last Push workout was 45 days ago
**Handling:**
- Still show last workout with date
- Add visual indicator: "⚠️ 45 days ago - strength may have changed"
- User can choose to use suggestions or adjust manually
- Consider detraining in future enhancement

---

## Performance Considerations

### Database Queries
- **Last workout lookup:** Indexed on (user_id, category, date DESC)
- **Exercise sets lookup:** Indexed on (workout_id)
- Expected query time: <10ms

### Caching Strategy
- Cache last workout per category in component state
- Invalidate on new workout save
- No server-side caching needed (single user app)

### UI Responsiveness
- Pre-load last workout when Workout screen mounts
- Show loading skeleton while fetching
- Progressive enhancement: show template even if last workout fetch fails

---

## Testing Strategy

### Unit Tests
1. `calculateProgressiveOverload()` function
   - Test weight progression (103 lbs from 100 lbs)
   - Test reps progression (9 reps from 8 reps)
   - Test alternation logic
   - Test rounding behavior
   - Test personal best boundary

2. `roundToNearestHalf()` function
   - Test 102.3 → 102.5
   - Test 102.7 → 103.0
   - Test edge cases

### Integration Tests
1. Save workout with category + variation
2. Fetch last workout by category
3. Verify progression_method recorded correctly
4. Verify alternation between workouts

### Manual Testing Scenarios
1. **First workout ever** → No suggestions, clean slate
2. **Second workout** → Suggestions appear, weight method
3. **Third workout** → Suggestions alternate to reps
4. **Override suggestion** → System accepts, bases next on actual
5. **Switch categories** → Pull workout doesn't affect Push suggestions

---

## Future Enhancements

*Not in this proposal, but designed to accommodate:*

1. **Configurable progression percentage** - Allow 2%, 5%, etc. instead of fixed 3%
2. **Smart plateau detection** - If same weight/reps for 3+ sessions, suggest deload
3. **Personal best celebrations** - Detect and celebrate when exceeding PR (Priority 3)
4. **"To failure" integration** - Adjust suggestions based on whether last set was to failure (Priority 3)
5. **Historical trend charts** - Visualize progression over time
6. **Muscle-specific recovery** - Suggest workout based on muscle fatigue heat map

---

## Security & Privacy

- All data stored locally in SQLite (no external services)
- No authentication needed (single-user app)
- No data transmission over network
- Standard SQL injection prevention (parameterized queries)

---

## Accessibility

- Clear visual hierarchy (last vs suggested)
- Color-blind friendly (use icons + text, not just color)
- Screen reader compatible labels
- Keyboard navigation support
- Touch-friendly tap targets (44px minimum)

---

*This design supports the proposal for enable-smart-workout-continuation and provides technical architecture for implementation.*

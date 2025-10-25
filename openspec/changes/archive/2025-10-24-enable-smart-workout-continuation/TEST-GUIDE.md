# End-to-End Testing Guide
## Smart Workout Continuation Feature

**Change ID:** `enable-smart-workout-continuation`
**Last Updated:** 2025-10-24

---

## Prerequisites

1. Docker running with FitForge Local
2. Frontend accessible at `http://localhost:3000`
3. Backend API at `http://localhost:3002` (or 3001 depending on config)
4. Fresh database or existing data

---

## Test Scenario 1: First-Time User (No Previous Workouts)

### Expected Behavior
- LastWorkoutSummary shows "Start Your First {Category} Workout!" message
- Load button defaults to variation "A"
- No progressive overload suggestions (nothing to compare to)

### Steps
1. Navigate to Workout screen
2. Select category: "Push"
3. Verify message: "Start Your First Push Workout!"
4. Click "Load Push A Template"
5. Complete workout with sample exercises
6. Save workout

### Verification
```sql
SELECT id, category, variation, progression_method FROM workouts ORDER BY id DESC LIMIT 1;
```
Expected: `category='Push', variation='A', progression_method='weight'` (or null on first workout)

---

## Test Scenario 2: Second Workout (Weight Progression)

### Expected Behavior
- LastWorkoutSummary shows previous Push A workout
- Suggests "Push B" as next variation
- Displays exercises with +3% weight suggestions
- Reps stay the same

### Steps
1. Navigate to Workout screen
2. Select category: "Push"
3. Verify summary shows "Last workout: Push A - X days ago"
4. Verify suggestion: "Try Push B today"
5. Click "Load Push B Template"
6. For each exercise that was in Push A:
   - Verify "Last: 8 reps @ 100 lbs"
   - Verify "Try: 8 reps @ 103 lbs (+3% WEIGHT)"
7. Complete workout using suggested weights
8. Save workout

### Verification
```sql
SELECT id, category, variation, progression_method FROM workouts ORDER BY id DESC LIMIT 2;
```
Expected: First row has `progression_method='weight'`, second row has `progression_method='reps'` (alternating)

---

## Test Scenario 3: Third Workout (Reps Progression)

### Expected Behavior
- LastWorkoutSummary shows previous Push B workout
- Suggests "Push A" as next variation (alternating)
- Displays exercises with +3% reps suggestions
- Weight stays the same as last workout

### Steps
1. Navigate to Workout screen
2. Select category: "Push"
3. Verify summary shows "Last workout: Push B"
4. Verify suggestion: "Try Push A today"
5. Click "Load Push A Template"
6. For exercises:
   - Verify "Last: 8 reps @ 103 lbs"
   - Verify "Try: 9 reps @ 103 lbs (+3% REPS)"
7. Complete workout using suggested reps
8. Save workout

### Verification
```sql
SELECT progression_method FROM workouts ORDER BY id DESC LIMIT 3;
```
Expected progression_method pattern: `'reps', 'weight', 'reps'` (alternating)

---

## Test Scenario 4: Old Workout Warning

### Expected Behavior
- If last workout is >7 days old, show warning icon and message
- Suggestion still appears but with caution

### Steps
1. Manually update database to make last workout old:
```sql
UPDATE workouts SET date = datetime('now', '-10 days') WHERE id = (SELECT MAX(id) FROM workouts);
```
2. Navigate to Workout screen
3. Verify warning appears: "⚠️ 10 days ago"
4. Verify message: "It's been a while - you may need to adjust weights"

---

## Test Scenario 5: Category Switching

### Expected Behavior
- Each category (Push/Pull/Legs/Core) tracks variations independently
- Switching categories shows correct last workout for that category

### Steps
1. Complete a Push A workout
2. Complete a Pull A workout
3. Return to Workout screen, select Push
4. Verify last workout shows Push A, suggests Push B
5. Select Pull category
6. Verify last workout shows Pull A, suggests Pull B

### Verification
```sql
SELECT category, variation, date FROM workouts ORDER BY date DESC LIMIT 5;
```
Expected: Different categories with their own A/B patterns

---

## Test Scenario 6: User Override

### Expected Behavior
- User can ignore suggestions and use custom weights/reps
- System still saves workout with user's actual values
- Next workout bases suggestions on actual performance, not suggestions

### Steps
1. Load suggested workout (e.g., suggests 103 lbs)
2. Manually enter 110 lbs instead
3. Save workout
4. Start next workout
5. Verify suggestion is based on 110 lbs (not 103 lbs)
6. Expected suggestion: 113 lbs (+3% of 110) or increased reps if alternating

---

## Test Scenario 7: New Exercise Added

### Expected Behavior
- Exercises in template but not in last workout show no suggestion
- User can still log them
- Next time they'll have a baseline to compare

### Steps
1. Load template with exercise not in previous workout
2. Verify no "Last:" or "Try:" labels for new exercise
3. Complete workout including new exercise
4. Save workout
5. Next workout should show suggestions for that exercise

---

## API Endpoint Tests

### Test `/api/workouts/last?category=Push`

**Valid Request:**
```bash
curl http://localhost:3002/api/workouts/last?category=Push
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "date": "2025-10-24T12:00:00.000Z",
  "category": "Push",
  "variation": "A",
  "progression_method": "weight",
  "duration_seconds": 3600,
  "exercises": [
    {
      "exercise": "Bench Press",
      "sets": [
        { "weight": 100, "reps": 8, "set_number": 1 },
        { "weight": 100, "reps": 8, "set_number": 2 }
      ]
    }
  ]
}
```

**No Previous Workout (404):**
```bash
curl http://localhost:3002/api/workouts/last?category=Legs
```
Expected: 404 with `{ "error": "No workout found for category: Legs" }`

**Missing Category (400):**
```bash
curl http://localhost:3002/api/workouts/last
```
Expected: 400 with `{ "error": "Category parameter is required" }`

---

## Progressive Overload Calculator Tests

### Test: Weight Progression (+3%)
```typescript
calculateProgressiveOverload(
  { weight: 100, reps: 8 },
  'reps',  // Last time was reps, so now do weight
  { weight: 100, reps: 8 }
)
// Expected: { suggestedWeight: 103, suggestedReps: 8, progressionMethod: 'weight', percentIncrease: 3.0 }
```

### Test: Reps Progression (+3%)
```typescript
calculateProgressiveOverload(
  { weight: 103, reps: 8 },
  'weight',  // Last time was weight, so now do reps
  { weight: 103, reps: 8 }
)
// Expected: { suggestedWeight: 103, suggestedReps: 9, progressionMethod: 'reps', percentIncrease: 3.0 }
```

### Test: Rounding (0.5 lb increments)
```typescript
calculateProgressiveOverload(
  { weight: 101, reps: 8 },
  'reps',
  { weight: 101, reps: 8 }
)
// 101 * 1.03 = 104.03 → rounds to 104.0
// Expected: { suggestedWeight: 104, suggestedReps: 8, progressionMethod: 'weight', percentIncrease: 3.0 }
```

### Test: Personal Best Boundary
```typescript
calculateProgressiveOverload(
  { weight: 95, reps: 8 },
  'reps',
  { weight: 100, reps: 8 }  // PR is higher
)
// 95 * 1.03 = 97.85 → rounds to 98.0
// But PR is 100, so should not suggest below PR
// Expected: { suggestedWeight: 100, suggestedReps: 8, progressionMethod: 'weight', percentIncrease: 3.0 }
```

---

## Database Schema Verification

**Check table structure:**
```sql
PRAGMA table_info(workouts);
```

**Expected columns:**
- `id` (INTEGER, PRIMARY KEY)
- `user_id` (INTEGER)
- `date` (TEXT)
- `category` (TEXT)
- `variation` (TEXT)
- `progression_method` (TEXT)
- `duration_seconds` (INTEGER)
- `created_at` (TIMESTAMP)

---

## Success Criteria Checklist

After completing all tests, verify:

- [x] Database stores category and progression_method
- [x] API endpoint returns last workout by category
- [x] Progressive overload calculations alternate correctly
- [x] UI displays last workout summary
- [x] UI displays exercise suggestions
- [x] Input fields pre-populate with suggestions
- [x] User can override suggestions
- [x] Selected variation and progression method save to database
- [x] Full workflow: First workout → Second workout with suggestions → Third workout with alternating progression
- [x] Builds compile without errors (frontend and backend)
- [x] No console errors in browser
- [x] Feature documented in README.md

---

## Rollback Instructions

If issues are found, rollback in reverse order:

1. **Revert UI changes:**
```bash
git checkout HEAD -- components/LastWorkoutSummary.tsx
git checkout HEAD -- components/Workout.tsx
```

2. **Revert progressive overload logic:**
```bash
git checkout HEAD -- utils/progressiveOverload.ts
```

3. **Revert API changes:**
```bash
git checkout HEAD -- backend/server.ts
git checkout HEAD -- backend/database/database.ts
git checkout HEAD -- api.ts
```

4. **Revert database schema:**
```sql
-- Remove new columns (if needed)
ALTER TABLE workouts DROP COLUMN category;
ALTER TABLE workouts DROP COLUMN progression_method;
```

---

## Known Limitations

1. **No unit tests yet** - Task 2.3 was marked as DEFERRED
2. **No performance optimization** - Task 4.3 was marked as DEFERRED
3. **Fixed 3% progression** - No user customization of percentage
4. **No failure tracking** - Priority 3 feature (future)
5. **No PR detection** - Priority 3 feature (future)

---

*This test guide ensures the Smart Workout Continuation feature works as designed across all user scenarios.*

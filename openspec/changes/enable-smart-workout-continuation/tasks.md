# Tasks: Enable Smart Workout Continuation

**Change ID:** `enable-smart-workout-continuation`
**Status:** Draft

---

## Task Overview

This change is broken into 3 phases with 15 total tasks. Each task delivers visible progress and includes validation steps.

**Estimated Total Time:** 12-16 hours

---

## Phase 1: Database & API Foundation (4-5 hours)

### Task 1.1: Database schema migration
**Estimate:** 1 hour
**Depends on:** None

**Work:**
1. Create migration script to add columns to `workouts` table:
   - `category TEXT` (Push/Pull/Legs/Core)
   - `progression_method TEXT` (weight/reps/null)
2. Test migration on development database
3. Verify existing workouts still load correctly (null values OK)
4. Document rollback procedure

**Validation:**
```sql
-- Verify columns exist
SELECT category, progression_method FROM workouts LIMIT 1;

-- Verify existing data intact
SELECT COUNT(*) FROM workouts;
```

**Deliverable:** Migration applied, database schema updated

---

### Task 1.2: Add category to workout save logic (backend)
**Estimate:** 1.5 hours
**Depends on:** Task 1.1

**Work:**
1. Modify `POST /api/workouts` endpoint in `backend/server.ts`
2. Accept `category` and `progression_method` in request body
3. Insert these values into workouts table
4. Update TypeScript types in `backend/types.ts`
5. Test with Postman/curl

**Validation:**
```bash
curl -X POST http://localhost:3002/api/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-24",
    "category": "Push",
    "variation": "A",
    "progression_method": "weight",
    "exercises": [...]
  }'

# Verify in database
SELECT id, category, variation, progression_method FROM workouts ORDER BY id DESC LIMIT 1;
```

**Deliverable:** Backend accepts and stores category + progression_method

---

### Task 1.3: Create "get last workout by category" endpoint
**Estimate:** 2 hours
**Depends on:** Task 1.2

**Work:**
1. Create new endpoint: `GET /api/workouts/last?category={category}`
2. Implement SQL query:
   ```sql
   SELECT w.*,
          GROUP_CONCAT(...) as exercises
   FROM workouts w
   WHERE w.user_id = ? AND w.category = ?
   ORDER BY w.date DESC
   LIMIT 1
   ```
3. Join with `exercise_sets` to include all exercises and sets
4. Return structured JSON with workout + exercises
5. Handle 404 case when no previous workout exists
6. Add TypeScript types for response

**Validation:**
```bash
# Test with existing category
curl http://localhost:3002/api/workouts/last?category=Push

# Test with new category (should return 404)
curl http://localhost:3002/api/workouts/last?category=Legs
```

**Deliverable:** API endpoint returns last workout by category

---

### Task 1.4: Update frontend API types
**Estimate:** 0.5 hour
**Depends on:** Task 1.3

**Work:**
1. Update `types.ts` to include:
   - `category` field in `WorkoutSaveRequest`
   - `progression_method` field in `WorkoutSaveRequest`
   - `LastWorkoutResponse` type for new endpoint
2. Update `api.ts` to add `getLastWorkout(category)` function
3. Test TypeScript compilation

**Validation:**
```bash
npm run build  # Should compile without errors
```

**Deliverable:** Frontend types match backend API

---

## Phase 2: Progressive Overload Logic (3-4 hours)

### Task 2.1: Create progressive overload calculator utility
**Estimate:** 2 hours
**Depends on:** Task 1.4

**Work:**
1. Create `utils/progressiveOverload.ts` with functions:
   - `calculateProgressiveOverload(lastPerformance, lastMethod, personalBest)`
   - `roundToNearestHalf(weight)`
   - `determineProgressionMethod(lastMethod)`
2. Implement alternation logic (weight ↔ reps)
3. Implement +3% calculations
4. Implement rounding logic
5. Handle edge cases (first workout, no PR, etc.)
6. Add comprehensive JSDoc comments

**Validation:**
```typescript
// Unit test cases
expect(calculateProgressiveOverload(
  { weight: 100, reps: 8 },
  'reps',
  { weight: 100, reps: 8 }
)).toEqual({
  suggestedWeight: 103,
  suggestedReps: 8,
  progressionMethod: 'weight',
  percentIncrease: 3.0
});

expect(calculateProgressiveOverload(
  { weight: 103, reps: 8 },
  'weight',
  { weight: 103, reps: 8 }
)).toEqual({
  suggestedWeight: 103,
  suggestedReps: 9,
  progressionMethod: 'reps',
  percentIncrease: 3.0
});
```

**Deliverable:** Tested utility functions for progressive overload

---

### Task 2.2: Integrate progressive overload into workout component
**Estimate:** 1.5 hours
**Depends on:** Task 2.1

**Work:**
1. Modify `components/Workout.tsx` to:
   - Fetch last workout when component mounts
   - Store last workout data in state
   - For each exercise, calculate suggestions using utility
   - Pass suggestions to exercise input components
2. Handle loading states
3. Handle error states (no last workout)

**Validation:**
- Load Workout screen
- Verify suggestions appear for exercises from last workout
- Verify no suggestions for new exercises
- Check browser console for errors

**Deliverable:** Workout component fetches and calculates suggestions

---

### Task 2.3: Create unit tests for progressive overload calculator
**Estimate:** 1 hour (optional but recommended)
**Depends on:** Task 2.1

**Work:**
1. Set up testing framework (if not exists)
2. Write tests for:
   - Weight progression calculation
   - Reps progression calculation
   - Alternation logic
   - Rounding behavior
   - Personal best boundary
   - Edge cases (null values, first workout)
3. Achieve >90% code coverage

**Validation:**
```bash
npm test -- progressiveOverload.test.ts
# All tests pass
```

**Deliverable:** Comprehensive test suite

---

## Phase 3: UI Components (4-6 hours)

### Task 3.1: Create LastWorkoutSummary component
**Estimate:** 2 hours
**Depends on:** Task 2.2

**Work:**
1. Create `components/LastWorkoutSummary.tsx`
2. Display:
   - "Continue from last {category} workout" header
   - Last workout info: "{Category} {Variation} - {X} days ago"
   - Suggested variation: "Try {Category} {Variation} today"
   - "Load Template" button
3. Handle states:
   - Loading (skeleton)
   - No previous workout (first-time message)
   - Old workout (>7 days, show warning)
4. Add styling with Tailwind/CSS
5. Calculate "days ago" from date

**Validation:**
- Render component with mock data
- Verify all states display correctly
- Check responsive layout on mobile

**Deliverable:** LastWorkoutSummary component complete

---

### Task 3.2: Create ExerciseSuggestion component
**Estimate:** 2 hours
**Depends on:** Task 2.2

**Work:**
1. Create `components/ExerciseSuggestion.tsx` (or enhance existing)
2. Display for each exercise:
   - Exercise name
   - Progression badge (+3% WEIGHT / +3% REPS)
   - "Last:" row with previous performance
   - "Try:" row with suggestion + up arrow
   - Input fields pre-populated with suggestions
3. Handle exercises without previous data (no suggestion)
4. Add visual styling:
   - Blue badge for weight progression
   - Green badge for reps progression
   - Highlight changed value
5. Ensure mobile-friendly layout

**Validation:**
- Render with suggestion data
- Render without suggestion data
- Verify input fields pre-populate
- Test user can override values

**Deliverable:** ExerciseSuggestion component complete

---

### Task 3.3: Add variation toggle to Workout screen
**Estimate:** 1 hour
**Depends on:** Task 3.1

**Work:**
1. Add variation toggle (radio buttons or tabs) to `Workout.tsx`
2. Default to suggested variation from last workout
3. Allow user to switch between A and B
4. Reload template when variation changes
5. Save selected variation with workout

**Validation:**
- Toggle defaults to suggested variation
- Clicking opposite variation loads different template
- Selected variation saved to database

**Deliverable:** Variation toggle functional

---

### Task 3.4: Wire up "Load Template" button
**Estimate:** 1.5 hours
**Depends on:** Task 3.1, Task 3.3

**Work:**
1. Connect "Load Template" button to template loading logic
2. When clicked:
   - Fetch template by category + variation
   - Populate exercises
   - Calculate and display suggestions for each exercise
   - Pre-fill input fields
3. Show confirmation/feedback when loaded
4. Handle errors (template not found)

**Validation:**
- Click "Load Push A Template"
- Verify exercises populate
- Verify suggestions display
- Verify input fields pre-filled

**Deliverable:** Template loading with suggestions works end-to-end

---

### Task 3.5: Integrate components into Workout screen
**Estimate:** 1 hour
**Depends on:** Task 3.1, Task 3.2, Task 3.4

**Work:**
1. Add `<LastWorkoutSummary />` to top of Workout screen
2. Replace/enhance exercise inputs with `<ExerciseSuggestion />`
3. Ensure proper data flow:
   - Last workout → Summary
   - Last workout → Suggestions
   - Suggestions → Input fields
   - User input → Save workout
4. Polish layout and spacing
5. Add loading states throughout

**Validation:**
- Full user flow: Load screen → See summary → Load template → See suggestions → Log workout
- Check responsive design
- Test error cases

**Deliverable:** Complete UI integration

---

## Phase 4: Testing & Polish (1-2 hours)

### Task 4.1: End-to-end testing
**Estimate:** 1 hour
**Depends on:** All previous tasks

**Work:**
1. Test complete user workflow:
   - Log first Push A workout (no suggestions)
   - Log second Push B workout (see weight suggestions)
   - Log third Push A workout (see reps suggestions)
   - Log fourth Push B workout (see weight suggestions on new rep count)
2. Test edge cases:
   - Very old last workout (>30 days)
   - Exercise in template but not in last workout
   - User overrides suggestions significantly
3. Test category switching (Push → Pull → Legs)
4. Verify database records correct data

**Validation:**
```sql
-- Check progression_method alternates
SELECT id, date, category, variation, progression_method
FROM workouts
ORDER BY date DESC
LIMIT 5;
```

**Deliverable:** All workflows tested and working

---

### Task 4.2: Documentation and cleanup
**Estimate:** 0.5 hour
**Depends on:** Task 4.1

**Work:**
1. Update README.md with new feature description
2. Add JSDoc comments to new functions
3. Remove debug console.log statements
4. Format code consistently
5. Update ARCHITECTURE.md if needed
6. Create user-facing documentation for progressive overload

**Validation:**
- Code review passes
- Documentation is clear
- No console errors/warnings

**Deliverable:** Clean, documented code

---

### Task 4.3: Performance optimization (optional)
**Estimate:** 1 hour
**Depends on:** Task 4.1

**Work:**
1. Add database index for (user_id, category, date DESC)
2. Cache last workout in component state (avoid re-fetching)
3. Memoize progressive overload calculations
4. Optimize SQL query for last workout (single query with JOIN)
5. Lazy load LastWorkoutSummary component

**Validation:**
```bash
# Measure before/after
# Time to load Workout screen: <500ms
# Time to fetch last workout: <50ms
```

**Deliverable:** Optimized performance

---

## Task Dependencies Diagram

```
Phase 1 (Database & API)
  1.1 (DB Migration)
    ↓
  1.2 (Backend save)
    ↓
  1.3 (Last workout endpoint)
    ↓
  1.4 (Frontend types)

Phase 2 (Logic)
  2.1 (Calculator utility) ←── 1.4
    ↓
  2.2 (Integrate into component)
    ↓
  2.3 (Unit tests) [parallel]

Phase 3 (UI)
  3.1 (Summary component) ←── 2.2
    ↓
  3.2 (Suggestion component) ←── 2.2
    ↓
  3.3 (Variation toggle) ←── 3.1
    ↓
  3.4 (Load button) ←── 3.1, 3.3
    ↓
  3.5 (Integration) ←── 3.1, 3.2, 3.4

Phase 4 (Testing)
  4.1 (E2E testing) ←── 3.5
    ↓
  4.2 (Documentation)
    ↓
  4.3 (Performance) [optional]
```

---

## Parallelization Opportunities

The following tasks can be worked on in parallel:

**After Task 1.4:**
- Task 2.1 (Calculator) + Task 3.1 (UI components with mock data)

**After Task 2.1:**
- Task 2.2 (Integration) + Task 2.3 (Tests)

**After Task 2.2:**
- Task 3.1 (Summary) + Task 3.2 (Suggestions) can start mockups in parallel

---

## Rollback Plan

If issues arise, rollback in reverse order:

1. **UI Issues (Phase 3):** Remove new components, revert Workout.tsx
2. **Logic Issues (Phase 2):** Remove calculator, use simple last workout display
3. **API Issues (Phase 1.3):** Disable new endpoint, existing logging still works
4. **DB Issues (Phase 1.1):** Run migration rollback:
   ```sql
   ALTER TABLE workouts DROP COLUMN category;
   ALTER TABLE workouts DROP COLUMN progression_method;
   ```

---

## Success Metrics

After completion, verify:

- ✅ Database stores category and progression_method
- ✅ API endpoint returns last workout by category
- ✅ Progressive overload calculations alternate correctly
- ✅ UI displays last workout summary
- ✅ UI displays exercise suggestions
- ✅ Input fields pre-populate with suggestions
- ✅ User can override suggestions
- ✅ Selected variation and progression method save to database
- ✅ Full workflow: First workout → Second workout with suggestions → Third workout with alternating progression

---

*Total estimated time: 12-16 hours across 4 phases, 15 tasks*

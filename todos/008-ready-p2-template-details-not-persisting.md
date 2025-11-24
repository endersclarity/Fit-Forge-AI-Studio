---
status: ready
priority: p2
issue_id: "008"
tags: [bug, ux, workout-builder, templates, data-loss]
dependencies: []
---

# Workout Template Details Not Persisting (Weights/Reps/Rest Lost)

## Problem Statement

When building a workout template in Workout Builder with detailed set information (specific weights, reps, rest times), those details are NOT saved to the database. When starting the workout from the saved template, only exercise IDs are loaded and all weights default to 0, forcing users to re-enter everything they just meticulously planned. This defeats the purpose of saving templates.

## Findings

- **User Impact**: Must re-enter all workout details after careful planning
- **Current Behavior**: Only `exerciseIds` saved, full set details thrown away
- **Database Ready**: `workout_templates.sets` column exists but unused
- **Location**:
  - `components/workout-builder/WorkoutBuilderPage.tsx:208` (only saves exerciseIds)
  - `components/WorkoutTemplatesPage.tsx:95-99` (hardcoded defaults)
- **Related GitHub Issue**: [#9](https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/9)
- **Secondary Issue**: No "Start Workout" button in builder (requires navigation back to Dashboard)

## Problem Scenario

**Example: User building "Push Day A"**

1. User opens Workout Builder
2. User meticulously adds 5 exercises with specific details:
   - Dumbbell Bench Press: 90 lbs × 10 reps, 90s rest (3 sets)
   - Tricep Extension: BW × 10 reps, 90s rest (3 sets)
   - Kettlebell Press: 50 lbs × 10 reps, 90s rest (3 sets)
   - TRX Pushup: BW × 12 reps, 90s rest (3 sets)
   - Single Arm Dumbbell Press: 70 lbs × 10 reps, 90s rest (3 sets)
3. User clicks "Save Template" → saves as "Push Day A"
4. User navigates back to Dashboard → Saved Workouts → Push Day A
5. User clicks "Begin Workout"
6. **Result**:
   - ✅ All 5 exercises loaded
   - ❌ All weights = 0 (should be 90, BW, 50, BW, 70)
   - ❌ Only default reps (10) - ignores custom values
   - ❌ Only default rest (90s)
7. User must re-enter everything, wasting time

## Root Cause Analysis

**Current Implementation (WorkoutBuilderPage.tsx:208):**
```typescript
// ❌ Only saving exercise IDs, losing all set details
const exerciseIds = selectedExercises.map(ex => ex.exerciseId);

await templatesAPI.create({
  name: workoutName.trim(),
  category,
  variation: 'A',
  exerciseIds,  // Only IDs saved
  isFavorite: false,
});
```

**Current Loading (WorkoutTemplatesPage.tsx:95-99):**
```typescript
// ❌ Hardcoded defaults ignore saved data
sets: [
  { weight: 0, reps: 10, restSeconds: 90 },
  { weight: 0, reps: 10, restSeconds: 90 },
  { weight: 0, reps: 10, restSeconds: 90 },
]
```

**Database Schema (backend/database/schema.sql:143):**
```sql
CREATE TABLE workout_templates (
  ...
  exercise_ids TEXT, -- DEPRECATED: Old format
  sets TEXT,         -- ✅ Ready but unused: JSON array of TemplateSet
  ...
);
```

## Proposed Solutions

### Option 1: Full Template Persistence (Primary)

**Changes Required:**

1. **Backend Types** (`backend/types.ts`)
   - Update `WorkoutTemplate` interface to include `sets?: TemplateSet[]`
   - Define `TemplateSet` type if not exists

2. **Database Functions** (`backend/database/database.ts`)
   - Update `createWorkoutTemplate()` to save `sets` column as JSON
   - Update `getWorkoutTemplates()` to parse and return `sets` column
   - Update `updateWorkoutTemplate()` to update `sets` column
   - Fallback to `exerciseIds` for legacy templates

3. **Workout Builder** (`components/workout-builder/WorkoutBuilderPage.tsx`)
   - Save full `selectedExercises` array with all set details
   - Pass to `templatesAPI.create()` as `sets` field
   - Keep `exerciseIds` for backward compatibility

4. **Template Loading** (`components/WorkoutTemplatesPage.tsx`)
   - Load `template.sets` if available
   - Use actual saved weights, reps, rest times
   - Fallback to hardcoded defaults only if `sets` is null/undefined

**Data Structure:**
```typescript
interface TemplateSet {
  exerciseId: string;
  exerciseName: string;
  sets: Array<{
    weight: number | 'bodyweight';
    reps: number;
    restSeconds: number;
  }>;
}
```

**Pros**:
- Preserves all user planning effort
- Uses existing database column
- Backward compatible (keeps exerciseIds)
- Solves root cause completely

**Cons**:
- Requires changes across 4 files
- Need migration for existing templates

**Effort**: Medium (4-6 hours)
**Risk**: Low (existing column, backward compatible)

### Option 2: Add "Start Workout" Button (Complementary)

**Location:** `components/workout-builder/WorkoutBuilderPage.tsx`

**Implementation:**
- Add "Start Workout" button next to "Save Template"
- On click, navigate directly to active workout with current `selectedExercises`
- Bypass template save/load roundtrip

**Pros**:
- Better UX (one less navigation step)
- Preserves details for immediate workout
- Quick win

**Cons**:
- Doesn't fix template persistence issue
- Only helps if user starts workout immediately

**Effort**: Small (1-2 hours)
**Risk**: Very Low

## Recommended Action

**Phase 1: Full Template Persistence (P2)**
Implement Option 1 to fix root cause - ensures saved templates preserve all details.

**Phase 2: Add Start Workout Button (P3)**
Implement Option 2 as UX improvement after Phase 1 complete.

## Technical Details

**Affected Files:**
- `backend/types.ts` - Add `sets` to WorkoutTemplate interface
- `backend/database/database.ts` - Update CRUD functions
- `components/workout-builder/WorkoutBuilderPage.tsx` - Save full details
- `components/WorkoutTemplatesPage.tsx` - Load full details

**Related Components:**
- Template save/load flow
- Workout builder state management
- Exercise library integration

**Database Changes**:
- No schema changes needed (column exists)
- May need data migration for existing templates

## Resources

- GitHub Issue: [#9](https://github.com/endersclarity/Fit-Forge-AI-Studio/issues/9)
- Database schema: `backend/database/schema.sql:136-149`
- Template types: `types/savedWorkouts.ts`
- Backend template functions: `backend/database/database.ts:1940-1994`

## Acceptance Criteria

- [ ] Backend `WorkoutTemplate` type includes `sets` field
- [ ] `createWorkoutTemplate()` saves full set details to `sets` column
- [ ] `getWorkoutTemplates()` returns parsed `sets` data
- [ ] Workout Builder saves complete set details (weights, reps, rest)
- [ ] Template loading uses saved details instead of hardcoded defaults
- [ ] Backward compatibility maintained for old templates (exerciseIds fallback)
- [ ] Starting workout from template preserves all planned details
- [ ] Tests pass for template save/load flow
- [ ] Verified with multiple template types and exercise combinations

## Work Log

### 2024-11-24 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue discovered during workout template creation
- User created "Push Day A" with detailed weights/reps
- All details lost when loading template
- User had to re-enter all weights manually
- Categorized as P2 IMPORTANT
- Estimated effort: Medium (4-6 hours)

**Learnings:**
- Database column `sets` exists but is unused (marked DEPRECATED in schema)
- Current code only uses `exercise_ids` column
- Frontend has proper data structure (`PlannedExercise` with `PlannedSet[]`)
- Just need to wire everything together

## Notes

**Source:** Triage session on 2024-11-24
**Schema Comment:** `exercise_ids` marked as "DEPRECATED: Old format" with `sets` column ready
**User Pain:** "I meticulously planned everything and had to re-enter it all"

# Quick Builder + Execution Mode Implementation Plan

## Overview
Add a new "Build Workout" mode to the Quick Add FAB that allows users to pre-plan workouts with rest timers, then execute them with guided timer support and real-time muscle fatigue visualization.

## Critical Decisions Required Before Implementation

### Decision 1: Template Saving Behavior
**Question:** Should "Save as Template" update an existing template or always create new?

**Options:**
- **A. Always create new** (Recommended) - Simpler, no confusion about overwriting
- **B. Prompt "Update existing or save as new?"** - More flexible but adds UI complexity
- **C. Smart detection** - If loaded from template, show "Update" button; otherwise "Save as Template"

**Recommended:** Option A - Always create new templates. Add separate "Update Template" feature later if needed.

**User Decision:** ✅ Option A - Always create new

---

### Decision 2: Execution Muscle Visualization
**Question:** Should execution view show both current fatigue AND forecasted end state?

**Options:**
- **A. Current only** - Simpler, shows real-time progress
- **B. Current + Forecast** (Recommended) - Shows "you are here" vs "you'll end here"
- **C. Toggle between views** - Most flexible but adds UI complexity

**Recommended:** Option B - Show both with visual distinction (e.g., forecast as dotted line or lighter color).

**User Decision:** ✅ Option B - Current + Forecast

---

### Decision 3: Drag-Drop Reordering
**Question:** Is drag-drop reordering of sets required for MVP?

**Options:**
- **A. Yes, required** - Add drag-drop implementation tasks (adds 4-6 hours)
- **B. No, defer to v2** (Recommended) - Remove `orderIndex` field, use array order
- **C. Manual reordering only** - Add up/down arrow buttons (adds 2-3 hours)

**Recommended:** Option B - Defer to v2. Users can delete and re-add sets for now.

**User Decision:** ✅ Option B - Defer to v2 (not required for MVP)

---

### Decision 4: Mid-Workout Edit Behavior
**Question:** What happens if user edits plan mid-workout and removes a set they already completed?

**Options:**
- **A. Keep it counted** (Recommended) - Preserve completedSets, mark as "removed from plan"
- **B. Remove from history** - Act like it never happened
- **C. Warn and block** - Prevent removing completed sets

**Recommended:** Option A - Keep the set counted in workout but don't show in remaining sets list.

**User Decision:** ✅ Option A - Keep completed sets counted

---

## Feature Specification

### FAB Menu Structure
The FAB button will open a menu with 3 options:
1. **Log Workout** - Existing Quick Add flow (retroactive logging)
2. **Build Workout** - NEW: Plan workout with rest timers, then execute
3. **Load Template** - NEW: Load saved workout template

### Build Workout Flow
1. User selects exercises and configures:
   - Weight (lbs)
   - Reps
   - Rest timer (90s default)
2. **+ Duplicate button** adds identical set below (tweakable)
3. Add multiple exercises as needed
4. **Muscle visualization** shows all planned muscles from start
5. Finish options:
   - **Start Workout** → Execute with guided timers
   - **Save as Template** → Save for future use
   - **Log as Completed** → Save without execution

### Execution Mode
1. Display current set only
2. Auto-advance after rest timer completes (timer is informational)
3. Real-time muscle fatigue updates as sets are completed
4. Seamless exercise transitions (no summaries)
5. Mid-workout flexibility: "Edit Plan" button to add/skip/reorder
6. **Finish Workout** button after last set → saves to DB

### Template System
- Accessible from Dashboard "My Templates" button
- Also accessible from FAB → "Load Template"
- Editable in Build view before starting
- Also editable mid-workout during execution

## Technical Architecture

### Data Models

#### BuilderSet (new type in types.ts)
```typescript
interface BuilderSet {
  id: string;                    // Unique identifier for React keys
  exerciseId: string;            // Reference to Exercise.id
  exerciseName: string;          // Cached for display
  weight: number;
  reps: number;
  restTimerSeconds: number;      // Default 90
}
```

**Note:** `orderIndex` removed since drag-drop reordering is deferred to v2. Array position determines order.

#### BuilderWorkout (new type in types.ts)
```typescript
interface BuilderWorkout {
  sets: BuilderSet[];
  currentSetIndex: number;       // For execution tracking
  startTime: number | null;      // Timestamp when "Start Workout" clicked
  muscleStatesSnapshot: MuscleStatesResponse; // Captured at start
}
```

#### WorkoutTemplate (already exists in types.ts:144-154)
```typescript
interface WorkoutTemplate {
  id: string;
  name: string;
  category: ExerciseCategory;
  variation: "A" | "B";
  exerciseIds: string[];
  isFavorite: boolean;
  timesUsed: number;
  createdAt: number;
  updatedAt: number;
}
```

**Extension Needed:** Template needs to store set configurations, not just exercise IDs.

#### TemplateSet (new type in types.ts)
```typescript
interface TemplateSet {
  exerciseId: string;
  weight: number;
  reps: number;
  restTimerSeconds: number;
}
```

**Note:** `orderIndex` removed - array position determines order.

**Update WorkoutTemplate:**
```typescript
interface WorkoutTemplate {
  id: string;
  name: string;
  category: ExerciseCategory;
  variation: "A" | "B";
  sets: TemplateSet[];          // CHANGED from exerciseIds
  isFavorite: boolean;
  timesUsed: number;
  createdAt: number;
  updatedAt: number;
}
```

### Component Hierarchy

```
Dashboard
└── FAB Button (modified)
    └── FABMenu (new component)
        ├── "Log Workout" → QuickAdd (existing)
        ├── "Build Workout" → WorkoutBuilder (new)
        └── "Load Template" → TemplateSelector (new)

WorkoutBuilder (new)
├── BuilderView (planning phase)
│   ├── SetConfigurator (add sets)
│   │   ├── ExercisePicker (reuse existing)
│   │   ├── WeightInput
│   │   ├── RepsInput
│   │   └── RestTimerInput
│   ├── SetList (displays planned sets)
│   │   └── SetCard (draggable, editable, deletable)
│   ├── MuscleVisualization (reuse from Dashboard)
│   └── ActionButtons
│       ├── "Start Workout"
│       ├── "Save as Template"
│       └── "Log as Completed"
└── ExecutionView (execution phase)
    ├── CurrentSetDisplay
    │   ├── ExerciseInfo
    │   ├── SetInfo (weight/reps)
    │   └── RestTimer (countdown)
    ├── MuscleVisualization (real-time updates)
    ├── EditPlanButton → BuilderView (modal overlay)
    └── FinishWorkoutButton

TemplateSelector (new)
├── TemplateList
│   └── TemplateCard
│       ├── Template info
│       ├── "Load" button
│       └── "Delete" button
└── "Create New" button → WorkoutBuilder

Dashboard (modified)
└── "My Templates" button → TemplateSelector
```

### Reusable Components

**Already Exist:**
1. **ExercisePicker** (`components/ExercisePicker.tsx`)
   - Reuse as-is for exercise selection
   - Already has category/equipment/muscle filters

2. **MuscleVisualization** (from Dashboard/MuscleDeepDiveModal)
   - Reuse for real-time fatigue display
   - Needs props: `muscleStates`, `muscleBaselines`

3. **Weight/Reps Input Pattern** (from QuickAddForm)
   - Reuse increment button pattern (±2.5, ±5 for weight; ±1 for reps)

4. **Rest Timer** (from WorkoutTracker)
   - Reuse existing RestTimer component (lines 135-161 in Workout.tsx)
   - Already has countdown, progress bar, +15s button

**Need to Create:**
1. **FABMenu** - Modal menu with 3 options
2. **WorkoutBuilder** - Main container (BuilderView + ExecutionView)
3. **SetConfigurator** - Form for configuring a single set
4. **SetList** - Display planned sets with drag-drop
5. **SetCard** - Individual set display (editable, draggable, deletable)
6. **CurrentSetDisplay** - Execution mode set display
7. **TemplateSelector** - Template browser/loader
8. **TemplateCard** - Individual template display

### State Management

**WorkoutBuilder State:**
```typescript
type BuilderMode = 'planning' | 'executing';

interface WorkoutBuilderState {
  mode: BuilderMode;
  workout: BuilderWorkout;
  currentMuscleStates: MuscleStatesResponse;
  muscleBaselines: MuscleBaselines;
  restTimerEndTime: number | null;  // For countdown calculation
  isEditPlanOpen: boolean;           // Mid-workout editing
}
```

**State Transitions:**
1. `planning` → `executing`: User clicks "Start Workout"
   - Capture muscle states snapshot
   - Set startTime
   - Initialize currentSetIndex = 0
   - Start rest timer for first set

2. `executing` → `planning`: User clicks "Edit Plan"
   - Open BuilderView as modal overlay
   - Keep execution state (can resume)

3. `executing` → `complete`: User clicks "Finish Workout"
   - Calculate muscle fatigue deltas
   - Save workout to API
   - Update muscle states
   - Close modal

### API Integration

**Templates API (already exists):**
- `templatesAPI.getAll()` - Fetch all templates
- `templatesAPI.create(template)` - Save new template
- `templatesAPI.delete(id)` - Delete template
- `templatesAPI.update(id, template)` - Update template (for timesUsed)

**Workouts API (already exists):**
- `workoutsAPI.create(workout)` - Save completed workout

**Muscle States API (already exists):**
- `muscleStatesAPI.get()` - Fetch current states
- `muscleStatesAPI.update(states)` - Update after workout

**New API Endpoint Needed:**
```typescript
// Add to api.ts
export const builderAPI = {
  /**
   * Save a builder workout (from "Log as Completed")
   * Similar to quick-workout but with rest timer metadata
   */
  saveBuilderWorkout: async (request: BuilderWorkoutRequest): Promise<QuickWorkoutResponse> => {
    return await apiRequest<QuickWorkoutResponse>('/builder-workout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
};

// Add to types.ts
export interface BuilderWorkoutRequest {
  sets: Array<{
    exercise_name: string;
    weight: number;
    reps: number;
    rest_timer_seconds: number;
  }>;
  timestamp: string;  // ISO 8601
  was_executed: boolean;  // true if executed, false if "Log as Completed"
}
```

### Muscle Fatigue Calculation

**During Execution:**
1. When user completes a set, calculate volume: `weight × reps`
2. Group by muscle engagement (from Exercise.muscleEngagements)
3. Calculate fatigue delta per muscle:
   ```
   fatiguePercent = (volume / baseline.effectiveMax) × 100
   ```
4. Update real-time visualization

**On Finish Workout:**
1. Calculate total fatigue per muscle across all completed sets
2. Call `muscleStatesAPI.update()` with new fatigue values
3. Backend calculates:
   - `initial_fatigue_percent` = current fatigue + new fatigue
   - `last_trained` = current timestamp
   - `estimated_recovery_days` based on fatigue and user's recovery rate

### Backend Changes Required

#### New Endpoint: POST /api/builder-workout

**Purpose:** Save a workout from WorkoutBuilder (executed or logged as completed)

**Request Body:**
```json
{
  "sets": [
    {
      "exercise_name": "Push-ups",
      "weight": 0,
      "reps": 15,
      "rest_timer_seconds": 90
    },
    {
      "exercise_name": "Push-ups",
      "weight": 0,
      "reps": 12,
      "rest_timer_seconds": 90
    }
  ],
  "timestamp": "2025-10-28T10:30:00.000Z",
  "was_executed": true
}
```

**Response:** Same as `/api/quick-workout` response

**Implementation:**
- Reuse existing quick-workout logic
- `rest_timer_seconds` is metadata (logged but not used for calculations)
- `was_executed` is metadata (could be used for analytics)
- Group sets by exercise_name (same as quick-workout)
- Calculate muscle fatigue, PRs, baselines (same as quick-workout)

#### Update: WorkoutTemplate Schema

**Current schema** (inferred from templatesAPI):
```sql
CREATE TABLE workout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  variation TEXT,
  exercise_ids TEXT,  -- JSON array
  is_favorite INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);
```

**Updated schema:**
```sql
CREATE TABLE workout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  variation TEXT,
  sets TEXT,  -- JSON array of TemplateSet objects
  is_favorite INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);
```

**Migration:** Convert existing templates:
```sql
-- Before migration: exercise_ids = ["push-ups", "dips"]
-- After migration: sets = [
--   {"exerciseId": "push-ups", "weight": 0, "reps": 15, "restTimerSeconds": 90, "orderIndex": 0},
--   {"exerciseId": "push-ups", "weight": 0, "reps": 12, "restTimerSeconds": 90, "orderIndex": 1},
--   {"exerciseId": "dips", "weight": 0, "reps": 10, "restTimerSeconds": 90, "orderIndex": 2}
-- ]
```

## Implementation Tasks

### Phase 1: Foundation (Data Models & API)

#### Task 1.1: Update TypeScript Types
**File:** `types.ts`

Add new types:
```typescript
// Line ~155 (after WorkoutTemplate)
export interface BuilderSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  restTimerSeconds: number;
  orderIndex: number;
}

export interface BuilderWorkout {
  sets: BuilderSet[];
  currentSetIndex: number;
  startTime: number | null;
  muscleStatesSnapshot: MuscleStatesResponse | null;
}

export interface TemplateSet {
  exerciseId: string;
  weight: number;
  reps: number;
  restTimerSeconds: number;
  orderIndex: number;
}

export interface BuilderWorkoutRequest {
  sets: Array<{
    exercise_name: string;
    weight: number;
    reps: number;
    rest_timer_seconds: number;
  }>;
  timestamp: string;
  was_executed: boolean;
}
```

Update WorkoutTemplate:
```typescript
// Line ~144, replace existing WorkoutTemplate
export interface WorkoutTemplate {
  id: string;
  name: string;
  category: ExerciseCategory;
  variation: "A" | "B";
  sets: TemplateSet[];  // CHANGED from exerciseIds
  isFavorite: boolean;
  timesUsed: number;
  createdAt: number;
  updatedAt: number;
}
```

**Verification:**
- Run `npm run type-check` to ensure no TypeScript errors
- Check that existing code using `WorkoutTemplate.exerciseIds` is flagged (none should exist yet)

---

#### Task 1.2: Add builderAPI to api.ts
**File:** `api.ts`

Add after templatesAPI (line ~221):
```typescript
/**
 * Workout Builder API
 */
export const builderAPI = {
  /**
   * Save a builder workout (executed or logged as completed)
   */
  saveBuilderWorkout: async (request: import('./types').BuilderWorkoutRequest): Promise<import('./types').QuickWorkoutResponse> => {
    return await apiRequest<import('./types').QuickWorkoutResponse>('/builder-workout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
};
```

**Verification:**
- Ensure import statements include `BuilderWorkoutRequest`
- No TypeScript errors after adding

---

#### Task 1.3: Backend - Add POST /api/builder-workout Endpoint
**File:** `backend/src/routes/workouts.ts` (or equivalent)

Add new route:
```typescript
// After quick-workout route
router.post('/builder-workout', async (req, res) => {
  try {
    const { sets, timestamp, was_executed } = req.body;

    // Validate request
    if (!sets || !Array.isArray(sets) || sets.length === 0) {
      return res.status(400).json({ error: 'Sets array is required' });
    }

    // Group sets by exercise (same logic as quick-workout)
    const exerciseGroups: Map<string, any[]> = new Map();
    for (const set of sets) {
      if (!exerciseGroups.has(set.exercise_name)) {
        exerciseGroups.set(set.exercise_name, []);
      }
      exerciseGroups.get(set.exercise_name)!.push({
        weight: set.weight,
        reps: set.reps,
        to_failure: false,  // Builder doesn't track to_failure yet
      });
    }

    // Convert to workout format
    const exercises = Array.from(exerciseGroups.entries()).map(([name, sets]) => ({
      exercise: name,
      sets: sets,
    }));

    // Reuse existing workout creation logic
    const workoutResult = await createWorkout({
      exercises,
      timestamp: timestamp || new Date().toISOString(),
      metadata: {
        source: 'builder',
        was_executed,
      }
    });

    res.json(workoutResult);
  } catch (error) {
    console.error('Builder workout save failed:', error);
    res.status(500).json({ error: 'Failed to save builder workout' });
  }
});
```

**Verification:**
- Test with Postman/curl:
  ```bash
  curl -X POST http://localhost:3001/api/builder-workout \
    -H "Content-Type: application/json" \
    -d '{
      "sets": [
        {"exercise_name": "Push-ups", "weight": 0, "reps": 15, "rest_timer_seconds": 90}
      ],
      "timestamp": "2025-10-28T10:30:00Z",
      "was_executed": true
    }'
  ```
- Should return workout_id, category, prs, etc.

---

#### Task 1.4: Backend - Update WorkoutTemplate Schema
**File:** `backend/src/db/migrations/006_update_workout_templates.sql`

Create migration to update templates schema:

```sql
-- Step 1: Add new column for sets
ALTER TABLE workout_templates ADD COLUMN sets TEXT;

-- Step 2: Migrate existing data
-- Convert exercise_ids JSON array to sets array with default values
-- For SQLite, we need to do this row by row
UPDATE workout_templates
SET sets = (
  SELECT json_group_array(
    json_object(
      'exerciseId', value,
      'weight', 0,
      'reps', 10,
      'restTimerSeconds', 90,
      'orderIndex', key
    )
  )
  FROM json_each(exercise_ids)
)
WHERE exercise_ids IS NOT NULL AND exercise_ids != '[]';

-- Step 3: For templates with no exercises, set empty array
UPDATE workout_templates
SET sets = '[]'
WHERE sets IS NULL;

-- Step 4: Verify migration (optional, for logging)
-- SELECT id, name, exercise_ids, sets FROM workout_templates;

-- Step 5: Drop old column (ONLY after verifying migration worked)
-- UNCOMMENT after confirming data migrated correctly:
-- ALTER TABLE workout_templates DROP COLUMN exercise_ids;
```

**Migration Script (Node.js):**
If your backend uses JavaScript/TypeScript for migrations, use this instead:

```javascript
// backend/src/db/migrations/006_update_workout_templates.js
module.exports = {
  async up(db) {
    // Add new column
    await db.exec('ALTER TABLE workout_templates ADD COLUMN sets TEXT');

    // Get all existing templates
    const templates = await db.all('SELECT id, exercise_ids FROM workout_templates');

    // Migrate each template
    for (const template of templates) {
      if (!template.exercise_ids) {
        await db.run('UPDATE workout_templates SET sets = ? WHERE id = ?', ['[]', template.id]);
        continue;
      }

      try {
        const exerciseIds = JSON.parse(template.exercise_ids);
        const sets = exerciseIds.map((exerciseId, index) => ({
          exerciseId,
          weight: 0,
          reps: 10,
          restTimerSeconds: 90,
          orderIndex: index,
        }));

        await db.run(
          'UPDATE workout_templates SET sets = ? WHERE id = ?',
          [JSON.stringify(sets), template.id]
        );
      } catch (error) {
        console.error(`Failed to migrate template ${template.id}:`, error);
        // Set empty array as fallback
        await db.run('UPDATE workout_templates SET sets = ? WHERE id = ?', ['[]', template.id]);
      }
    }

    console.log(`Migrated ${templates.length} templates`);
  },

  async down(db) {
    // Rollback: restore exercise_ids from sets
    await db.exec('ALTER TABLE workout_templates ADD COLUMN exercise_ids TEXT');

    const templates = await db.all('SELECT id, sets FROM workout_templates');

    for (const template of templates) {
      if (!template.sets) continue;

      try {
        const sets = JSON.parse(template.sets);
        const exerciseIds = sets.map(s => s.exerciseId);
        await db.run(
          'UPDATE workout_templates SET exercise_ids = ? WHERE id = ?',
          [JSON.stringify(exerciseIds), template.id]
        );
      } catch (error) {
        console.error(`Failed to rollback template ${template.id}:`, error);
      }
    }

    await db.exec('ALTER TABLE workout_templates DROP COLUMN sets');
  }
};
```

**Verification:**
- Run migration: `npm run migrate` (or `node backend/src/db/migrate.js`)
- Check database: `SELECT id, name, sets FROM workout_templates LIMIT 5`
- Verify sets column contains JSON array of TemplateSet objects
- Test existing template: Load template in UI, verify exercises display correctly
- After confirming migration works, uncomment DROP COLUMN in SQL migration

---

#### Task 1.5: Backend - Update templatesAPI Endpoints
**File:** `backend/src/routes/templates.ts` (or equivalent)

Update GET/POST/PUT endpoints to use `sets` instead of `exerciseIds`:

```typescript
// GET /api/templates/:id
router.get('/:id', async (req, res) => {
  const template = await db.get('SELECT * FROM workout_templates WHERE id = ?', req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json({
    ...template,
    sets: JSON.parse(template.sets),  // Parse JSON string to array
    isFavorite: Boolean(template.is_favorite),
  });
});

// POST /api/templates
router.post('/', async (req, res) => {
  const { name, category, variation, sets, isFavorite } = req.body;
  const id = generateId();
  const now = new Date().toISOString();

  await db.run(
    'INSERT INTO workout_templates (id, name, category, variation, sets, is_favorite, times_used, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, category, variation, JSON.stringify(sets), isFavorite ? 1 : 0, 0, now, now]
  );

  res.json({ id, name, category, variation, sets, isFavorite, timesUsed: 0, createdAt: now, updatedAt: now });
});

// Similar updates for PUT /api/templates/:id
```

**Verification:**
- Test template creation with new `sets` format
- Test template retrieval (should return sets array)

---

### Phase 2: FAB Menu & Navigation

#### Task 2.1: Create FABMenu Component
**File:** `components/FABMenu.tsx` (new file)

Create modal menu with 3 options:

```typescript
import React from 'react';

interface FABMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogWorkout: () => void;
  onBuildWorkout: () => void;
  onLoadTemplate: () => void;
}

const FABMenu: React.FC<FABMenuProps> = ({
  isOpen,
  onClose,
  onLogWorkout,
  onBuildWorkout,
  onLoadTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-t-2xl p-6 w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4 text-center">Quick Actions</h3>

        <div className="space-y-3">
          <button
            onClick={onLogWorkout}
            className="w-full bg-brand-muted text-white font-semibold py-4 px-4 rounded-lg hover:bg-brand-dark transition-colors text-left flex items-center gap-3"
          >
            <span className="text-2xl">📝</span>
            <div>
              <div className="font-bold">Log Workout</div>
              <div className="text-sm text-slate-400">Record a completed workout</div>
            </div>
          </button>

          <button
            onClick={onBuildWorkout}
            className="w-full bg-brand-cyan text-brand-dark font-semibold py-4 px-4 rounded-lg hover:bg-cyan-400 transition-colors text-left flex items-center gap-3"
          >
            <span className="text-2xl">🏗️</span>
            <div>
              <div className="font-bold">Build Workout</div>
              <div className="text-sm text-slate-600">Plan and execute with timers</div>
            </div>
          </button>

          <button
            onClick={onLoadTemplate}
            className="w-full bg-brand-muted text-white font-semibold py-4 px-4 rounded-lg hover:bg-brand-dark transition-colors text-left flex items-center gap-3"
          >
            <span className="text-2xl">📋</span>
            <div>
              <div className="font-bold">Load Template</div>
              <div className="text-sm text-slate-400">Use a saved workout plan</div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>

      <style>{`
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FABMenu;
```

**Verification:**
- Component renders without errors
- Clicking backdrop or Cancel closes menu
- Clicking an option calls corresponding handler

---

#### Task 2.2: Update Dashboard FAB to Open Menu
**File:** `components/Dashboard.tsx`

Update FAB button and state (around lines 689-719):

```typescript
// Add new state variables (around line 80)
const [isFABMenuOpen, setIsFABMenuOpen] = useState(false);
const [isBuilderOpen, setIsBuilderOpen] = useState(false);
const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

// Update FAB button onClick (line 690)
<button
  onClick={() => setIsFABMenuOpen(true)}  // CHANGED from setIsQuickAddOpen
  className="fixed bottom-6 right-6 w-14 h-14 bg-brand-cyan text-brand-dark rounded-full shadow-lg hover:bg-cyan-400 transition-all hover:scale-110 flex items-center justify-center z-40"
  aria-label="Quick Actions"
>
  {/* ... SVG ... */}
</button>

// Add FABMenu component (after QuickAdd, line ~720)
<FABMenu
  isOpen={isFABMenuOpen}
  onClose={() => setIsFABMenuOpen(false)}
  onLogWorkout={() => {
    setIsFABMenuOpen(false);
    setIsQuickAddOpen(true);
  }}
  onBuildWorkout={() => {
    setIsFABMenuOpen(false);
    setIsBuilderOpen(true);
  }}
  onLoadTemplate={() => {
    setIsFABMenuOpen(false);
    setIsTemplateSelectorOpen(true);
  }}
/>

// Add placeholder modals (temporary, will be replaced in later tasks)
{isBuilderOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-brand-surface rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Workout Builder</h3>
      <p className="text-slate-400 mb-4">Coming soon...</p>
      <button
        onClick={() => setIsBuilderOpen(false)}
        className="bg-brand-cyan text-brand-dark px-4 py-2 rounded-lg"
      >
        Close
      </button>
    </div>
  </div>
)}

{isTemplateSelectorOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-brand-surface rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Load Template</h3>
      <p className="text-slate-400 mb-4">Coming soon...</p>
      <button
        onClick={() => setIsTemplateSelectorOpen(false)}
        className="bg-brand-cyan text-brand-dark px-4 py-2 rounded-lg"
      >
        Close
      </button>
    </div>
  </div>
)}
```

Import FABMenu:
```typescript
// Add to imports (around line 10)
import FABMenu from './FABMenu';
```

**Verification:**
- Clicking FAB opens menu (not Quick Add directly)
- "Log Workout" opens existing Quick Add modal
- "Build Workout" and "Load Template" show placeholder modals
- Menu closes after selecting an option

---

### Phase 3: Template System

#### Task 3.1: Create TemplateCard Component
**File:** `components/TemplateCard.tsx` (new file)

```typescript
import React from 'react';
import { WorkoutTemplate } from '../types';
import { EXERCISE_LIBRARY } from '../constants';

interface TemplateCardProps {
  template: WorkoutTemplate;
  onLoad: (template: WorkoutTemplate) => void;
  onDelete: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onLoad, onDelete }) => {
  const exerciseCount = new Set(template.sets.map(s => s.exerciseId)).size;
  const setCount = template.sets.length;

  return (
    <div className="bg-brand-muted p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-lg">{template.name}</h4>
          <p className="text-sm text-slate-400">
            {template.category} • {template.variation}
          </p>
        </div>
        {template.isFavorite && <span className="text-xl">⭐</span>}
      </div>

      <div className="text-sm text-slate-300 mb-3">
        {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'} • {setCount} sets
      </div>

      <div className="text-xs text-slate-400 mb-3">
        Used {template.timesUsed} {template.timesUsed === 1 ? 'time' : 'times'}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onLoad(template)}
          className="flex-1 bg-brand-cyan text-brand-dark font-semibold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-colors"
        >
          Load
        </button>
        <button
          onClick={() => onDelete(template.id)}
          className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
```

**Verification:**
- Component renders template info correctly
- Load button triggers onLoad callback
- Delete button triggers onDelete callback

---

#### Task 3.2: Create TemplateSelector Component
**File:** `components/TemplateSelector.tsx` (new file)

```typescript
import React, { useState, useEffect } from 'react';
import { WorkoutTemplate } from '../types';
import { templatesAPI } from '../api';
import TemplateCard from './TemplateCard';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (template: WorkoutTemplate) => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onLoad,
  onToast,
}) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templatesAPI.getAll();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      onToast('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    const confirm = window.confirm('Delete this template?');
    if (!confirm) return;

    try {
      await templatesAPI.delete(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      onToast('Template deleted', 'success');
    } catch (error) {
      console.error('Failed to delete template:', error);
      onToast('Failed to delete template', 'error');
    }
  };

  const handleLoad = (template: WorkoutTemplate) => {
    onLoad(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">My Templates</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </header>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No templates yet. Create one from the Workout Builder!
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onLoad={handleLoad}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;
```

**Verification:**
- Modal opens/closes correctly
- Loads templates from API
- Delete confirmation works
- Loading template calls onLoad callback

---

#### Task 3.3: Add "My Templates" Button to Dashboard
**File:** `components/Dashboard.tsx`

Add button near "Plan Workout" / "Start Custom Workout" (around line 600):

```typescript
// Update grid to 3 columns
<section className="grid grid-cols-1 md:grid-cols-3 gap-3">
  <button
    onClick={() => setIsTemplateSelectorOpen(true)}
    className="w-full bg-brand-muted text-white font-bold py-4 px-4 rounded-lg text-lg hover:bg-brand-dark transition-colors min-h-[44px]"
  >
    📋 My Templates
  </button>
  <button
    onClick={() => setIsPlannerOpen(true)}
    className="w-full bg-brand-accent text-brand-dark font-bold py-4 px-4 rounded-lg text-lg hover:bg-brand-accent/90 transition-colors min-h-[44px]"
  >
    📊 Plan Workout
  </button>
  <button
    onClick={onStartWorkout}
    className="w-full bg-brand-cyan text-brand-dark font-bold py-4 px-4 rounded-lg text-lg hover:bg-cyan-400 transition-colors min-h-[44px]"
  >
    ➕ Start Custom Workout
  </button>
</section>
```

Replace placeholder TemplateSelector with real component:
```typescript
// Import at top
import TemplateSelector from './TemplateSelector';

// Replace placeholder (around line 720)
<TemplateSelector
  isOpen={isTemplateSelectorOpen}
  onClose={() => setIsTemplateSelectorOpen(false)}
  onLoad={(template) => {
    setIsTemplateSelectorOpen(false);
    setIsBuilderOpen(true);
    // TODO: Pass template to WorkoutBuilder
  }}
  onToast={handleToast}
/>
```

**Verification:**
- "My Templates" button visible on Dashboard
- Clicking opens TemplateSelector modal
- Can load/delete templates

---

### Phase 4: Workout Builder - Planning View

#### Task 4.1: Create SetConfigurator Component
**File:** `components/SetConfigurator.tsx` (new file)

```typescript
import React, { useState } from 'react';
import { Exercise } from '../types';
import ExercisePicker from './ExercisePicker';

interface SetConfiguratorProps {
  onAddSet: (config: {
    exercise: Exercise;
    weight: number;
    reps: number;
    restTimerSeconds: number;
  }) => void;
  defaultWeight?: number;
  defaultReps?: number;
  defaultRestTimer?: number;
}

const SetConfigurator: React.FC<SetConfiguratorProps> = ({
  onAddSet,
  defaultWeight = 0,
  defaultReps = 10,
  defaultRestTimer = 90,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);
  const [restTimer, setRestTimer] = useState(defaultRestTimer);

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowPicker(false);
  };

  const handleAdd = () => {
    if (!selectedExercise) return;
    onAddSet({ exercise: selectedExercise, weight, reps, restTimerSeconds: restTimer });
    // Reset for next set
    setSelectedExercise(null);
    setWeight(defaultWeight);
    setReps(defaultReps);
    setRestTimer(defaultRestTimer);
  };

  return (
    <div className="bg-brand-muted p-4 rounded-lg">
      <h4 className="font-semibold mb-3">Add Set</h4>

      {!selectedExercise ? (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full bg-brand-dark text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-surface transition-colors"
        >
          Select Exercise
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-brand-dark p-3 rounded-lg">
            <div className="font-semibold">{selectedExercise.name}</div>
            <div className="text-sm text-slate-400">{selectedExercise.category}</div>
            <button
              onClick={() => setSelectedExercise(null)}
              className="text-sm text-brand-cyan hover:underline mt-1"
            >
              Change exercise
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Weight Input */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Weight (lbs)</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setWeight(Math.max(0, weight - 5))}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  -5
                </button>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-brand-dark text-white px-3 py-2 rounded-lg text-center"
                />
                <button
                  onClick={() => setWeight(weight + 5)}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Reps Input */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Reps</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setReps(Math.max(1, reps - 1))}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  -1
                </button>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="w-full bg-brand-dark text-white px-3 py-2 rounded-lg text-center"
                />
                <button
                  onClick={() => setReps(reps + 1)}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Rest Timer Input */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Rest (sec)</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRestTimer(Math.max(15, restTimer - 15))}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  -15
                </button>
                <input
                  type="number"
                  value={restTimer}
                  onChange={(e) => setRestTimer(Number(e.target.value))}
                  className="w-full bg-brand-dark text-white px-3 py-2 rounded-lg text-center"
                />
                <button
                  onClick={() => setRestTimer(restTimer + 15)}
                  className="bg-brand-dark px-2 py-1 rounded text-sm"
                >
                  +15
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Add Set
          </button>
        </div>
      )}

      {/* Exercise Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-brand-surface rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <header className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Select Exercise</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </header>
            <ExercisePicker onSelect={handleExerciseSelect} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SetConfigurator;
```

**Verification:**
- Exercise picker opens/closes correctly
- Weight/reps/rest timer inputs work
- "Add Set" triggers onAddSet callback with correct data

---

#### Task 4.2: Create SetCard Component
**File:** `components/SetCard.tsx` (new file)

```typescript
import React from 'react';
import { BuilderSet } from '../types';

interface SetCardProps {
  set: BuilderSet;
  setNumber: number;
  onEdit: (set: BuilderSet) => void;
  onDelete: (setId: string) => void;
  onDuplicate: (set: BuilderSet) => void;
}

const SetCard: React.FC<SetCardProps> = ({
  set,
  setNumber,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  return (
    <div className="bg-brand-muted p-3 rounded-lg flex items-center gap-3">
      <div className="flex-1">
        <div className="font-semibold">{set.exerciseName}</div>
        <div className="text-sm text-slate-400">
          Set {setNumber}: {set.reps} reps @ {set.weight} lbs • {set.restTimerSeconds}s rest
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onDuplicate(set)}
          className="text-brand-cyan hover:text-cyan-400 text-xl"
          title="Duplicate set"
        >
          +
        </button>
        <button
          onClick={() => onEdit(set)}
          className="text-slate-400 hover:text-white text-xl"
          title="Edit set"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(set.id)}
          className="text-red-500 hover:text-red-400 text-xl"
          title="Delete set"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default SetCard;
```

**Verification:**
- SetCard renders set info correctly
- Buttons trigger callbacks

---

#### Task 4.2.5: Create SetEditModal Component
**File:** `components/SetEditModal.tsx` (new file)

```typescript
import React, { useState, useEffect } from 'react';
import { BuilderSet } from '../types';

interface SetEditModalProps {
  set: BuilderSet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSet: BuilderSet) => void;
}

const SetEditModal: React.FC<SetEditModalProps> = ({ set, isOpen, onClose, onSave }) => {
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [restTimer, setRestTimer] = useState(90);

  // Initialize form values when set changes
  useEffect(() => {
    if (set) {
      setWeight(set.weight);
      setReps(set.reps);
      setRestTimer(set.restTimerSeconds);
    }
  }, [set]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (!set) return;

    const updatedSet: BuilderSet = {
      ...set,
      weight,
      reps,
      restTimerSeconds: restTimer,
    };

    onSave(updatedSet);
    onClose();
  };

  if (!isOpen || !set) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Edit Set</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </header>

        <div className="mb-4">
          <div className="font-semibold mb-2">{set.exerciseName}</div>
        </div>

        <div className="space-y-4">
          {/* Weight Input */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Weight (lbs)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeight(Math.max(0, weight - 5))}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                -5
              </button>
              <button
                onClick={() => setWeight(Math.max(0, weight - 2.5))}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                -2.5
              </button>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="flex-1 bg-brand-muted text-white px-4 py-2 rounded text-center"
              />
              <button
                onClick={() => setWeight(weight + 2.5)}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                +2.5
              </button>
              <button
                onClick={() => setWeight(weight + 5)}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                +5
              </button>
            </div>
          </div>

          {/* Reps Input */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Reps</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReps(Math.max(1, reps - 1))}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                -1
              </button>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Math.max(1, Number(e.target.value)))}
                className="flex-1 bg-brand-muted text-white px-4 py-2 rounded text-center"
              />
              <button
                onClick={() => setReps(reps + 1)}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                +1
              </button>
            </div>
          </div>

          {/* Rest Timer Input */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Rest Time (seconds)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRestTimer(Math.max(15, restTimer - 15))}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                -15
              </button>
              <input
                type="number"
                value={restTimer}
                onChange={(e) => setRestTimer(Math.max(15, Number(e.target.value)))}
                className="flex-1 bg-brand-muted text-white px-4 py-2 rounded text-center"
              />
              <button
                onClick={() => setRestTimer(restTimer + 15)}
                className="bg-brand-muted px-3 py-2 rounded hover:bg-brand-dark"
              >
                +15
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-brand-muted text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetEditModal;
```

**Verification:**
- Modal opens with set's current values
- Weight/reps/rest timer inputs work
- Increment/decrement buttons work
- Save button updates the set
- Cancel/X button closes without saving
- Escape key closes modal

---

#### Task 4.3: Create WorkoutBuilder Component (Planning View)
**File:** `components/WorkoutBuilder.tsx` (new file)

```typescript
import React, { useState, useEffect } from 'react';
import { BuilderSet, BuilderWorkout, Exercise, MuscleStatesResponse, MuscleBaselines, WorkoutTemplate } from '../types';
import { muscleStatesAPI, muscleBaselinesAPI, builderAPI, templatesAPI } from '../api';
import { EXERCISE_LIBRARY } from '../constants';
import SetConfigurator from './SetConfigurator';
import SetCard from './SetCard';
import SetEditModal from './SetEditModal';

interface WorkoutBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  loadedTemplate?: WorkoutTemplate | null;
}

type BuilderMode = 'planning' | 'executing';

const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onToast,
  loadedTemplate = null,
}) => {
  const [mode, setMode] = useState<BuilderMode>('planning');
  const [workout, setWorkout] = useState<BuilderWorkout>({
    sets: [],
    currentSetIndex: 0,
    startTime: null,
    muscleStatesSnapshot: null,
  });
  const [muscleStates, setMuscleStates] = useState<MuscleStatesResponse>({});
  const [muscleBaselines, setMuscleBaselines] = useState<MuscleBaselines>({} as MuscleBaselines);
  const [loading, setLoading] = useState(true);

  // Load muscle states/baselines
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Load template if provided
  useEffect(() => {
    if (loadedTemplate) {
      loadTemplate(loadedTemplate);
    }
  }, [loadedTemplate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [states, baselines] = await Promise.all([
        muscleStatesAPI.get(),
        muscleBaselinesAPI.getAll(),
      ]);
      setMuscleStates(states);
      setMuscleBaselines(baselines);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      onToast('Failed to load muscle data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: WorkoutTemplate) => {
    const sets: BuilderSet[] = template.sets.map((tSet, idx) => {
      // Look up exercise name from EXERCISE_LIBRARY
      const exercise = EXERCISE_LIBRARY.find(e => e.id === tSet.exerciseId);
      const exerciseName = exercise?.name || tSet.exerciseId; // Fallback to ID if not found

      return {
        id: `${Date.now()}-${idx}`,
        exerciseId: tSet.exerciseId,
        exerciseName,
        weight: tSet.weight,
        reps: tSet.reps,
        restTimerSeconds: tSet.restTimerSeconds,
        orderIndex: tSet.orderIndex,
      };
    });
    setWorkout(prev => ({ ...prev, sets }));
    onToast(`Loaded template: ${template.name}`, 'success');
  };

  const handleAddSet = (config: {
    exercise: Exercise;
    weight: number;
    reps: number;
    restTimerSeconds: number;
  }) => {
    const newSet: BuilderSet = {
      id: `${Date.now()}-${Math.random()}`,
      exerciseId: config.exercise.id,
      exerciseName: config.exercise.name,
      weight: config.weight,
      reps: config.reps,
      restTimerSeconds: config.restTimerSeconds,
      orderIndex: workout.sets.length,
    };
    setWorkout(prev => ({
      ...prev,
      sets: [...prev.sets, newSet],
    }));
  };

  const handleDuplicateSet = (set: BuilderSet) => {
    const newSet: BuilderSet = {
      ...set,
      id: `${Date.now()}-${Math.random()}`,
      orderIndex: workout.sets.length,
    };
    setWorkout(prev => ({
      ...prev,
      sets: [...prev.sets, newSet],
    }));
    onToast('Set duplicated', 'info');
  };

  const handleDeleteSet = (setId: string) => {
    setWorkout(prev => ({
      ...prev,
      sets: prev.sets.filter(s => s.id !== setId),
    }));
    onToast('Set deleted', 'info');
  };

  const [editingSet, setEditingSet] = useState<BuilderSet | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSet = (set: BuilderSet) => {
    setEditingSet(set);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedSet = (updatedSet: BuilderSet) => {
    setWorkout(prev => ({
      ...prev,
      sets: prev.sets.map(s => s.id === updatedSet.id ? updatedSet : s),
    }));
    setIsEditModalOpen(false);
    setEditingSet(null);
    onToast('Set updated', 'success');
  };

  const handleStartWorkout = () => {
    if (workout.sets.length === 0) {
      onToast('Add at least one set to start', 'error');
      return;
    }
    setWorkout(prev => ({
      ...prev,
      startTime: Date.now(),
      muscleStatesSnapshot: muscleStates,
    }));
    setMode('executing');
    onToast('Workout started!', 'success');
  };

  const handleSaveTemplate = async () => {
    if (workout.sets.length === 0) {
      onToast('Add at least one set to save template', 'error');
      return;
    }

    const templateName = prompt('Template name:');
    if (!templateName) return;

    try {
      const templateSets = workout.sets.map(s => ({
        exerciseId: s.exerciseId,
        weight: s.weight,
        reps: s.reps,
        restTimerSeconds: s.restTimerSeconds,
        orderIndex: s.orderIndex,
      }));

      await templatesAPI.create({
        name: templateName,
        category: 'Push', // TODO: Auto-detect or ask user
        variation: 'A', // TODO: Auto-detect or ask user
        sets: templateSets,
        isFavorite: false,
      });

      onToast('Template saved!', 'success');
    } catch (error) {
      console.error('Failed to save template:', error);
      onToast('Failed to save template', 'error');
    }
  };

  const handleLogAsCompleted = async () => {
    if (workout.sets.length === 0) {
      onToast('Add at least one set to log', 'error');
      return;
    }

    setLoading(true);
    try {
      await builderAPI.saveBuilderWorkout({
        sets: workout.sets.map(s => ({
          exercise_name: s.exerciseName,
          weight: s.weight,
          reps: s.reps,
          rest_timer_seconds: s.restTimerSeconds,
        })),
        timestamp: new Date().toISOString(),
        was_executed: false,
      });

      onSuccess();
      onToast('Workout logged!', 'success');
      handleClose();
    } catch (error) {
      console.error('Failed to log workout:', error);
      onToast('Failed to log workout', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (workout.sets.length > 0) {
      const confirm = window.confirm('Discard workout?');
      if (!confirm) return;
    }
    setWorkout({
      sets: [],
      currentSetIndex: 0,
      startTime: null,
      muscleStatesSnapshot: null,
    });
    setMode('planning');
    onClose();
  };

  if (!isOpen) return null;

  if (mode === 'executing') {
    return <div>Execution view coming in next phase...</div>;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="bg-brand-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Build Workout</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-white text-2xl">
            ×
          </button>
        </header>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : (
          <>
            <SetConfigurator onAddSet={handleAddSet} />

            {workout.sets.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold mb-2">Planned Sets ({workout.sets.length})</h4>
                {workout.sets.map((set, idx) => (
                  <SetCard
                    key={set.id}
                    set={set}
                    setNumber={idx + 1}
                    onEdit={handleEditSet}
                    onDelete={handleDeleteSet}
                    onDuplicate={handleDuplicateSet}
                  />
                ))}
              </div>
            )}

            {/* TODO: Add MuscleVisualization here */}

            <div className="mt-6 space-y-2">
              <button
                onClick={handleStartWorkout}
                disabled={workout.sets.length === 0}
                className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                Start Workout
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSaveTemplate}
                  disabled={workout.sets.length === 0}
                  className="w-full bg-brand-muted text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  Save as Template
                </button>
                <button
                  onClick={handleLogAsCompleted}
                  disabled={workout.sets.length === 0 || loading}
                  className="w-full bg-brand-muted text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  Log as Completed
                </button>
              </div>
            </div>
          </>
        )}

        {/* Set Edit Modal */}
        <SetEditModal
          set={editingSet}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSet(null);
          }}
          onSave={handleSaveEditedSet}
        />
      </div>
    </div>
  );
};

export default WorkoutBuilder;
```

**Verification:**
- Can add sets using SetConfigurator
- Sets display in SetList with correct info
- Duplicate/delete/edit buttons work
- Save template prompts for name and saves via API
- Log as Completed saves workout and closes modal
- Start Workout switches to execution mode (placeholder)

---

#### Task 4.4: Connect WorkoutBuilder to Dashboard
**File:** `components/Dashboard.tsx`

Replace placeholder WorkoutBuilder with real component:

```typescript
// Import at top
import WorkoutBuilder from './WorkoutBuilder';

// Add state for loaded template
const [loadedTemplate, setLoadedTemplate] = useState<WorkoutTemplate | null>(null);

// Replace placeholder isBuilderOpen modal (around line 730)
<WorkoutBuilder
  isOpen={isBuilderOpen}
  onClose={() => {
    setIsBuilderOpen(false);
    setLoadedTemplate(null);
  }}
  onSuccess={() => {
    fetchDashboardData();
    setLoadedTemplate(null);
  }}
  onToast={handleToast}
  loadedTemplate={loadedTemplate}
/>

// Update TemplateSelector onLoad (around line 750)
<TemplateSelector
  isOpen={isTemplateSelectorOpen}
  onClose={() => setIsTemplateSelectorOpen(false)}
  onLoad={(template) => {
    setLoadedTemplate(template);
    setIsTemplateSelectorOpen(false);
    setIsBuilderOpen(true);
  }}
  onToast={handleToast}
/>
```

**Verification:**
- Loading template from TemplateSelector opens WorkoutBuilder with sets pre-filled
- Can build workout from scratch
- Can save template and log workout

---

### Phase 5: Workout Builder - Execution View

#### Task 5.1: Create CurrentSetDisplay Component
**File:** `components/CurrentSetDisplay.tsx` (new file)

```typescript
import React from 'react';
import { BuilderSet } from '../types';

interface CurrentSetDisplayProps {
  set: BuilderSet;
  setNumber: number;
  totalSets: number;
  restTimerEndTime: number | null;
  onComplete: () => void;
  onSkip: () => void;
}

const CurrentSetDisplay: React.FC<CurrentSetDisplayProps> = ({
  set,
  setNumber,
  totalSets,
  restTimerEndTime,
  onComplete,
  onSkip,
}) => {
  const [timeRemaining, setTimeRemaining] = React.useState(0);

  React.useEffect(() => {
    if (!restTimerEndTime) {
      setTimeRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((restTimerEndTime - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [restTimerEndTime]);

  const isResting = restTimerEndTime && timeRemaining > 0;

  return (
    <div className="bg-brand-muted p-6 rounded-lg">
      <div className="text-center mb-4">
        <div className="text-sm text-slate-400 mb-1">
          Set {setNumber} of {totalSets}
        </div>
        <h3 className="text-2xl font-bold mb-2">{set.exerciseName}</h3>
        <div className="text-lg text-slate-300">
          {set.reps} reps @ {set.weight} lbs
        </div>
      </div>

      {isResting ? (
        <div className="text-center">
          <div className="text-4xl font-bold text-brand-cyan mb-2">{timeRemaining}s</div>
          <div className="text-sm text-slate-400 mb-4">Rest time remaining</div>
          <div className="w-full bg-brand-dark rounded-full h-2 mb-4">
            <div
              className="bg-brand-cyan h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${((set.restTimerSeconds - timeRemaining) / set.restTimerSeconds) * 100}%`,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={onComplete}
            className="w-full bg-brand-cyan text-brand-dark font-bold py-4 px-4 rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Complete Set
          </button>
          <button
            onClick={onSkip}
            className="w-full bg-brand-muted text-slate-400 font-semibold py-3 px-4 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Skip Set
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrentSetDisplay;
```

**Verification:**
- Displays current set info correctly
- Rest timer counts down from restTimerSeconds
- Progress bar animates
- Complete/Skip buttons work

---

#### Task 5.2: Add Execution Mode to WorkoutBuilder
**File:** `components/WorkoutBuilder.tsx`

Update component to support execution mode:

```typescript
// Add to imports
import CurrentSetDisplay from './CurrentSetDisplay';

// Add state for rest timer
const [restTimerEndTime, setRestTimerEndTime] = useState<number | null>(null);
const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());

// Add state for timeout cleanup
const [autoAdvanceTimeoutId, setAutoAdvanceTimeoutId] = useState<number | null>(null);

// Cleanup timeout on unmount or when switching modes
useEffect(() => {
  return () => {
    if (autoAdvanceTimeoutId !== null) {
      clearTimeout(autoAdvanceTimeoutId);
    }
  };
}, [autoAdvanceTimeoutId]);

// Add function to handle set completion
const handleCompleteSet = () => {
  const currentSet = workout.sets[workout.currentSetIndex];
  if (!currentSet) return;

  // Clear any existing timeout
  if (autoAdvanceTimeoutId !== null) {
    clearTimeout(autoAdvanceTimeoutId);
  }

  // Mark set as completed
  setCompletedSets(prev => new Set(prev).add(currentSet.id));

  // Start rest timer
  setRestTimerEndTime(Date.now() + currentSet.restTimerSeconds * 1000);

  // Auto-advance to next set after rest timer
  const timeoutId = window.setTimeout(() => {
    setWorkout(prev => ({
      ...prev,
      currentSetIndex: prev.currentSetIndex + 1,
    }));
    setRestTimerEndTime(null);
    setAutoAdvanceTimeoutId(null);
  }, currentSet.restTimerSeconds * 1000);

  setAutoAdvanceTimeoutId(timeoutId);
};

// Add function to skip set
const handleSkipSet = () => {
  setWorkout(prev => ({
    ...prev,
    currentSetIndex: prev.currentSetIndex + 1,
  }));
  setRestTimerEndTime(null);
};

// Add function to finish workout
const handleFinishWorkout = async () => {
  if (completedSets.size === 0) {
    onToast('Complete at least one set to finish workout', 'error');
    return;
  }

  setLoading(true);
  try {
    // Only save completed sets
    const completedSetsData = workout.sets
      .filter(s => completedSets.has(s.id))
      .map(s => ({
        exercise_name: s.exerciseName,
        weight: s.weight,
        reps: s.reps,
        rest_timer_seconds: s.restTimerSeconds,
      }));

    await builderAPI.saveBuilderWorkout({
      sets: completedSetsData,
      timestamp: new Date(workout.startTime!).toISOString(),
      was_executed: true,
    });

    onSuccess();
    onToast(`Workout saved! ${completedSets.size} sets completed.`, 'success');
    handleClose();
  } catch (error) {
    console.error('Failed to save workout:', error);
    onToast('Failed to save workout', 'error');
  } finally {
    setLoading(false);
  }
};

// Update return statement to include execution view
if (mode === 'executing') {
  const currentSet = workout.sets[workout.currentSetIndex];
  const isFinished = workout.currentSetIndex >= workout.sets.length;

  if (isFinished) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div className="bg-brand-surface rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4 text-center">Workout Complete!</h3>
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-slate-300">
              {completedSets.size} of {workout.sets.length} sets completed
            </p>
          </div>
          <button
            onClick={handleFinishWorkout}
            disabled={loading}
            className="w-full bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Finish Workout'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-brand-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Workout in Progress</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-white text-2xl">
            ×
          </button>
        </header>

        <CurrentSetDisplay
          set={currentSet}
          setNumber={workout.currentSetIndex + 1}
          totalSets={workout.sets.length}
          restTimerEndTime={restTimerEndTime}
          onComplete={handleCompleteSet}
          onSkip={handleSkipSet}
        />

        {/* TODO: Add MuscleVisualization here */}

        <div className="mt-4 flex justify-between items-center text-sm text-slate-400">
          <span>Completed: {completedSets.size} / {workout.sets.length}</span>
          <button
            onClick={() => setMode('planning')}
            className="text-brand-cyan hover:underline"
          >
            Edit Plan
          </button>
        </div>

        <button
          onClick={handleFinishWorkout}
          disabled={completedSets.size === 0 || loading}
          className="w-full mt-4 bg-brand-cyan text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
        >
          Finish Workout Early
        </button>
      </div>
    </div>
  );
}
```

**Verification:**
- Clicking "Start Workout" enters execution mode
- Current set displays correctly
- Complete Set starts rest timer and auto-advances
- Skip Set advances without rest
- Finish Workout saves only completed sets
- Edit Plan switches back to planning mode

---

### Phase 6: Muscle Visualization Integration

#### Task 6.1: Extract MuscleVisualization Component
**File:** `components/MuscleVisualization.tsx` (new file)

Extract from Dashboard or reuse existing component:

```typescript
import React from 'react';
import { Muscle, MuscleStatesResponse, MuscleBaselines } from '../types';

interface MuscleVisualizationProps {
  muscleStates: MuscleStatesResponse;
  muscleBaselines: MuscleBaselines;
}

const MuscleVisualization: React.FC<MuscleVisualizationProps> = ({
  muscleStates,
  muscleBaselines,
}) => {
  // TODO: Reuse visualization logic from Dashboard or MuscleDeepDiveModal
  return (
    <div className="bg-brand-muted p-4 rounded-lg">
      <h4 className="font-semibold mb-3">Muscle Fatigue</h4>
      {Object.entries(muscleStates).map(([muscleName, state]) => {
        const baseline = muscleBaselines[muscleName as Muscle];
        const effectiveMax = baseline?.userOverride || baseline?.systemLearnedMax || 1000;
        const fatiguePercent = state.currentFatiguePercent || 0;

        return (
          <div key={muscleName} className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>{muscleName}</span>
              <span className="text-slate-400">{Math.round(fatiguePercent)}%</span>
            </div>
            <div className="w-full bg-brand-dark rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  fatiguePercent > 80 ? 'bg-red-500' :
                  fatiguePercent > 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, fatiguePercent)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MuscleVisualization;
```

**Verification:**
- Component displays muscle fatigue bars
- Colors change based on fatigue level
- Updates when muscleStates prop changes

---

#### Task 6.2: Add MuscleVisualization to WorkoutBuilder Planning View
**File:** `components/WorkoutBuilder.tsx`

```typescript
// Add to imports
import MuscleVisualization from './MuscleVisualization';

// Add muscle fatigue calculation function
const calculateForecastedMuscleStates = (): MuscleStatesResponse => {
  // Start with current states
  const forecasted = { ...muscleStates };

  // Calculate volume per muscle from planned sets
  const muscleVolumes: Record<string, number> = {};

  for (const set of workout.sets) {
    const exercise = EXERCISE_LIBRARY.find(e => e.id === set.exerciseId);
    if (!exercise) continue;

    const setVolume = set.weight * set.reps;
    for (const engagement of exercise.muscleEngagements) {
      const muscleName = engagement.muscle;
      const volume = setVolume * (engagement.percentage / 100);
      muscleVolumes[muscleName] = (muscleVolumes[muscleName] || 0) + volume;
    }
  }

  // Add forecasted fatigue to current states
  for (const [muscleName, volume] of Object.entries(muscleVolumes)) {
    const baseline = muscleBaselines[muscleName as Muscle];
    const effectiveMax = baseline?.userOverride || baseline?.systemLearnedMax || 1000;
    const fatigueIncrease = (volume / effectiveMax) * 100;

    forecasted[muscleName] = {
      ...forecasted[muscleName],
      currentFatiguePercent: (forecasted[muscleName]?.currentFatiguePercent || 0) + fatigueIncrease,
    };
  }

  return forecasted;
};

// Add to planning view (after SetList, before action buttons)
{workout.sets.length > 0 && (
  <div className="mt-4">
    <h4 className="font-semibold mb-2">Forecasted Muscle Fatigue</h4>
    <MuscleVisualization
      muscleStates={calculateForecastedMuscleStates()}
      muscleBaselines={muscleBaselines}
    />
  </div>
)}
```

**Verification:**
- Muscle visualization shows forecasted fatigue in planning mode
- Fatigue updates when sets are added/removed
- Correctly calculates volume per muscle based on engagements

---

#### Task 6.3: Add Real-Time MuscleVisualization to Execution View
**File:** `components/WorkoutBuilder.tsx`

```typescript
// Add state for real-time muscle states during execution
const [executionMuscleStates, setExecutionMuscleStates] = useState<MuscleStatesResponse>({});

// Initialize execution muscle states when starting workout
const handleStartWorkout = () => {
  // ... existing code ...
  setExecutionMuscleStates(muscleStates); // Start with current states
  setMode('executing');
};

// Update muscle states when set is completed
const handleCompleteSet = () => {
  const currentSet = workout.sets[workout.currentSetIndex];
  if (!currentSet) return;

  // Calculate volume and update muscle states
  const exercise = EXERCISE_LIBRARY.find(e => e.id === currentSet.exerciseId);
  if (exercise) {
    const setVolume = currentSet.weight * currentSet.reps;
    const updatedStates = { ...executionMuscleStates };

    for (const engagement of exercise.muscleEngagements) {
      const muscleName = engagement.muscle;
      const volume = setVolume * (engagement.percentage / 100);
      const baseline = muscleBaselines[muscleName];
      const effectiveMax = baseline?.userOverride || baseline?.systemLearnedMax || 1000;
      const fatigueIncrease = (volume / effectiveMax) * 100;

      updatedStates[muscleName] = {
        ...updatedStates[muscleName],
        currentFatiguePercent: (updatedStates[muscleName]?.currentFatiguePercent || 0) + fatigueIncrease,
      };
    }

    setExecutionMuscleStates(updatedStates);
  }

  // ... rest of existing code ...
};

// Add MuscleVisualization to execution view (after CurrentSetDisplay)
// Shows BOTH current fatigue AND forecasted end state (Decision 2: Option B)
<div className="mt-4">
  <h4 className="font-semibold mb-2">Muscle Fatigue</h4>

  {/* Current Progress */}
  <div className="mb-4">
    <div className="text-sm text-slate-400 mb-2">Current Progress</div>
    <MuscleVisualization
      muscleStates={executionMuscleStates}
      muscleBaselines={muscleBaselines}
    />
  </div>

  {/* Forecasted End State */}
  <div>
    <div className="text-sm text-slate-400 mb-2">Forecasted End State</div>
    <MuscleVisualization
      muscleStates={calculateForecastedMuscleStates()} // Same function from planning view
      muscleBaselines={muscleBaselines}
      opacity={0.6} // Lighter to distinguish from current
    />
  </div>
</div>
```

**Note:** You'll need to update `MuscleVisualization` component to accept optional `opacity` prop:
```typescript
interface MuscleVisualizationProps {
  muscleStates: MuscleStatesResponse;
  muscleBaselines: MuscleBaselines;
  opacity?: number; // Default 1.0
}
```

**Verification:**
- Muscle visualization shows in execution mode
- BOTH current and forecasted states are visible
- Current updates in real-time as sets are completed
- Forecast shows where you'll end up after all remaining sets
- Visual distinction between current (full opacity) and forecast (lighter)
- Skipped sets don't update current fatigue but forecast accounts for remaining sets

---

### Phase 7: Testing & Polish

#### Task 7.1: End-to-End Testing - Build & Execute Workflow

Test complete workflow:

1. **Open FAB Menu:**
   - Click FAB button
   - Menu opens with 3 options

2. **Build Workout:**
   - Click "Build Workout"
   - Add 3 sets: Push-ups (2 sets), Dips (1 set)
   - Verify muscle visualization shows forecasted fatigue
   - Verify set list shows all 3 sets

3. **Save Template:**
   - Click "Save as Template"
   - Name: "Test Template"
   - Verify toast confirmation

4. **Load Template:**
   - Close builder
   - Open FAB → "Load Template"
   - Select "Test Template"
   - Verify sets are pre-loaded

5. **Execute Workout:**
   - Click "Start Workout"
   - Complete first set
   - Verify rest timer counts down
   - Verify auto-advance to next set
   - Verify muscle visualization updates
   - Complete all sets
   - Click "Finish Workout"
   - Verify workout saves successfully

6. **Log as Completed:**
   - Build another workout
   - Click "Log as Completed"
   - Verify workout saves without execution

**Verification Steps:**
- All transitions work smoothly
- No console errors
- Data persists correctly
- Toast messages appear appropriately

---

#### Task 7.2: Edge Case Testing

Test edge cases:

1. **Empty Workout:**
   - Try to start workout with no sets → Should show error
   - Try to save template with no sets → Should show error

2. **Mid-Workout Close:**
   - Start workout, complete 1 set
   - Click X to close → Should confirm discard
   - Click "Edit Plan" → Should allow modifications

3. **Skip All Sets:**
   - Start workout
   - Skip all sets
   - Try to finish → Should show error (no completed sets)

4. **Template with Non-Existent Exercise:**
   - Manually create template with invalid exerciseId (via API)
   - Load template → Should handle gracefully

5. **Network Errors:**
   - Disconnect network
   - Try to save workout → Should show error toast
   - Try to load templates → Should show error toast

**Verification:**
- All edge cases handled gracefully
- User feedback is clear
- No crashes or undefined errors

---

#### Task 7.3: Performance Testing

Test with large workouts:

1. **Large Workout (50+ sets):**
   - Build workout with 50 sets
   - Verify UI remains responsive
   - Verify muscle calculation doesn't lag
   - Execute workout → verify smooth scrolling

2. **Many Templates (20+):**
   - Create 20 templates
   - Load template selector → verify quick load
   - Search/filter works smoothly

**Verification:**
- No noticeable lag or freezing
- Smooth animations
- Quick API responses

---

#### Task 7.4: UI Polish

Final UI improvements:

1. **Animations:**
   - Add fade-in for modals
   - Add slide-up for FAB menu
   - Add progress bar animation for rest timer

2. **Loading States:**
   - Add spinners for API calls
   - Disable buttons during loading
   - Show skeleton screens where appropriate

3. **Error States:**
   - Clear error messages
   - Retry buttons for failed API calls
   - Empty states for no templates/sets

4. **Accessibility:**
   - Keyboard navigation (Tab, Enter, Escape)
   - ARIA labels for buttons
   - Focus management in modals

5. **Mobile Responsiveness:**
   - Test on small screens
   - Ensure touch targets are 44x44px minimum
   - Verify scrolling works on mobile

**Verification:**
- All animations smooth (60fps)
- Loading states appear for >200ms operations
- Keyboard navigation works
- Mobile experience is good

---

## Summary of Files to Create/Modify

### New Files:
1. `components/FABMenu.tsx`
2. `components/TemplateCard.tsx`
3. `components/TemplateSelector.tsx`
4. `components/SetConfigurator.tsx`
5. `components/SetCard.tsx`
6. `components/WorkoutBuilder.tsx`
7. `components/CurrentSetDisplay.tsx`
8. `components/MuscleVisualization.tsx`
9. `backend/src/routes/builder-workout.ts` (or add to existing workouts.ts)
10. `backend/src/db/migrations/xxx_update_templates.sql`

### Modified Files:
1. `types.ts` - Add BuilderSet, BuilderWorkout, TemplateSet, BuilderWorkoutRequest
2. `api.ts` - Add builderAPI
3. `components/Dashboard.tsx` - Update FAB button, add menu/modals
4. `backend/src/routes/workouts.ts` - Add /builder-workout endpoint
5. `backend/src/routes/templates.ts` - Update to use sets instead of exerciseIds

### Total Estimated Implementation Time:
- **Phase 1 (Foundation):** 4-6 hours
- **Phase 2 (FAB Menu):** 2-3 hours
- **Phase 3 (Templates):** 3-4 hours
- **Phase 4 (Planning View):** 5-7 hours
- **Phase 5 (Execution View):** 4-5 hours
- **Phase 6 (Muscle Viz):** 3-4 hours
- **Phase 7 (Testing/Polish):** 4-6 hours

**Total: 25-35 hours** of focused development time.

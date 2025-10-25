# Design: Template-Based Workout Selection

**Change ID:** `enable-template-based-workouts`

---

## 🏗️ Architectural Overview

The template-based workout feature integrates at three layers:

1. **Presentation Layer:** New UI components for template browsing and dashboard shortcuts
2. **Data Layer:** Existing templates API, exercise library, and workout session flow
3. **State Management:** React hooks to manage template selection and pre-population

---

## 📂 Component Architecture

### New Components

#### 1. `DashboardQuickStart.tsx`
- **Purpose:** Display 4 quick-start template cards on dashboard
- **Props:**
  - `templates: WorkoutTemplate[]`
  - `onSelectTemplate: (template: WorkoutTemplate) => void`
- **Behavior:**
  - Show favorite templates first
  - Show most-used templates second
  - Sort by category alphabetically if tied
  - Click card initiates workout with that template
- **Size:** ~150 lines

#### 2. `TemplatesBrowser.tsx` (Refactored)
- **Purpose:** Dedicated templates browsing page with split-view
- **Props:**
  - `onSelectTemplate: (template: WorkoutTemplate) => void`
  - `onBack: () => void`
- **Features:**
  - Left panel: Grouped template list by category
  - Right panel: Selected template details
  - "Start Workout" button to initiate
- **Current State:** Component exists but lacks these features
- **Size:** ~300 lines (refactor existing)

#### 3. `WorkoutSetupFromTemplate.tsx` (or enhance `Workout.tsx`)
- **Purpose:** Pre-populate Workout setup with template exercises
- **Props:**
  - `template: WorkoutTemplate`
  - `onCancel: () => void`
  - `onStart: (session: WorkoutSession) => void`
- **Key Feature:** Render exercise rows with pre-filled weight/reps/sets
- **Size:** Enhancement to existing Workout component (~100 lines added)

### Modified Components

#### `Dashboard.tsx`
- **Changes:**
  - Add "Quick Start Workouts" section above muscle cards
  - Integrate `DashboardQuickStart` component
  - Add "Templates" navigation link

#### `Workout.tsx`
- **Changes:**
  - Accept optional `template` prop in `initialData`
  - Pre-populate exercises when template provided
  - Allow exercise list editing (add/remove/change)
  - Display weight/reps/sets with sensible defaults from template

#### `App.tsx`
- **Changes:**
  - Add "templates" view to View type
  - Route Templates link to dedicated templates page
  - Pass template selection down to Workout component
  - Create flow: Template select → Workout setup (with template)

#### `types.ts`
- **Changes:**
  - Extend `RecommendedWorkoutData` to accept `sourceTemplate: WorkoutTemplate`
  - Add `defaultWeight?: number` and `defaultReps?: number` to exercise config (optional)

---

## 🔄 Data Flow

### Flow 1: Dashboard Quick Start
```
Dashboard
  ↓ user clicks template card
DashboardQuickStart.onSelectTemplate()
  ↓
App.setRecommendedWorkout({ sourceTemplate })
App.setView("workout")
  ↓
Workout component receives initialData with template
  ↓
Workout.useEffect() pre-populates exercises from template
  ↓
Workout.setLoggedExercises([...template exercises])
  ↓
User sees setup screen with exercises pre-filled
```

### Flow 2: Templates Page Browse & Select
```
Templates page
  ↓ user clicks template in list
TemplatesBrowser.onSelectTemplate()
  ↓ right panel updates to show details
TemplatesBrowser ["Start Workout" button click]
  ↓
App.setRecommendedWorkout({ sourceTemplate })
App.setView("workout")
  ↓
Workout component receives initialData with template
  ↓ (same as Flow 1 from here)
```

### Flow 3: Customize Template
```
Workout setup (with template pre-filled)
  ↓ user clicks "Add Exercise"
ExerciseSelector opens
  ↓ user picks exercise and adds
Workout.setLoggedExercises([...exercises, newExercise])
  ↓ new row appears in setup
User configures weight/reps/sets for new exercise
  ↓ user can also remove template exercises
Workout.setLoggedExercises filtered list
  ↓ user clicks "Start Workout"
Workout begins with customized exercise list
```

---

## 💾 State Management Pattern

### Template Selection State (App Level)
```typescript
const [recommendedWorkout, setRecommendedWorkout] = useState<RecommendedWorkoutData | null>(null);
// Extended to include: sourceTemplate?: WorkoutTemplate
```

### Workout Customization State (Workout Component)
```typescript
const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
// Pre-populated from template.exerciseIds
// User can add/remove/modify via UI
```

### Exercise Configuration State
```typescript
// Each LoggedExercise includes default set configuration:
interface LoggedExercise {
  id: string;
  exerciseId: string;
  sets: LoggedSet[]; // Pre-filled from template if available
}

interface LoggedSet {
  id: string;
  reps: number; // Default from template or sensible default (8)
  weight: number; // Default from template or sensible default (100)
  bodyweightAtTime?: number;
}
```

---

## 🎯 Pre-Population Strategy

When a template is selected, exercises are pre-populated with sensible defaults:

### Exercise Row Data
```typescript
// From template:
template.exerciseIds = ['ex02', 'ex30', 'ex38', ...]

// Create LoggedExercises:
loggedExercises = [
  {
    id: 'ex02-timestamp',
    exerciseId: 'ex02', // Dumbbell Bench
    sets: [
      { id: 'set-1', reps: 8, weight: 50 }, // User's last weight, or sensible default
      { id: 'set-2', reps: 8, weight: 50 },
      { id: 'set-3', reps: 8, weight: 50 },
    ]
  },
  // ... etc for each exercise
]
```

### Default Weight Logic
Priority order:
1. User's last session weight for that exercise (if exists)
2. User's personal best weight for that exercise (if exists)
3. Sensible default based on exercise difficulty and equipment (100 lbs)

### Default Reps Logic
Priority order:
1. Sensible default: 8 reps
2. Can be customized per exercise (future enhancement)

### Default Sets Logic
Always: 3 sets (can be modified by user)

---

## 🔌 API Integration

### No New API Endpoints Needed
- `/api/templates` - ✅ Already exists (returns all templates)
- `/api/exercises` - ✅ Already exists in EXERCISE_LIBRARY constant
- `/api/personal-bests` - ✅ Already exists (fetch user's last weights)
- `/api/workouts` - ✅ Already exists (save completed workout)

### Existing API Usage
```typescript
// Load templates on Dashboard/App mount
const templates = await templatesAPI.getAll();

// Get exercise info
const exercise = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);

// Get user's last weight for an exercise (from personalBests)
const lastWeight = personalBests[exerciseId]?.bestSingleSet || 100;

// Save completed workout (no changes needed)
await workoutsAPI.create(workoutSession);
```

---

## 🎨 UI/UX Decisions

### Decision 1: Split-View vs Modal
**Chosen:** Split-view on dedicated page
**Rationale:**
- Desktop UX is cleaner and more discoverable
- Mobile: responsive design with stacked layout
- Users can browse multiple templates quickly

### Decision 2: Pre-Populate vs Show Preview
**Chosen:** Pre-populate directly in setup screen
**Rationale:**
- Faster path to starting a workout
- Users can edit before starting
- Matches goal of "reduce friction"
- Preview would add an extra step

### Decision 3: 4 Quick Start Cards or Fewer
**Chosen:** 4 cards
**Rationale:**
- Common use case: Push A/B, Pull A/B, Legs A/B, Core A/B
- Can show all major body parts
- Fits on mobile screen without excessive scrolling
- View All link takes users to dedicated page

### Decision 4: Template Sorting
**Dashboard Quick Start:**
- Sort by: `isFavorite` (descending), then `timesUsed` (descending), then `name` (ascending)
- Take first 4

**Templates Page:**
- Group by: `category` (Push, Pull, Legs, Core)
- Sort within category: `isFavorite` (descending), then `variation` (A → B)

### Decision 5: Modifying Exercises Before Starting
**Chosen:** Allow full customization (add/remove/modify)
**Rationale:**
- Matches user workflow (templates are suggestions, not rigid)
- Users may not have all equipment
- Users may want to substitute exercises
- Users learn over time which exercises work best for them

---

## 🔄 Edge Cases & Handling

### Edge Case 1: User has no Personal Bests yet
- **Handling:** Use sensible defaults (100 lbs, 8 reps, 3 sets)
- **UI:** No warning needed, just use defaults

### Edge Case 2: User adds exercise that's not in template
- **Handling:** New row appears with default weight/reps/sets
- **Behavior:** User can configure like any other exercise
- **UI:** Visual indicator (subtle) that exercise is "added to template"

### Edge Case 3: User removes all template exercises
- **Handling:** Allowed, user can add their own
- **UI:** "Start Workout" button remains active
- **Warning:** None (user is in control)

### Edge Case 4: Template has exercise user doesn't have equipment for
- **Handling:** User can remove it or substitute
- **UI:** Show equipment tags on template card, user can see before starting

### Edge Case 5: User modifies template but doesn't save custom template
- **Handling:** Changes lost when workout ends (current scope, no saved custom templates)
- **UI:** No "Save as Template" for now (future feature)
- **User Aware:** Clear that customizations are one-time only

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] DashboardQuickStart renders correct 4 templates
- [ ] Template sorting logic (favorites first, then timesUsed)
- [ ] Exercise pre-population from template.exerciseIds
- [ ] Default weight/reps calculation
- [ ] Add/remove exercise from list

### Integration Tests
- [ ] Click template card on dashboard → Workout setup loads
- [ ] Click template on Templates page → Setup loads
- [ ] Add exercise during setup → New row appears
- [ ] Remove exercise during setup → Row disappears
- [ ] Modify weight/reps → Values update
- [ ] Start workout → Session created with correct exercises

### Manual Tests
- [ ] Desktop: Dashboard quick start cards display correctly
- [ ] Mobile: Quick start cards responsive
- [ ] Desktop: Templates page split-view renders
- [ ] Mobile: Templates page stacked layout
- [ ] Click "Start Workout" from template → Setup screen appears
- [ ] Customize exercises before starting
- [ ] Complete workout with customized exercises

---

## 📊 Performance Considerations

- **Templates Load:** Already cached from initial app load (~8 templates, negligible)
- **Exercise Library:** Already in-memory (48 exercises, ~5KB)
- **Personal Bests:** Already fetched on app load
- **No Performance Impact:** No new API calls needed during template selection

---

## 🔐 Security & Validation

- **No new security concerns:** Templates are read-only from user perspective
- **Input validation:** Exercise selection already validated
- **Data integrity:** No new data being created/modified in templates
- **User data:** Only personalBests modified (existing workflow)

---

## 📋 Implementation Phases

### Phase 1: Core Template Integration (Week 1)
- Enhance Workout component to accept template data
- Pre-populate exercises from template
- Allow add/remove exercises

### Phase 2: Dashboard Quick Start (Week 1)
- Create DashboardQuickStart component
- Wire up dashboard shortcuts
- Test on mobile/desktop

### Phase 3: Dedicated Templates Page (Week 2)
- Refactor existing TemplatesBrowser component
- Implement split-view UI
- Wire up template selection flow

### Phase 4: Polish & Testing (Week 2)
- Responsive design fixes
- Edge case handling
- Manual testing across devices

---

## 🚀 Success Criteria

- ✅ Users can select template and start workout in < 5 seconds
- ✅ All 8 templates accessible from both dashboard and dedicated page
- ✅ Customization works seamlessly (add/remove/modify exercises)
- ✅ No regressions in existing workout flow
- ✅ Mobile responsive
- ✅ Desktop optimized for split-view
- ✅ TypeScript strict mode maintained

---

**Next Step:** Create detailed task list in `tasks.md`

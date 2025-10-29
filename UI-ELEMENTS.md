# FitForge UI Elements & Navigation Documentation

**Document Version:** 1.0
**Last Updated:** 2025-10-29
**Purpose:** Comprehensive inventory of all UI components, interactive elements, navigation flows, and known issues

---

## Table of Contents

1. [Application Structure](#application-structure)
2. [All Pages & Screens](#all-pages--screens)
3. [Navigation Map](#navigation-map)
4. [Interactive Elements by Component](#interactive-elements-by-component)
5. [Modal System](#modal-system)
6. [Known Issues & Incomplete Features](#known-issues--incomplete-features)
7. [API Integration Reference](#api-integration-reference)
8. [Navigation Issues & Dead Ends](#navigation-issues--dead-ends)
9. [Recommendations](#recommendations)

---

## Application Structure

FitForge is a React-based single-page application (SPA) with the following architecture:

- **Routing**: React Router v6
- **State Management**: React hooks + localStorage
- **API Communication**: Fetch API with typed interfaces
- **Component Structure**: Functional components with TypeScript
- **Styling**: Tailwind CSS

### Main Entry Points

- **`src/App.tsx`** - Main application component with routing
- **`src/main.tsx`** - Application bootstrap
- **`src/api.ts`** - Centralized API client

---

## All Pages & Screens

### 1. Dashboard (`/`)

**Location:** `src/components/Dashboard.tsx`
**Purpose:** Home page showing muscle status, workout recommendations, and quick actions

**Key Features:**
- Muscle fatigue heat map (13 visualization muscles)
- Exercise recommendations by category
- Recent workout summary
- Quick action buttons (Start Workout, Plan Workout, My Templates)
- Floating Action Button (FAB) menu

**Navigation:**
- To: Analytics (`/analytics`)
- To: Personal Bests (`/bests`)
- To: Muscle Baselines (`/muscle-baselines`)
- To: Profile (`/profile`)
- To: Workout Tracker (`/workout`)

---

### 2. Workout Tracker (`/workout`)

**Location:** `src/components/Workout.tsx`
**Purpose:** Active workout tracking with exercise logging

**Key Features:**
- Real-time workout timer
- Exercise selection with multi-filter system
- Set logging with weight/reps/failure tracking
- Progressive overload suggestions
- Rest timer between sets
- Muscle fatigue forecasting

**Entry Points:**
- Dashboard "Start Custom Workout" button
- Dashboard recommended workouts
- Workout Builder → Start Workout
- Workout Planner → Start Workout
- Template Selector → Workout Builder → Start Workout

**Exit Points:**
- Cancel button → Dashboard (`/`)
- Finish Workout → Workout Summary Modal → Dashboard (`/`)

---

### 3. Profile (`/profile`)

**Location:** `src/components/Profile.tsx`
**Purpose:** User profile management and settings

**Key Features:**
- Name and experience level editing
- Equipment inventory management
- Bodyweight history (future feature)
- Muscle baseline quick access

**Navigation:**
- Back button → Dashboard (`/`)

---

### 4. Personal Records (`/bests`)

**Location:** `src/components/PersonalBests.tsx`
**Purpose:** View personal best records

**Key Features:**
- Exercise PR display (best single set, best session volume)
- Category filtering (Push/Pull/Legs/Core/All)
- Empty state for new users

**Navigation:**
- Back button → Dashboard (`/`)

**Known Issues:**
- No edit/delete functionality (read-only)

---

### 5. Workout Templates (`/templates`)

**Location:** `src/components/WorkoutTemplates.tsx`
**Purpose:** Browse and load saved workout templates

**Key Features:**
- Template cards with exercise preview
- Expandable details
- Load template into workout

**Navigation:**
- Back button → Dashboard (`/`)
- Template selection → Workout Tracker (`/workout`)

---

### 6. Analytics (`/analytics`)

**Location:** `src/components/Analytics.tsx`
**Purpose:** View workout analytics and charts

**Key Features:**
- Time range filtering (30/60/90 days)
- Exercise progression charts
- Muscle capacity trends
- Volume trends by category
- PR timeline
- Consistency metrics (streaks, frequency)

**Navigation:**
- **⚠️ ISSUE:** Missing back button to Dashboard
- Workaround: Click Analytics icon again or use browser back

---

### 7. Muscle Baselines (`/muscle-baselines`)

**Location:** `src/components/MuscleBaselinesPage.tsx`
**Purpose:** Configure muscle capacity baselines

**Key Features:**
- View system-learned baselines
- Set user overrides
- Clear overrides to revert to learned values
- Info banner with instructions

**Navigation:**
- Back button → Dashboard (`/`)

---

### 8. Profile Wizard (Onboarding)

**Location:** `src/components/onboarding/ProfileWizard.tsx`
**Purpose:** First-time user setup

**Key Features:**
- 3-step wizard: Name → Experience → Equipment
- Progress indicator
- Input validation
- Initializes user profile and muscle states

**Navigation:**
- Cannot exit until completion (by design)
- On completion → Dashboard (`/`)

---

## Navigation Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      PROFILE WIZARD                             │
│                   (First-time users only)                       │
│                                                                 │
│   Step 1: Name → Step 2: Experience → Step 3: Equipment       │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD (/)                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Header Icons (always visible)                           │  │
│  │  • Analytics → /analytics                                │  │
│  │  • Personal Bests → /bests                               │  │
│  │  • Muscle Baselines → /muscle-baselines                  │  │
│  │  • Profile → /profile                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Quick Actions                                           │  │
│  │  • Start Custom Workout → /workout                       │  │
│  │  • Plan Workout → Opens Planner Modal                    │  │
│  │  • My Templates → Opens Template Selector Modal          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FAB Menu (Floating Action Button)                       │  │
│  │  • Log Workout → Quick Add Modal                         │  │
│  │  • Build Workout → Workout Builder Modal                 │  │
│  │  • Load Template → Template Selector Modal               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Muscle Heat Map                                         │  │
│  │  • Click muscle → Muscle Deep Dive Modal                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │            │             │              │
           │            │             │              │
           ▼            ▼             ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │Analytics │  │  Bests   │  │ Baselines│  │ Profile  │
    │/analytics│  │  /bests  │  │/muscle-  │  │/profile  │
    │          │  │          │  │baselines │  │          │
    │⚠️ No Back│  │          │  │          │  │          │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘
                       │              │              │
                       └──────┬───────┴──────────────┘
                              │
                              ▼
                         Back to /
```

### Modal Navigation Flow

```
Dashboard
   │
   ├─→ [Quick Add Modal]
   │      └─→ Exercise Picker → Set Entry → Submit → Back to Dashboard
   │
   ├─→ [Workout Planner Modal]
   │      └─→ Add Exercises → Configure Sets → Start Workout → /workout
   │
   ├─→ [Workout Builder Modal]
   │      ├─→ Planning Mode: Add Sets → Save Template
   │      └─→ Execution Mode: Timer-based workout → /workout
   │
   ├─→ [Template Selector Modal]
   │      └─→ Select Template → Workout Builder → /workout
   │
   └─→ [Muscle Deep Dive Modal]
          └─→ View Exercises (read-only, cannot add to workout)
```

---

## Interactive Elements by Component

### Dashboard (`Dashboard.tsx`)

| Element | Type | Handler | Action | API Call |
|---------|------|---------|--------|----------|
| Analytics icon | Button | `onNavigateToAnalytics()` | Navigate to `/analytics` | None |
| Personal Bests icon | Button | `onNavigateToBests()` | Navigate to `/bests` | None |
| Muscle Baselines icon | Button | `onNavigateToMuscleBaselines()` | Navigate to `/muscle-baselines` | None |
| Profile icon | Button | `onNavigateToProfile()` | Navigate to `/profile` | None |
| "My Templates" button | Button | Opens TemplateSelector | Show template modal | `GET /api/templates` |
| "Plan Workout" button | Button | Opens WorkoutPlanner | Show planner modal | `GET /api/muscle-states` |
| "Start Custom Workout" | Button | `onStartWorkout()` | Navigate to `/workout` | None |
| Recommended workout card | Button | `onStart()` | Navigate to `/workout` with data | None |
| Muscle card (heat map) | Button | `handleMuscleClick()` | Opens Muscle Deep Dive Modal | None |
| "Refresh" button | Button | `fetchDashboardData()` | Refetch all dashboard data | Multiple GETs |
| FAB (main button) | Button | `setIsFABMenuOpen(true)` | Opens FAB menu | None |
| FAB: Log Workout | Button | `onLogWorkout()` | Opens Quick Add Modal | None |
| FAB: Build Workout | Button | `onBuildWorkout()` | Opens Workout Builder | None |
| FAB: Load Template | Button | `onLoadTemplate()` | Opens Template Selector | None |
| Category tabs (Push/Pull/Legs) | Button | Filters recommendations | Update filter state | None |

**Total Interactive Elements:** 15+

---

### Workout Tracker (`Workout.tsx`)

| Element | Type | Handler | Action | API Call |
|---------|------|---------|--------|----------|
| "Cancel" button | Button | `onCancel()` | Navigate to `/` | None |
| "Finish Workout" button | Button | `handleFinish()` | Save workout, show summary | `POST /api/workouts` |
| "Add Exercise" button | Button | Opens exercise selector | Show full-screen picker | None |
| Exercise category filter | Button group | `setCategoryFilter()` | Filter exercises | None |
| Equipment filter | Button group | `setEquipmentFilter()` | Filter exercises | None |
| Muscle filter | Button group | `setMuscleFilter()` | Filter exercises | None |
| "Done" (exercise selector) | Button | `onDone()` | Close exercise selector | None |
| Exercise card | Expandable | `setExpandedExerciseId()` | Show/hide sets | None |
| "Add Set" button | Button | Adds new set | Update local state | None |
| Set inputs (weight/reps) | Input | Updates set data | Update state | None |
| "To Failure" checkbox | Checkbox | Toggles failure flag | Update set | None |
| Edit set icon | Button | Opens SetEditModal | Edit set details | None |
| Delete set icon | Button | Removes set | Update state | None |
| Delete exercise icon | Button | Removes exercise | Update state | None |
| Rest timer | Component | Auto-starts after set | Timer countdown | None |
| "+15s" (rest timer) | Button | `onAdd(15)` | Add 15 seconds | None |

**Total Interactive Elements:** 16+

---

### Profile Page (`Profile.tsx`)

| Element | Type | Handler | Action | API Call |
|---------|------|---------|--------|----------|
| Back button | Button | `onBack()` | Navigate to `/` | None |
| "Edit Profile" toggle | Expandable | Toggle edit mode | Show/hide form | None |
| Name input | Input | `setProfile()` | Update name | None |
| Experience dropdown | Select | `setProfile()` | Update experience | None |
| "Save Profile" button | Button | `handleSaveProfile()` | Save changes | `PUT /api/profile` |
| "Equipment" toggle | Expandable | Toggle section | Show/hide equipment | None |
| "Add Equipment" button | Button | Opens EquipmentModal | Equipment editor | None |
| Edit equipment icon | Button | Opens EquipmentModal | Edit existing | None |
| Delete equipment icon | Button | Removes item | Update state | `PUT /api/profile` |
| Muscle baseline card | Expandable | Toggle edit mode | Show/hide baseline | None |
| Override input | Input (number) | Update override | Set value | None |
| "Save" baseline | Button | `handleUpdate()` | Save baseline | `PUT /api/muscle-baselines` |
| "Clear Override" button | Button | `handleUpdate(null)` | Reset to learned | `PUT /api/muscle-baselines` |

**Total Interactive Elements:** 13+

---

### Personal Records (`PersonalBests.tsx`)

| Element | Type | Handler | Action | API Call |
|---------|------|---------|--------|----------|
| Back button | Button | `onBack()` | Navigate to `/` | None |
| "All" tab | Button | `setFilter('all')` | Show all records | None |
| "Push" tab | Button | `setFilter('Push')` | Filter by Push | None |
| "Pull" tab | Button | `setFilter('Pull')` | Filter by Pull | None |
| "Legs" tab | Button | `setFilter('Legs')` | Filter by Legs | None |
| "Core" tab | Button | `setFilter('Core')` | Filter by Core | None |
| Exercise record card | Display | Read-only | No interaction | None |

**Total Interactive Elements:** 6

**Known Issue:** No edit/delete functionality for records

---

### Analytics Page (`Analytics.tsx`)

| Element | Type | Handler | Action | API Call |
|---------|------|---------|--------|----------|
| **⚠️ Missing back button** | N/A | N/A | N/A | N/A |
| Time range dropdown | Select | `setTimeRange()` | Filter data by days | `GET /api/analytics?timeRange=X` |
| "Retry" button (error state) | Button | `fetchAnalytics()` | Refetch data | `GET /api/analytics` |
| Charts | Display | Read-only | No interaction | None |

**Total Interactive Elements:** 2

**Critical Issue:** No back button - users must use browser back or click Analytics icon again

---

### Muscle Baselines Page (`MuscleBaselinesPage.tsx`)

| Element | Type | Handler | Action | API Call |
|---------|------|---------|--------|----------|
| Back button | Button | Navigate to `/` | Return to Dashboard | None |
| "Dismiss" (info banner) | Button | `setShowInfoBanner(false)` | Hide banner | localStorage |
| Muscle baseline card | Expandable | Toggle edit form | Show/hide inputs | None |
| Override input | Input (number) | Update value | Set override | None |
| "Save" button | Button | `handleUpdate()` | Save baseline | `PUT /api/muscle-baselines` |
| "Clear Override" button | Button | `handleUpdate(null)` | Reset to learned | `PUT /api/muscle-baselines` |

**Total Interactive Elements:** 6

---

### Workout Templates Page (`WorkoutTemplates.tsx`)

| Element | Type | Handler | Action | API Call |
|---------|------|---------|--------|----------|
| Back button | Button | `onBack()` | Navigate to `/` | None |
| Template card | Button | `onSelectTemplate()` | Load template | Navigate to `/workout` |
| Expand template | Button | Toggle details | Show/hide exercises | None |

**Total Interactive Elements:** 3

---

## Modal System

### Quick Add Modal (`QuickAdd.tsx`)

**Purpose:** Quickly log a workout without full workout tracker

**Features:**
- Exercise picker with search/filter
- Set entry (weight/reps/failure)
- Add multiple sets
- Add multiple exercises
- Submit directly to backend

**Interactive Elements:**
- Close button (X) / Escape key
- Exercise search input
- Exercise selection list
- Category/Equipment/Muscle filters
- Weight input
- Reps input
- "To Failure" checkbox
- "Add Set" button
- "Add Another Exercise" button
- "Submit" / "Log Workout" button

**API:** `POST /api/quick-add`

**Exit:** Closes modal, returns to Dashboard

---

### Workout Builder Modal (`WorkoutBuilder.tsx`)

**Purpose:** Plan and execute workouts with rest timers

**Modes:**
1. **Planning Mode:** Add sets, configure exercises, save as template
2. **Execution Mode:** Timer-based workout with rest periods

**Interactive Elements:**

**Planning Mode:**
- Close button (X)
- "Planning" / "Executing" mode toggle
- "Add Set" button
- Exercise picker
- Weight/Reps/Rest timer inputs
- "Save Workout" button (saves as template)
- "Start Workout" button (navigate to `/workout`)

**Execution Mode:**
- All planning elements +
- Rest timer between sets
- Set completion checkboxes
- Real-time muscle fatigue forecast

**APIs:**
- Save template: `POST /api/templates`
- Start workout: Navigate to `/workout` with data

**Known Issue:** When saving template, category/variation are hardcoded to "Push" / "A" (see line 234-235)

---

### Workout Planner Modal (`WorkoutPlannerModal.tsx`)

**Purpose:** Plan a workout by selecting exercises and configuring sets

**Interactive Elements:**
- Close button (X)
- "Add Exercise" button
- Exercise selector (full-screen overlay)
  - Category/Equipment/Muscle filters
  - Exercise list with selection
- Planned exercise list
  - Expandable cards
  - Set configuration (weight/reps)
  - Delete exercise button
- "Start Workout" button → Navigate to `/workout`

**Exit:** Closes modal or starts workout

**Data Loss Warning:** If modal is closed without starting workout, planned data is lost (no auto-save)

---

### Template Selector Modal (`TemplateSelector.tsx`)

**Purpose:** Browse and load saved workout templates

**Interactive Elements:**
- Close button (X)
- Template card buttons
- Expand template button (shows exercises)
- "Load" button → Opens Workout Builder with template data

**API:** `GET /api/templates`

**Exit:** Closes modal or loads template into Workout Builder

---

### Muscle Deep Dive Modal (`MuscleDeepDiveModal.tsx`)

**Purpose:** Detailed muscle analysis and exercise recommendations

**Tabs:**
1. **Recommended:** Top 5 efficient exercises for the muscle
2. **All:** All exercises engaging the muscle
3. **History:** Last 3 exercises that trained this muscle

**Interactive Elements:**
- Close button (X)
- Tab buttons (Recommended / All / History)
- Filter toggles:
  - "Isolation only"
  - "Compound only"
  - "High efficiency only"
- Sort dropdown (Efficiency / Target % / Alphabetical)
- Exercise cards:
  - Volume slider (0-10,000 lbs)
  - "Find Sweet Spot" button
  - Muscle impact visualization
  - Set builder (sets/reps/weight inputs)
  - **"Add to Workout" button** ⚠️ **NOT FUNCTIONAL** (see line 516, only logs to console)

**Exit:** Closes modal, returns to Dashboard

**Critical Issue:** "Add to Workout" button doesn't actually add exercises - TODO comment on line 516

---

### Workout Summary Modal (`WorkoutSummaryModal.tsx`)

**Purpose:** Show workout results after finishing

**Features:**
- Workout duration
- Total volume
- PR notifications
- Muscle fatigue updates
- Baseline updates

**Interactive Elements:**
- "Done" button → Navigate to Dashboard

**Entry Point:** Automatically opens after clicking "Finish Workout" in Workout Tracker

---

### Set Edit Modal (`SetEditModal.tsx`)

**Purpose:** Edit individual set details

**Interactive Elements:**
- Close button (X)
- Weight input
- Reps input
- "To Failure" checkbox
- "Save" button
- "Cancel" button

**Exit:** Closes modal, updates set in Workout Tracker

---

### Equipment Modal (`EquipmentModal.tsx`)

**Purpose:** Add/edit equipment in profile

**Interactive Elements:**
- Close button (X)
- Equipment type dropdown
- Min weight input
- Max weight input
- Weight increment dropdown (2.5 / 5 / 10 lbs)
- "Save" button
- "Cancel" button

**Exit:** Closes modal, updates equipment list in Profile

---

## Known Issues & Incomplete Features

### Critical Issues

#### 1. Muscle Deep Dive "Add to Workout" Non-Functional
**Location:** `Dashboard.tsx:516`
**Issue:** Button exists but only logs to console
**Code:**
```typescript
// TODO: Integration with WorkoutPlannerModal
const handleAddToWorkout = (planned: PlannedExercise) => {
  console.log('Add to workout:', planned);
};
```
**Impact:** Users cannot add exercises from muscle deep dive modal
**Fix Required:** Implement proper integration with Workout Planner or Workout Tracker

---

#### 2. Analytics Page Missing Back Button
**Location:** `Analytics.tsx:73`
**Issue:** Header doesn't include back button like other pages
**Impact:** Navigation confusion; requires browser back or clicking Analytics icon again
**Fix Required:** Add back button to header

---

#### 3. Template Category/Variation Hardcoded
**Location:** `WorkoutBuilder.tsx:234-235`
**Issue:** When saving template, category and variation are hardcoded:
```typescript
category: 'Push', // TODO: Auto-detect or ask user
variation: 'A', // TODO: Auto-detect or ask user
```
**Impact:** All saved templates are Push A regardless of actual exercises
**Fix Required:** Ask user to select category/variation when saving template

---

### Medium Issues

#### 4. Missing Muscle Detail Level Toggle
**Location:** `Dashboard.tsx:475-477`
**Issue:** Code reads `muscleDetailLevel` from localStorage but no UI control to change it
**Code:**
```typescript
const muscleDetailLevel = localStorage.getItem('muscleDetailLevel') as 'simple' | 'detailed' || 'simple';
```
**Impact:** Users cannot switch between simple (13 muscles) and detailed (42 muscles) view
**Fix Required:** Add toggle button in muscle heat map section

---

#### 5. Modal Data Loss on Close
**Location:** WorkoutBuilder, WorkoutPlanner
**Issue:** If user accidentally closes modal while planning, all data is lost
**Impact:** Frustrating UX if user loses 5+ minutes of planning
**Fix Required:** Implement localStorage auto-save for modal state

---

#### 6. BottomNav Component Unused
**Location:** `src/components/layout/BottomNav.tsx`
**Issue:** Component defined but never imported/used
**Impact:** Wasted code; no bottom navigation bar visible
**Fix Required:** Either implement or delete component

---

#### 7. No Edit/Delete for Personal Records
**Location:** `PersonalBests.tsx`
**Issue:** Records are read-only; cannot edit or delete
**Impact:** Old/incorrect records persist forever
**Fix Required:** Add edit/delete functionality or document as intentional

---

### Minor Issues

#### 8. Exercise Selector Exit Unclear
**Location:** `Workout.tsx:72`
**Issue:** "Done" button text is minimal; users might not understand it closes modal
**Impact:** Minor UX friction
**Recommendation:** Change to "Close" or "Back to Workout"

---

#### 9. No Breadcrumb Navigation
**Issue:** App doesn't show navigation hierarchy
**Impact:** Users rely on back buttons; no visual sense of page structure
**Recommendation:** Consider adding breadcrumbs for complex flows

---

## API Integration Reference

### Profile APIs
- `GET /api/profile` - Fetch user profile (Dashboard, Profile page)
- `PUT /api/profile` - Update profile (Profile page)
- `POST /api/profile/init` - Initialize profile (Profile Wizard)

### Workout APIs
- `GET /api/workouts` - Get all workouts (Dashboard, Analytics)
- `GET /api/workouts/last?category={category}` - Get last workout (Workout Tracker)
- `POST /api/workouts` - Create workout (Workout Tracker)
- `POST /api/quick-add` - Quick add workout (Quick Add Modal)
- `POST /api/quick-workout` - Batch workout (Quick Add Modal)
- `POST /api/builder-workout` - Builder workout (Workout Builder)

### Muscle State APIs
- `GET /api/muscle-states` - Get muscle states (Dashboard, Workout Builder)
- `GET /api/muscle-states/detailed` - Get detailed muscles (Future: Muscle Deep Dive)
- `PUT /api/muscle-states` - Update states (After workout completion)

### Personal Bests APIs
- `GET /api/personal-bests` - Get PRs (Personal Bests page, Dashboard)
- `PUT /api/personal-bests` - Update PRs (Backend handles automatically)

### Muscle Baselines APIs
- `GET /api/muscle-baselines` - Get baselines (Muscle Baselines page, Dashboard)
- `PUT /api/muscle-baselines` - Update baselines (Muscle Baselines page)

### Template APIs
- `GET /api/templates` - Get all templates (Templates page, Template Selector)
- `POST /api/templates` - Create template (Workout Builder)
- `DELETE /api/templates/{id}` - Delete template (Templates page)

### Analytics APIs
- `GET /api/analytics?timeRange={days}` - Get analytics (Analytics page)

### Calibration APIs (Future Integration)
- `GET /api/calibrations` - Get all calibrations
- `GET /api/calibrations/:exerciseId` - Get exercise calibrations
- `PUT /api/calibrations/:exerciseId` - Save calibrations
- `DELETE /api/calibrations/:exerciseId` - Reset calibrations

### Rotation APIs (Future Integration)
- `GET /api/rotation/next` - Get next recommended workout

---

## Navigation Issues & Dead Ends

### Dead Ends (Pages Without Back Navigation)

1. **Analytics Page** ⚠️
   - Missing back button
   - Workaround: Click Analytics icon again or browser back
   - Status: **BUG - Needs fix**

2. **Profile Wizard** (Onboarding)
   - Cannot exit until completion
   - Status: **Intentional by design**

### Navigation Flow Complexity

#### Multiple Paths to Workout Tracker

There are 5 different ways to reach `/workout`:

1. Dashboard → "Start Custom Workout" (direct)
2. Dashboard → Recommended workout card (with initial exercises)
3. Dashboard → "My Templates" → Template Selector → Workout Builder → Start (4 steps)
4. FAB Menu → "Build Workout" → Workout Builder → Start (3 steps)
5. Dashboard → "Plan Workout" → Workout Planner → Start (2 steps)

**Impact:** Cognitive load; users may not know optimal path
**Status:** Functional but could be simplified
**Recommendation:** User testing to determine preferred flow

---

## Recommendations

### High Priority

1. ✅ **Fix Analytics back button** - Add header with back button
2. ✅ **Implement "Add to Workout" in Muscle Deep Dive** - Connect to Workout Planner
3. ✅ **Fix template category/variation** - Ask user when saving template
4. ✅ **Add muscle detail level toggle** - Allow switching between simple/detailed view

### Medium Priority

5. ⚙️ **Implement modal auto-save** - Save Workout Builder/Planner state to localStorage
6. ⚙️ **Add edit/delete to Personal Records** - Full CRUD for PRs
7. ⚙️ **Remove or implement BottomNav** - Clean up unused component

### Low Priority

8. 📝 **Add breadcrumb navigation** - Improve navigation hierarchy visibility
9. 📝 **Simplify workout entry flows** - Consider unifying multiple paths
10. 📝 **Improve exercise selector UX** - Better close button labeling

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Total Pages** | 8 |
| **Total Modals** | 10 |
| **Total Routes** | 7 |
| **Total Buttons** | 30+ |
| **Total Inputs** | 15+ |
| **Total Toggles** | 2 |
| **API Endpoints Used** | 17 |
| **Critical Issues** | 3 |
| **Medium Issues** | 4 |
| **Minor Issues** | 2 |

---

## Conclusion

FitForge's frontend is well-architected with clear component separation and comprehensive functionality. The main areas for improvement are:

1. **Completing incomplete features** (3 TODO items)
2. **Improving navigation** (1 missing back button)
3. **Preventing data loss** (modal auto-save)

The application is fully functional and navigable, with issues that are primarily UX improvements rather than critical bugs.

---

**Document End**

*For backend documentation, see `docs/data-model.md`*
*For API contract details, see `backend/types.ts`*

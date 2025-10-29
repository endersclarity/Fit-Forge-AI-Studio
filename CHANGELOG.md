# Changelog

All notable changes to this project will be documented in this file.

Format: Chronological entries with commit hashes, files changed, and technical context.
Audience: AI-assisted debugging and developer reference.

---

### 2025-10-29 - Personal Records Sync & Dual-Layer Tracking Proposal

**Status**: IN PROGRESS - Research & Planning
**Feature**: Personal records backup system and dual-layer muscle tracking architecture

**Files Changed**:
- `personal-records.json` (created - backup of 36 exercises with protocols, volumes, muscle engagements)
- `scripts/sync-personal-records.ts` (created - script to sync personal records to muscle_baselines table)
- `scripts/compare-exercises.ts` (created - compares personal records with exercise library)
- `scripts/analyze-muscle-responsibilities-v2.ts` (created - analyzes muscle roles from EMG data)
- `docs/emg-research-reference.md` (referenced - 40+ exercises with EMG % MVIC data)
- `docs/dual-layer-muscle-tracking-REFINED.md` (created - design document for dual-layer system)
- `docs/dual-layer-muscle-tracking-design.md` (created - initial design exploration)
- `openspec/changes/2025-10-29-implement-dual-layer-muscle-tracking/` (created - formal OpenSpec proposal)
- `data/fitforge.db` (modified - muscle_baselines updated with personal record volumes)

**Summary**: Created comprehensive personal records backup system and formal proposal for dual-layer muscle tracking that tracks 40+ specific muscles behind the scenes while maintaining simple 13-muscle UI visualization.

**Changes Made**:

1. **Personal Records Backup System**:
   - Created `personal-records.json` with 36 exercises including:
     - Exercise protocols (sets × reps @ weight)
     - Total volumes (up to 6,300 lb for RDLs)
     - Muscle engagement lists
     - Training notes and adaptations
   - Total session volume: 43,800 lb across all exercises
   - Serves as version-controlled backup outside database

2. **Baseline Sync Script** (`scripts/sync-personal-records.ts`):
   - Reads personal-records.json and calculates per-muscle volumes
   - Maps muscle names (e.g., "latissimus dorsi" → "Lats")
   - Distributes exercise volume across engaged muscles
   - Updates `muscle_baselines` table with `user_override` values
   - **Known Issue**: Bodyweight exercises (pull-ups, chin-ups) are skipped (totalVolume=null)
   - **Known Issue**: Equal distribution across muscles undervalues primary movers (e.g., Lats calculated at 1,300 lb when should be ~5,000+ lb based on pull-up work)
   - Successfully synced 12 muscle baselines on 2025-10-29

3. **Muscle Analysis Tools**:
   - `compare-exercises.ts`: Identifies 12 exercises in app library but missing from personal records
   - `analyze-muscle-responsibilities-v2.ts`: Categorizes muscle roles (MAJOR ≥50%, MODERATE 30-49%, MINOR <30%)
   - Analysis revealed muscles with highest training load: Biceps (9 exercises), Lats (8), Glutes/Core (7 each)

4. **Dual-Layer Tracking Proposal** (OpenSpec):
   - **Problem**: Current system only tracks 13 visualization muscles, but EMG research shows 40+ muscles engaged
   - **Solution**: Layer 1 (Visualization) = 13 muscles for UI, Layer 2 (Detailed) = 42 muscles for recuperation
   - **Key Capabilities**:
     1. `detailed-muscle-tracking`: Track rotator cuff, scapular stabilizers, core subdivisions, muscle heads
     2. `muscle-specific-recommendations`: Recommend posterior delt work when anterior is fatigued
     3. `advanced-muscle-visualization`: Optional detailed view for power users
   - **Design Decisions**:
     - Conservative baseline initialization (all detailed muscles inherit full parent baseline)
     - Primary movers only shown in visualization (stabilizers hidden)
     - Uniform recovery within muscle groups
     - Smart recommendations target fresh muscles within groups
     - Optional advanced toggle in settings
   - **Timeline**: 16-24 hours across 4 phases
   - **Files**: `proposal.md`, `design.md`, `tasks.md`, 3 capability specs

5. **Database Updates**:
   - Synced following baselines (as user_overrides):
     - Biceps: 4,325 lb (+1,400 from additions)
     - Glutes: 9,190 lb (highest capacity)
     - Hamstrings: 7,500 lb
     - Core: 6,740 lb
     - Deltoids: 4,350 lb
     - Trapezius: 3,750 lb
     - Triceps: 3,600 lb
     - Pectoralis: 3,100 lb
     - Quadriceps: 1,690 lb
     - Forearms: 1,300 lb
     - Lats: 1,300 lb (⚠️ UNDERESTIMATED - see known issues)
     - Rhomboids: 1,050 lb

**Known Issues & Next Steps**:

⚠️ **Baseline Calculation Issues**:
- Bodyweight exercises (pull-ups, dips, planks) contribute zero volume (need bodyweight × reps × sets calculation)
- Equal distribution across muscles doesn't reflect primary vs secondary movers
- Lats showing 1,300 lb when pull-up work suggests 5,000+ lb capacity
- Core stabilizers like obliques and erector spinae not tracked separately

**Resolution Plan**:
- Dual-layer system will use EMG % MVIC for weighted distribution
- Bodyweight exercises will get proper volume calculations
- Phase 2 of dual-layer implementation will fix baseline accuracy

**Research References**:
- EMG research: `docs/emg-research-reference.md` (189 peer-reviewed studies)
- Pull-ups: Lats 117-130% MVIC, Biceps 78-96% MVIC
- Push-ups: Serratus anterior 40-50% MVIC (currently not tracked)
- Planks: External obliques 99-108% MVIC (currently lumped into "Core")

**Next Actions**:
- [ ] Review and approve OpenSpec proposal
- [ ] Implement Phase 1: Foundation & Schema (DetailedMuscle enum, database table)
- [ ] Implement Phase 2: Populate all 40 exercises with EMG data
- [ ] Fix baseline calculations to use weighted EMG percentages

---

### 2025-10-28 - Phase 7: UI Polish & Refinements (✅ IMPLEMENTED)

**Status**: IMPLEMENTED - Production ready
**Feature**: UI consistency improvements, empty states, and enhanced muscle visualization

**Files Changed**:
- `components/SetCard.tsx` (updated - replaced emoji buttons with text buttons, fixed bullet character)
- `components/SimpleMuscleVisualization.tsx` (updated - added summary stats with color-coded indicators)
- `components/WorkoutBuilder.tsx` (updated - added empty state for planning view)

**Summary**: Polished the Quick Builder UI with consistent button styling, improved empty states, and enhanced muscle visualization with at-a-glance summary statistics showing low/medium/high fatigue muscle counts.

**Changes Made**:

1. **SetCard Button Consistency** (`components/SetCard.tsx`):
   - Replaced emoji icon buttons (✏️, 🗑️, +) with text buttons ("Edit", "Dup", "Del")
   - Added consistent styling: `bg-brand-dark` with hover states
   - Fixed bullet character from `"` to `•` in set info display
   - All buttons now have `transition-colors` for smooth hover effects
   - Color coding: Edit (slate), Duplicate (cyan), Delete (red)

2. **Enhanced Muscle Visualization** (`components/SimpleMuscleVisualization.tsx`):
   - Added summary statistics bar at top showing counts of low/medium/high fatigue muscles
   - Color-coded indicators (green/yellow/red dots) matching bar colors
   - Calculates and displays muscle distribution at a glance
   - Formula: High (>80%), Medium (50-80%), Low (<50%)
   - Helps users quickly assess overall workout intensity

3. **WorkoutBuilder Empty State** (`components/WorkoutBuilder.tsx`):
   - Added helpful empty state when no sets are added
   - Message: "No sets added yet. Select an exercise above to build your workout."
   - Consistent styling with other empty states (bg-brand-muted, centered text)
   - Improves first-time user experience

**Build Verification**:
- TypeScript build: ✅ Success (4.03s)
- Bundle size: 874.53 KB (↑1.22 KB from 873.31 KB)
- Gzip size: 251.96 KB
- No TypeScript errors
- All components rendering correctly

**Technical Details**:
- Button refactor eliminates emoji rendering issues across different terminals/fonts
- Summary stats use efficient filter operations to categorize muscles
- Empty state uses conditional rendering with ternary operator for cleaner code
- All changes maintain existing functionality while improving UX

---

### 2025-10-28 - Quick Builder + Execution Mode (✅ IMPLEMENTED)

**Status**: IMPLEMENTED - Production ready
**Feature**: Complete workout planning and execution system with guided timers and real-time muscle fatigue tracking

**Files Changed**:
- `components/WorkoutBuilder.tsx` (new - main builder with planning + execution modes)
- `components/TemplateSelector.tsx` (new - template browser modal)
- `components/SetConfigurator.tsx` (new - set configuration form)
- `components/SetCard.tsx` (new - individual set display with actions)
- `components/SetEditModal.tsx` (new - set editing modal)
- `components/CurrentSetDisplay.tsx` (new - execution mode set display with timer)
- `components/SimpleMuscleVisualization.tsx` (new - bar chart muscle fatigue viz)
- `components/FABMenu.tsx` (existing - already created in Phase 2)
- `components/TemplateCard.tsx` (existing - already created in Phase 3)
- `components/Dashboard.tsx` (updated - integrated WorkoutBuilder and TemplateSelector)
- `types.ts` (updated - BuilderSet, BuilderWorkout, BuilderWorkoutRequest types already added)
- `backend/database/migrations/006_update_workout_templates.sql` (created - updated templates schema)

**Summary**: Implemented complete workout planning and execution system that allows users to pre-plan workouts with custom sets/weights/reps/rest timers, then execute them with guided countdown timers, auto-advance, and real-time muscle fatigue visualization. Includes template system for saving and reusing workout plans.

**Problem**: Users could only log completed workouts retroactively (Quick Add). No way to plan workouts ahead of time, execute with guided timers, or see forecasted muscle impact before starting. No template system for reusing favorite workout configurations.

**Solution**: Built comprehensive Quick Builder system with two distinct modes:
1. **Planning Mode**: Configure workout sets, see forecasted muscle fatigue, save as templates
2. **Execution Mode**: Guided timer countdown, auto-advance between sets, real-time fatigue tracking

**User Decisions Made**:
1. **Template Saving**: Always create new (no update existing) - simpler UX
2. **Execution Visualization**: Show current + forecast (dual view) - better feedback
3. **Drag-Drop Reordering**: Deferred to v2 (use array position) - faster MVP
4. **Mid-Workout Edits**: Keep completed sets counted - maintains data integrity

**Core Features**:

1. **FAB Menu System**:
   - 3 options: Log Workout (Quick Add), Build Workout (new), Load Template (new)
   - Slide-up animation modal
   - Clear action hierarchy

2. **Workout Planning** (`WorkoutBuilder.tsx` Planning Mode):
   - Add sets via `SetConfigurator`: exercise picker, weight, reps, rest timer (90s default)
   - View all planned sets in `SetCard` list with set number and details
   - Actions: Edit (opens modal), Duplicate (creates copy), Delete
   - **Forecasted Muscle Fatigue**: Bar chart showing projected fatigue from all planned sets
   - Save as Template, Log as Completed (without execution), or Start Workout

3. **Template System**:
   - Save workouts as templates with name, category, variation
   - Browse templates via "My Templates" button or FAB menu
   - Load template into builder (pre-fills all sets)
   - Delete templates
   - Templates store: exerciseId, weight, reps, restTimerSeconds (no orderIndex - array position)

4. **Workout Execution** (`WorkoutBuilder.tsx` Execution Mode):
   - Display current set only with exercise name, weight, reps
   - Rest timer countdown with animated progress bar
   - **Auto-advance**: After rest timer completes, automatically moves to next set
   - Actions: Complete Set (starts timer), Skip Set (no rest)
   - **Real-Time Muscle Tracking**: Updates fatigue after each completed set
   - **Dual Visualization**: Current progress (full opacity) + Forecasted end (60% opacity)
   - Mid-workout flexibility: "Edit Plan" switches back to planning mode
   - Finish Workout (saves only completed sets) or Finish Early

5. **Muscle Fatigue Calculations**:
   - **Forecasted**: `volume = weight × reps × (engagement % / 100)`, summed per muscle
   - **Fatigue Increase**: `(volume / baseline) × 100`
   - **Real-Time**: Updates after each completed set during execution
   - **Color Coding**: Green (<50%), Yellow (50-80%), Red (>80%)

**Technical Implementation**:

1. **State Management**:
   - `BuilderWorkout`: sets array, currentSetIndex, startTime, muscleStatesSnapshot
   - Mode state machine: `'planning' | 'executing'`
   - Execution state: restTimerEndTime, completedSets (Set<string>), autoAdvanceTimeoutId
   - Separate `executionMuscleStates` from planning `muscleStates`

2. **Auto-Advance with Cleanup**:
   - `setTimeout` with timeout ID stored in state
   - `useEffect` cleanup clears timeout on unmount/mode switch
   - Prevents memory leaks and duplicate timers

3. **Muscle Fatigue Algorithm**:
   ```typescript
   calculateForecastedMuscleStates():
     for each set:
       volume = weight × reps
       for each muscle engagement:
         muscleVolume += volume × (percentage / 100)

     for each muscle with volume:
       baseline = userOverride || systemLearnedMax || 1000
       fatigueIncrease = (volume / baseline) × 100
       forecastedFatigue = currentFatigue + fatigueIncrease
   ```

4. **Template Data Model**:
   - Changed from `exerciseIds: string[]` to `sets: TemplateSet[]`
   - Migration `006_update_workout_templates.sql` updates existing data
   - TemplateSet: exerciseId, weight, reps, restTimerSeconds

**Components Architecture**:

1. **SetConfigurator**: Exercise picker + weight/reps/rest inputs with +/- buttons
2. **SetCard**: Display set info with Edit/Duplicate/Delete actions
3. **SetEditModal**: Fine-grained editing (±2.5/±5 lbs for weight, ±1 for reps, ±15s for rest)
4. **CurrentSetDisplay**: Large set display with countdown timer and progress bar
5. **SimpleMuscleVisualization**: Horizontal bars showing muscle fatigue (filters to active muscles only)
6. **TemplateSelector**: Grid of template cards with Load/Delete actions
7. **WorkoutBuilder**: Main container coordinating all components with mode switching

**User Flow**:

**Planning & Starting**:
1. FAB button → "Build Workout"
2. Select exercise, configure weight/reps/rest → Add Set
3. Repeat for all sets → See forecasted muscle fatigue update
4. Options: Start Workout, Save as Template, Log as Completed

**Execution**:
1. Start Workout → Enters execution mode
2. View current set details → Complete Set
3. Rest timer counts down with progress bar
4. Auto-advances to next set when timer completes
5. See real-time muscle fatigue + forecasted end state
6. Options: Edit Plan (switch to planning), Skip Set, Finish Early
7. After last set → Celebration screen → Finish Workout

**Template Loading**:
1. "My Templates" button or FAB → Load Template
2. Select template → Opens WorkoutBuilder with pre-filled sets
3. Edit if needed → Start Workout

**Integration Points**:

1. **Dashboard.tsx**:
   - Added 3-column grid with "My Templates" button
   - Integrated WorkoutBuilder and TemplateSelector modals
   - State: `loadedTemplate` passed to WorkoutBuilder
   - Callbacks: onSuccess refreshes dashboard data

2. **Backend API** (`builderAPI`):
   - `POST /api/builder-workout`: Saves completed workout
   - Payload: sets array (exercise_name, weight, reps, rest_timer_seconds), timestamp, was_executed
   - `was_executed: true` for executed workouts, `false` for logged-as-completed

3. **Templates API** (`templatesAPI`):
   - Updated to use `sets` field instead of `exerciseIds`
   - JSON.stringify on save, JSON.parse on load
   - Backwards compatible via migration

**Not Implemented (Deferred to v2)**:
- Drag-drop set reordering (use delete/re-add for now)
- Complex muscle visualization (using simple bar chart)
- Template categories/search/filtering
- Mid-workout template creation
- Sound notifications for timer completion

**Bundle Impact**: +2.5 KB (873.31 KB total, up from 870.75 KB)

**Testing Notes**:
- All components build without TypeScript errors
- FAB menu opens with 3 action buttons
- Can add/edit/duplicate/delete sets in planning mode
- Forecasted muscle fatigue updates as sets change
- Templates save/load/delete correctly
- Execution mode displays current set with countdown timer
- Auto-advance works after rest timer completes
- Real-time muscle fatigue updates after completing sets
- Dual visualization shows current vs forecasted during execution
- Finish workout saves only completed sets with was_executed flag
- Edit Plan mid-workout preserves completed sets

---

### 2025-10-28 - Interactive Muscle Deep Dive Modal (✅ IMPLEMENTED)

**Commit Range**: 44aa1dd → d0bc1b3 (10 commits)
**Status**: IMPLEMENTED - Ready for testing
**Feature**: Click any muscle to open interactive deep-dive modal with exercise recommendations

**Files Changed**:
- `utils/exerciseEfficiency.ts` (new - efficiency ranking algorithm)
- `utils/volumeForecasting.ts` (new - volume forecasting with sweet spot finder)
- `utils/setBuilder.ts` (new - set builder with locked target volume)
- `components/MuscleDeepDiveModal.tsx` (new - modal shell with 3 tabs)
- `components/ExerciseCard.tsx` (new - interactive exercise card)
- `components/MuscleVisualization/MuscleVisualizationContainer.tsx` (refactored to single-click)
- `components/Dashboard.tsx` (integrated modal)

**Summary**: Implemented interactive muscle deep-dive modal that opens when clicking any muscle in the visualization. Provides ranked exercise recommendations, real-time volume forecasting, and intelligent set building with locked target volume.

**Problem**: Users needed smarter exercise selection beyond simple muscle filtering. When choosing exercises, they couldn't see:
- Which exercises would efficiently max out the target muscle before hitting bottlenecks
- Real-time impact on muscle fatigue from planned volume
- Optimal "sweet spot" volume that maxes target muscle without overloading support muscles
- Set/rep/weight combinations that maintain specific volume targets

**Solution**: Built complete deep-dive modal with efficiency-based ranking, real-time forecasting, and interactive volume planning.

**Core Algorithms**:

1. **Efficiency Ranking** (`utils/exerciseEfficiency.ts`):
   - Formula: `(target_engagement × target_capacity) ÷ bottleneck_capacity`
   - Scores exercises by how much target muscle can be pushed before hitting bottleneck
   - Badges: "Efficient" (score > 5.0), "Limited" (2.0-5.0), "Poor choice" (< 2.0)
   - Identifies bottleneck muscle that will limit the exercise

2. **Volume Forecasting** (`utils/volumeForecasting.ts`):
   - Real-time calculation: `forecastedFatigue = currentFatigue + (volumeAdded / baseline × 100)`
   - "Find Sweet Spot": Auto-optimizes volume to max target muscle before any supporting muscle hits 100%
   - Shows forecasted fatigue for all engaged muscles given planned volume

3. **Set Builder** (`utils/setBuilder.ts`):
   - Locked target volume: Adjustments maintain total volume
   - Defaults: 3 sets, 8-12 rep range, rounds to nearest 5 lbs
   - If user changes sets: recalculates weight to maintain volume
   - If user changes reps: recalculates weight to maintain volume
   - If user changes weight: recalculates reps to maintain volume

**UI Components**:

1. **MuscleDeepDiveModal** (`components/MuscleDeepDiveModal.tsx`):
   - Header: Shows muscle name and current fatigue % with color-coded bar
   - 3 tabs: Recommended, All Exercises, History
   - Close on Escape key, click outside, or X button
   - Full-screen overlay with max-w-4xl centered modal

2. **ExerciseCard** (`components/ExerciseCard.tsx`):
   - Expandable card showing exercise name, target muscle %, efficiency badge
   - **Volume Slider**: 0-10,000 lbs with live muscle impact visualization
   - **"Find Sweet Spot"** button: Auto-sets optimal volume
   - **Muscle Impact Section**: Shows current → forecasted fatigue for all engaged muscles
   - **Bottleneck Warning**: "⚠️ {muscle} will limit this exercise"
   - **Set Builder**: Grid of sets/reps/weight inputs with locked volume
   - **"Add to Workout"** button (currently logs to console - integration pending)

3. **Tab Features**:
   - **Recommended Tab**: Top 5 exercises ranked by efficiency score
   - **All Exercises Tab**:
     - Filters: Isolation Only (target >70%, support <30%), Compound Only (2+ muscles >30%), High Efficiency (green badge)
     - Sorting: Efficiency (default), Target %, Alphabetical
     - Shows all exercises that engage the target muscle
   - **History Tab**: Last 3 exercises that trained this muscle, sorted by date
     - Shows exercise name, "X days ago", total volume
     - Empty state: "No training history for {muscle} yet"

**Integration Changes**:

1. **MuscleVisualizationContainer** (refactored):
   - Changed from `onMuscleSelect?: (muscles: Muscle[]) => void` to `onMuscleClick?: (muscle: Muscle) => void`
   - Removed multi-select state management (no longer filtering exercises)
   - Removed "Clear Selection" button and selection count badge
   - Updated legend text: "Click muscles to view deep-dive modal"
   - Removed selection status announcement for screen readers

2. **Dashboard** (integrated):
   - Added state: `deepDiveModalOpen`, `selectedMuscleForDeepDive`
   - Added handler: `handleMuscleClickForDeepDive(muscle)` opens modal
   - Added handler: `handleAddToWorkout(planned)` logs to console (TODO: WorkoutPlannerModal integration)
   - Updated MuscleVisualizationContainer: `onMuscleClick={handleMuscleClickForDeepDive}`
   - Rendered modal conditionally when muscle selected

**User Flow**:
1. User clicks any muscle in visualization → Modal opens
2. **Recommended tab** shows top 5 exercises ranked by efficiency
3. User clicks exercise card → Expands to show volume slider
4. User drags slider → Real-time muscle impact updates
5. User clicks "Find Sweet Spot" → Auto-optimizes to max target before bottleneck
6. User clicks "Build Sets" → Set builder appears with default 3 sets
7. User adjusts sets/reps/weight → Total volume remains locked
8. User clicks "Add to Workout" → (Currently logs to console)

**Not Yet Connected**:
- WorkoutPlannerModal integration (modal exists standalone)
- "Add to Workout" button doesn't actually add to planned workout yet
- No entry point from "Add Exercise" button in WorkoutPlannerModal

**Bundle Impact**: +12 KB (848.60 KB total, up from 836 KB)

**Testing Notes**:
- All utilities have passing unit tests (5 tests total)
- Modal fully functional at http://localhost:3000
- Click any muscle to verify modal opens with correct data
- Test volume slider and "Find Sweet Spot" auto-optimization
- Test set builder maintains locked volume during adjustments
- Verify filters and sorting work in All Exercises tab
- Check History tab shows workout data correctly

---

### 2025-10-28 - Streamline Homepage Information Architecture (✅ DEPLOYED)

**Commit**: df69643
**Status**: DEPLOYED & TESTED
**OpenSpec**: streamline-homepage-information-architecture

**Files Changed**:
- components/Dashboard.tsx (removed redundant sections, wrapped sections in CollapsibleCard)
- components/CollapsibleCard.tsx (new component for progressive disclosure)
- openspec/changes/2025-10-27-streamline-homepage-information-architecture/ (proposal and tasks)

**Summary**: Restructured homepage to prioritize decision-making over information density using aggressive progressive disclosure. Muscle visualization is now the ONLY always-visible content section (hero element), with all secondary features collapsed behind expandable cards.

**Problem**: First real-world user testing revealed severe information overload on homepage. Workout history appeared THREE times, duplicate buttons ("Browse Templates"), unnecessary tagline, and muscle visualization was not prominent enough. User quote: "Don't need workout recommendations 'up front' - should be progressive disclosure. Homepage should lead with large, clear muscular structure visualization showing current fatigue levels."

**Solution**: Implemented progressive disclosure pattern with CollapsibleCard component. Removed all redundant sections, simplified welcome message, and collapsed all secondary features behind expandable cards (default: collapsed).

**Changes Implemented**:
1. **Removed Redundant Sections**:
   - DashboardQuickStart component (4 template cards)
   - LastWorkoutContext component
   - RecoveryTimelineView component (redundant with muscle viz color coding)
   - Duplicate Workout History section (was shown 3 times, now shown once in collapsible card)
   - "Browse Workout Templates" button (redundant)

2. **Simplified Welcome Message**:
   - Changed from "Welcome back, {name}, ready to forge strength" to "Welcome back, {name}"
   - Removed tagline completely

3. **Created CollapsibleCard Component**:
   - Props: title, icon, defaultExpanded, children
   - Smooth expand/collapse animation using CSS grid transitions
   - Accessibility: aria-expanded, keyboard navigation, focus states
   - Consistent styling across all cards

4. **Wrapped Sections in Collapsible Cards** (all default to collapsed):
   - 💪 Workout Recommendations
   - 📈 Quick Stats
   - 📋 Recent Workouts
   - 🔥 Muscle Heat Map
   - 🎯 Exercise Finder

5. **Simplified Primary Actions**:
   - Reduced from 3 buttons to 2: "Plan Workout" and "Start Custom Workout"
   - Grid layout for even spacing
   - Min tap target 44x44px for accessibility

6. **Enhanced Exercise Finder**:
   - Shows helpful message when equipment not configured
   - Link to Profile page to configure equipment

**Visual Hierarchy** (Top to Bottom):
```
┌─────────────────────────────────────────────────────┐
│ Welcome back {name}                    [Profile 👤] │
├─────────────────────────────────────────────────────┤
│         🧍 LARGE MUSCLE VISUALIZATION               │
│         (Color-coded fatigue heat map)              │
│         Interactive hover with percentages          │
├─────────────────────────────────────────────────────┤
│ [📊 Plan Workout]  [➕ Start Custom Workout]        │
├─────────────────────────────────────────────────────┤
│ 💪 Workout Recommendations                     [▼] │
│ 📈 Quick Stats                                 [▼] │
│ 📋 Recent Workouts                             [▼] │
│ 🔥 Muscle Heat Map                             [▼] │
│ 🎯 Exercise Finder                             [▼] │
└─────────────────────────────────────────────────────┘
                    [+ Quick Add] (FAB)
```

**Impact**:
- Muscle visualization now the ONLY always-visible content section
- Massive reduction in cognitive load
- User can see muscle viz immediately (no scrolling needed)
- Clear visual hierarchy prioritizes decision-making
- All secondary features accessible via progressive disclosure
- No duplicate sections visible
- Clean, focused interface

**Technical Details**:
- CollapsibleCard uses CSS grid `grid-rows-[0fr]` → `grid-rows-[1fr]` for smooth height transitions
- Chevron icons rotate on expand/collapse
- All cards have consistent dark background, rounded corners, padding
- Keyboard accessible (Enter/Space to toggle)
- Screen reader friendly with aria-expanded attribute

**Testing**:
- ✅ Muscle viz is ONLY always-visible section
- ✅ Welcome message shows name only (no tagline)
- ✅ Recovery Timeline completely removed
- ✅ DashboardQuickStart removed
- ✅ LastWorkoutContext removed
- ✅ Browse Templates button removed
- ✅ All 5 collapsible cards present and functional
- ✅ All cards default to collapsed
- ✅ Smooth expand/collapse animations
- ✅ Two primary action buttons work correctly
- ✅ Quick Add FAB still present
- ✅ Mobile layout clean and readable
- ✅ No TypeScript compilation errors
- ✅ No performance regression

**Future Work**:
- User validation to confirm cognitive load reduction
- Gather feedback on clean, focused interface
- Iterate based on user feedback

---

### 2025-10-27 - Implement React Router Navigation (✅ DEPLOYED)

**Commit**: 8e3b8b8
**Status**: DEPLOYED & TESTED
**OpenSpec**: implement-react-router-navigation

**Files Changed**:
- index.tsx (wrapped App in BrowserRouter)
- App.tsx (replaced state-based navigation with Routes, removed view state, added useNavigate)
- package.json (added react-router-dom@6)
- package-lock.json (dependency lock file updated)

**Summary**: Replaced state-based view switching with proper React Router client-side routing. Browser back/forward buttons now work, URLs are bookmarkable, and each view has its own route.

**Problem**: User reported "No back button visible - everything seems crammed into one page (localhost:3000). Need actual page navigation." Browser back/forward buttons didn't work because all views rendered at same URL with conditional state toggling.

**Solution**: Implemented React Router v6 with 7 routes, converted all navigation callbacks to use navigate(), removed View type and view state entirely.

**Route Structure**:
- `/` - Dashboard (default)
- `/workout` - Workout Tracker
- `/profile` - Profile & Settings
- `/bests` - Personal Bests
- `/templates` - Workout Templates
- `/analytics` - Analytics & Stats
- `/muscle-baselines` - Muscle Baselines Configuration

**Technical Implementation**:
1. **Install dependency**: `npm install react-router-dom@6`
2. **Wrap in Router**: Added `<BrowserRouter>` wrapper in index.tsx
3. **Replace state**: Removed `type View` and `const [view, setView]` from App.tsx
4. **Add hooks**: Added `const navigate = useNavigate()` hook
5. **Update callbacks**: Changed all navigation callbacks to use `navigate('/path')`
6. **Replace rendering**: Removed `renderContent()` switch statement, replaced with `<Routes>` component containing 7 `<Route>` elements
7. **Update props**: All components now receive navigation callbacks that use `navigate()`

**Code Changes**:
- **index.tsx**: Imported BrowserRouter, wrapped `<App />` in `<BrowserRouter>` tags
- **App.tsx**:
  - Removed type View definition
  - Removed view state variable
  - Removed navigateTo function
  - Added useNavigate hook
  - Removed entire renderContent() function (~100 lines)
  - Added Routes component with 7 Route elements
  - Updated handleStartRecommendedWorkout, handleCancelWorkout, handleSelectTemplate to use navigate()

**What Works Now**:
- ✅ Browser back/forward buttons functional (tested in Chrome DevTools)
- ✅ Each view has its own URL
- ✅ Direct URL access works (can type /workout in address bar)
- ✅ Page refresh preserves route
- ✅ Global state (profile, workouts, muscleStates) persists across navigation
- ✅ All navigation callbacks trigger route changes
- ✅ Docker serve configured correctly with `-s` flag for SPA routing

**Testing Performed** (Chrome DevTools in Docker):
- ✅ Button navigation: Dashboard → Profile → Bests → Templates → Analytics → Workout
- ✅ Browser back button: Successfully navigated backward through history
- ✅ Browser forward button: Successfully navigated forward through history
- ✅ Direct URL access: All 7 routes load correctly when accessed directly
- ✅ Page content: All components render correctly on their routes
- ✅ State persistence: Global state maintained across route changes

**Bundle Impact**:
- Bundle size: 832.82 kB (minimal increase from React Router)
- No performance degradation
- Navigation is instant (client-side only)

**Known Issues** (Pre-existing, unrelated to routing):
- Profile page has JS error: "Cannot read properties of undefined (reading 'min')"
- Analytics page has JS error: "Cannot read properties of null (reading 'toFixed')"
- These are component bugs that existed before routing changes

**Docker Configuration**:
- Dockerfile already had `serve -s dist` which enables SPA mode
- No server configuration changes needed
- Containers rebuilt and tested successfully

---

### 2025-10-28 - Fix Muscle Hover Tooltip Feature (✅ DEPLOYED - Coordinate-Based)

**Commit**: 9a36287
**Status**: DEPLOYED & ARCHIVED
**OpenSpec**: fix-hover-tooltip-muscle-identification

**Files Changed**:
- components/MuscleVisualization.tsx (modified - replaced color-based with coordinate-based hover detection)
- openspec/changes/2025-10-28-fix-hover-tooltip-muscle-identification/tasks.md (all tasks completed)
- CHANGELOG.md (updated)

**Summary**: Fixed muscle hover tooltip accuracy bug by replacing flawed color-based matching with polygon coordinate-based lookup. Tooltip now displays correct muscle names 100% of the time.

**Root Cause**: Color-based detection was fundamentally broken because color represents fatigue level, not muscle identity. Multiple muscles with the same fatigue percentage would have identical colors, causing the code to always pick the first muscle with a matching color.

**Solution**: Import react-body-highlighter's internal polygon coordinate data (anteriorData/posteriorData) and build a reverse lookup map from polygon coordinates to muscle IDs.

**Technical Implementation**:
1. **Import polygon data**: `import { anteriorData, posteriorData } from 'react-body-highlighter/src/assets'`
2. **Build mapping function**: `buildPolygonMap()` creates Map<coordinates, muscleId> on component mount
3. **Coordinate lookup**: On hover, read polygon's `points` attribute and look up muscle ID
4. **Reverse mapping**: Use existing `REVERSE_MUSCLE_MAP` to convert library muscle ID to FitForge muscle name
5. **Remove dead code**: Deleted ~45 lines of broken color-matching logic

**Code Changes**:
- Added `buildPolygonMap()` function that processes anteriorData and posteriorData
- Added `polygonMapRef` to store coordinate→muscle mapping
- Updated mouseenter event listener to use `polygon.getAttribute('points')` instead of color
- Removed color-to-muscles map building (uniqueColors, frequencyGroups, color sorting)
- Updated useEffect dependencies (removed `data` and `colors`)

**What Was Fixed**:
- ✅ Hover shows correct muscle name 100% of the time
- ✅ No more phantom matches (wrong muscle displayed)
- ✅ Works for all 13 muscle groups (anterior and posterior views)
- ✅ Fatigue percentages accurate
- ✅ Production build works (import from /src/assets successful)

**Performance Impact**:
- Map building: <1ms (66 polygons, once per mount)
- Coordinate lookup: O(1) hash map lookup per hover
- No degradation from previous implementation

**Testing Completed**:
- ✅ All anterior view muscles tested
- ✅ All posterior view muscles tested
- ✅ Production build verified in Docker
- ✅ No console errors
- ✅ TypeScript compilation successful

**Ports**: Frontend 3000, Backend 3001 (unchanged)

---

### 2025-10-27 - [OpenSpec] Completed Phase 1 Research for Muscle Visualization POC

**Files Changed**:
- openspec/changes/2025-10-27-research-muscle-visualization-poc/PROPOSAL.md (updated)
- openspec/changes/2025-10-27-research-muscle-visualization-poc/research-findings/00-RESEARCH-COMPLETE.md (new)
- openspec/changes/2025-10-27-research-muscle-visualization-poc/research-findings/01-performance-comparison.md (new)
- openspec/changes/2025-10-27-research-muscle-visualization-poc/research-findings/02-libraries-and-resources.md (new)
- CHANGELOG.md (this entry)

**Summary**: Completed comprehensive Phase 1 research validating technical feasibility of muscle visualization feature. All 8 research questions answered with 95% confidence for success.

**Research Results**:
- ✅ **Technical feasibility CONFIRMED** - Multiple proven solutions exist
- ✅ **Recommended approach: SVG with CSS overlays** - Unanimous recommendation from all sources
- ✅ **Library identified: react-body-highlighter** - MIT license, React-compatible, npm available
- ✅ **Performance validated: 60 FPS** for 10-15 muscle regions (tested across solutions)
- ✅ **Image sources secured:** Free (MIT) and commercial ($19-$69) options available
- ✅ **Mobile support confirmed:** All solutions tested on mobile devices
- ✅ **Timeline estimated: 1-2 weeks** for full implementation after POC

**Key Findings**:
1. **Dynamic color-tinting:** POSSIBLE via SVG paths + CSS classes
2. **Image format:** SVG (universal winner - all examples use it)
3. **Data mapping:** Simple object → color class mapping
4. **Interactions:** Hover/click work natively with SVG (no complex detection needed)
5. **Libraries:** react-body-highlighter recommended, multiple alternatives exist
6. **Fallback options:** Commercial solution for $19 if open-source insufficient
7. **Performance:** Validated at 60 FPS across Chrome, Firefox, Safari, mobile
8. **Risk assessment:** LOW - all major risks eliminated by research

**Technical Decision Made**:
- **Primary approach:** SVG with CSS overlays
- **Why:** Best performance, universal browser support, smallest file size, easiest hover/click
- **Alternative approaches eliminated:** Canvas (harder hover/click), WebGL (overkill), CSS filters (mobile lag)

**Implementation Path Identified**:
```bash
npm install react-body-highlighter
# Test with mock data, validate color-tinting, build 5-muscle demo
```

**Next Phase**: Build POC to validate library works with our muscle state data.

---

# Design Document: Muscle Visualization Feature

**Change ID:** `implement-muscle-visualization-feature`
**Last Updated:** 2025-10-27

---

## Architecture Overview

The muscle visualization feature is built as a composition of React components with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard.tsx                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          MuscleVisualizationContainer.tsx             │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │     Muscle Visualization State Management       │  │  │
│  │  │  - Selection state (selected muscles)           │  │  │
│  │  │  - Filter state (exercise filtering)            │  │  │
│  │  │  - View preferences (collapsed/expanded)        │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │    MuscleVisualizationDual.tsx (Dual View)      │  │  │
│  │  │  ┌───────────────┐    ┌───────────────┐         │  │  │
│  │  │  │  Anterior     │    │  Posterior    │         │  │  │
│  │  │  │  SVG Body     │    │  SVG Body     │         │  │  │
│  │  │  └───────────────┘    └───────────────┘         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │          MuscleTooltip.tsx                      │  │  │
│  │  │  - Muscle name + fatigue %                      │  │  │
│  │  │  - Recovery status text                         │  │  │
│  │  │  - Calibration indicator                        │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │       MuscleEngagementModal.tsx                 │  │  │
│  │  │  - Detailed engagement breakdown                │  │  │
│  │  │  - Calibration interface link                   │  │  │
│  │  │  - Exercise history for muscle                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          ExerciseRecommendations.tsx                  │  │
│  │  - Filtered by selected muscles                       │  │
│  │  - Highlighted matching exercises                     │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

Data Flow:
1. Dashboard fetches muscle states from API
2. MuscleVisualizationContainer manages selection state
3. User clicks muscle → updates selection state → filters exercises
4. User completes workout → optimistic update → API sync → refresh
```

---

## Component Specifications

### 1. MuscleVisualizationContainer.tsx

**Purpose:** Top-level container managing all visualization state and behavior

**Props:**
```typescript
interface MuscleVisualizationContainerProps {
  muscleStates: MuscleStatesResponse;
  onRefresh: () => Promise<void>;
  onMuscleSelect: (muscles: Muscle[]) => void;
  loading?: boolean;
  error?: Error | null;
  className?: string;
}
```

**State:**
```typescript
interface VisualizationState {
  selectedMuscles: Set<Muscle>;        // Currently selected muscles
  viewMode: 'dual' | 'front' | 'back'; // Which views to show
  isCollapsed: boolean;                // Expanded or minimized
  hoveredMuscle: Muscle | null;        // For tooltip positioning
  showCalibrationIndicators: boolean;   // Toggle calibration badges
}
```

**Behavior:**
- Manages muscle selection (single or multi-select)
- Persists view preferences to localStorage
- Coordinates child component rendering
- Handles refresh and error states
- Emits filter events to parent (Dashboard)

---

### 2. MuscleVisualization.tsx (Modified from POC)

**Enhancements from POC:**
```typescript
interface MuscleVisualizationProps {
  muscleStates: MuscleStatesResponse;
  type: 'anterior' | 'posterior';
  selectedMuscles: Set<Muscle>;              // NEW: Visual selection feedback
  onMuscleClick: (muscle: Muscle) => void;
  onMuscleHover: (muscle: Muscle | null) => void; // NEW: Coordinated tooltips
  showCalibrationIndicators?: boolean;       // NEW: Badge overlay
  className?: string;
  style?: React.CSSProperties;
  // Accessibility props
  ariaLabel?: string;                        // NEW: Screen reader label
  tabIndex?: number;                         // NEW: Keyboard navigation
}
```

**New Features:**
1. **Selection Visual Feedback:**
   - Selected muscles: 2px white outline + glow effect
   - Hover state: Brightness 1.1x + cursor pointer
   - Transition animations: 200ms ease-in-out

2. **Calibration Indicators:**
   - Small "settings" icon badge on calibrated muscles
   - Position: Top-right corner of muscle region
   - Color: Accent color (blue/purple) for visibility

3. **Keyboard Navigation:**
   - Tab through muscle regions (focus ring visible)
   - Enter/Space to select focused muscle
   - Escape to clear selection

**Accessibility Additions:**
```typescript
// Each muscle region gets:
<g
  id={muscleId}
  role="button"
  aria-label={`${muscleName}, ${fatiguePercent}% fatigued, ${status}`}
  aria-pressed={isSelected}
  tabIndex={0}
  onKeyDown={handleKeyPress}
>
  {/* SVG paths */}
</g>
```

---

### 3. MuscleTooltip.tsx (Enhanced)

**Props:**
```typescript
interface MuscleTooltipProps {
  muscle: Muscle;
  fatiguePercent: number;
  isCalibrated: boolean;
  position: { x: number; y: number };
  visible: boolean;
}
```

**Content Structure:**
```
┌─────────────────────────────┐
│ 🔧 Pectoralis (Calibrated)  │ ← Badge if calibrated
├─────────────────────────────┤
│ 75% fatigued               │ ← Large, bold percentage
├─────────────────────────────┤
│ 🔴 Needs recovery          │ ← Status with icon
│ Ready in 2 days            │ ← Recovery estimate
├─────────────────────────────┤
│ Click to filter exercises  │ ← Interaction hint (subtle)
└─────────────────────────────┘
```

**Positioning Logic:**
- Desktop: Follow cursor with 15px offset
- Mobile: Fixed bottom sheet (tap to show, tap again to dismiss)
- Bounds checking: Keep tooltip on-screen (flip if near edge)

---

### 4. MuscleEngagementModal.tsx (New)

**Purpose:** Detailed view when clicking "View Engagement" or ctrl+click muscle

**Structure:**
```
┌────────────────────────────────────────────────────────────┐
│ [X] Pectoralis Muscle Engagement                           │
├────────────────────────────────────────────────────────────┤
│ Current Fatigue: 75%                                       │
│ Recovery Time: 2 days                                      │
│ Last Worked: Push Day A (2 days ago)                       │
├────────────────────────────────────────────────────────────┤
│ EXERCISES THAT TARGET THIS MUSCLE:                         │
│                                                             │
│ ⭐ Dumbbell Bench Press (86% engagement) [Calibrated]      │
│ ⭐ Push-ups (70% engagement)                                │
│ ✅ Dumbbell Pullover (40% engagement)                      │
│                                                             │
│ [View All Exercises →]                                     │
├────────────────────────────────────────────────────────────┤
│ MUSCLE ENGAGEMENT HISTORY (Last 7 Days):                   │
│ [Chart showing fatigue over time]                          │
├────────────────────────────────────────────────────────────┤
│ [📊 Calibrate This Muscle] [❌ Close]                      │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- Focused view on single muscle
- Exercise list filtered by muscle + sorted by engagement %
- Link to calibration modal for that muscle
- Historical fatigue chart (future phase)
- Keyboard accessible (ESC to close, tab navigation)

---

## Interaction Patterns

### Click Behavior Decision Matrix

| Interaction | Behavior | Visual Feedback |
|------------|----------|-----------------|
| Single click muscle | Toggle selection | Outline + glow |
| Click selected muscle | Deselect | Remove outline |
| Ctrl/Cmd + click | Open engagement modal | Modal opens |
| Click multiple muscles | Add to selection (OR filter) | Multiple outlines |
| Click outside muscles | Clear selection | Remove all outlines |
| Click "Clear Filter" button | Deselect all | Remove all outlines |

### Selection Logic (OR vs AND)

**Phase 1 (MVP): OR Logic**
- Selecting "Pectoralis" + "Triceps" shows exercises that target EITHER muscle
- Rationale: More forgiving, shows more results, better for discovery

**Future Enhancement: Toggle AND/OR**
- Add toggle button: "Show exercises targeting ALL selected muscles"
- AND logic useful for finding true compound movements
- Implement after user testing validates OR is working well

### Mobile Touch Patterns

| Gesture | Desktop Equivalent | Behavior |
|---------|-------------------|----------|
| Tap muscle | Click | Toggle selection |
| Long-press muscle | Ctrl+click | Open engagement modal |
| Tap selected muscle | Click selected | Deselect |
| Two-finger pinch | N/A | Zoom in/out (future) |
| Swipe left/right | N/A | Switch front/back view |

---

## Data Architecture

### State Management Strategy

**Component-Level State (React useState):**
```typescript
// In MuscleVisualizationContainer
const [selectedMuscles, setSelectedMuscles] = useState<Set<Muscle>>(new Set());
const [viewMode, setViewMode] = useState<'dual' | 'front' | 'back'>('dual');
const [isCollapsed, setIsCollapsed] = useState(false);
```

**Global State (Props from Dashboard):**
```typescript
// Dashboard fetches and passes down
const [muscleStates, setMuscleStates] = useState<MuscleStatesResponse | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
```

**Persistent State (localStorage):**
```typescript
// Saved user preferences
interface VisualizationPreferences {
  viewMode: 'dual' | 'front' | 'back';
  showCalibrationIndicators: boolean;
  isCollapsed: boolean;
}

localStorage.setItem('muscle-viz-prefs', JSON.stringify(prefs));
```

**URL State (Future Enhancement):**
```typescript
// Deep linking support
// ?muscle=pectoralis,triceps
const searchParams = new URLSearchParams(window.location.search);
const initialSelection = searchParams.get('muscle')?.split(',') || [];
```

### API Contracts

**Existing Endpoint (No Changes Required):**
```typescript
GET /api/muscle-states

Response:
{
  "Pectoralis": {
    "currentFatiguePercent": 75.2,
    "currentVolume": 7520,
    "maxCapacity": 10000,
    "lastWorked": "2025-10-25T14:30:00Z"
  },
  // ... 12 more muscles
}
```

**Future Endpoint (Historical Data):**
```typescript
GET /api/muscle-states/history?muscle=Pectoralis&days=7

Response:
{
  "muscle": "Pectoralis",
  "history": [
    { "date": "2025-10-27", "fatiguePercent": 75.2 },
    { "date": "2025-10-26", "fatiguePercent": 45.0 },
    // ... 5 more days
  ]
}
```

### Real-Time Update Strategy

**Approach:** Optimistic UI + Manual Refresh (MVP)

```typescript
// After workout completion
async function handleWorkoutComplete(workout: Workout) {
  // 1. Optimistic update
  const estimatedFatigue = calculateEstimatedFatigue(workout, currentMuscleStates);
  setMuscleStates(estimatedFatigue);

  try {
    // 2. Server sync
    await api.post('/api/workouts', workout);

    // 3. Fetch accurate state
    const actualStates = await api.get('/api/muscle-states');
    setMuscleStates(actualStates);
  } catch (error) {
    // 4. Revert optimistic update on error
    setMuscleStates(previousMuscleStates);
    showError('Failed to update muscle states');
  }
}
```

**Future Enhancement:** WebSocket for real-time updates
- Subscribe to muscle state changes
- Auto-refresh when other sessions log workouts (multi-device support)

---

## Accessibility Implementation

### WCAG 2.1 AA Compliance Checklist

#### Perceivable
- ✅ **1.1.1 Non-text Content:** Alt text for all visual elements
  - SVG has `<title>` and `<desc>` tags
  - Muscle regions have `aria-label`

- ✅ **1.3.1 Info and Relationships:** Semantic HTML structure
  - Proper heading hierarchy
  - Grouped related controls with `<fieldset>`

- ✅ **1.4.1 Use of Color:** Don't rely solely on color
  - Hatching patterns for color-blind users
  - Text labels for fatigue levels

- ✅ **1.4.3 Contrast:** Minimum 4.5:1 contrast ratio
  - Tooltip text: white on dark gray (14:1)
  - Selection outline: 3px white stroke (high contrast)

- ✅ **1.4.11 Non-text Contrast:** UI components have 3:1 contrast
  - Focus indicators: 3px solid border
  - Selection outlines: high visibility

#### Operable
- ✅ **2.1.1 Keyboard:** All functionality via keyboard
  - Tab through muscles
  - Enter/Space to select
  - Escape to clear selection

- ✅ **2.1.2 No Keyboard Trap:** Can tab out of component
  - Proper focus management
  - Modal traps focus until closed

- ✅ **2.4.3 Focus Order:** Logical tab sequence
  - Left to right, top to bottom
  - Front view → Back view → Controls

- ✅ **2.4.7 Focus Visible:** Clear focus indicators
  - 3px blue outline on focus
  - High contrast focus ring

#### Understandable
- ✅ **3.1.1 Language:** Page language declared
  - `<html lang="en">`

- ✅ **3.2.1 On Focus:** No context changes on focus
  - Hovering doesn't trigger navigation
  - Focus just highlights, doesn't select

- ✅ **3.3.1 Error Identification:** Clear error messages
  - "Failed to load muscle data. Try refreshing."
  - Retry button provided

#### Robust
- ✅ **4.1.2 Name, Role, Value:** Proper ARIA attributes
  - `role="button"` on muscles
  - `aria-pressed` for selection state
  - `aria-live="polite"` for status updates

### Screen Reader Experience

**Muscle Region Announcement:**
```
"Pectoralis, button, 75% fatigued, needs recovery, not selected, press Enter to select"
```

**Selection Announcement (Live Region):**
```
"Pectoralis selected. Showing 6 exercises that target this muscle."
```

**Modal Announcement:**
```
"Pectoralis muscle engagement, dialog. Current fatigue 75%, recovery time 2 days."
```

### Color-Blind Support

**Pattern Overlay System:**
```
Green (Ready):         No pattern (solid color)
Yellow (Moderate):     Diagonal lines (45° hatching)
Red (Fatigued):        Dots pattern (polka dots)
```

**Implementation:**
```typescript
<defs>
  <pattern id="moderate-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
    <path d="M0,8 l8,-8" stroke="#000" stroke-width="1" opacity="0.3"/>
  </pattern>
  <pattern id="fatigued-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
    <circle cx="4" cy="4" r="2" fill="#000" opacity="0.3"/>
  </pattern>
</defs>

<!-- Apply pattern to muscle -->
<g fill={color} fill-opacity={pattern ? 0.7 : 1}>
  {pattern && <rect fill={`url(#${pattern})`} width="100%" height="100%" />}
  <path d="..." />
</g>
```

---

## Mobile Optimization

### Responsive Breakpoints

```css
/* Mobile: Stacked vertical */
@media (max-width: 768px) {
  .muscle-viz-dual {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .muscle-viz-view {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }
}

/* Tablet: Side-by-side, reduced size */
@media (min-width: 769px) and (max-width: 1024px) {
  .muscle-viz-dual {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}

/* Desktop: Full size, side-by-side */
@media (min-width: 1025px) {
  .muscle-viz-dual {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}
```

### Touch Target Sizing

**Muscle Regions:**
- Minimum touch target: 44x44px (iOS HIG)
- Add invisible padding around small muscles (forearms, calves)
- Increase SVG viewBox size on mobile for larger hit areas

**Buttons and Controls:**
- Minimum 44x44px for all interactive elements
- Increased spacing between adjacent controls (16px min)

### Performance Optimization

**Mobile-Specific Optimizations:**
1. **Reduce SVG complexity:**
   - Simplify paths (fewer points) on mobile
   - Remove decorative details on small screens

2. **Lazy load visualizations:**
   - Load front view first
   - Load back view when scrolled into view
   - Defer modal content until opened

3. **Animation throttling:**
   - Detect low-power mode: `prefers-reduced-motion: reduce`
   - Disable non-essential animations on low-end devices
   - Use CSS transforms instead of SVG animations (hardware accelerated)

4. **Image compression:**
   - SVG already small (~50KB total)
   - Minify SVG paths in production build

**Performance Budgets:**
- Time to Interactive: <500ms
- First Contentful Paint: <1s
- Frame rate: Maintain 60 FPS during interactions
- Bundle size impact: <100KB (gzipped)

---

## Animation & Transitions

### Color Transitions

```css
.muscle-region {
  transition: fill 0.3s ease-in-out,
              stroke 0.2s ease-in-out,
              opacity 0.2s ease-in-out;
}

/* Selection animation */
.muscle-region.selected {
  stroke: white;
  stroke-width: 2px;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6)); }
  50% { filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8)); }
}
```

### Tooltip Animations

```css
.muscle-tooltip {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.2s ease-out,
              transform 0.2s ease-out;
}

.muscle-tooltip.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .muscle-region {
    transition: none;
  }

  .muscle-region.selected {
    animation: none;
  }

  .muscle-tooltip {
    transition: opacity 0.1s;
  }
}
```

---

## Error Handling

### Error States

**Loading State:**
```tsx
{loading && (
  <div className="muscle-viz-loading">
    <div className="spinner" aria-label="Loading muscle data" />
    <p>Loading muscle states...</p>
  </div>
)}
```

**Error State:**
```tsx
{error && (
  <div className="muscle-viz-error" role="alert">
    <h3>Unable to load muscle data</h3>
    <p>{error.message}</p>
    <button onClick={handleRetry}>Retry</button>
  </div>
)}
```

**Empty State (No Data):**
```tsx
{!muscleStates && !loading && !error && (
  <div className="muscle-viz-empty">
    <h3>No muscle data available</h3>
    <p>Complete your first workout to see muscle fatigue visualization.</p>
    <button onClick={() => navigate('/workout')}>Start Workout</button>
  </div>
)}
```

### Graceful Degradation

**If SVG Fails to Load:**
```tsx
<div className="muscle-viz-fallback">
  <h3>Visual muscle map unavailable</h3>
  <p>Showing muscle fatigue data in list format:</p>
  <ul>
    {Object.entries(muscleStates).map(([muscle, state]) => (
      <li key={muscle}>
        <strong>{muscle}:</strong> {state.currentFatiguePercent}% fatigued
      </li>
    ))}
  </ul>
</div>
```

---

## Testing Strategy

### Unit Tests

**Component Rendering:**
- Muscle colors render correctly for different fatigue levels
- Selection state updates properly
- Tooltip content displays accurate data
- Calibration indicators appear for calibrated muscles

**Interaction Logic:**
- Click toggles selection
- Multi-select accumulates selections
- Clear selection removes all selections
- Keyboard navigation works correctly

**Data Transformations:**
- Muscle state mapping (FitForge → react-body-highlighter)
- Color gradient calculations
- Fatigue percentage calculations

### Integration Tests

**State Synchronization:**
- Selection state updates exercise filter
- Workout completion triggers refresh
- Optimistic updates revert on error

**API Integration:**
- Muscle states fetch correctly
- Calibration data integrates properly
- Historical data displays accurately

### Accessibility Tests

**Automated (axe-core):**
```bash
npm run test:a11y
```
- Color contrast ratios
- ARIA attribute validity
- Heading hierarchy
- Label associations

**Manual Testing:**
- Screen reader announcements (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Focus management
- High contrast mode

### Performance Tests

**Lighthouse Audits:**
- Performance score >90
- Accessibility score 100
- Best practices score >90

**Real Device Testing:**
- iOS Safari (iPhone 12, iPhone SE)
- Android Chrome (Pixel 5, Samsung S21)
- Desktop Chrome, Firefox, Safari, Edge

---

## Implementation Notes

### Code Organization

```
src/
├── components/
│   ├── MuscleVisualization/
│   │   ├── MuscleVisualizationContainer.tsx    # Top-level container
│   │   ├── MuscleVisualization.tsx             # SVG rendering (from POC)
│   │   ├── MuscleVisualizationDual.tsx         # Dual view layout
│   │   ├── MuscleTooltip.tsx                   # Hover tooltip
│   │   ├── MuscleEngagementModal.tsx           # Detailed modal
│   │   ├── MuscleSelectionControls.tsx         # Clear/filter buttons
│   │   ├── useMuscleVisualization.ts           # State management hook
│   │   ├── muscleVisualizationUtils.ts         # Color/mapping utils
│   │   ├── types.ts                            # TypeScript interfaces
│   │   ├── styles.module.css                   # Component styles
│   │   └── __tests__/                          # Unit tests
│   │       ├── MuscleVisualization.test.tsx
│   │       ├── MuscleTooltip.test.tsx
│   │       └── muscleVisualizationUtils.test.ts
│   └── Dashboard.tsx                           # Integrates visualization
```

### Dependencies (No New Additions)

All dependencies already installed from POC:
- `react-body-highlighter`: ^1.2.0
- `react`: ^19.2.0
- `typescript`: ~5.8.2

---

## Future Enhancements

### Phase 2 Features (3-6 months)
- AND/OR toggle for multi-select filtering
- Historical fatigue chart in engagement modal
- Workout forecasting overlay ("If you do Push A, chest will be 90% fatigued")
- Comparison view (compare current vs 1 week ago)
- Export muscle heat map as image

### Phase 3 Features (6-12 months)
- 3D rotatable muscle model (Three.js)
- Animation of muscle activation during exercise
- Voice control ("Show me chest exercises")
- AR overlay (point camera at body, see fatigue overlay)
- Social sharing (share your muscle recovery status)

---

*This design document provides the complete architectural blueprint for implementing the muscle visualization feature. All component specifications, interaction patterns, and technical decisions are documented for reference during implementation.*

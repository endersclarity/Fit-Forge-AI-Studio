# Design: Enhanced Recovery Dashboard

**Change ID:** `enhance-recovery-dashboard`
**Created:** 2025-10-25

---

## Design Overview

This design document captures architectural decisions for enhancing the Dashboard with workout intelligence features: workout history summary, recovery timeline visualization, and training statistics.

---

## Architecture Decisions

### Decision 1: Pure Frontend Enhancement (No Backend Changes)

**Context:**
All required data already exists in API responses:
- `/api/muscle-states` provides recovery data
- `/api/workouts` provides workout history
- `/api/personal-bests` provides PR data

**Options Considered:**
1. **Create new aggregated API endpoint** (`/api/dashboard-summary`)
   - Pros: Single network request, backend can optimize queries
   - Cons: Adds complexity, requires backend changes, slower development

2. **Use existing APIs, calculate stats in frontend** (CHOSEN)
   - Pros: No backend changes, leverages existing endpoints, faster to implement
   - Cons: Multiple network requests, calculations in React

**Decision:** Use existing APIs with frontend calculations
- Dashboard already fetches all required data
- Performance is acceptable (data sets are small)
- Keeps backend simple and focused
- Aligns with "ship fast, iterate" philosophy

### Decision 2: Component Composition Strategy

**Context:**
Need to add 3 new sections to existing Dashboard without creating unmaintainable monolith.

**Approach:**
Extract new components from Dashboard.tsx:
```
Dashboard.tsx (orchestrator)
  ├── QuickTrainingStats.tsx (NEW)
  ├── WorkoutHistorySummary.tsx (NEW)
  ├── RecoveryTimelineView.tsx (NEW)
  ├── MuscleFatigueHeatMap (EXISTING - stays in Dashboard)
  └── ExerciseRecommendations (EXISTING - stays as is)
```

**Rationale:**
- **QuickTrainingStats**: Pure presentational, receives calculated stats via props
- **WorkoutHistorySummary**: Self-contained, manages own collapse state
- **RecoveryTimelineView**: Transforms muscle states into timeline view
- Keep `MuscleFatigueHeatMap` inline since it's complex and already well-integrated
- Don't touch `ExerciseRecommendations` (recently completed, working well)

### Decision 3: State Management for Collapsible Sections

**Context:**
Multiple collapsible sections need persistent state (remember user's expand/collapse preference).

**Options:**
1. React state only (forgets on refresh)
2. localStorage per section (CHOSEN)
3. Global preferences API

**Decision:** localStorage per section
```typescript
// Pattern for each collapsible section
const [isHistoryExpanded, setIsHistoryExpanded] = useLocalStorage('dashboard-history-expanded', true);
const [isTimelineExpanded, setIsTimelineExpanded] = useLocalStorage('dashboard-timeline-expanded', false);
```

**Rationale:**
- User preference persists across sessions
- No backend changes required
- Simple to implement (use existing `useLocalStorage` hook)
- Each section independent (can be expanded/collapsed separately)

### Decision 4: Mobile-First Responsive Design

**Breakpoint Strategy:**
```css
- Mobile: < 768px (default, collapsed extras)
- Tablet: 768px - 1024px (2-column stats)
- Desktop: > 1024px (3-column stats)
```

**Default States by Screen Size:**
```typescript
// Mobile defaults (< 768px)
- Quick Stats: Expanded (critical info)
- Workout History: Collapsed (save space)
- Recovery Timeline: Collapsed (save space)
- Muscle Heat Map: Expanded (always visible)
- Recommendations: Expanded (always visible)

// Desktop defaults (> 1024px)
- All sections: Expanded (plenty of space)
```

**Implementation:**
- Use Tailwind responsive classes (`md:grid-cols-3`, `lg:col-span-2`)
- Detect screen size with `useMediaQuery` hook
- Conditionally set localStorage defaults on first load

---

## Data Flow Design

### Stats Calculation Flow

```
Dashboard Component
  ↓
Fetch existing APIs (in parallel):
  - GET /api/workouts
  - GET /api/muscle-states
  - GET /api/personal-bests
  ↓
useMemo calculations:
  - calculateStreak(workouts)
  - calculateWeeklyStats(workouts)
  - findRecentPRs(personalBests, workouts)
  - groupMusclesByRecovery(muscleStates)
  ↓
Pass calculated data to child components as props
  ↓
Components render (pure, no side effects)
```

### Calculation Functions

**`calculateStreak(workouts: WorkoutSession[]): number`**
```typescript
// Algorithm:
// 1. Sort workouts by date descending
// 2. Check if workout exists for today
// 3. Count consecutive days backward from today
// 4. Break on first gap > 1 day
// Returns: number of consecutive days
```

**`calculateWeeklyStats(workouts: WorkoutSession[]): { thisWeek: number; lastWeek: number }`**
```typescript
// Algorithm:
// 1. Get current week boundaries (Sunday - Saturday)
// 2. Count workouts in current week
// 3. Get last week boundaries
// 4. Count workouts in last week
// Returns: { thisWeek, lastWeek }
```

**`findRecentPRs(personalBests, workouts): PRHighlight[]`**
```typescript
// Algorithm:
// 1. Get workouts from last 7 days
// 2. Compare each exercise to personal_bests.updated_at
// 3. Filter to PRs set in last 7 days
// 4. Return top 3 by improvement percentage
// Returns: [{ exercise, type: 'single' | 'volume', improvement: number }]
```

**`groupMusclesByRecovery(muscleStates): { ready, recovering, fatigued }`**
```typescript
// Algorithm:
// 1. Transform muscleStates object to array
// 2. Group by daysUntilRecovered:
//    - ready: daysUntilRecovered <= 0
//    - recovering: 0 < daysUntilRecovered <= 2
//    - fatigued: daysUntilRecovered > 2
// 3. Sort each group by muscle name
// Returns: { ready: Muscle[], recovering: Muscle[], fatigued: Muscle[] }
```

---

## Component Specifications

### QuickTrainingStats Component

**Props:**
```typescript
interface QuickTrainingStatsProps {
  streak: number;
  weeklyStats: { thisWeek: number; lastWeek: number };
  recentPRs: PRHighlight[];
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│  🔥 Streak      📊 This Week   🏆 PRs  │
│  5 days         4 workouts      2 new   │
│                 (↑ from 3)              │
└─────────────────────────────────────────┘
```

**Behavior:**
- Purely presentational (no state)
- Responsive grid: 1 column (mobile) → 3 columns (desktop)
- Click PR count → shows toast with PR details
- Animations: Count-up effect on numbers (optional enhancement)

### WorkoutHistorySummary Component

**Props:**
```typescript
interface WorkoutHistorySummaryProps {
  workouts: WorkoutSession[];
  maxDisplay?: number; // default 5
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│ Recent Workouts ▼                       │
├─────────────────────────────────────────┤
│ Today     | Push A    | 45m    | 🎉 PR │
│ Yesterday | Pull B    | 38m    |       │
│ 3 days ago| Legs A    | 52m    |       │
│ 5 days ago| Core      | 20m    |       │
│ 6 days ago| Push B    | 47m    |       │
└─────────────────────────────────────────┘
```

**Behavior:**
- Collapsible section (localStorage state)
- Shows last 5 workouts by default
- "See all history" link → navigates to future History screen (placeholder for now)
- Highlights today's workouts
- Shows PR indicator if workout contained any PRs

### RecoveryTimelineView Component

**Props:**
```typescript
interface RecoveryTimelineViewProps {
  muscleStates: MuscleStatesResponse;
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│ Recovery Timeline ▼                     │
├─────────────────────────────────────────┤
│ ✅ READY NOW (5 muscles)                │
│   • Lats, Biceps, Rhomboids...          │
│                                         │
│ ⏳ RECOVERING SOON (2 muscles)          │
│   • Deltoids (1d), Core (2d)            │
│                                         │
│ 🔴 STILL FATIGUED (3 muscles)           │
│   • Pecs (3d), Triceps (4d)...          │
└─────────────────────────────────────────┘
```

**Behavior:**
- Collapsible section (localStorage state)
- Three groups with visual distinction (icons, colors)
- Click muscle → same modal as heat map (reuse existing modal)
- Shows countdown for recovering muscles
- Auto-updates when muscle states change (via props)

---

## Visual Design System

### Color Palette (Existing FitForge Brand)

**Recovery Status Colors:**
```css
- Ready (Green): text-green-400, bg-green-900/20
- Recovering (Yellow): text-yellow-400, bg-yellow-900/20
- Fatigued (Red): text-red-400, bg-red-900/20
```

**Background Hierarchy:**
```css
- Primary surface: bg-brand-surface (dashboard sections)
- Secondary surface: bg-brand-muted (cards within sections)
- Hover state: hover:bg-brand-surface (interactive elements)
```

**Typography:**
```css
- Section headers: text-lg font-semibold
- Stat labels: text-sm text-slate-400 uppercase tracking-wide
- Stat values: text-2xl font-bold
- Body text: text-sm
- Micro text: text-xs text-slate-500
```

### Spacing & Layout

**Vertical Rhythm:**
```css
- Between major sections: space-y-6 (24px)
- Between cards in section: space-y-3 (12px)
- Internal card padding: p-4 (16px)
```

**Grid Layout (Quick Stats):**
```css
- Mobile: grid-cols-1 gap-3
- Tablet: md:grid-cols-2 gap-4
- Desktop: lg:grid-cols-3 gap-4
```

### Interactive States

**Collapsible Section Headers:**
```css
- Default: bg-brand-muted rounded-t-md
- Hover: bg-brand-surface cursor-pointer
- Expanded: rounded-t-md (content has rounded-b-md)
- Collapsed: rounded-md (full border radius)
- Icon: transform rotate-0 → rotate-180 (transition-transform duration-200)
```

**Workout History Row:**
```css
- Default: bg-brand-muted
- Hover: hover:bg-brand-surface transition-colors
- Today: border-l-4 border-green-400
- Has PR: bg-green-900/10
```

---

## Accessibility Considerations

### Keyboard Navigation
- All collapsible headers: `tabIndex={0}`, `role="button"`, `aria-expanded`
- Workout rows: Focusable, Enter key support
- Stats cards: Informational only (not interactive)

### Screen Reader Support
- Stat values: `aria-label` with full context
  - Example: `aria-label="Current streak: 5 consecutive days with workouts"`
- Collapse buttons: Clear labels
  - Example: `aria-label="Expand workout history section"`
- Dynamic content: `aria-live="polite"` for stat updates

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Status indicators use icons + color (not color alone)
- Focus indicators visible on all interactive elements

---

## Performance Considerations

### Rendering Optimization

**Memoization Strategy:**
```typescript
// Expensive calculations wrapped in useMemo
const streak = useMemo(() => calculateStreak(workouts), [workouts]);
const weeklyStats = useMemo(() => calculateWeeklyStats(workouts), [workouts]);
const recentPRs = useMemo(() => findRecentPRs(personalBests, workouts), [personalBests, workouts]);
const timelineData = useMemo(() => groupMusclesByRecovery(muscleStates), [muscleStates]);

// Pure components wrapped in React.memo
const QuickTrainingStats = React.memo(({ streak, weeklyStats, recentPRs }) => { ... });
const WorkoutHistorySummary = React.memo(({ workouts }) => { ... });
```

**Why This Matters:**
- Dashboard re-renders when any prop changes
- Without memoization, all stats recalculate on every render
- With memoization, recalculate only when dependencies change
- React.memo prevents child re-renders when props haven't changed

### Data Fetching

**Current State (Already Optimized):**
- Dashboard fetches all APIs on mount (parallel requests)
- Data stored in React state
- No polling or auto-refresh (user must manually refresh page)

**No Changes Required:**
- Existing fetch pattern already optimal
- Adding new sections doesn't add network requests
- All data already available in component

### Bundle Size Impact

**Estimated Impact:**
- New components: ~3-4 KB (gzipped)
- Calculation functions: ~2 KB (gzipped)
- Total: ~5-6 KB increase (negligible)

**No New Dependencies:**
- All functionality uses existing React, TypeScript, Tailwind
- No date libraries needed (use native Date)
- No charting libraries (future enhancement)

---

## Testing Strategy

### Unit Testing (Future)

**Calculation Functions:**
```typescript
describe('calculateStreak', () => {
  it('returns 0 for no workouts');
  it('returns 1 for workout today only');
  it('returns 5 for 5 consecutive days');
  it('breaks streak on gap day');
  it('handles timezone edge cases');
});

describe('calculateWeeklyStats', () => {
  it('counts workouts in current week');
  it('handles week boundaries correctly');
  it('compares to previous week');
});

describe('groupMusclesByRecovery', () => {
  it('groups by daysUntilRecovered thresholds');
  it('handles muscles never trained');
  it('sorts groups alphabetically');
});
```

### Manual Testing Checklist

**Functional Testing:**
- [ ] Stats display correctly on first load
- [ ] Workout history shows last 5 workouts
- [ ] Recovery timeline groups muscles correctly
- [ ] Collapse/expand persists across page refresh
- [ ] Mobile layout doesn't overflow horizontally
- [ ] Desktop shows 3-column stat layout

**Edge Cases:**
- [ ] New user with no workouts (graceful empty states)
- [ ] User with 100+ workouts (performance check)
- [ ] Muscles never trained (show as "Ready")
- [ ] All muscles fatigued (timeline shows all red)
- [ ] Workout done today (highlight in history)

**Accessibility:**
- [ ] Keyboard navigation works for all sections
- [ ] Screen reader announces stats correctly
- [ ] Focus indicators visible
- [ ] Color contrast meets standards

---

## Migration & Rollout

### Implementation Phases

**Phase 1: Quick Training Stats (2-3 hours)**
- Implement calculation functions
- Create QuickTrainingStats component
- Add to Dashboard above existing content
- Test on desktop and mobile

**Phase 2: Workout History Summary (2-3 hours)**
- Create WorkoutHistorySummary component
- Implement collapsible behavior
- Add localStorage persistence
- Test with varying workout counts

**Phase 3: Recovery Timeline (3-4 hours)**
- Create RecoveryTimelineView component
- Implement grouping logic
- Connect to existing muscle modal
- Test with different fatigue states

**Phase 4: Polish & Responsive (2-3 hours)**
- Fine-tune mobile layouts
- Add animations/transitions
- Test on multiple devices
- Accessibility audit

**Total Estimated Time: 10-13 hours**

### Rollback Plan

**If Issues Arise:**
1. New components are isolated (easy to remove)
2. No database changes (nothing to migrate back)
3. No API changes (no version conflicts)
4. Can hide sections with CSS if needed
5. Revert commit if critical bugs found

**Low Risk:**
- Pure additive changes
- No breaking changes to existing features
- Can ship incrementally (one section at a time)

---

## Future Extensibility

### Hooks for Future Features

**Design Hooks Included:**
1. **"See all history" placeholder** in WorkoutHistorySummary
   - Future: Navigate to dedicated History screen
   - Current: Shows toast "Coming soon"

2. **PR click handler** in QuickTrainingStats
   - Future: Open PR details modal
   - Current: Shows toast with PR list

3. **Recovery timeline groups** are component-ready
   - Future: Calendar view can use same grouping logic
   - Current: Simple list view

### Data Structure Stability

**All calculations use stable interfaces:**
```typescript
// These types don't change (from types.ts)
WorkoutSession
MuscleStatesResponse
PersonalBestData

// Calculation functions have clear contracts
calculateStreak(workouts) → number
calculateWeeklyStats(workouts) → { thisWeek, lastWeek }
```

**Future features can:**
- Add new calculation functions without breaking existing ones
- Extend stats without touching workout/recovery sections
- Replace components independently (loose coupling)

---

## Security & Privacy

### Data Handling

**No New Security Concerns:**
- All data already exposed via existing APIs
- No new data collection
- No external services called
- No user data sent anywhere

**localStorage Usage:**
- Only stores UI preferences (collapse states)
- No sensitive data in localStorage
- User can clear anytime via browser

### Single-User Design

**Assumptions:**
- App runs locally only (already true)
- No multi-user considerations needed
- No authentication/authorization changes

---

*This design provides a clear blueprint for implementation while maintaining FitForge's principles of simplicity, intelligence, and user-focused design.*

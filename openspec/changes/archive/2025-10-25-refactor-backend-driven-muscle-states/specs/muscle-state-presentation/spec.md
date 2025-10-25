# Spec: Muscle State Presentation

**Capability:** `muscle-state-presentation`
**Status:** Modified (Breaking Changes)
**Change:** refactor-backend-driven-muscle-states

---

## Overview

Frontend presentation layer SHALL display muscle state data directly from backend API responses with zero calculation logic. Components become pure presentation, trusting backend completely for all computed values.

---

## MODIFIED Requirements

### Requirement: Display Current Fatigue from API Response

**Description:** Frontend SHALL display current fatigue percentage directly from backend-calculated `currentFatiguePercent` field, removing all local time-based calculations.

**Acceptance Criteria:**
- No calculation of current fatigue in frontend code
- Direct access to `muscleStates[muscleName].currentFatiguePercent`
- Value displayed with 1 decimal place (e.g., "25.5%")
- No local time-based decay formulas
- No recovery percentage calculations (was `100 - recovery`)

#### Scenario: Dashboard displays backend-calculated fatigue

**Given:** Backend returns `{Triceps: {currentFatiguePercent: 25.5, ...}}`
**When:** Dashboard component renders muscle card
**Then:** Display shows "Triceps: 25.5% fatigued"
**And:** No frontend calculation performed
**And:** Value matches backend response exactly

#### Scenario: Never-trained muscle displays zero

**Given:** Backend returns `{Forearms: {currentFatiguePercent: 0, lastTrained: null, ...}}`
**When:** Dashboard component renders muscle card
**Then:** Display shows "Forearms: 0% fatigued" or "Never trained"
**And:** No error or NaN displayed

---

### Requirement: Display Recovery Status from API Response

**Description:** Frontend SHALL display recovery status using backend-calculated `recoveryStatus` enum value, removing local status determination logic.

**Acceptance Criteria:**
- Status accessed directly: `muscleStates[muscleName].recoveryStatus`
- Three status values: "ready", "recovering", "fatigued"
- Color coding: ready (green), recovering (yellow), fatigued (red)
- No local threshold comparisons (was `fatigue < 33 ? 'ready' : ...`)

#### Scenario: Display ready status as green

**Given:** Backend returns `{Pectoralis: {recoveryStatus: 'ready', currentFatiguePercent: 25.5}}`
**When:** Dashboard renders status badge
**Then:** Badge displays "Ready" in green color
**And:** Progress bar is green
**And:** No local calculation of status

#### Scenario: Display recovering status as yellow

**Given:** Backend returns `{Quadriceps: {recoveryStatus: 'recovering', currentFatiguePercent: 50}}`
**When:** Dashboard renders status badge
**Then:** Badge displays "Recovering" in yellow color
**And:** Progress bar is yellow

#### Scenario: Display fatigued status as red

**Given:** Backend returns `{Lats: {recoveryStatus: 'fatigued', currentFatiguePercent: 75}}`
**When:** Dashboard renders status badge
**Then:** Badge displays "Fatigued" in red color
**And:** Progress bar is red

---

### Requirement: Display Days Until Recovered from API Response

**Description:** Frontend SHALL display "Ready in X days" text using backend-calculated `daysUntilRecovered` value.

**Acceptance Criteria:**
- Direct access to `muscleStates[muscleName].daysUntilRecovered`
- Display "Ready now" if value is 0
- Display "Ready in X.X days" if value > 0
- No local calculation of remaining recovery time

#### Scenario: Display ready now for recovered muscle

**Given:** Backend returns `{Deltoids: {daysUntilRecovered: 0.0, recoveryStatus: 'ready'}}`
**When:** Dashboard renders recovery time text
**Then:** Display shows "Ready now"
**And:** No countdown or timer logic

#### Scenario: Display days remaining for recovering muscle

**Given:** Backend returns `{Triceps: {daysUntilRecovered: 2.9, recoveryStatus: 'recovering'}}`
**When:** Dashboard renders recovery time text
**Then:** Display shows "Ready in 2.9 days"
**And:** No local calculation performed

---

### Requirement: Fetch Muscle States on Component Mount

**Description:** Dashboard component SHALL fetch fresh muscle states from backend when component mounts, ensuring up-to-date data on navigation.

**Acceptance Criteria:**
- useEffect hook triggers fetch on mount
- Empty dependency array (runs once on mount)
- Fetches from GET `/api/muscle-states` endpoint
- Updates local React state with response
- Loading state displayed during fetch

#### Scenario: Auto-refresh when navigating to Dashboard

**Given:** User is on Workout page
**When:** User navigates to Dashboard page
**Then:** Dashboard component mounts
**And:** useEffect triggers GET `/api/muscle-states`
**And:** Loading spinner displays while fetching
**And:** Heat map displays with fresh data after fetch completes

#### Scenario: Fetch includes all 13 muscles

**Given:** Backend returns data for all 13 muscle groups
**When:** Dashboard fetches muscle states
**Then:** Local state contains all 13 muscles
**And:** Each muscle has 7 fields populated
**And:** No missing or undefined values

---

## ADDED Requirements

### Requirement: Manual Refresh Button

**Description:** Frontend SHALL provide manual refresh button for users to fetch latest muscle states on-demand.

**Acceptance Criteria:**
- Button visible in Dashboard header/toolbar
- Button triggers same fetch as auto-refresh
- Button labeled "🔄 Refresh" or similar
- No automatic periodic polling (YAGNI)
- Button disabled during loading state

#### Scenario: User clicks refresh button

**Given:** User is viewing Dashboard with stale data
**When:** User clicks "🔄 Refresh" button
**Then:** Frontend calls GET `/api/muscle-states`
**And:** Loading spinner displays
**And:** Heat map updates with fresh data
**And:** Button disabled during fetch, re-enabled after

#### Scenario: Refresh updates all muscles

**Given:** Muscle states were fetched 1 hour ago
**When:** User clicks refresh button
**Then:** Backend recalculates current fatigue for all muscles
**And:** Frontend displays updated percentages
**And:** Days elapsed values are current

---

### Requirement: Loading State During Fetch

**Description:** Frontend SHALL display loading indicator while fetching muscle states from backend.

**Acceptance Criteria:**
- Loading state managed by React useState
- Loading spinner/skeleton displayed during fetch
- Heat map hidden or grayed out during loading
- Error state if fetch fails
- Loading state cleared after response or error

#### Scenario: Show loading spinner during fetch

**Given:** User navigates to Dashboard
**When:** Component mounts and triggers fetch
**Then:** Loading spinner displays
**And:** Heat map is hidden or shows skeleton
**And:** Spinner disappears after data loads

#### Scenario: Show error state on fetch failure

**Given:** Backend is down or unreachable
**When:** Fetch fails with network error
**Then:** Error message displays: "Failed to load muscle states"
**And:** Retry button available
**And:** Heat map does not render

---

### Requirement: Use New TypeScript Response Type

**Description:** Frontend SHALL use new `MuscleStateResponse` TypeScript interface matching backend API contract.

**Type Definition:**
```typescript
interface MuscleStateResponse {
  currentFatiguePercent: number;
  initialFatiguePercent: number;
  lastTrained: string | null;
  daysElapsed: number | null;
  estimatedRecoveryDays: number;
  daysUntilRecovered: number;
  recoveryStatus: 'ready' | 'recovering' | 'fatigued';
}

type MuscleStatesResponse = Record<Muscle, MuscleStateResponse>;
```

**Acceptance Criteria:**
- useState typed with `MuscleStatesResponse`
- Type checking prevents accessing non-existent fields
- Autocomplete works for all 7 response fields
- Old `MuscleState` type marked `@deprecated`

#### Scenario: TypeScript enforces correct field access

**Given:** Developer writes component code
**When:** Developer accesses `muscleStates.Triceps.currentFatiguePercent`
**Then:** TypeScript compiler allows access (field exists)
**And:** Autocomplete suggests all 7 fields

#### Scenario: TypeScript prevents accessing old fields

**Given:** Developer tries to access `muscleStates.Triceps.fatiguePercentage` (old field)
**When:** TypeScript compiler runs
**Then:** Compilation error: "Property 'fatiguePercentage' does not exist"
**And:** Developer is forced to use `currentFatiguePercent`

---

## REMOVED Requirements

### Requirement: Remove Frontend Time-Based Calculations

**Description:** Frontend SHALL NOT calculate current fatigue, recovery percentages, or days until recovered locally.

**Functions to Remove:**
- `calculateRecoveryPercentage(daysElapsed, recoveryDaysNeeded)`
- `getDaysSince(timestamp)`
- `calculateDaysUntilReady(daysElapsed, recoveryDays)`
- Any function computing `100 - recovery`

**Acceptance Criteria:**
- No time-based calculation functions exist in frontend
- No recovery formula implementations in components
- No comparison of current time to last trained time
- Grep search returns zero results for calculation patterns

#### Scenario: No recovery calculation functions in codebase

**Given:** Frontend refactor is complete
**When:** Developer runs `grep -r "calculateRecovery" --include="*.tsx" --include="*.ts"`
**Then:** Search returns zero results (or only deprecated JSDoc references)

#### Scenario: No manual time calculations in components

**Given:** Developer inspects Dashboard.tsx
**When:** Searching for time calculations
**Then:** No `Date.now()`, `getDaysSince()`, or time arithmetic found
**And:** Only API field access: `state.daysElapsed`, `state.daysUntilRecovered`

---

### Requirement: Remove Old MuscleState Type

**Description:** Frontend SHALL remove deprecated `MuscleState` TypeScript interface after all components migrated.

**Old Type (to remove in Phase 5):**
```typescript
/**
 * @deprecated Use MuscleStateResponse from API instead
 */
interface MuscleState {
  lastTrained: number;
  fatiguePercentage: number;
  recoveryDaysNeeded: number;
}
```

**Acceptance Criteria:**
- Type removed from `types.ts`
- No components reference this type
- TypeScript compilation succeeds without it
- Removal happens in Phase 5 after all component updates

#### Scenario: Old type removed after migration

**Given:** All components updated to use `MuscleStateResponse`
**And:** Phase 5 cleanup begins
**When:** Developer removes `MuscleState` interface
**Then:** TypeScript compilation succeeds
**And:** No components broken by removal

---

## Component Updates

### Dashboard.tsx

**Changes:**
- ❌ Remove: `calculateRecoveryPercentage()` calls
- ❌ Remove: `getDaysSince()` calls
- ❌ Remove: Manual `fatiguePercent = 100 - recovery` calculation
- ❌ Remove: Manual status determination
- ✅ Add: `fetchMuscleStates()` function
- ✅ Add: `useEffect(() => fetchMuscleStates(), [])`
- ✅ Add: Refresh button with onClick handler
- ✅ Add: Loading/error state management

**Code Example:**
```typescript
function Dashboard() {
  const [muscleStates, setMuscleStates] = useState<MuscleStatesResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMuscleStates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/muscle-states');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMuscleStates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMuscleStates();
  }, []);

  return (
    <div>
      <button onClick={fetchMuscleStates}>🔄 Refresh</button>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay error={error} onRetry={fetchMuscleStates} />}
      {!loading && !error && (
        <MuscleCategory>
          {muscle => {
            const state = muscleStates[muscle];
            return (
              <MuscleCard
                name={muscle}
                fatiguePercent={state.currentFatiguePercent}  // ← Direct from API
                status={state.recoveryStatus}                  // ← Direct from API
                daysUntilRecovered={state.daysUntilRecovered}  // ← Direct from API
              />
            );
          }}
        </MuscleCategory>
      )}
    </div>
  );
}
```

### Workout.tsx

**Changes:**
- Update muscle state save to use `initial_fatigue_percent`
- Update API call to match new request format
- No calculation logic changes (already calculates initial fatigue from volume)

### WorkoutSummaryModal.tsx

**Changes:**
- Use `state.currentFatiguePercent` instead of calculating
- Use `state.recoveryStatus` for color coding
- Remove any local time calculations

---

## Implementation Notes

**Files to Modify:**
- `components/Dashboard.tsx` - Main refactor
- `components/Workout.tsx` - Update save format
- `components/WorkoutSummaryModal.tsx` - Use API fields
- `types.ts` - Add new types, mark old types `@deprecated`
- `utils/helpers.ts` - Remove calculation functions (Phase 5)

**Testing:**
```
1. Navigate to Dashboard → auto-refresh works
2. Click refresh button → data updates
3. Never-trained muscle → displays "Never trained"
4. Partially recovered muscle → shows correct percentage
5. Fully recovered muscle → shows "Ready now"
6. Status badges → correct colors (green/yellow/red)
```

---

*Spec version 1.0 - 2025-10-25*

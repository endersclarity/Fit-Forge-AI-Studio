# FitForge Local - Entity Relationship Diagram (POST-REFACTOR)

**Document Version:** 2.0 (Backend-Driven Architecture)
**Status:** Proposed (Implementation Pending)
**Based On:** ARCHITECTURE-REFACTOR-BACKEND-DRIVEN.md v1.1
**Created:** 2025-10-25

---

## Database Schema ERD (Post-Refactor)

```mermaid
erDiagram
    USERS ||--o{ WORKOUTS : has
    USERS ||--o{ BODYWEIGHT_HISTORY : tracks
    USERS ||--o{ EQUIPMENT : owns
    USERS ||--o{ MUSCLE_STATES : monitors
    USERS ||--o{ PERSONAL_BESTS : achieves
    USERS ||--o{ MUSCLE_BASELINES : sets
    USERS ||--o{ WORKOUT_TEMPLATES : creates
    WORKOUTS ||--o{ EXERCISE_SETS : contains

    USERS {
        INTEGER id PK
        TEXT name
        TEXT experience
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    BODYWEIGHT_HISTORY {
        INTEGER id PK
        INTEGER user_id FK
        TEXT date
        REAL weight
        TIMESTAMP created_at
    }

    EQUIPMENT {
        INTEGER id PK
        INTEGER user_id FK
        TEXT name
        REAL min_weight
        REAL max_weight
        REAL weight_increment
        TIMESTAMP created_at
    }

    WORKOUTS {
        INTEGER id PK
        INTEGER user_id FK
        TEXT date
        TEXT category
        TEXT variation
        TEXT progression_method
        INTEGER duration_seconds
        TIMESTAMP created_at
    }

    EXERCISE_SETS {
        INTEGER id PK
        INTEGER workout_id FK
        TEXT exercise_name
        REAL weight
        INTEGER reps
        INTEGER set_number
        INTEGER to_failure
        TIMESTAMP created_at
    }

    MUSCLE_STATES {
        INTEGER id PK
        INTEGER user_id FK
        TEXT muscle_name
        REAL initial_fatigue_percent "RENAMED-FROM-fatigue_percent"
        REAL volume_today
        TEXT last_trained "UTC-ISO-8601"
        TIMESTAMP updated_at
    }

    PERSONAL_BESTS {
        INTEGER id PK
        INTEGER user_id FK
        TEXT exercise_name UK
        REAL best_single_set
        REAL best_session_volume
        REAL rolling_average_max
        TIMESTAMP updated_at
    }

    MUSCLE_BASELINES {
        INTEGER id PK
        INTEGER user_id FK
        TEXT muscle_name UK
        REAL system_learned_max
        REAL user_override
        TIMESTAMP updated_at
    }

    WORKOUT_TEMPLATES {
        INTEGER id PK
        INTEGER user_id FK
        TEXT name
        TEXT category
        TEXT variation
        TEXT exercise_ids
        INTEGER is_favorite
        INTEGER times_used
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
```

---

## Key Schema Changes from Pre-Refactor

### MUSCLE_STATES Table Changes

**REMOVED Fields:**
- ❌ `recovered_at TEXT` - Always null, unused, removed as dead code

**RENAMED Fields:**
- ✏️ `fatigue_percent` → `initial_fatigue_percent` - Semantic clarity (stores fatigue at time of workout, not current fatigue)

**CONSTRAINT Changes:**
- ✏️ `UNIQUE(muscle_name)` → `UNIQUE(user_id, muscle_name)` - **CRITICAL BUG FIX** for multi-user support

**Updated Schema Definition:**

```sql
CREATE TABLE muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  initial_fatigue_percent REAL NOT NULL DEFAULT 0,  -- ← RENAMED: fatigue at workout time
  volume_today REAL NOT NULL DEFAULT 0,              -- Kept for future same-day tracking
  last_trained TEXT,                                 -- UTC ISO timestamp
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)                       -- ← FIXED: Composite constraint
);

CREATE INDEX idx_muscle_states_user ON muscle_states(user_id);
```

---

## Service Layer Models (Post-Refactor)

```mermaid
classDiagram
    class Exercise {
        +string id
        +string name
        +ExerciseCategory category
        +Equipment[] equipment
        +Difficulty difficulty
        +MuscleEngagement[] muscleEngagements
        +Variation variation
    }

    class MuscleEngagement {
        +Muscle muscle
        +number percentage
    }

    class WorkoutSession {
        +string id
        +string name
        +ExerciseCategory type
        +string variation
        +number startTime
        +number endTime
        +LoggedExercise[] loggedExercises
        +Record~Muscle-number~ muscleFatigueHistory
    }

    class LoggedExercise {
        +string id
        +string exerciseId
        +LoggedSet[] sets
    }

    class LoggedSet {
        +string id
        +number reps
        +number weight
        +number bodyweightAtTime
        +boolean to_failure
    }

    class UserProfile {
        +string name
        +number height
        +number age
        +Difficulty experience
        +WeightEntry[] bodyweightHistory
        +EquipmentItem[] equipment
    }

    class WeightEntry {
        +number date
        +number weight
    }

    class EquipmentItem {
        +string id
        +Equipment type
        +object weightRange
        +number quantity
        +EquipmentIncrement increment
    }

    class MuscleStateResponse {
        +number currentFatiguePercent
        +number initialFatiguePercent
        +string lastTrained
        +number daysElapsed
        +number estimatedRecoveryDays
        +number daysUntilRecovered
        +RecoveryStatus recoveryStatus
    }

    class MuscleStateUpdate {
        +number initial_fatigue_percent
        +string last_trained
        +number volume_today
    }

    class MuscleBaseline {
        +number systemLearnedMax
        +number userOverride
    }

    class ExerciseMaxes {
        +number bestSingleSet
        +number bestSessionVolume
        +number rollingAverageMax
    }

    class WorkoutTemplate {
        +string id
        +string name
        +ExerciseCategory category
        +string variation
        +string[] exerciseIds
        +boolean isFavorite
        +number timesUsed
        +number createdAt
        +number updatedAt
    }

    Exercise --> MuscleEngagement
    WorkoutSession --> LoggedExercise
    LoggedExercise --> LoggedSet
    UserProfile --> WeightEntry
    UserProfile --> EquipmentItem

    note for MuscleStateResponse "NEW: Backend-calculated response\nReplaces client-side calculations"
    note for MuscleStateUpdate "NEW: Request format for PUT\nUses initial_fatigue_percent"
```

---

## Backend-Driven Architecture Data Flow

```mermaid
flowchart TB
    subgraph Frontend["React Frontend (Presentation Layer)"]
        Dashboard[Dashboard Component]
        Workout[Workout Component]
        Profile[Profile Component]
        PersonalBests[PersonalBests Component]
        Templates[WorkoutTemplates Component]
        PRNotification[PRNotification Component]
    end

    subgraph Hooks["Custom Hooks (No Calculation Logic)"]
        useAPIState[useAPIState Hook]
        note1["Fetches data, no calculations"]
    end

    subgraph API["API Client Layer"]
        APIClient[api.ts]
        note2["Simple HTTP wrapper"]
    end

    subgraph Backend["Express Backend (Calculation Engine)"]
        Server[server.ts]
        CalcEngine[Calculation Engine]
        Database[database.ts]
        note3["ALL time-based calculations happen here"]
    end

    subgraph SQLite["SQLite Database (Immutable Facts)"]
        Tables[(Database Tables)]
        note4["Stores what happened, not current state"]
    end

    Dashboard --> useAPIState
    Workout --> useAPIState
    Profile --> useAPIState
    PersonalBests --> useAPIState
    Templates --> useAPIState
    PRNotification --> useAPIState

    useAPIState --> APIClient
    APIClient -->|HTTP GET/PUT| Server
    Server --> CalcEngine
    CalcEngine --> Database
    Database --> Tables

    CalcEngine -.->|Returns calculated values| Server
    Server -.->|JSON Response| APIClient
    APIClient -.->|Parsed data| useAPIState
    useAPIState -.->|State update| Dashboard

    style CalcEngine fill:#90EE90
    style note1 fill:#FFF9C4
    style note2 fill:#FFF9C4
    style note3 fill:#FFF9C4
    style note4 fill:#FFF9C4
```

---

## New API Contract (Backend-Driven)

### GET /api/muscle-states (Enhanced Response)

**Purpose:** Return current muscle state with ALL calculated values

**Response Format:**

```json
{
  "Pectoralis": {
    "currentFatiguePercent": 25.5,
    "initialFatiguePercent": 51.0,
    "lastTrained": "2025-10-24T18:30:00.000Z",
    "daysElapsed": 1.2,
    "estimatedRecoveryDays": 4.1,
    "daysUntilRecovered": 2.9,
    "recoveryStatus": "ready"
  },
  "Triceps": {
    "currentFatiguePercent": 42.3,
    "initialFatiguePercent": 51.0,
    "lastTrained": "2025-10-24T18:30:00.000Z",
    "daysElapsed": 1.2,
    "estimatedRecoveryDays": 4.1,
    "daysUntilRecovered": 2.9,
    "recoveryStatus": "recovering"
  },
  "Lats": {
    "currentFatiguePercent": 0,
    "initialFatiguePercent": 0,
    "lastTrained": null,
    "daysElapsed": null,
    "estimatedRecoveryDays": 1.0,
    "daysUntilRecovered": 0,
    "recoveryStatus": "ready"
  }
  // ... other 10 muscles
}
```

**Field Breakdown:**

| Field | Type | Source | Calculation Logic |
|-------|------|--------|-------------------|
| `currentFatiguePercent` | number | **CALCULATED** | `initialFatigue * (1 - daysElapsed / recoveryDays)` capped at 0-100 |
| `initialFatiguePercent` | number | **DATABASE** | Stored value from last workout |
| `lastTrained` | string\|null | **DATABASE** | UTC ISO-8601 timestamp |
| `daysElapsed` | number\|null | **CALCULATED** | `(now - lastTrained) / (1000*60*60*24)` or null if never trained |
| `estimatedRecoveryDays` | number | **CALCULATED** | `1 + (initialFatigue / 100) * 6` |
| `daysUntilRecovered` | number | **CALCULATED** | `max(0, recoveryDays - daysElapsed)` |
| `recoveryStatus` | enum | **CALCULATED** | `<= 33%: 'ready'`, `<= 66%: 'recovering'`, `> 66%: 'fatigued'` |

---

### PUT /api/muscle-states (New Request Format)

**Purpose:** Update muscle states after workout (stores initial fatigue, returns calculated current state)

**Request Format:**

```json
{
  "Pectoralis": {
    "initial_fatigue_percent": 25.5,
    "last_trained": "2025-10-24T18:30:00.000Z",
    "volume_today": 2550
  },
  "Triceps": {
    "initial_fatigue_percent": 51.0,
    "last_trained": "2025-10-24T18:30:00.000Z",
    "volume_today": 5100
  }
}
```

**Response:** Same as GET /api/muscle-states (returns calculated current state for ALL muscles)

**Backend Logic Flow:**

```mermaid
sequenceDiagram
    participant F as Frontend
    participant A as API Server
    participant C as Calculation Engine
    participant D as Database

    F->>A: PUT /api/muscle-states<br/>{Triceps: {initial_fatigue: 51, ...}}
    A->>D: UPDATE muscle_states SET<br/>initial_fatigue_percent=51,<br/>last_trained='2025-10-24T18:30:00Z'
    D-->>A: Update successful
    A->>D: SELECT * FROM muscle_states
    D-->>A: All muscle records
    A->>C: Calculate current state for all muscles
    C->>C: For each muscle:<br/>- Calculate daysElapsed<br/>- Calculate recoveryDays<br/>- Apply decay formula<br/>- Determine status
    C-->>A: Calculated muscle states
    A-->>F: JSON response with all calculated fields
    F->>F: Update React state<br/>Trigger re-render
```

---

## TypeScript Type Definitions (Post-Refactor)

### New Backend Response Types

```typescript
// types.ts - Backend-Calculated API Response
export interface MuscleStateResponse {
  // CALCULATED FIELDS (Backend computes these)
  currentFatiguePercent: number;      // 0-100, 1 decimal place
  daysElapsed: number | null;          // >= 0 or null if never trained
  estimatedRecoveryDays: number;      // >= 0, 1 decimal place
  daysUntilRecovered: number;         // >= 0, 1 decimal place
  recoveryStatus: 'ready' | 'recovering' | 'fatigued';

  // STORED FIELDS (From database)
  initialFatiguePercent: number;      // 0-100
  lastTrained: string | null;         // ISO 8601 UTC or null
}

export type MuscleStatesResponse = Record<Muscle, MuscleStateResponse>;
```

### New Backend Request Types

```typescript
// types.ts - API Request for updating muscle states
export interface MuscleStateUpdate {
  initial_fatigue_percent: number;    // ← Note: snake_case to match DB column
  last_trained: string;                // ISO 8601 UTC
  volume_today?: number;               // Optional
}

export type MuscleStatesUpdateRequest = Partial<Record<Muscle, MuscleStateUpdate>>;
```

### Deprecated Types (Remove in Phase 5)

```typescript
/**
 * @deprecated Use MuscleStateResponse from API instead
 * This type will be removed after frontend refactor is complete
 */
export interface MuscleState {
  lastTrained: number;
  fatiguePercentage: number;
  recoveryDaysNeeded: number;
}

export type MuscleStates = Record<Muscle, MuscleState>;
```

---

## Recovery Formula Implementation

### Backend Calculation Logic

```typescript
// backend/server.ts - GET /api/muscle-states handler
function getMuscleStates(): MuscleStatesResponse {
  const now = Date.now();
  const muscles = db.query('SELECT * FROM muscle_states WHERE user_id = 1');

  return muscles.reduce((acc, muscle) => {
    // Handle never-trained muscles
    const lastTrainedDate = muscle.last_trained ? new Date(muscle.last_trained).getTime() : null;
    const daysElapsed = lastTrainedDate
      ? (now - lastTrainedDate) / (1000 * 60 * 60 * 24)
      : null;

    // Recovery formula: 1 base day + up to 6 days based on fatigue
    // Examples: 0% → 1 day, 50% → 4 days, 100% → 7 days
    const recoveryDays = 1 + (muscle.initial_fatigue_percent / 100) * 6;

    // Linear decay: fatigue decreases linearly over recovery period
    const currentFatigue = lastTrainedDate && daysElapsed !== null
      ? Math.max(0, muscle.initial_fatigue_percent * (1 - daysElapsed / recoveryDays))
      : 0;

    const daysUntilRecovered = lastTrainedDate && daysElapsed !== null
      ? Math.max(0, recoveryDays - daysElapsed)
      : 0;

    // Recovery status thresholds
    const recoveryStatus = currentFatigue <= 33 ? 'ready'
      : currentFatigue <= 66 ? 'recovering'
      : 'fatigued';

    acc[muscle.muscle_name] = {
      // Calculated fields (rounded to 1 decimal)
      currentFatiguePercent: Math.round(currentFatigue * 10) / 10,
      daysElapsed: daysElapsed !== null ? Math.round(daysElapsed * 10) / 10 : null,
      estimatedRecoveryDays: Math.round(recoveryDays * 10) / 10,
      daysUntilRecovered: Math.round(daysUntilRecovered * 10) / 10,
      recoveryStatus,

      // Stored fields (from database)
      initialFatiguePercent: muscle.initial_fatigue_percent,
      lastTrained: muscle.last_trained
    };

    return acc;
  }, {} as MuscleStatesResponse);
}
```

### Recovery Curve Visualization

```
Fatigue %
  100 │     ●                    initialFatigue = 100%
      │      ╲                   recoveryDays = 7
      │       ╲
   75 │        ╲
      │         ╲
   50 │          ●                initialFatigue = 50%
      │           ╲               recoveryDays = 4
   25 │            ╲
      │             ╲
    0 │______________●_______     Fully recovered
      0   1   2   3   4   5   6   7
              Days Elapsed

Formula: currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)
```

---

## Frontend Simplification (Post-Refactor)

### Dashboard.tsx - Before Refactor (Complex)

```typescript
// ❌ OLD CODE: ~50 lines of calculation logic
function Dashboard() {
  const [muscleStates] = useAPIState<MuscleStates>('/api/muscle-states');

  // Complex calculations needed because API returns minimal data
  const daysSince = getDaysSince(status.lastTrained);
  const recovery = calculateRecoveryPercentage(daysSince, status.recoveryDaysNeeded);
  const fatiguePercent = 100 - recovery;
  const isReady = fatiguePercent < 33;
  const statusColor = fatiguePercent < 33 ? 'green' : fatiguePercent < 66 ? 'yellow' : 'red';
  const daysUntilReady = calculateDaysUntilReady(daysSince, status.recoveryDaysNeeded);

  // ... more calculation logic
}
```

### Dashboard.tsx - After Refactor (Simplified)

```typescript
// ✅ NEW CODE: ~15 lines, pure presentation
function Dashboard() {
  const [muscleStates, setMuscleStates] = useState<MuscleStatesResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMuscleStates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/muscle-states');
      if (!response.ok) throw new Error('Failed to fetch muscle states');
      const data = await response.json();
      setMuscleStates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMuscleStates();  // Auto-refresh on mount
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchMuscleStates} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3>Muscle Fatigue Heat Map</h3>
        <button onClick={fetchMuscleStates}>🔄 Refresh</button>
      </div>

      <MuscleCategory title="PUSH MUSCLES" muscles={['Pectoralis', 'Deltoids', 'Triceps']}>
        {muscle => {
          const state = muscleStates[muscle];
          if (!state) return null;

          return (
            <MuscleCard
              name={muscle}
              fatiguePercent={state.currentFatiguePercent}  // ← Direct from API
              status={state.recoveryStatus}                  // ← Direct from API
              lastTrained={state.lastTrained}                // ← Direct from API
              daysUntilRecovered={state.daysUntilRecovered}  // ← Direct from API
            />
          );
        }}
      </MuscleCategory>

      {/* Repeat for PULL, LEGS, CORE categories */}
    </div>
  );
}
```

**Code Reduction:**
- ❌ Removed: `calculateRecoveryPercentage()` calls
- ❌ Removed: `getDaysSince()` calls
- ❌ Removed: Manual fatigue calculation (`100 - recovery`)
- ❌ Removed: Manual status determination
- ✅ Added: Simple refresh button
- ✅ Added: Loading/error states
- **Net result: ~70% less code, 100% more maintainable**

---

## Data Transformation Pipeline (Post-Refactor)

```mermaid
flowchart LR
    subgraph Database["Database Layer (Facts)"]
        DBRow[initial_fatigue_percent: 51<br/>last_trained: 2025-10-24T18:30:00Z]
    end

    subgraph Backend["Backend Layer (Intelligence)"]
        CalcEngine[Calculation Engine]
        APIResponse[currentFatiguePercent: 25.5<br/>initialFatiguePercent: 51.0<br/>daysElapsed: 1.2<br/>estimatedRecoveryDays: 4.1<br/>daysUntilRecovered: 2.9<br/>recoveryStatus: ready]
    end

    subgraph API["API Transport"]
        JSON[JSON over HTTP]
    end

    subgraph Frontend["Frontend Layer (Presentation)"]
        UIModel[Display fatiguePercent: 25.5%<br/>Show status: Ready<br/>Show time: 2.9 days]
    end

    DBRow -->|Read DB| CalcEngine
    CalcEngine -->|Apply formulas| APIResponse
    APIResponse -->|Serialize| JSON
    JSON -->|HTTP Response| UIModel

    UIModel -.->|User logs workout| JSON
    JSON -.->|HTTP PUT| DBRow

    style CalcEngine fill:#90EE90
    style DBRow fill:#FFE4B5
    style UIModel fill:#E6F3FF
```

**Key Insight:**
- Database stores **immutable historical facts** (what fatigue WAS)
- Backend provides **current interpretation** (what fatigue IS NOW)
- Frontend shows **visual representation** (how to display it)

---

## Workout Save Flow (Post-Refactor)

```mermaid
sequenceDiagram
    participant U as User
    participant W as Workout Component
    participant F as Frontend Logic
    participant A as API Server
    participant D as Database

    U->>W: Completes workout<br/>(6 exercises, 18 sets)
    W->>F: Calculate initial fatigue<br/>from workout volume
    Note over F: Triceps: 5100 volume<br/>5100/10000 = 51% fatigue

    F->>A: POST /api/workouts<br/>{exercises: [...]}
    A->>D: INSERT INTO workouts
    A->>D: INSERT INTO exercise_sets (18 rows)
    D-->>A: Workout saved

    F->>A: PUT /api/muscle-states<br/>{Triceps: {initial_fatigue: 51, ...}}
    A->>D: UPDATE muscle_states<br/>SET initial_fatigue_percent=51,<br/>last_trained=NOW()
    A->>A: Calculate current state<br/>for all muscles
    A-->>F: Return all muscle states<br/>(with calculated values)

    F->>F: Update React state
    F->>W: Navigate to Dashboard
    W->>A: GET /api/muscle-states
    A-->>W: Fresh calculated data
    W->>U: Display updated heat map
```

**Changes from Pre-Refactor:**
1. ✅ Frontend calculates initial fatigue from volume (unchanged)
2. ✅ Frontend sends `initial_fatigue_percent` instead of `fatiguePercentage`
3. ✅ Backend stores initial value + timestamp
4. ✅ Backend returns calculated current state in response
5. ✅ Frontend updates local state with calculated values
6. ✅ Dashboard auto-refreshes on mount (gets fresh calculations)

---

## API Endpoint Summary (Post-Refactor)

| Method | Endpoint | Request Body | Response Body | Calculation Location |
|--------|----------|--------------|---------------|---------------------|
| GET | `/api/muscle-states` | None | `MuscleStatesResponse` (7 fields per muscle) | **Backend calculates all** |
| PUT | `/api/muscle-states` | `MuscleStatesUpdateRequest` | `MuscleStatesResponse` | **Backend stores, then calculates** |
| GET | `/api/workouts` | None | Workout history | No calculation |
| POST | `/api/workouts` | Workout data | Workout + PRs | PR detection only |
| GET | `/api/profile` | None | User profile | No calculation |
| PUT | `/api/profile` | Profile updates | Updated profile | No calculation |

**Key Changes:**
- ✅ GET `/api/muscle-states` now returns **7 calculated fields** (was 4 basic fields)
- ✅ PUT `/api/muscle-states` accepts **`initial_fatigue_percent`** (was `fatiguePercentage`)
- ✅ Both endpoints ensure **backend is single source of truth**

---

## Success Metrics (Post-Refactor Goals)

### Code Quality Metrics

- ✅ **Reduce frontend calculation code by ~100 lines**
  - Dashboard.tsx: -50 lines
  - Workout.tsx: -30 lines
  - WorkoutSummaryModal.tsx: -20 lines
  - Shared utils: -removed `calculateRecoveryPercentage()`, `getDaysSince()`, etc.

- ✅ **Single source of truth established**
  - ALL time-based calculations in backend
  - Frontend has ZERO recovery/fatigue calculation logic
  - Database stores historical facts only

- ✅ **Zero duplicate logic**
  - Recovery formula exists in ONE place (backend)
  - Frontend never calculates current fatigue

### Bug Fixes

- ✅ **API-created workouts now display correct fatigue** (was showing 0%)
- ✅ **Multi-user database constraint fixed** (UNIQUE constraint now composite)
- ✅ **Eliminated race condition** where frontend and backend calculate different values

### Developer Experience

- ✅ **Easier debugging**
  - Check backend logs for calculation results
  - No need to replicate frontend environment
  - Single calculation path to verify

- ✅ **Easier to modify recovery formula**
  - Change in ONE place (backend)
  - No frontend code changes needed
  - TypeScript types prevent API contract mismatches

- ✅ **Better separation of concerns**
  - Database = storage
  - Backend = business logic
  - Frontend = presentation

### User Experience

- ✅ **Heat map always accurate** (no stale calculations)
- ✅ **Manual refresh button** provides user control
- ✅ **Fast loading** (local API, <50ms response time)
- ✅ **Consistent data** across all components

---

## Migration Impact Summary

### Database Changes

| Table | Field | Change | Impact |
|-------|-------|--------|--------|
| `muscle_states` | `fatigue_percent` | Renamed to `initial_fatigue_percent` | **Breaking change** - requires data migration |
| `muscle_states` | `recovered_at` | **REMOVED** | No impact (was always null) |
| `muscle_states` | UNIQUE constraint | Changed to composite `(user_id, muscle_name)` | **Critical bug fix** |

### API Changes

| Endpoint | Change | Breaking? | Migration Required? |
|----------|--------|-----------|---------------------|
| GET `/api/muscle-states` | Response expanded from 4 to 7 fields | **Yes** | Frontend must use new fields |
| PUT `/api/muscle-states` | Request uses `initial_fatigue_percent` | **Yes** | Frontend must send new field name |

### Code Changes

| Component | Change | Lines Changed | Risk Level |
|-----------|--------|---------------|------------|
| `backend/database/schema.sql` | Update MUSCLE_STATES schema | ~10 lines | Medium (migration required) |
| `backend/server.ts` | Add calculation engine | +60 lines | Low (new code, well-tested) |
| `types.ts` | Add new types, deprecate old | +20/-5 lines | Low (additive) |
| `Dashboard.tsx` | Remove calculations, use API | -50/+15 lines | Medium (significant refactor) |
| `Workout.tsx` | Update muscle state save | -30/+10 lines | Medium |
| `WorkoutSummaryModal.tsx` | Use API fields | -20/+5 lines | Low |

**Total Code Impact:**
- Backend: +70 lines (calculation engine)
- Frontend: -100 lines (removed calculations)
- Net: **-30 lines** with better architecture

---

## Testing Checklist (Post-Refactor Validation)

### Backend Validation

- [ ] GET `/api/muscle-states` returns 7 fields per muscle
- [ ] All calculated fields have correct types (number, string, enum)
- [ ] Never-trained muscles return: `currentFatigue=0`, `lastTrained=null`, `daysElapsed=null`, `status='ready'`
- [ ] Freshly trained muscles (daysElapsed=0) show: `currentFatigue = initialFatigue`
- [ ] Partially recovered muscles show: `0 < currentFatigue < initialFatigue`
- [ ] Fully recovered muscles show: `currentFatigue = 0`
- [ ] PUT `/api/muscle-states` accepts `initial_fatigue_percent` field
- [ ] PUT response includes calculated current state for ALL muscles

### Frontend Validation

- [ ] Dashboard displays without console errors
- [ ] All 13 muscles visible in heat map
- [ ] Fatigue percentages match backend response exactly
- [ ] Progress bars render correctly (0-100 range)
- [ ] Color coding correct: green (<=33%), yellow (<=66%), red (>66%)
- [ ] "Last trained" displays correctly or "Never trained"
- [ ] "Ready now" vs "Ready in X days" accurate
- [ ] Refresh button updates data
- [ ] Loading spinner shows during fetch
- [ ] Error state displays on fetch failure

### Workflow Validation

- [ ] Log workout → muscle states update correctly
- [ ] Navigate to Dashboard → auto-refresh works
- [ ] Manual refresh button → fetches latest data
- [ ] Multiple workouts same day → states update correctly
- [ ] PRs still detected and displayed
- [ ] Workout history still accessible

### Edge Cases

- [ ] Empty database (all muscles "Never trained")
- [ ] Single muscle trained, others never trained
- [ ] Muscle at exactly 33% fatigue (boundary: should be "ready")
- [ ] Muscle at exactly 66% fatigue (boundary: should be "recovering")
- [ ] Very high fatigue (100%) → 7 days recovery
- [ ] Very low fatigue (<5%) → <2 days recovery
- [ ] Workout at midnight UTC (boundary case)
- [ ] Network error during fetch → error state displays
- [ ] Backend down → graceful error handling

---

## Future Enhancements (V2+)

### Non-Linear Recovery Curves

Replace linear decay with physiologically accurate models:

```typescript
// Exponential decay (fast recovery initially, slower later)
const currentFatigue = initialFatigue * Math.exp(-0.3 * daysElapsed);

// Logarithmic curve (based on sports science research)
const currentFatigue = initialFatigue * (1 - Math.log(1 + daysElapsed) / Math.log(1 + recoveryDays));
```

### Muscle-Specific Recovery Rates

Different recovery times based on muscle size:

```typescript
const RECOVERY_MULTIPLIERS = {
  'Pectoralis': 1.2,   // Large muscles recover slower
  'Lats': 1.3,
  'Quadriceps': 1.4,
  'Triceps': 0.8,      // Small muscles recover faster
  'Biceps': 0.8,
  'Forearms': 0.7
};

const recoveryDays = (1 + initialFatigue / 100 * 6) * RECOVERY_MULTIPLIERS[muscle];
```

### Personalized Baselines

Learn actual capacity from workout history instead of hardcoded 10,000:

```typescript
// Track highest volume ever achieved per muscle
const personalBaseline = await db.query(`
  SELECT MAX(volume_today) as max_volume
  FROM muscle_states
  WHERE user_id = ? AND muscle_name = ?
`);

const fatiguePercent = (workoutVolume / personalBaseline.max_volume) * 100;
```

### Response Caching (If Needed)

In-memory cache with TTL for high-traffic scenarios:

```typescript
const muscleStateCache = {
  data: null as MuscleStatesResponse | null,
  timestamp: 0,
  TTL: 60000  // 1 minute
};

function getMuscleStates(): MuscleStatesResponse {
  const now = Date.now();

  // Return cached if fresh
  if (muscleStateCache.data && (now - muscleStateCache.timestamp) < muscleStateCache.TTL) {
    return muscleStateCache.data;
  }

  // Calculate fresh data
  const fresh = calculateMuscleStates();
  muscleStateCache.data = fresh;
  muscleStateCache.timestamp = now;

  return fresh;
}
```

---

## Architecture Principles (Post-Refactor)

### Separation of Concerns

**Database Layer (Storage)**
- Stores immutable historical facts
- What happened: "workout occurred, initial fatigue was X%"
- No derived/calculated values
- No business logic

**Backend API Layer (Intelligence)**
- Calculates current state from historical facts
- Applies business logic (recovery formulas, time decay)
- Returns computed values ready for display
- Single source of truth for ALL calculations

**Frontend Layer (Presentation)**
- Displays data from API
- Handles user interactions
- ZERO calculation logic (except initial fatigue from volume)
- Trusts backend completely

### Data Flow Philosophy

```
┌─────────────────────────────────────────────────┐
│  Database: "What Happened"                      │
│  - initial_fatigue_percent: 51                  │
│  - last_trained: 2025-10-24T18:30:00Z           │
│  (Immutable historical fact)                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Backend: "What It Means Now"                   │
│  - Read: initial=51%, trained=1.2 days ago      │
│  - Calculate: recovery=4.1 days, current=25.5%  │
│  - Return: status="ready"                       │
│  (Real-time interpretation)                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Frontend: "What User Sees"                     │
│  - Display: "Triceps: 25.5% fatigued"          │
│  - Display: "Ready in 2.9 days"                │
│  - Display: Green status badge                  │
│  (Visual presentation only)                     │
└─────────────────────────────────────────────────┘
```

---

## Rollback Plan

If issues arise during implementation, rollback is simple:

```bash
# Identify problematic commit
git log --oneline

# Rollback to last known good state (checkpoint commit)
git reset --hard <checkpoint-commit-hash>

# Rebuild containers
docker-compose down -v
docker-compose build --no-cache
docker-compose up

# Verify app works
curl http://localhost:3001/api/health
```

**Checkpoints:**
- Phase 1 complete: Backend calculation engine working
- Phase 2 complete: Types added (old types still exist)
- Phase 3 complete: Dashboard refactored
- Phase 4 complete: Workout integration updated
- Phase 5 complete: All deprecated code removed

---

## Document Version History

**Version 2.0 - 2025-10-25**
- Initial post-refactor ERD document
- Based on ARCHITECTURE-REFACTOR-BACKEND-DRIVEN.md v1.1
- Comprehensive documentation of proposed new architecture
- Includes all schema changes, API contracts, and code examples

---

**Document End**

*Post-Refactor Data Model & Architecture*
*For FitForge Backend-Driven Muscle State Calculations*
*Version 2.0 - 2025-10-25*

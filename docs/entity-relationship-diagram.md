# FitForge Entity Relationship Diagram

## Complete ERD with All Relationships

```mermaid
erDiagram
    users ||--o{ bodyweight_history : "tracks weight"
    users ||--o{ equipment : "owns"
    users ||--o{ workouts : "performs"
    users ||--o{ muscle_states : "monitors"
    users ||--o{ personal_bests : "achieves"
    users ||--o{ muscle_baselines : "maintains"
    users ||--o{ workout_templates : "creates"

    workouts ||--o{ exercise_sets : "contains"

    users {
        INTEGER id PK "Auto-increment primary key"
        TEXT name "User's display name"
        TEXT experience "Beginner/Intermediate/Advanced"
        TIMESTAMP created_at "Account creation timestamp"
        TIMESTAMP updated_at "Last profile update"
    }

    bodyweight_history {
        INTEGER id PK "Auto-increment primary key"
        INTEGER user_id FK "References users(id)"
        TEXT date "Entry date (ISO 8601)"
        REAL weight "Weight in pounds"
        TIMESTAMP created_at "Entry timestamp"
    }

    equipment {
        INTEGER id PK "Auto-increment primary key"
        INTEGER user_id FK "References users(id)"
        TEXT name "Equipment type"
        REAL min_weight "Minimum weight capacity"
        REAL max_weight "Maximum weight capacity"
        REAL weight_increment "Weight step increment"
        TIMESTAMP created_at "Entry timestamp"
    }

    workouts {
        INTEGER id PK "Auto-increment primary key"
        INTEGER user_id FK "References users(id)"
        TEXT date "Workout date (ISO 8601)"
        TEXT category "Push/Pull/Legs/Core"
        TEXT variation "A/B/Both"
        TEXT progression_method "Weight/Reps"
        INTEGER duration_seconds "Session duration"
        TIMESTAMP created_at "Entry timestamp"
    }

    exercise_sets {
        INTEGER id PK "Auto-increment primary key"
        INTEGER workout_id FK "References workouts(id)"
        TEXT exercise_name "Exercise identifier"
        REAL weight "Weight used (lbs)"
        INTEGER reps "Repetitions performed"
        INTEGER set_number "Set sequence (1,2,3...)"
        INTEGER to_failure "Boolean flag (0/1)"
        TIMESTAMP created_at "Entry timestamp"
    }

    muscle_states {
        INTEGER id PK "Auto-increment primary key"
        INTEGER user_id FK "References users(id)"
        TEXT muscle_name UK "Unique per user"
        REAL initial_fatigue_percent "Fatigue at training"
        REAL volume_today "Training volume"
        TEXT last_trained "UTC ISO 8601 timestamp"
        TIMESTAMP updated_at "Last update timestamp"
    }

    personal_bests {
        INTEGER id PK "Auto-increment primary key"
        INTEGER user_id FK "References users(id)"
        TEXT exercise_name UK "Unique per user"
        REAL best_single_set "Max single-set volume"
        REAL best_session_volume "Max total volume"
        REAL rolling_average_max "Average maximum"
        TIMESTAMP updated_at "Last update timestamp"
    }

    muscle_baselines {
        INTEGER id PK "Auto-increment primary key"
        INTEGER user_id FK "References users(id)"
        TEXT muscle_name UK "Unique per user"
        REAL system_learned_max "AI-learned threshold"
        REAL user_override "User-specified override"
        TIMESTAMP updated_at "Last update timestamp"
    }

    workout_templates {
        INTEGER id PK "Auto-increment primary key"
        INTEGER user_id FK "References users(id)"
        TEXT name "Template name"
        TEXT category "Push/Pull/Legs/Core"
        TEXT variation "A/B/Both"
        TEXT exercise_ids "JSON array of IDs"
        INTEGER is_favorite "Boolean flag (0/1)"
        INTEGER times_used "Usage counter"
        TIMESTAMP created_at "Creation timestamp"
        TIMESTAMP updated_at "Last update timestamp"
    }
```

---

## Simplified ERD (Key Relationships Only)

```mermaid
erDiagram
    users ||--o{ workouts : performs
    workouts ||--o{ exercise_sets : contains
    users ||--o{ muscle_states : monitors
    users ||--o{ personal_bests : achieves

    users {
        INTEGER id
        TEXT name
        TEXT experience
    }

    workouts {
        INTEGER id
        INTEGER user_id
        TEXT date
        TEXT category
        TEXT variation
    }

    exercise_sets {
        INTEGER id
        INTEGER workout_id
        TEXT exercise_name
        REAL weight
        INTEGER reps
    }

    muscle_states {
        INTEGER id
        INTEGER user_id
        TEXT muscle_name
        REAL initial_fatigue_percent
        TEXT last_trained
    }

    personal_bests {
        INTEGER id
        INTEGER user_id
        TEXT exercise_name
        REAL best_single_set
        REAL best_session_volume
    }
```

---

## Data Flow Diagram

```mermaid
flowchart TB
    subgraph Frontend["Frontend Layer (React + TypeScript)"]
        UI[User Interface Components]
        API_Client[API Client - api.ts]
        Types_FE[Frontend Types - types.ts]
        Constants[Exercise Library - constants.ts]
    end

    subgraph Backend["Backend Layer (Express + TypeScript)"]
        API_Server[API Server - server.ts]
        Types_BE[Backend Types - backend/types.ts]
        DB_Layer[Database Layer - database.ts]
        Calculations[Business Logic]
    end

    subgraph Database["Database Layer (SQLite)"]
        Schema[Schema - schema.sql]
        Migrations[Migrations]
        DB_File[(fitforge.db)]
    end

    UI -->|HTTP Requests| API_Client
    API_Client -->|POST/GET/PUT| API_Server
    API_Server -->|Type-safe calls| DB_Layer
    DB_Layer -->|SQL Queries| DB_File
    Schema -.->|Defines structure| DB_File
    Migrations -.->|Evolves schema| DB_File

    DB_Layer -->|Calculate muscle states| Calculations
    Calculations -->|Recovery formulas| DB_Layer
    DB_Layer -->|Type-safe responses| API_Server
    API_Server -->|JSON responses| API_Client
    API_Client -->|Update state| UI

    Types_FE -.->|Shared types| UI
    Types_BE -.->|API contracts| API_Server
    Constants -.->|Exercise data| UI

    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style Database fill:#f0f0f0
```

---

## Workout Save Data Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Workout Component
    participant API as API Client
    participant Server as Express Server
    participant DB as Database Layer
    participant SQLite as SQLite DB

    User->>UI: Complete workout
    UI->>UI: Collect exercise sets + to_failure flags
    UI->>API: POST /api/workouts (WorkoutSaveRequest)
    API->>Server: HTTP POST with workout data
    Server->>DB: saveWorkout(request)

    DB->>SQLite: BEGIN TRANSACTION
    DB->>SQLite: INSERT INTO workouts
    SQLite-->>DB: workout_id

    loop For each exercise set
        DB->>SQLite: INSERT INTO exercise_sets
    end

    DB->>SQLite: SELECT FROM personal_bests
    DB->>DB: Calculate volumes & detect PRs

    alt New PR detected
        DB->>SQLite: UPDATE personal_bests
        DB->>DB: Create PRInfo object
    end

    DB->>SQLite: SELECT muscle engagements
    DB->>DB: Calculate fatigue updates
    DB->>SQLite: UPDATE muscle_states (initial_fatigue, last_trained)

    DB->>SQLite: COMMIT TRANSACTION

    DB-->>Server: {workout, prs[]}
    Server-->>API: WorkoutResponse + PRInfo[]
    API-->>UI: Response data
    UI->>UI: Display summary + PR notifications
    UI-->>User: Show workout saved + achievements
```

---

## Muscle State Calculation Flow

```mermaid
sequenceDiagram
    participant User
    participant Dashboard as Dashboard Component
    participant API as API Client
    participant Server as Express Server
    participant DB as Database Layer
    participant SQLite as SQLite DB

    User->>Dashboard: Open dashboard
    Dashboard->>API: GET /api/muscle-states
    API->>Server: HTTP GET
    Server->>DB: getMuscleStates()

    DB->>SQLite: SELECT FROM muscle_states WHERE user_id = 1
    SQLite-->>DB: Raw muscle state rows

    loop For each muscle
        DB->>DB: Read initial_fatigue_percent, last_trained
        DB->>DB: Calculate days_elapsed from last_trained
        DB->>DB: Calculate recovery_days = 1 + (fatigue/100) * 6
        DB->>DB: Calculate current_fatigue = initial * (1 - elapsed/recovery)
        DB->>DB: Calculate days_until_recovered
        DB->>DB: Determine recovery_status (ready/recovering/fatigued)
        DB->>DB: Build MuscleStateData with calculated fields
    end

    DB-->>Server: MuscleStatesResponse with all calculated fields
    Server-->>API: JSON response
    API-->>Dashboard: MuscleStatesResponse
    Dashboard->>Dashboard: Render muscle recovery visualization
    Dashboard-->>User: Display current muscle states
```

---

## Progressive Overload Suggestion Flow

```mermaid
sequenceDiagram
    participant User
    participant Workout as Workout Component
    participant API as API Client
    participant Server as Express Server
    participant DB as Database Layer
    participant Utils as Progressive Overload Utils
    participant SQLite as SQLite DB

    User->>Workout: Start workout (select category)
    Workout->>API: GET /api/workouts/last?category=Push
    API->>Server: HTTP GET
    Server->>DB: getLastWorkoutByCategory('Push')

    DB->>SQLite: SELECT FROM workouts WHERE category = 'Push' ORDER BY date DESC LIMIT 1
    DB->>SQLite: SELECT FROM exercise_sets WHERE workout_id = ?
    SQLite-->>DB: Last workout with sets

    DB-->>Server: WorkoutResponse
    Server-->>API: JSON response
    API-->>Workout: Last workout data

    Workout->>Utils: calculateProgressiveOverload(lastWorkout, method, personalBest)

    loop For each exercise
        Utils->>Utils: Calculate 3% increase
        Utils->>Utils: Round to nearest 0.5 lb
        Utils->>Utils: Check equipment constraints
        Utils->>Utils: Alternate weight/reps method
        Utils-->>Workout: ProgressiveOverloadSuggestion
    end

    Workout->>Workout: Pre-populate exercise sets with suggested values
    Workout-->>User: Display suggested workout
```

---

## Relationship Cardinalities

| Relationship | Parent | Child | Type | Cascade |
|--------------|--------|-------|------|---------|
| User → Bodyweight History | users | bodyweight_history | 1:N | DELETE CASCADE |
| User → Equipment | users | equipment | 1:N | DELETE CASCADE |
| User → Workouts | users | workouts | 1:N | DELETE CASCADE |
| User → Muscle States | users | muscle_states | 1:N | DELETE CASCADE |
| User → Personal Bests | users | personal_bests | 1:N | DELETE CASCADE |
| User → Muscle Baselines | users | muscle_baselines | 1:N | DELETE CASCADE |
| User → Workout Templates | users | workout_templates | 1:N | DELETE CASCADE |
| Workout → Exercise Sets | workouts | exercise_sets | 1:N | DELETE CASCADE |

---

## Index Strategy

### Query Optimization Indexes

1. **Workout Queries**
   - `idx_workouts_user_date` ON `workouts(user_id, date)`
   - Optimizes: Recent workout retrieval, date-range queries

2. **Exercise Set Queries**
   - `idx_exercise_sets_workout` ON `exercise_sets(workout_id)`
   - Optimizes: Loading sets for workout display
   - `idx_exercise_sets_to_failure` ON `exercise_sets(to_failure)`
   - Optimizes: Filtering failure sets for analytics

3. **Muscle State Queries**
   - `idx_muscle_states_user` ON `muscle_states(user_id)`
   - Optimizes: Dashboard muscle state loading

4. **Personal Best Queries**
   - `idx_personal_bests_user` ON `personal_bests(user_id)`
   - Optimizes: Personal records retrieval

5. **Muscle Baseline Queries**
   - `idx_muscle_baselines_user` ON `muscle_baselines(user_id)`
   - Optimizes: Baseline threshold lookups

6. **Template Queries**
   - `idx_workout_templates_user` ON `workout_templates(user_id)`
   - Optimizes: Template library loading

---

## Data Integrity Constraints

### Primary Keys
All tables use auto-incrementing INTEGER primary keys for efficient indexing and referential integrity.

### Foreign Keys
All child tables enforce foreign key constraints with CASCADE DELETE to maintain referential integrity when users (or workouts) are deleted.

### Unique Constraints
Prevent duplicate records for:
- Muscle states per user/muscle combination
- Personal bests per user/exercise combination
- Muscle baselines per user/muscle combination

### Not Null Constraints
Critical fields enforce NOT NULL to prevent incomplete data:
- User names and experience levels
- Workout dates, categories, variations
- Exercise set weights and reps
- Muscle state names and fatigue values
- Personal best exercise names

---

## Denormalization Decisions

### 1. Exercise Names in exercise_sets
**Decision**: Store exercise names as TEXT instead of foreign key to exercises table

**Rationale**:
- Exercise library is static (defined in constants.ts)
- No need for dynamic exercise CRUD operations
- Simplifies queries (no JOIN required)
- Prevents orphaned sets if exercise deleted from library

### 2. Calculated Fields in Muscle States
**Decision**: Calculate current fatigue at read-time instead of storing

**Rationale**:
- Source of truth is initial_fatigue + last_trained
- Time-dependent values become stale immediately
- Backend calculation ensures consistency
- Reduces storage and update complexity

### 3. JSON Array in workout_templates
**Decision**: Store exercise_ids as JSON array string

**Rationale**:
- Templates are read-heavy, write-light
- Simplifies template retrieval (single row)
- Exercise order preservation critical
- No need for complex queries on exercise IDs

---

## Type Safety Mapping

```mermaid
flowchart LR
    SQLite[SQLite Schema\nschema.sql] -->|Database Layer| DB_Types[Database Row Types\nbackend/types.ts]
    DB_Types -->|API Contracts| API_Types[API Request/Response\nbackend/types.ts]
    API_Types -->|HTTP JSON| FE_Types[Frontend Types\ntypes.ts]
    FE_Types -->|Component Props| UI[React Components]

    Constants[Exercise Library\nconstants.ts] -.->|Static Data| UI

    style SQLite fill:#f9f9f9
    style DB_Types fill:#fff4e1
    style API_Types fill:#e8f4ff
    style FE_Types fill:#e1f5ff
    style UI fill:#f0f0f0
```

**Type Safety Chain**:
1. SQLite schema defines column types
2. Database layer uses typed row interfaces
3. API layer uses request/response contracts
4. Frontend uses matching TypeScript types
5. Components receive strongly-typed props

**No Type Casting**: Entire application maintains compile-time type safety from database to UI components.

---

## Summary

This ERD documentation provides:
- Complete entity relationships with all tables
- Simplified view for quick reference
- Data flow diagrams showing layer interactions
- Sequence diagrams for key operations
- Index and constraint strategy
- Type safety architecture

The FitForge data model supports a robust fitness tracking application with normalized storage, backend-driven calculations, and end-to-end type safety.

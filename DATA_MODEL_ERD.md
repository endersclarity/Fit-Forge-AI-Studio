# FitForge Local - Entity Relationship Diagram

## Database Schema ERD

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
        TEXT muscle_name UK
        REAL fatigue_percent
        REAL volume_today
        TEXT recovered_at
        TEXT last_trained
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

## Service Layer Models

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

    class MuscleState {
        +number lastTrained
        +number fatiguePercentage
        +number recoveryDaysNeeded
    }

    class MuscleBaseline {
        +number userOverride
        +number systemLearnedMax
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
```

## UI Data Flow

```mermaid
flowchart TB
    subgraph Frontend["React Frontend"]
        Dashboard[Dashboard Component]
        Workout[Workout Component]
        Profile[Profile Component]
        PersonalBests[PersonalBests Component]
        Templates[WorkoutTemplates Component]
        PRNotification[PRNotification Component]
    end

    subgraph Hooks["Custom Hooks"]
        useAPIState[useAPIState Hook]
        useLocalStorage[useLocalStorage Hook]
    end

    subgraph API["API Client Layer"]
        APIClient[api.ts]
    end

    subgraph Backend["Express Backend"]
        Server[server.ts]
        Database[database.ts]
    end

    subgraph SQLite["SQLite Database"]
        Tables[(Database Tables)]
    end

    Dashboard --> useAPIState
    Workout --> useAPIState
    Profile --> useAPIState
    PersonalBests --> useAPIState
    Templates --> useAPIState
    PRNotification --> useAPIState

    useAPIState --> APIClient
    useLocalStorage --> APIClient

    APIClient -->|HTTP Requests| Server
    Server --> Database
    Database --> Tables
```

## Data Transformation Pipeline

```mermaid
flowchart LR
    subgraph Database["Database Layer"]
        DBRow[Database Row Type]
    end

    subgraph Backend["Backend Layer"]
        DBTransform[Transform to API Type]
        APIResponse[API Response Type]
    end

    subgraph API["API Transport"]
        JSON[JSON over HTTP]
    end

    subgraph Frontend["Frontend Layer"]
        APIType[API Response Type]
        UITransform[Transform to UI Model]
        UIModel[UI Component State]
    end

    DBRow --> DBTransform
    DBTransform --> APIResponse
    APIResponse --> JSON
    JSON --> APIType
    APIType --> UITransform
    UITransform --> UIModel

    UIModel -.->|Mutation| APIType
    APIType -.->|HTTP PUT/POST| JSON
    JSON -.->|Persist| DBRow
```

## Muscle Tracking System

```mermaid
flowchart TB
    subgraph ExerciseLibrary["Exercise Library (48 exercises)"]
        PushEx[Push Exercises]
        PullEx[Pull Exercises]
        LegsEx[Legs Exercises]
        CoreEx[Core Exercises]
    end

    subgraph MuscleMapping["Muscle Engagement Mapping"]
        Engagement[MuscleEngagement Array]
        Percentage[Percentage per Muscle]
    end

    subgraph WorkoutTracking["Workout Tracking"]
        LogExercise[Logged Exercise]
        Sets[Exercise Sets]
        Volume[Calculate Volume]
    end

    subgraph FatigueSystem["Fatigue Management"]
        MuscleStates[Muscle States Table]
        FatigueCalc[Fatigue Calculation]
        Recovery[Recovery Timeline]
    end

    subgraph PerformanceTracking["Performance Tracking"]
        PersonalBests[Personal Bests Table]
        Baselines[Muscle Baselines Table]
        PRDetection[PR Detection Logic]
    end

    PushEx --> Engagement
    PullEx --> Engagement
    LegsEx --> Engagement
    CoreEx --> Engagement

    Engagement --> Percentage
    Percentage --> Volume

    LogExercise --> Sets
    Sets --> Volume

    Volume --> FatigueCalc
    Volume --> PRDetection

    FatigueCalc --> MuscleStates
    MuscleStates --> Recovery

    PRDetection --> PersonalBests
    Volume --> Baselines
```

## API Endpoint Data Model Map

```mermaid
flowchart LR
    subgraph Endpoints["API Endpoints"]
        ProfileEP[GET/PUT /api/profile]
        WorkoutsEP[GET/POST /api/workouts]
        MuscleStatesEP[GET/PUT /api/muscle-states]
        PersonalBestsEP[GET/PUT /api/personal-bests]
        BaselinesEP[GET/PUT /api/muscle-baselines]
        TemplatesEP[GET/POST/PUT/DELETE /api/templates]
    end

    subgraph Tables["Database Tables"]
        UsersTable[(USERS)]
        BodyweightTable[(BODYWEIGHT_HISTORY)]
        EquipmentTable[(EQUIPMENT)]
        WorkoutsTable[(WORKOUTS)]
        SetsTable[(EXERCISE_SETS)]
        MuscleStatesTable[(MUSCLE_STATES)]
        PersonalBestsTable[(PERSONAL_BESTS)]
        BaselinesTable[(MUSCLE_BASELINES)]
        TemplatesTable[(WORKOUT_TEMPLATES)]
    end

    ProfileEP --> UsersTable
    ProfileEP --> BodyweightTable
    ProfileEP --> EquipmentTable

    WorkoutsEP --> WorkoutsTable
    WorkoutsEP --> SetsTable
    WorkoutsEP --> PersonalBestsTable
    WorkoutsEP --> MuscleStatesTable

    MuscleStatesEP --> MuscleStatesTable

    PersonalBestsEP --> PersonalBestsTable

    BaselinesEP --> BaselinesTable

    TemplatesEP --> TemplatesTable
```

## Type Hierarchy

```mermaid
classDiagram
    class Enums {
        <<enumeration>>
        Muscle
        ExerciseCategory
        Equipment
        Difficulty
        Variation
        EquipmentIncrement
    }

    class CoreTypes {
        Exercise
        MuscleEngagement
        LoggedSet
        LoggedExercise
        WorkoutSession
    }

    class UserTypes {
        UserProfile
        WeightEntry
        EquipmentItem
    }

    class TrackingTypes {
        MuscleState
        MuscleBaseline
        ExerciseMaxes
        WorkoutTemplate
    }

    class APITypes {
        ProfileResponse
        ProfileUpdateRequest
        WorkoutResponse
        WorkoutSaveRequest
        MuscleStatesResponse
        PersonalBestsResponse
        MuscleBaselinesResponse
        PRInfo
    }

    class DatabaseTypes {
        UserRow
        WorkoutRow
        WorkoutTemplateRow
    }

    Enums --> CoreTypes
    Enums --> UserTypes
    Enums --> TrackingTypes
    CoreTypes --> APITypes
    UserTypes --> APITypes
    TrackingTypes --> APITypes
    APITypes --> DatabaseTypes
```

## Data Lifecycle

```mermaid
stateDiagram-v2
    [*] --> UserCreation: First app launch

    UserCreation --> Profile: User created with defaults
    Profile --> WorkoutPlanning: Select workout template

    WorkoutPlanning --> WorkoutExecution: Start workout
    WorkoutExecution --> LoggingSets: Log exercise sets
    LoggingSets --> WorkoutExecution: Continue workout
    LoggingSets --> WorkoutComplete: Finish workout

    WorkoutComplete --> CalculateFatigue: Process muscle fatigue
    WorkoutComplete --> DetectPRs: Check for personal records
    WorkoutComplete --> UpdateBaselines: Update learned maxes

    CalculateFatigue --> MuscleRecovery: Set recovery timeline
    DetectPRs --> UpdatePersonalBests: Save new records
    UpdateBaselines --> NextWorkout: Ready for next session

    MuscleRecovery --> NextWorkout
    UpdatePersonalBests --> NextWorkout

    NextWorkout --> WorkoutPlanning: Plan next workout

    Profile --> UpdateProfile: Edit profile/equipment
    UpdateProfile --> Profile
```

## Key Data Relationships Summary

### One-to-Many Relationships
- **USERS → WORKOUTS**: One user has many workouts
- **USERS → BODYWEIGHT_HISTORY**: One user has many weight entries
- **USERS → EQUIPMENT**: One user owns many equipment items
- **USERS → MUSCLE_STATES**: One user has 13 muscle state records
- **USERS → PERSONAL_BESTS**: One user has many exercise PRs
- **USERS → MUSCLE_BASELINES**: One user has 13 muscle baseline records
- **USERS → WORKOUT_TEMPLATES**: One user creates many templates
- **WORKOUTS → EXERCISE_SETS**: One workout contains many exercise sets

### Unique Constraints
- **MUSCLE_STATES**: (user_id, muscle_name) - one state per muscle per user
- **PERSONAL_BESTS**: (user_id, exercise_name) - one PR record per exercise per user
- **MUSCLE_BASELINES**: (user_id, muscle_name) - one baseline per muscle per user

### Cascade Deletions
All child tables use `ON DELETE CASCADE` to automatically clean up related records when a user is deleted.

## Performance Indexes

- `idx_workouts_user_date`: Fast workout queries by user and date
- `idx_exercise_sets_workout`: Fast set queries by workout
- `idx_exercise_sets_to_failure`: Optimize failure set queries
- `idx_muscle_states_user`: Fast muscle state lookups
- `idx_personal_bests_user`: Fast PR lookups
- `idx_muscle_baselines_user`: Fast baseline lookups
- `idx_workout_templates_user`: Fast template queries

## Reference Data

### Predefined Muscles (13 total)
1. Pectoralis
2. Triceps
3. Deltoids
4. Lats
5. Biceps
6. Rhomboids
7. Trapezius
8. Forearms
9. Quadriceps
10. Glutes
11. Hamstrings
12. Calves
13. Core

### Exercise Categories
- Push (chest, shoulders, triceps)
- Pull (back, biceps)
- Legs (quads, hamstrings, glutes, calves)
- Core (abdominals, obliques)

### Equipment Types
- Bodyweight
- Dumbbells
- Kettlebell
- Pull-up Bar
- TRX
- Dip Station
- Plyo Box
- Grip Strengthener
- Bench

### Difficulty Levels
- Beginner
- Intermediate
- Advanced

### Workout Variations
- A (Variation A)
- B (Variation B)
- Both (Exercise appears in both variations)

## File Locations

| Component | File Path |
|-----------|-----------|
| Database Schema | `backend/database/schema.sql` |
| Database Operations | `backend/database/database.ts` |
| Shared Types | `types.ts` |
| Backend Types | `backend/types.ts` |
| Exercise Library | `constants.ts` |
| API Client | `api.ts` |
| Server Routes | `backend/server.ts` |
| React Components | `components/` |
| Custom Hooks | `hooks/` |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-24
**Total Tables**: 9
**Total Exercises**: 48
**Total Muscle Groups**: 13
**Total Default Templates**: 8

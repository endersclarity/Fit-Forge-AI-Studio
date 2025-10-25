# FitForge Documentation

## Architecture and Data Model Documentation

This directory contains comprehensive documentation of FitForge's data architecture, entity relationships, and data flow patterns.

---

## Documentation Files

### 1. [Data Model Documentation](./data-model.md)
**Complete reference for all data structures in the application**

Contents:
- Full entity relationship diagram (Mermaid)
- Detailed database schema documentation
  - All 9 tables with column descriptions
  - Constraints, indexes, and foreign keys
  - Migration history
- API data contracts (backend types)
  - Request/response interfaces
  - Type definitions for all endpoints
- Frontend type definitions
  - Enums (Muscle, ExerciseCategory, Equipment, etc.)
  - UI data models
  - Component prop types
- API endpoint reference
- Exercise library structure
- Utility functions
- Architecture highlights and design decisions

**Use this document to**:
- Understand the complete database schema
- Reference API contracts when building features
- Look up type definitions
- Understand data constraints and relationships

---

### 2. [Entity Relationship Diagram](./entity-relationship-diagram.md)
**Visual diagrams and relationship documentation**

Contents:
- Complete ERD with all 9 tables and relationships
- Simplified ERD for quick reference
- Data flow architecture diagram
- Sequence diagrams:
  - Workout save flow
  - Muscle state calculation flow
  - Progressive overload suggestion flow
- Relationship cardinalities table
- Index strategy and performance optimization
- Data integrity constraints
- Denormalization decisions and rationale
- Type safety mapping diagram

**Use this document to**:
- Visualize database structure
- Understand table relationships
- See how data flows between layers
- Reference index and constraint strategy
- Understand key architectural decisions

---

### 3. [Data Flow Architecture](./data-flow-architecture.md)
**Deep dive into data flow patterns and business logic**

Contents:
- Three-layer architecture overview
- Complete data flow patterns:
  1. Dashboard load flow
  2. Workout save flow
  3. Progressive overload suggestion flow
  4. Profile update flow
  5. Workout template flow (create & load)
- Business logic layer functions:
  - Muscle state recovery calculations
  - Personal record detection algorithms
- Data transformation tables
- Type flow documentation
- Error handling patterns
- State management patterns
- Code examples and formulas

**Use this document to**:
- Understand how data moves through the system
- See business logic implementation details
- Reference algorithms (recovery, PR detection)
- Understand state management
- Debug data flow issues

---

## Quick Reference

### Database Tables
1. **users** - User profile
2. **bodyweight_history** - Weight tracking
3. **equipment** - Available equipment
4. **workouts** - Workout sessions
5. **exercise_sets** - Individual sets in workouts
6. **muscle_states** - Muscle fatigue tracking (backend-calculated)
7. **personal_bests** - Performance records
8. **muscle_baselines** - Fatigue capacity thresholds
9. **workout_templates** - Saved workout configurations

### Key Relationships
- `users` → `bodyweight_history` (1:N)
- `users` → `equipment` (1:N)
- `users` → `workouts` (1:N)
- `users` → `muscle_states` (1:N)
- `users` → `personal_bests` (1:N)
- `users` → `muscle_baselines` (1:N)
- `users` → `workout_templates` (1:N)
- `workouts` → `exercise_sets` (1:N)

### File Locations

#### Database Layer
- Schema: `backend/database/schema.sql`
- Migrations: `backend/database/migrations/`
- Database functions: `backend/database/database.ts`
- Database file: `data/fitforge.db`

#### Backend Layer
- Server: `backend/server.ts`
- Types: `backend/types.ts`

#### Frontend Layer
- API client: `api.ts`
- Types: `types.ts`
- Constants: `constants.ts`
- Components: `components/`
- Utils: `utils/`

### API Endpoints

**Health**
- `GET /api/health`

**Profile**
- `GET /api/profile`
- `PUT /api/profile`

**Workouts**
- `GET /api/workouts`
- `GET /api/workouts/last?category={category}`
- `POST /api/workouts`

**Muscle States** (Backend-Driven)
- `GET /api/muscle-states`
- `PUT /api/muscle-states`

**Personal Bests**
- `GET /api/personal-bests`
- `PUT /api/personal-bests`

**Muscle Baselines**
- `GET /api/muscle-baselines`
- `PUT /api/muscle-baselines`

**Templates**
- `GET /api/templates`
- `GET /api/templates/:id`
- `POST /api/templates`
- `PUT /api/templates/:id`
- `DELETE /api/templates/:id`

---

## Architecture Principles

### 1. Three-Layer Architecture
- **Database Layer**: SQLite with normalized schema
- **Service Layer**: Express + TypeScript with business logic
- **UI Layer**: React + TypeScript with type-safe components

### 2. Type Safety
- End-to-end TypeScript from database to UI
- No `any` types or type casting
- Compile-time safety guarantees

### 3. Backend-Driven Calculations
- Muscle states calculated on read, not stored
- Single source of truth for formulas
- Immutable historical facts in database

### 4. Single-User Local Application
- All queries use `user_id = 1`
- No authentication layer
- SQLite file-based persistence

### 5. Progressive Overload Intelligence
- 3% increase per session
- Alternates weight vs. reps progression
- Respects equipment constraints

### 6. Personal Record Tracking
- Automatic PR detection on save
- Multiple record types (single-set, session, rolling average)
- Real-time notifications

---

## Key Algorithms

### Muscle State Recovery Formula
```typescript
recoveryDays = 1 + (initialFatigue / 100) * 6  // 1-7 days range
currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)

// Status thresholds:
// - Ready: ≤33% fatigue
// - Recovering: 34-66% fatigue
// - Fatigued: >66% fatigue
```

### Progressive Overload Calculation
```typescript
// Weight progression: 3% increase, rounded to nearest 0.5 lb
newWeight = round(oldWeight * 1.03, 0.5)

// Reps progression: 3% increase, minimum +1 rep
newReps = max(oldReps + 1, ceil(oldReps * 1.03))

// Method alternates: weight → reps → weight → reps...
```

### Personal Record Detection
```typescript
// Single-set volume
singleSetVolume = weight * reps

// Session volume
sessionVolume = sum(all set volumes for exercise)

// PR detected if:
// - singleSetVolume > best_single_set, OR
// - sessionVolume > best_session_volume
```

---

## Database Migrations

### Migration 001: Add to_failure Column
- Adds `to_failure` INTEGER field to `exercise_sets`
- Supports tracking sets taken to muscular failure
- Rollback script available

### Migration 002: Refactor Muscle States
- Transitions to backend-driven calculation model
- Removes calculated fields from storage
- Keeps immutable facts: `initial_fatigue_percent`, `volume_today`, `last_trained`
- Adds UTC ISO 8601 timestamp for `last_trained`

---

## Type Definitions Overview

### Database Row Types (backend/types.ts)
- `UserRow`
- `BodyweightHistoryRow`
- `EquipmentRow`
- `WorkoutRow`
- `ExerciseSetRow`
- `MuscleStateRow`
- `PersonalBestRow`
- `MuscleBaselineRow`
- `WorkoutTemplateRow`

### API Contract Types (backend/types.ts)
- `ProfileResponse`, `ProfileUpdateRequest`
- `WorkoutResponse`, `WorkoutSaveRequest`, `PRInfo`
- `MuscleStatesResponse`, `MuscleStatesUpdateRequest`
- `PersonalBestsResponse`, `PersonalBestsUpdateRequest`
- `MuscleBaselinesResponse`, `MuscleBaselinesUpdateRequest`
- `HealthCheckResponse`, `ApiErrorResponse`

### Frontend Types (types.ts)
- Enums: `Muscle`, `ExerciseCategory`, `Equipment`, `Difficulty`, `Variation`
- Exercise: `MuscleEngagement`, `Exercise`
- Workout: `LoggedSet`, `LoggedExercise`, `WorkoutSession`
- Profile: `WeightEntry`, `EquipmentItem`, `UserProfile`
- Performance: `ExerciseMaxes`, `MuscleBaseline`, `MuscleBaselines`, `MuscleAnalytics`
- Templates: `WorkoutTemplate`

---

## Development Guidelines

### Adding New Tables
1. Update `backend/database/schema.sql`
2. Create migration in `backend/database/migrations/`
3. Add row type in `backend/types.ts`
4. Add database functions in `backend/database/database.ts`
5. Add API endpoint in `backend/server.ts`
6. Add frontend types in `types.ts`
7. Update API client in `api.ts`
8. Update documentation

### Adding New API Endpoints
1. Define request/response types in `backend/types.ts`
2. Implement endpoint in `backend/server.ts`
3. Add database function in `backend/database/database.ts`
4. Add frontend API function in `api.ts`
5. Update documentation

### Adding New Calculated Fields
1. Store immutable facts in database
2. Implement calculation in `backend/database/database.ts`
3. Add calculated fields to response type
4. Document formula in data-flow-architecture.md

---

## Performance Considerations

### Database Indexes
- All foreign keys are indexed automatically
- Additional indexes on frequently queried columns:
  - `workouts(user_id, date)` for recent workout queries
  - `exercise_sets(workout_id)` for workout detail loading
  - `exercise_sets(to_failure)` for failure set analytics

### Query Optimization
- Use prepared statements for all queries
- Minimize N+1 queries by grouping operations
- Fetch related data in single query when possible

### API Performance
- Parallel API calls in frontend when data is independent
- Backend calculations reduce frontend processing
- JSON serialization optimized for small payloads

---

## Data Integrity

### Foreign Key Constraints
All child tables cascade on delete to maintain referential integrity.

### Unique Constraints
- `muscle_states`: One row per user/muscle combination
- `personal_bests`: One row per user/exercise combination
- `muscle_baselines`: One row per user/muscle combination

### Not Null Constraints
Critical fields enforce NOT NULL to prevent incomplete data.

### Transaction Safety
Multi-step operations use transactions with proper rollback handling.

---

## Future Enhancements

### Potential Schema Changes
- Add `workout_notes` table for session notes
- Add `exercise_history` for exercise-specific analytics
- Add `goals` table for user-defined targets
- Add `achievements` table for gamification

### Potential Features
- Multi-user support (remove hardcoded `user_id = 1`)
- Cloud sync capabilities
- Exercise video library
- Social sharing features
- Advanced analytics dashboard

---

## Troubleshooting

### Common Issues

**Database locked errors**
- Ensure only one connection is active
- Check for uncommitted transactions
- Verify journal mode is set correctly

**Type mismatches**
- Check SQLite INTEGER vs. TypeScript boolean conversions
- Verify date/timestamp formats (ISO 8601)
- Ensure JSON parsing for template exercise_ids

**Missing data**
- Verify foreign key relationships
- Check cascade delete behavior
- Ensure default values are set

**Calculation errors**
- Review recovery formula implementation
- Check progressive overload rounding
- Verify PR detection logic

---

## Documentation Maintenance

When updating the codebase:
1. Update schema.sql and create migration
2. Update backend/types.ts and types.ts
3. Update database.ts functions
4. Update server.ts endpoints
5. Update this documentation:
   - data-model.md for schema changes
   - entity-relationship-diagram.md for relationship changes
   - data-flow-architecture.md for logic changes
6. Update README.md quick reference if needed

---

## Contact and Support

For questions about the data model or architecture:
- Review the three main documentation files
- Check code comments in schema.sql, database.ts, and server.ts
- Examine test cases for usage examples

This documentation is maintained in sync with the codebase and should be the authoritative reference for all data-related questions.

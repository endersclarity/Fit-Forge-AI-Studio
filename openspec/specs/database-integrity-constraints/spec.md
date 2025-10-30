# Spec: Database Integrity Constraints

**Capability:** `database-integrity-constraints`
**Related To:** Core database schema
**Status:** Draft

---

## Overview

This capability adds database-level validation constraints to prevent invalid data from being stored. Constraints enforce data integrity rules at the lowest level, ensuring no invalid data can enter the system regardless of application logic bugs.

---

## ADDED Requirements

### Requirement: Fatigue Percentage Bounds Validation

The system SHALL enforce valid fatigue percentage ranges at the database level.

**Rationale:** Fatigue percentages must be between 0% and 100%. Invalid values break recovery calculations and UI displays.

**Location:** `backend/database/schema.sql` - `muscle_states` table

#### Scenario: Valid fatigue percentage is accepted
**GIVEN** a muscle state with `initial_fatigue_percent` of 75
**WHEN** the record is inserted or updated
**THEN** the database accepts the operation
**AND** the value is stored as 75.0

#### Scenario: Negative fatigue percentage is rejected
**GIVEN** a muscle state with `initial_fatigue_percent` of -10
**WHEN** the record is inserted or updated
**THEN** the database raises a constraint violation error
**AND** the operation is rolled back
**AND** no data is modified

#### Scenario: Fatigue percentage over 100 is rejected
**GIVEN** a muscle state with `initial_fatigue_percent` of 150
**WHEN** the record is inserted or updated
**THEN** the database raises a constraint violation error
**AND** the operation is rolled back
**AND** no data is modified

#### Scenario: Zero fatigue is accepted
**GIVEN** a muscle state with `initial_fatigue_percent` of 0
**WHEN** the record is inserted or updated
**THEN** the database accepts the operation
**AND** the value is stored as 0.0

#### Scenario: Exactly 100% fatigue is accepted
**GIVEN** a muscle state with `initial_fatigue_percent` of 100
**WHEN** the record is inserted or updated
**THEN** the database accepts the operation
**AND** the value is stored as 100.0

---

### Requirement: Exercise Set Weight Validation

The system SHALL enforce reasonable weight ranges for exercise sets.

**Rationale:** Negative weights are impossible, and extremely high weights (>10,000 lbs) are data entry errors.

**Location:** `backend/database/schema.sql` - `exercise_sets` table

#### Scenario: Valid weight is accepted
**GIVEN** an exercise set with weight of 45 lbs
**WHEN** the record is inserted
**THEN** the database accepts the operation
**AND** the weight is stored as 45.0

#### Scenario: Negative weight is rejected
**GIVEN** an exercise set with weight of -25 lbs
**WHEN** the record is inserted
**THEN** the database raises a constraint violation error
**AND** the operation is rolled back

#### Scenario: Zero weight is accepted (bodyweight exercises)
**GIVEN** an exercise set with weight of 0 lbs
**WHEN** the record is inserted
**THEN** the database accepts the operation
**AND** the weight is stored as 0.0

#### Scenario: Extremely high weight is rejected
**GIVEN** an exercise set with weight of 15,000 lbs
**WHEN** the record is inserted
**THEN** the database raises a constraint violation error
**AND** the operation is rolled back

---

### Requirement: Exercise Set Reps Validation

The system SHALL enforce valid repetition counts for exercise sets.

**Rationale:** Reps must be positive integers. Zero or negative reps are invalid, and extremely high reps (>1000) are data entry errors.

**Location:** `backend/database/schema.sql` - `exercise_sets` table

#### Scenario: Valid reps are accepted
**GIVEN** an exercise set with 10 reps
**WHEN** the record is inserted
**THEN** the database accepts the operation
**AND** the reps are stored as 10

#### Scenario: Zero reps are rejected
**GIVEN** an exercise set with 0 reps
**WHEN** the record is inserted
**THEN** the database raises a constraint violation error
**AND** the operation is rolled back

#### Scenario: Negative reps are rejected
**GIVEN** an exercise set with -5 reps
**WHEN** the record is inserted
**THEN** the database raises a constraint violation error
**AND** the operation is rolled back

#### Scenario: Extremely high reps are rejected
**GIVEN** an exercise set with 2000 reps
**WHEN** the record is inserted
**THEN** the database raises a constraint violation error
**AND** the operation is rolled back

---

### Requirement: Muscle Baseline Validation

The system SHALL enforce positive baseline values for muscle capacity.

**Rationale:** Baselines represent maximum muscle capacity and must be positive. Negative or zero baselines break fatigue percentage calculations.

**Location:** `backend/database/schema.sql` - `muscle_baselines` table

#### Scenario: Valid baseline is accepted
**GIVEN** a muscle baseline with `system_learned_max` of 10,000
**WHEN** the record is inserted or updated
**THEN** the database accepts the operation
**AND** the baseline is stored as 10000.0

#### Scenario: Negative baseline is rejected
**GIVEN** a muscle baseline with `system_learned_max` of -5000
**WHEN** the record is inserted or updated
**THEN** the database raises a constraint violation error
**AND** the operation is rolled back

#### Scenario: Zero baseline is rejected
**GIVEN** a muscle baseline with `system_learned_max` of 0
**WHEN** the record is inserted or updated
**THEN** the database raises a constraint violation error
**AND** the operation is rolled back

---

### Requirement: Volume Today Field Removal

The system SHALL remove the redundant `volume_today` field from `muscle_states` table.

**Rationale:** `volume_today` is redundant with data in `exercise_sets` and creates desync risk. Volume should be calculated from source data on-demand.

**Location:** `backend/database/schema.sql` - `muscle_states` table

#### Scenario: Volume today column does not exist after migration
**GIVEN** the database has been migrated to the new schema
**WHEN** a query attempts to SELECT volume_today FROM muscle_states
**THEN** the database raises a "no such column" error

#### Scenario: Existing muscle states remain intact after migration
**GIVEN** the database contains muscle states with volume_today before migration
**WHEN** the migration is applied
**THEN** all muscle states retain their other columns (fatigue, last_trained, etc.)
**AND** the volume_today data is dropped
**AND** no other data is modified

---

### Requirement: NOT NULL Enforcement

The system SHALL enforce required fields with NOT NULL constraints.

**Rationale:** Critical fields like muscle names, exercise names, and user IDs must always have values.

**Location:** `backend/database/schema.sql` - All tables

#### Scenario: Required fields must have values
**GIVEN** a muscle state record with NULL muscle_name
**WHEN** the record is inserted
**THEN** the database raises a NOT NULL constraint violation
**AND** the operation is rolled back

#### Scenario: Optional fields can be NULL
**GIVEN** a muscle state with NULL last_trained
**WHEN** the record is inserted with valid required fields
**THEN** the database accepts the operation
**AND** last_trained is stored as NULL

---

## MODIFIED Requirements

### Requirement: Muscle State Updates Must Validate Input

The system SHALL validate muscle state updates against database constraints before attempting insertion.

**Rationale:** Application-level validation prevents constraint violations and provides better error messages.

**Location:** `backend/database/database.ts` - `updateMuscleStates()`

#### Scenario: Invalid fatigue throws descriptive error
**GIVEN** a muscle state update with fatigue of 150%
**WHEN** `updateMuscleStates()` is called
**THEN** the function throws an error with message "Invalid fatigue for [muscle]: 150. Must be 0-100."
**AND** no database operation is attempted

#### Scenario: Valid update proceeds normally
**GIVEN** a muscle state update with fatigue of 75%
**WHEN** `updateMuscleStates()` is called
**THEN** the validation passes
**AND** the database UPDATE is executed
**AND** the new state is returned

---

## REMOVED Requirements

None. This capability only adds constraints, does not remove existing functionality.

---

## Implementation Notes

### Schema Changes
```sql
-- Add CHECK constraints to muscle_states
ALTER TABLE muscle_states
ADD CONSTRAINT chk_fatigue_range
CHECK (initial_fatigue_percent >= 0 AND initial_fatigue_percent <= 100);

-- Add CHECK constraints to exercise_sets
ALTER TABLE exercise_sets
ADD CONSTRAINT chk_weight_range
CHECK (weight >= 0 AND weight <= 10000);

ALTER TABLE exercise_sets
ADD CONSTRAINT chk_reps_range
CHECK (reps > 0 AND reps <= 1000);

-- Add CHECK constraints to muscle_baselines
ALTER TABLE muscle_baselines
ADD CONSTRAINT chk_baseline_positive
CHECK (system_learned_max > 0);

-- Remove volume_today column
ALTER TABLE muscle_states DROP COLUMN volume_today;
```

### Migration Script
A migration script MUST be provided to:
1. Validate existing data meets new constraints
2. Clean any invalid data (with user confirmation)
3. Apply schema changes
4. Provide rollback script

### Error Handling
Application code MUST catch constraint violations and convert to user-friendly errors.

---

## Testing Requirements

### Unit Tests
- Test each constraint with valid boundary values
- Test each constraint with invalid boundary values
- Test NOT NULL enforcement
- Test migration script on sample data

### Integration Tests
- Test full workout save with invalid data
- Test muscle state update with invalid data
- Test baseline update with invalid data
- Verify constraint errors are caught and handled

---

## Acceptance Criteria

- [ ] All CHECK constraints are added to schema.sql
- [ ] volume_today column is removed from muscle_states
- [ ] Migration script validates and cleans existing data
- [ ] Application code validates before database operations
- [ ] All constraint violations throw descriptive errors
- [ ] All tests pass with new constraints
- [ ] Rollback script is tested and works correctly

---

*Spec created: 2025-10-29*
*Last updated: 2025-10-29*

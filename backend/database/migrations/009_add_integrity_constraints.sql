-- Migration 009: Add Data Integrity Constraints
-- This migration adds CHECK constraints to enforce data validity at the database level
-- and removes the redundant volume_today column from muscle_states

-- Note: SQLite doesn't support ALTER TABLE ADD CONSTRAINT for CHECK constraints
-- on existing tables, so we need to recreate tables with the new constraints

BEGIN TRANSACTION;

-- ============================================================
-- STEP 1: Validate existing data before applying constraints
-- ============================================================

-- Check for invalid fatigue values in muscle_states
SELECT 'Checking muscle_states for invalid fatigue values...' as status;
SELECT
  id, muscle_name, initial_fatigue_percent,
  'Invalid fatigue: ' || initial_fatigue_percent as issue
FROM muscle_states
WHERE initial_fatigue_percent < 0 OR initial_fatigue_percent > 100;

-- Check for invalid fatigue values in detailed_muscle_states
SELECT 'Checking detailed_muscle_states for invalid fatigue values...' as status;
SELECT
  id, detailed_muscle_name, fatigue_percent,
  'Invalid fatigue: ' || fatigue_percent as issue
FROM detailed_muscle_states
WHERE fatigue_percent < 0 OR fatigue_percent > 100;

-- Check for invalid weights in exercise_sets
SELECT 'Checking exercise_sets for invalid weights...' as status;
SELECT
  id, exercise_name, weight,
  'Invalid weight: ' || weight as issue
FROM exercise_sets
WHERE weight < 0 OR weight > 10000;

-- Check for invalid reps in exercise_sets
SELECT 'Checking exercise_sets for invalid reps...' as status;
SELECT
  id, exercise_name, reps,
  'Invalid reps: ' || reps as issue
FROM exercise_sets
WHERE reps <= 0 OR reps > 1000;

-- Check for invalid baselines in muscle_baselines
SELECT 'Checking muscle_baselines for invalid system_learned_max...' as status;
SELECT
  id, muscle_name, system_learned_max,
  'Invalid baseline: ' || system_learned_max as issue
FROM muscle_baselines
WHERE system_learned_max <= 0;

-- Check for invalid user_override in muscle_baselines
SELECT 'Checking muscle_baselines for invalid user_override...' as status;
SELECT
  id, muscle_name, user_override,
  'Invalid override: ' || user_override as issue
FROM muscle_baselines
WHERE user_override IS NOT NULL AND user_override <= 0;

-- ============================================================
-- STEP 2: Clean invalid data (if any exists)
-- ============================================================

-- Clamp fatigue values to valid range (0-100)
UPDATE muscle_states
SET initial_fatigue_percent = CASE
  WHEN initial_fatigue_percent < 0 THEN 0
  WHEN initial_fatigue_percent > 100 THEN 100
  ELSE initial_fatigue_percent
END
WHERE initial_fatigue_percent < 0 OR initial_fatigue_percent > 100;

UPDATE detailed_muscle_states
SET fatigue_percent = CASE
  WHEN fatigue_percent < 0 THEN 0
  WHEN fatigue_percent > 100 THEN 100
  ELSE fatigue_percent
END
WHERE fatigue_percent < 0 OR fatigue_percent > 100;

-- Clamp weights to valid range (0-10000)
UPDATE exercise_sets
SET weight = CASE
  WHEN weight < 0 THEN 0
  WHEN weight > 10000 THEN 10000
  ELSE weight
END
WHERE weight < 0 OR weight > 10000;

-- Clamp reps to valid range (1-1000)
UPDATE exercise_sets
SET reps = CASE
  WHEN reps <= 0 THEN 1
  WHEN reps > 1000 THEN 1000
  ELSE reps
END
WHERE reps <= 0 OR reps > 1000;

-- Fix invalid baselines
UPDATE muscle_baselines
SET system_learned_max = 10000
WHERE system_learned_max <= 0;

UPDATE muscle_baselines
SET user_override = NULL
WHERE user_override IS NOT NULL AND user_override <= 0;

-- ============================================================
-- STEP 3: Recreate tables with constraints
-- ============================================================

-- 3.1: Recreate exercise_sets with constraints
SELECT 'Recreating exercise_sets with CHECK constraints...' as status;

ALTER TABLE exercise_sets RENAME TO exercise_sets_old;

CREATE TABLE exercise_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  weight REAL NOT NULL CHECK(weight >= 0 AND weight <= 10000),
  reps INTEGER NOT NULL CHECK(reps > 0 AND reps <= 1000),
  set_number INTEGER NOT NULL,
  to_failure INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

INSERT INTO exercise_sets (id, workout_id, exercise_name, weight, reps, set_number, to_failure, created_at)
SELECT id, workout_id, exercise_name, weight, reps, set_number, to_failure, created_at
FROM exercise_sets_old;

DROP TABLE exercise_sets_old;

-- 3.2: Recreate muscle_states with constraints and remove volume_today
SELECT 'Recreating muscle_states with CHECK constraints and removing volume_today...' as status;

ALTER TABLE muscle_states RENAME TO muscle_states_old;

CREATE TABLE muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  initial_fatigue_percent REAL NOT NULL DEFAULT 0 CHECK(initial_fatigue_percent >= 0 AND initial_fatigue_percent <= 100),
  last_trained TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)
);

INSERT INTO muscle_states (id, user_id, muscle_name, initial_fatigue_percent, last_trained, updated_at)
SELECT id, user_id, muscle_name, initial_fatigue_percent, last_trained, updated_at
FROM muscle_states_old;

DROP TABLE muscle_states_old;

-- 3.3: Recreate detailed_muscle_states with fatigue constraint
SELECT 'Recreating detailed_muscle_states with fatigue CHECK constraint...' as status;

ALTER TABLE detailed_muscle_states RENAME TO detailed_muscle_states_old;

CREATE TABLE detailed_muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- Muscle identification
  detailed_muscle_name TEXT NOT NULL,
  visualization_muscle_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('primary', 'secondary', 'stabilizer')),

  -- Current state (with fatigue constraint)
  fatigue_percent REAL NOT NULL DEFAULT 0 CHECK(fatigue_percent >= 0 AND fatigue_percent <= 100),
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,

  -- Baseline capacity
  baseline_capacity REAL NOT NULL,
  baseline_source TEXT DEFAULT 'inherited' CHECK(
    baseline_source IN ('inherited', 'learned', 'user_override')
  ),
  baseline_confidence TEXT DEFAULT 'low' CHECK(
    baseline_confidence IN ('low', 'medium', 'high')
  ),

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, detailed_muscle_name)
);

INSERT INTO detailed_muscle_states (
  id, user_id, detailed_muscle_name, visualization_muscle_name, role,
  fatigue_percent, volume_today, last_trained,
  baseline_capacity, baseline_source, baseline_confidence,
  created_at, updated_at
)
SELECT
  id, user_id, detailed_muscle_name, visualization_muscle_name, role,
  fatigue_percent, volume_today, last_trained,
  baseline_capacity, baseline_source, baseline_confidence,
  created_at, updated_at
FROM detailed_muscle_states_old;

DROP TABLE detailed_muscle_states_old;

-- 3.4: Recreate muscle_baselines with constraints
SELECT 'Recreating muscle_baselines with CHECK constraints...' as status;

ALTER TABLE muscle_baselines RENAME TO muscle_baselines_old;

CREATE TABLE muscle_baselines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  system_learned_max REAL NOT NULL DEFAULT 10000 CHECK(system_learned_max > 0),
  user_override REAL CHECK(user_override IS NULL OR user_override > 0),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)
);

INSERT INTO muscle_baselines (id, user_id, muscle_name, system_learned_max, user_override, updated_at)
SELECT id, user_id, muscle_name, system_learned_max, user_override, updated_at
FROM muscle_baselines_old;

DROP TABLE muscle_baselines_old;

-- ============================================================
-- STEP 4: Recreate indexes (lost during table recreation)
-- ============================================================

SELECT 'Recreating indexes...' as status;

CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout ON exercise_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_to_failure ON exercise_sets(to_failure);
CREATE INDEX IF NOT EXISTS idx_muscle_states_user ON muscle_states(user_id);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_user ON detailed_muscle_states(user_id);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_viz ON detailed_muscle_states(visualization_muscle_name);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_role ON detailed_muscle_states(role);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_updated ON detailed_muscle_states(updated_at);
CREATE INDEX IF NOT EXISTS idx_muscle_baselines_user ON muscle_baselines(user_id);
CREATE INDEX IF NOT EXISTS idx_muscle_baselines_updated ON muscle_baselines(updated_at);

-- ============================================================
-- STEP 5: Verify constraints are working
-- ============================================================

SELECT 'Verifying constraints...' as status;

-- Test constraint: Try to insert invalid fatigue (should fail if constraints work)
-- Commented out since this will fail the transaction if constraints work
-- INSERT INTO muscle_states (user_id, muscle_name, initial_fatigue_percent) VALUES (1, 'test_muscle', 150);

-- Instead, we'll just query the schema to confirm constraints are in place
SELECT sql FROM sqlite_master WHERE type='table' AND name='muscle_states';
SELECT sql FROM sqlite_master WHERE type='table' AND name='exercise_sets';
SELECT sql FROM sqlite_master WHERE type='table' AND name='muscle_baselines';
SELECT sql FROM sqlite_master WHERE type='table' AND name='detailed_muscle_states';

SELECT '✓ Migration 009 completed successfully!' as status;
SELECT '✓ CHECK constraints added to all tables' as status;
SELECT '✓ volume_today column removed from muscle_states' as status;
SELECT '✓ All existing data validated and cleaned' as status;

COMMIT;

-- Rollback: Remove to_failure column from exercise_sets table
-- Created: 2025-10-24
-- Change ID: enable-failure-tracking-and-pr-detection

-- WARNING: This will remove the to_failure column and all its data
-- Only run this if you need to rollback the migration

-- Drop index first
DROP INDEX IF EXISTS idx_exercise_sets_to_failure;

-- Note: SQLite does not support dropping columns directly
-- To rollback, you would need to:
-- 1. Create a new table without the to_failure column
-- 2. Copy data from old table to new table (excluding to_failure)
-- 3. Drop old table
-- 4. Rename new table

-- For now, this is a placeholder. In practice, you would:
-- 1. Back up your database before applying migrations
-- 2. Restore from backup if rollback is needed

-- If you must rollback, use this process:
/*
CREATE TABLE exercise_sets_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

INSERT INTO exercise_sets_new (id, workout_id, exercise_name, weight, reps, set_number, created_at)
SELECT id, workout_id, exercise_name, weight, reps, set_number, created_at FROM exercise_sets;

DROP TABLE exercise_sets;
ALTER TABLE exercise_sets_new RENAME TO exercise_sets;

CREATE INDEX idx_exercise_sets_workout ON exercise_sets(workout_id);
*/

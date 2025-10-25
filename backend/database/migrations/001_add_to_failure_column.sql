-- Migration: Add to_failure column to exercise_sets table
-- Created: 2025-10-24
-- Change ID: enable-failure-tracking-and-pr-detection

-- Add to_failure column (INTEGER for SQLite boolean, DEFAULT 1 for TRUE)
ALTER TABLE exercise_sets ADD COLUMN to_failure INTEGER DEFAULT 1;

-- Create index for future queries filtering by failure status
CREATE INDEX IF NOT EXISTS idx_exercise_sets_to_failure ON exercise_sets(to_failure);

-- Verify migration
-- All existing sets should now have to_failure = 1
-- SELECT COUNT(*) as total, SUM(to_failure) as to_failure_count FROM exercise_sets;

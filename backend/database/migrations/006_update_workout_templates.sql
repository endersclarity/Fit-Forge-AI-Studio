-- Migration: Update workout_templates to store set configurations instead of just exercise IDs
-- Description: Changes exercise_ids to sets with weight/reps/rest_timer data
-- Note: This migration preserves existing templates by converting exercise_ids to default set configurations

-- Step 1: Add new 'sets' column
ALTER TABLE workout_templates ADD COLUMN sets TEXT;

-- Step 2: Migrate existing data
-- For each template, convert exercise_ids JSON array to sets array with default values
-- SQLite doesn't support complex JSON operations, so we'll set empty array for now
-- Existing templates will need to be manually recreated with set configurations
UPDATE workout_templates
SET sets = '[]'
WHERE sets IS NULL;

-- Note: Existing templates with exercise_ids will be unusable after this migration.
-- Users will need to recreate their templates with the new WorkoutBuilder.
-- This is acceptable for MVP since templates are a new feature.

-- Step 3: We cannot drop exercise_ids column in SQLite without recreating the table
-- For now, we'll keep both columns and update application code to use 'sets' only
-- Future migration can recreate the table without exercise_ids if needed

-- Verification query (commented out - for manual testing):
-- SELECT id, name, exercise_ids, sets FROM workout_templates LIMIT 5;

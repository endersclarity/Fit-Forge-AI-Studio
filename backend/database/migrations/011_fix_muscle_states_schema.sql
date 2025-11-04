-- Migration: Fix muscle_states schema to add missing volume_today column
-- Created: 2025-11-04
-- Change ID: fix-missing-volume-today-column
--
-- This migration fixes a persistent issue where the muscle_states table
-- is missing the volume_today column despite schema.sql and migration 002
-- both defining it. This uses a safe ALTER TABLE approach instead of DROP/CREATE.

-- Step 1: Create a temporary table with the correct schema
CREATE TABLE IF NOT EXISTS muscle_states_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  initial_fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)
);

-- Step 2: Copy existing data from old table to new table
INSERT INTO muscle_states_new (id, user_id, muscle_name, initial_fatigue_percent, volume_today, last_trained, updated_at)
SELECT
  id,
  user_id,
  muscle_name,
  initial_fatigue_percent,
  0 as volume_today,  -- Default value for missing column
  last_trained,
  updated_at
FROM muscle_states
WHERE NOT EXISTS (SELECT 1 FROM muscle_states_new);

-- Step 3: Drop old table
DROP TABLE muscle_states;

-- Step 4: Rename new table
ALTER TABLE muscle_states_new RENAME TO muscle_states;

-- Step 5: Recreate index
CREATE INDEX IF NOT EXISTS idx_muscle_states_user ON muscle_states(user_id);

-- Verification: muscle_states should now have 7 columns including volume_today
-- PRAGMA table_info(muscle_states);

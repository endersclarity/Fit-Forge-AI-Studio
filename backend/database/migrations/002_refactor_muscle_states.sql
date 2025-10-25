-- Migration: Refactor muscle_states table for backend-driven calculations
-- Created: 2025-10-25
-- Change ID: refactor-backend-driven-muscle-states

-- Drop existing muscle_states table
-- Safe because: only test data exists, user approved data wipe
DROP TABLE IF EXISTS muscle_states;

-- Recreate muscle_states table with new schema
CREATE TABLE muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  initial_fatigue_percent REAL NOT NULL DEFAULT 0,  -- Renamed from fatigue_percent for semantic clarity
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,                                -- Kept: UTC ISO 8601 timestamp of last workout
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)                      -- Fixed: composite constraint for multi-user support
);

-- Recreate index for query performance
CREATE INDEX IF NOT EXISTS idx_muscle_states_user ON muscle_states(user_id);

-- Re-initialize all 13 muscle groups for default user
INSERT INTO muscle_states (user_id, muscle_name) VALUES
  (1, 'Pectoralis'),
  (1, 'Triceps'),
  (1, 'Deltoids'),
  (1, 'Lats'),
  (1, 'Biceps'),
  (1, 'Rhomboids'),
  (1, 'Trapezius'),
  (1, 'Forearms'),
  (1, 'Quadriceps'),
  (1, 'Glutes'),
  (1, 'Hamstrings'),
  (1, 'Calves'),
  (1, 'Core');

-- Verify migration
-- Should have 7 columns: id, user_id, muscle_name, initial_fatigue_percent, volume_today, last_trained, updated_at
-- Should have 13 rows (one per muscle)
-- SELECT COUNT(*) FROM muscle_states; -- Expected: 13
-- PRAGMA table_info(muscle_states); -- Verify column names

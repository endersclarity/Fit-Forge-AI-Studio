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

-- Note: User-specific data initialization removed
-- Muscle states are now created during user onboarding via initializeProfile()
-- This ensures proper multi-user support without hardcoded user_id=1

-- Verify migration
-- Should have 7 columns: id, user_id, muscle_name, initial_fatigue_percent, volume_today, last_trained, updated_at
-- PRAGMA table_info(muscle_states); -- Verify column names

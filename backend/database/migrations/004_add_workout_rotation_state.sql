-- Migration: Add workout rotation state tracking
-- Created: 2025-10-27
-- Purpose: Track user's position in workout rotation sequence

CREATE TABLE IF NOT EXISTS workout_rotation_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  current_cycle TEXT NOT NULL DEFAULT 'A' CHECK(current_cycle IN ('A', 'B')),
  current_phase INTEGER NOT NULL DEFAULT 0 CHECK(current_phase >= 0 AND current_phase <= 5),
  last_workout_date TEXT, -- ISO 8601 format
  last_workout_category TEXT CHECK(last_workout_category IN ('Push', 'Pull', 'Legs', 'Core') OR last_workout_category IS NULL),
  last_workout_variation TEXT CHECK(last_workout_variation IN ('A', 'B') OR last_workout_variation IS NULL),
  rest_days_count INTEGER DEFAULT 0 CHECK(rest_days_count >= 0),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster user lookup
CREATE INDEX IF NOT EXISTS idx_rotation_state_user ON workout_rotation_state(user_id);

-- Initialize default state for existing user (user_id = 1)
INSERT INTO workout_rotation_state (user_id, current_cycle, current_phase, rest_days_count)
VALUES (1, 'A', 0, 0)
ON CONFLICT(user_id) DO NOTHING;

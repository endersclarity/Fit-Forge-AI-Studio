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

-- Note: User-specific data initialization removed
-- Workout rotation state is now created during user onboarding via initializeProfile()
-- This ensures proper multi-user support without hardcoded user_id=1

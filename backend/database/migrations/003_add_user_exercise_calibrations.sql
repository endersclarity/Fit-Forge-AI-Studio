-- Migration: Add user exercise calibrations table
-- Date: 2025-10-26
-- Purpose: Enable personal muscle engagement overrides
-- Related: openspec/changes/2025-10-26-implement-personal-engagement-calibration

-- Create table for storing user calibrations
CREATE TABLE IF NOT EXISTS user_exercise_calibrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exercise_id TEXT NOT NULL,           -- e.g., "ex03" (matches Exercise.id)
  muscle_name TEXT NOT NULL,           -- e.g., "Pectoralis" (matches Muscle enum)
  engagement_percentage REAL NOT NULL, -- 0-100
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, exercise_id, muscle_name)
);

-- Index for fast lookups by user and exercise
CREATE INDEX IF NOT EXISTS idx_calibrations_user_exercise
  ON user_exercise_calibrations(user_id, exercise_id);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_calibrations_user
  ON user_exercise_calibrations(user_id);

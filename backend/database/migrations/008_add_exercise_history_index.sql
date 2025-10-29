-- Migration: Add index for exercise history queries
-- Purpose: Optimize exercise history API performance (<200ms requirement)
-- Created: 2025-10-29

-- Index for workouts table: user_id + date DESC for exercise history lookups
CREATE INDEX IF NOT EXISTS idx_workouts_user_exercise_date
ON workouts(user_id, date DESC);

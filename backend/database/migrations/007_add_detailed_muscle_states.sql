-- Migration 007: Add Detailed Muscle States Table (Dual-Layer Muscle Tracking)
-- Purpose: Enable granular tracking of 42 specific muscles while maintaining 13-muscle visualization
-- Part of: openspec/changes/2025-10-29-implement-dual-layer-muscle-tracking

-- Create detailed muscle states table
CREATE TABLE IF NOT EXISTS detailed_muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- Muscle identification
  detailed_muscle_name TEXT NOT NULL,
  visualization_muscle_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('primary', 'secondary', 'stabilizer')),

  -- Current state (same structure as muscle_states)
  fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,

  -- Baseline capacity
  baseline_capacity REAL NOT NULL,
  baseline_source TEXT DEFAULT 'inherited' CHECK(
    baseline_source IN ('inherited', 'learned', 'user_override')
  ),
  baseline_confidence TEXT DEFAULT 'low' CHECK(
    baseline_confidence IN ('low', 'medium', 'high')
  ),

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, detailed_muscle_name)
);

-- Note: Foreign key to muscle_baselines removed from migration due to SQLite limitations
-- Constraint will be enforced at application level

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_user ON detailed_muscle_states(user_id);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_viz ON detailed_muscle_states(visualization_muscle_name);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_role ON detailed_muscle_states(role);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_updated ON detailed_muscle_states(updated_at);

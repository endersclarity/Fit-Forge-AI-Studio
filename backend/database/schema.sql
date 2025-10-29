-- FitForge Local Database Schema
-- SQLite database for storing all workout and user data

-- Users table (even though single user, keeps it organized)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT 'Athlete',
  experience TEXT NOT NULL DEFAULT 'Beginner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bodyweight history
CREATE TABLE IF NOT EXISTS bodyweight_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  weight REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Equipment inventory
CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  min_weight REAL,
  max_weight REAL,
  weight_increment REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Workouts
CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  category TEXT,
  variation TEXT,
  progression_method TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Exercise sets
CREATE TABLE IF NOT EXISTS exercise_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  to_failure INTEGER DEFAULT 1, -- 1 = true (set taken to failure), 0 = false (submaximal)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

-- Muscle states (stores immutable historical facts, not calculated values)
CREATE TABLE IF NOT EXISTS muscle_states (
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

-- Personal bests
CREATE TABLE IF NOT EXISTS personal_bests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  best_single_set REAL,
  best_session_volume REAL,
  rolling_average_max REAL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, exercise_name)
);

-- Muscle baselines (learned capacity for each muscle)
CREATE TABLE IF NOT EXISTS muscle_baselines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  system_learned_max REAL NOT NULL DEFAULT 10000,
  user_override REAL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)
);

-- Detailed muscle states (granular tracking for 42+ specific muscles)
-- Dual-layer architecture: Detailed tracking for recuperation, aggregated display for UI
CREATE TABLE IF NOT EXISTS detailed_muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- Muscle identification
  detailed_muscle_name TEXT NOT NULL,      -- DetailedMuscle enum value
  visualization_muscle_name TEXT NOT NULL, -- Maps to Muscle enum (for aggregation)
  role TEXT NOT NULL CHECK(role IN ('primary', 'secondary', 'stabilizer')),

  -- Current state (same structure as muscle_states)
  fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,  -- ISO 8601 date

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

-- Note: Foreign key to muscle_baselines enforced at application level due to SQLite ALTER TABLE limitations

-- Workout templates (saved workout configurations)
CREATE TABLE IF NOT EXISTS workout_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  variation TEXT NOT NULL,
  exercise_ids TEXT, -- DEPRECATED: Old format (JSON array of exercise IDs) - kept for migration compatibility
  sets TEXT, -- JSON array of TemplateSet objects: [{exerciseId, weight, reps, restTimerSeconds}, ...]
  is_favorite INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User exercise calibrations (personal muscle engagement overrides)
CREATE TABLE IF NOT EXISTS user_exercise_calibrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exercise_id TEXT NOT NULL,
  muscle_name TEXT NOT NULL,
  engagement_percentage REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, exercise_id, muscle_name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout ON exercise_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_to_failure ON exercise_sets(to_failure);
CREATE INDEX IF NOT EXISTS idx_muscle_states_user ON muscle_states(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_bests_user ON personal_bests(user_id);
CREATE INDEX IF NOT EXISTS idx_muscle_baselines_user ON muscle_baselines(user_id);
CREATE INDEX IF NOT EXISTS idx_muscle_baselines_updated ON muscle_baselines(updated_at);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_user ON detailed_muscle_states(user_id);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_viz ON detailed_muscle_states(visualization_muscle_name);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_role ON detailed_muscle_states(role);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_updated ON detailed_muscle_states(updated_at);
CREATE INDEX IF NOT EXISTS idx_workout_templates_user ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_calibrations_user_exercise ON user_exercise_calibrations(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_calibrations_user ON user_exercise_calibrations(user_id);

-- Default user initialization removed - handled by onboarding flow
-- See: openspec/changes/2025-10-26-enable-first-time-user-onboarding/
-- The initializeProfile() function in database.ts creates user + muscle states + baselines

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
  variation TEXT,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

-- Muscle states (current fatigue and recovery)
CREATE TABLE IF NOT EXISTS muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL UNIQUE,
  fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  recovered_at TEXT,
  last_trained TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout ON exercise_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_muscle_states_user ON muscle_states(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_bests_user ON personal_bests(user_id);
CREATE INDEX IF NOT EXISTS idx_muscle_baselines_user ON muscle_baselines(user_id);

-- Insert default user
INSERT OR IGNORE INTO users (id, name, experience) VALUES (1, 'Athlete', 'Beginner');

-- Initialize all muscle states with default values
INSERT OR IGNORE INTO muscle_states (user_id, muscle_name, fatigue_percent, volume_today) VALUES
  (1, 'Pectoralis', 0, 0),
  (1, 'Triceps', 0, 0),
  (1, 'Deltoids', 0, 0),
  (1, 'Lats', 0, 0),
  (1, 'Biceps', 0, 0),
  (1, 'Rhomboids', 0, 0),
  (1, 'Trapezius', 0, 0),
  (1, 'Forearms', 0, 0),
  (1, 'Quadriceps', 0, 0),
  (1, 'Glutes', 0, 0),
  (1, 'Hamstrings', 0, 0),
  (1, 'Calves', 0, 0),
  (1, 'Core', 0, 0);

-- Initialize all muscle baselines
INSERT OR IGNORE INTO muscle_baselines (user_id, muscle_name, system_learned_max) VALUES
  (1, 'Pectoralis', 10000),
  (1, 'Triceps', 10000),
  (1, 'Deltoids', 10000),
  (1, 'Lats', 10000),
  (1, 'Biceps', 10000),
  (1, 'Rhomboids', 10000),
  (1, 'Trapezius', 10000),
  (1, 'Forearms', 10000),
  (1, 'Quadriceps', 10000),
  (1, 'Glutes', 10000),
  (1, 'Hamstrings', 10000),
  (1, 'Calves', 10000),
  (1, 'Core', 10000);

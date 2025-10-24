const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get user profile
app.get('/api/profile', (req, res) => {
  try {
    const profile = db.getProfile();
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
app.put('/api/profile', (req, res) => {
  try {
    const profile = db.updateProfile(req.body);
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all workouts
app.get('/api/workouts', (req, res) => {
  try {
    const workouts = db.getWorkouts();
    res.json(workouts);
  } catch (error) {
    console.error('Error getting workouts:', error);
    res.status(500).json({ error: 'Failed to get workouts' });
  }
});

// Save a new workout
app.post('/api/workouts', (req, res) => {
  try {
    const workout = db.saveWorkout(req.body);
    res.status(201).json(workout);
  } catch (error) {
    console.error('Error saving workout:', error);
    res.status(500).json({ error: 'Failed to save workout' });
  }
});

// Get muscle states
app.get('/api/muscle-states', (req, res) => {
  try {
    const states = db.getMuscleStates();
    res.json(states);
  } catch (error) {
    console.error('Error getting muscle states:', error);
    res.status(500).json({ error: 'Failed to get muscle states' });
  }
});

// Update muscle states
app.put('/api/muscle-states', (req, res) => {
  try {
    const states = db.updateMuscleStates(req.body);
    res.json(states);
  } catch (error) {
    console.error('Error updating muscle states:', error);
    res.status(500).json({ error: 'Failed to update muscle states' });
  }
});

// Get personal bests
app.get('/api/personal-bests', (req, res) => {
  try {
    const pbs = db.getPersonalBests();
    res.json(pbs);
  } catch (error) {
    console.error('Error getting personal bests:', error);
    res.status(500).json({ error: 'Failed to get personal bests' });
  }
});

// Update personal bests
app.put('/api/personal-bests', (req, res) => {
  try {
    const pbs = db.updatePersonalBests(req.body);
    res.json(pbs);
  } catch (error) {
    console.error('Error updating personal bests:', error);
    res.status(500).json({ error: 'Failed to update personal bests' });
  }
});

// Get muscle baselines
app.get('/api/muscle-baselines', (req, res) => {
  try {
    const baselines = db.getMuscleBaselines();
    res.json(baselines);
  } catch (error) {
    console.error('Error getting muscle baselines:', error);
    res.status(500).json({ error: 'Failed to get muscle baselines' });
  }
});

// Update muscle baselines
app.put('/api/muscle-baselines', (req, res) => {
  try {
    const baselines = db.updateMuscleBaselines(req.body);
    res.json(baselines);
  } catch (error) {
    console.error('Error updating muscle baselines:', error);
    res.status(500).json({ error: 'Failed to update muscle baselines' });
  }
});

// ============================================
// Serve React Frontend (in production)
// ============================================

// Serve static files from frontend build
const frontendPath = path.join(__dirname, '../dist');
app.use(express.static(frontendPath));

// All other routes serve the React app (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('🏋️  FitForge Local Server');
  console.log('='.repeat(50));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log(`Database location: ${process.env.DB_PATH || '../data/fitforge.db'}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.db.close();
  process.exit(0);
});

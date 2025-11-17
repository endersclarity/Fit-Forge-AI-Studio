// Load environment variables from .env.local (for local npm development)
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
// Restrict CORS to localhost origins only to prevent CSRF attacks
const corsOptions = {
  origin: [
    'http://localhost:3000',      // Vite dev server / Docker frontend
    'http://localhost:5173',      // Vite default port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false,
  maxAge: 86400
};

app.use(cors(corsOptions));
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

// Get all workouts (with optional pagination)
app.get('/api/workouts', (req, res) => {
  try {
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 100) : null;
    const workouts = db.getWorkouts(limit);
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

// Get all workout templates
app.get('/api/templates', (req, res) => {
  try {
    const templates = db.getWorkoutTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error getting workout templates:', error);
    res.status(500).json({ error: 'Failed to get workout templates' });
  }
});

// Get a single workout template by ID
app.get('/api/templates/:id', (req, res) => {
  try {
    const template = db.getWorkoutTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error getting workout template:', error);
    res.status(500).json({ error: 'Failed to get workout template' });
  }
});

// Create a new workout template
app.post('/api/templates', (req, res) => {
  try {
    const template = db.createWorkoutTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating workout template:', error);
    res.status(500).json({ error: 'Failed to create workout template' });
  }
});

// Update a workout template
app.put('/api/templates/:id', (req, res) => {
  try {
    const template = db.updateWorkoutTemplate(req.params.id, req.body);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error updating workout template:', error);
    res.status(500).json({ error: 'Failed to update workout template' });
  }
});

// Delete a workout template
app.delete('/api/templates/:id', (req, res) => {
  try {
    const success = db.deleteWorkoutTemplate(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout template:', error);
    res.status(500).json({ error: 'Failed to delete workout template' });
  }
});

// ============================================
// 404 Handler for Non-API Routes
// ============================================

// This is an API-only server. All routes should start with /api.
// Frontend is served separately (via Docker container or Vite dev server).
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'This is an API-only server. Frontend is served separately.',
    hint: 'API routes start with /api. Did you mean to access the frontend at http://localhost:3000?'
  });
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

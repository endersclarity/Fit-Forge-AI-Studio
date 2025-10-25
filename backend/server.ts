// Load environment variables from .env.local (for local npm development)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as db from './database/database';
import {
  ProfileResponse,
  ProfileUpdateRequest,
  WorkoutResponse,
  WorkoutSaveRequest,
  MuscleStatesResponse,
  MuscleStatesUpdateRequest,
  PersonalBestsResponse,
  PersonalBestsUpdateRequest,
  MuscleBaselinesResponse,
  MuscleBaselinesUpdateRequest,
  WorkoutTemplate,
  HealthCheckResponse,
  ApiErrorResponse
} from './types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;

// Middleware
// Restrict CORS to localhost origins only to prevent CSRF attacks
const corsOptions: cors.CorsOptions = {
  origin: [
    'http://localhost:3000',      // Vite dev server / Docker frontend
    'http://localhost:5173',      // Vite default port
    'http://localhost:5000',      // Serve port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/health', (_req: Request, res: Response<HealthCheckResponse>) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get user profile
app.get('/api/profile', (_req: Request, res: Response<ProfileResponse | ApiErrorResponse>) => {
  try {
    const profile = db.getProfile();
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
app.put('/api/profile', (req: Request<{}, ProfileResponse | ApiErrorResponse, ProfileUpdateRequest>, res: Response<ProfileResponse | ApiErrorResponse>) => {
  try {
    const profile = db.updateProfile(req.body);
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all workouts
app.get('/api/workouts', (_req: Request, res: Response<WorkoutResponse[] | ApiErrorResponse>) => {
  try {
    const workouts = db.getWorkouts();
    res.json(workouts);
  } catch (error) {
    console.error('Error getting workouts:', error);
    res.status(500).json({ error: 'Failed to get workouts' });
  }
});

// Get last workout by category
app.get('/api/workouts/last', (req: Request, res: Response<WorkoutResponse | ApiErrorResponse>) => {
  try {
    const category = req.query.category as string;

    if (!category) {
      res.status(400).json({ error: 'Category parameter is required' });
      return;
    }

    const workout = db.getLastWorkoutByCategory(category);

    if (!workout) {
      res.status(404).json({ error: `No workout found for category: ${category}` });
      return;
    }

    res.json(workout);
  } catch (error) {
    console.error('Error getting last workout:', error);
    res.status(500).json({ error: 'Failed to get last workout' });
  }
});

// Save a new workout
app.post('/api/workouts', (req: Request<{}, WorkoutResponse | ApiErrorResponse, WorkoutSaveRequest>, res: Response<WorkoutResponse | ApiErrorResponse>) => {
  try {
    const workout = db.saveWorkout(req.body);
    res.status(201).json(workout);
  } catch (error) {
    console.error('Error saving workout:', error);
    res.status(500).json({ error: 'Failed to save workout' });
  }
});

// Get muscle states
app.get('/api/muscle-states', (_req: Request, res: Response<MuscleStatesResponse | ApiErrorResponse>) => {
  try {
    const states = db.getMuscleStates();
    res.json(states);
  } catch (error) {
    console.error('Error getting muscle states:', error);
    res.status(500).json({ error: 'Failed to get muscle states' });
  }
});

// Update muscle states
app.put('/api/muscle-states', (req: Request<{}, MuscleStatesResponse | ApiErrorResponse, MuscleStatesUpdateRequest>, res: Response<MuscleStatesResponse | ApiErrorResponse>) => {
  try {
    const states = db.updateMuscleStates(req.body);
    res.json(states);
  } catch (error) {
    console.error('Error updating muscle states:', error);
    res.status(500).json({ error: 'Failed to update muscle states' });
  }
});

// Get personal bests
app.get('/api/personal-bests', (_req: Request, res: Response<PersonalBestsResponse | ApiErrorResponse>) => {
  try {
    const pbs = db.getPersonalBests();
    res.json(pbs);
  } catch (error) {
    console.error('Error getting personal bests:', error);
    res.status(500).json({ error: 'Failed to get personal bests' });
  }
});

// Update personal bests
app.put('/api/personal-bests', (req: Request<{}, PersonalBestsResponse | ApiErrorResponse, PersonalBestsUpdateRequest>, res: Response<PersonalBestsResponse | ApiErrorResponse>) => {
  try {
    const pbs = db.updatePersonalBests(req.body);
    res.json(pbs);
  } catch (error) {
    console.error('Error updating personal bests:', error);
    res.status(500).json({ error: 'Failed to update personal bests' });
  }
});

// Get muscle baselines
app.get('/api/muscle-baselines', (_req: Request, res: Response<MuscleBaselinesResponse | ApiErrorResponse>) => {
  try {
    const baselines = db.getMuscleBaselines();
    res.json(baselines);
  } catch (error) {
    console.error('Error getting muscle baselines:', error);
    res.status(500).json({ error: 'Failed to get muscle baselines' });
  }
});

// Update muscle baselines
app.put('/api/muscle-baselines', (req: Request<{}, MuscleBaselinesResponse | ApiErrorResponse, MuscleBaselinesUpdateRequest>, res: Response<MuscleBaselinesResponse | ApiErrorResponse>) => {
  try {
    const baselines = db.updateMuscleBaselines(req.body);
    res.json(baselines);
  } catch (error) {
    console.error('Error updating muscle baselines:', error);
    res.status(500).json({ error: 'Failed to update muscle baselines' });
  }
});

// Get all workout templates
app.get('/api/templates', (_req: Request, res: Response<WorkoutTemplate[] | ApiErrorResponse>) => {
  try {
    const templates = db.getWorkoutTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error getting workout templates:', error);
    res.status(500).json({ error: 'Failed to get workout templates' });
  }
});

// Get a single workout template by ID
app.get('/api/templates/:id', (req: Request<{ id: string }>, res: Response<WorkoutTemplate | ApiErrorResponse>) => {
  try {
    const template = db.getWorkoutTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    return res.json(template);
  } catch (error) {
    console.error('Error getting workout template:', error);
    return res.status(500).json({ error: 'Failed to get workout template' });
  }
});

// Create a new workout template
app.post('/api/templates', (req: Request<{}, WorkoutTemplate | ApiErrorResponse, Omit<WorkoutTemplate, 'id' | 'timesUsed' | 'createdAt' | 'updatedAt'>>, res: Response<WorkoutTemplate | ApiErrorResponse>) => {
  try {
    const template = db.createWorkoutTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating workout template:', error);
    res.status(500).json({ error: 'Failed to create workout template' });
  }
});

// Update a workout template
app.put('/api/templates/:id', (req: Request<{ id: string }, WorkoutTemplate | ApiErrorResponse, Partial<WorkoutTemplate>>, res: Response<WorkoutTemplate | ApiErrorResponse>) => {
  try {
    const template = db.updateWorkoutTemplate(req.params.id, req.body);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    return res.json(template);
  } catch (error) {
    console.error('Error updating workout template:', error);
    return res.status(500).json({ error: 'Failed to update workout template' });
  }
});

// Delete a workout template
app.delete('/api/templates/:id', (req: Request<{ id: string }>, res: Response<{ success: boolean } | ApiErrorResponse>) => {
  try {
    const success = db.deleteWorkoutTemplate(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Template not found' });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout template:', error);
    return res.status(500).json({ error: 'Failed to delete workout template' });
  }
});

// ============================================
// 404 Handler for Non-API Routes
// ============================================

// This is an API-only server. All routes should start with /api.
// Frontend is served separately (via Docker container or Vite dev server).
app.use((_req: Request, res: Response<ApiErrorResponse>) => {
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
  console.log(`Server running on: http://0.0.0.0:${PORT}`);
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

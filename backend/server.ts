// Load environment variables from .env.local (for local npm development)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as db from './database/database';
import { getAnalytics, AnalyticsResponse } from './database/analytics';
import { getExerciseByName } from './constants';
import {
  ProfileResponse,
  ProfileUpdateRequest,
  ProfileInitRequest,
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
  ApiErrorResponse,
  QuickAddRequest,
  QuickAddResponse
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
  } catch (error: any) {
    if (error.code === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    } else {
      console.error('Error getting profile:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
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

// Initialize user profile (first-time setup)
app.post('/api/profile/init', (req: Request<{}, ProfileResponse | ApiErrorResponse, ProfileInitRequest>, res: Response<ProfileResponse | ApiErrorResponse>) => {
  try {
    // Validate required fields
    if (!req.body.name || req.body.name.trim() === '') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (!req.body.experience || !['Beginner', 'Intermediate', 'Advanced'].includes(req.body.experience)) {
      res.status(400).json({ error: 'Valid experience level is required (Beginner, Intermediate, or Advanced)' });
      return;
    }

    // Validate equipment if provided
    if (req.body.equipment) {
      for (const item of req.body.equipment) {
        if (!item.name || item.minWeight === undefined || item.maxWeight === undefined || item.increment === undefined) {
          res.status(400).json({ error: 'Equipment must have name, minWeight, maxWeight, and increment' });
          return;
        }
        if (item.minWeight < 0 || item.maxWeight < item.minWeight || item.increment <= 0) {
          res.status(400).json({ error: 'Invalid equipment values' });
          return;
        }
      }
    }

    const profile = db.initializeProfile(req.body);
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error initializing profile:', error);
    res.status(500).json({ error: 'Failed to initialize profile' });
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
app.get('/api/workouts/last', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const includeVariationSuggestion = req.query.includeVariationSuggestion === 'true';

    if (!category) {
      res.status(400).json({ error: 'Category parameter is required' });
      return;
    }

    // If only variation suggestion is needed
    if (includeVariationSuggestion) {
      const variationSuggestion = db.getLastVariationForCategory(category);
      res.json(variationSuggestion);
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

// Get progressive overload suggestions for an exercise
app.get('/api/progressive-suggestions', (req: Request, res: Response) => {
  try {
    const exerciseName = req.query.exercise as string;

    if (!exerciseName) {
      return res.status(400).json({ error: 'Exercise parameter is required' });
    }

    const suggestions = db.getProgressiveSuggestions(exerciseName);

    if (!suggestions) {
      return res.status(404).json({ error: `No history found for exercise: ${exerciseName}` });
    }

    return res.json(suggestions);
  } catch (error) {
    console.error('Error getting progressive suggestions:', error);
    return res.status(500).json({ error: 'Failed to get progressive suggestions' });
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

// Get last two sets for an exercise (for smart defaults)
app.get('/api/workouts/last-two-sets', (req: Request, res: Response): Response => {
  try {
    const exerciseName = req.query.exerciseName as string;

    if (!exerciseName) {
      return res.status(400).json({ error: 'exerciseName parameter is required' });
    }

    const sets = db.db.prepare(`
      SELECT weight, reps, to_failure, es.created_at as date
      FROM exercise_sets es
      JOIN workouts w ON es.workout_id = w.id
      WHERE w.user_id = 1 AND es.exercise_name = ?
      ORDER BY es.created_at DESC
      LIMIT 2
    `).all(exerciseName) as Array<{ weight: number; reps: number; to_failure: number; date: string }>;

    return res.json({
      lastSet: sets[0] ? { ...sets[0], to_failure: Boolean(sets[0].to_failure) } : null,
      secondLastSet: sets[1] ? { ...sets[1], to_failure: Boolean(sets[1].to_failure) } : null
    });
  } catch (error) {
    console.error('Error getting last two sets:', error);
    return res.status(500).json({ error: 'Failed to get last two sets' });
  }
});

// Quick-add workout
app.post('/api/quick-add', (req: Request<{}, QuickAddResponse | ApiErrorResponse, QuickAddRequest>, res: Response<QuickAddResponse | ApiErrorResponse>): Response => {
  try {
    const { exercise_name, weight, reps, to_failure = false, date } = req.body;

    // Validation
    const exercise = getExerciseByName(exercise_name);
    if (!exercise) {
      return res.status(400).json({ error: 'Invalid exercise name' });
    }
    if (!weight || weight <= 0 || weight > 10000) {
      return res.status(400).json({ error: 'Weight must be between 0 and 10000 lbs' });
    }
    if (!reps || reps <= 0 || reps > 1000 || !Number.isInteger(reps)) {
      return res.status(400).json({ error: 'Reps must be a positive integer between 1 and 1000' });
    }

    const exerciseDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Create quick-add workout
    const workoutData: WorkoutSaveRequest = {
      date: exerciseDate,
      category: exercise.category,
      variation: 'Both',
      durationSeconds: 0,
      exercises: [
        {
          exercise: exercise_name,
          sets: [
            {
              weight,
              reps
            }
          ]
        }
      ]
    };

    // Save workout
    const workout = db.saveWorkout(workoutData);

    // Update to_failure flag if needed (since saveWorkout doesn't handle it yet)
    if (to_failure) {
      db.db.prepare(`
        UPDATE exercise_sets
        SET to_failure = 1
        WHERE workout_id = ?
      `).run(workout.id);
    }

    // Note: In this simplified implementation, muscle states and PR detection
    // are handled by the frontend. The backend just creates the workout record.
    // For the full backend refactor (Phase 1 of the proposal), these calculations
    // would be moved to the backend.

    // Get current muscle states
    const muscle_states = db.getMuscleStates();

    return res.status(201).json({
      workout,
      muscle_states,
      attached_to_active: false
    });
  } catch (error) {
    console.error('Error in quick-add:', error);
    return res.status(500).json({ error: 'Failed to log exercise' });
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

// Get analytics data
app.get('/api/analytics', (req: Request, res: Response<AnalyticsResponse | ApiErrorResponse>) => {
  try {
    const timeRange = req.query.timeRange ? parseInt(req.query.timeRange as string, 10) : 90;

    // Validate timeRange
    if (isNaN(timeRange) || timeRange < 1 || timeRange > 3650) {
      return res.status(400).json({
        error: 'Invalid timeRange parameter',
        message: 'timeRange must be a number between 1 and 3650 days'
      });
    }

    const analytics = getAnalytics(1, timeRange);
    return res.json(analytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    return res.status(500).json({ error: 'Failed to get analytics data' });
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

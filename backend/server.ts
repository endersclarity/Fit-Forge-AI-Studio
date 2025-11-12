// Load environment variables from .env.local (for local npm development)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as db from './database/database';
import { getAnalytics, AnalyticsResponse, calculateWorkoutMetrics, CalculatedMetricsResponse } from './database/analytics';
import { getExerciseByName } from './constants';
// Epic 1 Services (Story 1.1, 1.2, 1.3, 1.4)
// @ts-ignore - JS module without type definitions
import { calculateMuscleFatigue } from './services/fatigueCalculator.js';
// @ts-ignore - JS module without type definitions
import { checkForBaselineUpdates } from './services/baselineUpdater.js';
// @ts-ignore - JS module without type definitions
import { loadExerciseLibrary, loadBaselineData } from './services/dataLoaders.js';
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
  QuickAddResponse,
  QuickWorkoutRequest,
  QuickWorkoutResponse,
  BuilderWorkoutRequest,
  ExerciseCalibrationData,
  CalibrationMap,
  SaveCalibrationRequest,
  WorkoutRecommendation,
  ExerciseHistoryResponse
} from './types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Middleware
// CORS configuration - supports both development and production
const allowedOrigins = [
  'http://localhost:3000',      // Vite dev server / Docker frontend
  'http://localhost:5173',      // Vite default port
  'http://localhost:5000',      // Serve port
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000'
];

// Add production frontend URL from environment variable
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
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

// DEBUG: Check database schema
app.get('/api/debug/schema', (_req: Request, res: Response) => {
  try {
    const schema = db.getDatabaseSchemaInfo();
    res.json(schema);
  } catch (error) {
    console.error('Error getting schema:', error);
    res.status(500).json({ error: 'Failed to get schema' });
  }
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
    // Validate recovery_days_to_full if provided (range: 3-10 days)
    if (req.body.recovery_days_to_full !== undefined) {
      const recoveryDays = req.body.recovery_days_to_full;
      if (!Number.isInteger(recoveryDays) || recoveryDays < 3 || recoveryDays > 10) {
        res.status(400).json({
          error: 'Invalid recovery_days_to_full',
          message: 'Recovery days must be an integer between 3 and 10'
        });
        return;
      }
    }

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

// Get exercise history
app.get('/api/exercise-history/:exerciseId/latest', (req: Request, res: Response<ExerciseHistoryResponse | ApiErrorResponse>) => {
  try {
    const { exerciseId } = req.params;

    if (!exerciseId) {
      return res.status(400).json({ error: 'Exercise ID is required' });
    }

    const history = db.getExerciseHistory(exerciseId);
    return res.json(history);
  } catch (error) {
    console.error('Error getting exercise history:', error);
    return res.status(500).json({ error: 'Failed to get exercise history' });
  }
});

// Save a new workout
app.post('/api/workouts', (req: Request<{}, WorkoutResponse | ApiErrorResponse, WorkoutSaveRequest>, res: Response<WorkoutResponse | ApiErrorResponse>) => {
  try {
    const workout = db.saveWorkout(req.body);

    console.log('[DEBUG] Workout saved:', {
      workoutId: workout.id,
      date: workout.date,
      exerciseCount: req.body.exercises.length
    });

    // Advance rotation if category and variation are provided
    if (workout.category && workout.variation) {
      db.advanceRotation(1, workout.category as any, workout.variation as 'A' | 'B', workout.date);
    }

    return res.status(201).json(workout);
  } catch (error: any) {
    console.error('Error saving workout:', error);

    // Check if it's a constraint violation
    if (error.message && error.message.includes('CHECK constraint failed')) {
      return res.status(400).json({
        error: 'Invalid workout data',
        message: error.message
      });
    }

    // Check if it's a validation error from application layer
    if (error.message && (
      error.message.includes('Invalid fatigue') ||
      error.message.includes('Invalid weight') ||
      error.message.includes('Invalid reps')
    )) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }

    return res.status(500).json({ error: 'Failed to save workout' });
  }
});

// Calculate metrics for a workout (muscle volume, fatigue, baselines, PRs)
app.post('/api/workouts/:id/calculate-metrics', (req: Request, res: Response<CalculatedMetricsResponse | ApiErrorResponse>) => {
  try {
    const workoutId = parseInt(req.params.id);
    if (isNaN(workoutId)) {
      return res.status(400).json({ error: 'Invalid workout ID' });
    }

    const metrics = calculateWorkoutMetrics(workoutId);
    return res.status(200).json(metrics);
  } catch (error: any) {
    console.error('Error calculating workout metrics:', error);

    if (error.message && error.message.includes('Workout not found')) {
      return res.status(404).json({
        error: 'Workout not found',
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'Failed to calculate workout metrics',
      message: error.message
    });
  }
});

// Get deletion preview for a workout
app.get('/api/workouts/:id/delete-preview', (req: Request, res: Response) => {
  try {
    const workoutId = parseInt(req.params.id);
    if (isNaN(workoutId)) {
      return res.status(400).json({ error: 'Invalid workout ID' });
    }

    const preview = db.getWorkoutDeletionPreview(workoutId);
    return res.json(preview);
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Workout not found' });
    }
    console.error('Error getting deletion preview:', error);
    return res.status(500).json({ error: 'Failed to get deletion preview' });
  }
});

// Delete a workout and recalculate all dependent state
app.delete('/api/workouts/:id', (req: Request, res: Response) => {
  try {
    const workoutId = parseInt(req.params.id);
    if (isNaN(workoutId)) {
      return res.status(400).json({ error: 'Invalid workout ID' });
    }

    const result = db.deleteWorkoutWithRecalculation(workoutId);
    return res.json(result);
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Workout not found' });
    }
    console.error('Error deleting workout:', error);
    return res.status(500).json({ error: 'Failed to delete workout', message: error.message });
  }
});

// Get detailed muscle states (43 detailed muscles with current fatigue)
// NOTE: This MUST come BEFORE /api/muscle-states to avoid route collision
app.get('/api/muscle-states/detailed', (_req: Request, res: Response) => {
  try {
    const states = db.getDetailedMuscleStates();
    res.json(states);
  } catch (error) {
    console.error('Error getting detailed muscle states:', error);
    res.status(500).json({ error: 'Failed to get detailed muscle states' });
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

// ============================================
// WORKOUT ROTATION ENDPOINTS
// ============================================

// Get next recommended workout
app.get('/api/rotation/next', (_req: Request, res: Response<WorkoutRecommendation | ApiErrorResponse>): Response => {
  try {
    const recommendation = db.getNextWorkout(1);
    return res.json(recommendation);
  } catch (error) {
    console.error('Error getting next workout:', error);
    return res.status(500).json({ error: 'Failed to get next workout recommendation' });
  }
});

// ============================================
// QUICK-ADD / QUICK-WORKOUT ENDPOINTS
// ============================================

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

// Quick-workout (batch multi-exercise, multi-set workout logger)
app.post('/api/quick-workout', (req: Request<{}, QuickWorkoutResponse | ApiErrorResponse, QuickWorkoutRequest>, res: Response<QuickWorkoutResponse | ApiErrorResponse>): Response => {
  try {
    const { exercises, timestamp } = req.body;

    // Validation
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ error: 'At least one exercise is required' });
    }

    // Validate all exercises and sets
    for (const exercise of exercises) {
      const exerciseInfo = getExerciseByName(exercise.exercise_name);
      if (!exerciseInfo) {
        return res.status(400).json({ error: `Invalid exercise name: ${exercise.exercise_name}` });
      }

      if (!exercise.sets || !Array.isArray(exercise.sets) || exercise.sets.length === 0) {
        return res.status(400).json({ error: `Exercise ${exercise.exercise_name} must have at least one set` });
      }

      for (const set of exercise.sets) {
        if (set.weight === undefined || set.weight === null || set.weight < 0 || set.weight > 10000) {
          return res.status(400).json({ error: `Weight must be between 0 and 10000 lbs for ${exercise.exercise_name}` });
        }
        if (!set.reps || set.reps <= 0 || set.reps > 1000 || !Number.isInteger(set.reps)) {
          return res.status(400).json({ error: `Reps must be a positive integer between 1 and 1000 for ${exercise.exercise_name}` });
        }
      }
    }

    const workoutDate = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Category auto-detection: Count exercises by category, pick majority
    const categoryCounts: Record<string, number> = {};
    let firstCategory = '';
    for (const exercise of exercises) {
      const exerciseInfo = getExerciseByName(exercise.exercise_name)!;
      const category = exerciseInfo.category;
      if (!firstCategory) firstCategory = category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }

    const detectedCategory = Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a] > categoryCounts[b] ? a : b
    ) || firstCategory;

    // Variation auto-detection: Check last workout of same category, alternate A/B
    const lastWorkouts = db.getWorkouts(); // Get all workouts
    const lastWorkoutOfCategory = lastWorkouts
      .filter((w: any) => w.category === detectedCategory)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    let detectedVariation: 'A' | 'B' = 'A';
    if (lastWorkoutOfCategory) {
      const lastVariation = lastWorkoutOfCategory.variation;
      detectedVariation = lastVariation === 'A' ? 'B' : 'A';
    }

    // Duration estimation: (total_sets * 30) + ((total_sets - 1) * 60) seconds
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const durationSeconds = (totalSets * 30) + (Math.max(0, totalSets - 1) * 60);

    // Create workout
    const workoutData: WorkoutSaveRequest = {
      date: workoutDate,
      category: detectedCategory,
      variation: detectedVariation,
      durationSeconds,
      exercises: exercises.map(ex => ({
        exercise: ex.exercise_name,
        sets: ex.sets.map(s => ({
          weight: s.weight,
          reps: s.reps,
          to_failure: s.to_failure
        }))
      }))
    };

    const workout = db.saveWorkout(workoutData);

    // Advance rotation
    db.advanceRotation(1, detectedCategory as any, detectedVariation, workoutDate);

    // Detect PRs across all exercises in the workout
    const prs = db.detectPRsForWorkout(workout.id);

    // Baseline updates are returned from saveWorkout if any were made
    const updated_baselines = workout.updated_baselines || [];

    return res.status(201).json({
      workout_id: workout.id,
      category: detectedCategory,
      variation: detectedVariation,
      duration_seconds: durationSeconds,
      prs,
      updated_baselines,
      muscle_states_updated: true
    });
  } catch (error) {
    console.error('Error in quick-workout:', error);
    return res.status(500).json({ error: 'Failed to save workout' });
  }
});

// Builder-workout (workout from WorkoutBuilder with rest timer metadata)
app.post('/api/builder-workout', (req: Request<{}, QuickWorkoutResponse | ApiErrorResponse, BuilderWorkoutRequest>, res: Response<QuickWorkoutResponse | ApiErrorResponse>): Response => {
  try {
    const { sets, timestamp, was_executed } = req.body;

    // Validation
    if (!sets || !Array.isArray(sets) || sets.length === 0) {
      return res.status(400).json({ error: 'At least one set is required' });
    }

    // Group sets by exercise_name
    const exerciseGroups: Map<string, any[]> = new Map();

    for (const set of sets) {
      // Validate exercise exists
      const exerciseInfo = getExerciseByName(set.exercise_name);
      if (!exerciseInfo) {
        return res.status(400).json({ error: `Invalid exercise name: ${set.exercise_name}` });
      }

      // Validate set data
      if (set.weight === undefined || set.weight === null || set.weight < 0 || set.weight > 10000) {
        return res.status(400).json({ error: `Weight must be between 0 and 10000 lbs for ${set.exercise_name}` });
      }
      if (!set.reps || set.reps <= 0 || set.reps > 1000 || !Number.isInteger(set.reps)) {
        return res.status(400).json({ error: `Reps must be a positive integer between 1 and 1000 for ${set.exercise_name}` });
      }

      // Group sets by exercise
      if (!exerciseGroups.has(set.exercise_name)) {
        exerciseGroups.set(set.exercise_name, []);
      }
      exerciseGroups.get(set.exercise_name)!.push({
        weight: set.weight,
        reps: set.reps,
        to_failure: false,  // Builder doesn't track to_failure yet
        bodyweight_at_time: set.bodyweight_at_time,
      });
    }

    // Convert to QuickWorkout format
    const exercises = Array.from(exerciseGroups.entries()).map(([name, sets]) => ({
      exercise_name: name,
      sets: sets,
    }));

    // Reuse quick-workout logic by calling it internally
    const workoutDate = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Category auto-detection
    const categoryCounts: Record<string, number> = {};
    let firstCategory = '';
    for (const [exerciseName] of exerciseGroups.entries()) {
      const exerciseInfo = getExerciseByName(exerciseName)!;
      const category = exerciseInfo.category;
      if (!firstCategory) firstCategory = category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }

    const detectedCategory = Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a] > categoryCounts[b] ? a : b
    ) || firstCategory;

    // Variation auto-detection
    const lastWorkouts = db.getWorkouts();
    const lastWorkoutOfCategory = lastWorkouts
      .filter((w: any) => w.category === detectedCategory)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    let detectedVariation: 'A' | 'B' = 'A';
    if (lastWorkoutOfCategory) {
      const lastVariation = lastWorkoutOfCategory.variation;
      detectedVariation = lastVariation === 'A' ? 'B' : 'A';
    }

    // Duration estimation
    const totalSets = sets.length;
    const durationSeconds = was_executed
      ? sets.reduce((sum, s) => sum + (s.rest_timer_seconds || 90), 0) + (totalSets * 30)
      : (totalSets * 30) + (Math.max(0, totalSets - 1) * 60);

    // Create workout
    const workoutData: WorkoutSaveRequest = {
      date: workoutDate,
      category: detectedCategory,
      variation: detectedVariation,
      durationSeconds,
      exercises: exercises.map(ex => ({
        exercise: ex.exercise_name,
        sets: ex.sets.map(s => ({
          weight: s.weight,
          reps: s.reps,
          to_failure: s.to_failure
        }))
      }))
    };

    const workout = db.saveWorkout(workoutData);

    // Advance rotation
    db.advanceRotation(1, detectedCategory as any, detectedVariation, workoutDate);

    // Detect PRs
    const prs = db.detectPRsForWorkout(workout.id);

    // Baseline updates
    const updated_baselines = workout.updated_baselines || [];

    return res.status(201).json({
      workout_id: workout.id,
      category: detectedCategory,
      variation: detectedVariation,
      duration_seconds: durationSeconds,
      prs,
      updated_baselines,
      muscle_states_updated: true
    });
  } catch (error) {
    console.error('Error in builder-workout:', error);
    return res.status(500).json({ error: 'Failed to save builder workout' });
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

// Seed default workout templates (Push/Pull/Legs/Core A+B variations)
app.post('/api/templates/seed', (_req: Request, res: Response<{ success: boolean; message: string; count: number } | ApiErrorResponse>) => {
  try {
    db.seedDefaultTemplates();
    const templates = db.getWorkoutTemplates();
    return res.json({
      success: true,
      message: 'Default templates seeded successfully',
      count: templates.length
    });
  } catch (error) {
    console.error('Error seeding templates:', error);
    return res.status(500).json({ error: 'Failed to seed default templates' });
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
// Exercise Calibration Routes
// ============================================

// GET /api/calibrations - Get all user calibrations
app.get('/api/calibrations', (_req: Request, res: Response<CalibrationMap | ApiErrorResponse>): Response => {
  try {
    const calibrations = db.getUserCalibrations();
    return res.json(calibrations);
  } catch (error) {
    console.error('Error getting calibrations:', error);
    return res.status(500).json({ error: 'Failed to get calibrations' });
  }
});

// GET /api/calibrations/:exerciseId - Get calibrations for specific exercise (merged with defaults)
app.get('/api/calibrations/:exerciseId', (req: Request, res: Response<ExerciseCalibrationData | ApiErrorResponse>): Response => {
  try {
    const { exerciseId } = req.params;
    const data = db.getExerciseCalibrations(exerciseId);
    return res.json(data);
  } catch (error) {
    console.error('Error getting exercise calibrations:', error);
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('not found')) {
      return res.status(404).json({ error: errorMessage });
    }
    return res.status(500).json({ error: 'Failed to get exercise calibrations' });
  }
});

// PUT /api/calibrations/:exerciseId - Save calibrations for specific exercise
app.put('/api/calibrations/:exerciseId', (req: Request<{ exerciseId: string }, ExerciseCalibrationData | ApiErrorResponse, SaveCalibrationRequest>, res: Response<ExerciseCalibrationData | ApiErrorResponse>) => {
  try {
    const { exerciseId } = req.params;
    const { calibrations } = req.body;

    // Validation
    if (!calibrations || typeof calibrations !== 'object') {
      return res.status(400).json({ error: 'Invalid request body: calibrations object required' });
    }

    for (const [muscle, percentage] of Object.entries(calibrations)) {
      if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
        return res.status(400).json({
          error: `Invalid percentage for ${muscle}: ${percentage}. Must be between 0 and 100.`
        });
      }
    }

    // Save calibrations
    db.saveExerciseCalibrations(exerciseId, calibrations);

    // Return updated merged data
    const updated = db.getExerciseCalibrations(exerciseId);
    return res.json(updated);
  } catch (error) {
    console.error('Error saving calibrations:', error);
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('not found')) {
      return res.status(404).json({ error: errorMessage });
    }
    return res.status(500).json({ error: 'Failed to save calibrations' });
  }
});

// DELETE /api/calibrations/:exerciseId - Reset exercise to default (remove all calibrations)
app.delete('/api/calibrations/:exerciseId', (req: Request, res: Response<{ message: string; exerciseId: string } | ApiErrorResponse>) => {
  try {
    const { exerciseId } = req.params;

    // Get exercise to verify it exists and get the name
    try {
      const exerciseData = db.getExerciseCalibrations(exerciseId);

      // Delete calibrations
      db.deleteExerciseCalibrations(exerciseId);

      return res.json({
        message: `Calibrations reset for exercise: ${exerciseData.exerciseName}`,
        exerciseId
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('not found')) {
        return res.status(404).json({ error: errorMessage });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting calibrations:', error);
    return res.status(500).json({ error: 'Failed to delete calibrations' });
  }
});

// ============================================
// Muscle Intelligence API Endpoints (Epic 2)
// ============================================

// Additional services (using require for now - to be migrated to ES6)
const recoveryCalculator = require('./services/recoveryCalculator');
const exerciseRecommender = require('./services/exerciseRecommender');

// TypeScript interfaces for workout completion endpoint (Story 2.1)
interface WorkoutCompletionRequest {
  exercises: Array<{
    exerciseId: string;
    sets: Array<{
      reps: number;
      weight: number;
      toFailure: boolean;
    }>;
  }>;
}

interface BaselineSuggestion {
  muscle: string;
  currentBaseline: number;
  suggestedBaseline: number;
  achievedVolume: number;
  exercise: string;
  date: string;
  percentIncrease: number;
}

interface WorkoutCompletionResponse {
  fatigue: Record<string, number>;
  baselineSuggestions: BaselineSuggestion[];
  summary: {
    totalVolume: number;
    prsAchieved: string[];
  };
}

// TypeScript interfaces for recovery timeline endpoint (Story 2.2)
interface MuscleRecoveryState {
  name: string;
  currentFatigue: number;
  projections: {
    '24h': number;
    '48h': number;
    '72h': number;
  };
  fullyRecoveredAt: string | null;
}

interface RecoveryTimelineResponse {
  muscles: MuscleRecoveryState[];
}

// POST /api/workouts/:id/complete - Calculate fatigue after workout completion (Story 2.1)
app.post('/api/workouts/:id/complete', async (req: Request, res: Response<WorkoutCompletionResponse | ApiErrorResponse>) => {
  try {
    const workoutId = parseInt(req.params.id);
    const { exercises } = req.body as WorkoutCompletionRequest;

    // Input validation
    if (isNaN(workoutId) || workoutId <= 0) {
      return res.status(400).json({ error: 'Invalid workout ID' });
    }

    if (!exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Invalid request: exercises array required' });
    }

    if (exercises.length === 0) {
      return res.status(400).json({ error: 'Invalid request: exercises array cannot be empty' });
    }

    // Validate exercises structure
    for (const exercise of exercises) {
      if (!exercise.exerciseId || typeof exercise.exerciseId !== 'string') {
        return res.status(400).json({ error: 'Invalid request: each exercise must have an exerciseId string' });
      }
      if (!exercise.sets || !Array.isArray(exercise.sets)) {
        return res.status(400).json({ error: 'Invalid request: each exercise must have a sets array' });
      }
      for (const set of exercise.sets) {
        if (typeof set.reps !== 'number' || typeof set.weight !== 'number' || typeof set.toFailure !== 'boolean') {
          return res.status(400).json({ error: 'Invalid request: each set must have reps (number), weight (number), and toFailure (boolean)' });
        }
      }
    }

    // Verify workout exists in database
    const allWorkouts = db.getWorkouts();
    const workout = allWorkouts.find((w: any) => w.id === workoutId);

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Load exercise library and baseline data (Epic 1 data loaders)
    const exerciseLibrary = loadExerciseLibrary();
    const baselineData = loadBaselineData();

    // Convert baseline data to format expected by calculateMuscleFatigue
    const baselines: Record<string, number> = {};
    baselineData.forEach((baseline: any) => {
      baselines[baseline.muscle] = baseline.baselineCapacity;
    });

    // Calculate fatigue using Epic 1 service (Story 1.1)
    // Transform exercises into workout format expected by service
    const workoutForCalculation = {
      exercises: exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets
      }))
    };

    const fatigueResults = calculateMuscleFatigue(workoutForCalculation, exerciseLibrary, baselines);

    // Check for baseline updates using Epic 1 service (Story 1.4)
    const baselineSuggestions = checkForBaselineUpdates(exercises, new Date().toISOString());

    // Store muscle fatigue states in database (AC 3)
    const muscleStatesToStore: Record<string, any> = {};
    fatigueResults.muscleStates.forEach((muscleState: any) => {
      muscleStatesToStore[muscleState.muscle] = {
        fatiguePercent: muscleState.displayFatigue,
        volumeToday: muscleState.volume,
        recoveredAt: null,
        lastTrained: workout.date || new Date().toISOString()
      };
    });
    db.updateMuscleStates(muscleStatesToStore);

    // Calculate workout summary metrics (AC 4)
    // Total volume: sum of (weight × reps) for all sets
    const totalVolume = exercises.reduce((sum, ex) => {
      return sum + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0);
    }, 0);

    // PRs achieved: Use detectPRsForWorkout to check for personal records
    const prsDetected = db.detectPRsForWorkout(workoutId);
    const prsAchieved: string[] = prsDetected.map((pr: any) => pr.exerciseName);

    // Format and return response (AC 4, 5)
    const fatigue: Record<string, number> = {};
    fatigueResults.muscleStates.forEach((muscleState: any) => {
      fatigue[muscleState.muscle] = muscleState.displayFatigue;
    });

    const response: WorkoutCompletionResponse = {
      fatigue,
      baselineSuggestions,
      summary: {
        totalVolume: Math.round(totalVolume),
        prsAchieved
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error completing workout:', error);
    return res.status(500).json({
      error: 'Failed to complete workout',
      message: (error as Error).message
    });
  }
});

// GET /api/recovery/timeline - Fetch current recovery state for all muscles (Story 2.2)
app.get('/api/recovery/timeline', async (_req: Request, res: Response<RecoveryTimelineResponse | ApiErrorResponse>) => {
  try {
    // Define all 15 muscle groups
    const ALL_MUSCLES = [
      'Pectoralis', 'Lats', 'AnteriorDeltoids', 'PosteriorDeltoids',
      'Trapezius', 'Rhomboids', 'LowerBack', 'Core', 'Biceps',
      'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves'
    ];

    // Get latest muscle states from database
    const muscleStatesFromDb = db.getMuscleStates();

    // Get current timestamp
    const currentTime = new Date().toISOString();

    // Edge case: No workout history - return all muscles at 0% fatigue
    if (!muscleStatesFromDb || Object.keys(muscleStatesFromDb).length === 0) {
      const response: RecoveryTimelineResponse = {
        muscles: ALL_MUSCLES.map(name => ({
          name,
          currentFatigue: 0,
          projections: { '24h': 0, '48h': 0, '72h': 0 },
          fullyRecoveredAt: null
        }))
      };
      return res.status(200).json(response);
    }

    // Build muscle states array for recovery calculator
    const muscleStatesArray: Array<{ muscle: string, fatiguePercent: number }> = [];
    const workoutTimestamps: Record<string, string> = {};

    // Process each muscle from database
    for (const muscleName of ALL_MUSCLES) {
      const state = muscleStatesFromDb[muscleName];

      if (state && state.lastTrained) {
        // Muscle has workout history
        muscleStatesArray.push({
          muscle: muscleName,
          fatiguePercent: state.initialFatiguePercent || 0
        });
        workoutTimestamps[muscleName] = state.lastTrained;
      } else {
        // Muscle has no workout history - treat as 0% fatigue
        muscleStatesArray.push({
          muscle: muscleName,
          fatiguePercent: 0
        });
        workoutTimestamps[muscleName] = currentTime; // Use current time for muscles with no history
      }
    }

    // Find the most recent workout timestamp (used as reference for recovery calculations)
    const recentWorkoutTimestamp = Object.values(workoutTimestamps)
      .filter(ts => ts !== currentTime)
      .sort()
      .reverse()[0] || currentTime;

    // Calculate recovery using the Epic 1 service (Story 1.2)
    const recoveryResult = recoveryCalculator.calculateRecovery(
      muscleStatesArray,
      recentWorkoutTimestamp,
      currentTime
    );

    // Format response
    const muscles: MuscleRecoveryState[] = recoveryResult.muscleStates.map((muscleState: any) => ({
      name: muscleState.muscle,
      currentFatigue: muscleState.currentFatigue,
      projections: muscleState.projections,
      fullyRecoveredAt: muscleState.fullyRecoveredAt
    }));

    // Sort by current fatigue (most fatigued first) for better UX
    muscles.sort((a, b) => b.currentFatigue - a.currentFatigue);

    const response: RecoveryTimelineResponse = { muscles };
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error getting recovery timeline:', error);
    return res.status(500).json({
      error: 'Failed to calculate recovery timeline'
    });
  }
});

// POST /api/recommendations/exercises - Get ranked exercise recommendations
app.post('/api/recommendations/exercises', async (req: Request, res: Response) => {
  try {
    const { targetMuscle, currentWorkout = [], availableEquipment = [] } = req.body;

    // Input validation
    if (!targetMuscle) {
      return res.status(400).json({ error: 'targetMuscle is required' });
    }

    // Define all 15 muscle groups
    const ALL_MUSCLES = [
      'Pectoralis', 'Lats', 'AnteriorDeltoids', 'PosteriorDeltoids',
      'Trapezius', 'Rhomboids', 'LowerBack', 'Core', 'Biceps',
      'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves'
    ];

    // Get current muscle states for recovery data
    const muscleStatesFromDb = db.getMuscleStates();
    const currentTime = new Date().toISOString();

    // Edge case: No workout history - all muscles at 0% fatigue
    if (!muscleStatesFromDb || Object.keys(muscleStatesFromDb).length === 0) {
      const currentFatigue: Record<string, number> = {};
      const currentMuscleVolumes: Record<string, number> = {};

      ALL_MUSCLES.forEach(muscle => {
        currentFatigue[muscle] = 0;
        currentMuscleVolumes[muscle] = 0;
      });

      // Get baselines
      const baselineData = db.getMuscleBaselines();
      const baselines: Record<string, number> = {};
      Object.keys(baselineData).forEach(muscle => {
        const baseline = baselineData[muscle];
        baselines[muscle] = baseline.userOverride || baseline.systemLearnedMax;
      });

      // Get recommendations (all exercises will be safe)
      const recommendations = exerciseRecommender.recommendExercises({
        targetMuscle,
        currentWorkout,
        currentFatigue,
        currentMuscleVolumes,
        baselines,
        availableEquipment
      });

      return res.json(recommendations);
    }

    // Build muscle states array for recovery calculator
    const muscleStatesArray: Array<{ muscle: string, fatiguePercent: number }> = [];
    const workoutTimestamps: Record<string, string> = {};

    // Process each muscle from database
    for (const muscleName of ALL_MUSCLES) {
      const state = muscleStatesFromDb[muscleName];

      if (state && state.lastTrained) {
        // Muscle has workout history
        muscleStatesArray.push({
          muscle: muscleName,
          fatiguePercent: state.fatiguePercent || 0
        });
        workoutTimestamps[muscleName] = state.lastTrained;
      } else {
        // Muscle has no workout history - treat as 0% fatigue
        muscleStatesArray.push({
          muscle: muscleName,
          fatiguePercent: 0
        });
        workoutTimestamps[muscleName] = currentTime;
      }
    }

    // Find the most recent workout timestamp (used as reference for recovery calculations)
    const recentWorkoutTimestamp = Object.values(workoutTimestamps)
      .filter(ts => ts !== currentTime)
      .sort()
      .reverse()[0] || currentTime;

    // Calculate recovery using the Epic 1 service (Story 1.2)
    const recoveryResult = recoveryCalculator.calculateRecovery(
      muscleStatesArray,
      recentWorkoutTimestamp,
      currentTime
    );

    // Build current fatigue and volumes maps for recommender
    const currentFatigue: Record<string, number> = {};
    const currentMuscleVolumes: Record<string, number> = {};

    recoveryResult.muscleStates.forEach((muscleState: any) => {
      currentFatigue[muscleState.muscle] = muscleState.currentFatigue;
      currentMuscleVolumes[muscleState.muscle] = 0; // Default to 0 for MVP
    });

    // Get baselines
    const baselineData = db.getMuscleBaselines();
    const baselines: Record<string, number> = {};
    Object.keys(baselineData).forEach(muscle => {
      const baseline = baselineData[muscle];
      baselines[muscle] = baseline.userOverride || baseline.systemLearnedMax;
    });

    // Get recommendations
    const recommendations = exerciseRecommender.recommendExercises({
      targetMuscle,
      currentWorkout,
      currentFatigue,
      currentMuscleVolumes,
      baselines,
      availableEquipment
    });

    return res.json(recommendations);

  } catch (error) {
    console.error('Error getting exercise recommendations:', error);
    return res.status(500).json({
      error: 'Failed to get exercise recommendations',
      message: (error as Error).message
    });
  }
});

// POST /api/forecast/workout - Predict fatigue for planned exercises
app.post('/api/forecast/workout', async (req: Request, res: Response) => {
  try {
    const { plannedExercises } = req.body;

    // Input validation - AC1: validate required field
    if (!plannedExercises || !Array.isArray(plannedExercises) || plannedExercises.length === 0) {
      return res.status(400).json({ error: 'plannedExercises array is required and must not be empty' });
    }

    // Validate exercise array size
    if (plannedExercises.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 exercises allowed' });
    }

    // Get current timestamp
    const currentTime = new Date();

    // AC1: Query latest muscle states for all 15 muscles (READ ONLY)
    const muscleStatesData = db.getMuscleStates();
    const currentFatigue: Record<string, number> = {};

    // Define all 15 muscle groups
    const ALL_MUSCLES = [
      'Pectoralis', 'Lats', 'AnteriorDeltoids', 'PosteriorDeltoids',
      'Trapezius', 'Rhomboids', 'LowerBack', 'Core', 'Biceps',
      'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves'
    ];

    // AC1: Calculate current recovery for each muscle to get current fatigue
    if (!muscleStatesData || Object.keys(muscleStatesData).length === 0) {
      // Edge case: No workout history - all muscles at 0% fatigue
      ALL_MUSCLES.forEach(muscle => {
        currentFatigue[muscle] = 0;
      });
    } else {
      // Build muscleStatesArray for recovery calculator (ONCE with full array - Story 2.3 pattern)
      const muscleStatesArray: Array<{muscle: string, fatiguePercent: number}> = [];
      let workoutTimestamp = new Date();

      Object.keys(muscleStatesData).forEach(muscle => {
        const state = muscleStatesData[muscle];
        muscleStatesArray.push({
          muscle: muscle,
          fatiguePercent: state.fatiguePercent // Correct property per database.js contract
        });
        // Get workout timestamp from first muscle state
        if (state.lastTrained) {
          workoutTimestamp = new Date(state.lastTrained);
        }
      });

      // Call recovery calculator ONCE with full array (not per-muscle calls)
      const recoveryData = recoveryCalculator.calculateRecovery(
        muscleStatesArray,
        workoutTimestamp.toISOString(),
        currentTime.toISOString()
      );

      // Extract currentFatigue from recovery data
      recoveryData.muscleStates.forEach((state: any) => {
        currentFatigue[state.muscle] = state.currentFatigue;
      });
    }

    // AC2: Get baselines for safe thresholds (READ ONLY)
    const baselineData = db.getMuscleBaselines();
    const baselines: Record<string, number> = {};
    Object.keys(baselineData).forEach(muscle => {
      const baseline = baselineData[muscle];
      baselines[muscle] = baseline.userOverride || baseline.systemLearnedMax;
    });

    // AC2: Load exercise library for fatigue calculation
    const exerciseLibrary = loadExerciseLibrary();

    // AC2: Convert plannedExercises to workout structure for fatigue calculator
    const plannedWorkout = {
      id: -1,
      date: currentTime.toISOString(),
      exercises: plannedExercises
    };

    // AC2: Calculate predicted fatigue using Epic 1 service (NO DATABASE SAVE)
    const predictedFatigueResults = calculateMuscleFatigue(plannedWorkout, exerciseLibrary, baselines);

    // AC2: Extract predicted fatigue deltas by muscle
    const predictedFatigue: Record<string, number> = {};
    predictedFatigueResults.muscleStates.forEach((ms: any) => {
      predictedFatigue[ms.muscle] = ms.displayFatigue;
    });

    // AC3: Combine current fatigue + predicted deltas = projected total fatigue
    const projectedFatigue: Record<string, number> = {};
    const bottlenecks: Array<{
      muscle: string;
      currentFatigue: number;
      predictedDelta: number;
      projectedFatigue: number;
      threshold: number;
      severity: 'critical' | 'warning';
      message: string;
    }> = [];

    // AC4: Identify bottleneck risks
    ALL_MUSCLES.forEach(muscle => {
      const current = currentFatigue[muscle] || 0;
      const predicted = predictedFatigue[muscle] || 0;
      const projected = current + predicted;

      projectedFatigue[muscle] = projected;

      // Get threshold from baselines
      const threshold = baselines[muscle] || 100;

      // AC4: Flag muscles that would exceed safe thresholds
      if (projected >= threshold) {
        // Critical bottleneck (>= 100%)
        bottlenecks.push({
          muscle,
          currentFatigue: current,
          predictedDelta: predicted,
          projectedFatigue: projected,
          threshold,
          severity: 'critical',
          message: `${muscle} would exceed safe fatigue threshold (${projected.toFixed(1)}% of ${threshold}%)`
        });
      } else if (projected >= threshold * 0.8) {
        // Warning bottleneck (80-100%)
        bottlenecks.push({
          muscle,
          currentFatigue: current,
          predictedDelta: predicted,
          projectedFatigue: projected,
          threshold,
          severity: 'warning',
          message: `${muscle} approaching safe limit (${projected.toFixed(1)}% of ${threshold}%)`
        });
      }
    });

    // AC4: Sort bottlenecks by severity (critical first, then warnings)
    bottlenecks.sort((a, b) => {
      if (a.severity === 'critical' && b.severity === 'warning') return -1;
      if (a.severity === 'warning' && b.severity === 'critical') return 1;
      return b.projectedFatigue - a.projectedFatigue;
    });

    // AC5: Determine if workout is safe (no critical bottlenecks)
    const isSafe = !bottlenecks.some(b => b.severity === 'critical');

    // AC5: Format and return response without database modification
    return res.status(200).json({
      currentFatigue,
      predictedFatigue,
      projectedFatigue,
      bottlenecks,
      isSafe
    });

  } catch (error) {
    console.error('Error forecasting workout:', error);
    return res.status(500).json({
      error: 'Failed to forecast workout fatigue',
      message: (error as Error).message
    });
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

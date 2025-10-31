import { db } from './database';
import { Muscle, MuscleStatesResponse, BaselineUpdate, PRInfo } from '../types';

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AnalyticsTimeRange {
  start: string; // ISO date
  end: string;   // ISO date
  days: number;
}

export interface AnalyticsSummary {
  totalWorkouts: number;
  totalVolume: number;
  totalPRs: number;
  currentStreak: number;
  weeklyFrequency: number;
}

export interface ExerciseDataPoint {
  date: string;
  weight: number;
  reps: number;
  volume: number;
}

export interface ExerciseProgression {
  dataPoints: ExerciseDataPoint[];
  bestSingleSet: number;
  percentChange: number;
  latestPR?: {
    date: string;
    weight: number;
    reps: number;
  };
}

export interface MuscleCapacityDataPoint {
  date: string;
  capacity: number;
}

export interface MuscleCapacityTrend {
  dataPoints: MuscleCapacityDataPoint[];
  currentCapacity: number;
  startingCapacity: number;
  percentGrowth: number;
  avgGrowthPerMonth: number;
}

export interface VolumeWeekData {
  weekStart: string;
  Push: number;
  Pull: number;
  Legs: number;
  Core: number;
  total: number;
}

export interface CategoryVolumeData {
  total: number;
  percentChange: number;
}

export interface VolumeTrends {
  byWeek: VolumeWeekData[];
  byCategory: {
    Push: CategoryVolumeData;
    Pull: CategoryVolumeData;
    Legs: CategoryVolumeData;
    Core: CategoryVolumeData;
  };
}

export interface PRTimelineEntry {
  date: string;
  exercise: string;
  newVolume: number;
  previousVolume: number;
  improvement: number;
  percentIncrease: number;
}

export interface ActivityDay {
  date: string;
  workoutCount: number;
  category: string;
}

export interface ConsistencyMetrics {
  currentStreak: number;
  longestStreak: number;
  workoutsThisWeek: number;
  workoutsLastWeek: number;
  avgWeeklyFrequency: number;
  activityCalendar: ActivityDay[];
}

export interface AnalyticsResponse {
  timeRange: AnalyticsTimeRange;
  summary: AnalyticsSummary;
  exerciseProgression: Record<string, ExerciseProgression>;
  muscleCapacityTrends: Record<string, MuscleCapacityTrend>;
  volumeTrends: VolumeTrends;
  prTimeline: PRTimelineEntry[];
  consistencyMetrics: ConsistencyMetrics;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

interface WorkoutRow {
  id: number;
  date: string;
  category: string | null;
  sets: string; // Pipe-delimited sets: "exercise:weight:reps:setNum|exercise:weight:reps:setNum|..."
}

interface ParsedSet {
  exercise: string;
  weight: number;
  reps: number;
  setNumber: number;
}

/**
 * Parse exercise sets from concatenated string
 */
function parseSets(setsString: string | null): ParsedSet[] {
  if (!setsString) return [];

  const sets: ParsedSet[] = [];
  const setGroups = setsString.split('|');

  for (const group of setGroups) {
    const [exercise, weight, reps, setNumber] = group.split(':');
    if (exercise && weight && reps && setNumber) {
      sets.push({
        exercise,
        weight: parseFloat(weight),
        reps: parseInt(reps, 10),
        setNumber: parseInt(setNumber, 10)
      });
    }
  }

  return sets;
}

/**
 * Get start of week (Sunday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Aggregate exercise progression across all workouts
 */
function aggregateExerciseProgression(workouts: WorkoutRow[]): Record<string, ExerciseProgression> {
  const exerciseData: Record<string, ExerciseDataPoint[]> = {};

  // Collect all data points for each exercise
  for (const workout of workouts) {
    const sets = parseSets(workout.sets);
    const exerciseSets: Record<string, ParsedSet[]> = {};

    // Group sets by exercise
    for (const set of sets) {
      if (!exerciseSets[set.exercise]) {
        exerciseSets[set.exercise] = [];
      }
      exerciseSets[set.exercise].push(set);
    }

    // Calculate best set for each exercise in this workout
    for (const [exercise, sets] of Object.entries(exerciseSets)) {
      const bestSet = sets.reduce((best, set) => {
        const volume = set.weight * set.reps;
        const bestVolume = best.weight * best.reps;
        return volume > bestVolume ? set : best;
      }, sets[0]);

      if (!exerciseData[exercise]) {
        exerciseData[exercise] = [];
      }

      exerciseData[exercise].push({
        date: workout.date,
        weight: bestSet.weight,
        reps: bestSet.reps,
        volume: bestSet.weight * bestSet.reps
      });
    }
  }

  // Build progression object for each exercise
  const result: Record<string, ExerciseProgression> = {};

  for (const [exercise, dataPoints] of Object.entries(exerciseData)) {
    // Sort by date
    dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const bestSingleSet = Math.max(...dataPoints.map(dp => dp.volume));
    const percentChange = dataPoints.length >= 2
      ? ((dataPoints[dataPoints.length - 1].volume - dataPoints[0].volume) / dataPoints[0].volume) * 100
      : 0;

    // Find latest PR (highest volume)
    const latestDataPoint = dataPoints[dataPoints.length - 1];
    const latestPR = latestDataPoint.volume === bestSingleSet ? {
      date: latestDataPoint.date,
      weight: latestDataPoint.weight,
      reps: latestDataPoint.reps
    } : undefined;

    result[exercise] = {
      dataPoints,
      bestSingleSet,
      percentChange: Math.round(percentChange * 10) / 10,
      latestPR
    };
  }

  return result;
}

/**
 * Aggregate muscle capacity trends from baseline history
 */
function aggregateMuscleCapacityTrends(
  timeRangeDays: number
): Record<string, MuscleCapacityTrend> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - timeRangeDays);

  // Query muscle baselines with history tracking
  // Note: Current schema doesn't track baseline history, so we'll use current values
  // Future enhancement: Add muscle_baseline_history table
  const baselines = db.prepare(`
    SELECT muscle_name, system_learned_max, user_override, updated_at
    FROM muscle_baselines
    WHERE user_id = 1
  `).all() as Array<{
    muscle_name: string;
    system_learned_max: number;
    user_override: number | null;
    updated_at: string;
  }>;

  const result: Record<string, MuscleCapacityTrend> = {};

  for (const baseline of baselines) {
    const effectiveCapacity = baseline.user_override ?? baseline.system_learned_max;

    // For now, create a simple trend with start and end points
    // Future: Track baseline changes over time
    const dataPoints: MuscleCapacityDataPoint[] = [
      {
        date: startDate.toISOString(),
        capacity: 10000 // Default starting capacity
      },
      {
        date: new Date().toISOString(),
        capacity: effectiveCapacity
      }
    ];

    const startingCapacity = 10000;
    const percentGrowth = ((effectiveCapacity - startingCapacity) / startingCapacity) * 100;
    const monthsElapsed = timeRangeDays / 30;
    const avgGrowthPerMonth = monthsElapsed > 0 ? (effectiveCapacity - startingCapacity) / monthsElapsed : 0;

    result[baseline.muscle_name] = {
      dataPoints,
      currentCapacity: effectiveCapacity,
      startingCapacity,
      percentGrowth: Math.round(percentGrowth * 10) / 10,
      avgGrowthPerMonth: Math.round(avgGrowthPerMonth)
    };
  }

  return result;
}

/**
 * Aggregate volume trends by week and category
 */
function aggregateVolumeTrends(workouts: WorkoutRow[]): VolumeTrends {
  const weeklyData: Record<string, VolumeWeekData> = {};
  const categoryTotals: Record<string, number> = {
    Push: 0,
    Pull: 0,
    Legs: 0,
    Core: 0
  };

  // Process each workout
  for (const workout of workouts) {
    const sets = parseSets(workout.sets);
    const workoutDate = new Date(workout.date);
    const weekStart = getWeekStart(workoutDate);
    const weekKey = weekStart.toISOString().split('T')[0];

    // Initialize week data if needed
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        weekStart: weekKey,
        Push: 0,
        Pull: 0,
        Legs: 0,
        Core: 0,
        total: 0
      };
    }

    // Calculate volume for this workout
    let workoutVolume = 0;
    for (const set of sets) {
      workoutVolume += set.weight * set.reps;
    }

    // Add to appropriate category
    const category = workout.category || 'Core';
    if (category in weeklyData[weekKey]) {
      (weeklyData[weekKey] as any)[category] += workoutVolume;
      weeklyData[weekKey].total += workoutVolume;
      categoryTotals[category] += workoutVolume;
    }
  }

  // Convert to array and sort by week
  const byWeek = Object.values(weeklyData).sort((a, b) =>
    new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
  );

  // Calculate percent changes (comparing to previous period)
  const halfPoint = Math.floor(byWeek.length / 2);
  const firstHalf = byWeek.slice(0, halfPoint);
  const secondHalf = byWeek.slice(halfPoint);

  const firstHalfTotals = {
    Push: firstHalf.reduce((sum, w) => sum + w.Push, 0),
    Pull: firstHalf.reduce((sum, w) => sum + w.Pull, 0),
    Legs: firstHalf.reduce((sum, w) => sum + w.Legs, 0),
    Core: firstHalf.reduce((sum, w) => sum + w.Core, 0)
  };

  const secondHalfTotals = {
    Push: secondHalf.reduce((sum, w) => sum + w.Push, 0),
    Pull: secondHalf.reduce((sum, w) => sum + w.Pull, 0),
    Legs: secondHalf.reduce((sum, w) => sum + w.Legs, 0),
    Core: secondHalf.reduce((sum, w) => sum + w.Core, 0)
  };

  const byCategory = {
    Push: {
      total: categoryTotals.Push,
      percentChange: firstHalfTotals.Push > 0
        ? ((secondHalfTotals.Push - firstHalfTotals.Push) / firstHalfTotals.Push) * 100
        : 0
    },
    Pull: {
      total: categoryTotals.Pull,
      percentChange: firstHalfTotals.Pull > 0
        ? ((secondHalfTotals.Pull - firstHalfTotals.Pull) / firstHalfTotals.Pull) * 100
        : 0
    },
    Legs: {
      total: categoryTotals.Legs,
      percentChange: firstHalfTotals.Legs > 0
        ? ((secondHalfTotals.Legs - firstHalfTotals.Legs) / firstHalfTotals.Legs) * 100
        : 0
    },
    Core: {
      total: categoryTotals.Core,
      percentChange: firstHalfTotals.Core > 0
        ? ((secondHalfTotals.Core - firstHalfTotals.Core) / firstHalfTotals.Core) * 100
        : 0
    }
  };

  return { byWeek, byCategory };
}

/**
 * Aggregate PR timeline from workouts
 */
function aggregatePRTimeline(workouts: WorkoutRow[]): PRTimelineEntry[] {
  const exerciseBests: Record<string, { volume: number; date: string }> = {};
  const prs: PRTimelineEntry[] = [];

  // Process workouts chronologically
  const sortedWorkouts = [...workouts].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const workout of sortedWorkouts) {
    const sets = parseSets(workout.sets);
    const exerciseSets: Record<string, ParsedSet[]> = {};

    // Group sets by exercise
    for (const set of sets) {
      if (!exerciseSets[set.exercise]) {
        exerciseSets[set.exercise] = [];
      }
      exerciseSets[set.exercise].push(set);
    }

    // Check each exercise for PR
    for (const [exercise, sets] of Object.entries(exerciseSets)) {
      const bestSet = sets.reduce((best, set) => {
        const volume = set.weight * set.reps;
        const bestVolume = best.weight * best.reps;
        return volume > bestVolume ? set : best;
      }, sets[0]);

      const volume = bestSet.weight * bestSet.reps;
      const previousBest = exerciseBests[exercise];

      if (!previousBest || volume > previousBest.volume) {
        // New PR!
        const improvement = previousBest ? volume - previousBest.volume : volume;
        const percentIncrease = previousBest
          ? ((volume - previousBest.volume) / previousBest.volume) * 100
          : 100;

        prs.push({
          date: workout.date,
          exercise,
          newVolume: volume,
          previousVolume: previousBest?.volume || 0,
          improvement,
          percentIncrease: Math.round(percentIncrease * 10) / 10
        });

        exerciseBests[exercise] = { volume, date: workout.date };
      }
    }
  }

  // Return PRs in reverse chronological order (most recent first)
  return prs.reverse();
}

/**
 * Calculate consistency metrics
 */
function calculateConsistencyMetrics(workouts: WorkoutRow[]): ConsistencyMetrics {
  if (workouts.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      workoutsThisWeek: 0,
      workoutsLastWeek: 0,
      avgWeeklyFrequency: 0,
      activityCalendar: []
    };
  }

  // Sort workouts by date (newest first)
  const sorted = [...workouts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate current streak (consecutive days with workouts)
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const workoutDates = new Set(sorted.map(w => w.date.split('T')[0]));
  const today = new Date();
  let checkDate = new Date(today);

  // Calculate current streak
  while (true) {
    const dateKey = checkDate.toISOString().split('T')[0];
    if (workoutDates.has(dateKey)) {
      currentStreak++;
    } else if (currentStreak === 0) {
      // Haven't started counting yet, keep checking previous days
    } else {
      break; // Streak ended
    }
    checkDate.setDate(checkDate.getDate() - 1);

    if (currentStreak > 100) break; // Safety limit
  }

  // Calculate longest streak
  const allDates = Array.from(workoutDates).sort();
  tempStreak = 1;

  for (let i = 1; i < allDates.length; i++) {
    const prevDate = new Date(allDates[i - 1]);
    const currDate = new Date(allDates[i]);
    const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  // Calculate workouts this week vs last week
  const thisWeekStart = getWeekStart(today);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  let workoutsThisWeek = 0;
  let workoutsLastWeek = 0;

  for (const workout of workouts) {
    const workoutDate = new Date(workout.date);
    if (workoutDate >= thisWeekStart) {
      workoutsThisWeek++;
    } else if (workoutDate >= lastWeekStart && workoutDate < thisWeekStart) {
      workoutsLastWeek++;
    }
  }

  // Calculate average weekly frequency
  const oldestWorkout = new Date(sorted[sorted.length - 1].date);
  const weeksElapsed = (today.getTime() - oldestWorkout.getTime()) / (1000 * 60 * 60 * 24 * 7);
  const avgWeeklyFrequency = weeksElapsed > 0 ? workouts.length / weeksElapsed : 0;

  // Build activity calendar
  const activityCalendar: ActivityDay[] = [];
  for (const workout of workouts) {
    activityCalendar.push({
      date: workout.date.split('T')[0],
      workoutCount: 1, // Simplified: could aggregate multiple workouts per day
      category: workout.category || 'Core'
    });
  }

  return {
    currentStreak,
    longestStreak,
    workoutsThisWeek,
    workoutsLastWeek,
    avgWeeklyFrequency: Math.round(avgWeeklyFrequency * 10) / 10,
    activityCalendar
  };
}

// ============================================
// MAIN ANALYTICS FUNCTION
// ============================================

/**
 * Get comprehensive analytics for a user within a time range
 */
export function getAnalytics(
  userId: number = 1,
  timeRangeDays: number = 90
): AnalyticsResponse {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - timeRangeDays);

  // Query all workouts in time range with exercise sets
  const workouts = db.prepare(`
    SELECT w.id, w.date, w.category,
      GROUP_CONCAT(
        es.exercise_name || ':' || es.weight || ':' || es.reps || ':' || es.set_number,
        '|'
      ) as sets
    FROM workouts w
    LEFT JOIN exercise_sets es ON w.id = es.workout_id
    WHERE w.user_id = ? AND w.date >= ? AND w.date <= ?
    GROUP BY w.id
    ORDER BY w.date ASC
  `).all(userId, startDate.toISOString(), endDate.toISOString()) as WorkoutRow[];

  // Calculate all analytics
  const exerciseProgression = aggregateExerciseProgression(workouts);
  const muscleCapacityTrends = aggregateMuscleCapacityTrends(timeRangeDays);
  const volumeTrends = aggregateVolumeTrends(workouts);
  const prTimeline = aggregatePRTimeline(workouts);
  const consistencyMetrics = calculateConsistencyMetrics(workouts);

  // Calculate summary stats
  const totalVolume = Object.values(volumeTrends.byCategory).reduce(
    (sum, cat) => sum + cat.total,
    0
  );

  const summary: AnalyticsSummary = {
    totalWorkouts: workouts.length,
    totalVolume,
    totalPRs: prTimeline.length,
    currentStreak: consistencyMetrics.currentStreak,
    weeklyFrequency: consistencyMetrics.avgWeeklyFrequency
  };

  return {
    timeRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days: timeRangeDays
    },
    summary,
    exerciseProgression,
    muscleCapacityTrends,
    volumeTrends,
    prTimeline,
    consistencyMetrics
  };
}

// ============================================
// WORKOUT METRICS CALCULATION
// ============================================

import { EXERCISE_LIBRARY as SHARED_EXERCISE_LIBRARY } from '../../shared/exercise-library';

// Helper function to calculate volume (reps * weight)
function calculateVolume(reps: number, weight: number): number {
  return reps * weight;
}

export interface CalculatedMetricsResponse {
  muscleStates: MuscleStatesResponse;
  updatedBaselines: BaselineUpdate[];
  prsDetected: PRInfo[];
  muscleFatigue: Record<string, number>;
}

/**
 * Calculate all metrics for a workout (muscle volumes, fatigue, baselines, PRs)
 * This is the backend implementation of the logic from App.tsx:handleFinishWorkout()
 */
export function calculateWorkoutMetrics(workoutId: number): CalculatedMetricsResponse {
  // 1. Fetch the workout with all exercises
  const workout = db.prepare(`
    SELECT id, date, category, variation, progression_method, duration_seconds, created_at
    FROM workouts
    WHERE id = ? AND user_id = 1
  `).get(workoutId) as any;

  if (!workout) {
    throw new Error(`Workout not found: ${workoutId}`);
  }

  const exerciseSets = db.prepare(`
    SELECT exercise_name, weight, reps, set_number, to_failure
    FROM exercise_sets
    WHERE workout_id = ?
    ORDER BY set_number ASC
  `).all(workoutId) as Array<{
    exercise_name: string;
    weight: number;
    reps: number;
    set_number: number;
    to_failure: number;
  }>;

  // Group sets by exercise
  const exercisesByName = exerciseSets.reduce((acc, set) => {
    if (!acc[set.exercise_name]) {
      acc[set.exercise_name] = [];
    }
    acc[set.exercise_name].push({
      weight: set.weight,
      reps: set.reps,
      to_failure: Boolean(set.to_failure)
    });
    return acc;
  }, {} as Record<string, Array<{ weight: number; reps: number; to_failure: boolean }>>);

  // 2. Calculate muscle volumes using EXERCISE_LIBRARY
  const ALL_MUSCLES = Object.values(Muscle);
  const workoutMuscleVolumes: Record<Muscle, number> = ALL_MUSCLES.reduce(
    (acc, muscle) => ({ ...acc, [muscle]: 0 }),
    {} as Record<Muscle, number>
  );

  Object.entries(exercisesByName).forEach(([exerciseName, sets]) => {
    const exerciseInfo = SHARED_EXERCISE_LIBRARY.find(e => e.name === exerciseName);
    if (!exerciseInfo) {
      console.warn(`Exercise not found in library: ${exerciseName}`);
      return;
    }

    const exerciseVolume = sets.reduce((total, set) => total + calculateVolume(set.reps, set.weight), 0);

    exerciseInfo.muscleEngagements.forEach(engagement => {
      workoutMuscleVolumes[engagement.muscle] += exerciseVolume * (engagement.percentage / 100);
    });
  });

  // 3. Get current baselines and calculate fatigue
  const baselines = db.prepare(`
    SELECT muscle_name, system_learned_max, user_override
    FROM muscle_baselines
    WHERE user_id = 1
  `).all() as Array<{
    muscle_name: string;
    system_learned_max: number;
    user_override: number | null;
  }>;

  const baselineMap: Record<string, { systemLearnedMax: number; userOverride: number | null }> = {};
  baselines.forEach(b => {
    baselineMap[b.muscle_name] = {
      systemLearnedMax: b.system_learned_max,
      userOverride: b.user_override
    };
  });

  const muscleFatigue: Record<string, number> = {};
  const updatedBaselines: BaselineUpdate[] = [];

  Object.entries(workoutMuscleVolumes).forEach(([muscle, volume]) => {
    if (volume <= 0) return;

    const baseline = baselineMap[muscle]?.userOverride || baselineMap[muscle]?.systemLearnedMax || 10000;
    const fatiguePercent = Math.min((volume / baseline) * 100, 100);
    muscleFatigue[muscle] = fatiguePercent;

    // 4. Learn new baselines if volume exceeds current max
    const currentMax = baselineMap[muscle]?.systemLearnedMax || 0;
    if (volume > currentMax) {
      const newMax = Math.round(volume);

      // Update database
      db.prepare(`
        INSERT INTO muscle_baselines (user_id, muscle_name, system_learned_max, user_override)
        VALUES (1, ?, ?, NULL)
        ON CONFLICT(user_id, muscle_name) DO UPDATE SET
          system_learned_max = excluded.system_learned_max,
          updated_at = CURRENT_TIMESTAMP
      `).run(muscle, newMax);

      updatedBaselines.push({
        muscle,
        oldMax: currentMax,
        newMax
      });
    }
  });

  // 5. Update muscle states
  const workoutDate = new Date(workout.date).toISOString();
  Object.entries(muscleFatigue).forEach(([muscle, fatigue]) => {
    db.prepare(`
      INSERT INTO muscle_states (user_id, muscle_name, initial_fatigue_percent, last_trained)
      VALUES (1, ?, ?, ?)
      ON CONFLICT(user_id, muscle_name) DO UPDATE SET
        initial_fatigue_percent = excluded.initial_fatigue_percent,
        last_trained = excluded.last_trained,
        updated_at = CURRENT_TIMESTAMP
    `).run(muscle, fatigue, workoutDate);
  });

  // 6. Detect PRs and update personal_bests
  const prsDetected: PRInfo[] = [];

  Object.entries(exercisesByName).forEach(([exerciseName, sets]) => {
    const sessionVolume = sets.reduce((total, set) => total + calculateVolume(set.reps, set.weight), 0);
    const bestSetInSession = Math.max(...sets.map(s => calculateVolume(s.reps, s.weight)), 0);

    // Get current PR
    const currentPR = db.prepare(`
      SELECT best_single_set, best_session_volume, rolling_average_max
      FROM personal_bests
      WHERE user_id = 1 AND exercise_name = ?
    `).get(exerciseName) as { best_single_set: number; best_session_volume: number; rolling_average_max: number } | undefined;

    const previousBestSingleSet = currentPR?.best_single_set || 0;
    const previousBestSessionVolume = currentPR?.best_session_volume || 0;

    const newBestSingleSet = Math.max(previousBestSingleSet, bestSetInSession);
    const newBestSessionVolume = Math.max(previousBestSessionVolume, sessionVolume);

    // Calculate rolling average from last 5 workouts
    const last5Workouts = db.prepare(`
      SELECT es.weight, es.reps
      FROM exercise_sets es
      JOIN workouts w ON es.workout_id = w.id
      WHERE w.user_id = 1 AND es.exercise_name = ?
      ORDER BY w.date DESC
      LIMIT 5
    `).all(exerciseName) as Array<{ weight: number; reps: number }>;

    const bestSetsFromLast5 = last5Workouts.length > 0
      ? last5Workouts.map(s => calculateVolume(s.reps, s.weight))
      : [bestSetInSession];

    const newRollingAverage = bestSetsFromLast5.length > 0
      ? bestSetsFromLast5.reduce((a, b) => a + b, 0) / bestSetsFromLast5.length
      : 0;

    // Update personal_bests table
    db.prepare(`
      INSERT INTO personal_bests (user_id, exercise_name, best_single_set, best_session_volume, rolling_average_max)
      VALUES (1, ?, ?, ?, ?)
      ON CONFLICT(user_id, exercise_name) DO UPDATE SET
        best_single_set = excluded.best_single_set,
        best_session_volume = excluded.best_session_volume,
        rolling_average_max = excluded.rolling_average_max,
        updated_at = CURRENT_TIMESTAMP
    `).run(exerciseName, newBestSingleSet, newBestSessionVolume, newRollingAverage);

    // Detect if this is a PR
    if (newBestSessionVolume > previousBestSessionVolume) {
      prsDetected.push({
        isPR: true,
        exercise: exerciseName,
        newVolume: newBestSessionVolume,
        previousVolume: previousBestSessionVolume,
        improvement: newBestSessionVolume - previousBestSessionVolume,
        percentIncrease: previousBestSessionVolume > 0
          ? ((newBestSessionVolume - previousBestSessionVolume) / previousBestSessionVolume) * 100
          : 100,
        isFirstTime: previousBestSessionVolume === 0
      });
    }
  });

  // 7. Get updated muscle states for response
  const updatedMuscleStates = db.prepare(`
    SELECT muscle_name, initial_fatigue_percent, last_trained
    FROM muscle_states
    WHERE user_id = 1
  `).all() as Array<{
    muscle_name: string;
    initial_fatigue_percent: number;
    last_trained: string | null;
  }>;

  // Get user's recovery settings
  const profile = db.prepare(`
    SELECT recovery_days_to_full FROM user_profile WHERE user_id = 1
  `).get() as { recovery_days_to_full: number } | undefined;

  const recoveryDaysToFull = profile?.recovery_days_to_full || 5;

  const muscleStates: MuscleStatesResponse = {};
  updatedMuscleStates.forEach(state => {
    const now = new Date();
    const lastTrained = state.last_trained ? new Date(state.last_trained) : null;
    const daysElapsed = lastTrained
      ? Math.floor((now.getTime() - lastTrained.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const currentFatiguePercent = lastTrained && daysElapsed !== null
      ? Math.max(0, state.initial_fatigue_percent * (1 - daysElapsed / recoveryDaysToFull))
      : state.initial_fatigue_percent;

    const daysUntilRecovered = currentFatiguePercent > 0
      ? Math.ceil((currentFatiguePercent / 100) * recoveryDaysToFull)
      : 0;

    let recoveryStatus: 'ready' | 'recovering' | 'fatigued' = 'ready';
    if (currentFatiguePercent >= 50) {
      recoveryStatus = 'fatigued';
    } else if (currentFatiguePercent > 0) {
      recoveryStatus = 'recovering';
    }

    muscleStates[state.muscle_name] = {
      currentFatiguePercent,
      daysElapsed,
      estimatedRecoveryDays: recoveryDaysToFull,
      daysUntilRecovered,
      recoveryStatus,
      initialFatiguePercent: state.initial_fatigue_percent,
      lastTrained: state.last_trained
    };
  });

  return {
    muscleStates,
    updatedBaselines,
    prsDetected,
    muscleFatigue
  };
}

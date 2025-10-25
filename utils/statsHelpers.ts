import { WorkoutResponse, PersonalBestsResponse, MuscleStatesResponse, Muscle } from '../types';

/**
 * PR Highlight - Shows recent personal records
 */
export interface PRHighlight {
  exercise: string;
  type: 'single' | 'volume';
  improvement: number; // percentage increase
  date: string;
}

/**
 * Weekly Stats - Workout counts for current and last week
 */
export interface WeeklyStats {
  thisWeek: number;
  lastWeek: number;
}

/**
 * Recovery Groups - Muscles grouped by recovery status
 */
export interface RecoveryGroups {
  ready: Array<{ muscle: string; data: any }>;
  recovering: Array<{ muscle: string; data: any; daysUntil: number }>;
  fatigued: Array<{ muscle: string; data: any; daysUntil: number }>;
}

/**
 * Calculate current workout streak (consecutive days with workouts)
 * @param workouts - Array of workout sessions
 * @returns Number of consecutive days with at least one workout
 */
export function calculateStreak(workouts: WorkoutResponse[]): number {
  if (!workouts || workouts.length === 0) return 0;

  // Sort workouts by date descending (newest first)
  const sortedWorkouts = [...workouts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if there's a workout today
  const latestWorkout = new Date(sortedWorkouts[0].date);
  latestWorkout.setHours(0, 0, 0, 0);

  const daysSinceLatest = Math.floor((today.getTime() - latestWorkout.getTime()) / (1000 * 60 * 60 * 24));

  // If no workout today or yesterday, streak is broken
  if (daysSinceLatest > 1) return 0;

  // Count consecutive days
  let streak = 0;
  let currentDate = new Date(today);

  // Create set of workout dates for fast lookup
  const workoutDates = new Set(
    sortedWorkouts.map(w => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  // Count backward from today
  while (workoutDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Calculate weekly workout statistics
 * @param workouts - Array of workout sessions
 * @returns Object with thisWeek and lastWeek workout counts
 */
export function calculateWeeklyStats(workouts: WorkoutResponse[]): WeeklyStats {
  if (!workouts || workouts.length === 0) {
    return { thisWeek: 0, lastWeek: 0 };
  }

  const now = new Date();

  // Get Sunday of current week (start of week)
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  // Get Saturday of current week (end of week)
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);

  // Get last week boundaries
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(currentWeekStart);
  lastWeekEnd.setMilliseconds(-1); // Just before current week starts

  // Count workouts in each period
  let thisWeek = 0;
  let lastWeek = 0;

  for (const workout of workouts) {
    const workoutDate = new Date(workout.date);

    if (workoutDate >= currentWeekStart && workoutDate <= currentWeekEnd) {
      thisWeek++;
    } else if (workoutDate >= lastWeekStart && workoutDate <= lastWeekEnd) {
      lastWeek++;
    }
  }

  return { thisWeek, lastWeek };
}

/**
 * Find recent personal records (last 7 days)
 * @param personalBests - Map of exercise names to personal best data
 * @param workouts - Array of workout sessions
 * @returns Array of recent PR highlights
 */
export function findRecentPRs(
  personalBests: PersonalBestsResponse,
  workouts: WorkoutResponse[]
): PRHighlight[] {
  if (!workouts || workouts.length === 0) return [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const highlights: PRHighlight[] = [];

  // Get workouts from last 7 days
  const recentWorkouts = workouts.filter(w =>
    new Date(w.date) >= sevenDaysAgo
  );

  // Check each recent workout for PRs
  for (const workout of recentWorkouts) {
    if (workout.prs && workout.prs.length > 0) {
      for (const pr of workout.prs) {
        if (pr.isPR && !pr.isFirstTime) {
          highlights.push({
            exercise: pr.exercise,
            type: 'volume', // Assuming volume PR for now
            improvement: pr.percentIncrease,
            date: workout.date
          });
        }
      }
    }
  }

  // Sort by improvement percentage (highest first) and return top 3
  return highlights
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 3);
}

/**
 * Group muscles by recovery status
 * @param muscleStates - Current muscle states from API
 * @returns Object with muscles grouped by ready/recovering/fatigued
 */
export function groupMusclesByRecovery(muscleStates: MuscleStatesResponse): RecoveryGroups {
  const groups: RecoveryGroups = {
    ready: [],
    recovering: [],
    fatigued: []
  };

  if (!muscleStates) return groups;

  for (const [muscleName, data] of Object.entries(muscleStates)) {
    const daysUntil = Math.ceil(data.daysUntilRecovered);

    if (daysUntil <= 0) {
      // Ready to train
      groups.ready.push({ muscle: muscleName, data });
    } else if (daysUntil <= 2) {
      // Recovering soon (1-2 days)
      groups.recovering.push({ muscle: muscleName, data, daysUntil });
    } else {
      // Still fatigued (3+ days)
      groups.fatigued.push({ muscle: muscleName, data, daysUntil });
    }
  }

  // Sort each group alphabetically by muscle name
  const sortByName = (a: any, b: any) => a.muscle.localeCompare(b.muscle);
  groups.ready.sort(sortByName);
  groups.recovering.sort(sortByName);
  groups.fatigued.sort(sortByName);

  return groups;
}

/**
 * Format a date as relative time (Today, Yesterday, X days ago, or absolute date)
 * @param dateString - ISO date string
 * @returns Formatted relative date string
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutDate = new Date(date);
  workoutDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - workoutDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 6) return `${diffDays} days ago`;

  // For older dates, show absolute date
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}


export enum Muscle {
  Pectoralis = "Pectoralis",
  Triceps = "Triceps",
  Deltoids = "Deltoids",
  Lats = "Lats",
  Biceps = "Biceps",
  Rhomboids = "Rhomboids",
  Trapezius = "Trapezius",
  Forearms = "Forearms",
  Quadriceps = "Quadriceps",
  Glutes = "Glutes",
  Hamstrings = "Hamstrings",
  Calves = "Calves",
  Core = "Core",
}

export type MuscleEngagement = {
  muscle: Muscle;
  percentage: number;
};

export type ExerciseCategory = "Push" | "Pull" | "Legs" | "Core";
export type Equipment = "Bodyweight" | "Dumbbells" | "Kettlebell" | "Pull-up Bar" | "TRX" | "Dip Station" | "Plyo Box" | "Grip Strengthener" | "Bench";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Variation = "A" | "B" | "Both";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment | Equipment[]; // Can be single or multiple equipment options
  difficulty: Difficulty;
  muscleEngagements: MuscleEngagement[];
  variation: Variation; // New field
}

export interface LoggedSet {
  id: string;
  reps: number;
  weight: number;
  bodyweightAtTime?: number; // For bodyweight exercises
  to_failure?: boolean; // Whether the set was taken to muscular failure
}

export interface LoggedExercise {
  id: string;
  exerciseId: string;
  sets: LoggedSet[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  type: ExerciseCategory;
  variation: "A" | "B";
  startTime: number;
  endTime: number;
  loggedExercises: LoggedExercise[];
  muscleFatigueHistory: Partial<Record<Muscle, number>>; // fatigue %
}

// PROGRESSIVE OVERLOAD TYPES
export interface ProgressiveOption {
  weight: number;
  reps: number;
  method: 'weight' | 'reps';
}

export interface ProgressiveSuggestion {
  lastPerformance: {
    weight: number;
    reps: number;
    date: string;
  };
  lastMethod: 'weight' | 'reps' | 'none';
  weightOption: ProgressiveOption;
  repsOption: ProgressiveOption;
  suggested: 'weight' | 'reps';
  daysAgo: number;
}

export interface WorkoutVariationSuggestion {
  suggested: 'A' | 'B';
  lastVariation: 'A' | 'B' | null;
  lastDate: string | null;
  daysAgo: number | null;
}

// Fix: Export MuscleAnalytics and PersonalBests types
export type MuscleAnalytics = Record<Muscle, {
  lastTrained: number;
  lastVolume: number;
}>;

export type PersonalBests = Record<string, ExerciseMaxes>;

// USER PROFILE & STATS
export interface WeightEntry {
    date: number; // timestamp
    weight: number; // lbs
}

export type EquipmentIncrement = 2.5 | 5 | 10;

export interface EquipmentItem {
    id: string;
    type: Equipment;
    weightRange: { min: number; max: number };
    quantity: 1 | 2;
    increment: EquipmentIncrement;
}

// Fix: Add name property and make other properties optional to match usage
export interface UserProfile {
  name: string;
  height?: number; // inches
  age?: number;
  experience: Difficulty;
  bodyweightHistory?: WeightEntry[];
  equipment?: EquipmentItem[];
  recoveryDaysToFull?: number; // Days to recover from 100% fatigue to 0% (default: 5, range: 3-10)
}

// MUSCLE FATIGUE & CAPACITY
export interface MuscleBaseline {
    userOverride: number | null; // Manually set max session volume
    systemLearnedMax: number; // Highest recorded session volume
}

export type MuscleBaselines = Record<Muscle, MuscleBaseline>;

// Note: MuscleState and MuscleStates types have been removed in Phase 5.
// Use MuscleStateData and MuscleStatesResponse instead (from API response).

// PERFORMANCE HISTORY
export interface ExerciseMaxes {
  bestSingleSet: number; // weight * reps
  bestSessionVolume: number;
  rollingAverageMax: number; // avg of best sets over last 5 workouts
}

// WORKOUT TEMPLATES
export interface WorkoutTemplate {
  id: string;
  name: string;
  category: ExerciseCategory;
  variation: "A" | "B";
  exerciseIds: string[]; // Array of exercise IDs
  isFavorite: boolean;
  timesUsed: number;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// Profile API Types
export interface ProfileResponse {
  name: string;
  experience: Difficulty;
  bodyweightHistory: Array<{
    date: string;
    weight: number;
  }>;
  equipment: Array<{
    name: string;
    minWeight: number;
    maxWeight: number;
    increment: number;
  }>;
}

export interface ProfileUpdateRequest {
  name?: string;
  experience?: Difficulty;
  bodyweightHistory?: Array<{
    date: string;
    weight: number;
  }>;
  equipment?: Array<{
    name: string;
    minWeight: number;
    maxWeight: number;
    increment: number;
  }>;
}

// Workout API Types
export interface WorkoutExerciseSet {
  weight: number;
  reps: number;
  to_failure?: boolean; // Whether the set was taken to muscular failure
}

export interface WorkoutExercise {
  exercise: string;
  sets: WorkoutExerciseSet[];
}

export interface PRInfo {
  isPR: boolean;
  exercise: string;
  newVolume: number;
  previousVolume: number;
  improvement: number;
  percentIncrease: number;
  isFirstTime: boolean;
}

export interface QuickAddRequest {
  exercise_name: string;
  weight: number;
  reps: number;
  to_failure?: boolean;
  date?: string; // ISO 8601
}

export interface BaselineUpdate {
  muscle: string;
  oldMax: number;
  newMax: number;
}

export interface QuickAddResponse {
  workout: WorkoutResponse;
  muscle_states: MuscleStatesResponse;
  pr_info?: PRInfo;
  attached_to_active: boolean;
}

// Quick-Workout API Types (Multi-exercise, multi-set batch workout)
export interface QuickWorkoutExercise {
  exercise_name: string;
  sets: Array<{
    weight: number;
    reps: number;
    to_failure?: boolean;
  }>;
}

export interface QuickWorkoutRequest {
  exercises: QuickWorkoutExercise[];
  timestamp?: string; // ISO 8601 - when workout actually happened
}

export interface QuickWorkoutResponse {
  workout_id: number;
  category: string;
  variation: string;
  duration_seconds: number;
  prs: PRInfo[];
  updated_baselines: BaselineUpdate[];
  muscle_states_updated: boolean;
}

export interface WorkoutResponse {
  id: number;
  date: string;
  category: string | null;
  variation: string | null;
  progression_method: string | null;
  duration_seconds: number | null;
  exercises: WorkoutExercise[];
  prs?: PRInfo[]; // Personal records detected in this workout
  created_at?: string;
  updated_baselines?: BaselineUpdate[]; // Optional: baseline learning updates from failure sets
}

export interface WorkoutSaveRequest {
  date: string;
  category?: string;
  variation?: string;
  progressionMethod?: string;
  durationSeconds?: number;
  exercises: WorkoutExercise[];
}

// Muscle State API Types

/**
 * Response type for GET /api/muscle-states
 * Contains both stored fields and calculated fields for a muscle's state
 */
export interface MuscleStateData {
  // Calculated fields (derived from stored fields and current time)
  currentFatiguePercent: number;       // Current fatigue after time-based decay (0-100)
  daysElapsed: number | null;          // Days since last workout (null if never trained)
  estimatedRecoveryDays: number;       // Total days needed for full recovery
  daysUntilRecovered: number;          // Days remaining until full recovery
  recoveryStatus: 'ready' | 'recovering' | 'fatigued'; // Status based on thresholds

  // Stored fields (from database)
  initialFatiguePercent: number;       // Fatigue at time of workout (immutable historical fact)
  lastTrained: string | null;          // UTC ISO 8601 timestamp of last workout
}

export type MuscleStatesResponse = Record<string, MuscleStateData>;

/**
 * Request type for PUT /api/muscle-states
 * Used when updating muscle states after a workout
 */
export interface MuscleStatesUpdateRequest {
  [muscleName: string]: {
    initial_fatigue_percent: number;   // Fatigue percentage at time of workout
    last_trained: string;               // UTC ISO 8601 timestamp (e.g., "2025-10-25T12:00:00.000Z")
    volume_today?: number;              // Optional: workout volume
  };
}

// Personal Bests API Types
export interface PersonalBestData {
  bestSingleSet: number | null;
  bestSessionVolume: number | null;
  rollingAverageMax: number | null;
}

export type PersonalBestsResponse = Record<string, PersonalBestData>;

export interface PersonalBestsUpdateRequest {
  [exerciseName: string]: {
    bestSingleSet?: number | null;
    bestSessionVolume?: number | null;
    rollingAverageMax?: number | null;
  };
}

// Muscle Baseline API Types
export interface MuscleBaselineData {
  systemLearnedMax: number;
  userOverride: number | null;
}

export type MuscleBaselinesResponse = Record<string, MuscleBaselineData>;

export interface MuscleBaselinesUpdateRequest {
  [muscleName: string]: {
    systemLearnedMax?: number;
    userOverride?: number | null;
  };
}

// Workout Template API Types (already matches WorkoutTemplate interface above)

// Health Check API Types
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

// Error Response Type
export interface ApiErrorResponse {
  error: string;
  message?: string;
  hint?: string;
}

// ============================================
// EXERCISE RECOMMENDATION TYPES
// ============================================

/**
 * Internal calculation type for muscle readiness
 */
export interface MuscleReadiness {
  muscle: Muscle;
  recovery: number;      // 0-100% (100 = fully recovered)
  fatigue: number;       // 0-100% (0 = fully recovered)
  engagement: number;    // 0-100% (how much this exercise works this muscle)
  isPrimary: boolean;    // engagement >= 50%
}

/**
 * Recommendation engine output
 */
export interface ExerciseRecommendation {
  exercise: Exercise;
  opportunityScore: number;
  primaryMuscles: MuscleReadiness[];
  limitingFactors: MuscleReadiness[];
  status: 'excellent' | 'good' | 'suboptimal' | 'not-recommended';
  explanation: string;
  equipmentAvailable: boolean;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AnalyticsTimeRange {
  start: string;
  end: string;
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
// Exercise Calibration API Types
// ============================================

export interface ExerciseEngagement {
  muscle: string;
  percentage: number;
  isCalibrated: boolean;
}

export interface ExerciseCalibrationData {
  exerciseId: string;
  exerciseName: string;
  engagements: ExerciseEngagement[];
}

export type CalibrationMap = Record<string, Record<string, number>>;

export interface SaveCalibrationRequest {
  calibrations: Record<string, number>;
}

// ============================================
// WORKOUT PLANNER TYPES
// ============================================

/**
 * A planned exercise with specific sets/reps/weight configuration
 * Used in workout planning before execution
 */
export interface PlannedExercise {
  exercise: Exercise;  // Exercise definition from library
  sets: number;        // Number of sets planned
  reps: number;        // Reps per set
  weight: number;      // Weight per set (lbs)
}

/**
 * Forecasted state for a single muscle after planned workout
 */
export interface ForecastedMuscleState {
  muscle: Muscle;
  currentFatiguePercent: number;    // Before workout
  forecastedFatiguePercent: number; // After planned workout
  volumeAdded: number;              // Volume from planned exercises (lbs)
  baseline: number;                 // Muscle baseline capacity (lbs)
}

/**
 * Complete workout plan with current and forecasted states
 */
export interface WorkoutPlan {
  plannedExercises: PlannedExercise[];
  currentMuscleStates: MuscleStatesResponse;
  forecastedMuscleStates: Record<Muscle, ForecastedMuscleState>;
}

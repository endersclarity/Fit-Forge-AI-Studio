
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

/**
 * Detailed muscle tracking enum - 42 specific muscles for granular recuperation tracking
 */
export enum DetailedMuscle {
  // CHEST
  PectoralisMajorClavicular = "Pectoralis Major (Clavicular)",
  PectoralisMajorSternal = "Pectoralis Major (Sternal)",
  // SHOULDERS
  AnteriorDeltoid = "Anterior Deltoid",
  MedialDeltoid = "Medial Deltoid",
  PosteriorDeltoid = "Posterior Deltoid",
  // ROTATOR CUFF
  Infraspinatus = "Infraspinatus",
  Supraspinatus = "Supraspinatus",
  TeresMinor = "Teres Minor",
  Subscapularis = "Subscapularis",
  // SCAPULAR STABILIZERS
  SerratusAnterior = "Serratus Anterior",
  RhomboidsDetailed = "Rhomboids",
  LevatorScapulae = "Levator Scapulae",
  // BACK
  LatissimusDorsi = "Latissimus Dorsi",
  UpperTrapezius = "Upper Trapezius",
  MiddleTrapezius = "Middle Trapezius",
  LowerTrapezius = "Lower Trapezius",
  ErectorSpinae = "Erector Spinae",
  // ARMS
  BicepsBrachii = "Biceps Brachii",
  Brachialis = "Brachialis",
  Brachioradialis = "Brachioradialis",
  TricepsLongHead = "Triceps (Long Head)",
  TricepsLateralHead = "Triceps (Lateral Head)",
  TricepsMedialHead = "Triceps (Medial Head)",
  WristFlexors = "Wrist Flexors",
  WristExtensors = "Wrist Extensors",
  // CORE
  RectusAbdominis = "Rectus Abdominis",
  ExternalObliques = "External Obliques",
  InternalObliques = "Internal Obliques",
  TransverseAbdominis = "Transverse Abdominis",
  Iliopsoas = "Iliopsoas",
  // LEGS - QUADRICEPS
  VastusLateralis = "Vastus Lateralis",
  VastusMedialis = "Vastus Medialis",
  VastusIntermedius = "Vastus Intermedius",
  RectusFemoris = "Rectus Femoris",
  // LEGS - GLUTES
  GluteusMaximus = "Gluteus Maximus",
  GluteusMedius = "Gluteus Medius",
  GluteusMinimus = "Gluteus Minimus",
  // LEGS - HAMSTRINGS
  BicepsFemoris = "Biceps Femoris",
  Semitendinosus = "Semitendinosus",
  Semimembranosus = "Semimembranosus",
  // LEGS - CALVES
  GastrocnemiusMedial = "Gastrocnemius (Medial)",
  GastrocnemiusLateral = "Gastrocnemius (Lateral)",
  Soleus = "Soleus",
}

export type MuscleEngagement = {
  muscle: Muscle;
  percentage: number;
};

export type DetailedMuscleEngagement = {
  muscle: DetailedMuscle;
  percentage: number;
  role: 'primary' | 'secondary' | 'stabilizer';
  citation?: string;
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
  detailedMuscleEngagements?: DetailedMuscleEngagement[]; // Optional: granular muscle tracking
  variation: Variation; // New field
}

export interface LoggedSet {
  id: string;
  reps: number;
  weight: number;
  bodyweightAtTime?: number; // For bodyweight exercises
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
}

// MUSCLE FATIGUE & CAPACITY
export interface MuscleBaseline {
    userOverride: number | null; // Manually set max session volume
    systemLearnedMax: number; // Highest recorded session volume
}

export type MuscleBaselines = Record<Muscle, MuscleBaseline>;

export interface MuscleState {
  lastTrained: number; // timestamp
  fatiguePercentage: number; // 0-100
  recoveryDaysNeeded: number;
}
export type MuscleStates = Record<Muscle, MuscleState>;


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
  recovery_days_to_full?: number; // Days to recover from 100% fatigue to 0% (default: 5)
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
  recovery_days_to_full?: number; // Days to recover from 100% fatigue to 0% (range: 3-10)
}

export interface ProfileInitRequest {
  name: string;
  experience: Difficulty;
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
  to_failure?: boolean; // Optional: indicates if set was taken to failure
}

export interface WorkoutExercise {
  exercise: string;
  sets: WorkoutExerciseSet[];
}

export interface BaselineUpdate {
  muscle: string;
  oldMax: number;
  newMax: number;
}

export interface WorkoutResponse {
  id: number;
  date: string;
  category: string | null;
  variation: string | null;
  progression_method: string | null;
  duration_seconds: number | null;
  exercises: WorkoutExercise[];
  created_at?: string;
  updated_baselines?: BaselineUpdate[]; // Optional field for baseline learning updates
}

export interface WorkoutSaveRequest {
  date: string;
  category?: string;
  variation?: string;
  progressionMethod?: string;
  durationSeconds?: number;
  exercises: WorkoutExercise[];
}

// Progressive Overload API Types
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

// Workout Variation API Types
export interface WorkoutVariationSuggestion {
  suggested: 'A' | 'B';
  lastVariation: 'A' | 'B' | null;
  lastDate: string | null;
  daysAgo: number | null;
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

// Quick-Add API Types
export interface QuickAddRequest {
  exercise_name: string;
  weight: number;
  reps: number;
  to_failure?: boolean;
  date?: string; // ISO 8601
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

export interface BaselineUpdate {
  muscle: string;
  oldMax: number;
  newMax: number;
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

// Builder-Workout API Types (Workout from the builder with rest timers)
export interface BuilderWorkoutRequest {
  sets: Array<{
    exercise_name: string;
    weight: number;
    reps: number;
    rest_timer_seconds: number;
  }>;
  timestamp: string;
  was_executed: boolean;
}

// Exercise Calibration API Types
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

// Workout Rotation Types
export interface WorkoutRotationState {
  id?: number;
  userId: number;
  currentCycle: 'A' | 'B';
  currentPhase: number; // Position in rotation sequence (0-5)
  lastWorkoutDate: string | null; // ISO 8601
  lastWorkoutCategory: ExerciseCategory | null;
  lastWorkoutVariation: 'A' | 'B' | null;
  restDaysCount: number;
  updatedAt?: string;
}

export interface RotationSequenceItem {
  category: ExerciseCategory;
  variation: 'A' | 'B';
  restAfter: number; // Number of rest days after this workout
}

export interface WorkoutRecommendation {
  isRestDay: boolean;
  reason?: string;
  category?: ExerciseCategory;
  variation?: 'A' | 'B';
  phase?: number;
  lastWorkout?: {
    category: ExerciseCategory;
    variation: 'A' | 'B';
    date: string;
    daysAgo: number;
  };
}

// Detailed Muscle State Types (Dual-Layer Architecture)
export interface DetailedMuscleStateData {
  detailedMuscleName: string;
  visualizationMuscleName: string;
  role: 'primary' | 'secondary' | 'stabilizer';
  currentFatiguePercent: number;
  volumeToday: number;
  lastTrained: string | null;
  baselineCapacity: number;
  baselineSource: 'inherited' | 'learned' | 'user_override';
  baselineConfidence: 'low' | 'medium' | 'high';
}

export type DetailedMuscleStatesResponse = Record<string, DetailedMuscleStateData>;

// Exercise History API Types
export interface ExerciseHistoryResponse {
  exerciseId: string;
  lastPerformed: string | null; // ISO 8601 timestamp
  sets: Array<{
    weight: number;
    reps: number;
  }>;
  totalVolume: number;
  personalRecord: {
    weight: number;
    reps: number;
  } | null;
}

// Error Response Type
export interface ApiErrorResponse {
  error: string;
  code?: string;
  message?: string;
  hint?: string;
}

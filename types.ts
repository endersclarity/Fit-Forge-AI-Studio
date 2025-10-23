
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
export type Equipment = "Bodyweight" | "Dumbbells" | "Barbell" | "Kettlebell" | "Pull-up Bar" | "TRX" | "Resistance Bands";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Variation = "A" | "B" | "Both";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  difficulty: Difficulty;
  muscleEngagements: MuscleEngagement[];
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

export type PersonalBests = Record<string, {
    maxWeight: number;
    maxVolume: number;
}>;

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

export type ExerciseMaxesHistory = Record<string, ExerciseMaxes>; // Key is exerciseId
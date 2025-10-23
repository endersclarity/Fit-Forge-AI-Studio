
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
export type Equipment = "Bodyweight" | "Dumbbells" | "Barbell" | "Kettlebell" | "Pull-up Bar" | "TRX";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  difficulty: Difficulty;
  muscleEngagements: MuscleEngagement[];
}

export interface LoggedSet {
  id: string;
  reps: number;
  weight: number;
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
  startTime: number;
  endTime: number;
  loggedExercises: LoggedExercise[];
}

export interface UserProfile {
  name: string;
  experience: Difficulty;
}

export interface MuscleStatus {
  lastTrained: number; // timestamp
  lastVolume: number;
}

export type MuscleAnalytics = Record<Muscle, MuscleStatus>;

export type PersonalBest = {
  maxWeight: number;
  maxVolume: number;
};

export type PersonalBests = Record<string, PersonalBest>; // Key is exerciseId

import { WorkoutSession } from './types';

export const getDaysSince = (timestamp: number): number => {
  if (!timestamp) return Infinity;
  return (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
};

export const calculateRecoveryPercentage = (daysSince: number): number => {
  if (daysSince >= 5) return 100;
  if (daysSince >= 4) return 98;
  if (daysSince >= 3) return 90;
  if (daysSince >= 2) return 75;
  if (daysSince >= 1) return 50;
  if (daysSince >= 0) return 10;
  return 100;
};

export const getRecoveryColor = (percentage: number): string => {
  if (percentage >= 95) return "bg-green-500";
  if (percentage >= 75) return "bg-yellow-500";
  return "bg-red-500";
};

export const getUserLevel = (workoutCount: number): { level: number; progress: number; nextLevelWorkouts: number; } => {
  if (workoutCount <= 2) return { level: 1, progress: (workoutCount / 3) * 100, nextLevelWorkouts: 3 };
  if (workoutCount <= 9) return { level: 2, progress: ((workoutCount - 3) / 7) * 100, nextLevelWorkouts: 10 };
  if (workoutCount <= 19) return { level: 3, progress: ((workoutCount - 10) / 10) * 100, nextLevelWorkouts: 20 };
  return { level: 4, progress: 100, nextLevelWorkouts: Infinity };
};

export const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
};

export const calculateVolume = (reps: number, weight: number): number => {
    return reps * weight;
};

export const findPreviousWorkout = (currentWorkout: WorkoutSession, allWorkouts: WorkoutSession[]): WorkoutSession | undefined => {
    return allWorkouts
        .filter(w => w.id !== currentWorkout.id && w.type === currentWorkout.type)
        .sort((a, b) => b.endTime - a.endTime)[0];
};

import React from 'react';
import { StatusBadge, ExerciseStatus } from './StatusBadge';
import { ProgressiveOverloadChip } from './ProgressiveOverloadChip';

export interface MuscleEngagement {
  muscle: string;
  percent: number;
  fatigueLevel: number;
}

export interface LastPerformance {
  reps: number;
  weight: number;
}

export interface ProgressiveOverload {
  type: 'weight' | 'reps';
  value: number;
}

export interface ExerciseRecommendationCardProps {
  exerciseName: string;
  status: ExerciseStatus;
  muscleEngagements: MuscleEngagement[];
  lastPerformance: LastPerformance;
  progressiveOverload: ProgressiveOverload;
  equipment: string;
  explanation?: string; // For SUBOPTIMAL status
  onClick?: () => void;
  className?: string;
}

// Determine muscle pill background color based on fatigue level
function getMusclePillColor(fatigueLevel: number): string {
  if (fatigueLevel <= 33) return 'bg-green-500/30 text-green-200';
  if (fatigueLevel <= 66) return 'bg-amber-500/30 text-amber-200';
  return 'bg-red-500/30 text-red-200';
}

export const ExerciseRecommendationCard: React.FC<ExerciseRecommendationCardProps> = ({
  exerciseName,
  status,
  muscleEngagements,
  lastPerformance,
  progressiveOverload,
  equipment,
  explanation,
  onClick,
  className = '',
}) => {
  const baseClasses = 'p-4 rounded-lg bg-card-background transition-colors duration-300';
  const hoverClasses = onClick ? 'hover:bg-white/5 cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={onClick ? `${exerciseName}, ${status} exercise` : undefined}
    >
      {/* Header: Exercise name + Status badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-white font-bold text-lg flex-1">{exerciseName}</h4>
        <StatusBadge status={status} />
      </div>

      {/* Explanation (for SUBOPTIMAL) */}
      {explanation && status === 'SUBOPTIMAL' && (
        <div className="text-amber-500 text-sm mb-3">
          {explanation}
        </div>
      )}

      {/* Muscle engagement pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {muscleEngagements.map((engagement) => (
          <span
            key={engagement.muscle}
            className={`px-2 py-1 rounded-full text-xs font-medium ${getMusclePillColor(engagement.fatigueLevel)}`}
          >
            {engagement.muscle} {engagement.percent}%
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 my-3" />

      {/* Last performance + Progressive overload chip */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-gray-400 text-sm tabular-nums">
          Last: {lastPerformance.reps} reps @ {lastPerformance.weight}lbs
        </span>
        <ProgressiveOverloadChip
          type={progressiveOverload.type}
          currentValue={progressiveOverload.type === 'weight' ? lastPerformance.weight : lastPerformance.reps}
          suggestedValue={progressiveOverload.value}
          unit={progressiveOverload.type === 'weight' ? 'lbs' : 'reps'}
        />
      </div>

      {/* Equipment */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          fitness_center
        </span>
        <span>{equipment}</span>
      </div>
    </div>
  );
};

export default ExerciseRecommendationCard;

import React from 'react';
import { Exercise, MuscleReadiness } from '../types';

interface RecommendationCardProps {
  exercise: Exercise;
  status: 'excellent' | 'good' | 'suboptimal' | 'not-recommended';
  primaryMuscles: MuscleReadiness[];
  limitingFactors: MuscleReadiness[];
  explanation: string;
  equipmentAvailable: boolean;
  onAdd: (exercise: Exercise) => void;
}

const STATUS_CONFIG = {
  excellent: {
    icon: '⭐',
    bgColor: 'bg-emerald-900/30',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    buttonStyle: 'bg-brand-cyan text-brand-dark hover:bg-cyan-400'
  },
  good: {
    icon: '✅',
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    buttonStyle: 'bg-brand-cyan text-brand-dark hover:bg-cyan-400'
  },
  suboptimal: {
    icon: '⚠️',
    bgColor: 'bg-yellow-900/30',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400',
    buttonStyle: 'bg-brand-surface text-slate-300 hover:bg-brand-muted'
  },
  'not-recommended': {
    icon: '❌',
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    buttonStyle: 'bg-brand-surface text-slate-300 hover:bg-brand-muted'
  }
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  exercise,
  status,
  primaryMuscles,
  limitingFactors,
  explanation,
  equipmentAvailable,
  onAdd
}) => {
  const config = STATUS_CONFIG[status];
  const limitingMuscleNames = new Set(limitingFactors.map(lf => lf.muscle));

  return (
    <div
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4 space-y-3`}
    >
      {/* Header with exercise name and status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="text-lg font-bold">{exercise.name}</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {exercise.category} • {exercise.difficulty}
          </p>
        </div>
        <div
          className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${config.textColor}`}
          aria-label={`Status: ${status}`}
        >
          {config.icon} {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
        </div>
      </div>

      {/* Muscle engagements */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase">Muscle Engagement</p>
        <div className="flex flex-wrap gap-2">
          {exercise.muscleEngagements
            .sort((a, b) => b.percentage - a.percentage)
            .map(({ muscle, percentage }) => {
              const isLimiting = limitingMuscleNames.has(muscle);
              const isPrimary = percentage >= 50;

              return (
                <span
                  key={muscle}
                  className={`text-xs px-2 py-1 rounded ${
                    isLimiting
                      ? 'bg-red-900/40 text-red-300 border border-red-500/50'
                      : isPrimary
                      ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/50 font-semibold'
                      : 'bg-brand-surface text-slate-300'
                  }`}
                >
                  {isLimiting && '⚠️ '}
                  {muscle} {percentage}%
                </span>
              );
            })}
        </div>
      </div>

      {/* Equipment */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">Equipment:</span>
        <span className={equipmentAvailable ? 'text-emerald-400' : 'text-red-400'}>
          {equipmentAvailable ? '✅' : '❌'}{' '}
          {Array.isArray(exercise.equipment) ? exercise.equipment.join(', ') : exercise.equipment}
        </span>
      </div>

      {/* Explanation */}
      <p className="text-sm italic text-slate-300">{explanation}</p>

      {/* Add to Workout button */}
      <button
        onClick={() => onAdd(exercise)}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${config.buttonStyle}`}
      >
        Add to Workout
      </button>
    </div>
  );
};

export default RecommendationCard;

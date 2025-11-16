import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Exercise, MuscleReadiness } from '../types';
import { CalibrationBadge } from './CalibrationBadge';
import { useMotion } from '@/src/providers/MotionProvider';
import { listItemVariants, SPRING_TRANSITION } from '@/src/providers/motion-presets';

interface RecommendationCardProps {
  exercise: Exercise;
  status: 'excellent' | 'good' | 'suboptimal' | 'not-recommended';
  primaryMuscles: MuscleReadiness[];
  limitingFactors: MuscleReadiness[];
  explanation: string;
  equipmentAvailable: boolean;
  onAdd: (exercise: Exercise) => void;
  isCalibrated?: boolean;
  onViewEngagement?: (exerciseId: string) => void;
  // API-specific fields for enhanced UI
  score?: number;
  factors?: {
    targetMatch: number;
    freshness: number;
    variety: number;
    preference: number;
    primarySecondary: number;
  };
  warnings?: string[];
}

const STATUS_CONFIG = {
  excellent: {
    icon: '⭐',
    bgColor: 'bg-emerald-900/30 dark:bg-emerald-900/40',
    borderColor: 'border-emerald-500 dark:border-emerald-400',
    textColor: 'text-emerald-400',
    buttonStyle: 'bg-brand-cyan text-brand-dark hover:bg-cyan-400'
  },
  good: {
    icon: '✅',
    bgColor: 'bg-blue-900/30 dark:bg-blue-900/40',
    borderColor: 'border-blue-500 dark:border-blue-400',
    textColor: 'text-blue-400',
    buttonStyle: 'bg-brand-cyan text-brand-dark hover:bg-cyan-400'
  },
  suboptimal: {
    icon: '⚠️',
    bgColor: 'bg-yellow-900/30 dark:bg-yellow-900/40',
    borderColor: 'border-yellow-500 dark:border-yellow-400',
    textColor: 'text-yellow-400',
    buttonStyle: 'bg-brand-surface dark:bg-dark-bg-tertiary text-slate-300 dark:text-dark-text-secondary hover:bg-brand-muted dark:hover:bg-dark-border-DEFAULT'
  },
  'not-recommended': {
    icon: '❌',
    bgColor: 'bg-red-900/30 dark:bg-red-900/40',
    borderColor: 'border-red-500 dark:border-red-400',
    textColor: 'text-red-400',
    buttonStyle: 'bg-brand-surface dark:bg-dark-bg-tertiary text-slate-300 dark:text-dark-text-secondary hover:bg-brand-muted dark:hover:bg-dark-border-DEFAULT'
  }
};

const RecommendationCardComponent: React.FC<RecommendationCardProps> = ({
  exercise,
  status,
  primaryMuscles,
  limitingFactors,
  explanation,
  equipmentAvailable,
  onAdd,
  isCalibrated = false,
  onViewEngagement,
  score,
  factors,
  warnings = []
}) => {
  const config = STATUS_CONFIG[status];
  const { isMotionEnabled } = useMotion();

  // Memoize the set of limiting muscle names to avoid recreation on each render
  const limitingMuscleNames = useMemo(
    () => new Set(limitingFactors.map(lf => lf.muscle)),
    [limitingFactors]
  );

  // Memoize sorted muscle engagements to avoid re-sorting on each render
  const sortedMuscleEngagements = useMemo(
    () => [...exercise.muscleEngagements].sort((a, b) => b.percentage - a.percentage),
    [exercise.muscleEngagements]
  );

  // Memoize event handlers
  const handleAdd = useCallback(() => onAdd(exercise), [onAdd, exercise]);
  const handleViewEngagement = useCallback(
    () => onViewEngagement?.(exercise.id),
    [onViewEngagement, exercise.id]
  );

  return (
    <motion.div
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4 space-y-3`}
      variants={isMotionEnabled ? listItemVariants : undefined}
      initial={isMotionEnabled ? 'hidden' : undefined}
      animate={isMotionEnabled ? 'show' : undefined}
      transition={SPRING_TRANSITION}
    >
      {/* Header with exercise name and status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-bold dark:text-dark-text-primary">{exercise.name}</h4>
            <CalibrationBadge show={isCalibrated} />
          </div>
          <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-0.5">
            {exercise.category} • {exercise.difficulty}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${config.textColor}`}
            aria-label={`Status: ${status}`}
          >
            {config.icon} {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </div>
          {/* Score badge with tooltip */}
          {score !== undefined && factors && (
            <div className="relative group">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold cursor-help">
                {Math.round(score)}
              </span>
              {/* Tooltip on hover */}
              <div className="absolute hidden group-hover:block bg-gray-900 dark:bg-dark-bg-tertiary text-white dark:text-dark-text-primary p-3 rounded-lg shadow-xl z-10 w-64 right-0 top-full mt-2">
                <p className="text-xs font-semibold mb-2 text-brand-cyan">Score Breakdown</p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Target Match:</span>
                    <span className="font-semibold">{factors.targetMatch}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Muscle Freshness:</span>
                    <span className="font-semibold">{factors.freshness}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variety:</span>
                    <span className="font-semibold">{factors.variety}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User Preference:</span>
                    <span className="font-semibold">{factors.preference}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Primary/Secondary:</span>
                    <span className="font-semibold">{factors.primarySecondary}%</span>
                  </div>
                  <div className="border-t border-gray-700 dark:border-dark-border-DEFAULT mt-2 pt-2 flex justify-between font-bold">
                    <span>Total Score:</span>
                    <span className="text-brand-cyan">{Math.round(score)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning badges for bottleneck risks */}
      {warnings && warnings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {warnings.map((warning, idx) => (
            <span
              key={idx}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1"
            >
              ⚠️ {warning}
            </span>
          ))}
        </div>
      )}

      {/* Muscle engagements */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-400 dark:text-dark-text-muted uppercase">Muscle Engagement</p>
        <div className="flex flex-wrap gap-2">
          {sortedMuscleEngagements.map(({ muscle, percentage }) => {
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
                    : 'bg-brand-surface dark:bg-dark-bg-tertiary text-slate-300 dark:text-dark-text-secondary'
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
        <span className="text-slate-400 dark:text-dark-text-muted">Equipment:</span>
        <span className={equipmentAvailable ? 'text-emerald-400' : 'text-red-400'}>
          {equipmentAvailable ? '✅' : '❌'}{' '}
          {Array.isArray(exercise.equipment) ? exercise.equipment.join(', ') : exercise.equipment}
        </span>
      </div>

      {/* Explanation */}
      <p className="text-sm italic text-slate-300 dark:text-dark-text-secondary">{explanation}</p>

      {/* Action buttons */}
      <div className="flex gap-2">
        {onViewEngagement && (
          <button
            onClick={handleViewEngagement}
            className="flex-1 py-3 px-4 rounded-lg font-semibold transition-colors bg-brand-surface dark:bg-dark-bg-tertiary text-slate-300 dark:text-dark-text-secondary hover:bg-brand-muted dark:hover:bg-dark-border-DEFAULT flex items-center justify-center gap-1 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2"
            aria-label={`View muscle engagement for ${exercise.name}`}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">analytics</span>
            View Engagement
          </button>
        )}
        <button
          onClick={handleAdd}
          className={`${onViewEngagement ? 'flex-1' : 'w-full'} py-3 px-4 rounded-lg font-semibold transition-colors ${config.buttonStyle} min-h-[60px] focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2`}
          aria-label={`Add ${exercise.name} to workout`}
        >
          Add to Workout
        </button>
      </div>
    </motion.div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
// RecommendationCard is rendered in lists and receives complex exercise objects
const RecommendationCard = React.memo(RecommendationCardComponent);
export default RecommendationCard;

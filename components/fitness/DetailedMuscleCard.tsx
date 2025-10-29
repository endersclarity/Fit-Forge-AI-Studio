import React, { useState } from 'react';
import { Muscle, DetailedMuscleStateData } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { ChevronDownIcon, ChevronUpIcon } from '../Icons';

export interface DetailedMuscleCardProps {
  muscleName: Muscle;
  aggregateFatigue: number; // 0-100
  detailedMuscles: DetailedMuscleStateData[];
  lastTrained: Date | null;
  onClick?: () => void;
  className?: string;
}

// Helper to format relative time
function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Never trained';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

// Determine variant based on fatigue percentage
function getVariant(fatiguePercent: number): 'success' | 'warning' | 'error' {
  if (fatiguePercent <= 33) return 'success';
  if (fatiguePercent <= 66) return 'warning';
  return 'error';
}

// Determine recovery status
function getRecoveryStatus(fatiguePercent: number): string {
  if (fatiguePercent <= 33) return 'ready to train';
  if (fatiguePercent <= 66) return 'recovering';
  return 'needs rest';
}

export const DetailedMuscleCard: React.FC<DetailedMuscleCardProps> = ({
  muscleName,
  aggregateFatigue,
  detailedMuscles,
  lastTrained,
  onClick,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const variant = getVariant(aggregateFatigue);
  const status = getRecoveryStatus(aggregateFatigue);
  const relativeTime = formatRelativeTime(lastTrained);

  // Group muscles by role
  const primaryMuscles = detailedMuscles.filter(m => m.role === 'primary');
  const secondaryMuscles = detailedMuscles.filter(m => m.role === 'secondary');
  const stabilizers = detailedMuscles.filter(m => m.role === 'stabilizer');

  const baseClasses = 'p-3 rounded-lg bg-card-background transition-colors duration-300';
  const hoverClasses = onClick ? 'hover:bg-white/5 cursor-pointer' : '';
  const minHeightClasses = 'min-h-[44px]';

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${minHeightClasses} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${muscleName}, ${aggregateFatigue}% fatigued, ${status}, ${relativeTime}` : undefined}
    >
      {/* Header: Muscle name and aggregate fatigue */}
      <div
        className="flex items-center justify-between mb-2"
        onClick={onClick}
      >
        <span className="text-white font-medium">{muscleName}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold tabular-nums">{aggregateFatigue.toFixed(1)}%</span>
          <button
            onClick={toggleExpanded}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label={isExpanded ? 'Hide details' : 'Show details'}
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4 text-brand-cyan" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Aggregate progress bar */}
      <ProgressBar
        value={aggregateFatigue}
        variant={variant}
        height="sm"
        ariaLabel={`${muscleName} aggregate fatigue level`}
        className="mb-2"
      />

      {/* Footer: Last trained date */}
      <div className="text-gray-400 text-sm tabular-nums mb-2">
        Last trained: {relativeTime}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-brand-muted space-y-3">
          {/* Primary movers */}
          {primaryMuscles.length > 0 && (
            <div>
              <div className="text-xs text-slate-400 font-medium mb-2">PRIMARY MOVERS</div>
              <div className="space-y-2">
                {primaryMuscles.map((muscle) => (
                  <div key={muscle.detailedMuscleName} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-white">{muscle.detailedMuscleName}</div>
                      <ProgressBar
                        value={muscle.currentFatiguePercent}
                        variant={getVariant(muscle.currentFatiguePercent)}
                        height="xs"
                        ariaLabel={`${muscle.detailedMuscleName} fatigue`}
                        className="mt-1"
                      />
                    </div>
                    <span className="text-xs text-slate-400 tabular-nums w-12 text-right">
                      {muscle.currentFatiguePercent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary movers */}
          {secondaryMuscles.length > 0 && (
            <div>
              <div className="text-xs text-slate-400 font-medium mb-2">SECONDARY MOVERS</div>
              <div className="space-y-1">
                {secondaryMuscles.map((muscle) => (
                  <div key={muscle.detailedMuscleName} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{muscle.detailedMuscleName}</span>
                    <span className="text-slate-400 tabular-nums">
                      {muscle.currentFatiguePercent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stabilizers (collapsible) */}
          {stabilizers.length > 0 && (
            <details className="group">
              <summary className="text-xs text-slate-400 font-medium cursor-pointer hover:text-slate-300 flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                STABILIZERS ({stabilizers.length})
              </summary>
              <div className="mt-2 space-y-1 pl-4">
                {stabilizers.map((muscle) => (
                  <div key={muscle.detailedMuscleName} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{muscle.detailedMuscleName}</span>
                    <span className="text-slate-500 tabular-nums">
                      {muscle.currentFatiguePercent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailedMuscleCard;

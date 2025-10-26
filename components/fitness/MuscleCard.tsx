import React from 'react';
import { ProgressBar } from '../ui/ProgressBar';

export interface MuscleCardProps {
  muscleName: string;
  fatiguePercent: number; // 0-100
  lastTrained: Date | null;
  recoveredAt: Date | null;
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

export const MuscleCard: React.FC<MuscleCardProps> = ({
  muscleName,
  fatiguePercent,
  lastTrained,
  recoveredAt,
  onClick,
  className = '',
}) => {
  const variant = getVariant(fatiguePercent);
  const status = getRecoveryStatus(fatiguePercent);
  const relativeTime = formatRelativeTime(lastTrained);

  const baseClasses = 'p-3 rounded-lg bg-card-background transition-colors duration-300';
  const hoverClasses = onClick ? 'hover:bg-white/5 cursor-pointer' : '';
  const minHeightClasses = 'min-h-[44px]'; // Accessibility: minimum 44px tap target

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${minHeightClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={onClick ? `${muscleName}, ${fatiguePercent}% fatigued, ${status}, ${relativeTime}` : undefined}
    >
      {/* Header: Muscle name and fatigue percentage */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{muscleName}</span>
        <span className="text-white font-bold tabular-nums">{fatiguePercent}%</span>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={fatiguePercent}
        variant={variant}
        height="sm"
        ariaLabel={`${muscleName} fatigue level`}
        className="mb-2"
      />

      {/* Footer: Last trained date */}
      <div className="text-gray-400 text-sm tabular-nums">
        Last trained: {relativeTime}
      </div>
    </div>
  );
};

export default MuscleCard;

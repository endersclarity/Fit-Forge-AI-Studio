import React from 'react';

export interface ProgressiveOverloadChipProps {
  type: 'weight' | 'reps';
  currentValue: number;
  suggestedValue: number;
  unit: 'lbs' | 'kg' | 'reps';
  className?: string;
}

export const ProgressiveOverloadChip: React.FC<ProgressiveOverloadChipProps> = ({
  type,
  currentValue,
  suggestedValue,
  unit,
  className = '',
}) => {
  const displayUnit = unit === 'reps' ? '' : ` ${unit}`;
  const percentChange = Math.round(((suggestedValue - currentValue) / currentValue) * 100);

  const baseClasses = 'group relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium tabular-nums';

  return (
    <span className={`${baseClasses} ${className}`}>
      <span className="material-symbols-outlined text-base" aria-hidden="true">
        trending_up
      </span>
      <span>+{percentChange}% {type}: {suggestedValue}{displayUnit}</span>

      {/* CSS-only tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none z-10">
        Progressive overload: {currentValue} → {suggestedValue}{displayUnit} (+{percentChange}%)
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
      </span>
    </span>
  );
};

export default ProgressiveOverloadChip;

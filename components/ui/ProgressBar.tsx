import React from 'react';

export interface ProgressBarProps {
  value: number; // 0-100
  variant: 'success' | 'warning' | 'error';
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  ariaLabel?: string;
}

const variantClasses = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
};

const heightClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant,
  height = 'md',
  animated = true,
  className = '',
  ariaLabel,
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  const trackClasses = `bg-gray-700 rounded-full ${heightClasses[height]} ${className}`;
  const fillClasses = `${variantClasses[variant]} rounded-full h-full ${animated ? 'transition-all duration-500 ease-in-out' : ''}`;

  return (
    <div
      className={trackClasses}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || `Progress: ${clampedValue}%`}
    >
      <div
        className={fillClasses}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};

export default ProgressBar;

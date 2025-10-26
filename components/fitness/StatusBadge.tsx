import React from 'react';

export type ExerciseStatus = 'EXCELLENT' | 'GOOD' | 'SUBOPTIMAL';

export interface StatusBadgeProps {
  status: ExerciseStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  EXCELLENT: {
    color: 'bg-green-500/20 text-green-500',
    icon: 'check_circle',
  },
  GOOD: {
    color: 'bg-blue-500/20 text-blue-500',
    icon: 'thumb_up',
  },
  SUBOPTIMAL: {
    color: 'bg-amber-500/20 text-amber-500',
    icon: 'warning',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const iconSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const config = statusConfig[status];
  const baseClasses = 'inline-flex items-center gap-1 rounded-full font-medium uppercase';
  const classes = `${baseClasses} ${config.color} ${sizeClasses[size]} ${className}`;

  return (
    <span className={classes}>
      <span className={`material-symbols-outlined ${iconSizeClasses[size]}`} aria-hidden="true">
        {config.icon}
      </span>
      {status}
    </span>
  );
};

export default StatusBadge;

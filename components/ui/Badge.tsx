import React from 'react';

export interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  success: 'bg-green-500/20 text-green-500',
  warning: 'bg-amber-500/20 text-amber-500',
  error: 'bg-red-500/20 text-red-500',
  info: 'bg-blue-500/20 text-blue-500',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  variant,
  size = 'md',
  children,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;

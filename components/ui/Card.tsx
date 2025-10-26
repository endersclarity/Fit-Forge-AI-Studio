import React from 'react';

export interface CardProps {
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const elevationClasses = {
  none: '',
  low: 'shadow-sm',
  medium: 'shadow-md',
  high: 'shadow-lg',
};

const paddingClasses = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  elevation = 'medium',
  padding = 'md',
  hover = false,
  onClick,
  children,
  className = '',
}) => {
  const baseClasses = 'bg-card-background rounded-lg';
  const hoverClasses = hover ? 'hover:bg-white/5 transition-colors duration-300 cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const classes = `${baseClasses} ${elevationClasses[elevation]} ${paddingClasses[padding]} ${hoverClasses} ${clickableClasses} ${className}`;

  return onClick ? (
    <div className={classes} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}>
      {children}
    </div>
  ) : (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card;

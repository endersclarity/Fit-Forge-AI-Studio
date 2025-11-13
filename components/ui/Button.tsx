import React from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-white/10 text-white hover:bg-white/20',
  ghost: 'bg-transparent text-white hover:bg-white/5',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm min-h-[60px] min-w-[60px]', // 60px minimum (WCAG compliant)
  md: 'px-5 py-2.5 text-base min-h-[60px] min-w-[60px]', // 60px minimum (WCAG compliant)
  lg: 'px-6 py-3 text-lg min-h-[60px] min-w-[80px]', // 60px minimum height, wider for better ergonomics
  xl: 'px-8 py-4 text-xl min-h-[72px] min-w-[100px]', // Extra large for primary CTAs
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className = '',
  ariaLabel,
}) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default Button;

import React from 'react';

export interface FABProps {
  icon: string; // Material Symbol name
  label: string; // ARIA label
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const FAB: React.FC<FABProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  className = '',
}) => {
  const baseClasses = 'fixed bottom-24 right-6 w-16 h-16 bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed z-50 flex items-center justify-center';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      aria-label={label}
    >
      <span className="material-symbols-outlined text-3xl" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
};

export default FAB;

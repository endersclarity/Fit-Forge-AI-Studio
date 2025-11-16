import React from 'react';

interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  body: string;
  ctaText: string;
  onCtaClick: () => void;
  className?: string;
}

/**
 * EmptyState
 *
 * A reusable component for displaying empty states with optional illustration,
 * title, body text, and a call-to-action button.
 * Supports dark mode and provides touch-friendly interactions.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  title,
  body,
  ctaText,
  onCtaClick,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        text-center p-8
        ${className}
      `}
      role="status"
      aria-label={title}
    >
      {/* Optional Illustration */}
      {illustration && (
        <div className="mb-6 text-slate-400 dark:text-dark-text-muted">
          {illustration}
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary mb-2">
        {title}
      </h3>

      {/* Body Text */}
      <p className="text-slate-600 dark:text-dark-text-secondary max-w-md mb-6">
        {body}
      </p>

      {/* CTA Button - Touch-friendly with min 60x60 target */}
      <button
        onClick={onCtaClick}
        className={`
          min-h-[60px] min-w-[60px] px-6 py-3
          bg-brand-cyan dark:bg-dark-accent-primary
          text-white font-medium rounded-lg
          hover:bg-brand-cyan/90 dark:hover:bg-dark-accent-primary/90
          focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 dark:focus:ring-dark-accent-primary/50
          transition-colors duration-200
          active:scale-95
        `}
        type="button"
      >
        {ctaText}
      </button>
    </div>
  );
};

export default EmptyState;

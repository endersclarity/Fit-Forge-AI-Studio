import React from 'react';
import { useMotion } from '../../src/providers/MotionProvider';

type SkeletonVariant = 'card' | 'list-row' | 'chart';

interface SkeletonBlockProps {
  variant: SkeletonVariant;
  className?: string;
}

/**
 * SkeletonBlock
 *
 * A loading placeholder component with shimmer animation.
 * Respects reduced motion preferences and supports dark mode.
 */
export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  variant,
  className = '',
}) => {
  const { isMotionEnabled } = useMotion();

  const baseClasses = `
    bg-slate-200 dark:bg-dark-bg-tertiary
    rounded-lg
    overflow-hidden
    relative
  `;

  const shimmerClasses = isMotionEnabled
    ? 'animate-shimmer'
    : '';

  const variantClasses: Record<SkeletonVariant, string> = {
    card: 'w-full h-48',
    'list-row': 'w-full h-16',
    chart: 'w-full h-64',
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${shimmerClasses}
        ${className}
      `}
      aria-hidden="true"
      role="presentation"
    >
      {/* Shimmer overlay - only rendered when motion is enabled */}
      {isMotionEnabled && (
        <div
          className={`
            absolute inset-0
            bg-gradient-to-r
            from-transparent via-white/20 dark:via-white/10 to-transparent
            -translate-x-full
            animate-shimmer-slide
          `}
        />
      )}

      {/* Variant-specific skeleton structure */}
      {variant === 'card' && (
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-300 dark:bg-dark-bg-secondary rounded w-3/4" />
          <div className="h-3 bg-slate-300 dark:bg-dark-bg-secondary rounded w-1/2" />
          <div className="h-20 bg-slate-300 dark:bg-dark-bg-secondary rounded mt-4" />
        </div>
      )}

      {variant === 'list-row' && (
        <div className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-300 dark:bg-dark-bg-secondary rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-300 dark:bg-dark-bg-secondary rounded w-3/4" />
            <div className="h-3 bg-slate-300 dark:bg-dark-bg-secondary rounded w-1/2" />
          </div>
        </div>
      )}

      {variant === 'chart' && (
        <div className="p-4 space-y-4">
          <div className="h-4 bg-slate-300 dark:bg-dark-bg-secondary rounded w-1/3" />
          <div className="flex items-end space-x-2 h-48">
            {[40, 65, 30, 80, 55, 70, 45].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-slate-300 dark:bg-dark-bg-secondary rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkeletonBlock;

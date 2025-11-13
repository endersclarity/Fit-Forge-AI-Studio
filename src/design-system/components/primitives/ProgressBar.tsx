/**
 * ProgressBar Component - Primitive UI Element
 *
 * Reusable progress bar component with smooth animations.
 * Supports progress value (0-100), color variants, size options, and optional labels.
 * Uses Framer Motion for smooth transition animations.
 *
 * Reference: Epic 6.5 Story 1 - Railway Deployment & Missing Primitives
 * Design System: docs/design-system.md
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  /**
   * Progress value (0-100)
   */
  value: number;

  /**
   * Visual variant of the progress bar
   * - primary: Default primary color
   * - success: Green for completed/successful progress
   * - warning: Yellow for cautionary states
   * - error: Red for failed/problematic progress
   */
  variant?: 'primary' | 'success' | 'warning' | 'error';

  /**
   * Progress bar size
   * - sm: Small (h-2)
   * - md: Medium (h-3) - default
   * - lg: Large (h-4)
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show percentage label
   */
  showLabel?: boolean;

  /**
   * Additional CSS classes (merged with defaults)
   */
  className?: string;

  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string;
}

/**
 * ProgressBar Component
 *
 * Displays visual progress indicators with smooth animations.
 * Commonly used in: workout completion, recovery timelines, calibration progress.
 *
 * **Accessibility:**
 * - Uses role="progressbar"
 * - Sets aria-valuenow, aria-valuemin, aria-valuemax
 * - Supports custom aria-label
 *
 * @param value - Progress value (0-100)
 * @param variant - Visual style (primary, success, warning, error)
 * @param size - Progress bar height (sm, md, lg)
 * @param showLabel - Whether to display percentage label
 * @param className - Additional CSS classes
 * @param aria-label - Accessibility label
 *
 * @example
 * ```tsx
 * <ProgressBar value={75} variant="success" />
 * <ProgressBar value={50} showLabel />
 * <ProgressBar value={25} variant="warning" size="lg" />
 * <ProgressBar value={100} variant="primary" aria-label="Workout completion" />
 * ```
 */
const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      variant = 'primary',
      size = 'md',
      showLabel = false,
      className = '',
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    // Clamp value between 0 and 100, handle edge cases
    const clampedValue = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    const percentage = Math.round(clampedValue);

    // Base container styles
    const baseClasses = 'w-full bg-gray-200 rounded-full overflow-hidden';

    // Size-specific styles (height)
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };

    // Variant-specific fill colors
    const variantClasses = {
      primary: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    // Combine container classes
    const containerClasses = [
      baseClasses,
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Spring animation configuration (matching FAB pattern)
    const springTransition = {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    };

    return (
      <div ref={ref} className="w-full">
        <div
          className={containerClasses}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={ariaLabel || `Progress: ${percentage}%`}
        >
          <motion.div
            className={`h-full ${variantClasses[variant]} rounded-full`}
            initial={{ width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={springTransition}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-sm font-body text-gray-700 text-right">
            {percentage}%
          </div>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

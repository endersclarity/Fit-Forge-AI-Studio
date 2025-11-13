/**
 * Badge Component - Primitive UI Element
 *
 * Reusable badge component for status indicators, counts, and labels.
 * Supports success, warning, error, info, and primary variants with sm, md, lg sizes.
 * Uses semantic design tokens for consistent theming.
 *
 * Reference: Epic 6.5 Story 1 - Railway Deployment & Missing Primitives
 * Design System: docs/design-system.md
 */

import React from 'react';

export interface BadgeProps {
  /**
   * Visual variant of the badge
   * - success: Green for positive states (completed, available)
   * - warning: Yellow for cautionary states (pending, attention needed)
   * - error: Red for negative states (failed, unavailable)
   * - info: Blue for informational states (new, updated)
   * - primary: Default primary color
   */
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary';

  /**
   * Badge size
   * - sm: Small (text-xs, px-2 py-0.5)
   * - md: Medium (text-sm, px-3 py-1) - default
   * - lg: Large (text-base, px-4 py-1.5)
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Badge content (required) - text, numbers, or icons
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes (merged with defaults)
   */
  className?: string;

  /**
   * ARIA label for accessibility (optional, useful for icon-only badges)
   */
  'aria-label'?: string;
}

/**
 * Badge Component
 *
 * Displays status indicators, counts, or labels with semantic color coding.
 * Commonly used in: StatusBadge, MuscleCard badges, workout logs, notifications.
 *
 * @param variant - Visual style (success, warning, error, info, primary)
 * @param size - Badge size (sm, md, lg)
 * @param children - Badge content
 * @param className - Additional CSS classes
 * @param aria-label - Accessibility label
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" size="sm">Pending</Badge>
 * <Badge variant="error">Failed</Badge>
 * <Badge variant="info" size="lg">New</Badge>
 * <Badge variant="primary">12</Badge>
 * ```
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      className = '',
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    // Base styles common to all badges
    const baseClasses =
      'inline-flex items-center justify-center font-body font-semibold rounded-full whitespace-nowrap';

    // Variant-specific styles with semantic colors
    const variantClasses = {
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      error: 'bg-red-100 text-red-800 border border-red-200',
      info: 'bg-blue-100 text-blue-800 border border-blue-200',
      primary: 'bg-badge-bg text-badge-text border border-badge-border',
    };

    // Size-specific styles
    const sizeClasses = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-3 py-1',
      lg: 'text-base px-4 py-1.5',
    };

    // Combine all classes
    const combinedClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span
        ref={ref}
        className={combinedClasses}
        aria-label={ariaLabel}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;

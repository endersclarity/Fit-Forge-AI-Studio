/**
 * Card Component - Primitive UI Element
 *
 * Reusable card component with glass morphism styling.
 * Implements glass effect with backdrop blur, semi-transparent background, and subtle border.
 * Used for containing content with visual separation and depth.
 *
 * Reference: Epic 5 Story 3 - Primitive Components Library
 * Design System: docs/design-system.md
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Visual variant of the card
   * - default: Glass morphism effect (white/50, backdrop-blur-sm, border)
   * - elevated: Glass effect with shadow
   */
  variant?: 'default' | 'elevated';

  /**
   * Additional CSS classes (merged with defaults)
   */
  className?: string;

  /**
   * Click handler for interactive cards
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

  /**
   * Role for accessibility (defaults to 'region' for non-interactive)
   */
  role?: string;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}

/**
 * Card Component
 *
 * Creates a glass morphism card with semi-transparent background and backdrop blur.
 * Provides visual separation and depth with premium aesthetic.
 *
 * @param variant - Card visual style (default, elevated)
 * @param children - Card content
 * @param className - Additional CSS classes
 * @param onClick - Click handler
 * @param role - ARIA role
 * @param ariaLabel - Accessibility label
 * @param props - Additional HTML div attributes
 *
 * @example
 * ```tsx
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 *
 * <Card variant="elevated">
 *   <h3>Featured Card</h3>
 *   <p>Card with shadow</p>
 * </Card>
 * ```
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      children,
      className,
      onClick,
      role = onClick ? 'button' : 'region',
      ariaLabel,
      ...props
    },
    ref
  ) => {
    // Base glass morphism classes
    const baseClasses =
      'bg-white/50 backdrop-blur-sm border border-gray-300/50 rounded-xl transition-all duration-200';

    // Variant-specific classes
    const variantClasses = {
      default: 'hover:bg-white/60 hover:border-gray-400/50',
      elevated: 'shadow-lg hover:shadow-xl hover:bg-white/60',
    };

    // Interactive classes
    const interactiveClasses = onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30' : '';

    // Combine all classes
    const combinedClasses = [baseClasses, variantClasses[variant], interactiveClasses, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={combinedClasses}
        onClick={onClick}
        role={role}
        aria-label={ariaLabel}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick(e as any);
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

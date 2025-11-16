/**
 * Button Component - Primitive UI Element
 *
 * Reusable button component with multiple variants and sizes.
 * Supports primary, secondary, and ghost variants with sm, md, lg sizes.
 * Implements accessibility features including keyboard navigation and ARIA labels.
 *
 * Reference: Epic 5 Story 3 - Primitive Components Library
 * Design System: docs/design-system.md
 */

import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '@/design-system/tokens';
import { useMotion } from '@/src/providers/MotionProvider';
import { SPRING_TRANSITION } from '@/src/providers/motion-presets';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   * - primary: Main action button with primary color background
   * - secondary: Secondary action with medium primary color
   * - ghost: Transparent with border, minimal style
   */
  variant?: 'primary' | 'secondary' | 'ghost';

  /**
   * Button size
   * - sm: Small (px-4 py-2 text-sm)
   * - md: Medium (px-5 py-3 text-base) - default
   * - lg: Large (px-6 py-4 text-lg)
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Button content (required)
   */
  children: React.ReactNode;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;

  /**
   * Additional CSS classes (merged with defaults)
   */
  className?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Button type attribute
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Button Component
 *
 * @param variant - Visual style (primary, secondary, ghost)
 * @param size - Button size (sm, md, lg)
 * @param children - Button content
 * @param ariaLabel - Accessibility label
 * @param className - Additional CSS classes
 * @param disabled - Disabled state
 * @param type - Button type
 * @param onClick - Click handler
 * @param props - Additional HTML button attributes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click Me</Button>
 * <Button variant="secondary" size="lg">Save</Button>
 * <Button variant="ghost" size="sm">Cancel</Button>
 * <Button disabled>Disabled</Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      ariaLabel,
      className,
      disabled = false,
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const { isMotionEnabled } = useMotion();
    // Base styles common to all buttons
    const baseClasses =
      'rounded-full font-body font-bold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Variant-specific styles
    const variantClasses = {
      primary: `bg-primary text-white shadow-button-primary hover:brightness-110 focus:ring-primary/30`,
      secondary: `bg-primary-medium text-white hover:brightness-110 focus:ring-primary-medium/30`,
      ghost: `bg-transparent text-primary border-2 border-primary hover:bg-primary/10 focus:ring-primary/30`,
    };

    // Size-specific styles
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-3 text-base',
      lg: 'px-6 py-4 text-lg',
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
      <motion.button
        ref={ref}
        type={type}
        className={combinedClasses}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={onClick}
        whileTap={
          isMotionEnabled
            ? {
                scale: 0.95,
              }
            : undefined
        }
        whileHover={
          isMotionEnabled
            ? {
                scale: 1.05,
              }
            : undefined
        }
        transition={SPRING_TRANSITION}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

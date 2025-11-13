/**
 * Input Component - Primitive UI Element
 *
 * Reusable input component with glass background and focus ring.
 * Implements accessible input field with various sizes and variants.
 * Supports disabled and error states.
 *
 * Reference: Epic 5 Story 3 - Primitive Components Library
 * Design System: docs/design-system.md
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input variant
   * - default: Standard glass input with primary focus ring
   * - error: Red border and focus ring for validation errors
   */
  variant?: 'default' | 'error';

  /**
   * Input size
   * - sm: Small (px-3 py-2 text-sm)
   * - md: Medium (px-4 py-3 text-base) - default
   * - lg: Large (px-5 py-4 text-lg)
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Input value (for controlled component)
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;

  /**
   * Additional CSS classes (merged with defaults)
   */
  className?: string;

  /**
   * Input type attribute
   */
  type?: string;

  /**
   * Focus handler
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Blur handler
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * Input Component
 *
 * Creates an input field with glass morphism background and focus ring.
 * Provides accessible input with proper keyboard navigation and ARIA attributes.
 *
 * @param variant - Input style (default, error)
 * @param size - Input size (sm, md, lg)
 * @param placeholder - Placeholder text
 * @param value - Input value
 * @param onChange - Change handler
 * @param disabled - Disabled state
 * @param ariaLabel - Accessibility label
 * @param className - Additional CSS classes
 * @param type - Input type
 * @param onFocus - Focus handler
 * @param onBlur - Blur handler
 * @param props - Additional HTML input attributes
 *
 * @example
 * ```tsx
 * <Input placeholder="Enter text..." />
 * <Input size="lg" placeholder="Large input" />
 * <Input variant="error" placeholder="Error state" />
 * <Input disabled placeholder="Disabled input" />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      placeholder,
      value,
      onChange,
      disabled = false,
      ariaLabel,
      className,
      type = 'text',
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    // Base glass morphism classes
    const baseClasses =
      'bg-white/50 backdrop-blur-sm border border-gray-300/50 rounded-lg transition-all duration-200 font-body placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

    // Variant-specific styles
    const variantClasses = {
      default: 'focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
      error: 'border-red-500/50 focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50',
    };

    // Size-specific styles
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
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
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className={combinedClasses}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;

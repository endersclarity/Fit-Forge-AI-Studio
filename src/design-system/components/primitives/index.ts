/**
 * Primitive Components - Main Export
 *
 * Centralized access to all primitive UI components.
 * Import individual components or use barrel export for convenience.
 *
 * Reference: Epic 5 Story 3 - Primitive Components Library
 */

// Component exports
export { default as Button, type ButtonProps } from './Button';
export { default as Card, type CardProps } from './Card';
export { default as Sheet, type SheetProps } from './Sheet';
export { default as Input, type InputProps } from './Input';

/**
 * Default exports for convenience
 *
 * @example
 * ```ts
 * // Import individual components
 * import { Button, Card, Sheet, Input } from '@/design-system/components/primitives';
 *
 * // Or import specific types
 * import { ButtonProps, CardProps } from '@/design-system/components/primitives';
 * ```
 */

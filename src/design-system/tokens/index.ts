/**
 * Design System Tokens - Main Export
 *
 * Centralized access to all design tokens.
 * Import from this file for convenience and consistency.
 *
 * @example
 * ```ts
 * import { colors, typography, spacing, shadows } from '@/design-system/tokens';
 * ```
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';

/**
 * Complete design token system
 */
export { colors } from './colors';
export { typography, fontFamily, displayScale, bodyScale } from './typography';
export { spacing, semanticSpacing, borderRadius } from './spacing';
export { shadows, glassShadows, elevation } from './shadows';

/**
 * Design System - Shadow Tokens
 *
 * Elevation and shadow definitions for depth and hierarchy.
 * Creates visual layering in the FitForge interface.
 *
 * Reference: UX Design Section 2 (Design System Application)
 */

/**
 * Shadow definitions
 * Organized by elevation level and use case
 */
export const shadows = {
  /**
   * No shadow (flat elements)
   */
  none: 'none',

  /**
   * Subtle elevation - Cards, containers
   */
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',

  /**
   * Medium elevation - Dropdowns, popovers
   */
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  /**
   * High elevation - Modals, drawers
   */
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  /**
   * Component-specific shadows
   */
  'button-primary': '0 2px 8px rgba(117, 138, 198, 0.4)',
  drawer: '0 -10px 30px -15px rgba(0, 0, 0, 0.2)',

  /**
   * Inner shadows
   */
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

/**
 * Glassmorphism shadow effects
 * Used for glass-like surfaces with backdrop blur
 */
export const glassShadows = {
  subtle: '0 4px 30px rgba(0, 0, 0, 0.1)',
  medium: '0 8px 32px rgba(0, 0, 0, 0.15)',
  strong: '0 12px 40px rgba(0, 0, 0, 0.2)',
} as const;

/**
 * Elevation scale
 * Maps elevation levels to shadow values
 */
export const elevation = {
  0: shadows.none,
  1: shadows.sm,
  2: shadows.md,
  3: shadows.lg,
  4: shadows.xl,
  5: shadows['2xl'],
} as const;

/**
 * Type exports for TypeScript
 */
export type ShadowKey = keyof typeof shadows;
export type GlassShadowKey = keyof typeof glassShadows;
export type ElevationLevel = keyof typeof elevation;

/**
 * Helper function to get shadow value
 */
export function getShadow(key: ShadowKey): string {
  return shadows[key];
}

/**
 * Helper function to get glass shadow
 */
export function getGlassShadow(key: GlassShadowKey): string {
  return glassShadows[key];
}

/**
 * Helper function to get elevation shadow
 */
export function getElevation(level: ElevationLevel): string {
  return elevation[level];
}

/**
 * Custom shadow builder
 * Create custom shadows with specific parameters
 */
export function createShadow(
  offsetX: number,
  offsetY: number,
  blur: number,
  spread: number,
  color: string,
  inset: boolean = false
): string {
  const insetStr = inset ? 'inset ' : '';
  return `${insetStr}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
}

/**
 * Design System - Spacing Tokens
 *
 * 8px grid system for consistent spacing across the application.
 * All spacing values are multiples of 8px for visual harmony.
 *
 * Reference: UX Design best practices
 * Grid: 8px base unit
 */

/**
 * Base spacing unit (8px)
 * All spacing is calculated from this base unit
 */
export const BASE_UNIT = 8;

/**
 * Spacing scale based on 8px grid
 * Values are multiples of 8 for consistency
 */
export const spacing = {
  0: '0',
  1: '8px',      // 1 unit
  2: '16px',     // 2 units
  3: '24px',     // 3 units
  4: '32px',     // 4 units
  5: '40px',     // 5 units
  6: '48px',     // 6 units
  7: '56px',     // 7 units
  8: '64px',     // 8 units
  10: '80px',    // 10 units
  12: '96px',    // 12 units
  16: '128px',   // 16 units
  20: '160px',   // 20 units
  24: '192px',   // 24 units
} as const;

/**
 * Semantic spacing tokens
 * Common spacing patterns with meaningful names
 */
export const semanticSpacing = {
  /**
   * Component internal spacing
   */
  componentPadding: {
    xs: spacing[1],   // 8px
    sm: spacing[2],   // 16px
    md: spacing[3],   // 24px
    lg: spacing[4],   // 32px
    xl: spacing[6],   // 48px
  },

  /**
   * Spacing between elements
   */
  elementGap: {
    xs: spacing[1],   // 8px
    sm: spacing[2],   // 16px
    md: spacing[3],   // 24px
    lg: spacing[4],   // 32px
  },

  /**
   * Section spacing (between major sections)
   */
  sectionGap: {
    sm: spacing[4],   // 32px
    md: spacing[6],   // 48px
    lg: spacing[8],   // 64px
    xl: spacing[12],  // 96px
  },

  /**
   * Container spacing (outer margins/padding)
   */
  containerPadding: {
    mobile: spacing[2],   // 16px
    tablet: spacing[3],   // 24px
    desktop: spacing[4],  // 32px
  },
} as const;

/**
 * Border radius tokens
 * Rounded corners for UI elements
 */
export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '24px',   // Cards, search bars
  '2xl': '32px',
  full: '9999px',  // Fully rounded (pills, avatars)
} as const;

/**
 * Type exports for TypeScript
 */
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;

/**
 * Helper function to calculate custom spacing
 * @param units - Number of 8px units
 * @returns Spacing value in pixels
 */
export function calculateSpacing(units: number): string {
  return `${units * BASE_UNIT}px`;
}

/**
 * Helper function to get spacing value
 */
export function getSpacing(key: SpacingKey): string {
  return spacing[key];
}

/**
 * Helper function to get border radius
 */
export function getBorderRadius(key: BorderRadiusKey): string {
  return borderRadius[key];
}

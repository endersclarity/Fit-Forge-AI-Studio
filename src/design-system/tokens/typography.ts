/**
 * Design System - Typography Tokens
 *
 * Typography scale definitions for FitForge's elegant, sophisticated design.
 * Combines Cinzel (display/headings) with Lato (body text) for premium feel.
 *
 * Reference: UX Design Section 2 (Design System Application)
 * Source: docs/design-system.md Typography sections
 */

export const fontFamily = {
  /**
   * Display font - Cinzel (serif)
   * Used for headings, titles, and prominent text
   */
  display: ['Cinzel', 'serif'],

  /**
   * Body font - Lato (sans-serif)
   * Used for body text, labels, and general content
   */
  body: ['Lato', 'sans-serif'],

  /**
   * Aliases for convenience
   */
  cinzel: ['Cinzel', 'serif'],
  lato: ['Lato', 'sans-serif'],
} as const;

/**
 * Display typography scale
 * Large, elegant headings with Cinzel font
 */
export const displayScale = {
  xl: {
    fontSize: '32px',
    lineHeight: '1.2',
    letterSpacing: '0.05em',
    fontWeight: '700',
    fontFamily: 'Cinzel, serif',
  },
  lg: {
    fontSize: '24px',
    lineHeight: '1.3',
    letterSpacing: '0.05em',
    fontWeight: '700',
    fontFamily: 'Cinzel, serif',
  },
  md: {
    fontSize: '18px',
    lineHeight: '1.4',
    letterSpacing: '0.025em',
    fontWeight: '700',
    fontFamily: 'Cinzel, serif',
  },
} as const;

/**
 * Body typography scale
 * Standard text sizes with Lato font
 */
export const bodyScale = {
  xl: {
    fontSize: '20px',
    lineHeight: '1.5',
    fontWeight: '400',
    fontFamily: 'Lato, sans-serif',
  },
  lg: {
    fontSize: '18px',
    lineHeight: '1.5',
    fontWeight: '400',
    fontFamily: 'Lato, sans-serif',
  },
  md: {
    fontSize: '16px',
    lineHeight: '1.5',
    fontWeight: '400',
    fontFamily: 'Lato, sans-serif',
  },
  sm: {
    fontSize: '14px',
    lineHeight: '1.5',
    fontWeight: '400',
    fontFamily: 'Lato, sans-serif',
  },
  xs: {
    fontSize: '12px',
    lineHeight: '1.5',
    fontWeight: '400',
    fontFamily: 'Lato, sans-serif',
  },
} as const;

/**
 * Font weights
 * Standardized weights across the design system
 */
export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * Letter spacing values
 * Used for different text styles
 */
export const letterSpacing = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

/**
 * Type exports for TypeScript
 */
export type DisplaySize = keyof typeof displayScale;
export type BodySize = keyof typeof bodyScale;
export type FontWeight = keyof typeof fontWeight;
export type LetterSpacing = keyof typeof letterSpacing;

/**
 * Helper function to get display typography styles
 */
export function getDisplayStyle(size: DisplaySize) {
  return displayScale[size];
}

/**
 * Helper function to get body typography styles
 */
export function getBodyStyle(size: BodySize) {
  return bodyScale[size];
}

/**
 * Complete typography system export
 */
export const typography = {
  fontFamily,
  displayScale,
  bodyScale,
  fontWeight,
  letterSpacing,
} as const;

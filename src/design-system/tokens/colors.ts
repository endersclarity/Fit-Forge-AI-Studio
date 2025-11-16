/**
 * Design System - Color Tokens
 *
 * Programmatic access to FitForge color palette.
 * These tokens match the Tailwind configuration for consistent use
 * across both Tailwind classes and programmatic styling.
 *
 * Reference: UX Design Section 2 (Design System Application)
 * Source: docs/design-system.md Lines 27-69
 */

export const colors = {
  /**
   * Primary color palette - Sophisticated blues
   * Used for branding, primary actions, and visual hierarchy
   */
  primary: {
    DEFAULT: '#758AC6',  // Primary brand color
    dark: '#344161',     // Deep navy for contrast
    medium: '#566890',   // Medium blue for secondary elements
    light: '#8997B8',    // Light blue for hover states
    pale: '#A8B6D5',     // Pale blue for subtle backgrounds
  },

  /**
   * Badge colors - Subtle, refined indicators
   * Used for status badges, tags, and labels
   */
  badge: {
    bg: '#D9E1F8',       // Background color
    border: '#BFCBEE',   // Border color
    text: '#566890',     // Text color (primary-medium)
  },

  /**
   * Legacy colors - Maintained for backward compatibility
   * These will be phased out as components migrate to new design system
   */
  legacy: {
    cyan: '#22d3ee',     // Brand cyan (legacy)
    dark: '#0f172a',     // Brand dark (legacy)
    surface: '#1e293b',  // Brand surface (legacy)
    muted: '#475569',    // Brand muted (legacy)
  },

  /**
   * Glass surfaces - canonical opacity/border sets
   */
  glass: {
    surface: {
      light: 'rgba(255,255,255,0.55)',
      lightElevated: 'rgba(255,255,255,0.62)',
      dark: 'rgba(15,23,42,0.72)',
      darkElevated: 'rgba(15,23,42,0.82)',
    },
    border: {
      light: 'rgba(255,255,255,0.35)',
      subtle: 'rgba(255,255,255,0.25)',
      dark: 'rgba(255,255,255,0.18)',
    },
  },

  /**
   * Dark mode colors - Consistent slate palette for dark theme
   * Uses Tailwind Slate colors for professional appearance
   */
  dark: {
    bg: {
      primary: '#0f172a',    // Slate 900 - main background
      secondary: '#1e293b',  // Slate 800 - elevated surfaces
      tertiary: '#334155',   // Slate 700 - cards/panels
    },
    text: {
      primary: '#f8fafc',    // Slate 50 - primary text
      secondary: '#cbd5e1',  // Slate 300 - secondary text
      muted: '#94a3b8',      // Slate 400 - muted text
    },
    border: {
      DEFAULT: '#334155',    // Slate 700
      subtle: '#1e293b',     // Slate 800
      emphasis: '#475569',   // Slate 600
    },
  },

  /**
   * Gradients - Background gradients for light and dark modes
   */
  gradients: {
    heavenly: 'linear-gradient(180deg, rgba(235, 241, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
    dark: 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.96) 100%)',
    darkElevated: 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(51,65,85,0.98) 100%)',
    darkRadial: 'radial-gradient(ellipse at top, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.98) 70%)',
  },
} as const;

/**
 * Type-safe color access
 * Extract the type for use in components
 */
export type ColorTokens = typeof colors;
export type PrimaryColor = keyof typeof colors.primary;
export type BadgeColor = keyof typeof colors.badge;
export type LegacyColor = keyof typeof colors.legacy;
export type GlassColor = keyof typeof colors.glass;
export type DarkColor = keyof typeof colors.dark;
export type GradientColor = keyof typeof colors.gradients;

/**
 * Helper function to get color value by path
 * Example: getColor('primary', 'dark') => '#344161'
 */
export function getColor(
  category: keyof ColorTokens,
  shade?: string
): string {
  const colorGroup = colors[category];

  if (typeof colorGroup === 'string') {
    return colorGroup;
  }

  if (shade && shade in colorGroup) {
    return colorGroup[shade as keyof typeof colorGroup];
  }

  if ('DEFAULT' in colorGroup) {
    return colorGroup.DEFAULT;
  }

  throw new Error(`Invalid color path: ${category}.${shade}`);
}

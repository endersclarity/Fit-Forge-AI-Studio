/**
 * useHaptic Hook - Web Vibration API Wrapper
 *
 * Provides haptic feedback functionality using the Web Vibration API.
 * Gracefully degrades on devices/browsers that don't support vibration.
 *
 * Reference: Epic 6 Story 3 - Inline Number Pickers
 * Design System: docs/ux-design-premium-system-2025-11-12.md
 */

export interface UseHapticReturn {
  /**
   * Trigger a single vibration pulse
   * @param duration - Duration in milliseconds (10ms = subtle, 20ms = medium, 50ms = strong)
   */
  vibrate: (duration: number) => void;

  /**
   * Trigger a pattern of vibrations
   * @param pattern - Array of [vibrate, pause, vibrate, pause, ...] durations in ms
   * @example vibratePattern([10, 50, 10]) // Double tap pattern
   */
  vibratePattern: (pattern: number[]) => void;

  /**
   * Check if vibration is supported on this device
   */
  isSupported: boolean;
}

/**
 * Hook for providing haptic feedback
 *
 * @returns {UseHapticReturn} Haptic feedback functions
 *
 * @example
 * ```tsx
 * const { vibrate, isSupported } = useHaptic();
 *
 * const handleClick = () => {
 *   vibrate(10); // Subtle 10ms pulse
 *   // ... rest of click handler
 * };
 * ```
 */
export function useHaptic(): UseHapticReturn {
  // Check if Vibration API is supported
  const isSupported = 'vibrate' in navigator;

  /**
   * Trigger a single vibration
   */
  const vibrate = (duration: number): void => {
    if (isSupported) {
      try {
        navigator.vibrate(duration);
      } catch (error) {
        // Silently fail if vibration API throws
        console.warn('Vibration API error:', error);
      }
    }
  };

  /**
   * Trigger a pattern of vibrations
   */
  const vibratePattern = (pattern: number[]): void => {
    if (isSupported) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        // Silently fail if vibration API throws
        console.warn('Vibration API error:', error);
      }
    }
  };

  return {
    vibrate,
    vibratePattern,
    isSupported,
  };
}

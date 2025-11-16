import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface MotionContextValue {
  /**
   * True when animations are allowed (feature flag on + user has not requested reduced motion)
   */
  isMotionEnabled: boolean;
  /**
   * Feature flag state from Vite env var
   */
  featureFlagEnabled: boolean;
  /**
   * Whether the OS prefers reduced motion
   */
  prefersReducedMotion: boolean;
  /**
   * Utility to manually override reduced-motion preference (used by QA tools)
   */
  setPrefersReducedMotion: (value: boolean) => void;
}

const MotionContext = createContext<MotionContextValue | null>(null);

/**
 * MotionProvider
 *
 * Reads the `VITE_ANIMATIONS_ENABLED` flag plus the user's
 * `prefers-reduced-motion` media query and exposes a unified
 * context used throughout the UI to determine whether Framer Motion
 * variants should run.
 */
export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    updatePreference(mediaQuery);
    mediaQuery.addEventListener('change', updatePreference as EventListener);

    return () => {
      mediaQuery.removeEventListener('change', updatePreference as EventListener);
    };
  }, []);

  const setReducedMotionOverride = useCallback((value: boolean) => {
    setPrefersReducedMotion(value);
  }, []);

  const featureFlagEnabled =
    (import.meta.env.VITE_ANIMATIONS_ENABLED ?? 'true') !== 'false';

  const value = useMemo<MotionContextValue>(
    () => ({
      isMotionEnabled: featureFlagEnabled && !prefersReducedMotion,
      featureFlagEnabled,
      prefersReducedMotion,
      setPrefersReducedMotion: setReducedMotionOverride,
    }),
    [featureFlagEnabled, prefersReducedMotion, setReducedMotionOverride]
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
};

export const useMotion = (): MotionContextValue => {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
};

export const useMotionEnabled = (): boolean => {
  const { isMotionEnabled } = useMotion();
  return isMotionEnabled;
};

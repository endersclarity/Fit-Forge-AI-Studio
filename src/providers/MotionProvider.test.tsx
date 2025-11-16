import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi, afterAll } from 'vitest';
import { MotionProvider, useMotion } from './MotionProvider';

const setupMatchMedia = () => {
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];
  const matchMediaMock = vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.push(listener);
    },
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
      const index = listeners.indexOf(listener);
      if (index >= 0) listeners.splice(index, 1);
    },
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
  });

  return listeners;
};

describe('MotionProvider', () => {
  const originalFlag = import.meta.env.VITE_ANIMATIONS_ENABLED;
  let listeners: Array<(event: MediaQueryListEvent) => void>;

  beforeAll(() => {
    listeners = setupMatchMedia();
  });

  afterAll(() => {
    import.meta.env.VITE_ANIMATIONS_ENABLED = originalFlag;
  });

  it('disables motion when feature flag is false', () => {
    import.meta.env.VITE_ANIMATIONS_ENABLED = 'false';
    const { result } = renderHook(() => useMotion(), {
      wrapper: ({ children }) => <MotionProvider>{children}</MotionProvider>,
    });

    expect(result.current.featureFlagEnabled).toBe(false);
    expect(result.current.isMotionEnabled).toBe(false);
  });

  it('responds to reduced motion preference changes', () => {
    import.meta.env.VITE_ANIMATIONS_ENABLED = 'true';
    const { result } = renderHook(() => useMotion(), {
      wrapper: ({ children }) => <MotionProvider>{children}</MotionProvider>,
    });

    expect(result.current.isMotionEnabled).toBe(true);

    act(() => {
      listeners.forEach((listener) =>
        listener({ matches: true } as MediaQueryListEvent)
      );
    });

    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.isMotionEnabled).toBe(false);
  });
});

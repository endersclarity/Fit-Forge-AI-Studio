import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Remove the global mock so we test the actual implementation
vi.unmock('@/src/providers/MotionProvider');

import { MotionProvider, useMotion } from './MotionProvider';

describe('MotionProvider', () => {
  let listeners: Array<(event: MediaQueryListEvent) => void>;

  beforeEach(() => {
    // Reset listeners for each test
    listeners = [];

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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('disables motion when feature flag is false', () => {
    const { result } = renderHook(() => useMotion(), {
      wrapper: ({ children }) => (
        <MotionProvider featureFlagOverride={false}>{children}</MotionProvider>
      ),
    });

    expect(result.current.featureFlagEnabled).toBe(false);
    expect(result.current.isMotionEnabled).toBe(false);
  });

  it('responds to reduced motion preference changes', () => {
    const { result } = renderHook(() => useMotion(), {
      wrapper: ({ children }) => (
        <MotionProvider featureFlagOverride={true}>{children}</MotionProvider>
      ),
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

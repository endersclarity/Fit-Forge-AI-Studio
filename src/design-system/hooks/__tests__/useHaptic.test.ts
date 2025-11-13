/**
 * useHaptic Hook Tests
 *
 * Tests for the Web Vibration API wrapper hook.
 */

import { renderHook } from '@testing-library/react';
import { useHaptic } from '../useHaptic';
import { vi } from 'vitest';

describe('useHaptic', () => {
  let vibrateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock the vibrate function on navigator
    vibrateMock = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateMock,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return vibrate and vibratePattern functions', () => {
    const { result } = renderHook(() => useHaptic());

    expect(result.current.vibrate).toBeDefined();
    expect(result.current.vibratePattern).toBeDefined();
    expect(typeof result.current.vibrate).toBe('function');
    expect(typeof result.current.vibratePattern).toBe('function');
  });

  it('should call navigator.vibrate with correct duration', () => {
    const { result } = renderHook(() => useHaptic());

    result.current.vibrate(10);

    expect(vibrateMock).toHaveBeenCalledWith(10);
    expect(vibrateMock).toHaveBeenCalledTimes(1);
  });

  it('should call navigator.vibrate with pattern array', () => {
    const { result } = renderHook(() => useHaptic());
    const pattern = [10, 50, 10];

    result.current.vibratePattern(pattern);

    expect(vibrateMock).toHaveBeenCalledWith(pattern);
    expect(vibrateMock).toHaveBeenCalledTimes(1);
  });

  it('should indicate support when vibrate API is available', () => {
    const { result } = renderHook(() => useHaptic());

    expect(result.current.isSupported).toBe(true);
  });

  it('should not throw when vibrate API is not supported', () => {
    // Remove vibrate from navigator
    const originalVibrate = navigator.vibrate;
    // @ts-expect-error - Testing unsupported API
    delete navigator.vibrate;

    const { result } = renderHook(() => useHaptic());

    expect(() => result.current.vibrate(10)).not.toThrow();
    expect(() => result.current.vibratePattern([10, 50, 10])).not.toThrow();
    expect(result.current.isSupported).toBe(false);

    // Restore vibrate
    navigator.vibrate = originalVibrate;
  });

  it('should handle vibrate API errors gracefully', () => {
    // Mock vibrate to throw an error
    Object.defineProperty(navigator, 'vibrate', {
      value: () => {
        throw new Error('Vibration not allowed');
      },
      configurable: true,
      writable: true,
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useHaptic());

    expect(() => result.current.vibrate(10)).not.toThrow();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Vibration API error:',
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });

  it('should support multiple vibration durations', () => {
    const { result } = renderHook(() => useHaptic());

    result.current.vibrate(10); // Subtle
    result.current.vibrate(20); // Medium
    result.current.vibrate(50); // Strong

    expect(vibrateMock).toHaveBeenCalledTimes(3);
    expect(vibrateMock).toHaveBeenNthCalledWith(1, 10);
    expect(vibrateMock).toHaveBeenNthCalledWith(2, 20);
    expect(vibrateMock).toHaveBeenNthCalledWith(3, 50);
  });
});

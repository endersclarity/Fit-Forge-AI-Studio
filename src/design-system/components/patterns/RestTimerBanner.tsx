/**
 * RestTimerBanner Component - Design System Pattern
 *
 * Compact, fixed-position rest timer displayed at the top of the viewport.
 * Auto-counts down, provides +15s shortcut, skip control, and subtle haptic feedback.
 *
 * Reference: Epic 7 Story 7.1 - Auto-Starting Rest Timer
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@/src/design-system/components/primitives';
import { useHaptic } from '@/src/design-system/hooks/useHaptic';

export interface RestTimerBannerProps {
  /**
   * Initial timer duration in seconds.
   * @default 90
   */
  initialSeconds?: number;

  /**
   * Called when the timer completes (reaches 0 seconds).
   */
  onComplete?: () => void;

  /**
   * Called when the timer is skipped/dismissed by the user.
   */
  onSkip?: () => void;

  /**
   * Override label text. Defaults to "Rest Timer".
   */
  label?: string;

  /**
   * Additional CSS classes for outer wrapper.
   */
  className?: string;
}

const RestTimerBanner: React.FC<RestTimerBannerProps> = ({
  initialSeconds = 90,
  onComplete,
  onSkip,
  label = 'Rest Timer',
  className,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const { vibrate } = useHaptic();

  // Reset timer when initialSeconds changes (new rest cycle)
  useEffect(() => {
    setSecondsRemaining(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  // Countdown effect
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    if (secondsRemaining <= 0) {
      setIsRunning(false);
      vibrate(20);
      onComplete?.();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [secondsRemaining, isRunning, vibrate, onComplete]);

  const handleSkip = () => {
    setIsRunning(false);
    onSkip?.();
  };

  const handleAddTime = () => {
    setSecondsRemaining((prev) => prev + 15);
    vibrate(10);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingPercent =
    initialSeconds > 0 ? Math.max(0, (secondsRemaining / initialSeconds) * 100) : 0;

  return (
    <div className={`fixed top-0 left-0 right-0 z-40 h-16 ${className ?? ''}`}>
      <div className="mx-auto flex h-full max-w-5xl items-center px-4">
        <div className="relative flex h-16 w-full items-center justify-between rounded-b-2xl border border-white/50 bg-white/90 px-4 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/90">
          {/* Progress Bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-primary/15 dark:bg-primary-light/20"
            role="progressbar"
            aria-valuenow={Math.max(0, secondsRemaining)}
            aria-valuemin={0}
            aria-valuemax={initialSeconds}
            aria-label="Rest timer progress"
          >
            <div
              className="h-full bg-primary transition-[width] duration-1000 ease-linear dark:bg-primary-light"
              style={{ width: `${remainingPercent}%` }}
            />
          </div>

          {/* Timer label */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-dark/70 dark:text-primary-light/80">
              {label}
            </span>
            <span
              className="text-3xl font-semibold leading-none text-primary-dark dark:text-primary-light"
              aria-live="polite"
            >
              {formatTime(secondsRemaining)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="min-h-[44px] min-w-[72px] rounded-full px-3 text-sm font-semibold"
              onClick={handleAddTime}
              aria-label="Add 15 seconds"
            >
              +15s
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px] min-w-[72px] rounded-full px-3 text-sm font-semibold text-primary-dark dark:text-primary-light"
              onClick={handleSkip}
              aria-label="Skip rest timer"
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

RestTimerBanner.displayName = 'RestTimerBanner';

export default RestTimerBanner;

import React from 'react';

export interface OfflineBannerProps {
  onRetry?: () => void;
  className?: string;
}

/**
 * OfflineBanner - Displays when the user is offline or cannot connect
 * Features:
 * - Clear messaging about offline state
 * - Optional retry button
 * - Sticky positioning at top of viewport
 * - High contrast for visibility
 */
export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry, className = '' }) => {
  return (
    <div
      className={`sticky top-0 z-50 bg-amber-600 text-white px-6 py-3 shadow-lg ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">
            cloud_off
          </span>
          <div>
            <p className="font-bold">You're offline</p>
            <p className="text-sm text-amber-100">
              Some features may not be available. Data will sync when you're back online.
            </p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-amber-600"
            aria-label="Retry connection"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;

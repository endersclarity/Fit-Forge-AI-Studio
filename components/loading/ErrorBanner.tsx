import React from 'react';

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * ErrorBanner - Displays error messages with retry option
 * Features:
 * - User-friendly error messaging
 * - Optional retry and dismiss actions
 * - High visibility with red background
 * - Accessible with ARIA labels
 */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      className={`bg-red-600 text-white px-6 py-4 shadow-lg rounded-lg ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-2xl flex-shrink-0" aria-hidden="true">
          error
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold mb-1">Something went wrong</p>
          <p className="text-sm text-red-100">{message}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
              aria-label="Retry action"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
              aria-label="Dismiss error"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                close
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;

/**
 * Toast Component
 *
 * Provides temporary feedback messages for user actions.
 * Supports 4 variants: success, error, info, loading
 * Auto-dismisses after configurable duration with pause-on-hover
 *
 * @component
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

/**
 * Props for the Toast component
 */
export interface ToastProps {
  /** Unique identifier for the toast */
  id: string;
  /** Visual variant of the toast */
  variant: 'success' | 'error' | 'info' | 'loading';
  /** Message to display */
  message: string;
  /** Duration in milliseconds before auto-dismiss (default: 5000) */
  duration?: number;
  /** Callback when toast is closed */
  onClose?: () => void;
  /** Custom icon to display (overrides variant icon) */
  icon?: React.ReactNode;
  /** Whether to show close button */
  showCloseButton?: boolean;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    bgClass: 'bg-success/90',
    borderClass: 'border-success',
    iconClass: 'text-white',
    textClass: 'text-white',
  },
  error: {
    icon: AlertCircle,
    bgClass: 'bg-error/90',
    borderClass: 'border-error',
    iconClass: 'text-white',
    textClass: 'text-white',
  },
  info: {
    icon: Info,
    bgClass: 'bg-primary/90',
    borderClass: 'border-primary',
    iconClass: 'text-white',
    textClass: 'text-white',
  },
  loading: {
    icon: Loader2,
    bgClass: 'bg-primary/90',
    borderClass: 'border-primary',
    iconClass: 'text-white animate-spin',
    textClass: 'text-white',
  },
};

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      id,
      variant = 'info',
      message,
      duration = 5000,
      onClose,
      icon,
      showCloseButton = true,
    },
    ref
  ) => {
    const [isPaused, setIsPaused] = useState(false);
    const [remainingTime, setRemainingTime] = useState(duration);
    const startTimeRef = useRef<number>(Date.now());
    const pauseTimeRef = useRef<number>(0);

    const config = variantConfig[variant];
    const IconComponent = config.icon;

    // Handle auto-dismiss with pause functionality
    useEffect(() => {
      if (variant === 'loading' || !duration || duration <= 0) {
        return; // Don't auto-dismiss loading toasts or if duration is 0
      }

      let timeoutId: NodeJS.Timeout;

      if (!isPaused) {
        timeoutId = setTimeout(() => {
          onClose?.();
        }, remainingTime);
      }

      return () => {
        clearTimeout(timeoutId);
      };
    }, [isPaused, remainingTime, onClose, duration, variant]);

    // Handle pause/resume timing
    const handleMouseEnter = () => {
      if (variant !== 'loading' && duration && duration > 0) {
        const elapsed = Date.now() - startTimeRef.current;
        setRemainingTime(Math.max(0, duration - elapsed));
        pauseTimeRef.current = Date.now();
        setIsPaused(true);
      }
    };

    const handleMouseLeave = () => {
      if (variant !== 'loading' && duration && duration > 0) {
        startTimeRef.current = Date.now() - (duration - remainingTime);
        setIsPaused(false);
      }
    };

    const handleClose = () => {
      onClose?.();
    };

    return (
      <motion.div
        ref={ref}
        role={variant === 'error' ? 'alert' : 'status'}
        aria-live={variant === 'error' ? 'assertive' : 'polite'}
        aria-atomic="true"
        initial={{ opacity: 0, x: 100, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md
          shadow-lg min-w-[280px] max-w-[420px]
          ${config.bgClass} ${config.borderClass}
        `}
        data-testid={`toast-${id}`}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconClass}`}>
          {icon || <IconComponent size={20} />}
        </div>

        {/* Message */}
        <div className={`flex-1 text-sm font-body ${config.textClass}`}>
          {message}
        </div>

        {/* Close Button */}
        {showCloseButton && variant !== 'loading' && (
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 p-1 rounded-md transition-all
              hover:bg-white/20 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-white/50
              ${config.textClass}
            `}
            aria-label="Close notification"
            style={{ minWidth: '60px', minHeight: '60px' }} // WCAG 2.1 touch target
          >
            <X size={16} />
          </button>
        )}

        {/* Progress Bar (for auto-dismiss) */}
        {duration > 0 && variant !== 'loading' && !isPaused && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-white/30"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{
              duration: remainingTime / 1000,
              ease: 'linear',
            }}
          />
        )}
      </motion.div>
    );
  }
);

Toast.displayName = 'Toast';

export default Toast;
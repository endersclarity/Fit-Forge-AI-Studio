/**
 * ToastContainer Component & Context
 *
 * Manages toast notifications globally with queue support.
 * Provides useToast hook for triggering toasts from anywhere.
 *
 * @component
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast, { ToastProps } from './Toast';

/**
 * Toast data structure with internal metadata
 */
export interface ToastData extends Omit<ToastProps, 'id' | 'onClose'> {
  id: string;
}

/**
 * Props for the ToastContainer component
 */
export interface ToastContainerProps {
  /** Position of toast container */
  position?: 'top-right' | 'bottom-center' | 'top-center' | 'bottom-right';
  /** Maximum number of toasts to show simultaneously */
  maxToasts?: number;
  /** Children components */
  children: React.ReactNode;
}

/**
 * Context value type for toast management
 */
interface ToastContextValue {
  showToast: (toast: Omit<ToastData, 'id'>) => string;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

// Create context
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Hook to access toast functionality
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastContainer');
  }
  return context;
};

/**
 * Container component that provides toast context and renders toasts
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 5,
  children,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const toastIdRef = useRef(0);

  // Generate unique toast ID
  const generateId = useCallback(() => {
    toastIdRef.current += 1;
    return `toast-${toastIdRef.current}`;
  }, []);

  // Show a new toast
  const showToast = useCallback(
    (toastData: Omit<ToastData, 'id'>) => {
      const id = generateId();
      const newToast: ToastData = {
        ...toastData,
        id,
      };

      setToasts((prevToasts) => {
        // Limit number of toasts
        const updatedToasts = [...prevToasts, newToast];
        if (updatedToasts.length > maxToasts) {
          return updatedToasts.slice(-maxToasts);
        }
        return updatedToasts;
      });

      return id;
    },
    [generateId, maxToasts]
  );

  // Hide a specific toast
  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Position styles
  const positionStyles: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  // Stack direction based on position
  const isBottomPosition = position.startsWith('bottom');
  const flexDirection = isBottomPosition ? 'flex-col-reverse' : 'flex-col';

  const contextValue: ToastContextValue = {
    showToast,
    hideToast,
    clearAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className={`
          fixed z-50 pointer-events-none
          ${positionStyles[position]}
        `}
        data-testid="toast-container"
      >
        <div className={`flex ${flexDirection} gap-2 pointer-events-auto`}>
          <AnimatePresence mode="sync">
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                id={toast.id}
                variant={toast.variant}
                message={toast.message}
                duration={toast.duration}
                icon={toast.icon}
                showCloseButton={toast.showCloseButton}
                onClose={() => hideToast(toast.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContainer;
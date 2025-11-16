import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotion } from '@/src/providers/MotionProvider';
import { SPRING_TRANSITION } from '@/src/providers/motion-presets';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number; // Duration in milliseconds, 0 = no auto-dismiss
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);
  const { isMotionEnabled } = useMotion();

  useEffect(() => {
    if (message) {
      setVisible(true);

      // If duration is 0, don't auto-dismiss
      if (duration === 0) {
        return;
      }

      const timer = setTimeout(() => {
        setVisible(false);
        // Allow fade-out transition before calling onClose
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role={type === 'error' ? 'alert' : 'status'}
          aria-live={type === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={isMotionEnabled ? SPRING_TRANSITION : { duration: 0 }}
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg ${bgColors[type]} text-white font-semibold max-w-md text-center`}
        >
          {message}
          {duration === 0 && (
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 300);
              }}
              className="ml-3 text-white hover:text-gray-200 font-bold min-w-[44px] min-h-[44px]"
              aria-label="Close notification"
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

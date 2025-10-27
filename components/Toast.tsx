import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number; // Duration in milliseconds, 0 = no auto-dismiss
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

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
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
      } ${bgColors[type]} text-white font-semibold max-w-md text-center`}
    >
      {message}
      {duration === 0 && (
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-3 text-white hover:text-gray-200 font-bold"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;

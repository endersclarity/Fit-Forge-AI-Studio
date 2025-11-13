import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RestTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({ initialSeconds, onComplete, onSkip }) => {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // Play completion sound (beep)
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = (remaining / initialSeconds) * 100;

  const handleAddTime = () => {
    setRemaining((prev) => prev + 15);
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-4 left-4 right-4 bg-white rounded-2xl shadow-lg z-50 overflow-hidden"
        style={{
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Timer Icon and Label */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Rest Timer</div>
                <motion.div
                  key={remaining}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-gray-900 tabular-nums"
                >
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </motion.div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddTime}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                +15s
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onSkip}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold text-white transition-colors shadow-md"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Skip
              </motion.button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-200 rounded-full mt-3 overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RestTimer;

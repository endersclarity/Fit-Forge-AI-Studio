import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InlineNumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

const InlineNumberPicker: React.FC<InlineNumberPickerProps> = ({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit = '',
}) => {
  const increment = () => {
    if (value < max) {
      onChange(Math.min(max, value + step));
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(Math.max(min, value - step));
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Decrement Button - 60px touch target */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={decrement}
        disabled={value <= min}
        className="w-[60px] h-[60px] rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        aria-label={`Decrease ${unit}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        −
      </motion.button>

      {/* Large Display - 60pt font */}
      <div className="flex flex-col items-center min-w-[140px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.15
            }}
            className="text-6xl font-bold text-gray-900 tabular-nums"
          >
            {value}
          </motion.div>
        </AnimatePresence>
        {unit && (
          <span className="text-sm text-gray-500 uppercase tracking-wide mt-1">
            {unit}
          </span>
        )}
      </div>

      {/* Increment Button - 60px touch target */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={increment}
        disabled={value >= max}
        className="w-[60px] h-[60px] rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
        aria-label={`Increase ${unit}`}
        style={{
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)'
        }}
      >
        +
      </motion.button>
    </div>
  );
};

export default InlineNumberPicker;

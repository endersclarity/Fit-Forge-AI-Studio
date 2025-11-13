/**
 * InlineNumberPicker Component - Pattern
 *
 * Large, gym-readable number input with +/- buttons and tap-to-edit functionality.
 * Features 60pt font display, 60x60px touch targets, and haptic feedback.
 *
 * Reference: Epic 6 Story 3 - Inline Number Pickers
 * Design System: docs/ux-design-premium-system-2025-11-12.md
 */

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useHaptic } from '@/src/design-system/hooks/useHaptic';

export interface InlineNumberPickerProps {
  /**
   * Current value
   */
  value: number;

  /**
   * Callback when value changes
   */
  onChange: (value: number) => void;

  /**
   * Minimum allowed value (default: 0)
   */
  min?: number;

  /**
   * Maximum allowed value (default: 9999)
   */
  max?: number;

  /**
   * Step increment (default: 1)
   * e.g., step=5 for weight in 5lb increments
   */
  step?: number;

  /**
   * Unit label (e.g., "lbs", "reps")
   */
  unit?: string;

  /**
   * Label for the picker (e.g., "Weight", "Reps")
   */
  label: string;

  /**
   * Callback when user taps the value (for opening bottom sheet)
   */
  onTapEdit?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * InlineNumberPicker Component
 *
 * Gym-optimized number input with large touch targets and readable display.
 *
 * @param value - Current number value
 * @param onChange - Callback when value changes
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (default: 9999)
 * @param step - Increment step (default: 1)
 * @param unit - Unit label (e.g., "lbs")
 * @param label - Picker label
 * @param onTapEdit - Callback when value is tapped
 * @param className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <InlineNumberPicker
 *   label="Weight"
 *   value={weight}
 *   onChange={setWeight}
 *   min={0}
 *   max={1000}
 *   step={5}
 *   unit="lbs"
 *   onTapEdit={() => setEditingField('weight')}
 * />
 * ```
 */
export const InlineNumberPicker: React.FC<InlineNumberPickerProps> = ({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit = '',
  label,
  onTapEdit,
  className = '',
}) => {
  const { vibrate } = useHaptic();

  /**
   * Handle increment button click
   * AC#2: +/- buttons (60x60px touch targets)
   * AC#4: Haptic feedback on button press (10ms vibration)
   * AC#5: Min/max validation
   */
  const handleIncrement = () => {
    if (value < max) {
      const newValue = Math.min(value + step, max);
      onChange(newValue);
      vibrate(10); // 10ms haptic pulse
    }
  };

  /**
   * Handle decrement button click
   * AC#2: +/- buttons (60x60px touch targets)
   * AC#4: Haptic feedback on button press (10ms vibration)
   * AC#5: Min/max validation
   */
  const handleDecrement = () => {
    if (value > min) {
      const newValue = Math.max(value - step, min);
      onChange(newValue);
      vibrate(10); // 10ms haptic pulse
    }
  };

  /**
   * Handle value tap for editing
   * AC#3: Tap value opens bottom sheet picker with keyboard
   * AC#4: Haptic feedback
   */
  const handleTapValue = () => {
    vibrate(10); // Haptic feedback on tap
    onTapEdit?.();
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Label */}
      <label className="text-sm font-lato font-bold text-primary-medium dark:text-gray-400 tracking-wide">
        {label}
      </label>

      {/* Picker Container: 180×80px */}
      <div
        className="flex items-center gap-2 bg-white/60 dark:bg-white/5
                   border border-gray-300/50 dark:border-white/10
                   rounded-2xl p-2"
      >
        {/* Minus Button: 60×60px - AC#2 */}
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-[60px] h-[60px] rounded-xl
                     bg-primary dark:bg-primary-light
                     text-white dark:text-slate-900
                     hover:brightness-110
                     active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-100
                     flex items-center justify-center"
          aria-label={`Decrease ${label}`}
          type="button"
        >
          <Minus size={24} strokeWidth={3} />
        </button>

        {/* Value Display: 60pt font - AC#1 */}
        <button
          onClick={handleTapValue}
          className="min-w-[60px] px-2
                     font-lato font-bold text-[60px] leading-none
                     text-primary-dark dark:text-gray-50
                     hover:text-primary dark:hover:text-primary-light
                     active:scale-95
                     transition-all"
          aria-label={`Edit ${label}`}
          type="button"
        >
          {value}
          {unit && (
            <span className="text-2xl text-primary-medium dark:text-gray-400 ml-1">
              {unit}
            </span>
          )}
        </button>

        {/* Plus Button: 60×60px - AC#2 */}
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-[60px] h-[60px] rounded-xl
                     bg-primary dark:bg-primary-light
                     text-white dark:text-slate-900
                     hover:brightness-110
                     active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-100
                     flex items-center justify-center"
          aria-label={`Increase ${label}`}
          type="button"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

InlineNumberPicker.displayName = 'InlineNumberPicker';

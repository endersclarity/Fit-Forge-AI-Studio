/**
 * NumberPadSheet Component - Pattern
 *
 * Bottom sheet with number pad for direct value entry.
 * Opened when user taps on InlineNumberPicker value.
 *
 * Reference: Epic 6 Story 3 - Inline Number Pickers (tap-to-edit functionality)
 * Design System: docs/ux-design-premium-system-2025-11-12.md
 */

import React, { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { Delete } from 'lucide-react';

export interface NumberPadSheetProps {
  /**
   * Whether the sheet is open
   */
  open: boolean;

  /**
   * Callback when open state changes
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Sheet title (e.g., "Edit Weight", "Edit Reps")
   */
  title: string;

  /**
   * Initial value to display
   */
  initialValue: number;

  /**
   * Callback when user submits the value
   */
  onSubmit: (value: number) => void;

  /**
   * Optional unit label (e.g., "lbs")
   */
  unit?: string;
}

/**
 * NumberPadSheet Component
 *
 * Provides a number pad interface for entering numeric values in a bottom sheet.
 *
 * @param open - Whether sheet is open
 * @param onOpenChange - Callback when open state changes
 * @param title - Sheet title
 * @param initialValue - Initial number to display
 * @param onSubmit - Callback when user submits
 * @param unit - Optional unit label
 *
 * @example
 * ```tsx
 * <NumberPadSheet
 *   open={editingField === 'weight'}
 *   onOpenChange={(open) => !open && setEditingField(null)}
 *   title="Edit Weight"
 *   initialValue={weight}
 *   onSubmit={(value) => {
 *     setWeight(value);
 *     setEditingField(null);
 *   }}
 *   unit="lbs"
 * />
 * ```
 */
export const NumberPadSheet: React.FC<NumberPadSheetProps> = ({
  open,
  onOpenChange,
  title,
  initialValue,
  onSubmit,
  unit = '',
}) => {
  const [inputValue, setInputValue] = useState(initialValue.toString());

  // Reset input value when sheet opens
  useEffect(() => {
    if (open) {
      setInputValue(initialValue.toString());
    }
  }, [open, initialValue]);

  /**
   * Handle number button press
   */
  const handleNumberPress = (num: string) => {
    setInputValue((prev) => (prev === '0' ? num : prev + num));
  };

  /**
   * Handle backspace
   */
  const handleBackspace = () => {
    setInputValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  /**
   * Handle submit
   */
  const handleSubmit = () => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value)) {
      onSubmit(value);
    }
  };

  // Number pad layout: 1-9, then 0 at bottom
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // Use UX design spec: confirmation height = 40vh/35vh/30vh
  // Mobile: 40vh, Tablet: 35vh, Desktop: 30vh
  const height = typeof window !== 'undefined' && window.innerWidth >= 1024
    ? '30vh'
    : window.innerWidth >= 768
    ? '35vh'
    : '40vh';

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />

        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50
                     bg-white/95 dark:bg-slate-900/95
                     backdrop-blur-xl
                     rounded-t-[24px]
                     border-t border-white/50"
          style={{ height }}
        >
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 bg-primary-pale dark:bg-gray-600 rounded-full mt-3" />

          {/* Title */}
          <h2
            className="text-2xl font-cinzel font-bold text-center mt-4
                       text-primary-dark dark:text-gray-50"
          >
            {title}
          </h2>

          {/* Display */}
          <div className="text-center py-6">
            <span
              className="text-6xl font-lato font-bold
                         text-primary-dark dark:text-gray-50"
            >
              {inputValue}
            </span>
            {unit && (
              <span className="text-3xl text-primary-medium dark:text-gray-400 ml-2">
                {unit}
              </span>
            )}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 px-4 pb-4">
            {/* Numbers 1-9 */}
            {numbers.map((num) => (
              <button
                key={num}
                onClick={() => handleNumberPress(num)}
                className="h-16 rounded-xl
                          bg-white/60 dark:bg-white/10
                          border border-gray-300/50 dark:border-white/10
                          text-2xl font-lato font-bold
                          text-primary-dark dark:text-gray-50
                          hover:bg-white dark:hover:bg-white/20
                          active:scale-95
                          transition-all"
                type="button"
              >
                {num}
              </button>
            ))}

            {/* Bottom row: Backspace, 0, Done */}
            <button
              onClick={handleBackspace}
              className="h-16 rounded-xl
                        bg-white/60 dark:bg-white/10
                        border border-gray-300/50 dark:border-white/10
                        hover:bg-white dark:hover:bg-white/20
                        active:scale-95
                        transition-all
                        flex items-center justify-center"
              aria-label="Backspace"
              type="button"
            >
              <Delete size={24} className="text-primary-dark dark:text-gray-50" />
            </button>

            <button
              onClick={() => handleNumberPress('0')}
              className="h-16 rounded-xl
                        bg-white/60 dark:bg-white/10
                        border border-gray-300/50 dark:border-white/10
                        text-2xl font-lato font-bold
                        text-primary-dark dark:text-gray-50
                        hover:bg-white dark:hover:bg-white/20
                        active:scale-95
                        transition-all"
              type="button"
            >
              0
            </button>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="h-16 rounded-xl
                        bg-primary dark:bg-primary-light
                        text-white dark:text-slate-900
                        text-xl font-lato font-bold
                        hover:brightness-110
                        active:scale-95
                        transition-all"
              type="button"
            >
              Done
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

NumberPadSheet.displayName = 'NumberPadSheet';

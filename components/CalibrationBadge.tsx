import React from 'react';

interface CalibrationBadgeProps {
  show: boolean;
  className?: string;
}

/**
 * Badge to indicate an exercise has been calibrated by the user
 *
 * Displays a small, subtle indicator with an icon and optional text.
 * Includes a tooltip explaining the customization.
 */
export const CalibrationBadge: React.FC<CalibrationBadgeProps> = ({
  show,
  className = ''
}) => {
  if (!show) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full ${className}`}
      title="You've customized this exercise's muscle engagement"
    >
      <span className="material-symbols-outlined text-sm">settings</span>
      <span>Calibrated</span>
    </span>
  );
};

export default CalibrationBadge;

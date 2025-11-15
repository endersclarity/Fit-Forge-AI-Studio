import React from 'react';
import DesignSystemProgressBar, {
  type ProgressBarProps as DesignSystemProgressBarProps,
} from '@/src/design-system/components/primitives/ProgressBar';

export interface ProgressBarProps
  extends Omit<DesignSystemProgressBarProps, 'size'> {
  /**
   * Legacy prop retained for compatibility; maps to design-system `size`.
   */
  height?: 'sm' | 'md' | 'lg';
  /**
   * Legacy toggle (design-system ProgressBar is always animated).
   */
  animated?: boolean;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ height = 'md', animated: _animated = true, ...props }, ref) => (
    <DesignSystemProgressBar
      ref={ref}
      size={height}
      {...props}
    />
  )
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

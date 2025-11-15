import React from 'react';
import DesignSystemButton, {
  type ButtonProps as DesignSystemButtonProps,
} from '@/src/design-system/components/primitives/Button';

export interface ButtonProps
  extends Omit<DesignSystemButtonProps, 'size' | 'children'> {
  /**
   * Retains legacy size API while mapping to design-system sizing.
   * `xl` maps to the design-system `lg` button to preserve layout.
   */
  size?: DesignSystemButtonProps['size'] | 'xl';
  children: React.ReactNode;
}

const sizeMap: Record<NonNullable<ButtonProps['size']>, DesignSystemButtonProps['size']> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size = 'md', ...props }, ref) => {
    const mappedSize = sizeMap[size] ?? 'md';

    return (
      <DesignSystemButton
        ref={ref}
        size={mappedSize}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;

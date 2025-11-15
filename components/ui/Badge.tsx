import React from 'react';
import DesignSystemBadge, {
  type BadgeProps as DesignSystemBadgeProps,
} from '@/src/design-system/components/primitives/Badge';

export interface BadgeProps
  extends Omit<DesignSystemBadgeProps, 'variant' | 'children'> {
  variant: Exclude<DesignSystemBadgeProps['variant'], undefined | 'primary'>;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, ...props }, ref) => (
    <DesignSystemBadge
      ref={ref}
      variant={variant}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';

export default Badge;

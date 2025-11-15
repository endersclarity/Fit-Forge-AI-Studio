import React from 'react';
import DesignSystemCard, {
  type CardProps as DesignSystemCardProps,
} from '@/src/design-system/components/primitives/Card';

export interface CardProps
  extends Omit<DesignSystemCardProps, 'variant' | 'children'> {
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  children: React.ReactNode;
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

const elevationClassMap: Record<NonNullable<CardProps['elevation']>, string> = {
  none: 'shadow-none',
  low: 'shadow-sm',
  medium: 'shadow',
  high: '',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      elevation = 'medium',
      padding = 'md',
      hover = false,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const variant: DesignSystemCardProps['variant'] =
      elevation === 'high' ? 'elevated' : 'default';
    const compatibilityClasses = [
      paddingClasses[padding] ?? paddingClasses.md,
      elevationClassMap[elevation] ?? '',
      hover ? 'transition-transform hover:-translate-y-0.5' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <DesignSystemCard
        ref={ref}
        variant={variant}
        className={compatibilityClasses}
        {...rest}
      >
        {children}
      </DesignSystemCard>
    );
  }
);

Card.displayName = 'Card';

export default Card;

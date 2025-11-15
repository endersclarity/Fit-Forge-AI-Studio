import React from 'react';
import DesignSystemCollapsibleSection, {
  type CollapsibleSectionProps as DesignSystemCollapsibleSectionProps,
} from '@/src/design-system/components/patterns/CollapsibleSection';

export interface CollapsibleSectionProps
  extends Omit<DesignSystemCollapsibleSectionProps, 'title'> {
  title: string;
  count?: number;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  count,
  ...props
}) => {
  const computedTitle =
    typeof count === 'number' ? `${title} (${count})` : title;

  return (
    <DesignSystemCollapsibleSection
      title={computedTitle}
      {...props}
    />
  );
};

export default CollapsibleSection;

import React from 'react';
import DesignSystemFAB, {
  type FABProps as DesignSystemFABProps,
} from '@/src/design-system/components/patterns/FAB';

export type FABProps = DesignSystemFABProps;

export const FAB: React.FC<FABProps> = (props) => <DesignSystemFAB {...props} />;

export default FAB;

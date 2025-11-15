import React from 'react';
import Sheet, {
  type SheetProps,
} from '@/src/design-system/components/primitives/Sheet';

export interface ModalProps
  extends Omit<SheetProps, 'open' | 'onOpenChange' | 'children'> {
  /**
   * Legacy prop name preserved for compatibility.
   */
  isOpen: boolean;
  /**
   * Called whenever the modal requests closing (backdrop click, ESC, Done button).
   */
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  showHandle = false,
  ...sheetProps
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      showHandle={showHandle}
      {...sheetProps}
    >
      {children}
    </Sheet>
  );
};

export default Modal;

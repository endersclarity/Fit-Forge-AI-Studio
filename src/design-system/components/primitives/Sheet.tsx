/**
 * Sheet Component - Primitive UI Element
 *
 * Reusable sheet/drawer component using Vaul library.
 * Implements bottom sheet with configurable heights (40vh, 60vh, 90vh).
 * Provides accessible drawer with proper focus management and keyboard support.
 *
 * Reference: Epic 5 Story 3 - Primitive Components Library
 * Design System: docs/design-system.md
 * Library: Vaul (https://vaul.emilkowalski.dev/)
 */

import React, { useCallback } from 'react';
import { Drawer } from 'vaul';

export interface SheetProps {
  /**
   * Whether the sheet is open
   */
  open: boolean;

  /**
   * Callback when open state changes
   * Called when user clicks outside, presses Escape, or interacts
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Sheet content
   */
  children: React.ReactNode;

  /**
   * Sheet height preset
   * - sm: 40vh (small - quick info)
   * - md: 60vh (medium - default, forms)
   * - lg: 90vh (large - full screen equivalent)
   */
  height?: 'sm' | 'md' | 'lg';

  /**
   * Sheet title (for accessibility)
   */
  title?: string;

  /**
   * Sheet description (for accessibility)
   */
  description?: string;

  /**
   * Additional CSS classes for the content area
   */
  className?: string;

  /**
   * Whether to show the draggable handle
   */
  showHandle?: boolean;
}

/**
 * Height mapping for viewport-based sizing
 */
const heightMap = {
  sm: '40vh',
  md: '60vh',
  lg: '90vh',
};

/**
 * Sheet Component
 *
 * Creates a bottom sheet/drawer with smooth animations and proper accessibility.
 * Built on Vaul for best-in-class drawer experience.
 *
 * @param open - Whether sheet is open
 * @param onOpenChange - Callback when open state changes
 * @param children - Sheet content
 * @param height - Sheet height (sm, md, lg)
 * @param title - Sheet title for accessibility
 * @param description - Sheet description for accessibility
 * @param className - Additional CSS classes
 * @param showHandle - Show draggable handle
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Sheet open={open} onOpenChange={setOpen} height="md" title="Select Exercise">
 *   <div className="p-4">
 *     <h2>Sheet Content</h2>
 *     <p>Your content here</p>
 *   </div>
 * </Sheet>
 * ```
 */
const Sheet: React.FC<SheetProps> = ({
  open,
  onOpenChange,
  children,
  height = 'md',
  title,
  description,
  className,
  showHandle = true,
}) => {
  const heightValue = heightMap[height];

  // Handle close with proper state management
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => onOpenChange(false)}
        />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex flex-col bg-white/50 backdrop-blur-sm rounded-t-[24px] border-t border-gray-300/50"
          style={{
            height: heightValue,
            maxHeight: heightValue,
            borderTopColor: 'rgba(255, 255, 255, 0.5)' // AC#2: white/50 top border highlight for depth
          }}
          aria-labelledby={title ? 'sheet-title' : undefined}
          aria-describedby={description ? 'sheet-description' : undefined}
        >
          {/* Draggable Handle - AC#1: 48×6px pale blue (#A8B6D5) */}
          {showHandle && (
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: '#A8B6D5' }} />
            </div>
          )}

          {/* Sheet Header */}
          {(title || description) && (
            <div className="flex-shrink-0 border-b border-gray-200/50 px-6 py-4">
              {title && (
                <h2 id="sheet-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id="sheet-description" className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Sheet Content */}
          <div className={`flex-1 overflow-y-auto px-6 py-4 ${className || ''}`}>
            {children}
          </div>

          {/* Close affordance at bottom */}
          <div className="flex-shrink-0 border-t border-gray-200/50 px-6 py-3">
            <button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-lg bg-gray-100/50 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Close sheet"
            >
              Done
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

Sheet.displayName = 'Sheet';

export default Sheet;

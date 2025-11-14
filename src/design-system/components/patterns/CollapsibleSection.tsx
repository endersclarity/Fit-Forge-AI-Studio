/**
 * CollapsibleSection Component - Design System Pattern
 *
 * Accordion-style content section that expands/collapses to save screen space.
 * Supports animated expand/collapse, keyboard navigation, and accessibility.
 *
 * Reference: Epic 6.5 Story 2 - Design System Patterns & Core Pages
 * Design System: docs/design-system.md
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface CollapsibleSectionProps {
  /**
   * Section title displayed in the header
   */
  title: string;

  /**
   * Whether the section is expanded by default
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Callback when toggle state changes
   */
  onToggle?: (isOpen: boolean) => void;

  /**
   * Section content (shown when expanded)
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes (merged with defaults)
   */
  className?: string;

  /**
   * Whether the component is controlled (external state)
   * When true, provide `isOpen` and `onToggle`
   */
  isOpen?: boolean;
}

/**
 * CollapsibleSection Component
 *
 * Accordion-style section with animated expand/collapse.
 *
 * **Specifications:**
 * - Header touch target: 60×60px minimum (WCAG 2.1)
 * - Chevron rotation: 0° (collapsed) ’ 180° (expanded)
 * - Animation: Framer Motion height transition (spring physics)
 * - Keyboard: Enter/Space to toggle
 * - Accessibility: ARIA expanded attribute, button role
 *
 * @param title - Section header title
 * @param defaultOpen - Initial expanded state (uncontrolled)
 * @param isOpen - Current expanded state (controlled)
 * @param onToggle - Toggle callback
 * @param children - Section content
 * @param className - Additional classes
 *
 * @example
 * ```tsx
 * // Uncontrolled mode
 * <CollapsibleSection title="Advanced Settings" defaultOpen={false}>
 *   <p>Content here</p>
 * </CollapsibleSection>
 *
 * // Controlled mode
 * <CollapsibleSection
 *   title="Filters"
 *   isOpen={isOpen}
 *   onToggle={setIsOpen}
 * >
 *   <p>Content here</p>
 * </CollapsibleSection>
 * ```
 */
const CollapsibleSection = React.forwardRef<HTMLDivElement, CollapsibleSectionProps>(
  (
    {
      title,
      defaultOpen = false,
      isOpen: controlledIsOpen,
      onToggle,
      children,
      className = '',
    },
    ref
  ) => {
    // Uncontrolled state
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(defaultOpen);

    // Use controlled state if provided, otherwise use uncontrolled
    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

    const handleToggle = () => {
      const newState = !isOpen;

      if (!isControlled) {
        setUncontrolledIsOpen(newState);
      }

      onToggle?.(newState);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      // Toggle on Enter or Space
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    };

    return (
      <div
        ref={ref}
        className={`border border-gray-300/50 rounded-lg bg-white/50 backdrop-blur-sm overflow-hidden ${className}`}
      >
        {/* Header (always visible) */}
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title}`}
          className="w-full flex items-center justify-between px-4 py-4 min-h-[60px] text-left transition-colors hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
        >
          <span className="font-body font-semibold text-primary-dark text-base">
            {title}
          </span>

          {/* Chevron icon with rotation animation */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="flex-shrink-0 text-primary"
          >
            <ChevronDown size={24} aria-hidden="true" />
          </motion.div>
        </button>

        {/* Content (animated expand/collapse) */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: 'auto',
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                opacity: { duration: 0.2 },
              }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-4 pb-4 pt-2 font-body text-primary-medium">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

CollapsibleSection.displayName = 'CollapsibleSection';

export default CollapsibleSection;

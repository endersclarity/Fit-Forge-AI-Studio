/**
 * FAB (Floating Action Button) Component - Design System Pattern
 *
 * Reusable floating action button for primary actions.
 * 64x64px button positioned bottom-right with spring animation entrance.
 * Implements touch-friendly thumb zone positioning and haptic feedback.
 *
 * Reference: Epic 6 Story 5 - FAB Patterns and Modal Standardization
 * Design System: docs/design-system.md
 * Architecture: docs/architecture-ui-redesign-2025-11-12.md
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface FABProps {
  /**
   * Material Symbol icon name
   * @example "add", "edit", "fitness_center"
   */
  icon: string;

  /**
   * Accessibility label describing the action
   * @example "Add exercise", "Quick workout"
   */
  label: string;

  /**
   * Click handler for the FAB action
   */
  onClick: () => void;

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;

  /**
   * Additional CSS classes (merged with defaults)
   */
  className?: string;
}

/**
 * FAB Component
 *
 * Floating action button with spring animation entrance, positioned in thumb-friendly
 * zone (bottom-right). Uses primary color with shadow for depth perception.
 *
 * **Specifications:**
 * - Size: 64×64px (AC1)
 * - Shadow: 0 4px 16px rgba(117,138,198,0.4) (AC2)
 * - Animation: Spring physics entrance (AC3)
 * - Position: Fixed bottom-6 right-6 (thumb zone)
 * - States: Hover (scale 1.05), Active (scale 0.95)
 *
 * @param icon - Material Symbol name
 * @param label - ARIA label
 * @param onClick - Click handler
 * @param disabled - Disabled state
 * @param className - Additional classes
 *
 * @example
 * ```tsx
 * <FAB
 *   icon="add"
 *   label="Add new workout"
 *   onClick={() => console.log('FAB clicked')}
 * />
 * ```
 */
const FAB: React.FC<FABProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // AC1: Base classes - 64x64px, primary color, bottom-right position
  const baseClasses = 'fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed z-50 flex items-center justify-center';

  // AC2: Custom shadow - 0 4px 16px rgba(117,138,198,0.4)
  const customShadow = {
    boxShadow: '0 4px 16px rgba(117, 138, 198, 0.4)',
  };

  // AC3: Spring animation variants
  const springVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <motion.button
      className={`${baseClasses} ${className}`}
      style={customShadow}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      initial="hidden"
      animate={mounted ? 'visible' : 'hidden'}
      whileHover={!disabled ? 'hover' : undefined}
      whileTap={!disabled ? 'tap' : undefined}
      variants={springVariants}
    >
      {/* Icon - 28px Material Icon */}
      <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
        {icon}
      </span>
    </motion.button>
  );
};

FAB.displayName = 'FAB';

export default FAB;

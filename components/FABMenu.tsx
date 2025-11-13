import React, { useRef, useEffect } from 'react';

interface FABMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogWorkout: () => void;
  onBuildWorkout: () => void;
  onLoadTemplate: () => void;
}

/**
 * FABMenu - Floating Action Button Menu
 *
 * Converted from modal to floating button menu (Story 6.2 AC1)
 * - Main FAB button fixed at bottom-right
 * - Menu overlay appears above FAB (not as modal)
 * - No backdrop overlay - not a modal layer
 */
const FABMenu: React.FC<FABMenuProps> = ({
  isOpen,
  onClose,
  onLogWorkout,
  onBuildWorkout,
  onLoadTemplate,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close menu on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose(); // Close menu after selection
  };

  return (
    <div className="fixed bottom-6 right-6 z-30" ref={menuRef}>
      {/* Floating Action Button */}
      <button
        onClick={isOpen ? onClose : () => {}}
        className="w-14 h-14 rounded-full bg-primary text-white font-bold text-2xl shadow-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center"
        aria-label="Quick Actions Menu"
        aria-expanded={isOpen}
      >
        {isOpen ? '×' : '+'}
      </button>

      {/* Menu Overlay - appears above FAB when open */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-72 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-300/50 overflow-hidden animate-scale-in">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Quick Actions</h3>

            <div className="space-y-2">
              <button
                onClick={() => handleAction(onLogWorkout)}
                className="w-full bg-gray-100/50 text-gray-900 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200/50 transition-colors text-left flex items-center gap-3"
              >
                <span className="text-2xl">📝</span>
                <div>
                  <div className="font-bold">Log Workout</div>
                  <div className="text-sm text-gray-600">Record a completed workout</div>
                </div>
              </button>

              <button
                onClick={() => handleAction(onBuildWorkout)}
                className="w-full bg-primary/20 text-gray-900 font-semibold py-3 px-4 rounded-lg hover:bg-primary/30 transition-colors text-left flex items-center gap-3"
              >
                <span className="text-2xl">🏗️</span>
                <div>
                  <div className="font-bold">Build Workout</div>
                  <div className="text-sm text-gray-600">Plan and execute with timers</div>
                </div>
              </button>

              <button
                onClick={() => handleAction(onLoadTemplate)}
                className="w-full bg-gray-100/50 text-gray-900 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200/50 transition-colors text-left flex items-center gap-3"
              >
                <span className="text-2xl">📋</span>
                <div>
                  <div className="font-bold">Load Template</div>
                  <div className="text-sm text-gray-600">Use a saved workout plan</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
          transform-origin: bottom right;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default FABMenu;

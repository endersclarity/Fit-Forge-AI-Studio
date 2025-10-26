import React, { useState } from 'react';

export interface CollapsibleSectionProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  count,
  defaultOpen = false,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`${className}`}>
      <summary
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-between cursor-pointer py-3 px-2 rounded-lg hover:bg-white/5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title} section`}
      >
        <span className="text-lg font-bold text-white">
          {title} {count !== undefined && `(${count})`}
        </span>
        <span
          className={`material-symbols-outlined text-white transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          expand_more
        </span>
      </summary>

      {/* Animated content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{
          transitionProperty: 'max-height, opacity',
        }}
      >
        <div className={`mt-3 space-y-2 ${isOpen ? 'animate-sweep' : ''}`}>
          {children}
        </div>
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes sweep {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-sweep {
          animation: sweep 500ms ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-sweep {
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CollapsibleSection;

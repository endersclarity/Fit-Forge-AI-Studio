import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-brand-muted rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-brand-surface hover:bg-opacity-80 transition-colors"
        aria-expanded={isExpanded}
      >
        <span className="font-medium">{title}</span>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-slate-400" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-3 bg-brand-dark">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;

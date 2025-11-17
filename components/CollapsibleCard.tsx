import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

interface CollapsibleCardProps {
  title: string;
  icon?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  icon,
  defaultExpanded = false,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-brand-dark dark:focus:ring-offset-dark-bg-primary rounded-lg hover:bg-brand-muted dark:hover:bg-dark-bg-tertiary transition-colors"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2 dark:text-dark-text-primary">
            {icon && <span>{icon}</span>}
            <span>{title}</span>
          </h3>
          <div className="transition-transform duration-200">
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-slate-400 dark:text-dark-text-muted" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-slate-400 dark:text-dark-text-muted" />
            )}
          </div>
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleCard;

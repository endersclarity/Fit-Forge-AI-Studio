import React from 'react';

export interface TopNavProps {
  onSettingsClick: () => void;
  className?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  onSettingsClick,
  className = '',
}) => {
  return (
    <header
      className={`sticky top-0 z-10 bg-background-dark/95 backdrop-blur-sm border-b border-white/10 ${className}`}
      role="banner"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and title */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-cyan text-2xl" aria-hidden="true">
            fitness_center
          </span>
          <h1 className="text-white text-xl font-bold">Recovery Dashboard</h1>
        </div>

        {/* Settings button */}
        <button
          onClick={onSettingsClick}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            settings
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;

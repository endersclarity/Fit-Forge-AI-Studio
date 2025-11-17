import React from 'react';
import { useTheme } from '../../src/providers/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
}

/**
 * ThemeToggle
 *
 * Sun/moon icon toggle button for switching between light and dark modes.
 * Uses localStorage for persistence and respects OS preferences on first load.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg
        bg-slate-100/50 dark:bg-dark-bg-tertiary/50
        hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary
        border border-slate-700/30 dark:border-dark-border
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-brand-cyan/50
        group
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun Icon */}
      <svg
        className={`
          w-5 h-5 absolute inset-0 m-auto
          transition-all duration-300 ease-in-out
          ${isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}
          text-amber-500
        `}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon Icon */}
      <svg
        className={`
          w-5 h-5
          transition-all duration-300 ease-in-out
          ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}
          text-brand-cyan dark:text-dark-accent-primary
        `}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  );
};

export default ThemeToggle;

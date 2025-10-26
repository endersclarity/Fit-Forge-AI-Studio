import React from 'react';

export type NavRoute = 'dashboard' | 'workout' | 'history' | 'exercises' | 'settings';

export interface NavItem {
  id: NavRoute;
  label: string;
  icon: string;
}

export interface BottomNavProps {
  activeRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  className?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'workout', label: 'Workout', icon: 'fitness_center' },
  { id: 'history', label: 'History', icon: 'bar_chart' },
  { id: 'exercises', label: 'Exercises', icon: 'menu_book' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeRoute,
  onNavigate,
  className = '',
}) => {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-card-background border-t border-white/10 ${className}`}
      role="navigation"
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-300 min-w-[64px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

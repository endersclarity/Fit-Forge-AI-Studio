import React from 'react';
import { ExerciseCategory } from '../types';

interface CategoryTabsProps {
  categories: { label: string; value: ExerciseCategory | null; count: number }[];
  activeCategory: ExerciseCategory | null;
  onCategoryChange: (category: ExerciseCategory | null) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map(({ label, value, count }) => {
        const isActive = activeCategory === value;
        return (
          <button
            key={label}
            onClick={() => onCategoryChange(value)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-brand-cyan text-brand-dark'
                : 'bg-brand-surface text-slate-300 hover:bg-brand-muted'
            }`}
          >
            {label} ({count})
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;

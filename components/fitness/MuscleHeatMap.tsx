import React from 'react';
import { MuscleCard } from './MuscleCard';
import { CollapsibleSection } from '../layout/CollapsibleSection';

export type MuscleCategory = 'PUSH' | 'PULL' | 'LEGS' | 'CORE';

export interface MuscleState {
  name: string;
  category: MuscleCategory;
  fatiguePercent: number;
  lastTrained: Date | null;
  recoveredAt: Date | null;
}

export interface MuscleHeatMapProps {
  muscles: MuscleState[];
  onMuscleClick?: (muscleName: string) => void;
  className?: string;
}

// Category definitions
const categoryOrder: MuscleCategory[] = ['PUSH', 'PULL', 'LEGS', 'CORE'];

export const MuscleHeatMap: React.FC<MuscleHeatMapProps> = ({
  muscles,
  onMuscleClick,
  className = '',
}) => {
  // Group muscles by category
  const musclesByCategory = muscles.reduce((acc, muscle) => {
    if (!acc[muscle.category]) {
      acc[muscle.category] = [];
    }
    acc[muscle.category].push(muscle);
    return acc;
  }, {} as Record<MuscleCategory, MuscleState[]>);

  return (
    <div className={`space-y-4 ${className}`}>
      {categoryOrder.map((category) => {
        const categoryMuscles = musclesByCategory[category] || [];
        if (categoryMuscles.length === 0) return null;

        return (
          <CollapsibleSection
            key={category}
            title={category}
            count={categoryMuscles.length}
            defaultOpen={category === 'PUSH'} // First section open by default
          >
            {categoryMuscles.map((muscle) => (
              <MuscleCard
                key={muscle.name}
                muscleName={muscle.name}
                fatiguePercent={muscle.fatiguePercent}
                lastTrained={muscle.lastTrained}
                recoveredAt={muscle.recoveredAt}
                onClick={onMuscleClick ? () => onMuscleClick(muscle.name) : undefined}
              />
            ))}
          </CollapsibleSection>
        );
      })}
    </div>
  );
};

export default MuscleHeatMap;

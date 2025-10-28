import React, { useMemo, useState } from 'react';
import Model, { IExerciseData, IMuscleStats, MuscleType } from 'react-body-highlighter';
import { MuscleStatesResponse, Muscle } from '../types';

/**
 * Map FitForge muscle names to react-body-highlighter muscle IDs
 */
const MUSCLE_NAME_MAP: Record<Muscle, string[]> = {
  'Pectoralis': [MuscleType.CHEST],
  'Latissimus Dorsi': [MuscleType.UPPER_BACK, MuscleType.LOWER_BACK],
  'Trapezius': [MuscleType.TRAPEZIUS],
  'Rhomboids': [MuscleType.UPPER_BACK],
  'Deltoids': [MuscleType.FRONT_DELTOIDS, MuscleType.BACK_DELTOIDS],
  'Triceps': [MuscleType.TRICEPS],
  'Biceps': [MuscleType.BICEPS],
  'Forearms': [MuscleType.FOREARM],
  'Core': [MuscleType.ABS, MuscleType.OBLIQUES],
  'Quadriceps': [MuscleType.QUADRICEPS],
  'Hamstrings': [MuscleType.HAMSTRING],
  'Glutes': [MuscleType.GLUTEAL],
  'Calves': [MuscleType.CALVES]
};

/**
 * Reverse map from react-body-highlighter muscle ID to FitForge muscle name
 */
const REVERSE_MUSCLE_MAP: Record<string, Muscle> = Object.entries(MUSCLE_NAME_MAP).reduce((acc, [muscleName, ids]) => {
  ids.forEach(id => {
    acc[id] = muscleName as Muscle;
  });
  return acc;
}, {} as Record<string, Muscle>);

interface MuscleVisualizationProps {
  muscleStates: MuscleStatesResponse;
  type?: 'anterior' | 'posterior';
  selectedMuscles?: Set<Muscle>;
  onMuscleClick?: (muscle: Muscle) => void;
  onMuscleHover?: (muscle: Muscle | null) => void;
  showCalibrationIndicators?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  tabIndex?: number;
}

/**
 * Get color based on fatigue percentage
 * Green (0-33%) -> Yellow (33-66%) -> Red (66-100%)
 */
function getFatigueColor(fatiguePercent: number): string {
  if (fatiguePercent < 33) {
    // Green spectrum - lighter green to darker green
    const ratio = fatiguePercent / 33;
    return interpolateColor('#6bcf7f', '#4caf50', ratio);
  } else if (fatiguePercent < 66) {
    // Yellow spectrum - green-yellow to orange-yellow
    const ratio = (fatiguePercent - 33) / 33;
    return interpolateColor('#fdd835', '#ffb74d', ratio);
  } else {
    // Red spectrum - orange-red to deep red
    const ratio = (fatiguePercent - 66) / 34;
    return interpolateColor('#ff6b6b', '#d32f2f', ratio);
  }
}

/**
 * Linear interpolation between two hex colors
 */
function interpolateColor(color1: string, color2: string, ratio: number): string {
  const hex = (color: string) => {
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    return { r, g, b };
  };

  const c1 = hex(color1);
  const c2 = hex(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Convert muscle states to exercise data format for react-body-highlighter
 */
function convertToExerciseData(muscleStates: MuscleStatesResponse): { data: IExerciseData[], colors: string[] } {
  const exerciseData: IExerciseData[] = [];

  // Pre-build complete color array for fatigue percentages 0-100
  // react-body-highlighter uses colors[frequency-1] to get the color
  // So colors[i] should be the color for (i+1)% fatigue
  const colors: string[] = [];
  for (let i = 0; i <= 100; i++) {
    colors.push(getFatigueColor(i));
  }

  // Create exercise data for each muscle with its fatigue level as frequency
  Object.entries(muscleStates).forEach(([muscleName, state]) => {
    const muscleIds = MUSCLE_NAME_MAP[muscleName as Muscle];
    if (!muscleIds) return;

    const fatiguePercent = state.currentFatiguePercent;
    const frequency = Math.ceil(fatiguePercent); // Use fatigue percent as frequency

    exerciseData.push({
      name: muscleName,
      muscles: muscleIds as any[],
      frequency: frequency
    });
  });

  return { data: exerciseData, colors };
}

export const MuscleVisualization: React.FC<MuscleVisualizationProps> = ({
  muscleStates,
  type = 'anterior',
  selectedMuscles = new Set<Muscle>(),
  onMuscleClick,
  onMuscleHover,
  showCalibrationIndicators = false,
  className = '',
  style = {},
  ariaLabel,
  tabIndex
}) => {
  const [hoveredMuscle, setHoveredMuscle] = useState<{ name: Muscle; fatigue: number } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const { data, colors } = useMemo(() => convertToExerciseData(muscleStates), [muscleStates]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleClick = (stats: IMuscleStats) => {
    // Find the FitForge muscle name from the clicked muscle ID
    const muscleName = REVERSE_MUSCLE_MAP[stats.muscle];
    if (muscleName && onMuscleClick) {
      onMuscleClick(muscleName);
    }
  };

  return (
    <div
      className={`relative ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredMuscle(null)}
    >
      <div className="muscle-viz-container">
        <Model
          data={data}
          highlightedColors={colors}
          type={type}
          onClick={handleClick}
          style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto'
          }}
          bodyColor="#2d3748"
        />
      </div>

      {/* Hover Tooltip */}
      {hoveredMuscle && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${mousePosition.x + 15}px`,
            top: `${mousePosition.y + 15}px`,
            transform: 'translate(0, -50%)'
          }}
        >
          <div className="bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl border border-slate-600">
            <div className="font-semibold text-sm">{hoveredMuscle.name}</div>
            <div className="text-xs text-slate-300 mt-1">
              {hoveredMuscle.fatigue.toFixed(1)}% fatigue
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {hoveredMuscle.fatigue < 33 ? 'Ready to train' :
               hoveredMuscle.fatigue < 66 ? 'Moderate work' :
               'Needs recovery'}
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for hover effects and selection */}
      <style>{`
        .muscle-viz-container svg polygon,
        .muscle-viz-container svg path {
          transition: all 0.3s ease-in-out;
          cursor: pointer;
        }
        .muscle-viz-container svg polygon:hover,
        .muscle-viz-container svg path:hover {
          opacity: 0.85 !important;
          filter: brightness(1.2);
        }

        /* Selection styles - applied via data attribute matching */
        ${Array.from(selectedMuscles).map(muscle => {
          const muscleIds = MUSCLE_NAME_MAP[muscle];
          if (!muscleIds) return '';

          // Generate CSS selectors for selected muscles
          return muscleIds.map(id => `
            .muscle-viz-container svg [data-id="${id}"],
            .muscle-viz-container svg [id*="${id}"] {
              stroke: white !important;
              stroke-width: 3px !important;
              filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) brightness(1.1) !important;
              animation: pulse-glow 2s ease-in-out infinite !important;
            }
          `).join('');
        }).join('')}

        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6)) brightness(1.1);
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.9)) brightness(1.15);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .muscle-viz-container svg polygon,
          .muscle-viz-container svg path {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Dual view component showing both front and back
 */
export const MuscleVisualizationDual: React.FC<Omit<MuscleVisualizationProps, 'type'>> = (props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-center text-sm font-medium text-slate-400 mb-2">Front View</h3>
        <MuscleVisualization
          {...props}
          type="anterior"
        />
      </div>
      <div>
        <h3 className="text-center text-sm font-medium text-slate-400 mb-2">Back View</h3>
        <MuscleVisualization
          {...props}
          type="posterior"
        />
      </div>
    </div>
  );
};

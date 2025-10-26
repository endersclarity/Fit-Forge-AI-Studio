import { useState, useEffect } from 'react';
import { MuscleState } from '../components/fitness';

interface UseMuscleStatesReturn {
  muscles: MuscleState[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMuscleStates(): UseMuscleStatesReturn {
  const [muscles, setMuscles] = useState<MuscleState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchMuscleStates() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/muscle-states');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform API response to MuscleState format
        const transformedMuscles: MuscleState[] = Object.entries(data).map(([name, state]: [string, any]) => ({
          name,
          category: determineMuscleCategory(name),
          fatiguePercent: state.currentFatiguePercent || 0,
          lastTrained: state.lastTrained ? new Date(state.lastTrained) : null,
          recoveredAt: state.daysUntilRecovered <= 0 ? new Date() : null,
        }));

        if (isMounted) {
          setMuscles(transformedMuscles);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch muscle states'));
          setLoading(false);
        }
      }
    }

    fetchMuscleStates();

    return () => {
      isMounted = false;
    };
  }, [refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { muscles, loading, error, refetch };
}

// Helper to determine muscle category
function determineMuscleCategory(muscleName: string): 'PUSH' | 'PULL' | 'LEGS' | 'CORE' {
  const pushMuscles = ['Pectoralis', 'Triceps', 'Deltoids', 'Anterior Deltoids'];
  const pullMuscles = ['Latissimus Dorsi', 'Biceps', 'Rhomboids', 'Trapezius', 'Forearms'];
  const legMuscles = ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'];

  if (pushMuscles.some(m => muscleName.includes(m))) return 'PUSH';
  if (pullMuscles.some(m => muscleName.includes(m))) return 'PULL';
  if (legMuscles.some(m => muscleName.includes(m))) return 'LEGS';
  return 'CORE';
}

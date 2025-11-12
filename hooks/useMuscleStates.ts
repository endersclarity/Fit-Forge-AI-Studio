import { useState, useEffect } from 'react';
import { MuscleState } from '../components/fitness';
import { getRecoveryTimeline } from '../api';

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
    let intervalId: number | null = null;

    async function fetchMuscleStates() {
      try {
        setLoading(true);
        setError(null);

        // Story 3.2: Use new recovery timeline API
        const timelineData = await getRecoveryTimeline();

        // Transform API response to MuscleState format
        const transformedMuscles: MuscleState[] = timelineData.muscles.map((muscle) => ({
          name: muscle.name,
          category: determineMuscleCategory(muscle.name),
          fatiguePercent: muscle.currentFatigue,
          lastTrained: muscle.lastTrained ? new Date(muscle.lastTrained) : null,
          recoveredAt: muscle.currentFatigue <= 0 ? new Date() : null,
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

    // Story 3.2: Auto-refresh every 60 seconds to show recovery progress
    intervalId = window.setInterval(() => {
      if (isMounted) {
        fetchMuscleStates();
      }
    }, 60000);

    return () => {
      isMounted = false;
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { muscles, loading, error, refetch };
}

// Helper to determine muscle category
function determineMuscleCategory(muscleName: string): 'PUSH' | 'PULL' | 'LEGS' | 'CORE' {
  const pushMuscles = ['Pectoralis', 'Triceps', 'Deltoids'];
  const pullMuscles = ['Lats', 'Biceps', 'Rhomboids', 'Trapezius', 'Forearms'];
  const legMuscles = ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'];

  if (pushMuscles.some(m => muscleName.includes(m))) return 'PUSH';
  if (pullMuscles.some(m => muscleName.includes(m))) return 'PULL';
  if (legMuscles.some(m => muscleName.includes(m))) return 'LEGS';
  return 'CORE';
}

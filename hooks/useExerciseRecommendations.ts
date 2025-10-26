import { useState, useEffect } from 'react';
import {
  ExerciseStatus,
  MuscleEngagement,
  LastPerformance,
  ProgressiveOverload,
} from '../components/fitness';

export type MuscleCategory = 'PUSH' | 'PULL' | 'LEGS' | 'CORE' | 'ALL';

export interface ExerciseRecommendation {
  exerciseName: string;
  status: ExerciseStatus;
  muscleEngagements: MuscleEngagement[];
  lastPerformance: LastPerformance;
  progressiveOverload: ProgressiveOverload;
  equipment: string;
  explanation?: string;
  category: MuscleCategory;
}

interface UseExerciseRecommendationsReturn {
  recommendations: ExerciseRecommendation[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useExerciseRecommendations(
  category?: MuscleCategory
): UseExerciseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError(null);

        // Build query string with optional category filter
        const queryParams = new URLSearchParams();
        if (category && category !== 'ALL') {
          queryParams.append('category', category);
        }

        const url = `/api/recommendations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform API response if needed
        // Assuming API returns array of ExerciseRecommendation objects
        const transformedRecommendations: ExerciseRecommendation[] = Array.isArray(data)
          ? data
          : [];

        if (isMounted) {
          setRecommendations(transformedRecommendations);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to fetch exercise recommendations')
          );
          setLoading(false);
        }
      }
    }

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, [category, refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { recommendations, loading, error, refetch };
}

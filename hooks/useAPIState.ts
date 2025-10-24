// Custom hook to replace useLocalStorage with API calls
// Maintains the same interface but uses backend database instead

import { useState, useEffect, useCallback } from 'react';

export function useAPIState<T>(
  fetchFn: () => Promise<T>,
  updateFn: (value: T) => Promise<T>,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean, Error | null] {
  const [state, setState] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load data from API on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchFn();
        if (isMounted) {
          setState(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading data:', err);
          setError(err as Error);
          // Fall back to initial value on error
          setState(initialValue);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update function that saves to API
  const updateState = useCallback(async (value: T | ((prev: T) => T)) => {
    try {
      const newValue = value instanceof Function ? value(state) : value;

      // Optimistically update local state
      setState(newValue);

      // Save to backend
      const savedValue = await updateFn(newValue);

      // Update with server response (in case server modified it)
      setState(savedValue);
      setError(null);
    } catch (err) {
      console.error('Error updating data:', err);
      setError(err as Error);
      // Revert to previous state on error
      throw err;
    }
  }, [state, updateFn]);

  return [state, updateState, loading, error];
}

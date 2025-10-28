import { useState, useEffect, useCallback } from 'react';
import { Muscle } from '../../types';

export interface VisualizationState {
  selectedMuscles: Set<Muscle>;
  viewMode: 'dual' | 'front' | 'back';
  isCollapsed: boolean;
  showCalibrationIndicators: boolean;
}

interface VisualizationPreferences {
  viewMode: 'dual' | 'front' | 'back';
  showCalibrationIndicators: boolean;
  isCollapsed: boolean;
}

const STORAGE_KEY_SELECTION = 'muscle-viz-selection';
const STORAGE_KEY_PREFERENCES = 'muscle-viz-prefs';

const DEFAULT_PREFERENCES: VisualizationPreferences = {
  viewMode: 'dual',
  showCalibrationIndicators: true,
  isCollapsed: false
};

/**
 * Custom hook for managing muscle visualization state
 * Handles selection state, view preferences, and localStorage persistence
 */
export function useMuscleVisualization() {
  // Initialize selected muscles from localStorage
  const [selectedMuscles, setSelectedMuscles] = useState<Set<Muscle>>(() => {
    if (typeof window === 'undefined') return new Set();

    try {
      const saved = localStorage.getItem(STORAGE_KEY_SELECTION);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set<Muscle>(parsed);
      }
    } catch (error) {
      console.error('Failed to load muscle selection from localStorage:', error);
    }
    return new Set();
  });

  // Initialize preferences from localStorage
  const [preferences, setPreferences] = useState<VisualizationPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFERENCES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load muscle visualization preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  });

  // Persist selected muscles to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (selectedMuscles.size > 0) {
        localStorage.setItem(STORAGE_KEY_SELECTION, JSON.stringify(Array.from(selectedMuscles)));
      } else {
        localStorage.removeItem(STORAGE_KEY_SELECTION);
      }
    } catch (error) {
      console.error('Failed to save muscle selection to localStorage:', error);
    }
  }, [selectedMuscles]);

  // Persist preferences to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save muscle visualization preferences:', error);
    }
  }, [preferences]);

  /**
   * Toggle selection of a muscle
   * If muscle is selected, deselects it. If not selected, selects it.
   */
  const toggleMuscle = useCallback((muscle: Muscle) => {
    setSelectedMuscles(prev => {
      const next = new Set(prev);
      if (next.has(muscle)) {
        next.delete(muscle);
      } else {
        next.add(muscle);
      }
      return next;
    });
  }, []);

  /**
   * Select a specific muscle (add to selection without toggling)
   */
  const selectMuscle = useCallback((muscle: Muscle) => {
    setSelectedMuscles(prev => {
      const next = new Set(prev);
      next.add(muscle);
      return next;
    });
  }, []);

  /**
   * Deselect a specific muscle (remove from selection)
   */
  const deselectMuscle = useCallback((muscle: Muscle) => {
    setSelectedMuscles(prev => {
      const next = new Set(prev);
      next.delete(muscle);
      return next;
    });
  }, []);

  /**
   * Clear all selected muscles
   */
  const clearSelection = useCallback(() => {
    setSelectedMuscles(new Set());
  }, []);

  /**
   * Set multiple muscles as selected
   */
  const setMuscles = useCallback((muscles: Muscle[]) => {
    setSelectedMuscles(new Set(muscles));
  }, []);

  /**
   * Update view mode preference
   */
  const setViewMode = useCallback((mode: 'dual' | 'front' | 'back') => {
    setPreferences(prev => ({ ...prev, viewMode: mode }));
  }, []);

  /**
   * Toggle collapsed state
   */
  const toggleCollapsed = useCallback(() => {
    setPreferences(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  }, []);

  /**
   * Toggle calibration indicators visibility
   */
  const toggleCalibrationIndicators = useCallback(() => {
    setPreferences(prev => ({ ...prev, showCalibrationIndicators: !prev.showCalibrationIndicators }));
  }, []);

  return {
    // State
    selectedMuscles,
    viewMode: preferences.viewMode,
    isCollapsed: preferences.isCollapsed,
    showCalibrationIndicators: preferences.showCalibrationIndicators,

    // Actions
    toggleMuscle,
    selectMuscle,
    deselectMuscle,
    clearSelection,
    setMuscles,
    setViewMode,
    toggleCollapsed,
    toggleCalibrationIndicators
  };
}

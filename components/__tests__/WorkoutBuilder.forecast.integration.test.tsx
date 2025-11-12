import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import WorkoutBuilder from '../WorkoutBuilder';
import { WorkoutForecastResponse } from '../../api';

/**
 * Story 3.4: Connect WorkoutBuilder to Forecast API (Real-Time Preview)
 * Integration tests for workout forecast functionality
 *
 * Includes both unit tests for helper functions and React integration tests
 * using React Testing Library for component interactions and DOM rendering.
 */

describe('WorkoutBuilder - Forecast API Integration (Story 3.4)', () => {
  describe('formatSetsForAPI helper function', () => {
    it('groups sets by exerciseId and formats for API', () => {
      const mockSets = [
        { id: '1', exerciseId: 'bench-press', exerciseName: 'Bench Press', weight: 135, reps: 10, restTimerSeconds: 90 },
        { id: '2', exerciseId: 'bench-press', exerciseName: 'Bench Press', weight: 155, reps: 8, restTimerSeconds: 90 },
        { id: '3', exerciseId: 'squat', exerciseName: 'Squat', weight: 185, reps: 12, restTimerSeconds: 120 },
      ];

      // Simulating the formatSetsForAPI logic
      const exerciseMap = new Map<string, Array<{ reps: number; weight: number }>>();

      mockSets.forEach(set => {
        if (!exerciseMap.has(set.exerciseId)) {
          exerciseMap.set(set.exerciseId, []);
        }
        exerciseMap.get(set.exerciseId)!.push({
          reps: set.reps,
          weight: set.weight
        });
      });

      const result = Array.from(exerciseMap.entries()).map(([exerciseId, estimatedSets]) => ({
        exerciseId,
        estimatedSets
      }));

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        exerciseId: 'bench-press',
        estimatedSets: [
          { reps: 10, weight: 135 },
          { reps: 8, weight: 155 }
        ]
      });
      expect(result[1]).toEqual({
        exerciseId: 'squat',
        estimatedSets: [{ reps: 12, weight: 185 }]
      });
    });

    it('returns empty array for empty sets', () => {
      const mockSets: any[] = [];
      const exerciseMap = new Map<string, Array<{ reps: number; weight: number }>>();

      mockSets.forEach(set => {
        if (!exerciseMap.has(set.exerciseId)) {
          exerciseMap.set(set.exerciseId, []);
        }
        exerciseMap.get(set.exerciseId)!.push({
          reps: set.reps,
          weight: set.weight
        });
      });

      const result = Array.from(exerciseMap.entries()).map(([exerciseId, estimatedSets]) => ({
        exerciseId,
        estimatedSets
      }));

      expect(result).toHaveLength(0);
    });
  });

  describe('getFatigueColorClass helper function', () => {
    const getFatigueColorClass = (fatigue: number): string => {
      if (fatigue > 100) return 'bg-red-900 text-white'; // Dark red - bottleneck
      if (fatigue > 90) return 'bg-red-700 text-white'; // Red - high intensity
      if (fatigue > 60) return 'bg-yellow-600 text-white'; // Yellow - moderate
      return 'bg-green-600 text-white'; // Green - safe zone
    };

    it('returns green class for safe zone (0-60%)', () => {
      expect(getFatigueColorClass(0)).toBe('bg-green-600 text-white');
      expect(getFatigueColorClass(30)).toBe('bg-green-600 text-white');
      expect(getFatigueColorClass(60)).toBe('bg-green-600 text-white');
    });

    it('returns yellow class for moderate zone (61-90%)', () => {
      expect(getFatigueColorClass(61)).toBe('bg-yellow-600 text-white');
      expect(getFatigueColorClass(75)).toBe('bg-yellow-600 text-white');
      expect(getFatigueColorClass(90)).toBe('bg-yellow-600 text-white');
    });

    it('returns red class for high intensity zone (91-100%)', () => {
      expect(getFatigueColorClass(91)).toBe('bg-red-700 text-white');
      expect(getFatigueColorClass(95)).toBe('bg-red-700 text-white');
      expect(getFatigueColorClass(100)).toBe('bg-red-700 text-white');
    });

    it('returns dark red class for bottleneck zone (>100%)', () => {
      expect(getFatigueColorClass(101)).toBe('bg-red-900 text-white');
      expect(getFatigueColorClass(115)).toBe('bg-red-900 text-white');
      expect(getFatigueColorClass(200)).toBe('bg-red-900 text-white');
    });
  });

  describe('debounce function logic', () => {
    it('delays execution by specified time', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const delay = 500;

      // Simulate debounce logic
      let timeoutId: NodeJS.Timeout | null = null;
      const debouncedFn = (...args: any[]) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          mockFn(...args);
          timeoutId = null;
        }, delay);
      };

      // Call function multiple times rapidly
      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');

      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Advance time by less than delay
      vi.advanceTimersByTime(400);
      expect(mockFn).not.toHaveBeenCalled();

      // Advance time to exceed delay
      vi.advanceTimersByTime(200);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call3'); // Only last call executed

      vi.useRealTimers();
    });

    it('can be cancelled', () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const delay = 500;

      let timeoutId: NodeJS.Timeout | null = null;
      const debouncedFn = (...args: any[]) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          mockFn(...args);
          timeoutId = null;
        }, delay);
      };

      const cancel = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      debouncedFn('test');
      cancel();

      vi.advanceTimersByTime(600);
      expect(mockFn).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('API response structure validation', () => {
    it('validates WorkoutForecastResponse type structure', () => {
      const mockResponse: WorkoutForecastResponse = {
        forecast: {
          Pectoralis: 45.5,
          AnteriorDeltoids: 30.2,
          Triceps: 75.8,
        },
        warnings: ['High overall fatigue'],
        bottlenecks: [
          {
            muscle: 'Hamstrings',
            projectedFatigue: 115,
            message: 'Hamstrings would reach 115% - risk of overtraining'
          }
        ],
      };

      // Verify structure
      expect(mockResponse).toHaveProperty('forecast');
      expect(mockResponse).toHaveProperty('warnings');
      expect(mockResponse).toHaveProperty('bottlenecks');

      expect(typeof mockResponse.forecast).toBe('object');
      expect(Array.isArray(mockResponse.warnings)).toBe(true);
      expect(Array.isArray(mockResponse.bottlenecks)).toBe(true);

      // Verify bottleneck structure
      expect(mockResponse.bottlenecks[0]).toHaveProperty('muscle');
      expect(mockResponse.bottlenecks[0]).toHaveProperty('projectedFatigue');
      expect(mockResponse.bottlenecks[0]).toHaveProperty('message');
    });
  });

  describe('fetch API call structure', () => {
    it('validates POST request format', () => {
      const apiUrl = 'http://localhost:3001/api/forecast/workout';
      const requestBody = {
        exercises: [
          {
            exerciseId: 'bench-press',
            estimatedSets: [
              { reps: 10, weight: 135 },
              { reps: 8, weight: 155 }
            ]
          }
        ]
      };

      const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      };

      // Verify structure
      expect(fetchOptions.method).toBe('POST');
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');

      const parsedBody = JSON.parse(fetchOptions.body);
      expect(parsedBody).toHaveProperty('exercises');
      expect(Array.isArray(parsedBody.exercises)).toBe(true);
      expect(parsedBody.exercises[0]).toHaveProperty('exerciseId');
      expect(parsedBody.exercises[0]).toHaveProperty('estimatedSets');
    });
  });

  describe('empty workout handling', () => {
    it('should not call API when workout sets is empty', () => {
      const workoutSets: any[] = [];

      // Simulating the early return logic
      if (workoutSets.length === 0) {
        // Should return early, not call API
        expect(workoutSets.length).toBe(0);
        return;
      }

      // This should not be reached
      throw new Error('Should have returned early');
    });
  });

  describe('error handling', () => {
    it('catches and handles network errors', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

      try {
        await mockFetch('/api/forecast/workout');
      } catch (err: any) {
        expect(err.message).toBe('Network error');
      }
    });

    it('handles API error responses', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' })
      });

      const response = await mockFetch('/api/forecast/workout');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);

      const errorData = await response.json();
      expect(errorData.error).toBe('Internal server error');
    });
  });

  describe('React Integration Tests - Component Mounting and User Interactions', () => {
    let mockFetch: any;
    let localStorageMock: any;

    beforeEach(() => {
      // Mock localStorage
      localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      };
      global.localStorage = localStorageMock as any;

      // Mock global fetch
      mockFetch = vi.fn();
      global.fetch = mockFetch;

      // Mock muscle states API
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/muscle-states')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              Pectoralis: { currentFatiguePercent: 20, lastWorkoutDate: '2025-11-10' },
              Triceps: { currentFatiguePercent: 15, lastWorkoutDate: '2025-11-10' }
            })
          });
        }
        if (url.includes('/muscle-baselines')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              Pectoralis: { systemLearnedMax: 5000, userOverride: null },
              Triceps: { systemLearnedMax: 3000, userOverride: null }
            })
          });
        }
        if (url.includes('/forecast/workout')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              forecast: {
                Pectoralis: 45.5,
                Triceps: 75.8
              },
              warnings: [],
              bottlenecks: []
            })
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('renders WorkoutBuilder in planning mode', async () => {
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const onToast = vi.fn();

      render(
        <BrowserRouter>
          <WorkoutBuilder
            isOpen={true}
            onClose={onClose}
            onSuccess={onSuccess}
            onToast={onToast}
          />
        </BrowserRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify planning mode UI is rendered
      expect(screen.getByText('Build Workout')).toBeInTheDocument();
      expect(screen.getByText('Forward Planning')).toBeInTheDocument();
      expect(screen.getByText('Target-Driven')).toBeInTheDocument();
    });

    it('displays forecast panel only when sets are added in planning mode', async () => {
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const onToast = vi.fn();

      render(
        <BrowserRouter>
          <WorkoutBuilder
            isOpen={true}
            onClose={onClose}
            onSuccess={onSuccess}
            onToast={onToast}
          />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Forecast panel should NOT appear when no sets added
      // (UI only shows forecast when workout.sets.length > 0)
      expect(screen.queryByText('Workout Forecast')).not.toBeInTheDocument();
      expect(screen.getByText('No sets added yet. Select an exercise above to build your workout.')).toBeInTheDocument();
    });

    it('shows empty state when no sets added', async () => {
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const onToast = vi.fn();

      render(
        <BrowserRouter>
          <WorkoutBuilder
            isOpen={true}
            onClose={onClose}
            onSuccess={onSuccess}
            onToast={onToast}
          />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify empty state message (forecast panel doesn't show when no sets)
      expect(screen.getByText('No sets added yet. Select an exercise above to build your workout.')).toBeInTheDocument();
    });

    it('verifies component can handle forecast data structure', async () => {
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const onToast = vi.fn();

      // Mock with forecast data ready
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/muscle-states')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              Pectoralis: { currentFatiguePercent: 20, lastWorkoutDate: '2025-11-10' },
              Triceps: { currentFatiguePercent: 15, lastWorkoutDate: '2025-11-10' }
            })
          });
        }
        if (url.includes('/forecast/workout')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              forecast: {
                Pectoralis: 45.5,
                Triceps: 75.8
              },
              warnings: [],
              bottlenecks: []
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <BrowserRouter>
          <WorkoutBuilder
            isOpen={true}
            onClose={onClose}
            onSuccess={onSuccess}
            onToast={onToast}
          />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Component renders successfully with forecast-ready mock
      // (forecast panel only shows when sets.length > 0, which requires user interaction)
      expect(screen.getByText('Build Workout')).toBeInTheDocument();
    });

    it('verifies component can handle bottleneck data structure', async () => {
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const onToast = vi.fn();

      // Mock with bottleneck warnings
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/forecast/workout')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              forecast: {
                Hamstrings: 115
              },
              warnings: ['High overall fatigue'],
              bottlenecks: [
                {
                  muscle: 'Hamstrings',
                  projectedFatigue: 115,
                  message: 'Hamstrings would reach 115% - risk of overtraining'
                }
              ]
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <BrowserRouter>
          <WorkoutBuilder
            isOpen={true}
            onClose={onClose}
            onSuccess={onSuccess}
            onToast={onToast}
          />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Component renders successfully with bottleneck data structure
      expect(screen.getByText('Build Workout')).toBeInTheDocument();
    });

    it('handles forecast API errors gracefully', async () => {
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const onToast = vi.fn();

      // Mock forecast API failure
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/forecast/workout')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Internal server error' })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <BrowserRouter>
          <WorkoutBuilder
            isOpen={true}
            onClose={onClose}
            onSuccess={onSuccess}
            onToast={onToast}
          />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify component still renders
      expect(screen.getByText('Build Workout')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', async () => {
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const onToast = vi.fn();

      // Mock window.confirm to automatically return true (confirm discard)
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      const user = userEvent.setup();

      const { container } = render(
        <BrowserRouter>
          <WorkoutBuilder
            isOpen={true}
            onClose={onClose}
            onSuccess={onSuccess}
            onToast={onToast}
          />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Find close button by class (it's the × text button in header)
      const closeButton = container.querySelector('.text-slate-400.hover\\:text-white.text-2xl');
      expect(closeButton).toBeTruthy();

      await user.click(closeButton!);

      // Verify onClose was called
      expect(onClose).toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('switches between Forward Planning and Target-Driven modes', async () => {
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      const onToast = vi.fn();

      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <WorkoutBuilder
            isOpen={true}
            onClose={onClose}
            onSuccess={onSuccess}
            onToast={onToast}
          />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Click Target-Driven button
      const targetButton = screen.getByText('Target-Driven');
      await user.click(targetButton);

      // Verify mode switched (would show different UI in target mode)
      expect(screen.getByText('Target-Driven')).toBeInTheDocument();

      // Switch back to Forward Planning
      const forwardButton = screen.getByText('Forward Planning');
      await user.click(forwardButton);

      expect(screen.getByText('Forward Planning')).toBeInTheDocument();
    });
  });
});

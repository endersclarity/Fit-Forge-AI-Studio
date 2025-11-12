/**
 * Integration tests for RecoveryDashboard component
 * Story 3.2: Connect RecoveryDashboard to Recovery Timeline API
 *
 * Tests all acceptance criteria:
 * AC1: Calls GET /api/recovery/timeline on component mount
 * AC2: Displays loading state with skeleton UI
 * AC3: Receives and parses API response structure
 * AC4: Passes data to RecoveryTimelineView component
 * AC5: Color-coded heat map display (handled by MuscleHeatMap)
 * AC6: Auto-refresh with 60-second interval
 * AC7: Cleanup interval on component unmount
 * AC8: Muscle detail view on click
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecoveryDashboard } from '../screens/RecoveryDashboard';

// Mock the hooks
vi.mock('../../hooks/useMuscleStates', () => ({
  useMuscleStates: () => ({
    muscles: [],
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}));

vi.mock('../../hooks/useExerciseRecommendations', () => ({
  useExerciseRecommendations: () => ({
    recommendations: [],
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Mock API responses
const mockRecoveryTimelineResponse = {
  muscles: [
    {
      name: 'Pectoralis',
      currentFatigue: 75,
      projections: {
        '24h': 60,
        '48h': 45,
        '72h': 30
      },
      fullyRecoveredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Biceps',
      currentFatigue: 25,
      projections: {
        '24h': 10,
        '48h': 0,
        '72h': 0
      },
      fullyRecoveredAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Quadriceps',
      currentFatigue: 50,
      projections: {
        '24h': 40,
        '48h': 30,
        '72h': 20
      },
      fullyRecoveredAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

const mockMuscleStatesResponse = {
  Pectoralis: {
    currentFatiguePercent: 75,
    lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    daysElapsed: 1,
    estimatedRecoveryDays: 3,
    daysUntilRecovered: 3,
    recoveryStatus: 'fatigued' as const,
    initialFatiguePercent: 75
  },
  Biceps: {
    currentFatiguePercent: 25,
    lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    daysElapsed: 2,
    estimatedRecoveryDays: 1,
    daysUntilRecovered: 1,
    recoveryStatus: 'ready' as const,
    initialFatiguePercent: 25
  },
  Quadriceps: {
    currentFatiguePercent: 50,
    lastTrained: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    daysElapsed: 1.5,
    estimatedRecoveryDays: 2,
    daysUntilRecovered: 2,
    recoveryStatus: 'recovering' as const,
    initialFatiguePercent: 50
  }
};

const mockExerciseRecommendationsResponse = {
  recommended: [],
  notRecommended: [],
  totalEligible: 0
};

describe('RecoveryDashboard - Story 3.2 Integration', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();

    // Mock fetch API
    fetchMock = vi.fn((url: string) => {
      if (url.includes('/api/recovery/timeline')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRecoveryTimelineResponse)
        });
      }
      if (url.includes('/api/muscle-states')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMuscleStatesResponse)
        });
      }
      if (url.includes('/api/recommendations/exercises')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockExerciseRecommendationsResponse)
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    global.fetch = fetchMock as any;

    // Mock timers for auto-refresh testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // AC1: Test component mounts and calls GET /api/recovery/timeline
  it('AC1: calls GET /api/recovery/timeline on component mount', async () => {
    render(<RecoveryDashboard />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/recovery/timeline')
      );
    }, { timeout: 10000 });
  });

  // AC2: Test loading state with skeleton UI
  it('AC2: displays loading state with skeleton UI during fetch', async () => {
    // Create a delayed promise to keep loading state visible
    let resolvePromise: any;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    fetchMock.mockImplementationOnce(() => delayedPromise);

    render(<RecoveryDashboard />);

    // Check for skeleton UI (multiple skeleton boxes)
    const skeletonElements = screen.getAllByRole('img', { hidden: true });
    expect(skeletonElements.length).toBeGreaterThan(0);

    // Resolve the promise
    resolvePromise({
      ok: true,
      json: () => Promise.resolve(mockRecoveryTimelineResponse)
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });
  });

  // AC3: Test API response parsing and data extraction
  it('AC3: receives and parses API response structure correctly', async () => {
    render(<RecoveryDashboard />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/recovery/timeline')
      );
    });

    // Verify API was called
    expect(fetchMock).toHaveBeenCalledTimes(2); // recovery timeline + muscle states

    // Verify response structure was processed (data should be displayed)
    await waitFor(() => {
      // Check that muscle data is displayed
      expect(screen.getByText(/Muscle Recovery Status/i)).toBeInTheDocument();
    });
  });

  // AC4: Test RecoveryTimelineView integration
  it('AC4: passes muscleStates and onMuscleClick props to RecoveryTimelineView', async () => {
    render(<RecoveryDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Check that RecoveryTimelineView is rendered (it has "Recovery Timeline" heading)
    await waitFor(() => {
      expect(screen.getByText(/Recovery Timeline/i)).toBeInTheDocument();
    });

    // Verify muscle groups are displayed in timeline
    await waitFor(() => {
      // Look for muscle buttons or labels
      expect(screen.getByText('Pectoralis')).toBeInTheDocument();
    });
  });

  // AC5: Color mapping is handled by MuscleHeatMap component (tested separately)
  it('AC5: renders MuscleHeatMap component with muscle data', async () => {
    render(<RecoveryDashboard />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Verify muscle heat map section exists
    await waitFor(() => {
      expect(screen.getByText(/Muscle Recovery Status/i)).toBeInTheDocument();
    });
  });

  // AC6: Test auto-refresh with 60-second interval
  it('AC6: auto-refreshes data every 60 seconds', async () => {
    render(<RecoveryDashboard />);

    // Wait for initial fetch
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    // Clear mock call history
    fetchMock.mockClear();

    // Fast-forward time by 60 seconds
    vi.advanceTimersByTime(60000);

    // Verify fetch was called again
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/recovery/timeline')
      );
    });
  });

  // AC7: Test cleanup on component unmount
  it('AC7: clears interval on component unmount', async () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = render(<RecoveryDashboard />);

    // Wait for component to mount and setup interval
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Unmount component
    unmount();

    // Verify clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });

  // AC8: Test muscle detail view on click
  it('AC8: shows muscle detail modal when muscle is clicked', async () => {
    render(<RecoveryDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Find and click a muscle
    await waitFor(() => {
      const muscleButton = screen.getByText('Pectoralis');
      fireEvent.click(muscleButton);
    });

    // Verify modal is shown with muscle details
    await waitFor(() => {
      // Modal should show muscle name as heading
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Pectoralis')).toBeInTheDocument();
    });

    // Verify modal shows required information (AC 8)
    await waitFor(() => {
      // Current fatigue percentage
      expect(screen.getByText(/75%/)).toBeInTheDocument();

      // Recovery projections (24h/48h/72h)
      expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
      expect(screen.getByText(/48 hours/i)).toBeInTheDocument();
      expect(screen.getByText(/72 hours/i)).toBeInTheDocument();

      // Projection values
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();

      // Last workout date section
      expect(screen.getByText(/Last Trained/i)).toBeInTheDocument();

      // Full recovery estimate
      expect(screen.getByText(/Estimated Full Recovery/i)).toBeInTheDocument();
    });
  });

  // Error Handling: Network error
  it('handles network error gracefully', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    render(<RecoveryDashboard />);

    // Component should handle error without crashing
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Error should be logged (not displayed to prevent test noise)
    // Component should still render
    expect(screen.getByText(/Muscle Recovery Status/i)).toBeInTheDocument();
  });

  // Error Handling: 500 error
  it('handles 500 server error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' })
    });

    render(<RecoveryDashboard />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Component should handle error without crashing
    expect(screen.getByText(/Muscle Recovery Status/i)).toBeInTheDocument();
  });

  // Integration: Close modal
  it('closes muscle detail modal when close button is clicked', async () => {
    render(<RecoveryDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Click muscle to open modal
    await waitFor(() => {
      const muscleButton = screen.getByText('Pectoralis');
      fireEvent.click(muscleButton);
    });

    // Verify modal is open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Find and click close button
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // Edge case: Empty muscles array
  it('handles empty muscles array from API', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ muscles: [] })
    });

    render(<RecoveryDashboard />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Component should handle empty data gracefully
    expect(screen.getByText(/Muscle Recovery Status/i)).toBeInTheDocument();
  });

  // Edge case: Malformed API response
  it('handles malformed API response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invalid: 'data' })
    });

    render(<RecoveryDashboard />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Component should handle malformed data without crashing
    expect(screen.getByText(/Muscle Recovery Status/i)).toBeInTheDocument();
  });
});

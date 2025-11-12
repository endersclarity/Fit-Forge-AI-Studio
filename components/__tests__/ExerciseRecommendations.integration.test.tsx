/**
 * Integration tests for ExerciseRecommendations component (Story 3.3)
 *
 * Tests API integration for exercise recommendations with scoring, tooltips, and warning badges
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExerciseRecommendations from '../ExerciseRecommendations';
import { MuscleStatesResponse, EquipmentItem, Muscle } from '../../types';

// Mock API module
vi.mock('../../api', () => ({
  API_BASE_URL: 'http://localhost:3001/api',
  getUserCalibrations: vi.fn().mockResolvedValue({}),
  getExerciseCalibrations: vi.fn().mockResolvedValue(null)
}));

// Mock constants
vi.mock('../../constants', () => ({
  EXERCISE_LIBRARY: [
    {
      id: 'squat',
      name: 'Barbell Squat',
      equipment: ['barbell', 'rack'],
      category: 'Legs',
      difficulty: 'intermediate',
      muscleEngagements: [
        { muscle: 'Quadriceps', percentage: 50 },
        { muscle: 'Glutes', percentage: 35 },
        { muscle: 'Hamstrings', percentage: 25 },
        { muscle: 'Core', percentage: 15 }
      ]
    },
    {
      id: 'lunge',
      name: 'Lunges',
      equipment: ['bodyweight'],
      category: 'Legs',
      difficulty: 'beginner',
      muscleEngagements: [
        { muscle: 'Quadriceps', percentage: 45 },
        { muscle: 'Glutes', percentage: 40 },
        { muscle: 'Hamstrings', percentage: 20 }
      ]
    },
    {
      id: 'bench-press',
      name: 'Bench Press',
      equipment: ['barbell', 'bench'],
      category: 'Push',
      difficulty: 'intermediate',
      muscleEngagements: [
        { muscle: 'Pectoralis', percentage: 60 },
        { muscle: 'AnteriorDeltoids', percentage: 30 },
        { muscle: 'Triceps', percentage: 25 }
      ]
    }
  ]
}));

describe('ExerciseRecommendations Integration Tests', () => {
  const mockMuscleStates: MuscleStatesResponse = {
    Quadriceps: {
      currentFatiguePercent: 20,
      muscleVolume: 1000,
      lastTrained: '2025-11-11T08:00:00Z',
      recoveredAt: null
    },
    Glutes: {
      currentFatiguePercent: 15,
      muscleVolume: 800,
      lastTrained: '2025-11-11T08:00:00Z',
      recoveredAt: null
    },
    Hamstrings: {
      currentFatiguePercent: 85,
      muscleVolume: 1200,
      lastTrained: '2025-11-11T08:00:00Z',
      recoveredAt: null
    },
    Pectoralis: {
      currentFatiguePercent: 10,
      muscleVolume: 900,
      lastTrained: '2025-11-10T10:00:00Z',
      recoveredAt: null
    },
    AnteriorDeltoids: {
      currentFatiguePercent: 25,
      muscleVolume: 600,
      lastTrained: '2025-11-10T10:00:00Z',
      recoveredAt: null
    },
    Triceps: {
      currentFatiguePercent: 30,
      muscleVolume: 500,
      lastTrained: '2025-11-10T10:00:00Z',
      recoveredAt: null
    },
    Core: {
      currentFatiguePercent: 10,
      muscleVolume: 400,
      lastTrained: '2025-11-11T08:00:00Z',
      recoveredAt: null
    },
    Lats: { currentFatiguePercent: 0, muscleVolume: 0, lastTrained: null, recoveredAt: null },
    PosteriorDeltoids: { currentFatiguePercent: 0, muscleVolume: 0, lastTrained: null, recoveredAt: null },
    Trapezius: { currentFatiguePercent: 0, muscleVolume: 0, lastTrained: null, recoveredAt: null },
    Rhomboids: { currentFatiguePercent: 0, muscleVolume: 0, lastTrained: null, recoveredAt: null },
    LowerBack: { currentFatiguePercent: 0, muscleVolume: 0, lastTrained: null, recoveredAt: null },
    Biceps: { currentFatiguePercent: 0, muscleVolume: 0, lastTrained: null, recoveredAt: null },
    Forearms: { currentFatiguePercent: 0, muscleVolume: 0, lastTrained: null, recoveredAt: null },
    Calves: { currentFatiguePercent: 0, muscleVolume: 0, lastTrained: null, recoveredAt: null }
  };

  const mockEquipment: EquipmentItem[] = [
    { id: 'eq-1', type: 'barbell', weightRange: { min: 45, max: 315 }, quantity: 1, increment: 5 },
    { id: 'eq-2', type: 'dumbbells', weightRange: { min: 5, max: 100 }, quantity: 2, increment: 5 }
  ];

  const mockApiResponse = {
    safe: [
      {
        exercise: { id: 'squat', name: 'Barbell Squat' },
        score: 87.5,
        isSafe: true,
        warnings: [],
        factors: {
          targetMatch: 40,
          freshness: 22.5,
          variety: 15,
          preference: 0,
          primarySecondary: 10,
          total: 87.5
        }
      },
      {
        exercise: { id: 'lunge', name: 'Lunges' },
        score: 78.3,
        isSafe: true,
        warnings: ['Bottleneck: Hamstrings at 85%'],
        factors: {
          targetMatch: 38,
          freshness: 20.3,
          variety: 12,
          preference: 0,
          primarySecondary: 8,
          total: 78.3
        }
      }
    ],
    unsafe: [],
    totalFiltered: 2
  };

  let fetchMock: any;

  beforeEach(() => {
    // Mock fetch API
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call API when selectedMuscles prop is provided (AC 1)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3001/api/recommendations/exercises',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
  });

  it('should send correct request body structure (AC 1)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      const callArgs = fetchMock.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody).toEqual({
        targetMuscle: 'Quadriceps',
        filters: {
          equipment: ['barbell', 'dumbbells'],
          excludeExercises: []
        }
      });
    });
  });

  it('should display loading state while fetching (AC 6)', async () => {
    fetchMock.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    expect(screen.getByText('Loading Recommendations...')).toBeInTheDocument();
    expect(screen.getByText('Analyzing muscle fatigue and exercise options')).toBeInTheDocument();
  });

  it('should display error state on network failure (AC 6)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('⚠️ Error Loading Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should parse and display recommendations with scores (AC 2, 3)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      // Wait for recommendations to be displayed
      expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check second exercise
    expect(screen.getByText('Lunges')).toBeInTheDocument();

    // Check scores are displayed (rounded values)
    const scoreBadges = screen.getAllByText(/^(88|78)$/);
    expect(scoreBadges.length).toBeGreaterThan(0);
  });

  it('should display score badge with correct value (AC 3)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      const scoreBadges = screen.getAllByText(/^\d+$/);
      expect(scoreBadges.length).toBeGreaterThan(0);
      // Verify at least one score badge exists
      expect(scoreBadges[0]).toHaveClass('bg-blue-500');
    });
  });

  it('should display tooltip with all 5 factors on hover (AC 5)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const { container } = render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    });

    // Find score badge and hover over it
    const scoreBadge = container.querySelector('.group');
    expect(scoreBadge).toBeInTheDocument();

    // Check that tooltip content exists in DOM (hidden by CSS)
    const tooltip = container.querySelector('.group-hover\\:block');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Target Match:');
    expect(tooltip).toHaveTextContent('Muscle Freshness:');
    expect(tooltip).toHaveTextContent('Variety:');
    expect(tooltip).toHaveTextContent('User Preference:');
    expect(tooltip).toHaveTextContent('Primary/Secondary:');
  });

  it('should display warning badges for bottleneck risks (AC 4)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('⚠️ Bottleneck: Hamstrings at 85%')).toBeInTheDocument();
    });

    // Verify warning badge styling
    const warningBadge = screen.getByText('⚠️ Bottleneck: Hamstrings at 85%');
    expect(warningBadge).toHaveClass('bg-red-500');
    expect(warningBadge).toHaveClass('text-white');
  });

  it('should call onAddToWorkout when clicking Add to Workout button (AC 6)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const mockOnAddToWorkout = vi.fn();

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={mockOnAddToWorkout}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    });

    // Click "Add to Workout" button
    const addButtons = screen.getAllByText('Add to Workout');
    fireEvent.click(addButtons[0]);

    expect(mockOnAddToWorkout).toHaveBeenCalledTimes(1);
    expect(mockOnAddToWorkout).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'squat',
        name: 'Barbell Squat'
      })
    );
  });

  it('should handle empty results gracefully (AC 6)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ safe: [], unsafe: [], totalFiltered: 0 })
    });

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('🛌 No Exercises Available')).toBeInTheDocument();
      expect(screen.getByText(/No exercises match your criteria/)).toBeInTheDocument();
    });
  });

  it('should show "Select a Muscle" message when no muscles selected', () => {
    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={[]}
        onAddToWorkout={vi.fn()}
      />
    );

    expect(screen.getByText('🎯 Select a Muscle to Get Started')).toBeInTheDocument();
    expect(screen.getByText('Click on a muscle in the body map above to see personalized exercise recommendations.')).toBeInTheDocument();
  });

  it('should filter recommendations by equipment availability (AC 7)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      const callArgs = fetchMock.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      // Verify equipment filter is sent to API
      expect(requestBody.filters.equipment).toEqual(['barbell', 'dumbbells']);
    });
  });

  it('should map score to correct status (excellent, good, suboptimal)', async () => {
    const mixedScoresResponse = {
      safe: [
        {
          exercise: { id: 'squat', name: 'Barbell Squat' },
          score: 85,
          isSafe: true,
          warnings: [],
          factors: { targetMatch: 40, freshness: 25, variety: 12, preference: 8, primarySecondary: 0, total: 85 }
        },
        {
          exercise: { id: 'lunge', name: 'Lunges' },
          score: 65,
          isSafe: true,
          warnings: [],
          factors: { targetMatch: 35, freshness: 18, variety: 8, preference: 4, primarySecondary: 0, total: 65 }
        },
        {
          exercise: { id: 'bench-press', name: 'Bench Press' },
          score: 45,
          isSafe: true,
          warnings: [],
          factors: { targetMatch: 25, freshness: 12, variety: 5, preference: 3, primarySecondary: 0, total: 45 }
        }
      ],
      unsafe: [],
      totalFiltered: 3
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mixedScoresResponse
    });

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      // Wait for at least one exercise to appear
      expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check that exercises are displayed and have their respective scores
    expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    expect(screen.getByText('Lunges')).toBeInTheDocument();

    // Check section headers for excellent and good exercises
    expect(screen.getByText('⭐ Excellent Opportunities')).toBeInTheDocument();
    expect(screen.getByText('✅ Good Options')).toBeInTheDocument();

    // Verify scores are displayed correctly (use getAllByText since scores may appear in multiple places)
    const score85Elements = screen.getAllByText('85');
    const score65Elements = screen.getAllByText('65');
    expect(score85Elements.length).toBeGreaterThan(0);
    expect(score65Elements.length).toBeGreaterThan(0);
  });

  it('should retry API call when clicking Retry button after error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const { rerender } = render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('⚠️ Error Loading Recommendations')).toBeInTheDocument();
    });

    // Mock successful response for retry
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    // Click retry button
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    // Re-render to trigger useEffect
    rerender(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    });
  });

  it('should handle API response with 500 error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error'
    });

    render(
      <ExerciseRecommendations
        muscleStates={mockMuscleStates}
        equipment={mockEquipment}
        selectedMuscles={['Quadriceps']}
        onAddToWorkout={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('⚠️ Error Loading Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch recommendations: Internal Server Error')).toBeInTheDocument();
    });
  });
});

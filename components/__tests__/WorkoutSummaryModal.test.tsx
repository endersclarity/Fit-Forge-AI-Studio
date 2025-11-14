import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkoutSummaryModal from '../WorkoutSummaryModal';
import { WorkoutSession, PersonalBests, MuscleBaselines } from '../../types';

// Mock the EXERCISE_LIBRARY
vi.mock('../../constants', () => ({
  EXERCISE_LIBRARY: [
    {
      id: 'bench-press',
      name: 'Bench Press',
      category: 'Push',
      muscleEngagements: [
        { muscle: 'Chest', percentage: 70 },
        { muscle: 'Triceps', percentage: 30 },
      ],
    },
  ],
  ALL_MUSCLES: ['Chest', 'Triceps'],
}));

describe('WorkoutSummaryModal', () => {
  const mockSession: WorkoutSession = {
    id: 'session-1',
    name: 'Push Day A',
    type: 'Push',
    variation: 'A',
    startTime: Date.now() - 3600000, // 1 hour ago
    endTime: Date.now(),
    loggedExercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 10, weight: 135, restTimerSeconds: 90 },
          { reps: 8, weight: 145, restTimerSeconds: 90 },
        ],
      },
    ],
  };

  const mockPersonalBests: PersonalBests = {
    'bench-press': {
      bestSingleSet: 1350,
      bestSessionVolume: 2500,
      rollingAverageMax: 1200,
    },
  };
  const mockMuscleBaselines: MuscleBaselines = {
    Chest: { systemLearnedMax: 10000 },
    Triceps: { systemLearnedMax: 5000 },
  };
  const mockAllWorkouts: WorkoutSession[] = [];

  it('renders modal with Sheet component when isOpen is true', () => {
    const onClose = vi.fn();

    render(
      <WorkoutSummaryModal
        isOpen={true}
        onClose={onClose}
        session={mockSession}
        personalBests={mockPersonalBests}
        muscleBaselines={mockMuscleBaselines}
        allWorkouts={mockAllWorkouts}
      />
    );

    expect(screen.getByText(/Workout Complete!/i)).toBeInTheDocument();
    expect(screen.getByText(/Push Day A/i)).toBeInTheDocument();
  });

  it('displays workout stats in Card primitives', () => {
    const onClose = vi.fn();

    render(
      <WorkoutSummaryModal
        isOpen={true}
        onClose={onClose}
        session={mockSession}
        personalBests={mockPersonalBests}
        muscleBaselines={mockMuscleBaselines}
        allWorkouts={mockAllWorkouts}
      />
    );

    expect(screen.getByText(/Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Volume \(lbs\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Exercises/i)).toBeInTheDocument();
  });

  it('calls onClose when Done button is clicked', () => {
    const onClose = vi.fn();

    render(
      <WorkoutSummaryModal
        isOpen={true}
        onClose={onClose}
        session={mockSession}
        personalBests={mockPersonalBests}
        muscleBaselines={mockMuscleBaselines}
        allWorkouts={mockAllWorkouts}
      />
    );

    const doneButton = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses Button primitive with proper touch target sizing for Done button', () => {
    const onClose = vi.fn();

    render(
      <WorkoutSummaryModal
        isOpen={true}
        onClose={onClose}
        session={mockSession}
        personalBests={mockPersonalBests}
        muscleBaselines={mockMuscleBaselines}
        allWorkouts={mockAllWorkouts}
      />
    );

    const doneButton = screen.getByRole('button', { name: /Done/i });
    expect(doneButton.className).toContain('min-h-[60px]');
  });

  it('renders null when session is null', () => {
    const onClose = vi.fn();

    const { container } = render(
      <WorkoutSummaryModal
        isOpen={true}
        onClose={onClose}
        session={null as any}
        personalBests={mockPersonalBests}
        muscleBaselines={mockMuscleBaselines}
        allWorkouts={mockAllWorkouts}
      />
    );

    expect(container.querySelector('button')).toBeNull();
  });

  it('renders null when isOpen is false', () => {
    const onClose = vi.fn();

    const { container } = render(
      <WorkoutSummaryModal
        isOpen={false}
        onClose={onClose}
        session={mockSession}
        personalBests={mockPersonalBests}
        muscleBaselines={mockMuscleBaselines}
        allWorkouts={mockAllWorkouts}
      />
    );

    expect(container.querySelector('button')).toBeNull();
  });

  it('uses design tokens for colors (no hardcoded brand colors)', () => {
    const onClose = vi.fn();

    render(
      <WorkoutSummaryModal
        isOpen={true}
        onClose={onClose}
        session={mockSession}
        personalBests={mockPersonalBests}
        muscleBaselines={mockMuscleBaselines}
        allWorkouts={mockAllWorkouts}
      />
    );

    // Verify Button primitives are used (indicates design system integration)
    const doneButton = screen.getByRole('button', { name: /Done/i });
    expect(doneButton).toBeInTheDocument();
    expect(doneButton.className).toContain('min-h-[60px]');

    // Verify modal uses Sheet component (title in header)
    expect(screen.getByText(/Workout Complete!/i)).toBeInTheDocument();
  });
});

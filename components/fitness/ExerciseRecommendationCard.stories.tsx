import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExerciseRecommendationCard } from './ExerciseRecommendationCard';

const meta = {
  title: 'Fitness/ExerciseRecommendationCard',
  component: ExerciseRecommendationCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExerciseRecommendationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Excellent: Story = {
  args: {
    exerciseName: 'Bench Press',
    status: 'EXCELLENT',
    muscleEngagements: [
      { muscle: 'Chest', percent: 70, fatigueLevel: 15 },
      { muscle: 'Triceps', percent: 20, fatigueLevel: 10 },
      { muscle: 'Shoulders', percent: 10, fatigueLevel: 5 },
    ],
    lastPerformance: {
      reps: 10,
      weight: 135,
    },
    progressiveOverload: {
      type: 'weight',
      value: 140,
    },
    equipment: 'Barbell',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Good: Story = {
  args: {
    exerciseName: 'Barbell Row',
    status: 'GOOD',
    muscleEngagements: [
      { muscle: 'Back', percent: 60, fatigueLevel: 45 },
      { muscle: 'Biceps', percent: 30, fatigueLevel: 30 },
      { muscle: 'Forearms', percent: 10, fatigueLevel: 20 },
    ],
    lastPerformance: {
      reps: 8,
      weight: 155,
    },
    progressiveOverload: {
      type: 'reps',
      value: 9,
    },
    equipment: 'Barbell',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Suboptimal: Story = {
  args: {
    exerciseName: 'Leg Press',
    status: 'SUBOPTIMAL',
    muscleEngagements: [
      { muscle: 'Quadriceps', percent: 50, fatigueLevel: 85 },
      { muscle: 'Hamstrings', percent: 30, fatigueLevel: 75 },
      { muscle: 'Glutes', percent: 20, fatigueLevel: 80 },
    ],
    lastPerformance: {
      reps: 12,
      weight: 270,
    },
    progressiveOverload: {
      type: 'weight',
      value: 280,
    },
    equipment: 'Machine',
    explanation: 'Primary muscles still recovering from recent training.',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const HighFatigue: Story = {
  args: {
    exerciseName: 'Deadlift',
    status: 'SUBOPTIMAL',
    muscleEngagements: [
      { muscle: 'Back', percent: 40, fatigueLevel: 90 },
      { muscle: 'Hamstrings', percent: 30, fatigueLevel: 88 },
      { muscle: 'Glutes', percent: 20, fatigueLevel: 85 },
      { muscle: 'Core', percent: 10, fatigueLevel: 70 },
    ],
    lastPerformance: {
      reps: 5,
      weight: 315,
    },
    progressiveOverload: {
      type: 'weight',
      value: 320,
    },
    equipment: 'Barbell',
    explanation: 'Multiple muscle groups still fatigued. Consider lighter work or rest.',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const LowFatigue: Story = {
  args: {
    exerciseName: 'Overhead Press',
    status: 'EXCELLENT',
    muscleEngagements: [
      { muscle: 'Shoulders', percent: 60, fatigueLevel: 10 },
      { muscle: 'Triceps', percent: 25, fatigueLevel: 8 },
      { muscle: 'Core', percent: 15, fatigueLevel: 12 },
    ],
    lastPerformance: {
      reps: 8,
      weight: 95,
    },
    progressiveOverload: {
      type: 'weight',
      value: 100,
    },
    equipment: 'Barbell',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const MixedFatigue: Story = {
  args: {
    exerciseName: 'Dumbbell Curl',
    status: 'GOOD',
    muscleEngagements: [
      { muscle: 'Biceps', percent: 80, fatigueLevel: 42 },
      { muscle: 'Forearms', percent: 20, fatigueLevel: 55 },
    ],
    lastPerformance: {
      reps: 12,
      weight: 30,
    },
    progressiveOverload: {
      type: 'reps',
      value: 13,
    },
    equipment: 'Dumbbells',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Interactive: Story = {
  args: {
    exerciseName: 'Squat',
    status: 'EXCELLENT',
    muscleEngagements: [
      { muscle: 'Quadriceps', percent: 45, fatigueLevel: 18 },
      { muscle: 'Hamstrings', percent: 25, fatigueLevel: 12 },
      { muscle: 'Glutes', percent: 20, fatigueLevel: 15 },
      { muscle: 'Core', percent: 10, fatigueLevel: 20 },
    ],
    lastPerformance: {
      reps: 10,
      weight: 185,
    },
    progressiveOverload: {
      type: 'weight',
      value: 190,
    },
    equipment: 'Barbell',
    onClick: () => console.log('Squat card clicked'),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-96">
      <ExerciseRecommendationCard
        exerciseName="Bench Press"
        status="EXCELLENT"
        muscleEngagements={[
          { muscle: 'Chest', percent: 70, fatigueLevel: 15 },
          { muscle: 'Triceps', percent: 20, fatigueLevel: 10 },
        ]}
        lastPerformance={{ reps: 10, weight: 135 }}
        progressiveOverload={{ type: 'weight', value: 140 }}
        equipment="Barbell"
      />
      <ExerciseRecommendationCard
        exerciseName="Barbell Row"
        status="GOOD"
        muscleEngagements={[
          { muscle: 'Back', percent: 60, fatigueLevel: 45 },
          { muscle: 'Biceps', percent: 30, fatigueLevel: 30 },
        ]}
        lastPerformance={{ reps: 8, weight: 155 }}
        progressiveOverload={{ type: 'reps', value: 9 }}
        equipment="Barbell"
      />
      <ExerciseRecommendationCard
        exerciseName="Leg Press"
        status="SUBOPTIMAL"
        muscleEngagements={[
          { muscle: 'Quadriceps', percent: 50, fatigueLevel: 85 },
          { muscle: 'Hamstrings', percent: 30, fatigueLevel: 75 },
        ]}
        lastPerformance={{ reps: 12, weight: 270 }}
        progressiveOverload={{ type: 'weight', value: 280 }}
        equipment="Machine"
        explanation="Primary muscles still recovering from recent training."
      />
    </div>
  ),
};

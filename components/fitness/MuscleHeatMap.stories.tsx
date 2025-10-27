import type { Meta, StoryObj } from '@storybook/react-vite';
import { MuscleHeatMap } from './MuscleHeatMap';

const meta = {
  title: 'Fitness/MuscleHeatMap',
  component: MuscleHeatMap,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MuscleHeatMap>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMuscles = [
  // PUSH
  { name: 'Chest', category: 'PUSH' as const, fatiguePercent: 15, lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { name: 'Shoulders', category: 'PUSH' as const, fatiguePercent: 42, lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
  { name: 'Triceps', category: 'PUSH' as const, fatiguePercent: 68, lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
  // PULL
  { name: 'Back', category: 'PULL' as const, fatiguePercent: 85, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
  { name: 'Biceps', category: 'PULL' as const, fatiguePercent: 50, lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
  { name: 'Lats', category: 'PULL' as const, fatiguePercent: 72, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
  { name: 'Traps', category: 'PULL' as const, fatiguePercent: 30, lastTrained: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { name: 'Forearms', category: 'PULL' as const, fatiguePercent: 20, lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  // LEGS
  { name: 'Quadriceps', category: 'LEGS' as const, fatiguePercent: 90, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
  { name: 'Hamstrings', category: 'LEGS' as const, fatiguePercent: 88, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
  { name: 'Glutes', category: 'LEGS' as const, fatiguePercent: 82, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
  { name: 'Calves', category: 'LEGS' as const, fatiguePercent: 25, lastTrained: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
  // CORE
  { name: 'Core', category: 'CORE' as const, fatiguePercent: 35, lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recoveredAt: new Date() },
];

export const Default: Story = {
  args: {
    muscles: sampleMuscles,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const WithClickHandler: Story = {
  args: {
    muscles: sampleMuscles,
    onMuscleClick: (muscleName: string) => console.log(`Clicked: ${muscleName}`),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const AllFresh: Story = {
  args: {
    muscles: [
      { name: 'Chest', category: 'PUSH' as const, fatiguePercent: 0, lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { name: 'Shoulders', category: 'PUSH' as const, fatiguePercent: 5, lastTrained: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { name: 'Triceps', category: 'PUSH' as const, fatiguePercent: 8, lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { name: 'Back', category: 'PULL' as const, fatiguePercent: 12, lastTrained: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { name: 'Biceps', category: 'PULL' as const, fatiguePercent: 10, lastTrained: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { name: 'Quadriceps', category: 'LEGS' as const, fatiguePercent: 15, lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { name: 'Hamstrings', category: 'LEGS' as const, fatiguePercent: 18, lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { name: 'Core', category: 'CORE' as const, fatiguePercent: 10, lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const AllFatigued: Story = {
  args: {
    muscles: [
      { name: 'Chest', category: 'PUSH' as const, fatiguePercent: 92, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
      { name: 'Shoulders', category: 'PUSH' as const, fatiguePercent: 88, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { name: 'Triceps', category: 'PUSH' as const, fatiguePercent: 85, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { name: 'Back', category: 'PULL' as const, fatiguePercent: 95, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
      { name: 'Biceps', category: 'PULL' as const, fatiguePercent: 78, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { name: 'Quadriceps', category: 'LEGS' as const, fatiguePercent: 100, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { name: 'Hamstrings', category: 'LEGS' as const, fatiguePercent: 98, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { name: 'Core', category: 'CORE' as const, fatiguePercent: 72, lastTrained: new Date(), recoveredAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const OnlyPushCategory: Story = {
  args: {
    muscles: [
      { name: 'Chest', category: 'PUSH' as const, fatiguePercent: 15, lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { name: 'Shoulders', category: 'PUSH' as const, fatiguePercent: 42, lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
      { name: 'Triceps', category: 'PUSH' as const, fatiguePercent: 68, lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recoveredAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const EmptyMuscles: Story = {
  args: {
    muscles: [],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

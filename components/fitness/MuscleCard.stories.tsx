import type { Meta, StoryObj } from '@storybook/react-vite';
import { MuscleCard } from './MuscleCard';

const meta = {
  title: 'Fitness/MuscleCard',
  component: MuscleCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    fatiguePercent: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof MuscleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fresh: Story = {
  args: {
    muscleName: 'Chest',
    fatiguePercent: 15,
    lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    recoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const Recovering: Story = {
  args: {
    muscleName: 'Back',
    fatiguePercent: 50,
    lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    recoveredAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const NeedsRest: Story = {
  args: {
    muscleName: 'Legs',
    fatiguePercent: 85,
    lastTrained: new Date(), // today
    recoveredAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const NeverTrained: Story = {
  args: {
    muscleName: 'Shoulders',
    fatiguePercent: 0,
    lastTrained: null,
    recoveredAt: null,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const TrainedToday: Story = {
  args: {
    muscleName: 'Triceps',
    fatiguePercent: 92,
    lastTrained: new Date(),
    recoveredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const TrainedYesterday: Story = {
  args: {
    muscleName: 'Biceps',
    fatiguePercent: 68,
    lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    recoveredAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const Interactive: Story = {
  args: {
    muscleName: 'Quadriceps',
    fatiguePercent: 42,
    lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    recoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    onClick: () => console.log('Quadriceps card clicked'),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const AllFatigueLevels: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <MuscleCard
        muscleName="Chest (0%)"
        fatiguePercent={0}
        lastTrained={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        recoveredAt={new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)}
      />
      <MuscleCard
        muscleName="Shoulders (25%)"
        fatiguePercent={25}
        lastTrained={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)}
        recoveredAt={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
      />
      <MuscleCard
        muscleName="Back (50%)"
        fatiguePercent={50}
        lastTrained={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
        recoveredAt={new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)}
      />
      <MuscleCard
        muscleName="Triceps (75%)"
        fatiguePercent={75}
        lastTrained={new Date()}
        recoveredAt={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
      />
      <MuscleCard
        muscleName="Legs (100%)"
        fatiguePercent={100}
        lastTrained={new Date()}
        recoveredAt={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
      />
    </div>
  ),
};

export const AllTimeFrames: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <MuscleCard
        muscleName="Today"
        fatiguePercent={85}
        lastTrained={new Date()}
        recoveredAt={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
      />
      <MuscleCard
        muscleName="Yesterday"
        fatiguePercent={70}
        lastTrained={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
        recoveredAt={new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)}
      />
      <MuscleCard
        muscleName="3 Days Ago"
        fatiguePercent={45}
        lastTrained={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)}
        recoveredAt={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
      />
      <MuscleCard
        muscleName="2 Weeks Ago"
        fatiguePercent={10}
        lastTrained={new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)}
        recoveredAt={new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)}
      />
      <MuscleCard
        muscleName="Never Trained"
        fatiguePercent={0}
        lastTrained={null}
        recoveredAt={null}
      />
    </div>
  ),
};

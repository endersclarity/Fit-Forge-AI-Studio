import type { Meta, StoryObj } from '@storybook/react-vite';
import { CollapsibleSection } from './CollapsibleSection';
import { MuscleCard } from '../fitness/MuscleCard';

const meta = {
  title: 'Layout/CollapsibleSection',
  component: CollapsibleSection,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultOpen: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof CollapsibleSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'PUSH',
    count: 3,
    defaultOpen: false,
    children: (
      <div className="text-white">
        <p>Section content goes here</p>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const DefaultOpen: Story = {
  args: {
    title: 'PULL',
    count: 5,
    defaultOpen: true,
    children: (
      <div className="text-white">
        <p>This section starts open</p>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const NoCount: Story = {
  args: {
    title: 'Settings',
    defaultOpen: false,
    children: (
      <div className="text-white space-y-2">
        <div className="p-3 bg-card-background rounded-lg">Option 1</div>
        <div className="p-3 bg-card-background rounded-lg">Option 2</div>
        <div className="p-3 bg-card-background rounded-lg">Option 3</div>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const WithMuscleCards: Story = {
  args: {
    title: 'PUSH',
    count: 3,
    defaultOpen: true,
    children: (
      <>
        <MuscleCard
          muscleName="Chest"
          fatiguePercent={15}
          lastTrained={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)}
          recoveredAt={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
        />
        <MuscleCard
          muscleName="Shoulders"
          fatiguePercent={42}
          lastTrained={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
          recoveredAt={new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)}
        />
        <MuscleCard
          muscleName="Triceps"
          fatiguePercent={68}
          lastTrained={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
          recoveredAt={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
        />
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const LongContent: Story = {
  args: {
    title: 'Exercises',
    count: 10,
    defaultOpen: false,
    children: (
      <div className="text-white space-y-2">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="p-3 bg-card-background rounded-lg">
            Exercise {i + 1}
          </div>
        ))}
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const MultipleSections: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <CollapsibleSection title="PUSH" count={3} defaultOpen={true}>
        <MuscleCard
          muscleName="Chest"
          fatiguePercent={15}
          lastTrained={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)}
          recoveredAt={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
        />
        <MuscleCard
          muscleName="Shoulders"
          fatiguePercent={42}
          lastTrained={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
          recoveredAt={new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)}
        />
        <MuscleCard
          muscleName="Triceps"
          fatiguePercent={68}
          lastTrained={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
          recoveredAt={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="PULL" count={5} defaultOpen={false}>
        <MuscleCard
          muscleName="Back"
          fatiguePercent={85}
          lastTrained={new Date()}
          recoveredAt={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
        />
        <MuscleCard
          muscleName="Biceps"
          fatiguePercent={50}
          lastTrained={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
          recoveredAt={new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="LEGS" count={4} defaultOpen={false}>
        <MuscleCard
          muscleName="Quadriceps"
          fatiguePercent={90}
          lastTrained={new Date()}
          recoveredAt={new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)}
        />
        <MuscleCard
          muscleName="Hamstrings"
          fatiguePercent={88}
          lastTrained={new Date()}
          recoveredAt={new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)}
        />
      </CollapsibleSection>

      <CollapsibleSection title="CORE" count={1} defaultOpen={false}>
        <MuscleCard
          muscleName="Core"
          fatiguePercent={35}
          lastTrained={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
          recoveredAt={new Date()}
        />
      </CollapsibleSection>
    </div>
  ),
};

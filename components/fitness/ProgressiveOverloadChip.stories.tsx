import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressiveOverloadChip } from './ProgressiveOverloadChip';

const meta = {
  title: 'Fitness/ProgressiveOverloadChip',
  component: ProgressiveOverloadChip,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['weight', 'reps'],
    },
    unit: {
      control: 'select',
      options: ['lbs', 'kg', 'reps'],
    },
  },
} satisfies Meta<typeof ProgressiveOverloadChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WeightIncrease: Story = {
  args: {
    type: 'weight',
    currentValue: 135,
    suggestedValue: 140,
    unit: 'lbs',
  },
};

export const RepsIncrease: Story = {
  args: {
    type: 'reps',
    currentValue: 10,
    suggestedValue: 11,
    unit: 'reps',
  },
};

export const LargeWeightIncrease: Story = {
  args: {
    type: 'weight',
    currentValue: 100,
    suggestedValue: 110,
    unit: 'lbs',
  },
};

export const SmallRepsIncrease: Story = {
  args: {
    type: 'reps',
    currentValue: 30,
    suggestedValue: 31,
    unit: 'reps',
  },
};

export const KilogramsUnit: Story = {
  args: {
    type: 'weight',
    currentValue: 60,
    suggestedValue: 62.5,
    unit: 'kg',
  },
};

export const WithTooltip: Story = {
  args: {
    type: 'weight',
    currentValue: 225,
    suggestedValue: 230,
    unit: 'lbs',
  },
  parameters: {
    docs: {
      description: {
        story: 'Hover over the chip to see the tooltip with detailed progressive overload information.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-gray-400 text-sm mb-2">Weight progression (lbs):</div>
        <ProgressiveOverloadChip
          type="weight"
          currentValue={135}
          suggestedValue={140}
          unit="lbs"
        />
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-2">Weight progression (kg):</div>
        <ProgressiveOverloadChip
          type="weight"
          currentValue={60}
          suggestedValue={62.5}
          unit="kg"
        />
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-2">Reps progression:</div>
        <ProgressiveOverloadChip
          type="reps"
          currentValue={10}
          suggestedValue={11}
          unit="reps"
        />
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-2">Large percentage increase:</div>
        <ProgressiveOverloadChip
          type="weight"
          currentValue={100}
          suggestedValue={110}
          unit="lbs"
        />
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-2">Small percentage increase:</div>
        <ProgressiveOverloadChip
          type="reps"
          currentValue={30}
          suggestedValue={31}
          unit="reps"
        />
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="p-4 bg-card-background rounded-lg w-96">
      <h3 className="text-white font-bold mb-3">Bench Press</h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm tabular-nums">
          Last: 10 reps @ 135lbs
        </span>
        <ProgressiveOverloadChip
          type="weight"
          currentValue={135}
          suggestedValue={140}
          unit="lbs"
        />
      </div>
      <p className="text-gray-400 text-xs mt-3">
        Hover over the chip to see the detailed calculation
      </p>
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error'],
    },
    height: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    animated: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    value: 25,
    variant: 'success',
    height: 'md',
    animated: true,
    ariaLabel: 'Muscle fatigue level',
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const Warning: Story = {
  args: {
    value: 50,
    variant: 'warning',
    height: 'md',
    animated: true,
    ariaLabel: 'Muscle fatigue level',
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const Error: Story = {
  args: {
    value: 85,
    variant: 'error',
    height: 'md',
    animated: true,
    ariaLabel: 'Muscle fatigue level',
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const SmallHeight: Story = {
  args: {
    value: 60,
    variant: 'warning',
    height: 'sm',
    animated: true,
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const LargeHeight: Story = {
  args: {
    value: 60,
    variant: 'warning',
    height: 'lg',
    animated: true,
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const NoAnimation: Story = {
  args: {
    value: 75,
    variant: 'error',
    height: 'md',
    animated: false,
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-96">
      <div>
        <div className="text-gray-400 text-sm mb-1">Success (25%)</div>
        <ProgressBar value={25} variant="success" height="md" />
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-1">Warning (50%)</div>
        <ProgressBar value={50} variant="warning" height="md" />
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-1">Error (85%)</div>
        <ProgressBar value={85} variant="error" height="md" />
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-1">Small Height</div>
        <ProgressBar value={40} variant="warning" height="sm" />
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-1">Medium Height</div>
        <ProgressBar value={40} variant="warning" height="md" />
      </div>
      <div>
        <div className="text-gray-400 text-sm mb-1">Large Height</div>
        <ProgressBar value={40} variant="warning" height="lg" />
      </div>
    </div>
  ),
};

export const FatigueLevels: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-96">
      <div>
        <div className="text-white text-sm mb-1 flex justify-between">
          <span>Fresh (0%)</span>
          <span className="font-bold tabular-nums">0%</span>
        </div>
        <ProgressBar value={0} variant="success" height="sm" />
      </div>
      <div>
        <div className="text-white text-sm mb-1 flex justify-between">
          <span>Low Fatigue (15%)</span>
          <span className="font-bold tabular-nums">15%</span>
        </div>
        <ProgressBar value={15} variant="success" height="sm" />
      </div>
      <div>
        <div className="text-white text-sm mb-1 flex justify-between">
          <span>Moderate (45%)</span>
          <span className="font-bold tabular-nums">45%</span>
        </div>
        <ProgressBar value={45} variant="warning" height="sm" />
      </div>
      <div>
        <div className="text-white text-sm mb-1 flex justify-between">
          <span>High Fatigue (75%)</span>
          <span className="font-bold tabular-nums">75%</span>
        </div>
        <ProgressBar value={75} variant="error" height="sm" />
      </div>
      <div>
        <div className="text-white text-sm mb-1 flex justify-between">
          <span>Exhausted (100%)</span>
          <span className="font-bold tabular-nums">100%</span>
        </div>
        <ProgressBar value={100} variant="error" height="sm" />
      </div>
    </div>
  ),
};

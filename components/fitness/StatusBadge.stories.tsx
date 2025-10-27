import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge } from './StatusBadge';

const meta = {
  title: 'Fitness/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['EXCELLENT', 'GOOD', 'SUBOPTIMAL'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Excellent: Story = {
  args: {
    status: 'EXCELLENT',
    size: 'md',
  },
};

export const Good: Story = {
  args: {
    status: 'GOOD',
    size: 'md',
  },
};

export const Suboptimal: Story = {
  args: {
    status: 'SUBOPTIMAL',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    status: 'EXCELLENT',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    status: 'EXCELLENT',
    size: 'lg',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center">
        <StatusBadge status="EXCELLENT" />
        <StatusBadge status="GOOD" />
        <StatusBadge status="SUBOPTIMAL" />
      </div>
      <div className="flex gap-3 items-center">
        <StatusBadge status="EXCELLENT" size="sm" />
        <StatusBadge status="EXCELLENT" size="md" />
        <StatusBadge status="EXCELLENT" size="lg" />
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-card-background rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold">Bench Press</h3>
          <StatusBadge status="EXCELLENT" />
        </div>
        <p className="text-gray-400 text-sm">Perfect muscle recovery and engagement.</p>
      </div>
      <div className="p-4 bg-card-background rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold">Barbell Row</h3>
          <StatusBadge status="GOOD" />
        </div>
        <p className="text-gray-400 text-sm">Good choice for current recovery state.</p>
      </div>
      <div className="p-4 bg-card-background rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold">Leg Press</h3>
          <StatusBadge status="SUBOPTIMAL" />
        </div>
        <p className="text-amber-500 text-sm">Primary muscles still recovering.</p>
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

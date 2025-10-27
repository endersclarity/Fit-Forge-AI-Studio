import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: 'select',
      options: ['none', 'low', 'medium', 'high'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    hover: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-white font-bold mb-2">Card Title</h3>
        <p className="text-gray-400">This is the card content.</p>
      </div>
    ),
    elevation: 'medium',
    padding: 'md',
  },
};

export const LowElevation: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-white font-bold mb-2">Low Elevation</h3>
        <p className="text-gray-400">This card has minimal shadow.</p>
      </div>
    ),
    elevation: 'low',
    padding: 'md',
  },
};

export const HighElevation: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-white font-bold mb-2">High Elevation</h3>
        <p className="text-gray-400">This card has a prominent shadow.</p>
      </div>
    ),
    elevation: 'high',
    padding: 'md',
  },
};

export const SmallPadding: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-white font-bold">Small Padding</h3>
      </div>
    ),
    elevation: 'medium',
    padding: 'sm',
  },
};

export const LargePadding: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-white font-bold mb-2">Large Padding</h3>
        <p className="text-gray-400">This card has generous spacing.</p>
      </div>
    ),
    elevation: 'medium',
    padding: 'lg',
  },
};

export const WithHover: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-white font-bold mb-2">Hover Effect</h3>
        <p className="text-gray-400">Hover over this card to see the effect.</p>
      </div>
    ),
    elevation: 'medium',
    padding: 'md',
    hover: true,
  },
};

export const Interactive: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-white font-bold mb-2">Interactive Card</h3>
        <p className="text-gray-400">Click this card to trigger an action.</p>
      </div>
    ),
    elevation: 'medium',
    padding: 'md',
    hover: true,
    onClick: () => alert('Card clicked!'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4 bg-background">
      <div className="flex gap-4 flex-wrap">
        <Card elevation="none" padding="md">
          <div className="text-white">No Elevation</div>
        </Card>
        <Card elevation="low" padding="md">
          <div className="text-white">Low Elevation</div>
        </Card>
        <Card elevation="medium" padding="md">
          <div className="text-white">Medium Elevation</div>
        </Card>
        <Card elevation="high" padding="md">
          <div className="text-white">High Elevation</div>
        </Card>
      </div>
      <div className="flex gap-4 flex-wrap">
        <Card elevation="medium" padding="none">
          <div className="text-white">No Padding</div>
        </Card>
        <Card elevation="medium" padding="sm">
          <div className="text-white">Small Padding</div>
        </Card>
        <Card elevation="medium" padding="md">
          <div className="text-white">Medium Padding</div>
        </Card>
        <Card elevation="medium" padding="lg">
          <div className="text-white">Large Padding</div>
        </Card>
      </div>
      <div className="flex gap-4 flex-wrap">
        <Card elevation="medium" padding="md" hover>
          <div className="text-white">Hover Effect</div>
        </Card>
        <Card elevation="medium" padding="md" hover onClick={() => console.log('Clicked')}>
          <div className="text-white">Interactive + Hover</div>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

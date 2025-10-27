import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: 'success',
    size: 'md',
    children: 'Success',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    size: 'md',
    children: 'Warning',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    size: 'md',
    children: 'Error',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    size: 'md',
    children: 'Info',
  },
};

export const Small: Story = {
  args: {
    variant: 'success',
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    variant: 'success',
    size: 'lg',
    children: 'Large',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center">
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="info">Info</Badge>
      </div>
      <div className="flex gap-3 items-center">
        <Badge variant="success" size="sm">Small</Badge>
        <Badge variant="success" size="md">Medium</Badge>
        <Badge variant="success" size="lg">Large</Badge>
      </div>
      <div className="flex gap-3 items-center">
        <Badge variant="success">Ready</Badge>
        <Badge variant="warning">Recovering</Badge>
        <Badge variant="error">Needs Rest</Badge>
        <Badge variant="info">New</Badge>
      </div>
    </div>
  ),
};

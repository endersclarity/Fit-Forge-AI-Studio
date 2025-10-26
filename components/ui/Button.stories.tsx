import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Primary Button',
    onClick: () => console.log('Primary clicked'),
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Secondary Button',
    onClick: () => console.log('Secondary clicked'),
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: 'Ghost Button',
    onClick: () => console.log('Ghost clicked'),
  },
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
    onClick: () => console.log('Small clicked'),
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Button',
    onClick: () => console.log('Large clicked'),
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
    children: 'Disabled Button',
    onClick: () => console.log('This should not fire'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button variant="primary" onClick={() => console.log('Primary')}>
          Primary
        </Button>
        <Button variant="secondary" onClick={() => console.log('Secondary')}>
          Secondary
        </Button>
        <Button variant="ghost" onClick={() => console.log('Ghost')}>
          Ghost
        </Button>
      </div>
      <div className="flex gap-4 items-center">
        <Button variant="primary" size="sm" onClick={() => console.log('Small')}>
          Small
        </Button>
        <Button variant="primary" size="md" onClick={() => console.log('Medium')}>
          Medium
        </Button>
        <Button variant="primary" size="lg" onClick={() => console.log('Large')}>
          Large
        </Button>
      </div>
      <div className="flex gap-4">
        <Button variant="primary" disabled onClick={() => console.log('Disabled')}>
          Disabled
        </Button>
      </div>
    </div>
  ),
};

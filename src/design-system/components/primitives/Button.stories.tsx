/**
 * Button Component - Storybook Stories
 *
 * Interactive documentation and visual testing for the Button component.
 * Demonstrates all variants, sizes, and interactive states.
 *
 * Reference: Epic 5 Story 3 AC6 - Storybook stories for components
 */

import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

/**
 * Button component with multiple variants and sizes.
 * Primary action button for user interactions.
 */
const meta = {
  title: 'Design System/Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Visual style of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    children: {
      control: 'text',
      description: 'Button text content',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary Variant Stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Primary Button',
  },
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

export const PrimarySmall: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Primary',
  },
};

export const PrimaryLarge: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Primary',
  },
};

// Secondary Variant Stories
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Secondary Button',
  },
};

export const SecondarySmall: Story = {
  args: {
    variant: 'secondary',
    size: 'sm',
    children: 'Small Secondary',
  },
};

export const SecondaryLarge: Story = {
  args: {
    variant: 'secondary',
    size: 'lg',
    children: 'Large Secondary',
  },
};

// Ghost Variant Stories
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: 'Ghost Button',
  },
};

export const GhostSmall: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    children: 'Small Ghost',
  },
};

export const GhostLarge: Story = {
  args: {
    variant: 'ghost',
    size: 'lg',
    children: 'Large Ghost',
  },
};

// State Stories
export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Disabled Button',
    disabled: true,
  },
};

export const DisabledSecondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Disabled Secondary',
    disabled: true,
  },
};

export const DisabledGhost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: 'Disabled Ghost',
    disabled: true,
  },
};

// All Variants and Sizes
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      {/* Primary */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Primary Variant</h3>
        <div className="flex gap-4">
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </div>
      </div>

      {/* Secondary */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Secondary Variant</h3>
        <div className="flex gap-4">
          <Button variant="secondary" size="sm">
            Small
          </Button>
          <Button variant="secondary" size="md">
            Medium
          </Button>
          <Button variant="secondary" size="lg">
            Large
          </Button>
        </div>
      </div>

      {/* Ghost */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Ghost Variant</h3>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm">
            Small
          </Button>
          <Button variant="ghost" size="md">
            Medium
          </Button>
          <Button variant="ghost" size="lg">
            Large
          </Button>
        </div>
      </div>

      {/* Disabled States */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Disabled States</h3>
        <div className="flex gap-4">
          <Button variant="primary" disabled>
            Disabled Primary
          </Button>
          <Button variant="secondary" disabled>
            Disabled Secondary
          </Button>
          <Button variant="ghost" disabled>
            Disabled Ghost
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Interactive Story
export const Interactive: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Click me!',
  },
  render: (args) => (
    <Button {...args} onClick={() => alert('Button clicked!')} />
  ),
};

// Different Button Types
export const SubmitButton: Story = {
  args: {
    type: 'submit',
    variant: 'primary',
    size: 'md',
    children: 'Submit Form',
  },
};

export const ResetButton: Story = {
  args: {
    type: 'reset',
    variant: 'secondary',
    size: 'md',
    children: 'Reset',
  },
};

// With ARIA Labels
export const WithAriaLabel: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    ariaLabel: 'Save document',
    children: 'Save',
  },
};

// Accessibility Test
export const A11y: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Accessible Button',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};

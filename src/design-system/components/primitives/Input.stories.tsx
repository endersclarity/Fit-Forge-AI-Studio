/**
 * Input Component - Storybook Stories
 *
 * Interactive documentation and visual testing for the Input component.
 * Demonstrates glass background, focus rings, sizes, and interactive states.
 *
 * Reference: Epic 5 Story 3 AC6 - Storybook stories for components
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Input from './Input';

/**
 * Input component with glass background and focus ring.
 * Used for user text input with various sizes and states.
 */
const meta = {
  title: 'Design System/Primitives/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error'],
      description: 'Input style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    type: {
      control: 'text',
      description: 'HTML input type',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default State
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    size: 'md',
    variant: 'default',
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
    variant: 'default',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    placeholder: 'Medium input (default)',
    variant: 'default',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
    variant: 'default',
  },
};

// Variants
export const DefaultVariant: Story = {
  args: {
    size: 'md',
    placeholder: 'Default variant',
    variant: 'default',
  },
};

export const ErrorVariant: Story = {
  args: {
    size: 'md',
    placeholder: 'Error variant',
    variant: 'error',
    defaultValue: 'Invalid input',
  },
};

// States
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'With initial value',
    defaultValue: 'Sample text',
  },
};

// Input Types
export const TextInput: Story = {
  args: {
    type: 'text',
    placeholder: 'Text input',
  },
};

export const EmailInput: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email address',
  },
};

export const PasswordInput: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter number',
    min: '0',
    max: '100',
  },
};

export const SearchInput: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

// All Sizes
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Small Input
        </label>
        <Input size="sm" placeholder="Small" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medium Input
        </label>
        <Input size="md" placeholder="Medium" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Large Input
        </label>
        <Input size="lg" placeholder="Large" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Variant
        </label>
        <Input variant="default" placeholder="Default" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Error Variant
        </label>
        <Input variant="error" placeholder="Error" value="Invalid" onChange={() => {}} />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Controlled Component
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="space-y-4 max-w-md">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type to see value"
        />
        <div className="text-sm text-gray-600">
          Current value: <span className="font-mono">{value}</span>
        </div>
      </div>
    );
  },
};

// Form Example
export const InForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Form submitted:\n${JSON.stringify(formData, null, 2)}`);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <Input
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium transition-all hover:brightness-110"
        >
          Submit
        </button>
      </form>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

// Focus States
export const FocusStates: Story = {
  render: () => (
    <div className="space-y-6 p-8">
      <div>
        <h3 className="mb-4 text-lg font-bold">Default Focus Ring</h3>
        <Input placeholder="Click to focus" />
        <p className="mt-2 text-sm text-gray-600">
          Primary color focus ring appears on focus.
        </p>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold">Error Focus Ring</h3>
        <Input variant="error" placeholder="Click to focus" />
        <p className="mt-2 text-sm text-gray-600">
          Red color focus ring indicates error state.
        </p>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Glass Background Feature
export const GlassBackground: Story = {
  parameters: {
    backgrounds: {
      default: 'gradient',
      values: [
        { name: 'gradient', value: 'linear-gradient(135deg, #758AC6 0%, #566890 100%)' },
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  render: () => (
    <div className="p-8">
      <Input placeholder="Glass background input" size="lg" />
      <p className="mt-4 text-xs text-white">
        Styles: bg-white/50, backdrop-blur-sm, border-gray-300/50
      </p>
    </div>
  ),
};

// With Prefix/Suffix Labels
export const WithLabels: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <Input placeholder="Enter username" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <Input type="email" placeholder="user@example.com" />
        <p className="mt-1 text-xs text-gray-500">
          We'll never share your email.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reps
        </label>
        <Input type="number" placeholder="10" min="1" max="100" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Validation States
export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Valid Input
        </label>
        <Input
          variant="default"
          placeholder="Valid"
          defaultValue="user@example.com"
        />
        <p className="mt-1 text-xs text-green-600">
          ✓ Valid email format
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Invalid Input
        </label>
        <Input
          variant="error"
          placeholder="Invalid"
          defaultValue="not-an-email"
        />
        <p className="mt-1 text-xs text-red-600">
          ✗ Invalid email format
        </p>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Accessibility Test
export const A11y: Story = {
  args: {
    placeholder: 'Accessible input',
    ariaLabel: 'Exercise name',
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

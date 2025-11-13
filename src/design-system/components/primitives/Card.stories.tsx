/**
 * Card Component - Storybook Stories
 *
 * Interactive documentation and visual testing for the Card component.
 * Demonstrates glass morphism effect, variants, and interactive states.
 *
 * Reference: Epic 5 Story 3 AC6 - Storybook stories for components
 */

import type { Meta, StoryObj } from '@storybook/react';
import Card from './Card';

/**
 * Card component with glass morphism styling.
 * Used for containing content with visual separation.
 */
const meta = {
  title: 'Design System/Primitives/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated'],
      description: 'Card style variant',
    },
    children: {
      control: 'text',
      description: 'Card content',
    },
    onClick: {
      description: 'Click handler for interactive cards',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Variant
export const Default: Story = {
  args: {
    variant: 'default',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900">Card Title</h3>
        <p className="mt-2 text-sm text-gray-600">
          This is a card with glass morphism effect.
        </p>
      </div>
    ),
  },
};

// Elevated Variant
export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900">Elevated Card</h3>
        <p className="mt-2 text-sm text-gray-600">
          This card has shadow elevation.
        </p>
      </div>
    ),
  },
};

// Interactive Card
export const Interactive: Story = {
  args: {
    variant: 'default',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900">Click Me</h3>
        <p className="mt-2 text-sm text-gray-600">
          This is an interactive card. Try clicking it!
        </p>
      </div>
    ),
  },
  render: (args) => (
    <Card
      {...args}
      onClick={() => alert('Card clicked!')}
    />
  ),
};

// Rich Content Card
export const RichContent: Story = {
  args: {
    variant: 'elevated',
  },
  render: () => (
    <Card variant="elevated" className="max-w-sm">
      <div className="p-6">
        <div className="mb-4">
          <div className="h-32 w-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Exercise Card</h3>
        <p className="mt-2 text-sm text-gray-600">
          Comprehensive exercise information with visual indicators.
        </p>
        <div className="mt-4 flex gap-2">
          <span className="inline-flex items-center rounded-full bg-badge-bg px-3 py-1 text-xs font-medium text-badge-text">
            Strength
          </span>
          <span className="inline-flex items-center rounded-full bg-badge-bg px-3 py-1 text-xs font-medium text-badge-text">
            Upper Body
          </span>
        </div>
      </div>
    </Card>
  ),
};

// Multiple Cards Grid
export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card
          key={i}
          variant={i % 2 === 0 ? 'elevated' : 'default'}
          className="cursor-pointer transition-all hover:scale-105"
          onClick={() => alert(`Card ${i} clicked!`)}
        >
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900">Card {i}</h3>
            <p className="mt-2 text-sm text-gray-600">
              Interactive card in a grid layout.
            </p>
          </div>
        </Card>
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Variants Comparison
export const Variants: Story = {
  render: () => (
    <div className="space-y-6 p-8">
      <div>
        <h3 className="mb-4 text-lg font-bold">Default Variant</h3>
        <Card variant="default">
          <div className="p-6">
            <h4 className="font-bold text-gray-900">Default Card</h4>
            <p className="mt-2 text-sm text-gray-600">
              Glass morphism without shadow elevation.
            </p>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold">Elevated Variant</h3>
        <Card variant="elevated">
          <div className="p-6">
            <h4 className="font-bold text-gray-900">Elevated Card</h4>
            <p className="mt-2 text-sm text-gray-600">
              Glass morphism with shadow for depth perception.
            </p>
          </div>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// With Custom Content
export const CustomContent: Story = {
  args: {
    variant: 'elevated',
    className: 'max-w-md',
  },
  render: (args) => (
    <Card {...args}>
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200/50 px-6 py-4">
          <h3 className="font-bold text-gray-900">Workout Details</h3>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Exercise:</span>
            <span className="font-medium text-gray-900">Bench Press</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Sets:</span>
            <span className="font-medium text-gray-900">4</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Reps:</span>
            <span className="font-medium text-gray-900">8-10</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200/50 px-6 py-3">
          <button className="w-full rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium transition-all hover:brightness-110">
            Start Workout
          </button>
        </div>
      </div>
    </Card>
  ),
};

// Hover States Showcase
export const HoverStates: Story = {
  render: () => (
    <div className="space-y-6 p-8">
      <div>
        <h3 className="mb-4 text-lg font-bold">Default - Hover Effect</h3>
        <Card variant="default" className="transition-all duration-200">
          <div className="p-6">
            <h4 className="font-bold text-gray-900">Hover to see effect</h4>
            <p className="mt-2 text-sm text-gray-600">
              Background and border become slightly more opaque.
            </p>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold">Elevated - Hover Effect</h3>
        <Card variant="elevated" className="transition-all duration-200">
          <div className="p-6">
            <h4 className="font-bold text-gray-900">Hover to see effect</h4>
            <p className="mt-2 text-sm text-gray-600">
              Shadow increases for depth indication.
            </p>
          </div>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Glass Morphism Feature
export const GlassMorphism: Story = {
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
      <Card variant="elevated" className="max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900">Glass Morphism</h3>
          <p className="mt-2 text-sm text-gray-600">
            Notice the frosted glass effect with backdrop blur. Works great over gradient backgrounds.
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Styles: bg-white/50, backdrop-blur-sm, border-gray-300/50
          </p>
        </div>
      </Card>
    </div>
  ),
};

// Accessibility Test
export const A11y: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900">Accessible Card</h3>
        <p className="mt-2 text-sm text-gray-600">
          This card meets WCAG AA accessibility standards.
        </p>
      </div>
    ),
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

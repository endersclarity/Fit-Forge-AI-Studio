/**
 * Badge Component Stories - Storybook Documentation
 *
 * Visual documentation and interactive examples for Badge primitive component.
 * Shows all variants, sizes, and use cases with accessibility guidance.
 *
 * Reference: Epic 6.5 Story 1 - Railway Deployment & Missing Primitives
 */

import type { Meta, StoryObj } from '@storybook/react';
import Badge from './Badge';

const meta = {
  title: 'Design System/Primitives/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Badge component for status indicators, counts, and labels.

**Features:**
- 5 semantic variants: success, warning, error, info, primary
- 3 size options: sm, md, lg
- Design token-based theming
- Accessibility-first with ARIA support
- Composable with custom classes

**Common Use Cases:**
- Status indicators (Active, Pending, Failed)
- Notification counts (12 new messages)
- Category labels (Cardio, Strength, Recovery)
- Muscle group tags (Chest, Back, Legs)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'primary'],
      description: 'Visual variant with semantic colors',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge size',
    },
    children: {
      control: 'text',
      description: 'Badge content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default badge with primary variant and medium size.
 */
export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

/**
 * All 5 semantic color variants for different states and contexts.
 *
 * **Accessibility Note:** Use semantic variants to convey meaning through color.
 * Success (green) for positive states, Warning (yellow) for caution,
 * Error (red) for negative states, Info (blue) for informational,
 * Primary for neutral/default badges.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="primary">Primary</Badge>
    </div>
  ),
};

/**
 * Three size options for different contexts.
 * Small for compact spaces, Medium for standard use, Large for emphasis.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Badge size="sm">Small</Badge>
        <span className="text-sm text-gray-600">Compact spaces, inline text</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge size="md">Medium</Badge>
        <span className="text-sm text-gray-600">Standard use, default size</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge size="lg">Large</Badge>
        <span className="text-sm text-gray-600">Emphasis, primary actions</span>
      </div>
    </div>
  ),
};

/**
 * Status indicators for workout states, recovery progress, and exercise availability.
 *
 * **FitForge Use Cases:**
 * - Workout status (Active, Pending, Completed)
 * - Recovery state (Fresh, Fatigued, Recovering)
 * - Exercise availability (Available, Locked, New)
 */
export const StatusIndicators: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Badge variant="success">Active</Badge>
        <Badge variant="success">Completed</Badge>
        <Badge variant="success">Fresh</Badge>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="warning">Pending</Badge>
        <Badge variant="warning">Fatigued</Badge>
        <Badge variant="warning">Attention Needed</Badge>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="error">Failed</Badge>
        <Badge variant="error">Unavailable</Badge>
        <Badge variant="error">Locked</Badge>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="info">New</Badge>
        <Badge variant="info">Updated</Badge>
        <Badge variant="info">Recommended</Badge>
      </div>
    </div>
  ),
};

/**
 * Notification counts and numeric indicators.
 *
 * **Use Cases:**
 * - Unread notifications (12 new)
 * - Set counts (3/4 sets)
 * - Muscle group exercises (8 exercises)
 */
export const NotificationCounts: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="error" size="sm">3</Badge>
      <Badge variant="info">12</Badge>
      <Badge variant="primary">99+</Badge>
      <Badge variant="success" size="lg">✓ 5</Badge>
    </div>
  ),
};

/**
 * Category and muscle group labels.
 *
 * **FitForge Use Cases:**
 * - Exercise categories (Cardio, Strength, Flexibility)
 * - Muscle groups (Chest, Back, Legs, Shoulders)
 * - Workout types (HIIT, Endurance, Recovery)
 */
export const CategoryLabels: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="primary" size="sm">Cardio</Badge>
        <Badge variant="primary" size="sm">Strength</Badge>
        <Badge variant="primary" size="sm">Flexibility</Badge>
        <Badge variant="primary" size="sm">Recovery</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="info" size="sm">Chest</Badge>
        <Badge variant="info" size="sm">Back</Badge>
        <Badge variant="info" size="sm">Legs</Badge>
        <Badge variant="info" size="sm">Shoulders</Badge>
        <Badge variant="info" size="sm">Core</Badge>
      </div>
    </div>
  ),
};

/**
 * Accessibility examples with ARIA labels for screen readers.
 *
 * **WCAG Guidance:**
 * - Use aria-label for icon-only badges to provide context
 * - Semantic colors should be supplemented with text/icons (don't rely on color alone)
 * - All variants pass WCAG AA contrast requirements
 */
export const AccessibilityExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Badge variant="success" aria-label="Status: Active">
          ✓
        </Badge>
        <span className="text-sm text-gray-600">Icon with ARIA label for screen readers</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="error" aria-label="3 errors">
          ⚠ 3
        </Badge>
        <span className="text-sm text-gray-600">Count with icon and ARIA description</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="info">New Feature</Badge>
        <span className="text-sm text-gray-600">Text labels are self-describing</span>
      </div>
    </div>
  ),
};

/**
 * Custom styling with className prop for special use cases.
 */
export const CustomStyling: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge className="shadow-lg">With Shadow</Badge>
      <Badge className="uppercase tracking-wider">Uppercase</Badge>
      <Badge className="ring-2 ring-primary ring-offset-2">With Ring</Badge>
    </div>
  ),
};

/**
 * ProgressBar Component Stories - Storybook Documentation
 *
 * Visual documentation and interactive examples for ProgressBar primitive component.
 * Shows all variants, sizes, animations, and use cases with accessibility guidance.
 *
 * Reference: Epic 6.5 Story 1 - Railway Deployment & Missing Primitives
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';

const meta = {
  title: 'Design System/Primitives/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
ProgressBar component for visual progress indicators with smooth animations.

**Features:**
- Smooth animations using Framer Motion
- 4 color variants: primary, success, warning, error
- 3 size options: sm, md, lg
- Optional percentage label display
- Accessibility-first with ARIA progressbar role
- Value clamping (0-100) with edge case handling

**Common Use Cases:**
- Workout completion progress
- Recovery timeline tracking
- Calibration progress indicators
- Loading states and async operations
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)',
    },
    variant: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'error'],
      description: 'Visual variant with semantic colors',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Progress bar height',
    },
    showLabel: {
      control: 'boolean',
      description: 'Whether to show percentage label',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default progress bar with primary variant and medium size.
 */
export const Default: Story = {
  args: {
    value: 75,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

/**
 * Progress at different percentages (0%, 25%, 50%, 75%, 100%).
 *
 * **Use Case:** Visualizing different completion states.
 */
export const DifferentPercentages: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">0% - Not started</div>
        <ProgressBar value={0} />
      </div>
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">25% - Early progress</div>
        <ProgressBar value={25} />
      </div>
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">50% - Halfway there</div>
        <ProgressBar value={50} />
      </div>
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">75% - Nearly complete</div>
        <ProgressBar value={75} />
      </div>
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">100% - Completed</div>
        <ProgressBar value={100} />
      </div>
    </div>
  ),
};

/**
 * Smooth animation demonstration.
 *
 * **Animation Details:**
 * - Uses Framer Motion spring physics
 * - Spring parameters: stiffness 300, damping 20
 * - Smooth transition when value changes
 * - Natural, organic feel matching FAB pattern
 */
export const AnimationDemo: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 10;
        });
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-80 space-y-4">
        <div className="text-sm font-body text-gray-600">
          Watch the smooth spring animation as progress increases every second
        </div>
        <ProgressBar value={progress} showLabel />
        <div className="text-xs font-body text-gray-500 italic">
          Animation resets at 100% to demonstrate continuous progress
        </div>
      </div>
    );
  },
};

/**
 * All 4 color variants for different contexts.
 *
 * **Semantic Meaning:**
 * - Primary (blue): General progress, neutral states
 * - Success (green): Completed or positive progress
 * - Warning (yellow): Cautionary states, attention needed
 * - Error (red): Failed or problematic progress
 */
export const ColorVariants: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">Primary</div>
        <ProgressBar value={75} variant="primary" />
      </div>
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">Success</div>
        <ProgressBar value={100} variant="success" />
      </div>
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">Warning</div>
        <ProgressBar value={50} variant="warning" />
      </div>
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">Error</div>
        <ProgressBar value={25} variant="error" />
      </div>
    </div>
  ),
};

/**
 * Three size options for different contexts.
 */
export const Sizes: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">Small (h-2)</div>
        <ProgressBar value={60} size="sm" />
      </div>
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">Medium (h-3) - Default</div>
        <ProgressBar value={60} size="md" />
      </div>
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">Large (h-4)</div>
        <ProgressBar value={60} size="lg" />
      </div>
    </div>
  ),
};

/**
 * Progress bar with percentage label display.
 *
 * **Use Case:** When users need to see exact percentage value.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <ProgressBar value={33} showLabel />
      <ProgressBar value={66} variant="success" showLabel />
      <ProgressBar value={90} variant="warning" size="lg" showLabel />
    </div>
  ),
};

/**
 * FitForge use cases: workout completion, recovery progress, calibration.
 *
 * **Real-World Examples:**
 * - Workout completion tracking (sets completed / total sets)
 * - Recovery timeline (hours recovered / total recovery time)
 * - Exercise calibration progress (reps completed / target reps)
 */
export const FitForgeUseCases: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-body font-semibold text-gray-800 mb-2">
          Workout Completion
        </div>
        <div className="text-xs font-body text-gray-600 mb-2">3 of 4 sets completed</div>
        <ProgressBar value={75} variant="primary" showLabel />
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-body font-semibold text-gray-800 mb-2">
          Recovery Progress
        </div>
        <div className="text-xs font-body text-gray-600 mb-2">18 hours / 24 hours</div>
        <ProgressBar value={75} variant="success" showLabel />
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-body font-semibold text-gray-800 mb-2">
          Calibration Progress
        </div>
        <div className="text-xs font-body text-gray-600 mb-2">5 reps / 10 target reps</div>
        <ProgressBar value={50} variant="warning" showLabel />
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-body font-semibold text-gray-800 mb-2">
          Failed Workout
        </div>
        <div className="text-xs font-body text-gray-600 mb-2">Incomplete - 1 of 4 sets</div>
        <ProgressBar value={25} variant="error" showLabel />
      </div>
    </div>
  ),
};

/**
 * Accessibility examples with ARIA attributes.
 *
 * **WCAG Guidance:**
 * - Uses role="progressbar" for semantic meaning
 * - aria-valuenow, aria-valuemin, aria-valuemax provide current state
 * - Custom aria-label describes purpose to screen readers
 * - All variants pass WCAG AA contrast requirements
 */
export const AccessibilityExamples: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">
          Default ARIA label (auto-generated)
        </div>
        <ProgressBar value={75} />
        <div className="text-xs font-body text-gray-500 italic mt-1">
          aria-label: "Progress: 75%"
        </div>
      </div>

      <div>
        <div className="text-sm font-body text-gray-600 mb-2">
          Custom ARIA label (descriptive context)
        </div>
        <ProgressBar value={60} aria-label="Workout completion: 3 of 5 exercises" />
        <div className="text-xs font-body text-gray-500 italic mt-1">
          aria-label: "Workout completion: 3 of 5 exercises"
        </div>
      </div>

      <div>
        <div className="text-sm font-body text-gray-600 mb-2">
          With visible label for all users
        </div>
        <ProgressBar value={85} showLabel aria-label="Recovery timeline" />
        <div className="text-xs font-body text-gray-500 italic mt-1">
          Combines ARIA attributes with visual percentage
        </div>
      </div>
    </div>
  ),
};

/**
 * Edge cases: negative values, values >100, NaN, decimal values.
 *
 * **Value Handling:**
 * - Negative values clamped to 0
 * - Values >100 clamped to 100
 * - NaN/undefined treated as 0
 * - Decimal values rounded to nearest integer
 */
export const EdgeCases: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div>
        <div className="text-sm font-body text-gray-600 mb-2">
          Negative value (-10) → Clamped to 0
        </div>
        <ProgressBar value={-10} showLabel />
      </div>

      <div>
        <div className="text-sm font-body text-gray-600 mb-2">
          Value &gt;100 (150) → Clamped to 100
        </div>
        <ProgressBar value={150} showLabel />
      </div>

      <div>
        <div className="text-sm font-body text-gray-600 mb-2">
          NaN value → Treated as 0
        </div>
        <ProgressBar value={NaN} showLabel />
      </div>

      <div>
        <div className="text-sm font-body text-gray-600 mb-2">
          Decimal value (42.7) → Rounded to 43
        </div>
        <ProgressBar value={42.7} showLabel />
      </div>
    </div>
  ),
};

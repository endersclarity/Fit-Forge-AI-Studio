/**
 * FAB Component Stories
 *
 * Storybook documentation for the Floating Action Button (FAB) component.
 * Demonstrates various states, icons, and usage patterns.
 */

import type { Meta, StoryObj } from '@storybook/react';
import FAB from './FAB';

const meta: Meta<typeof FAB> = {
  title: 'Design System/Patterns/FAB',
  component: FAB,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# FAB (Floating Action Button)

Primary action button positioned in thumb-friendly zone (bottom-right).
Uses spring animation for entrance and interactive states.

## Specifications
- **Size:** 64×64px
- **Shadow:** 0 4px 16px rgba(117,138,198,0.4)
- **Position:** Fixed bottom-6 right-6
- **Animation:** Spring physics (stiffness: 300, damping: 20)

## States
- **Hover:** Scale 1.05
- **Active:** Scale 0.95
- **Disabled:** Opacity 50%

## Usage
Use FAB for the single most important action on a screen (e.g., "Add Workout", "Quick Add Exercise").
Positioned for easy thumb reach on mobile devices.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'text',
      description: 'Material Symbol icon name',
    },
    label: {
      control: 'text',
      description: 'Accessibility label',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FAB>;

/**
 * Default FAB with "add" icon
 */
export const Default: Story = {
  args: {
    icon: 'add',
    label: 'Add item',
    disabled: false,
  },
  render: (args) => (
    <div className="h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-md mx-auto bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">FAB Example</h2>
        <p className="text-primary-medium">
          Scroll down to see the FAB positioned in the bottom-right corner (thumb zone).
        </p>
        <div className="mt-8 space-y-4">
          <div className="h-32 bg-gray-100 rounded-lg"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
      <FAB {...args} />
    </div>
  ),
};

/**
 * Fitness-themed FAB for adding workouts
 */
export const AddWorkout: Story = {
  args: {
    icon: 'fitness_center',
    label: 'Add workout',
    disabled: false,
  },
  render: (args) => (
    <div className="h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-md mx-auto bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">Workout Dashboard</h2>
        <p className="text-primary-medium mb-4">Quick add a new workout using the FAB.</p>
        <div className="space-y-3">
          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-semibold">Last Workout</h3>
            <p className="text-sm text-primary-medium">Push Day - 3 exercises</p>
          </div>
          <div className="p-4 bg-white/60 rounded-lg">
            <h3 className="font-semibold">Recovery Status</h3>
            <p className="text-sm text-primary-medium">Ready to train</p>
          </div>
        </div>
      </div>
      <FAB {...args} />
    </div>
  ),
};

/**
 * Edit action FAB
 */
export const Edit: Story = {
  args: {
    icon: 'edit',
    label: 'Edit profile',
    disabled: false,
  },
  render: (args) => (
    <div className="h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-md mx-auto bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">User Profile</h2>
        <div className="space-y-2">
          <p><strong>Name:</strong> Alex Johnson</p>
          <p><strong>Experience:</strong> Intermediate</p>
          <p><strong>Equipment:</strong> Barbell, Dumbbells</p>
        </div>
      </div>
      <FAB {...args} />
    </div>
  ),
};

/**
 * Disabled state - FAB cannot be interacted with
 */
export const Disabled: Story = {
  args: {
    icon: 'add',
    label: 'Add item (disabled)',
    disabled: true,
  },
  render: (args) => (
    <div className="h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-md mx-auto bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">Disabled FAB</h2>
        <p className="text-primary-medium">
          FAB is disabled when the action is not available (e.g., during loading, or when prerequisites aren't met).
        </p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">⚠️ Complete onboarding to enable quick add</p>
        </div>
      </div>
      <FAB {...args} />
    </div>
  ),
};

/**
 * Multiple icon options showcase
 */
export const IconShowcase: Story = {
  render: () => (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-primary-dark mb-6">FAB Icon Options</h2>
        <p className="text-primary-medium mb-8">
          Common Material Symbol icons for FAB actions. Click each to see the interaction.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: 'add', label: 'Add', desc: 'Generic add action' },
            { icon: 'fitness_center', label: 'Workout', desc: 'Add workout' },
            { icon: 'edit', label: 'Edit', desc: 'Edit mode' },
            { icon: 'favorite', label: 'Favorite', desc: 'Add to favorites' },
            { icon: 'search', label: 'Search', desc: 'Quick search' },
            { icon: 'play_arrow', label: 'Start', desc: 'Start workout' },
          ].map(({ icon, label, desc }) => (
            <div
              key={icon}
              className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-300/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                <span className="font-semibold text-primary-dark">{label}</span>
              </div>
              <p className="text-sm text-primary-medium">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * Animation Demo - Shows entrance animation on mount
 */
export const AnimationDemo: Story = {
  args: {
    icon: 'add',
    label: 'Add item',
    disabled: false,
  },
  render: (args) => (
    <div className="h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-md mx-auto bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">Spring Animation Demo</h2>
        <p className="text-primary-medium mb-4">
          The FAB animates in with spring physics on mount. Hover and click to see scale transitions.
        </p>
        <ul className="space-y-2 text-sm text-primary-medium">
          <li>✨ <strong>Entrance:</strong> Scale 0 → 1 (spring: stiffness 300, damping 20)</li>
          <li>🖱️ <strong>Hover:</strong> Scale 1.05 (spring: stiffness 400, damping 10)</li>
          <li>👆 <strong>Active:</strong> Scale 0.95</li>
        </ul>
      </div>
      <FAB {...args} />
    </div>
  ),
};

/**
 * Sheet Component - Storybook Stories
 *
 * Interactive documentation and visual testing for the Sheet component.
 * Demonstrates height variants, interactive states, and accessibility.
 *
 * Reference: Epic 5 Story 3 AC6 - Storybook stories for components
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Sheet from './Sheet';

/**
 * Sheet component (Vaul wrapper) for bottom drawer/sheet.
 * Provides accessible sheet with configurable heights.
 */
const meta = {
  title: 'Design System/Primitives/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether sheet is open',
    },
    height: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Sheet height (40vh, 60vh, 90vh)',
    },
    title: {
      control: 'text',
      description: 'Sheet title',
    },
    description: {
      control: 'text',
      description: 'Sheet description',
    },
    showHandle: {
      control: 'boolean',
      description: 'Show draggable handle',
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// Controller wrapper for interactive stories
const SheetStoryWrapper = ({
  height = 'md',
  title,
  description,
  children,
}: {
  height?: 'sm' | 'md' | 'lg';
  title?: string;
  description?: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary text-white px-6 py-3 font-medium transition-all hover:brightness-110"
      >
        Open Sheet
      </button>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        height={height}
        title={title}
        description={description}
      >
        {children}
      </Sheet>
    </div>
  );
};

// Default
export const Default: Story = {
  render: () => (
    <SheetStoryWrapper>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Sheet Content</h3>
        <p className="text-gray-600">
          This is a default sheet with medium height (60vh).
        </p>
      </div>
    </SheetStoryWrapper>
  ),
};

// Height Variants
export const SmallHeight: Story = {
  render: () => (
    <SheetStoryWrapper height="sm">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Small Sheet</h3>
        <p className="text-gray-600">
          40vh height - for quick actions and notifications
        </p>
      </div>
    </SheetStoryWrapper>
  ),
};

export const MediumHeight: Story = {
  render: () => (
    <SheetStoryWrapper height="md">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Medium Sheet</h3>
        <p className="text-gray-600">
          60vh height - default, suitable for most content
        </p>
      </div>
    </SheetStoryWrapper>
  ),
};

export const LargeHeight: Story = {
  render: () => (
    <SheetStoryWrapper height="lg">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Large Sheet</h3>
        <p className="text-gray-600">
          90vh height - nearly full screen for complex forms
        </p>
      </div>
    </SheetStoryWrapper>
  ),
};

// With Title
export const WithTitle: Story = {
  render: () => (
    <SheetStoryWrapper title="Select Exercise">
      <div className="space-y-4">
        <p className="text-gray-600">Choose your exercise:</p>
        <div className="space-y-2">
          {['Bench Press', 'Squats', 'Deadlift', 'Overhead Press'].map((ex) => (
            <button
              key={ex}
              className="w-full text-left rounded-lg px-4 py-2 transition-all hover:bg-gray-100"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </SheetStoryWrapper>
  ),
};

// With Title and Description
export const WithTitleAndDescription: Story = {
  render: () => (
    <SheetStoryWrapper
      title="Add Workout"
      description="Create a new workout session"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exercise Name
          </label>
          <input
            type="text"
            placeholder="Enter exercise name"
            className="w-full rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sets
          </label>
          <input
            type="number"
            placeholder="4"
            className="w-full rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 px-4 py-2"
          />
        </div>
      </div>
    </SheetStoryWrapper>
  ),
};

// Form Content
export const WithForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      exercise: '',
      sets: '',
      reps: '',
      weight: '',
    });

    return (
      <SheetStoryWrapper
        title="Log Exercise"
        description="Record your exercise performance"
        height="md"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercise
            </label>
            <select
              value={formData.exercise}
              onChange={(e) =>
                setFormData({ ...formData, exercise: e.target.value })
              }
              className="w-full rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 px-4 py-2"
            >
              <option value="">Select exercise</option>
              <option value="bench">Bench Press</option>
              <option value="squat">Squat</option>
              <option value="deadlift">Deadlift</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sets
              </label>
              <input
                type="number"
                value={formData.sets}
                onChange={(e) =>
                  setFormData({ ...formData, sets: e.target.value })
                }
                placeholder="4"
                className="w-full rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reps
              </label>
              <input
                type="number"
                value={formData.reps}
                onChange={(e) =>
                  setFormData({ ...formData, reps: e.target.value })
                }
                placeholder="8"
                className="w-full rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                placeholder="lbs"
                className="w-full rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary text-white px-4 py-2 font-medium transition-all hover:brightness-110"
          >
            Save Exercise
          </button>
        </form>
      </SheetStoryWrapper>
    );
  },
};

export const SpringAnimation: Story = {
  render: () => (
    <SheetStoryWrapper title="Animated Sheet" description="Framer Motion spring variants now power the Vaul sheet.">
      <div className="space-y-3">
        <p className="text-gray-600">
          This story highlights the shared spring settings used for sheets/modals. Toggle
          the sheet repeatedly to inspect entry/exit motion and reduced-motion support.
        </p>
        <div className="rounded-lg bg-gray-100/80 p-4 text-sm text-gray-700">
          Motion is controlled by <code>MotionProvider</code> and can be disabled via{' '}
          <code>VITE_ANIMATIONS_ENABLED</code> or the OS reduced-motion setting.
        </div>
      </div>
    </SheetStoryWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the shared spring + overlay fade variants applied to all sheets.',
      },
    },
  },
};

// Scrollable Content
export const WithScrollableContent: Story = {
  render: () => (
    <SheetStoryWrapper title="Available Exercises" height="md">
      <div className="space-y-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100 cursor-pointer"
          >
            <h4 className="font-medium text-gray-900">Exercise {i + 1}</h4>
            <p className="text-sm text-gray-600">
              Muscle group and difficulty info
            </p>
          </div>
        ))}
      </div>
    </SheetStoryWrapper>
  ),
};

// Multiple Sheets
export const MultipleSheets: Story = {
  render: () => {
    const [sheets, setSheets] = useState<{ [key: string]: boolean }>({});

    const openSheet = (name: string) => {
      setSheets({ ...sheets, [name]: true });
    };

    const closeSheet = (name: string) => {
      setSheets({ ...sheets, [name]: false });
    };

    return (
      <div className="space-y-4">
        <button
          onClick={() => openSheet('exercises')}
          className="rounded-lg bg-primary text-white px-6 py-3 font-medium"
        >
          Open Exercises Sheet
        </button>

        <button
          onClick={() => openSheet('workouts')}
          className="rounded-lg bg-secondary text-white px-6 py-3 font-medium"
        >
          Open Workouts Sheet
        </button>

        <Sheet
          open={sheets['exercises'] || false}
          onOpenChange={(open) => closeSheet('exercises')}
          title="Select Exercise"
          height="md"
        >
          <p>Exercise selection content</p>
        </Sheet>

        <Sheet
          open={sheets['workouts'] || false}
          onOpenChange={(open) => closeSheet('workouts')}
          title="Select Workout"
          height="md"
        >
          <p>Workout selection content</p>
        </Sheet>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

// Without Handle
export const WithoutHandle: Story = {
  render: () => (
    <SheetStoryWrapper showHandle={false}>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">No Handle</h3>
        <p className="text-gray-600">
          This sheet doesn't show the draggable handle.
        </p>
      </div>
    </SheetStoryWrapper>
  ),
};

// Rich Content
export const RichContent: Story = {
  render: () => (
    <SheetStoryWrapper
      title="Workout Summary"
      description="Review your workout performance"
      height="lg"
    >
      <div className="space-y-6">
        <div className="rounded-lg bg-badge-bg p-4">
          <h4 className="font-bold text-gray-900">Total Volume</h4>
          <p className="text-2xl font-bold text-primary mt-2">15,750 lbs</p>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-gray-900">Exercises</h4>
          {[
            { name: 'Bench Press', sets: 4, reps: 8, weight: 225 },
            { name: 'Squats', sets: 4, reps: 6, weight: 315 },
            { name: 'Deadlift', sets: 3, reps: 3, weight: 405 },
          ].map((ex) => (
            <div
              key={ex.name}
              className="rounded-lg bg-gray-50 p-3 flex justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{ex.name}</p>
                <p className="text-sm text-gray-600">
                  {ex.sets}x{ex.reps} @ {ex.weight}lbs
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {ex.sets * ex.reps * ex.weight} lbs
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SheetStoryWrapper>
  ),
};

// Accessibility Test
export const A11y: Story = {
  render: () => (
    <SheetStoryWrapper
      title="Accessible Sheet"
      description="This sheet meets WCAG AA standards"
    >
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">Content</h3>
        <button className="rounded-lg bg-primary text-white px-4 py-2">
          Action Button
        </button>
        <input
          type="text"
          placeholder="Input field"
          className="w-full rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 px-4 py-2"
        />
      </div>
    </SheetStoryWrapper>
  ),
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

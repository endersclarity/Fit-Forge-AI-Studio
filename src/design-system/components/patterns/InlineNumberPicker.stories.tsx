/**
 * Storybook Stories - InlineNumberPicker Component
 *
 * Interactive documentation for the inline number picker component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { InlineNumberPicker } from './InlineNumberPicker';

const meta = {
  title: 'Design System/Patterns/InlineNumberPicker',
  component: InlineNumberPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InlineNumberPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive story with state management
export const Interactive: Story = {
  render: () => {
    const [weight, setWeight] = useState(135);
    const [reps, setReps] = useState(10);

    return (
      <div className="space-y-6 p-8">
        <h2 className="text-2xl font-cinzel font-bold text-primary-dark">
          Inline Number Pickers
        </h2>

        <InlineNumberPicker
          label="Weight"
          value={weight}
          onChange={setWeight}
          min={0}
          max={1000}
          step={5}
          unit="lbs"
        />

        <InlineNumberPicker
          label="Reps"
          value={reps}
          onChange={setReps}
          min={1}
          max={50}
          step={1}
        />

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            Weight: {weight} lbs | Reps: {reps}
          </p>
        </div>
      </div>
    );
  },
};

// Basic weight picker
export const WeightPicker: Story = {
  args: {
    label: 'Weight',
    value: 135,
    min: 0,
    max: 1000,
    step: 5,
    unit: 'lbs',
    onChange: (value) => console.log('Weight changed:', value),
  },
};

// Reps picker
export const RepsPicker: Story = {
  args: {
    label: 'Reps',
    value: 10,
    min: 1,
    max: 50,
    step: 1,
    onChange: (value) => console.log('Reps changed:', value),
  },
};

// At minimum value
export const AtMinimum: Story = {
  args: {
    label: 'Reps',
    value: 1,
    min: 1,
    max: 50,
    step: 1,
    onChange: (value) => console.log('Reps changed:', value),
  },
};

// At maximum value
export const AtMaximum: Story = {
  args: {
    label: 'Weight',
    value: 1000,
    min: 0,
    max: 1000,
    step: 5,
    unit: 'lbs',
    onChange: (value) => console.log('Weight changed:', value),
  },
};

// Large step increment
export const LargeStepIncrement: Story = {
  args: {
    label: 'Weight',
    value: 100,
    min: 0,
    max: 500,
    step: 25, // 25 lb jumps
    unit: 'lbs',
    onChange: (value) => console.log('Weight changed:', value),
  },
};

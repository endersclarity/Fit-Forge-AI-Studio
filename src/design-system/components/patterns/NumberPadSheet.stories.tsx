/**
 * Storybook Stories - NumberPadSheet Component
 *
 * Interactive documentation for the number pad bottom sheet component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { NumberPadSheet } from './NumberPadSheet';
import { Button } from '../primitives/Button';

const meta = {
  title: 'Design System/Patterns/NumberPadSheet',
  component: NumberPadSheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NumberPadSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive story with button trigger
export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(135);

    return (
      <div className="p-8">
        <h2 className="text-2xl font-cinzel font-bold text-primary-dark mb-6">
          Number Pad Sheet
        </h2>

        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Current Value: <span className="font-bold">{value}</span></p>
          </div>

          <Button onClick={() => setOpen(true)}>
            Edit Value
          </Button>
        </div>

        <NumberPadSheet
          open={open}
          onOpenChange={setOpen}
          title="Edit Weight"
          initialValue={value}
          onSubmit={(newValue) => {
            setValue(newValue);
            setOpen(false);
          }}
          unit="lbs"
        />
      </div>
    );
  },
};

// Weight input
export const WeightInput: Story = {
  render: () => {
    const [open, setOpen] = useState(true); // Open by default in Storybook
    const [value, setValue] = useState(135);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Sheet</Button>
        <NumberPadSheet
          open={open}
          onOpenChange={setOpen}
          title="Edit Weight"
          initialValue={value}
          onSubmit={(newValue) => {
            setValue(newValue);
            setOpen(false);
          }}
          unit="lbs"
        />
      </>
    );
  },
};

// Reps input (no unit)
export const RepsInput: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState(10);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Sheet</Button>
        <NumberPadSheet
          open={open}
          onOpenChange={setOpen}
          title="Edit Reps"
          initialValue={value}
          onSubmit={(newValue) => {
            setValue(newValue);
            setOpen(false);
          }}
        />
      </>
    );
  },
};

// Starting at zero
export const StartingAtZero: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <NumberPadSheet
        open={open}
        onOpenChange={setOpen}
        title="Edit Rest Time"
        initialValue={0}
        onSubmit={(value) => console.log('Submitted:', value)}
        unit="sec"
      />
    );
  },
};

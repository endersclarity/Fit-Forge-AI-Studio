/**
 * Select Component Stories - Storybook Documentation
 *
 * Visual documentation and interactive examples for Select primitive component.
 * Shows keyboard navigation, variants, disabled states, and use cases with accessibility guidance.
 *
 * Reference: Epic 6.5 Story 1 - Railway Deployment & Missing Primitives
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Select, { SelectOption } from './Select';

const meta = {
  title: 'Design System/Primitives/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Select/Dropdown component with full keyboard navigation support (WCAG 2.1).

**Features:**
- Full keyboard navigation (Enter/Space, Arrow keys, Home/End, Escape)
- Disabled state (component and individual options)
- Optional search/filter for long lists
- Accessibility-first with ARIA roles and attributes
- Visual focus indicators
- Composable with custom styling

**Keyboard Navigation:**
- **Enter/Space**: Open dropdown
- **ArrowDown**: Move to next option
- **ArrowUp**: Move to previous option
- **Home**: Jump to first option
- **End**: Jump to last option
- **Enter**: Select focused option and close
- **Escape**: Close without selecting
- **Tab**: Close and move focus away

**Common Use Cases:**
- Equipment filters
- Exercise type selection
- Muscle group pickers
- Settings dropdowns
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    options: {
      description: 'Array of options with label/value pairs',
    },
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
    onChange: {
      description: 'Callback when selection changes',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no value selected',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the entire select is disabled',
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search/filter for long option lists',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const muscleGroupOptions: SelectOption[] = [
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back' },
  { label: 'Legs', value: 'legs' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Core', value: 'core' },
  { label: 'Arms', value: 'arms' },
];

/**
 * Default select with basic options.
 * Try clicking to open, using keyboard navigation, or clicking outside to close.
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');

    return (
      <div className="w-80">
        <Select
          options={muscleGroupOptions}
          value={value}
          onChange={setValue}
          placeholder="Select muscle group"
        />
      </div>
    );
  },
};

/**
 * Select with pre-selected value.
 */
export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState<string>('legs');

    return (
      <div className="w-80">
        <Select
          options={muscleGroupOptions}
          value={value}
          onChange={setValue}
          placeholder="Select muscle group"
        />
      </div>
    );
  },
};

/**
 * Keyboard navigation demonstration.
 *
 * **Try these keys:**
 * 1. **Tab** to focus the select
 * 2. **Enter** or **Space** to open dropdown
 * 3. **ArrowDown/ArrowUp** to navigate options
 * 4. **Home/End** to jump to first/last option
 * 5. **Enter** to select focused option
 * 6. **Escape** to close without selecting
 *
 * **Accessibility Note:** All options are keyboard-accessible.
 * Visual focus indicator shows current keyboard position.
 */
export const KeyboardNavigation: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');

    return (
      <div className="w-80 space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-body font-semibold text-blue-900 mb-2">
            Keyboard Navigation Instructions
          </div>
          <ul className="text-xs font-body text-blue-800 space-y-1">
            <li>• Tab to focus → Enter/Space to open</li>
            <li>• Arrow keys to navigate options</li>
            <li>• Home/End to jump to first/last</li>
            <li>• Enter to select → Escape to cancel</li>
          </ul>
        </div>
        <Select
          options={muscleGroupOptions}
          value={value}
          onChange={setValue}
          placeholder="Try keyboard navigation"
          aria-label="Muscle group selector with keyboard navigation"
        />
        {value && (
          <div className="text-sm font-body text-gray-600">
            Selected: <span className="font-semibold">{value}</span>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Disabled state prevents interaction.
 */
export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState<string>('chest');

    return (
      <div className="w-80">
        <Select
          options={muscleGroupOptions}
          value={value}
          onChange={setValue}
          disabled
          placeholder="Disabled select"
        />
      </div>
    );
  },
};

/**
 * Individual options can be disabled.
 * Keyboard navigation automatically skips disabled options.
 */
export const DisabledOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');

    const optionsWithDisabled: SelectOption[] = [
      { label: 'Chest', value: 'chest' },
      { label: 'Back (unavailable)', value: 'back', disabled: true },
      { label: 'Legs', value: 'legs' },
      { label: 'Shoulders (locked)', value: 'shoulders', disabled: true },
      { label: 'Core', value: 'core' },
    ];

    return (
      <div className="w-80 space-y-4">
        <div className="text-sm font-body text-gray-600">
          Some options are disabled. Try selecting them or navigating with keyboard.
        </div>
        <Select
          options={optionsWithDisabled}
          value={value}
          onChange={setValue}
          placeholder="Select available muscle group"
        />
      </div>
    );
  },
};

/**
 * Searchable select with filter capability for long lists.
 *
 * **Use Case:** Exercise databases, large equipment lists, extensive filter options.
 */
export const Searchable: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');

    const longExerciseList: SelectOption[] = [
      { label: 'Bench Press', value: 'bench-press' },
      { label: 'Squat', value: 'squat' },
      { label: 'Deadlift', value: 'deadlift' },
      { label: 'Pull-ups', value: 'pullups' },
      { label: 'Push-ups', value: 'pushups' },
      { label: 'Rows', value: 'rows' },
      { label: 'Shoulder Press', value: 'shoulder-press' },
      { label: 'Bicep Curls', value: 'bicep-curls' },
      { label: 'Tricep Dips', value: 'tricep-dips' },
      { label: 'Lunges', value: 'lunges' },
      { label: 'Planks', value: 'planks' },
      { label: 'Burpees', value: 'burpees' },
    ];

    return (
      <div className="w-80 space-y-4">
        <div className="text-sm font-body text-gray-600">
          Click to open and try typing to filter exercises (e.g., "press", "curl")
        </div>
        <Select
          options={longExerciseList}
          value={value}
          onChange={setValue}
          placeholder="Search exercises..."
          searchable
        />
        {value && (
          <div className="text-sm font-body text-gray-600">
            Selected: <span className="font-semibold">{value}</span>
          </div>
        )}
      </div>
    );
  },
};

/**
 * FitForge use cases: equipment filters, exercise selection, settings.
 */
export const FitForgeUseCases: Story = {
  render: () => {
    const [equipment, setEquipment] = useState<string>('');
    const [exerciseType, setExerciseType] = useState<string>('');
    const [difficulty, setDifficulty] = useState<string>('');

    const equipmentOptions: SelectOption[] = [
      { label: 'Barbell', value: 'barbell' },
      { label: 'Dumbbell', value: 'dumbbell' },
      { label: 'Kettlebell', value: 'kettlebell' },
      { label: 'Resistance Bands', value: 'bands' },
      { label: 'Bodyweight', value: 'bodyweight' },
    ];

    const exerciseTypeOptions: SelectOption[] = [
      { label: 'Strength', value: 'strength' },
      { label: 'Cardio', value: 'cardio' },
      { label: 'Flexibility', value: 'flexibility' },
      { label: 'Recovery', value: 'recovery' },
    ];

    const difficultyOptions: SelectOption[] = [
      { label: 'Beginner', value: 'beginner' },
      { label: 'Intermediate', value: 'intermediate' },
      { label: 'Advanced', value: 'advanced' },
    ];

    return (
      <div className="w-96 space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="text-sm font-body font-semibold text-gray-800">
            Equipment Filter
          </div>
          <Select
            options={equipmentOptions}
            value={equipment}
            onChange={setEquipment}
            placeholder="Select equipment type"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="text-sm font-body font-semibold text-gray-800">
            Exercise Type Selection
          </div>
          <Select
            options={exerciseTypeOptions}
            value={exerciseType}
            onChange={setExerciseType}
            placeholder="Choose exercise type"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="text-sm font-body font-semibold text-gray-800">
            Difficulty Settings
          </div>
          <Select
            options={difficultyOptions}
            value={difficulty}
            onChange={setDifficulty}
            placeholder="Select difficulty level"
          />
        </div>
      </div>
    );
  },
};

/**
 * Accessibility examples with ARIA attributes.
 *
 * **WCAG Guidance:**
 * - Uses role="listbox" and role="option" for semantic structure
 * - aria-selected indicates current selection
 * - aria-haspopup and aria-expanded communicate dropdown state
 * - Visual focus indicators with high contrast ring
 * - Keyboard navigation skips disabled options automatically
 * - Custom aria-label provides context for screen readers
 */
export const AccessibilityExamples: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');

    return (
      <div className="w-80 space-y-6">
        <div>
          <div className="text-sm font-body text-gray-600 mb-2">
            Custom ARIA label for context
          </div>
          <Select
            options={muscleGroupOptions}
            value={value}
            onChange={setValue}
            placeholder="Select target muscle"
            aria-label="Choose primary muscle group for workout"
          />
          <div className="text-xs font-body text-gray-500 italic mt-1">
            Screen reader announces: "Choose primary muscle group for workout"
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-body font-semibold text-blue-900 mb-2">
            Accessibility Features
          </div>
          <ul className="text-xs font-body text-blue-800 space-y-1">
            <li>✓ Semantic ARIA roles (listbox, option)</li>
            <li>✓ Keyboard-first navigation</li>
            <li>✓ Visual focus indicators (ring-2)</li>
            <li>✓ Skip disabled options automatically</li>
            <li>✓ Screen reader friendly labels</li>
          </ul>
        </div>
      </div>
    );
  },
};

/**
 * Edge cases: empty options, single option, very long lists.
 */
export const EdgeCases: Story = {
  render: () => {
    const [empty, setEmpty] = useState<string>('');
    const [single, setSingle] = useState<string>('');
    const [long, setLong] = useState<string>('');

    const emptyOptions: SelectOption[] = [];
    const singleOption: SelectOption[] = [{ label: 'Only Option', value: 'only' }];
    const longOptions: SelectOption[] = Array.from({ length: 50 }, (_, i) => ({
      label: `Option ${i + 1}`,
      value: `option-${i + 1}`,
    }));

    return (
      <div className="w-80 space-y-6">
        <div>
          <div className="text-sm font-body text-gray-600 mb-2">
            Empty options array
          </div>
          <Select
            options={emptyOptions}
            value={empty}
            onChange={setEmpty}
            placeholder="No options available"
          />
          <div className="text-xs font-body text-gray-500 italic mt-1">
            Shows "No options found" when opened
          </div>
        </div>

        <div>
          <div className="text-sm font-body text-gray-600 mb-2">
            Single option
          </div>
          <Select
            options={singleOption}
            value={single}
            onChange={setSingle}
            placeholder="Only one choice"
          />
          <div className="text-xs font-body text-gray-500 italic mt-1">
            Works correctly with only one option
          </div>
        </div>

        <div>
          <div className="text-sm font-body text-gray-600 mb-2">
            Very long list (50 options) with scrolling
          </div>
          <Select
            options={longOptions}
            value={long}
            onChange={setLong}
            placeholder="Select from many options"
            searchable
          />
          <div className="text-xs font-body text-gray-500 italic mt-1">
            Scrollable with max-height, search recommended for long lists
          </div>
        </div>
      </div>
    );
  },
};

/**
 * CollapsibleSection Component Stories
 *
 * Storybook documentation for the CollapsibleSection accordion component.
 * Demonstrates expand/collapse behavior, keyboard navigation, and usage patterns.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import CollapsibleSection from './CollapsibleSection';
import Button from '../../primitives/Button';
import Badge from '../../primitives/Badge';

const meta: Meta<typeof CollapsibleSection> = {
  title: 'Design System/Patterns/CollapsibleSection',
  component: CollapsibleSection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# CollapsibleSection (Accordion)

Accordion-style content section that expands/collapses to save screen space.
Ideal for organizing optional information, settings, and filters.

## Specifications
- **Header touch target:** 60×60px minimum (WCAG 2.1 compliant)
- **Chevron rotation:** 0° (collapsed) ’ 180° (expanded)
- **Animation:** Spring physics height transition (stiffness: 300, damping: 20)
- **States:** Collapsed (default), Expanded

## Accessibility
- **Keyboard:** Enter/Space to toggle
- **ARIA:** aria-expanded attribute on button
- **Focus:** Visible focus ring on keyboard navigation
- **Role:** Button role for header

## Usage Modes
1. **Uncontrolled:** Use defaultOpen prop for initial state
2. **Controlled:** Use isOpen + onToggle props for external state management

\`\`\`tsx
// Uncontrolled
<CollapsibleSection title="Settings" defaultOpen={false}>
  <p>Content</p>
</CollapsibleSection>

// Controlled
<CollapsibleSection title="Filters" isOpen={open} onToggle={setOpen}>
  <p>Content</p>
</CollapsibleSection>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Section header title',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Initial expanded state (uncontrolled)',
    },
    isOpen: {
      control: 'boolean',
      description: 'Current expanded state (controlled)',
    },
    onToggle: {
      action: 'toggled',
      description: 'Toggle callback',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CollapsibleSection>;

/**
 * Default collapsed state
 */
export const Default: Story = {
  args: {
    title: 'Advanced Settings',
  },
  render: (args) => (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 min-h-screen">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Collapsible Section</h2>
      <p className="text-primary-medium mb-6">
        Click the header to expand/collapse. Hover effects and smooth animations included.
      </p>
      <CollapsibleSection {...args}>
        <div className="space-y-3">
          <p className="text-sm">This content is hidden by default to save screen space.</p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm">Save</Button>
            <Button variant="ghost" size="sm">Cancel</Button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  ),
};

/**
 * Expanded by default
 */
export const DefaultOpen: Story = {
  args: {
    title: 'Workout Details',
    defaultOpen: true,
  },
  render: (args) => (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 min-h-screen">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Expanded by Default</h2>
      <CollapsibleSection {...args}>
        <div className="space-y-2">
          <p><strong>Exercise:</strong> Bench Press</p>
          <p><strong>Sets:</strong> 4 × 8 reps</p>
          <p><strong>Weight:</strong> 185 lbs</p>
          <p><strong>Rest:</strong> 90 seconds</p>
        </div>
      </CollapsibleSection>
    </div>
  ),
};

/**
 * Multiple independent sections
 */
export const MultipleSections: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 min-h-screen">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Multiple Sections</h2>
      <p className="text-primary-medium mb-6">
        Each section operates independently. Open multiple sections simultaneously.
      </p>

      <div className="space-y-4">
        <CollapsibleSection title="Personal Information">
          <div className="space-y-2">
            <p><strong>Name:</strong> Alex Johnson</p>
            <p><strong>Age:</strong> 28</p>
            <p><strong>Experience:</strong> Intermediate (2 years)</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Equipment Available">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">Barbell</Badge>
            <Badge variant="primary">Dumbbells</Badge>
            <Badge variant="primary">Bench</Badge>
            <Badge variant="primary">Pull-up Bar</Badge>
            <Badge variant="primary">Resistance Bands</Badge>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Training Preferences" defaultOpen={true}>
          <div className="space-y-2">
            <p><strong>Goal:</strong> Muscle gain</p>
            <p><strong>Frequency:</strong> 4 days/week</p>
            <p><strong>Session Duration:</strong> 60-90 minutes</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Notifications">
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Email workout reminders</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Recovery status updates</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span className="text-sm">Personal best alerts</span>
            </label>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  ),
};

/**
 * Controlled mode with external toggle
 */
const ControlledDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 min-h-screen">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Controlled Mode</h2>
      <p className="text-primary-medium mb-6">
        External buttons control the section state. Useful for programmatic control.
      </p>

      <div className="flex gap-3 mb-6">
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Expand Section
        </Button>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Collapse Section
        </Button>
        <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
          Toggle
        </Button>
      </div>

      <CollapsibleSection
        title="Controlled Section"
        isOpen={isOpen}
        onToggle={setIsOpen}
      >
        <div className="space-y-3">
          <p>This section is controlled by external buttons.</p>
          <p className="text-sm text-primary-medium">
            State: <Badge variant={isOpen ? 'success' : 'info'}>
              {isOpen ? 'Expanded' : 'Collapsed'}
            </Badge>
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export const ControlledMode: Story = {
  render: () => <ControlledDemo />,
};

/**
 * Rich content example
 */
export const RichContent: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 min-h-screen">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Rich Content</h2>
      <p className="text-primary-medium mb-6">
        Collapsible sections can contain any content: forms, lists, cards, etc.
      </p>

      <div className="space-y-4">
        <CollapsibleSection title="Exercise Library (12 exercises)">
          <div className="space-y-3">
            <div className="p-3 bg-white/60 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">Bench Press</p>
                <p className="text-sm text-primary-medium">Chest, Triceps</p>
              </div>
              <Badge variant="primary">Compound</Badge>
            </div>
            <div className="p-3 bg-white/60 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">Squat</p>
                <p className="text-sm text-primary-medium">Legs, Core</p>
              </div>
              <Badge variant="primary">Compound</Badge>
            </div>
            <div className="p-3 bg-white/60 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">Deadlift</p>
                <p className="text-sm text-primary-medium">Back, Legs</p>
              </div>
              <Badge variant="primary">Compound</Badge>
            </div>
            <Button variant="ghost" size="sm">
              View All Exercises
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Recent Workouts">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mon, Nov 11</span>
              <Badge variant="success">Completed</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fri, Nov 8</span>
              <Badge variant="success">Completed</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Wed, Nov 6</span>
              <Badge variant="warning">Partial</Badge>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Progress Chart">
          <div className="bg-white/60 rounded-lg p-4 h-48 flex items-center justify-center">
            <p className="text-primary-medium text-sm">
              [Chart visualization would go here]
            </p>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  ),
};

/**
 * Nested sections example
 */
export const NestedSections: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 min-h-screen">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Nested Sections</h2>
      <p className="text-primary-medium mb-6">
        Sections can be nested for hierarchical content organization.
      </p>

      <CollapsibleSection title="Workout Programs" defaultOpen={true}>
        <div className="space-y-3">
          <p className="text-sm text-primary-medium mb-3">
            Available training programs for your fitness goals
          </p>

          <CollapsibleSection title="Beginner Programs">
            <ul className="space-y-1 text-sm">
              <li>" Full Body Basics (3 days/week)</li>
              <li>" Starting Strength (3 days/week)</li>
              <li>" Bodyweight Fundamentals (4 days/week)</li>
            </ul>
          </CollapsibleSection>

          <CollapsibleSection title="Intermediate Programs">
            <ul className="space-y-1 text-sm">
              <li>" Push/Pull/Legs (6 days/week)</li>
              <li>" Upper/Lower Split (4 days/week)</li>
              <li>" 5/3/1 Progression (4 days/week)</li>
            </ul>
          </CollapsibleSection>

          <CollapsibleSection title="Advanced Programs">
            <ul className="space-y-1 text-sm">
              <li>" Powerlifting Cycle (5 days/week)</li>
              <li>" Hypertrophy Focus (6 days/week)</li>
              <li>" Olympic Weightlifting (4 days/week)</li>
            </ul>
          </CollapsibleSection>
        </div>
      </CollapsibleSection>
    </div>
  ),
};

/**
 * Keyboard navigation demo
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 min-h-screen">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Keyboard Navigation</h2>
      <p className="text-primary-medium mb-6">
        Full keyboard support for accessibility.
      </p>

      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50 mb-6">
        <h3 className="font-semibold text-primary-dark mb-3">Keyboard Shortcuts:</h3>
        <ul className="space-y-2 text-sm text-primary-medium">
          <li>=9 <strong>Tab:</strong> Focus section header</li>
          <li>=9 <strong>Enter / Space:</strong> Toggle expand/collapse</li>
          <li>=9 <strong>Escape:</strong> (No effect - preserves state)</li>
        </ul>
      </div>

      <div className="space-y-4">
        <CollapsibleSection title="Section 1">
          <p>Press Tab to focus this section, then Enter or Space to toggle.</p>
        </CollapsibleSection>
        <CollapsibleSection title="Section 2">
          <p>Navigate between sections using Tab/Shift+Tab.</p>
        </CollapsibleSection>
        <CollapsibleSection title="Section 3">
          <p>All interactive elements are keyboard accessible.</p>
        </CollapsibleSection>
      </div>
    </div>
  ),
};

/**
 * Accessibility features showcase
 */
export const Accessibility: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 min-h-screen">
      <h2 className="text-2xl font-bold text-primary-dark mb-6">Accessibility Features</h2>

      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50 mb-6">
        <h3 className="font-semibold text-primary-dark mb-3">WCAG 2.1 Compliance:</h3>
        <ul className="space-y-2 text-sm text-primary-medium">
          <li> <strong>ARIA attributes:</strong> aria-expanded, aria-label</li>
          <li><¯ <strong>Touch targets:</strong> Header is 60×60px minimum</li>
          <li>( <strong>Keyboard:</strong> Enter/Space toggle, Tab navigation</li>
          <li>=A <strong>Focus visible:</strong> Clear focus ring outline</li>
          <li><÷ <strong>Button role:</strong> Semantic HTML button element</li>
          <li>=ñ <strong>Responsive:</strong> Touch-friendly on all devices</li>
        </ul>
      </div>

      <div className="space-y-4">
        <CollapsibleSection title="Accessible Section 1">
          <p>All sections include proper ARIA attributes for screen readers.</p>
        </CollapsibleSection>
        <CollapsibleSection title="Accessible Section 2" defaultOpen={true}>
          <p>Focus rings are visible for keyboard users.</p>
        </CollapsibleSection>
        <CollapsibleSection title="Accessible Section 3">
          <p>Touch targets meet WCAG 2.1 Level AA requirements (60×60px).</p>
        </CollapsibleSection>
      </div>
    </div>
  ),
};

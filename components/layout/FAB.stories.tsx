import type { Meta, StoryObj } from '@storybook/react-vite';
import { FAB } from './FAB';

const meta = {
  title: 'Layout/FAB',
  component: FAB,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof FAB>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: 'add',
    label: 'Add new item',
    onClick: () => console.log('FAB clicked'),
  },
};

export const AddIcon: Story = {
  args: {
    icon: 'add',
    label: 'Add workout',
    onClick: () => console.log('Add workout'),
  },
};

export const PlayIcon: Story = {
  args: {
    icon: 'play_arrow',
    label: 'Start workout',
    onClick: () => console.log('Start workout'),
  },
};

export const EditIcon: Story = {
  args: {
    icon: 'edit',
    label: 'Edit item',
    onClick: () => console.log('Edit item'),
  },
};

export const CheckIcon: Story = {
  args: {
    icon: 'check',
    label: 'Complete',
    onClick: () => console.log('Complete'),
  },
};

export const Disabled: Story = {
  args: {
    icon: 'add',
    label: 'Add new item',
    onClick: () => console.log('This should not fire'),
    disabled: true,
  },
};

export const InContext: Story = {
  render: (args) => (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="text-white space-y-4">
        <h2 className="text-2xl font-bold">Recovery Dashboard</h2>
        <p className="text-gray-400">
          The FAB (Floating Action Button) is positioned in the bottom right corner.
        </p>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="p-4 bg-card-background rounded-lg">
            Content block {i + 1}
          </div>
        ))}
      </div>
      <FAB {...args} />
    </div>
  ),
  args: {
    icon: 'add',
    label: 'Quick add exercise',
    onClick: () => alert('Quick add exercise dialog would open here'),
  },
};

export const WithBottomNav: Story = {
  render: (args) => (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="text-white space-y-4">
        <h2 className="text-2xl font-bold">With Bottom Navigation</h2>
        <p className="text-gray-400">
          The FAB is positioned above the bottom navigation bar (bottom-24 to account for the nav).
        </p>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="p-4 bg-card-background rounded-lg">
            Content block {i + 1}
          </div>
        ))}
      </div>
      <FAB {...args} />
      <div className="fixed bottom-0 left-0 right-0 bg-card-background border-t border-white/10 h-16 flex items-center justify-center text-gray-400">
        Bottom Navigation Placeholder
      </div>
    </div>
  ),
  args: {
    icon: 'fitness_center',
    label: 'Start workout',
    onClick: () => alert('Starting workout...'),
  },
};

export const AllIcons: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 min-h-screen bg-background">
      <div className="relative h-64 bg-card-background rounded-lg">
        <div className="text-white p-4">Add Icon</div>
        <FAB icon="add" label="Add" onClick={() => console.log('Add')} />
      </div>
      <div className="relative h-64 bg-card-background rounded-lg">
        <div className="text-white p-4">Play Icon</div>
        <FAB icon="play_arrow" label="Play" onClick={() => console.log('Play')} />
      </div>
      <div className="relative h-64 bg-card-background rounded-lg">
        <div className="text-white p-4">Edit Icon</div>
        <FAB icon="edit" label="Edit" onClick={() => console.log('Edit')} />
      </div>
      <div className="relative h-64 bg-card-background rounded-lg">
        <div className="text-white p-4">Check Icon</div>
        <FAB icon="check" label="Check" onClick={() => console.log('Check')} />
      </div>
      <div className="relative h-64 bg-card-background rounded-lg">
        <div className="text-white p-4">Fitness Icon</div>
        <FAB icon="fitness_center" label="Fitness" onClick={() => console.log('Fitness')} />
      </div>
      <div className="relative h-64 bg-card-background rounded-lg">
        <div className="text-white p-4">Disabled</div>
        <FAB icon="add" label="Disabled" onClick={() => console.log('Disabled')} disabled />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

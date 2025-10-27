import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BottomNav, NavRoute } from './BottomNav';

const meta = {
  title: 'Layout/BottomNav',
  component: BottomNav,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    activeRoute: {
      control: 'select',
      options: ['dashboard', 'workout', 'history', 'exercises', 'settings'],
    },
  },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DashboardActive: Story = {
  args: {
    activeRoute: 'dashboard',
    onNavigate: (route) => console.log('Navigate to:', route),
  },
};

export const WorkoutActive: Story = {
  args: {
    activeRoute: 'workout',
    onNavigate: (route) => console.log('Navigate to:', route),
  },
};

export const HistoryActive: Story = {
  args: {
    activeRoute: 'history',
    onNavigate: (route) => console.log('Navigate to:', route),
  },
};

export const ExercisesActive: Story = {
  args: {
    activeRoute: 'exercises',
    onNavigate: (route) => console.log('Navigate to:', route),
  },
};

export const SettingsActive: Story = {
  args: {
    activeRoute: 'settings',
    onNavigate: (route) => console.log('Navigate to:', route),
  },
};

export const Interactive: Story = {
  render: () => {
    const [activeRoute, setActiveRoute] = useState<NavRoute>('dashboard');

    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-bold">Current Route: {activeRoute}</h2>
            <p className="text-gray-400">
              Click the navigation items to change the active route.
            </p>
            <div className="p-4 bg-card-background rounded-lg">
              <p>Content for {activeRoute} page would appear here</p>
            </div>
          </div>
        </div>
        <BottomNav activeRoute={activeRoute} onNavigate={setActiveRoute} />
      </div>
    );
  },
};

export const WithContent: Story = {
  render: () => {
    const [activeRoute, setActiveRoute] = useState<NavRoute>('dashboard');

    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-bold">Page Content</h2>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="p-4 bg-card-background rounded-lg">
                Content block {i + 1}
              </div>
            ))}
          </div>
        </div>
        <BottomNav activeRoute={activeRoute} onNavigate={setActiveRoute} />
      </div>
    );
  },
};

export const AllRoutes: Story = {
  render: () => {
    const routes: NavRoute[] = ['dashboard', 'workout', 'history', 'exercises', 'settings'];

    return (
      <div className="space-y-4 pb-20">
        {routes.map((route) => (
          <div key={route}>
            <div className="text-white text-sm mb-2 px-4">{route}:</div>
            <BottomNav activeRoute={route} onNavigate={(r) => console.log('Navigate to:', r)} />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

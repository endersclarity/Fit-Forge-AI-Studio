import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecoveryDashboard } from './RecoveryDashboard';

const meta = {
  title: 'Screens/RecoveryDashboard',
  component: RecoveryDashboard,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RecoveryDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'The complete Recovery Dashboard with all features integrated. This includes muscle recovery heat map, exercise recommendations, category filtering, and full navigation.',
      },
    },
  },
};

export const FullView: Story = {
  render: () => <RecoveryDashboard />,
  parameters: {
    docs: {
      description: {
        story: 'Full-screen view of the Recovery Dashboard showing the complete user experience with live data from hooks.',
      },
    },
  },
};

export const InteractiveFeatures: Story = {
  render: () => <RecoveryDashboard />,
  parameters: {
    docs: {
      description: {
        story: 'Test all interactive features:\n- Click muscle cards to view details\n- Click exercise cards to see more info\n- Use category tabs to filter recommendations\n- Navigate using bottom nav\n- Click FAB to start workout\n- Click settings in top nav',
      },
    },
  },
};

export const MobileView: Story = {
  render: () => <RecoveryDashboard />,
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
    docs: {
      description: {
        story: 'Mobile view (375px width) showing responsive layout and touch-friendly interactions.',
      },
    },
  },
};

export const TabletView: Story = {
  render: () => <RecoveryDashboard />,
  parameters: {
    viewport: {
      defaultViewport: 'ipad',
    },
    docs: {
      description: {
        story: 'Tablet view (768px width) showing how the dashboard adapts to medium-sized screens.',
      },
    },
  },
};

export const AccessibilityShowcase: Story = {
  render: () => <RecoveryDashboard />,
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
    docs: {
      description: {
        story: 'Accessibility features:\n- ARIA landmarks and labels\n- Keyboard navigation (Tab, Enter, Space, ESC)\n- Screen reader announcements\n- Focus indicators\n- Semantic HTML\n- WCAG AAA color contrast',
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  render: () => <RecoveryDashboard />,
  parameters: {
    docs: {
      description: {
        story: 'Test keyboard navigation:\n- Tab through all interactive elements\n- Enter/Space to activate buttons\n- Arrow keys for category tabs\n- Focus visible on all elements',
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => <RecoveryDashboard />,
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Dark mode theme (default) with proper contrast and readability.',
      },
    },
  },
};

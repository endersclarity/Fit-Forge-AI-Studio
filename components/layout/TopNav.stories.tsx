import type { Meta, StoryObj } from '@storybook/react-vite';
import { TopNav } from './TopNav';

const meta = {
  title: 'Layout/TopNav',
  component: TopNav,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TopNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSettingsClick: () => console.log('Settings clicked'),
  },
};

export const WithContent: Story = {
  render: (args) => (
    <div className="min-h-screen bg-background">
      <TopNav {...args} />
      <div className="p-4">
        <div className="text-white space-y-4">
          <h2 className="text-2xl font-bold">Page Content</h2>
          <p className="text-gray-400">
            The TopNav is sticky and will remain at the top as you scroll.
          </p>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-4 bg-card-background rounded-lg">
              Content block {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  args: {
    onSettingsClick: () => console.log('Settings clicked'),
  },
};

export const StickyBehavior: Story = {
  render: (args) => (
    <div className="min-h-[200vh] bg-background">
      <TopNav {...args} />
      <div className="p-4">
        <div className="text-white space-y-4">
          <h2 className="text-2xl font-bold">Scroll Down</h2>
          <p className="text-gray-400">
            The navigation bar will stay fixed at the top as you scroll down the page.
          </p>
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} className="p-4 bg-card-background rounded-lg">
              Scroll content {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  args: {
    onSettingsClick: () => alert('Settings clicked!'),
  },
};

export const Interactive: Story = {
  render: (args) => (
    <div className="bg-background p-4">
      <TopNav {...args} />
      <div className="mt-4 p-4 bg-card-background rounded-lg text-white">
        <p>Click the settings icon to test the interaction</p>
      </div>
    </div>
  ),
  args: {
    onSettingsClick: () => alert('Settings menu would open here'),
  },
};

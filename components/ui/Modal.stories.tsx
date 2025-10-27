import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
          <div className="text-white">
            <p className="mb-4">This is the modal content. You can put any content here.</p>
            <p className="text-gray-400">Click outside, press ESC, or click the close button to dismiss.</p>
          </div>
        </Modal>
      </>
    );
  },
};

export const WithForm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Form Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="User Settings">
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

export const WithLongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Long Content Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Terms and Conditions">
          <div className="text-white space-y-4 max-h-96 overflow-y-auto">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Decline
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Accept
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

export const ConfirmationDialog: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="primary" onClick={() => setIsOpen(true)}>Delete Item</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm Deletion">
          <div className="text-white space-y-4">
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  console.log('Item deleted');
                  setIsOpen(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

export const AlwaysOpen: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close attempted'),
    title: 'Always Open Modal',
    children: (
      <div className="text-white">
        <p className="mb-4">This modal is always open for demonstration purposes.</p>
        <p className="text-gray-400 text-sm">
          In Storybook, you can interact with it to test keyboard navigation, focus trap, and accessibility features.
        </p>
      </div>
    ),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

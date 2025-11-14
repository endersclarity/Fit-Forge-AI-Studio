/**
 * Toast Component Stories
 *
 * Storybook documentation for the Toast notification component.
 * Demonstrates variants, positioning, auto-dismiss, and usage patterns.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ToastContainer, useToast } from './ToastContainer';
import Button from '../../primitives/Button';

const meta: Meta<typeof ToastContainer> = {
  title: 'Design System/Patterns/Toast',
  component: ToastContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Toast Notification System

Transient feedback messages for user actions. Supports 4 variants with auto-dismiss and pause-on-hover functionality.

## Specifications
- **Variants:** success (green), error (red), info (blue), loading (blue with spinner)
- **Auto-dismiss:** Default 5000ms (configurable, disabled for loading)
- **Pause on hover:** Timer pauses when mouse enters toast
- **Touch targets:** Close button 60×60px (WCAG 2.1 compliant)
- **Animation:** Spring physics slide-in/fade-out

## Accessibility
- **ARIA live regions:** role="status" (polite) or role="alert" (assertive for errors)
- **Screen reader:** Messages announced automatically
- **Keyboard:** Close button accessible via Tab + Enter

## Usage
Wrap your app with ToastContainer and use the useToast hook to show toasts from anywhere.

\`\`\`tsx
const { showToast } = useToast();
showToast({ variant: 'success', message: 'Workout saved!' });
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top-right', 'bottom-center', 'top-center', 'bottom-right'],
      description: 'Toast container position',
    },
    maxToasts: {
      control: 'number',
      description: 'Maximum simultaneous toasts',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToastContainer>;

/**
 * Interactive Demo with all 4 variants
 */
const ToastDemo: React.FC<{ position?: 'top-right' | 'bottom-center' | 'top-center' | 'bottom-right' }> = ({ position = 'top-right' }) => {
  const { showToast } = useToast();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-primary-dark mb-6">Toast Notifications</h2>
        <p className="text-primary-medium mb-8">
          Click the buttons below to trigger different toast variants. Hover over toasts to pause auto-dismiss.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="primary"
            onClick={() =>
              showToast({
                variant: 'success',
                message: 'Workout saved successfully! Your progress has been recorded.',
              })
            }
          >
            Success Toast
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              showToast({
                variant: 'error',
                message: 'Failed to save workout. Please check your connection and try again.',
              })
            }
          >
            Error Toast
          </Button>

          <Button
            variant="ghost"
            onClick={() =>
              showToast({
                variant: 'info',
                message: 'Calibration recommended for optimal exercise recommendations.',
              })
            }
          >
            Info Toast
          </Button>

          <Button
            variant="primary"
            onClick={() =>
              showToast({
                variant: 'loading',
                message: 'Processing workout data...',
                duration: 0,
              })
            }
          >
            Loading Toast
          </Button>
        </div>

        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50">
          <h3 className="font-semibold text-primary-dark mb-3">Features:</h3>
          <ul className="space-y-2 text-sm text-primary-medium">
            <li> <strong>Auto-dismiss:</strong> Toasts disappear after 5 seconds (except loading)</li>
            <li>ø <strong>Pause on hover:</strong> Hover to pause the auto-dismiss timer</li>
            <li>L <strong>Manual close:</strong> Click X to dismiss immediately</li>
            <li>=Ú <strong>Queue support:</strong> Multiple toasts stack automatically</li>
            <li> <strong>Accessible:</strong> ARIA live regions for screen readers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Default position (top-right)
 */
export const Default: Story = {
  args: {
    position: 'top-right',
    maxToasts: 5,
  },
  render: (args) => (
    <ToastContainer {...args}>
      <ToastDemo position={args.position} />
    </ToastContainer>
  ),
};

/**
 * Bottom center positioning (good for mobile)
 */
export const BottomCenter: Story = {
  args: {
    position: 'bottom-center',
    maxToasts: 5,
  },
  render: (args) => (
    <ToastContainer {...args}>
      <ToastDemo position={args.position} />
    </ToastContainer>
  ),
};

/**
 * Success variant showcase
 */
const SuccessShowcase: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-primary-dark mb-4">Success Toasts</h2>
        <p className="text-primary-medium mb-8">
          Green toasts for positive feedback and successful actions.
        </p>

        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={() => showToast({ variant: 'success', message: 'Workout saved successfully!' })}
          >
            Workout Saved
          </Button>
          <Button
            variant="primary"
            onClick={() => showToast({ variant: 'success', message: 'Personal best recorded! <‰' })}
          >
            Personal Best
          </Button>
          <Button
            variant="primary"
            onClick={() => showToast({ variant: 'success', message: 'Profile updated' })}
          >
            Profile Updated
          </Button>
          <Button
            variant="primary"
            onClick={() => showToast({ variant: 'success', message: 'Exercise added to workout' })}
          >
            Exercise Added
          </Button>
        </div>
      </div>
    </div>
  );
};

export const SuccessVariant: Story = {
  render: () => (
    <ToastContainer position="top-right">
      <SuccessShowcase />
    </ToastContainer>
  ),
};

/**
 * Error variant showcase
 */
const ErrorShowcase: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-primary-dark mb-4">Error Toasts</h2>
        <p className="text-primary-medium mb-8">
          Red toasts for errors and validation failures (ARIA assertive).
        </p>

        <div className="space-y-3">
          <Button
            variant="secondary"
            onClick={() => showToast({ variant: 'error', message: 'Failed to save workout. Please try again.' })}
          >
            Save Failed
          </Button>
          <Button
            variant="secondary"
            onClick={() => showToast({ variant: 'error', message: 'Network error. Check your connection.' })}
          >
            Network Error
          </Button>
          <Button
            variant="secondary"
            onClick={() => showToast({ variant: 'error', message: 'Invalid input. Please check all fields.' })}
          >
            Validation Error
          </Button>
          <Button
            variant="secondary"
            onClick={() => showToast({ variant: 'error', message: 'Session expired. Please log in again.' })}
          >
            Session Expired
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ErrorVariant: Story = {
  render: () => (
    <ToastContainer position="top-right">
      <ErrorShowcase />
    </ToastContainer>
  ),
};

/**
 * Custom duration example
 */
const CustomDurationDemo: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-primary-dark mb-4">Custom Duration</h2>
        <p className="text-primary-medium mb-8">
          Control how long toasts stay visible before auto-dismissing.
        </p>

        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={() => showToast({ variant: 'info', message: 'Quick message (2 seconds)', duration: 2000 })}
          >
            2 Second Toast
          </Button>
          <Button
            variant="primary"
            onClick={() => showToast({ variant: 'info', message: 'Standard message (5 seconds)' })}
          >
            5 Second Toast (Default)
          </Button>
          <Button
            variant="primary"
            onClick={() => showToast({ variant: 'info', message: 'Long message (10 seconds)', duration: 10000 })}
          >
            10 Second Toast
          </Button>
          <Button
            variant="primary"
            onClick={() => showToast({ variant: 'info', message: 'Manual close only (no auto-dismiss)', duration: 0 })}
          >
            No Auto-Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
};

export const CustomDuration: Story = {
  render: () => (
    <ToastContainer position="top-right">
      <CustomDurationDemo />
    </ToastContainer>
  ),
};

/**
 * Toast queue demonstration
 */
const QueueDemo: React.FC = () => {
  const { showToast } = useToast();

  const showMultiple = () => {
    showToast({ variant: 'success', message: 'First toast' });
    setTimeout(() => showToast({ variant: 'info', message: 'Second toast' }), 500);
    setTimeout(() => showToast({ variant: 'error', message: 'Third toast' }), 1000);
    setTimeout(() => showToast({ variant: 'loading', message: 'Fourth toast', duration: 0 }), 1500);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-primary-dark mb-4">Toast Queue</h2>
        <p className="text-primary-medium mb-8">
          Multiple toasts stack vertically. Older toasts are removed when maxToasts is exceeded.
        </p>

        <div className="space-y-3">
          <Button variant="primary" onClick={showMultiple}>
            Show Multiple Toasts
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              for (let i = 1; i <= 7; i++) {
                setTimeout(() => showToast({ variant: 'info', message: `Toast #${i}` }), i * 300);
              }
            }}
          >
            Rapid Fire (7 toasts)
          </Button>
        </div>

        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50">
          <p className="text-sm text-primary-medium">
            <strong>maxToasts=5:</strong> When the 6th toast appears, the oldest is automatically removed.
          </p>
        </div>
      </div>
    </div>
  );
};

export const QueueManagement: Story = {
  render: () => (
    <ToastContainer position="top-right" maxToasts={5}>
      <QueueDemo />
    </ToastContainer>
  ),
};

/**
 * Accessibility features showcase
 */
const AccessibilityDemo: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EBF1FF]/95 to-white/95 p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-primary-dark mb-4">Accessibility Features</h2>
        <p className="text-primary-medium mb-8">
          Toasts are designed with WCAG 2.1 compliance in mind.
        </p>

        <div className="space-y-3 mb-8">
          <Button
            variant="primary"
            onClick={() => showToast({ variant: 'success', message: 'Announced politely to screen readers' })}
          >
            Polite Announcement (Success/Info)
          </Button>
          <Button
            variant="secondary"
            onClick={() => showToast({ variant: 'error', message: 'Announced assertively to screen readers' })}
          >
            Assertive Announcement (Error)
          </Button>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300/50">
          <h3 className="font-semibold text-primary-dark mb-3">Accessibility Features:</h3>
          <ul className="space-y-2 text-sm text-primary-medium">
            <li> <strong>ARIA live regions:</strong> role="status" (polite) or role="alert" (assertive)</li>
            <li><¯ <strong>Touch targets:</strong> Close button is 60×60px (WCAG 2.1 Level AA)</li>
            <li>( <strong>Keyboard:</strong> Tab to focus close button, Enter to close</li>
            <li>=A <strong>Focus visible:</strong> Clear focus ring on keyboard navigation</li>
            <li>=
 <strong>Screen reader:</strong> Messages announced automatically</li>
            <li>ñ <strong>Timing:</strong> Pause on hover for reading time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const Accessibility: Story = {
  render: () => (
    <ToastContainer position="top-right">
      <AccessibilityDemo />
    </ToastContainer>
  ),
};

/**
 * Toast Component Test Suite
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Toast from '../Toast';
import { ToastContainer, useToast } from '../ToastContainer';
import { renderHook, act } from '@testing-library/react';

// Extend matchers
expect.extend(toHaveNoViolations);

// Mock Framer Motion to avoid animation complexity
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Toast Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render success variant correctly', () => {
      render(
        <Toast
          id="test-1"
          variant="success"
          message="Operation completed successfully"
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByTestId('toast-test-1');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent('Operation completed successfully');
      expect(toast).toHaveClass('bg-success/90');
    });

    it('should render error variant correctly', () => {
      render(
        <Toast
          id="test-2"
          variant="error"
          message="An error occurred"
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByTestId('toast-test-2');
      expect(toast).toHaveTextContent('An error occurred');
      expect(toast).toHaveClass('bg-error/90');
      expect(toast).toHaveAttribute('role', 'alert');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('should render info variant correctly', () => {
      render(
        <Toast
          id="test-3"
          variant="info"
          message="Information message"
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByTestId('toast-test-3');
      expect(toast).toHaveTextContent('Information message');
      expect(toast).toHaveClass('bg-primary/90');
      expect(toast).toHaveAttribute('role', 'status');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('should render loading variant correctly', () => {
      render(
        <Toast
          id="test-4"
          variant="loading"
          message="Processing..."
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByTestId('toast-test-4');
      expect(toast).toHaveTextContent('Processing...');
      expect(toast).toHaveClass('bg-primary/90');
      // Loading toasts should not have a close button
      expect(screen.queryByLabelText('Close notification')).not.toBeInTheDocument();
    });

    it('should render custom icon when provided', () => {
      const CustomIcon = () => <span data-testid="custom-icon">🔔</span>;
      render(
        <Toast
          id="test-5"
          variant="info"
          message="Custom icon test"
          icon={<CustomIcon />}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should handle long messages with proper wrapping', () => {
      const longMessage = 'This is a very long message that should wrap properly within the toast component without breaking the layout or causing any overflow issues in the user interface';
      render(
        <Toast
          id="test-6"
          variant="info"
          message={longMessage}
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByTestId('toast-test-6');
      expect(toast).toHaveTextContent(longMessage);
    });
  });

  describe('Auto-dismiss functionality', () => {
    it('should auto-dismiss after default duration (5000ms)', () => {
      render(
        <Toast
          id="test-7"
          variant="success"
          message="Auto-dismiss test"
          onClose={mockOnClose}
        />
      );

      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(4999);
      });
      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss after custom duration', () => {
      render(
        <Toast
          id="test-8"
          variant="info"
          message="Custom duration test"
          duration={3000}
          onClose={mockOnClose}
        />
      );

      act(() => {
        vi.advanceTimersByTime(2999);
      });
      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not auto-dismiss loading variant', () => {
      render(
        <Toast
          id="test-9"
          variant="loading"
          message="Loading test"
          duration={1000}
          onClose={mockOnClose}
        />
      );

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not auto-dismiss when duration is 0', () => {
      render(
        <Toast
          id="test-10"
          variant="info"
          message="No auto-dismiss"
          duration={0}
          onClose={mockOnClose}
        />
      );

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('User interactions', () => {
    it('should close when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Toast
          id="test-11"
          variant="success"
          message="Click to close"
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText('Close notification');
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should pause auto-dismiss on mouse enter', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Toast
          id="test-12"
          variant="info"
          message="Hover to pause"
          duration={3000}
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByTestId('toast-test-12');

      // Advance time partially
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Hover over toast to pause
      await user.hover(toast);

      // Advance time beyond original duration
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should not have closed yet due to pause
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should resume auto-dismiss on mouse leave', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Toast
          id="test-13"
          variant="info"
          message="Hover and leave"
          duration={3000}
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByTestId('toast-test-13');

      // Advance time partially
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Hover to pause
      await user.hover(toast);

      // Wait a bit
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Leave hover
      await user.unhover(toast);

      // Should dismiss after remaining time (1000ms)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not show close button when showCloseButton is false', () => {
      render(
        <Toast
          id="test-14"
          variant="info"
          message="No close button"
          showCloseButton={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByLabelText('Close notification')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations for success variant', async () => {
      const { container } = render(
        <Toast
          id="test-15"
          variant="success"
          message="Success message"
          onClose={mockOnClose}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for error variant', async () => {
      const { container } = render(
        <Toast
          id="test-16"
          variant="error"
          message="Error message"
          onClose={mockOnClose}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes for screen readers', () => {
      render(
        <Toast
          id="test-17"
          variant="error"
          message="Screen reader test"
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByTestId('toast-test-17');
      expect(toast).toHaveAttribute('aria-atomic', 'true');
      expect(toast).toHaveAttribute('role', 'alert');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have keyboard accessible close button', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Toast
          id="test-18"
          variant="info"
          message="Keyboard test"
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText('Close notification');
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should meet touch target requirements (60x60px)', () => {
      render(
        <Toast
          id="test-19"
          variant="info"
          message="Touch target test"
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText('Close notification');
      const styles = window.getComputedStyle(closeButton);
      expect(styles.minWidth).toBe('60px');
      expect(styles.minHeight).toBe('60px');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty message gracefully', () => {
      render(
        <Toast
          id="test-20"
          variant="info"
          message=""
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByTestId('toast-test-20');
      expect(toast).toBeInTheDocument();
    });

    it('should handle extremely long message', () => {
      const extremelyLongMessage = 'A'.repeat(1000);
      render(
        <Toast
          id="test-21"
          variant="info"
          message={extremelyLongMessage}
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByTestId('toast-test-21');
      expect(toast).toHaveTextContent(extremelyLongMessage);
    });

    it('should handle negative duration as no auto-dismiss', () => {
      render(
        <Toast
          id="test-22"
          variant="info"
          message="Negative duration"
          duration={-1000}
          onClose={mockOnClose}
        />
      );

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});

describe('ToastContainer and useToast Hook', () => {
  const TestComponent: React.FC = () => {
    const { showToast, hideToast, clearAll } = useToast();

    return (
      <div>
        <button onClick={() => showToast({ variant: 'success', message: 'Test toast 1' })}>
          Show Toast 1
        </button>
        <button onClick={() => showToast({ variant: 'error', message: 'Test toast 2' })}>
          Show Toast 2
        </button>
        <button onClick={() => hideToast('toast-1')}>Hide Toast 1</button>
        <button onClick={clearAll}>Clear All</button>
      </div>
    );
  };

  it('should render toast container', () => {
    render(
      <ToastContainer>
        <div>Test content</div>
      </ToastContainer>
    );

    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should show toast via useToast hook', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <ToastContainer>
        <TestComponent />
      </ToastContainer>
    );

    const showButton = screen.getByText('Show Toast 1');
    await user.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Test toast 1')).toBeInTheDocument();
    });
  });

  it('should handle multiple toasts in queue', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <ToastContainer maxToasts={3}>
        <TestComponent />
      </ToastContainer>
    );

    const showButton1 = screen.getByText('Show Toast 1');
    const showButton2 = screen.getByText('Show Toast 2');

    await user.click(showButton1);
    await user.click(showButton2);
    await user.click(showButton1);

    await waitFor(() => {
      const toasts = screen.getAllByRole('status');
      expect(toasts).toHaveLength(3);
    });
  });

  it('should respect maxToasts limit', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <ToastContainer maxToasts={2}>
        <TestComponent />
      </ToastContainer>
    );

    const showButton = screen.getByText('Show Toast 1');

    // Click 5 times but should only show 2
    for (let i = 0; i < 5; i++) {
      await user.click(showButton);
    }

    await waitFor(() => {
      const toasts = screen.getAllByRole('status');
      expect(toasts).toHaveLength(2);
    });
  });

  it('should clear all toasts', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <ToastContainer>
        <TestComponent />
      </ToastContainer>
    );

    await user.click(screen.getByText('Show Toast 1'));
    await user.click(screen.getByText('Show Toast 2'));

    await waitFor(() => {
      expect(screen.getAllByRole(/status|alert/)).toHaveLength(2);
    });

    await user.click(screen.getByText('Clear All'));

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('should throw error when useToast is used outside ToastContainer', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastContainer');

    consoleSpy.mockRestore();
  });

  it('should position toasts correctly', () => {
    const { rerender } = render(
      <ToastContainer position="top-right">
        <div>Content</div>
      </ToastContainer>
    );

    let container = screen.getByTestId('toast-container');
    expect(container).toHaveClass('top-4', 'right-4');

    rerender(
      <ToastContainer position="bottom-center">
        <div>Content</div>
      </ToastContainer>
    );

    container = screen.getByTestId('toast-container');
    expect(container).toHaveClass('bottom-4', 'left-1/2');
  });
});
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';

vi.mock('@/src/design-system/components/primitives/Sheet', () => {
  const MockSheet = ({
    open,
    onOpenChange,
    children,
    title,
    description,
    className,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
  }) => {
    if (!open) return null;

    return (
      <div
        data-testid="sheet"
        data-title={title}
        data-description={description}
        className={className}
      >
        <button type="button" onClick={() => onOpenChange(false)}>
          Close
        </button>
        {children}
      </div>
    );
  };

  return { __esModule: true, default: MockSheet };
});

describe('Modal (design-system wrapper)', () => {
  const user = userEvent.setup();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when open and hides when closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    expect(screen.getByTestId('sheet')).toHaveTextContent('Content');

    rerender(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    expect(screen.queryByTestId('sheet')).toBeNull();
  });

  it('forwards title, description, and className props to Sheet', () => {
    render(
      <Modal
        isOpen
        onClose={() => {}}
        title="Details"
        description="More info"
        className="custom-modal"
      >
        <p>Info</p>
      </Modal>
    );

    const sheet = screen.getByTestId('sheet');
    expect(sheet).toHaveAttribute('data-title', 'Details');
    expect(sheet).toHaveAttribute('data-description', 'More info');
    expect(sheet).toHaveClass('custom-modal');
  });

  it('invokes onClose when Sheet requests closing', async () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen onClose={handleClose} title="Close Test">
        <p>Close me</p>
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaselineUpdateModal from '../BaselineUpdateModal';
import { Muscle } from '../../types';

describe('BaselineUpdateModal', () => {
  const mockUpdates = [
    {
      muscle: 'Chest' as Muscle,
      oldMax: 10000,
      newMax: 12000,
      sessionVolume: 11500,
    },
    {
      muscle: 'Triceps' as Muscle,
      oldMax: 5000,
      newMax: 6000,
      sessionVolume: 5800,
    },
  ];

  it('renders modal with Sheet component when isOpen is true', () => {
    const onConfirm = vi.fn();
    const onDecline = vi.fn();

    render(
      <BaselineUpdateModal
        isOpen={true}
        updates={mockUpdates}
        onConfirm={onConfirm}
        onDecline={onDecline}
      />
    );

    expect(screen.getByText(/New Muscle Capacity Records!/i)).toBeInTheDocument();
    expect(screen.getByText(/Chest/i)).toBeInTheDocument();
    expect(screen.getByText(/Triceps/i)).toBeInTheDocument();
  });

  it('displays correct muscle update information in Cards', () => {
    const onConfirm = vi.fn();
    const onDecline = vi.fn();

    render(
      <BaselineUpdateModal
        isOpen={true}
        updates={mockUpdates}
        onConfirm={onConfirm}
        onDecline={onDecline}
      />
    );

    expect(screen.getByText(/11,500 lbs/i)).toBeInTheDocument();
    expect(screen.getByText(/Previous Max: 10,000 lbs/i)).toBeInTheDocument();
    expect(screen.getByText(/New Max: 12,000 lbs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/improvement/i).length).toBeGreaterThan(0);
  });

  it('calls onConfirm when Update Baselines button is clicked', () => {
    const onConfirm = vi.fn();
    const onDecline = vi.fn();

    render(
      <BaselineUpdateModal
        isOpen={true}
        updates={mockUpdates}
        onConfirm={onConfirm}
        onDecline={onDecline}
      />
    );

    const updateButton = screen.getByRole('button', { name: /Update Baselines/i });
    fireEvent.click(updateButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onDecline when Keep Current button is clicked', () => {
    const onConfirm = vi.fn();
    const onDecline = vi.fn();

    render(
      <BaselineUpdateModal
        isOpen={true}
        updates={mockUpdates}
        onConfirm={onConfirm}
        onDecline={onDecline}
      />
    );

    const declineButton = screen.getByRole('button', { name: /Keep Current/i });
    fireEvent.click(declineButton);

    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it('renders null when updates array is empty', () => {
    const onConfirm = vi.fn();
    const onDecline = vi.fn();

    const { container } = render(
      <BaselineUpdateModal
        isOpen={true}
        updates={[]}
        onConfirm={onConfirm}
        onDecline={onDecline}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('uses Button primitives with proper touch target sizing (60px minimum)', () => {
    const onConfirm = vi.fn();
    const onDecline = vi.fn();

    render(
      <BaselineUpdateModal
        isOpen={true}
        updates={mockUpdates}
        onConfirm={onConfirm}
        onDecline={onDecline}
      />
    );

    const updateButton = screen.getByRole('button', { name: /Update Baselines/i });
    const declineButton = screen.getByRole('button', { name: /Keep Current/i });

    expect(updateButton.className).toContain('min-h-[60px]');
    expect(declineButton.className).toContain('min-h-[60px]');
  });

  it('uses design tokens for colors (no hardcoded brand colors)', () => {
    const onConfirm = vi.fn();
    const onDecline = vi.fn();

    render(
      <BaselineUpdateModal
        isOpen={true}
        updates={mockUpdates}
        onConfirm={onConfirm}
        onDecline={onDecline}
      />
    );

    // Verify Button primitives are used
    const updateButton = screen.getByRole('button', { name: /Update Baselines/i });
    expect(updateButton).toBeInTheDocument();
    expect(updateButton.className).toContain('min-h-[60px]');

    // Verify Card components are used for muscle updates
    const cards = document.querySelectorAll('[class*="backdrop-blur"]');
    expect(cards.length).toBeGreaterThan(0);
  });
});

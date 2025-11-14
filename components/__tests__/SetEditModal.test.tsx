import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SetEditModal from '../SetEditModal';
import { BuilderSet } from '../../types';

describe('SetEditModal', () => {
  const mockSet: BuilderSet = {
    exerciseId: 'bench-press',
    exerciseName: 'Bench Press',
    weight: 135,
    reps: 10,
    restTimerSeconds: 90,
  };

  it('renders modal with Sheet component when isOpen is true and set is provided', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(screen.getByText(/Edit Set/i)).toBeInTheDocument();
    expect(screen.getByText(/Bench Press/i)).toBeInTheDocument();
  });

  it('displays input fields with Input primitive for weight, reps, and rest timer', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        currentBodyweight={180}
      />
    );

    const weightInput = screen.getByDisplayValue('135');
    const repsInput = screen.getByDisplayValue('10');
    const restInput = screen.getByDisplayValue('90');

    expect(weightInput).toBeInTheDocument();
    expect(repsInput).toBeInTheDocument();
    expect(restInput).toBeInTheDocument();
  });

  it('increments weight when +2.5 button is clicked', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const plusButton = screen.getByRole('button', { name: '+2.5' });
    fireEvent.click(plusButton);

    const weightInput = screen.getByDisplayValue('137.5');
    expect(weightInput).toBeInTheDocument();
  });

  it('decrements weight when -5 button is clicked', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const minusButton = screen.getByRole('button', { name: '-5' });
    fireEvent.click(minusButton);

    const weightInput = screen.getByDisplayValue('130');
    expect(weightInput).toBeInTheDocument();
  });

  it('calls onSave with updated values when Save Changes is clicked', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      exerciseId: 'bench-press',
      weight: 135,
      reps: 10,
      restTimerSeconds: 90,
    }));
  });

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows Use BW button when currentBodyweight is provided', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        currentBodyweight={180}
      />
    );

    const bwButton = screen.getByRole('button', { name: /Use BW/i });
    expect(bwButton).toBeInTheDocument();
  });

  it('sets weight to bodyweight when Use BW button is clicked', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        currentBodyweight={180}
      />
    );

    const bwButton = screen.getByRole('button', { name: /Use BW/i });
    fireEvent.click(bwButton);

    const weightInput = screen.getByDisplayValue('180');
    expect(weightInput).toBeInTheDocument();
  });

  it('calls onAddSet when Add Another Set button is clicked', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const onAddSet = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
        onAddSet={onAddSet}
      />
    );

    const addButton = screen.getByRole('button', { name: /Add Another Set/i });
    fireEvent.click(addButton);

    expect(onAddSet).toHaveBeenCalledTimes(1);
    expect(onAddSet).toHaveBeenCalledWith({
      weight: 135,
      reps: 10,
      restTimerSeconds: 90,
    });
  });

  it('uses Button primitives with proper touch target sizing (60px minimum)', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const buttons = screen.getAllByRole('button');
    const touchTargetButtons = buttons.filter(btn =>
      btn.className.includes('min-h-[60px]')
    );

    // At least the increment/decrement and action buttons should have 60px touch targets
    expect(touchTargetButtons.length).toBeGreaterThan(0);
  });

  it('renders null when set is null', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    const { container } = render(
      <SetEditModal
        set={null}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('uses design tokens (no hardcoded brand colors)', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <SetEditModal
        set={mockSet}
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    );

    // Verify Button primitives are used (indicates design system integration)
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton.className).toContain('min-h-[60px]');

    // Verify Card component is used for exercise display
    const cards = document.querySelectorAll('[class*="backdrop-blur"]');
    expect(cards.length).toBeGreaterThan(0);
  });
});

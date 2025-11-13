/**
 * InlineNumberPicker Component Tests
 *
 * Tests for the inline number picker with haptic feedback.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InlineNumberPicker } from '../InlineNumberPicker';
import { vi } from 'vitest';

// Mock the useHaptic hook
vi.mock('@/src/design-system/hooks/useHaptic', () => ({
  useHaptic: () => ({
    vibrate: vi.fn(),
    vibratePattern: vi.fn(),
    isSupported: true,
  }),
}));

describe('InlineNumberPicker', () => {
  const mockOnChange = vi.fn();
  const mockOnTapEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with correct label and value', () => {
    render(
      <InlineNumberPicker
        label="Reps"
        value={10}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Reps')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should display unit when provided', () => {
    render(
      <InlineNumberPicker
        label="Weight"
        value={135}
        onChange={mockOnChange}
        unit="lbs"
      />
    );

    expect(screen.getByText('lbs')).toBeInTheDocument();
  });

  it('should increment value on plus button click', () => {
    render(
      <InlineNumberPicker
        label="Reps"
        value={10}
        onChange={mockOnChange}
      />
    );

    const incrementButton = screen.getByLabelText('Increase Reps');
    fireEvent.click(incrementButton);

    expect(mockOnChange).toHaveBeenCalledWith(11);
  });

  it('should decrement value on minus button click', () => {
    render(
      <InlineNumberPicker
        label="Reps"
        value={10}
        onChange={mockOnChange}
      />
    );

    const decrementButton = screen.getByLabelText('Decrease Reps');
    fireEvent.click(decrementButton);

    expect(mockOnChange).toHaveBeenCalledWith(9);
  });

  it('should respect min constraint', () => {
    render(
      <InlineNumberPicker
        label="Reps"
        value={1}
        min={1}
        onChange={mockOnChange}
      />
    );

    const decrementButton = screen.getByLabelText('Decrease Reps');
    fireEvent.click(decrementButton);

    // Should not call onChange when at minimum
    expect(mockOnChange).not.toHaveBeenCalled();
    // Button should be disabled
    expect(decrementButton).toBeDisabled();
  });

  it('should respect max constraint', () => {
    render(
      <InlineNumberPicker
        label="Reps"
        value={50}
        max={50}
        onChange={mockOnChange}
      />
    );

    const incrementButton = screen.getByLabelText('Increase Reps');
    fireEvent.click(incrementButton);

    // Should not call onChange when at maximum
    expect(mockOnChange).not.toHaveBeenCalled();
    // Button should be disabled
    expect(incrementButton).toBeDisabled();
  });

  it('should use custom step increment', () => {
    render(
      <InlineNumberPicker
        label="Weight"
        value={100}
        onChange={mockOnChange}
        step={5}
      />
    );

    const incrementButton = screen.getByLabelText('Increase Weight');
    fireEvent.click(incrementButton);

    expect(mockOnChange).toHaveBeenCalledWith(105);
  });

  it('should call onTapEdit when value is clicked', () => {
    render(
      <InlineNumberPicker
        label="Reps"
        value={10}
        onChange={mockOnChange}
        onTapEdit={mockOnTapEdit}
      />
    );

    const valueButton = screen.getByLabelText('Edit Reps');
    fireEvent.click(valueButton);

    expect(mockOnTapEdit).toHaveBeenCalled();
  });

  it('should clamp value to max when incrementing beyond', () => {
    render(
      <InlineNumberPicker
        label="Reps"
        value={49}
        max={50}
        onChange={mockOnChange}
        step={2}
      />
    );

    const incrementButton = screen.getByLabelText('Increase Reps');
    fireEvent.click(incrementButton);

    // Should clamp to 50, not 51
    expect(mockOnChange).toHaveBeenCalledWith(50);
  });

  it('should clamp value to min when decrementing below', () => {
    render(
      <InlineNumberPicker
        label="Reps"
        value={2}
        min={1}
        onChange={mockOnChange}
        step={2}
      />
    );

    const decrementButton = screen.getByLabelText('Decrease Reps');
    fireEvent.click(decrementButton);

    // Should clamp to 1, not 0
    expect(mockOnChange).toHaveBeenCalledWith(1);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <InlineNumberPicker
        label="Reps"
        value={10}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const picker = container.querySelector('.custom-class');
    expect(picker).toBeInTheDocument();
  });

  it('should have correct accessibility attributes', () => {
    render(
      <InlineNumberPicker
        label="Weight"
        value={135}
        onChange={mockOnChange}
        unit="lbs"
      />
    );

    expect(screen.getByLabelText('Increase Weight')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease Weight')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit Weight')).toBeInTheDocument();
  });

  it('should handle default prop values', () => {
    const { rerender } = render(
      <InlineNumberPicker
        label="Reps"
        value={10}
        onChange={mockOnChange}
      />
    );

    // Default min=0, max=9999, step=1
    const incrementButton = screen.getByLabelText('Increase Reps');
    fireEvent.click(incrementButton);
    expect(mockOnChange).toHaveBeenCalledWith(11);

    // Rerender with new value after increment
    rerender(
      <InlineNumberPicker
        label="Reps"
        value={11}
        onChange={mockOnChange}
      />
    );

    const decrementButton = screen.getByLabelText('Decrease Reps');
    fireEvent.click(decrementButton);
    expect(mockOnChange).toHaveBeenNthCalledWith(2, 10);
  });
});

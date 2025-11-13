/**
 * NumberPadSheet Component Tests
 *
 * Tests for the number pad bottom sheet component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NumberPadSheet } from '../NumberPadSheet';
import { vi } from 'vitest';

describe('NumberPadSheet', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open', () => {
    render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={135}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Edit Weight')).toBeInTheDocument();
    expect(screen.getByText('135')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <NumberPadSheet
        open={false}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={135}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByText('Edit Weight')).not.toBeInTheDocument();
  });

  it('should display unit when provided', () => {
    render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={135}
        onSubmit={mockOnSubmit}
        unit="lbs"
      />
    );

    expect(screen.getByText('lbs')).toBeInTheDocument();
  });

  it('should render all number buttons (0-9)', () => {
    render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={12345}
        onSubmit={mockOnSubmit}
      />
    );

    // Should have digit buttons in the number pad
    const buttons = screen.getAllByRole('button');
    const numberButtons = buttons.filter(btn => {
      const text = btn.textContent;
      return text && /^[0-9]$/.test(text);
    });
    expect(numberButtons.length).toBeGreaterThanOrEqual(10); // 0-9
  });

  it('should update display when number is pressed', () => {
    render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={0}
        onSubmit={mockOnSubmit}
      />
    );

    const button2 = screen.getAllByText('2')[0]; // Get first "2" button (not display)
    fireEvent.click(button2);

    // Display should show "2" (large font)
    const display = screen.getByText((content, element) => {
      return element?.classList.contains('text-6xl') && content === '2';
    });
    expect(display).toBeInTheDocument();
  });

  it('should append digits when pressing multiple numbers', () => {
    render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={0}
        onSubmit={mockOnSubmit}
      />
    );

    // Get number pad buttons (not the display)
    const buttons = screen.getAllByRole('button');
    const button2 = buttons.find(btn => btn.textContent === '2' && !btn.className.includes('text-6xl'));
    const button5 = buttons.find(btn => btn.textContent === '5' && !btn.className.includes('text-6xl'));

    fireEvent.click(button2!);
    fireEvent.click(button2!);
    fireEvent.click(button5!);

    const display = screen.getByText((content, element) => {
      return element?.classList.contains('text-6xl') && content === '225';
    });
    expect(display).toBeInTheDocument();
  });

  it('should replace leading zero when pressing a number', () => {
    render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Reps"
        initialValue={0}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.click(screen.getAllByText('5')[0]);

    const display = screen.getByText((content, element) => {
      return element?.classList.contains('text-6xl') && content === '5';
    });
    expect(display).toBeInTheDocument();
    expect(screen.queryByText('05')).not.toBeInTheDocument();
  });

  it('should handle backspace correctly', () => {
    render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={225}
        onSubmit={mockOnSubmit}
      />
    );

    const backspaceButton = screen.getByLabelText('Backspace');
    fireEvent.click(backspaceButton);

    expect(screen.getByText('22')).toBeInTheDocument();
  });

  it('should not go below 0 when backspacing', () => {
    render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Reps"
        initialValue={5}
        onSubmit={mockOnSubmit}
      />
    );

    const backspaceButton = screen.getByLabelText('Backspace');
    fireEvent.click(backspaceButton); // Should show '0'

    let display = screen.getByText((content, element) => {
      return element?.classList.contains('text-6xl') && content === '0';
    });
    expect(display).toBeInTheDocument();

    fireEvent.click(backspaceButton); // Should still show '0'
    display = screen.getByText((content, element) => {
      return element?.classList.contains('text-6xl') && content === '0';
    });
    expect(display).toBeInTheDocument();
  });

  it('should call onSubmit with parsed integer when Done is pressed', () => {
    render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={0}
        onSubmit={mockOnSubmit}
      />
    );

    const buttons = screen.getAllByRole('button');
    const button2 = buttons.find(btn => btn.textContent === '2' && !btn.className.includes('text-6xl'));
    const button5 = buttons.find(btn => btn.textContent === '5' && !btn.className.includes('text-6xl'));

    fireEvent.click(button2!);
    fireEvent.click(button2!);
    fireEvent.click(button5!);
    fireEvent.click(screen.getByText('Done'));

    expect(mockOnSubmit).toHaveBeenCalledWith(225);
  });

  it('should reset to initial value when sheet reopens', async () => {
    const { rerender } = render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={135}
        onSubmit={mockOnSubmit}
      />
    );

    // Change the value
    fireEvent.click(screen.getByText('2'));
    expect(screen.getByText('1352')).toBeInTheDocument();

    // Close and reopen
    rerender(
      <NumberPadSheet
        open={false}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={135}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      rerender(
        <NumberPadSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Edit Weight"
          initialValue={135}
          onSubmit={mockOnSubmit}
        />
      );
    });

    // Should reset to initial value
    expect(screen.getByText('135')).toBeInTheDocument();
    expect(screen.queryByText('1352')).not.toBeInTheDocument();
  });

  it('should handle NaN gracefully', () => {
    render(
      <NumberPadSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Edit Weight"
        initialValue={0}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.click(screen.getByText('Done'));

    // Should call onSubmit with 0 (parsed from '0')
    expect(mockOnSubmit).toHaveBeenCalledWith(0);
  });
});

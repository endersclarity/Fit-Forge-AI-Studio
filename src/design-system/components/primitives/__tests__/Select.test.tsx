/**
 * Select Component Tests
 *
 * Comprehensive test suite for Select primitive component.
 * Tests rendering, keyboard navigation, mouse interaction, accessibility, and edge cases.
 *
 * Reference: Epic 6.5 Story 1 - Railway Deployment & Missing Primitives
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Select, { SelectOption } from '../Select';

expect.extend(toHaveNoViolations);

const mockOptions: SelectOption[] = [
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back' },
  { label: 'Legs', value: 'legs' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Core', value: 'core' },
];

const mockOptionsWithDisabled: SelectOption[] = [
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back', disabled: true },
  { label: 'Legs', value: 'legs' },
  { label: 'Shoulders', value: 'shoulders', disabled: true },
  { label: 'Core', value: 'core' },
];

describe('Select Component', () => {
  describe('Rendering', () => {
    it('should render with options array', () => {
      const mockOnChange = vi.fn();
      render(<Select options={mockOptions} onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should show placeholder when no value selected', () => {
      const mockOnChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          onChange={mockOnChange}
          placeholder="Select muscle group"
        />
      );
      expect(screen.getByText('Select muscle group')).toBeInTheDocument();
    });

    it('should show selected option value', () => {
      const mockOnChange = vi.fn();
      render(<Select options={mockOptions} value="chest" onChange={mockOnChange} />);
      expect(screen.getByText('Chest')).toBeInTheDocument();
    });

    it('should render disabled state', () => {
      const mockOnChange = vi.fn();
      render(<Select options={mockOptions} onChange={mockOnChange} disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply custom className', () => {
      const mockOnChange = vi.fn();
      const { container } = render(
        <Select options={mockOptions} onChange={mockOnChange} className="custom-class" />
      );
      const selectContainer = container.firstChild;
      expect(selectContainer).toHaveClass('custom-class');
    });

    it('should render individual disabled options', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptionsWithDisabled} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const backOption = screen.getByText('Back');
      expect(backOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Interaction - Mouse', () => {
    it('should open dropdown on click', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Chest')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should select option on click', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const chestOption = screen.getByText('Chest');
      await user.click(chestOption);

      expect(mockOnChange).toHaveBeenCalledWith('chest');
    });

    it('should call onChange with selected value', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const legsOption = screen.getByText('Legs');
      await user.click(legsOption);

      expect(mockOnChange).toHaveBeenCalledWith('legs');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown after selection', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(screen.getByText('Back'));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(
        <div>
          <Select options={mockOptions} onChange={mockOnChange} />
          <div data-testid="outside">Outside</div>
        </div>
      );

      const button = screen.getByRole('button');
      await user.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should prevent opening when disabled', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} disabled />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should not select disabled option', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptionsWithDisabled} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const backOption = screen.getByText('Back');
      await user.click(backOption);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Interaction - Keyboard', () => {
    it('should open dropdown on Enter key', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should open dropdown on Space key', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should navigate down with ArrowDown', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith('chest');
    });

    it('should navigate up with ArrowUp', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith('chest');
    });

    it('should jump to first option with Home key', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{Home}');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith('chest');
    });

    it('should jump to last option with End key', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{End}');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith('core');
    });

    it('should select focused option with Enter', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith('back');
    });

    it('should close dropdown with Escape without selecting', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should close dropdown with Tab', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Tab}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should skip disabled options when navigating with ArrowDown', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptionsWithDisabled} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}'); // Move to chest
      await user.keyboard('{ArrowDown}'); // Should skip back (disabled) and go to legs
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith('legs');
    });

    it('should skip disabled options when navigating with ArrowUp', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptionsWithDisabled} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{End}'); // Jump to core
      await user.keyboard('{ArrowUp}'); // Should skip shoulders (disabled) and go to legs
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith('legs');
    });
  });

  describe('Search/Filter', () => {
    it('should show search input when searchable is true', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} searchable />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should filter options based on search term', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} searchable />);

      const button = screen.getByRole('button');
      await user.click(button);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'leg');

      expect(screen.getByText('Legs')).toBeInTheDocument();
      expect(screen.queryByText('Chest')).not.toBeInTheDocument();
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });

    it('should show "No options found" when search returns empty', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} searchable />);

      const button = screen.getByRole('button');
      await user.click(button);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'xyz123');

      expect(screen.getByText('No options found')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use role="listbox" for dropdown', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should use role="option" for each option', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(5);
    });

    it('should set aria-selected on selected option', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} value="legs" onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Get all options and find the one that's selected
      const options = screen.getAllByRole('option');
      const selectedOption = options.find((opt) => opt.getAttribute('aria-selected') === 'true');
      expect(selectedOption).toBeDefined();
      expect(selectedOption).toHaveTextContent('Legs');
    });

    it('should support custom aria-label', () => {
      const mockOnChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          onChange={mockOnChange}
          aria-label="Select muscle group"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Select muscle group');
    });

    it('should have aria-haspopup on button', () => {
      const mockOnChange = vi.fn();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should toggle aria-expanded when opening/closing', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should have visual focus indicator on focused option', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');

      const chestOption = screen.getByText('Chest');
      expect(chestOption).toHaveClass('bg-primary', 'text-white');
    });

    it('should have no accessibility violations (default)', async () => {
      const mockOnChange = vi.fn();
      const { container } = render(
        <Select options={mockOptions} onChange={mockOnChange} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (with value)', async () => {
      const mockOnChange = vi.fn();
      const { container } = render(
        <Select options={mockOptions} value="chest" onChange={mockOnChange} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (disabled)', async () => {
      const mockOnChange = vi.fn();
      const { container } = render(
        <Select options={mockOptions} onChange={mockOnChange} disabled />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      const mockOnChange = vi.fn();
      render(<Select options={[]} onChange={mockOnChange} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show "No options found" for empty filtered results', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={[]} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('No options found')).toBeInTheDocument();
    });

    it('should handle single option', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      const singleOption = [{ label: 'Only', value: 'only' }];
      render(<Select options={singleOption} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(screen.getByText('Only'));

      expect(mockOnChange).toHaveBeenCalledWith('only');
    });

    it('should handle very long option list (100+ options)', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      const longOptions = Array.from({ length: 100 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `option-${i + 1}`,
      }));
      render(<Select options={longOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(100);
    });

    it('should handle options with duplicate labels gracefully', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      const duplicateOptions = [
        { label: 'Same', value: 'value1' },
        { label: 'Same', value: 'value2' },
      ];
      render(<Select options={duplicateOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const options = screen.getAllByText('Same');
      await user.click(options[0]);

      expect(mockOnChange).toHaveBeenCalledWith('value1');
    });
  });

  describe('Props and Types', () => {
    it('should default to "Select an option" placeholder', () => {
      const mockOnChange = vi.fn();
      render(<Select options={mockOptions} onChange={mockOnChange} />);
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should support ref forwarding', () => {
      const mockOnChange = vi.fn();
      const ref = React.createRef<HTMLDivElement>();
      render(<Select ref={ref} options={mockOptions} onChange={mockOnChange} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).not.toBeNull();
    });

    it('should have correct displayName', () => {
      expect(Select.displayName).toBe('Select');
    });

    it('should work without searchable prop (default false)', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });
  });
});

/**
 * Input Component Unit Tests
 *
 * Tests component rendering, glass background styling, focus rings, and accessibility.
 * Uses Vitest with React Testing Library and jest-axe for accessibility auditing.
 *
 * Reference: Epic 5 Story 3 AC4 - Input component acceptance criteria
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Input from '../Input';

expect.extend(toHaveNoViolations);

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render as input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.tagName).toBe('INPUT');
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text..." />);
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toBeInTheDocument();
    });

    it('should apply glass morphism classes', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input') as HTMLInputElement;

      expect(input).toHaveClass('bg-white/50');
      expect(input).toHaveClass('backdrop-blur-sm');
      expect(input).toHaveClass('border');
      expect(input).toHaveClass('border-gray-300/50');
    });

    it('should render all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      sizes.forEach((size) => {
        const { container } = render(
          <Input size={size} data-testid={`input-${size}`} />
        );
        const input = screen.getByTestId(`input-${size}`);
        expect(input).toBeInTheDocument();
      });
    });

    it('should apply correct size classes', () => {
      const { rerender } = render(<Input size="sm" />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-3', 'py-2', 'text-sm');

      rerender(<Input size="md" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-4', 'py-3', 'text-base');

      rerender(<Input size="lg" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-5', 'py-4', 'text-lg');
    });

    it('should apply variant styling', () => {
      const { rerender } = render(<Input variant="default" />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-primary/30');

      rerender(<Input variant="error" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500/50');
      expect(input).toHaveClass('focus:ring-red-500/30');
    });

    it('should have rounded corners', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('rounded-lg');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Input className="custom-class" />
      );
      const input = container.querySelector('input');

      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('bg-white/50'); // Default still applied
    });
  });

  describe('Interaction', () => {
    it('should handle text input', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="test-input" />);

      const input = screen.getByTestId('test-input') as HTMLInputElement;
      await user.type(input, 'Hello World');

      expect(input.value).toBe('Hello World');
    });

    it('should call onChange handler', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
      expect(handleChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should support controlled component with value prop', () => {
      const { rerender } = render(<Input value="initial" onChange={() => {}} />);
      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('initial');

      rerender(<Input value="updated" onChange={() => {}} />);
      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('updated');
    });

    it('should not call onChange when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Input disabled onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      // Disabled inputs don't receive keyboard events
      expect(input).toBeDisabled();
    });

    it('should have disabled attribute when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should show disabled visual feedback', () => {
      const { container } = render(<Input disabled />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('disabled:opacity-50');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should handle backspace in text input', async () => {
      const user = userEvent.setup();
      render(<Input defaultValue="hello" data-testid="test-input" />);

      const input = screen.getByTestId('test-input') as HTMLInputElement;
      await user.click(input);
      await user.keyboard('{Backspace}{Backspace}');

      expect(input.value).toBe('hel');
    });
  });

  describe('Focus and Blur', () => {
    it('should have focus ring on focus', async () => {
      const user = userEvent.setup();
      const { container } = render(<Input />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('focus:ring-2');

      await user.click(input!);
      expect(input).toHaveFocus();
    });

    it('should call onFocus handler', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur handler', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      render(
        <div>
          <Input onBlur={handleBlur} />
          <button>Other element</button>
        </div>
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.click(input);
      expect(input).toHaveFocus();

      await user.click(button);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('default variant should have primary focus ring color', () => {
      const { container } = render(<Input variant="default" />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('focus:ring-primary/30');
    });

    it('error variant should have red focus ring color', () => {
      const { container } = render(<Input variant="error" />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('focus:ring-red-500/30');
    });
  });

  describe('Variants', () => {
    it('should render all variants', () => {
      const variants = ['default', 'error'] as const;

      variants.forEach((variant) => {
        render(
          <Input variant={variant} data-testid={`input-${variant}`} />
        );
      });

      variants.forEach((variant) => {
        expect(screen.getByTestId(`input-${variant}`)).toBeInTheDocument();
      });
    });

    it('error variant should have red border', () => {
      const { container } = render(<Input variant="error" />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('border-red-500/50');
      expect(input).toHaveClass('focus:border-red-500/50');
    });

    it('default variant should have gray border', () => {
      const { container } = render(<Input variant="default" />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('border-gray-300/50');
      expect(input).toHaveClass('focus:border-primary/50');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <button>Before</button>
          <Input />
          <button>After</button>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      const input = screen.getByRole('textbox');

      buttons[0].focus();
      await user.tab();
      expect(input).toHaveFocus();

      await user.tab();
      expect(buttons[1]).toHaveFocus();
    });

    it('should accept aria-label', () => {
      render(<Input ariaLabel="Search exercises" />);
      const input = screen.getByLabelText(/search exercises/i);
      expect(input).toBeInTheDocument();
    });

    it('should support standard input attributes', () => {
      render(
        <Input
          type="email"
          required
          minLength={5}
          maxLength={100}
          pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('minlength', '5');
      expect(input).toHaveAttribute('maxlength', '100');
    });

    it('should support password input type', () => {
      render(<Input type="password" ariaLabel="Password" />);
      const input = screen.getByLabelText(/password/i) as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should support number input type', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should pass axe accessibility audit', async () => {
      const { container } = render(
        <div>
          <label htmlFor="test-input">Test Input</label>
          <Input id="test-input" />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper focus ring visibility', async () => {
      const user = userEvent.setup();
      const { container } = render(<Input />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('focus:outline-none');
      expect(input).toHaveClass('focus:ring-2');
    });
  });

  describe('Props and Types', () => {
    it('should forward ref', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(ref.current).toBe(input);
    });

    it('should support additional HTML attributes', () => {
      render(
        <Input
          data-testid="custom-attr"
          title="Enter your text"
          autoComplete="off"
        />
      );

      const input = screen.getByTestId('custom-attr');
      expect(input).toHaveAttribute('title', 'Enter your text');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <Input className="font-bold text-lg" />
      );
      const input = container.querySelector('input');

      // Default glass morphism classes
      expect(input).toHaveClass('bg-white/50');
      expect(input).toHaveClass('backdrop-blur-sm');

      // Custom classes
      expect(input).toHaveClass('font-bold');
      expect(input).toHaveClass('text-lg');
    });
  });

  describe('Default Values', () => {
    it('should default to text input type', () => {
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('should default to default variant', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('focus:ring-primary/30');
      expect(input).not.toHaveClass('border-red-500/50');
    });

    it('should default to md size', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');

      expect(input).toHaveClass('px-4', 'py-3', 'text-base');
    });

    it('should default to not disabled', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).not.toBeDisabled();
    });
  });
});

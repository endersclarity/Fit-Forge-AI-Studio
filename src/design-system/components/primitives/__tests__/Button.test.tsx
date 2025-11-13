/**
 * Button Component Unit Tests
 *
 * Tests component rendering, prop validation, variant styling, and accessibility.
 * Uses Vitest with React Testing Library and jest-axe for accessibility auditing.
 *
 * Reference: Epic 5 Story 3 AC1 - Button component acceptance criteria
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from '../Button';

expect.extend(toHaveNoViolations);

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('should render all variant combinations', () => {
      const variants = ['primary', 'secondary', 'ghost'] as const;
      const sizes = ['sm', 'md', 'lg'] as const;

      variants.forEach((variant) => {
        sizes.forEach((size) => {
          const testId = `${variant}-${size}`;
          render(
            <Button variant={variant} size={size} data-testid={testId}>
              {testId}
            </Button>
          );
        });
      });

      // Verify all 9 combinations rendered
      variants.forEach((variant) => {
        sizes.forEach((size) => {
          const testId = `${variant}-${size}`;
          expect(screen.getByTestId(testId)).toBeInTheDocument();
        });
      });
    });

    it('should apply variant classes correctly', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');

      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-medium');

      rerender(<Button variant="ghost">Ghost</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('border-primary');
    });

    it('should apply size classes correctly', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');

      rerender(<Button size="md">Medium</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('px-5', 'py-3', 'text-base');

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-4', 'text-lg');
    });

    it('should apply custom className along with defaults', () => {
      render(
        <Button className="custom-class">
          Custom
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('rounded-full'); // Default class
    });
  });

  describe('Interaction', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should respond to keyboard activation (Enter)', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should respond to keyboard activation (Space)', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have disabled attribute when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show disabled visual feedback', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Click Me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should accept aria-label prop', () => {
      render(<Button ariaLabel="Save changes">Save</Button>);
      const button = screen.getByRole('button', { name: /save changes/i });
      expect(button).toBeInTheDocument();
    });

    it('should have focus ring on keyboard focus', async () => {
      const user = userEvent.setup();
      render(<Button>Focus Me</Button>);
      const button = screen.getByRole('button');

      // Initial state - no focus
      expect(button).not.toHaveFocus();

      // Tab to focus
      await user.tab();
      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus:ring-2');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <input type="text" placeholder="Before" />
          <Button>Target</Button>
          <input type="text" placeholder="After" />
        </div>
      );

      const button = screen.getByRole('button');
      const inputs = screen.getAllByRole('textbox');

      // Start at first input
      inputs[0].focus();
      expect(inputs[0]).toHaveFocus();

      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();

      // Tab to next input
      await user.tab();
      expect(inputs[1]).toHaveFocus();
    });

    it('should pass axe accessibility audit', async () => {
      const { container } = render(
        <div>
          <Button variant="primary" size="md">
            Primary Button
          </Button>
          <Button variant="secondary" size="md">
            Secondary Button
          </Button>
          <Button variant="ghost" size="md">
            Ghost Button
          </Button>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Props and Types', () => {
    it('should support submit button type', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should support reset button type', () => {
      render(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('should forward ref', () => {
      const ref = { current: null as HTMLButtonElement | null };
      const { container } = render(
        <Button ref={ref} data-testid="button-ref">
          Ref Test
        </Button>
      );

      const button = screen.getByTestId('button-ref') as HTMLButtonElement;
      expect(ref.current).toBe(button);
    });

    it('should support additional HTML attributes', () => {
      render(
        <Button data-testid="custom-attr" aria-pressed="false">
          Attributes
        </Button>
      );
      const button = screen.getByTestId('custom-attr');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Default Values', () => {
    it('should default to primary variant', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should default to md size', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-5', 'py-3', 'text-base');
    });

    it('should default to button type', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});

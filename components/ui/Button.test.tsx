import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button onClick={() => {}}>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('renders all variants correctly', () => {
      const { rerender } = render(<Button onClick={() => {}} variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary');

      rerender(<Button onClick={() => {}} variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-white/10');

      rerender(<Button onClick={() => {}} variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    it('renders all sizes correctly with WCAG compliance', () => {
      const { rerender } = render(<Button onClick={() => {}} size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('min-h-[60px]');
      expect(screen.getByRole('button')).toHaveClass('min-w-[60px]');

      rerender(<Button onClick={() => {}} size="md">Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('min-h-[60px]');
      expect(screen.getByRole('button')).toHaveClass('min-w-[60px]');

      rerender(<Button onClick={() => {}} size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('min-h-[60px]');
      expect(screen.getByRole('button')).toHaveClass('min-w-[80px]');

      rerender(<Button onClick={() => {}} size="xl">Extra Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('min-h-[72px]');
      expect(screen.getByRole('button')).toHaveClass('min-w-[100px]');
    });

    it('applies custom className', () => {
      render(<Button onClick={() => {}} className="custom-class">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('uses aria-label when provided', () => {
      render(<Button onClick={() => {}} ariaLabel="Custom label">Button</Button>);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('has disabled attribute when disabled prop is true', () => {
      render(<Button onClick={() => {}} disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations (primary variant)', async () => {
      const { container } = render(<Button onClick={() => {}}>Primary Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations (disabled state)', async () => {
      const { container } = render(<Button onClick={() => {}} disabled>Disabled Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('has focus-visible styles', () => {
      render(<Button onClick={() => {}}>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-primary');
    });

    it('meets minimum touch target size (60px WCAG AA+)', () => {
      render(<Button onClick={() => {}} size="sm">Small Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[60px]'); // 60px - exceeds 44px WCAG minimum
      expect(button).toHaveClass('min-w-[60px]');
    });

    it('all button sizes meet 60px minimum requirement', () => {
      const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];
      sizes.forEach(size => {
        const { container } = render(<Button onClick={() => {}} size={size}>Button</Button>);
        const button = container.querySelector('button');
        const classes = button?.className || '';
        // Verify height is at least 60px (matches 60, 72, or any higher value)
        expect(classes).toMatch(/min-h-\[([6-9]\d|\d{3,})px\]/);
        // Verify width is at least 60px (matches 60, 80, 100, or any higher value)
        expect(classes).toMatch(/min-w-\[([6-9]\d|\d{3,})px\]/);
      });
    });
  });

  describe('Visual States', () => {
    it('has hover styles defined', () => {
      render(<Button onClick={() => {}} variant="primary">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-primary/90');
    });

    it('has transition animation', () => {
      render(<Button onClick={() => {}}>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all');
      expect(button).toHaveClass('duration-300');
    });

    it('has disabled opacity', () => {
      render(<Button onClick={() => {}} disabled>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });
});

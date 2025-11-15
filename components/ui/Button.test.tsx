import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  it('renders children and optional aria label', () => {
    render(
      <Button onClick={() => {}} ariaLabel="custom label">
        Click me
      </Button>
    );

    expect(screen.getByRole('button', { name: /custom label/i })).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant styling classes', () => {
    const { rerender } = render(<Button onClick={() => {}} variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button onClick={() => {}} variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-medium');

    rerender(<Button onClick={() => {}} variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('maps size prop (including xl) to design-system sizes', () => {
    const { rerender } = render(<Button onClick={() => {}} size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-sm');

    rerender(<Button onClick={() => {}} size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-5', 'py-3', 'text-base');

    rerender(<Button onClick={() => {}} size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-4', 'text-lg');

    // Legacy xl should map to lg for backwards compatibility
    rerender(<Button onClick={() => {}} size="xl">Extra Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-4', 'text-lg');
  });

  it('merges custom className', () => {
    render(<Button onClick={() => {}} className="custom-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('fires onClick when enabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Accessible</Button>);

    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalled();
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(<Button onClick={() => {}}>A11y</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

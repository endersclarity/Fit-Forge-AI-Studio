/**
 * Card Component Unit Tests
 *
 * Tests component rendering, glass morphism styling, variants, and accessibility.
 * Uses Vitest with React Testing Library and jest-axe for accessibility auditing.
 *
 * Reference: Epic 5 Story 3 AC2 - Card component acceptance criteria
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Card from '../Card';

expect.extend(toHaveNoViolations);

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render with children content', () => {
      render(
        <Card>
          <h3>Card Title</h3>
          <p>Card content</p>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render with glass morphism classes', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveClass('glass-panel');
    });

    it('should render with rounded corners', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveClass('rounded-xl');
    });

    it('should apply default variant styling', () => {
      const { container } = render(<Card variant="default">Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveClass('glass-panel');
      expect(card).not.toHaveClass('glass-panel-elevated');
    });

    it('should apply elevated variant styling', () => {
      const { container } = render(<Card variant="elevated">Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveClass('glass-panel');
      expect(card).toHaveClass('glass-panel-elevated');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('glass-panel'); // Default still applied
    });

    it('should render as div element', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;

      expect(card?.nodeName).toBe('DIV');
    });
  });

  describe('Interaction - Non-Interactive', () => {
    it('should not have cursor-pointer when not clickable', () => {
      const { container } = render(<Card>Static Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('should not be focusable when not clickable', () => {
      const { container } = render(<Card>Static Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).not.toHaveAttribute('tabindex');
    });
  });

  describe('Interaction - Interactive', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Clickable</Card>);

      const card = screen.getByRole('button');
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have cursor-pointer when clickable', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Card onClick={handleClick}>Clickable</Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveClass('cursor-pointer');
    });

    it('should be focusable when clickable', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Card onClick={handleClick}>Clickable</Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('should trigger onClick on Enter key', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Clickable</Card>);

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger onClick on Space key', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Clickable</Card>);

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have focus ring on keyboard focus', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Clickable</Card>);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('focus:ring-2');

      await user.tab();
      expect(card).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have region role when non-interactive', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveAttribute('role', 'region');
    });

    it('should have button role when interactive', () => {
      render(<Card onClick={() => {}}>Clickable</Card>);
      const card = screen.getByRole('button');

      expect(card).toBeInTheDocument();
    });

    it('should accept aria-label', () => {
      const { container } = render(
        <Card ariaLabel="Featured content">Content</Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveAttribute('aria-label', 'Featured content');
    });

    it('should be keyboard navigable when interactive', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <div>
          <button>Before</button>
          <Card onClick={handleClick}>Clickable</Card>
          <button>After</button>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3); // Before, Card, After

      buttons[0].focus();
      await user.tab();
      expect(buttons[1]).toHaveFocus(); // Card focused

      await user.tab();
      expect(buttons[2]).toHaveFocus(); // After focused
    });

    it('should pass axe accessibility audit - non-interactive', async () => {
      const { container } = render(
        <Card>
          <h3>Card Title</h3>
          <p>Card content</p>
        </Card>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should pass axe accessibility audit - interactive', async () => {
      const { container } = render(
        <div>
          <Card onClick={() => {}}>Clickable Card</Card>
          <Card variant="elevated" onClick={() => {}}>
            Elevated Card
          </Card>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Variants', () => {
    it('should support all variants', () => {
      const variants = ['default', 'elevated'] as const;

      variants.forEach((variant) => {
        const { container } = render(
          <Card variant={variant} data-testid={`card-${variant}`}>
            Content
          </Card>
        );
        const card = container.firstChild as HTMLElement;
        expect(card).toBeInTheDocument();
      });
    });

    it('default variant should not have elevated class', () => {
      const { container } = render(<Card variant="default">Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).not.toHaveClass('glass-panel-elevated');
    });

    it('elevated variant should have elevated class', () => {
      const { container } = render(<Card variant="elevated">Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveClass('glass-panel-elevated');
    });
  });

  describe('Glass Morphism Effect', () => {
    it('should have correct glass morphism classes for proper effect', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;

      // Glass panel utility class contains all glass morphism properties
      // (backdrop-blur, border, shadow, and hover effects)
      expect(card).toHaveClass('glass-panel');
    });
  });

  describe('Props and Attributes', () => {
    it('should forward ref', () => {
      const ref = { current: null as HTMLDivElement | null };
      const { container } = render(
        <Card ref={ref} data-testid="card-ref">
          Content
        </Card>
      );

      const card = screen.getByTestId('card-ref') as HTMLDivElement;
      expect(ref.current).toBe(card);
    });

    it('should support additional HTML attributes', () => {
      render(
        <Card data-testid="custom-attr" id="test-card">
          Content
        </Card>
      );

      const card = screen.getByTestId('custom-attr');
      expect(card).toHaveAttribute('id', 'test-card');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <Card className="p-8 shadow-2xl">Content</Card>
      );
      const card = container.firstChild as HTMLElement;

      // Default glass morphism class
      expect(card).toHaveClass('glass-panel');

      // Custom classes
      expect(card).toHaveClass('p-8');
      expect(card).toHaveClass('shadow-2xl');
    });
  });

  describe('Default Values', () => {
    it('should default to default variant', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card).toHaveClass('glass-panel');
      expect(card).not.toHaveClass('glass-panel-elevated');
    });
  });
});

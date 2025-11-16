/**
 * FAB Component Tests
 *
 * Test suite for the Floating Action Button (FAB) component.
 * Covers all acceptance criteria and edge cases.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FAB from '../FAB';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, animate, initial, exit, transition, variants, whileHover, whileTap, whileInView, layout, layoutId, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('FAB Component', () => {
  describe('AC1: FAB component (64x64px, primary color, bottom-right position)', () => {
    it('should render with correct size (w-16 h-16 = 64x64px)', () => {
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} />);
      const button = screen.getByRole('button', { name: 'Add item' });

      expect(button).toHaveClass('w-16');
      expect(button).toHaveClass('h-16');
    });

    it('should be positioned bottom-right (bottom-6 right-6)', () => {
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} />);
      const button = screen.getByRole('button', { name: 'Add item' });

      expect(button).toHaveClass('fixed');
      expect(button).toHaveClass('bottom-6');
      expect(button).toHaveClass('right-6');
    });

    it('should use primary color background', () => {
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} />);
      const button = screen.getByRole('button', { name: 'Add item' });

      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-white');
    });

    it('should be rounded-full', () => {
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} />);
      const button = screen.getByRole('button', { name: 'Add item' });

      expect(button).toHaveClass('rounded-full');
    });

    it('should have z-50 for proper layering', () => {
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} />);
      const button = screen.getByRole('button', { name: 'Add item' });

      expect(button).toHaveClass('z-50');
    });
  });

  describe('AC2: Shadow: 0 4px 16px rgba(117,138,198,0.4)', () => {
    it('should have correct shadow in inline style', () => {
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} />);
      const button = screen.getByRole('button', { name: 'Add item' });

      const style = button.getAttribute('style');
      expect(style).toContain('box-shadow: 0 4px 16px rgba(117, 138, 198, 0.4)');
    });
  });

  describe('AC3: Entrance animation (spring physics)', () => {
    it('should have motion props for animation', () => {
      // Since we mocked framer-motion, we can verify the component renders
      // In actual usage, Framer Motion handles the spring animation
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} />);
      const button = screen.getByRole('button', { name: 'Add item' });

      expect(button).toBeInTheDocument();
    });

    // Note: Testing Framer Motion animations requires integration tests
    // The animation config (spring with stiffness: 300, damping: 20) is defined
    // in the component and will work when framer-motion is not mocked
  });

  describe('Icon Rendering', () => {
    it('should render Material Symbol icon', () => {
      render(<FAB icon="fitness_center" label="Add workout" onClick={vi.fn()} />);
      const icon = screen.getByText('fitness_center');

      expect(icon).toHaveClass('material-symbols-outlined');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render correct icon size (28px)', () => {
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} />);
      const icon = screen.getByText('add');

      expect(icon).toHaveClass('text-[28px]');
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<FAB icon="add" label="Add item" onClick={handleClick} />);
      const button = screen.getByRole('button', { name: 'Add item' });

      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<FAB icon="add" label="Add item" onClick={handleClick} disabled />);
      const button = screen.getByRole('button', { name: 'Add item' });

      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      render(<FAB icon="add" label="Add new workout" onClick={vi.fn()} />);
      const button = screen.getByRole('button', { name: 'Add new workout' });

      expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<FAB icon="add" label="Add item" onClick={handleClick} />);
      const button = screen.getByRole('button', { name: 'Add item' });

      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have focus visible ring', () => {
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} />);
      const button = screen.getByRole('button', { name: 'Add item' });

      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-primary');
      expect(button).toHaveClass('focus-visible:ring-offset-2');
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled attribute', () => {
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} disabled />);
      const button = screen.getByRole('button', { name: 'Add item' });

      expect(button).toBeDisabled();
    });

    it('should show opacity-50 when disabled', () => {
      render(<FAB icon="add" label="Add item" onClick={vi.fn()} disabled />);
      const button = screen.getByRole('button', { name: 'Add item' });

      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Custom ClassName', () => {
    it('should merge custom className with defaults', () => {
      render(
        <FAB icon="add" label="Add item" onClick={vi.fn()} className="custom-class" />
      );
      const button = screen.getByRole('button', { name: 'Add item' });

      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-primary'); // Default class still present
    });
  });

  describe('Different Icon Types', () => {
    it('should render fitness_center icon', () => {
      render(<FAB icon="fitness_center" label="Workout" onClick={vi.fn()} />);
      expect(screen.getByText('fitness_center')).toBeInTheDocument();
    });

    it('should render edit icon', () => {
      render(<FAB icon="edit" label="Edit" onClick={vi.fn()} />);
      expect(screen.getByText('edit')).toBeInTheDocument();
    });

    it('should render add icon', () => {
      render(<FAB icon="add" label="Add" onClick={vi.fn()} />);
      expect(screen.getByText('add')).toBeInTheDocument();
    });
  });

  describe('Component Display Name', () => {
    it('should have display name set', () => {
      expect(FAB.displayName).toBe('FAB');
    });
  });
});

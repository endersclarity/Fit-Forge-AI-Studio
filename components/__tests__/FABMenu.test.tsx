/**
 * FABMenu Component Tests - Story 6.2 AC1
 *
 * Tests for FABMenu converted from modal to floating button menu
 * Verifies:
 * - FAB renders as fixed positioned button (not modal)
 * - Menu overlay appears without backdrop
 * - Closes on outside click and Escape key
 * - No modal layer created (not counted in depth)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import FABMenu from '../FABMenu';

expect.extend(toHaveNoViolations);

describe('FABMenu - Story 6.2 AC1', () => {
  const mockOnClose = vi.fn();
  const mockOnLogWorkout = vi.fn();
  const mockOnBuildWorkout = vi.fn();
  const mockOnLoadTemplate = vi.fn();

  const defaultProps = {
    isOpen: false,
    onClose: mockOnClose,
    onLogWorkout: mockOnLogWorkout,
    onBuildWorkout: mockOnBuildWorkout,
    onLoadTemplate: mockOnLoadTemplate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC1: FABMenu converted to floating button menu (not modal)', () => {
    it('should render FAB button when closed', () => {
      render(<FABMenu {...defaultProps} />);

      const fabButton = screen.getByLabelText('Quick Actions Menu');
      expect(fabButton).toBeInTheDocument();
      expect(fabButton).toHaveTextContent('+');
    });

    it('should render FAB as fixed positioned element (not modal with backdrop)', () => {
      const { container } = render(<FABMenu {...defaultProps} />);

      // Should NOT have modal backdrop (fixed inset-0 bg-black)
      const backdrop = container.querySelector('.fixed.inset-0.bg-black');
      expect(backdrop).toBeNull();

      // FAB should be fixed positioned
      const fabContainer = container.querySelector('.fixed.bottom-6.right-6');
      expect(fabContainer).toBeInTheDocument();
    });

    it('should show menu overlay when open', () => {
      render(<FABMenu {...defaultProps} isOpen={true} />);

      const fabButton = screen.getByLabelText('Quick Actions Menu');
      expect(fabButton).toHaveTextContent('×');
      expect(fabButton).toHaveAttribute('aria-expanded', 'true');

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Log Workout')).toBeInTheDocument();
      expect(screen.getByText('Build Workout')).toBeInTheDocument();
      expect(screen.getByText('Load Template')).toBeInTheDocument();
    });

    it('should NOT create modal layer - menu is overlay on FAB', () => {
      const { container } = render(<FABMenu {...defaultProps} isOpen={true} />);

      // Menu should be absolute positioned relative to FAB (not fixed inset-0)
      const menuOverlay = container.querySelector('.absolute.bottom-16.right-0');
      expect(menuOverlay).toBeInTheDocument();

      // Should NOT have modal characteristics
      expect(container.querySelector('[role="dialog"]')).toBeNull();
      expect(container.querySelector('[aria-modal="true"]')).toBeNull();
    });
  });

  describe('Menu Actions', () => {
    it('should call onLogWorkout and close menu when Log Workout clicked', () => {
      render(<FABMenu {...defaultProps} isOpen={true} />);

      fireEvent.click(screen.getByText('Log Workout'));

      expect(mockOnLogWorkout).toHaveBeenCalledOnce();
      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should call onBuildWorkout and close menu when Build Workout clicked', () => {
      render(<FABMenu {...defaultProps} isOpen={true} />);

      fireEvent.click(screen.getByText('Build Workout'));

      expect(mockOnBuildWorkout).toHaveBeenCalledOnce();
      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should call onLoadTemplate and close menu when Load Template clicked', () => {
      render(<FABMenu {...defaultProps} isOpen={true} />);

      fireEvent.click(screen.getByText('Load Template'));

      expect(mockOnLoadTemplate).toHaveBeenCalledOnce();
      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });

  describe('Close Behavior', () => {
    it('should close menu when clicking outside', () => {
      const { container } = render(<FABMenu {...defaultProps} isOpen={true} />);

      // Click outside the menu (on document body)
      fireEvent.mouseDown(document.body);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should close menu when pressing Escape key', () => {
      render(<FABMenu {...defaultProps} isOpen={true} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should NOT close menu when clicking inside menu', () => {
      const { container } = render(<FABMenu {...defaultProps} isOpen={true} />);

      const menuOverlay = container.querySelector('.absolute.bottom-16');
      expect(menuOverlay).toBeInTheDocument();

      fireEvent.mouseDown(menuOverlay!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations when closed', async () => {
      const { container } = render(<FABMenu {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when open', async () => {
      const { container } = render(<FABMenu {...defaultProps} isOpen={true} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(<FABMenu {...defaultProps} isOpen={true} />);

      const fabButton = screen.getByLabelText('Quick Actions Menu');
      expect(fabButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});

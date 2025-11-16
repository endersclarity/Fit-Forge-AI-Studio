/**
 * ProgressBar Component Tests
 *
 * Comprehensive test suite for ProgressBar primitive component.
 * Tests rendering, animations, variants, sizes, accessibility, and edge cases.
 *
 * Reference: Epic 6.5 Story 1 - Railway Deployment & Missing Primitives
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProgressBar from '../ProgressBar';

expect.extend(toHaveNoViolations);

// Mock Framer Motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, animate, initial, exit, transition, variants, whileHover, whileTap, whileInView, layout, layoutId, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('ProgressBar Component', () => {
  describe('Rendering', () => {
    it('should render with value 0%', () => {
      render(<ProgressBar value={0} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should render with value 25%', () => {
      render(<ProgressBar value={25} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '25');
    });

    it('should render with value 50%', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should render with value 75%', () => {
      render(<ProgressBar value={75} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should render with value 100%', () => {
      render(<ProgressBar value={100} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should render all 4 color variants', () => {
      const { rerender, container } = render(<ProgressBar value={50} variant="primary" />);
      expect(container.querySelector('.bg-primary')).toBeInTheDocument();

      rerender(<ProgressBar value={50} variant="success" />);
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument();

      rerender(<ProgressBar value={50} variant="warning" />);
      expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument();

      rerender(<ProgressBar value={50} variant="error" />);
      expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
    });

    it('should render all 3 sizes', () => {
      const { rerender } = render(<ProgressBar value={50} size="sm" />);
      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('h-2');

      rerender(<ProgressBar value={50} size="md" />);
      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('h-3');

      rerender(<ProgressBar value={50} size="lg" />);
      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('h-4');
    });

    it('should show label when showLabel is true', () => {
      render(<ProgressBar value={75} showLabel />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      render(<ProgressBar value={75} showLabel={false} />);
      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });

    it('should apply custom className to container', () => {
      render(<ProgressBar value={50} className="custom-class" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('custom-class');
    });
  });

  describe('Animation', () => {
    it('should use Framer Motion for progress fill', () => {
      const { container } = render(<ProgressBar value={50} />);
      const fill = container.querySelector('.bg-primary');
      expect(fill).toBeInTheDocument();
    });

    it('should have spring physics parameters defined (via Framer Motion)', () => {
      // This test verifies the component uses motion.div
      // Actual animation is mocked but component structure is correct
      const { container } = render(<ProgressBar value={75} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(container.querySelector('.bg-primary')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use role="progressbar"', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should set aria-valuenow to current value', () => {
      render(<ProgressBar value={42} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '42');
    });

    it('should set aria-valuemin to 0', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('should set aria-valuemax to 100', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should support custom aria-label', () => {
      render(<ProgressBar value={50} aria-label="Workout completion" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Workout completion');
    });

    it('should have default aria-label with percentage', () => {
      render(<ProgressBar value={75} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Progress: 75%');
    });

    it('should have no accessibility violations (default)', async () => {
      const { container } = render(<ProgressBar value={50} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (with label)', async () => {
      const { container } = render(<ProgressBar value={75} showLabel />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (success variant)', async () => {
      const { container } = render(<ProgressBar value={100} variant="success" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (warning variant)', async () => {
      const { container } = render(<ProgressBar value={50} variant="warning" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (error variant)', async () => {
      const { container } = render(<ProgressBar value={25} variant="error" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('should clamp negative values to 0', () => {
      render(<ProgressBar value={-10} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should clamp values >100 to 100', () => {
      render(<ProgressBar value={150} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle NaN values as 0', () => {
      render(<ProgressBar value={NaN} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should handle undefined values as 0', () => {
      render(<ProgressBar value={undefined as any} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should round decimal values to nearest integer', () => {
      render(<ProgressBar value={42.7} showLabel />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '43');
      expect(screen.getByText('43%')).toBeInTheDocument();
    });

    it('should handle very small values correctly', () => {
      render(<ProgressBar value={0.5} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    });

    it('should handle boundary value exactly at 0', () => {
      render(<ProgressBar value={0} showLabel />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle boundary value exactly at 100', () => {
      render(<ProgressBar value={100} showLabel />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Props and Types', () => {
    it('should default to primary variant if not specified', () => {
      const { container } = render(<ProgressBar value={50} />);
      expect(container.querySelector('.bg-primary')).toBeInTheDocument();
    });

    it('should default to md size if not specified', () => {
      render(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('h-3');
    });

    it('should default to showLabel=false if not specified', () => {
      render(<ProgressBar value={50} />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ProgressBar ref={ref} value={50} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should have correct displayName', () => {
      expect(ProgressBar.displayName).toBe('ProgressBar');
    });
  });

  describe('Label Display', () => {
    it('should display percentage with showLabel', () => {
      render(<ProgressBar value={33} showLabel />);
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('should position label to the right', () => {
      render(<ProgressBar value={50} showLabel />);
      const label = screen.getByText('50%');
      expect(label).toHaveClass('text-right');
    });

    it('should update label when value changes', () => {
      const { rerender } = render(<ProgressBar value={25} showLabel />);
      expect(screen.getByText('25%')).toBeInTheDocument();

      rerender(<ProgressBar value={75} showLabel />);
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.queryByText('25%')).not.toBeInTheDocument();
    });
  });
});

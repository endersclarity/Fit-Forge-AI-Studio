import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Remove the global mock so we test the actual implementation
vi.unmock('@/src/providers/MotionProvider');

import { SkeletonBlock } from '../SkeletonBlock';
import { MotionProvider } from '../../../src/providers/MotionProvider';

// Wrapper component for testing
const renderWithProvider = (
  ui: React.ReactElement,
  { motionEnabled = true }: { motionEnabled?: boolean } = {}
) => {
  return render(
    <MotionProvider featureFlagOverride={motionEnabled}>{ui}</MotionProvider>
  );
};

describe('SkeletonBlock', () => {
  beforeEach(() => {
    // Mock matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false, // No reduced motion by default
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe('Accessibility', () => {
    it('has aria-hidden attribute', () => {
      renderWithProvider(<SkeletonBlock variant="card" />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('has presentation role', () => {
      renderWithProvider(<SkeletonBlock variant="card" />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Card variant', () => {
    it('renders card variant with correct dimensions', () => {
      renderWithProvider(<SkeletonBlock variant="card" />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toHaveClass('w-full');
      expect(skeleton).toHaveClass('h-48');
    });

    it('contains card structure elements', () => {
      const { container } = renderWithProvider(<SkeletonBlock variant="card" />);
      const innerElements = container.querySelectorAll('.bg-slate-300');
      expect(innerElements.length).toBeGreaterThan(0);
    });
  });

  describe('List-row variant', () => {
    it('renders list-row variant with correct dimensions', () => {
      renderWithProvider(<SkeletonBlock variant="list-row" />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toHaveClass('w-full');
      expect(skeleton).toHaveClass('h-16');
    });

    it('contains avatar placeholder', () => {
      const { container } = renderWithProvider(
        <SkeletonBlock variant="list-row" />
      );
      const avatar = container.querySelector('.rounded-full');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Chart variant', () => {
    it('renders chart variant with correct dimensions', () => {
      renderWithProvider(<SkeletonBlock variant="chart" />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toHaveClass('w-full');
      expect(skeleton).toHaveClass('h-64');
    });

    it('contains bar chart placeholders', () => {
      const { container } = renderWithProvider(<SkeletonBlock variant="chart" />);
      const bars = container.querySelectorAll('.rounded-t');
      expect(bars.length).toBe(7); // 7 bars in the chart
    });
  });

  describe('Motion preferences', () => {
    it('includes shimmer animation when motion is enabled', () => {
      const { container } = renderWithProvider(<SkeletonBlock variant="card" />, {
        motionEnabled: true,
      });
      const shimmer = container.querySelector('.animate-shimmer-slide');
      expect(shimmer).toBeInTheDocument();
    });

    it('excludes shimmer animation when motion is disabled', () => {
      const { container } = renderWithProvider(<SkeletonBlock variant="card" />, {
        motionEnabled: false,
      });
      const shimmer = container.querySelector('.animate-shimmer-slide');
      expect(shimmer).not.toBeInTheDocument();
    });
  });

  describe('Dark mode support', () => {
    it('has dark mode background classes', () => {
      renderWithProvider(<SkeletonBlock variant="card" />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toHaveClass('dark:bg-dark-bg-tertiary');
    });

    it('inner elements have dark mode classes', () => {
      const { container } = renderWithProvider(<SkeletonBlock variant="card" />);
      const innerElements = container.querySelectorAll('.dark\\:bg-dark-bg-secondary');
      expect(innerElements.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      renderWithProvider(<SkeletonBlock variant="card" className="custom-class" />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toHaveClass('custom-class');
    });

    it('has rounded corners', () => {
      renderWithProvider(<SkeletonBlock variant="card" />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toHaveClass('rounded-lg');
    });

    it('has overflow hidden for shimmer effect', () => {
      renderWithProvider(<SkeletonBlock variant="card" />);
      const skeleton = screen.getByRole('presentation', { hidden: true });
      expect(skeleton).toHaveClass('overflow-hidden');
    });
  });
});

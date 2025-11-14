/**
 * WorkoutTemplates Component Tests - Story 6.5.2B
 *
 * Tests for WorkoutTemplates migrated to design system primitives
 * Verifies:
 * - Design system primitives used (Card, Button, Badge)
 * - Design tokens used (no hardcoded colors)
 * - Touch targets meet 60x60px WCAG AA minimum
 * - No visual regressions in functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import WorkoutTemplates from '../WorkoutTemplates';
import { templatesAPI, workoutsAPI } from '../../api';

expect.extend(toHaveNoViolations);

// Mock API calls
vi.mock('../../api', () => ({
  templatesAPI: {
    getAll: vi.fn(),
  },
  workoutsAPI: {
    getLastByCategory: vi.fn(),
  },
}));

describe('WorkoutTemplates - Story 6.5.2B', () => {
  const mockTemplates = [
    {
      id: '1',
      name: 'Push Day A',
      category: 'Push',
      variation: 'A' as 'A' | 'B',
      exerciseIds: ['bench-press', 'shoulder-press', 'tricep-dips'],
      timesUsed: 5,
      isFavorite: false,
    },
    {
      id: '2',
      name: 'Push Day B',
      category: 'Push',
      variation: 'B' as 'A' | 'B',
      exerciseIds: ['incline-bench', 'lateral-raise', 'tricep-pushdown'],
      timesUsed: 3,
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Pull Day A',
      category: 'Pull',
      variation: 'A' as 'A' | 'B',
      exerciseIds: ['deadlift', 'pull-ups', 'barbell-rows'],
      timesUsed: 8,
      isFavorite: false,
    },
  ];

  const mockOnBack = vi.fn();
  const mockOnSelectTemplate = vi.fn();

  const defaultProps = {
    onBack: mockOnBack,
    onSelectTemplate: mockOnSelectTemplate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (templatesAPI.getAll as any).mockResolvedValue(mockTemplates);
    (workoutsAPI.getLastByCategory as any).mockResolvedValue({
      variation: 'A',
    });
  });

  describe('AC1: WorkoutTemplates uses Card, Button, Badge from design-system', () => {
    it('should render with design system Card components for templates', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      // Verify Card is used (glass morphism styling)
      const cards = document.querySelectorAll('.bg-white\\/50.backdrop-blur-sm');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should render with design system Button component for back navigation', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveClass('rounded-full');

      fireEvent.click(backButton);
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should render with design system Badge component for RECOMMENDED label', async () => {
      (workoutsAPI.getLastByCategory as any).mockResolvedValue({
        variation: 'B',
      });

      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        const recommendedBadges = screen.getAllByText('RECOMMENDED');
        expect(recommendedBadges.length).toBeGreaterThan(0);
      });

      // Badge should have semantic variant classes
      const recommendedBadges = screen.getAllByText('RECOMMENDED');
      recommendedBadges.forEach(badge => {
        expect(badge).toHaveClass('rounded-full');
      });
    });

    it('should render with design system Badge components for equipment tags', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      // Equipment badges should use Badge primitive
      const badges = document.querySelectorAll('.rounded-full.font-body.font-semibold');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('AC3: All pages use design tokens (no hardcoded colors)', () => {
    it('should use design token classes for backgrounds', async () => {
      const { container } = render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      // Should use bg-background instead of bg-brand-dark
      const mainContainer = container.querySelector('.bg-background');
      expect(mainContainer).toBeInTheDocument();

      // Should NOT have legacy brand-cyan hardcoded colors
      const legacyColors = container.querySelectorAll('.bg-brand-cyan, .text-brand-cyan, .border-brand-cyan');
      expect(legacyColors.length).toBe(0);
    });

    it('should use design token classes for text colors', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      // Title should use primary-dark token
      const title = screen.getByText('Workout Templates');
      expect(title).toHaveClass('text-primary-dark');
    });

    it('should use design token classes for typography', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      // Headings should use font-display (Cinzel)
      const title = screen.getByText('Workout Templates');
      expect(title).toHaveClass('font-display');

      // Body text should use font-body (Lato)
      const templateName = screen.getByText('Push Day A');
      expect(templateName).toHaveClass('font-body');
    });
  });

  describe('AC5: Touch targets meet 60x60px WCAG AA minimum', () => {
    it('should have 60x60px minimum touch target for back button', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      const backButton = screen.getByLabelText('Go back');
      expect(backButton).toHaveClass('min-w-[60px]');
      expect(backButton).toHaveClass('min-h-[60px]');
    });

    it('should have 60x60px minimum touch target for template cards', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      // Template cards should have min-h-[60px]
      const cards = document.querySelectorAll('.min-h-\\[60px\\]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('AC6: No visual regressions - functionality preserved', () => {
    it('should display loading state correctly', () => {
      (templatesAPI.getAll as any).mockImplementation(() => new Promise(() => {}));

      render(<WorkoutTemplates {...defaultProps} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('border-primary'); // Uses design token
    });

    it('should display error state correctly with retry button', async () => {
      (templatesAPI.getAll as any).mockRejectedValue(new Error('Network error'));

      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load workout templates')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();

      (templatesAPI.getAll as any).mockResolvedValue(mockTemplates);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });
    });

    it('should group templates by category', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Workouts')).toBeInTheDocument();
        expect(screen.getByText('Pull Workouts')).toBeInTheDocument();
      });

      // Push category should have 2 templates
      expect(screen.getByText('Push Day A')).toBeInTheDocument();
      expect(screen.getByText('Push Day B')).toBeInTheDocument();

      // Pull category should have 1 template
      expect(screen.getByText('Pull Day A')).toBeInTheDocument();
    });

    it('should display exercise names for each template', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      // Should show exercise count (multiple templates have 3 exercises)
      expect(screen.getAllByText(/3 exercises/).length).toBeGreaterThan(0);
    });

    it('should display times used for each template', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      expect(screen.getByText(/Used 5x/)).toBeInTheDocument();
      expect(screen.getByText(/Used 3x/)).toBeInTheDocument();
      expect(screen.getByText(/Used 8x/)).toBeInTheDocument();
    });

    it('should display favorite indicator', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day B')).toBeInTheDocument();
      });

      // Push Day B is favorite (has star)
      const favoriteStars = screen.getAllByText('⭐');
      expect(favoriteStars.length).toBe(1);
    });

    it('should handle template selection', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      const templateCard = screen.getByLabelText('Select Push Day A template');
      fireEvent.click(templateCard);

      expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1);
      expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockTemplates[0]);
    });

    it('should show empty state when no templates available', async () => {
      (templatesAPI.getAll as any).mockResolvedValue([]);

      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('No workout templates available')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have no axe accessibility violations', async () => {
      const { container } = render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Push Day A template')).toBeInTheDocument();
    });

    it('should support keyboard navigation for template cards', async () => {
      render(<WorkoutTemplates {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Push Day A')).toBeInTheDocument();
      });

      const templateCard = screen.getByLabelText('Select Push Day A template');

      // Card should be keyboard accessible (role="button", tabIndex)
      expect(templateCard).toHaveAttribute('role', 'button');
      expect(templateCard).toHaveAttribute('tabIndex', '0');

      // Test Enter key
      fireEvent.keyDown(templateCard, { key: 'Enter' });
      expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockTemplates[0]);

      // Test Space key
      vi.clearAllMocks();
      fireEvent.keyDown(templateCard, { key: ' ' });
      expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockTemplates[0]);
    });
  });
});

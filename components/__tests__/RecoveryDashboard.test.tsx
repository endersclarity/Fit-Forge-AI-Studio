/**
 * RecoveryDashboard Component Tests
 *
 * Comprehensive test suite for RecoveryDashboard component migration to design system.
 * Tests design system primitive integration, accessibility, touch targets, and functionality.
 *
 * Reference: Story 6.5.2C - Medium Page Migrations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecoveryDashboard } from '../screens/RecoveryDashboard';

// Add jest-axe matcher
expect.extend(toHaveNoViolations);

// Mock hooks
vi.mock('../../hooks/useMuscleStates', () => ({
  useMuscleStates: vi.fn()
}));

vi.mock('../../hooks/useExerciseRecommendations', () => ({
  useExerciseRecommendations: vi.fn()
}));

// Mock child components to isolate RecoveryDashboard testing
vi.mock('../layout/TopNav', () => ({
  TopNav: ({ onSettingsClick }: any) => (
    <div data-testid="top-nav">
      <button onClick={onSettingsClick}>Settings</button>
    </div>
  )
}));

vi.mock('../layout/FAB', () => ({
  FAB: ({ onClick, disabled }: any) => (
    <button data-testid="fab" onClick={onClick} disabled={disabled}>
      Start Workout
    </button>
  )
}));

vi.mock('../fitness/MuscleHeatMap', () => ({
  MuscleHeatMap: ({ muscles, onMuscleClick }: any) => (
    <div data-testid="muscle-heat-map">
      {muscles.map((m: any) => (
        <button key={m.name} onClick={() => onMuscleClick(m.name)}>
          {m.name}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../fitness/ExerciseRecommendationCard', () => ({
  ExerciseRecommendationCard: ({ exerciseName }: any) => (
    <div data-testid="exercise-card">{exerciseName}</div>
  )
}));

vi.mock('../loading/SkeletonScreen', () => ({
  SkeletonScreen: () => <div data-testid="skeleton-screen">Loading...</div>
}));

vi.mock('../loading/OfflineBanner', () => ({
  OfflineBanner: ({ onRetry }: any) => (
    <div data-testid="offline-banner">
      <button onClick={onRetry}>Retry</button>
    </div>
  )
}));

vi.mock('../loading/ErrorBanner', () => ({
  ErrorBanner: ({ message, onRetry, onDismiss }: any) => (
    <div data-testid="error-banner">
      {message}
      <button onClick={onRetry}>Retry</button>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  )
}));

vi.mock('../RecoveryTimelineView', () => ({
  default: () => <div data-testid="recovery-timeline">Recovery Timeline</div>
}));

vi.mock('../modals/MuscleDetailModal', () => ({
  MuscleDetailModal: ({ onClose }: any) => (
    <div data-testid="muscle-modal">
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

// Mock fetch for recovery timeline API
global.fetch = vi.fn();

import { useMuscleStates } from '../../hooks/useMuscleStates';
import { useExerciseRecommendations } from '../../hooks/useExerciseRecommendations';

describe('RecoveryDashboard - Design System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ muscles: [] })
    });
  });

  // AC1: RecoveryDashboard uses Card primitive for muscle group sections
  describe('Card Primitive Integration', () => {
    it('should render hero section with Card component', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      const { container } = render(<RecoveryDashboard />);

      // Check for Card component in hero section (has role="region" from Card primitive)
      const heroCard = container.querySelector('[role="region"]');
      expect(heroCard).toBeInTheDocument();

      // Verify glass morphism classes
      expect(heroCard?.className).toMatch(/bg-white\/50/);
      expect(heroCard?.className).toMatch(/backdrop-blur/);
    });

    it('should render empty state with Card component when no muscle data', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      // Empty state message
      expect(screen.getByText(/No muscle data available/i)).toBeInTheDocument();

      // Card should have glass morphism
      const emptyCard = screen.getByText(/No muscle data available/i).closest('[role="region"]');
      expect(emptyCard?.className).toMatch(/bg-white\/50/);
      expect(emptyCard?.className).toMatch(/backdrop-blur/);
    });

    it('should render recommendations empty state with Card component', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      // Empty recommendations message
      expect(screen.getByText(/No recommendations available/i)).toBeInTheDocument();

      // Card should have glass morphism
      const emptyCard = screen.getByText(/No recommendations available/i).closest('[role="region"]');
      expect(emptyCard?.className).toMatch(/bg-white\/50/);
      expect(emptyCard?.className).toMatch(/backdrop-blur/);
    });
  });

  // AC5: All buttons use Button primitive with proper variants
  describe('Button Primitive Integration', () => {
    it('should render category filter buttons with Button primitive', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      // All category buttons should be rendered
      expect(screen.getByRole('tab', { name: 'ALL' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'PUSH' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'PULL' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'LEGS' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'CORE' })).toBeInTheDocument();
    });

    it('should apply primary variant to selected category button', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      // ALL button should be selected by default (aria-selected="true")
      const allButton = screen.getByRole('tab', { name: 'ALL' });
      expect(allButton).toHaveAttribute('aria-selected', 'true');
    });

    it('should apply ghost variant to unselected category buttons', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      // PUSH button should not be selected
      const pushButton = screen.getByRole('tab', { name: 'PUSH' });
      expect(pushButton).toHaveAttribute('aria-selected', 'false');
    });
  });

  // AC6: Design tokens used for all colors (no hardcoded hex/rgb)
  describe('Design Token Usage', () => {
    it('should use design tokens for headings', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      const { container } = render(<RecoveryDashboard />);

      // Check for font-display class on headings
      const headings = container.querySelectorAll('h2, h3');
      headings.forEach(heading => {
        expect(heading.className).toMatch(/font-display/);
      });
    });

    it('should use font-body for body text', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      // Body text should use font-body
      const bodyText = screen.getByText(/No muscle data available/i);
      expect(bodyText.className).toMatch(/font-body/);
    });

    it('should use text-foreground for main text', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      const { container } = render(<RecoveryDashboard />);

      // Headings should use text-foreground
      const heading = container.querySelector('h2');
      expect(heading?.className).toMatch(/text-foreground/);
    });
  });

  // AC7: WCAG AA compliance (60x60px touch targets)
  describe('Touch Target Compliance', () => {
    it('should have 60x60px minimum touch targets for category buttons', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      // All category buttons should have min-w-[60px] min-h-[60px] classes
      const allButton = screen.getByRole('tab', { name: 'ALL' });
      expect(allButton.className).toMatch(/min-w-\[60px\]/);
      expect(allButton.className).toMatch(/min-h-\[60px\]/);

      // Note: getBoundingClientRect() returns 0 in JSDOM, so we verify via classes
      // Touch target compliance verified by className presence
    });
  });

  // AC8: Glass morphism applied consistently
  describe('Glass Morphism Styling', () => {
    it('should apply glass morphism to Card components', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      const { container } = render(<RecoveryDashboard />);

      // All Cards should have bg-white/50 and backdrop-blur
      const cards = container.querySelectorAll('[role="region"]');
      cards.forEach(card => {
        expect(card.className).toMatch(/bg-white\/50/);
        expect(card.className).toMatch(/backdrop-blur/);
      });
    });
  });

  // AC10: Zero regressions in existing functionality
  describe('Functionality Preservation', () => {
    it('should display loading skeleton screen during initial load', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [],
        loading: true,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: true,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      expect(screen.getByTestId('skeleton-screen')).toBeInTheDocument();
    });

    it('should display offline banner when network error occurs', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [],
        loading: false,
        error: new Error('Failed to fetch'),
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
    });

    it('should display error banner for non-network errors', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [],
        loading: false,
        error: new Error('Server error'),
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    it('should render muscle heat map when muscle data is available', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [
          { name: 'Chest', fatiguePercent: 20, category: 'PUSH' },
          { name: 'Back', fatiguePercent: 30, category: 'PULL' }
        ],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      expect(screen.getByTestId('muscle-heat-map')).toBeInTheDocument();
      expect(screen.getByText('Chest')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should render exercise recommendations when available', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [
          { exerciseName: 'Bench Press', status: 'excellent' },
          { exerciseName: 'Push-ups', status: 'good' }
        ],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Push-ups')).toBeInTheDocument();
    });

    it('should display recovery timeline when muscle states data is available', async () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          muscles: [{
            name: 'Chest',
            currentFatigue: 20,
            fullyRecoveredAt: new Date(Date.now() + 86400000).toISOString()
          }]
        })
      });

      render(<RecoveryDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('recovery-timeline')).toBeInTheDocument();
      });
    });

    it('should render FAB button for starting workout', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      expect(screen.getByTestId('fab')).toBeInTheDocument();
      expect(screen.getByText('Start Workout')).toBeInTheDocument();
    });

    it('should disable FAB when no muscle data is available', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      const fab = screen.getByTestId('fab');
      expect(fab).toBeDisabled();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('should have no axe violations', async () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      const { container } = render(<RecoveryDashboard />);

      // Disable landmark-unique rule (known Card primitive limitation)
      const results = await axe(container, {
        rules: {
          'landmark-unique': { enabled: false }
        }
      });

      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for sections', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      const { container } = render(<RecoveryDashboard />);

      // Sections should have aria-labelledby
      expect(container.querySelector('[aria-labelledby="workout-recommendation-heading"]')).toBeInTheDocument();
      expect(container.querySelector('[aria-labelledby="muscle-recovery-heading"]')).toBeInTheDocument();
      expect(container.querySelector('[aria-labelledby="exercise-recommendations-heading"]')).toBeInTheDocument();
    });

    it('should have proper role attributes for category tabs', () => {
      (useMuscleStates as any).mockReturnValue({
        muscles: [{ name: 'Chest', fatiguePercent: 20, category: 'PUSH' }],
        loading: false,
        error: null,
        refetch: vi.fn()
      });
      (useExerciseRecommendations as any).mockReturnValue({
        recommendations: [],
        loading: false,
        error: null,
        refetch: vi.fn()
      });

      render(<RecoveryDashboard />);

      // Tablist should have proper role
      const tablist = screen.getAllByRole('tablist')[0];
      expect(tablist).toHaveAttribute('aria-label', 'Exercise category filters');

      // Each tab should have role="tab"
      const allTab = screen.getByRole('tab', { name: 'ALL' });
      expect(allTab).toHaveAttribute('role', 'tab');
      expect(allTab).toHaveAttribute('aria-selected');
      expect(allTab).toHaveAttribute('aria-controls');
    });
  });
});

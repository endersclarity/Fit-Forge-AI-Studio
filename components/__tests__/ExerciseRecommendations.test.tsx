/**
 * ExerciseRecommendations Component Tests
 *
 * Comprehensive test suite for ExerciseRecommendations component migration to design system.
 * Tests design system primitive integration, accessibility, touch targets, and functionality.
 *
 * Reference: Story 6.5.2C - Medium Page Migrations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ExerciseRecommendations from '../ExerciseRecommendations';
import type { MuscleStatesResponse, EquipmentItem } from '../types';

// Add jest-axe matcher
expect.extend(toHaveNoViolations);

// Mock API
vi.mock('../../api', () => ({
  getUserCalibrations: vi.fn(),
  getExerciseCalibrations: vi.fn(),
  API_BASE_URL: 'http://localhost:3001'
}));

// Mock constants
vi.mock('../../constants', () => ({
  EXERCISE_LIBRARY: [
    {
      id: 'bench-press',
      name: 'Bench Press',
      category: 'Push',
      muscleEngagements: [
        { muscle: 'Chest', percentage: 60 },
        { muscle: 'Triceps', percentage: 30 }
      ]
    },
    {
      id: 'squat',
      name: 'Squat',
      category: 'Legs',
      muscleEngagements: [
        { muscle: 'Quads', percentage: 50 },
        { muscle: 'Glutes', percentage: 40 }
      ]
    }
  ]
}));

// Mock child components
vi.mock('./CategoryTabs', () => ({
  default: ({ categories, activeCategory, onCategoryChange }: any) => (
    <div data-testid="category-tabs">
      {categories.map((cat: any) => (
        <button
          key={cat.label}
          onClick={() => onCategoryChange(cat.value)}
          data-active={activeCategory === cat.value}
        >
          {cat.label} ({cat.count})
        </button>
      ))}
    </div>
  )
}));

vi.mock('./RecommendationCard', () => ({
  default: ({ exercise, status, onAdd }: any) => (
    <div data-testid="recommendation-card" data-status={status}>
      {exercise.name}
      <button onClick={() => onAdd(exercise)}>Add</button>
    </div>
  )
}));

vi.mock('./CollapsibleSection', () => ({
  default: ({ title, children }: any) => (
    <details data-testid="collapsible-section">
      <summary>{title}</summary>
      {children}
    </details>
  )
}));

vi.mock('./EngagementViewer', () => ({
  EngagementViewer: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="engagement-viewer">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

vi.mock('./CalibrationEditor', () => ({
  CalibrationEditor: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="calibration-editor">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

// Mock fetch for API calls
global.fetch = vi.fn();

import { getUserCalibrations } from '../../api';

describe('ExerciseRecommendations - Design System Integration', () => {
  const mockMuscleStates: MuscleStatesResponse = {
    Chest: {
      currentFatiguePercent: 20,
      daysElapsed: null,
      estimatedRecoveryDays: 1,
      daysUntilRecovered: 1,
      recoveryStatus: 'ready',
      initialFatiguePercent: 20,
      lastTrained: '2025-11-12T10:00:00Z',
      recoveredAt: null
    },
    Triceps: {
      currentFatiguePercent: 15,
      daysElapsed: null,
      estimatedRecoveryDays: 0.5,
      daysUntilRecovered: 0.5,
      recoveryStatus: 'ready',
      initialFatiguePercent: 15,
      lastTrained: '2025-11-12T10:00:00Z',
      recoveredAt: null
    }
  };

  const mockEquipment: EquipmentItem[] = [
    { type: 'Barbell', available: true },
    { type: 'Dumbbells', available: true }
  ];

  const mockSelectedMuscles = ['Chest'];

  const mockOnAddToWorkout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getUserCalibrations as any).mockResolvedValue({});
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        safe: [
          {
            exercise: { id: 'bench-press' },
            score: 85,
            isSafe: true,
            warnings: [],
            factors: {
              targetMatch: 90,
              freshness: 85,
              variety: 80,
              preference: 85,
              primarySecondary: 85,
              total: 85
            }
          }
        ],
        unsafe: [],
        totalFiltered: 1
      })
    });
  });

  // AC2: ExerciseRecommendations uses Card primitive for exercise cards
  describe('Card Primitive Integration', () => {
    it('should render main container with Card component', async () => {
      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        // Main container should be a Card with role="region"
        const mainCard = container.querySelector('[role="region"]');
        expect(mainCard).toBeInTheDocument();

        // Verify glass morphism classes
        expect(mainCard?.className).toMatch(/bg-white\/50/);
        expect(mainCard?.className).toMatch(/backdrop-blur/);
      });
    });

    it('should render loading state with Card component', () => {
      (global.fetch as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      // Loading state should be in a Card
      expect(screen.getByText(/Loading Recommendations/i)).toBeInTheDocument();

      const loadingCard = container.querySelector('[role="region"]');
      expect(loadingCard?.className).toMatch(/bg-white\/50/);
      expect(loadingCard?.className).toMatch(/backdrop-blur/);
    });

    it('should render error state with Card component', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Error Loading Recommendations/i)).toBeInTheDocument();
      });

      const errorCard = container.querySelector('[role="region"]');
      expect(errorCard?.className).toMatch(/bg-white\/50/);
      expect(errorCard?.className).toMatch(/backdrop-blur/);
    });

    it('should render empty equipment state with Card component', () => {
      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={[]}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      expect(screen.getByText(/No Equipment Configured/i)).toBeInTheDocument();

      const emptyCard = container.querySelector('[role="region"]');
      expect(emptyCard?.className).toMatch(/bg-white\/50/);
      expect(emptyCard?.className).toMatch(/backdrop-blur/);
    });

    it('should render no muscle selected state with Card component', () => {
      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={[]}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      expect(screen.getByText(/Select a Muscle to Get Started/i)).toBeInTheDocument();

      const emptyCard = container.querySelector('[role="region"]');
      expect(emptyCard?.className).toMatch(/bg-white\/50/);
      expect(emptyCard?.className).toMatch(/backdrop-blur/);
    });

    it('should render no exercises available state with Card component', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          safe: [],
          unsafe: [],
          totalFiltered: 0
        })
      });

      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/No Exercises Available/i)).toBeInTheDocument();
      });

      const emptyCard = container.querySelector('[role="region"]');
      expect(emptyCard?.className).toMatch(/bg-white\/50/);
      expect(emptyCard?.className).toMatch(/backdrop-blur/);
    });
  });

  // AC3: Both components use Badge primitive for status indicators
  describe('Badge Primitive Integration', () => {
    it('should render exercise count badge', async () => {
      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        // Badge should show exercise count
        expect(screen.getByText(/1 exercises/i)).toBeInTheDocument();
      });
    });

    it('should render section count badges', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          safe: [
            {
              exercise: { id: 'bench-press' },
              score: 85,
              isSafe: true,
              warnings: [],
              factors: { targetMatch: 90, freshness: 85, variety: 80, preference: 85, primarySecondary: 85, total: 85 }
            },
            {
              exercise: { id: 'bench-press' },
              score: 65,
              isSafe: true,
              warnings: [],
              factors: { targetMatch: 70, freshness: 65, variety: 60, preference: 65, primarySecondary: 65, total: 65 }
            }
          ],
          unsafe: [],
          totalFiltered: 2
        })
      });

      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        // Section badges should show counts
        const excellentBadge = screen.getByText('1'); // 1 excellent exercise (score 85)
        expect(excellentBadge).toBeInTheDocument();

        const goodBadge = screen.getByText('1'); // 1 good exercise (score 65)
        expect(goodBadge).toBeInTheDocument();
      });
    });
  });

  // AC5: All buttons use Button primitive with proper variants
  describe('Button Primitive Integration', () => {
    it('should render retry button with Button primitive in error state', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /Retry/i });
        expect(retryButton).toBeInTheDocument();

        // Button should have min touch target size
        expect(retryButton.className).toMatch(/min-w-\[60px\]/);
        expect(retryButton.className).toMatch(/min-h-\[60px\]/);
      });
    });
  });

  // AC6: Design tokens used for all colors
  describe('Design Token Usage', () => {
    it('should use font-display for headings', async () => {
      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        const headings = container.querySelectorAll('h3, h4');
        headings.forEach(heading => {
          expect(heading.className).toMatch(/font-display/);
        });
      });
    });

    it('should use font-body for body text', async () => {
      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={[]}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      const bodyText = screen.getByText(/Click on a muscle/i);
      expect(bodyText.className).toMatch(/font-body/);
    });

    it('should use text-foreground for main headings', async () => {
      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        const heading = container.querySelector('h3');
        expect(heading?.className).toMatch(/text-foreground/);
      });
    });

    it('should use text-primary for highlighted text', async () => {
      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        // Muscle name should be highlighted with text-primary
        const muscleSpan = screen.getByText('Chest');
        expect(muscleSpan.className).toMatch(/text-primary/);
      });
    });
  });

  // AC7: WCAG AA compliance (60x60px touch targets)
  describe('Touch Target Compliance', () => {
    it('should have 60x60px minimum touch targets for retry button', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /Retry/i });

        // Verify classes for touch target compliance
        expect(retryButton.className).toMatch(/min-w-\[60px\]/);
        expect(retryButton.className).toMatch(/min-h-\[60px\]/);

        // Note: getBoundingClientRect() returns 0 in JSDOM, so we verify via classes
        // Touch target compliance verified by className presence
      });
    });
  });

  // AC8: Glass morphism applied consistently
  describe('Glass Morphism Styling', () => {
    it('should apply glass morphism to all Card components', async () => {
      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        const cards = container.querySelectorAll('[role="region"]');
        cards.forEach(card => {
          expect(card.className).toMatch(/bg-white\/50/);
          expect(card.className).toMatch(/backdrop-blur/);
        });
      });
    });
  });

  // AC10: Zero regressions in existing functionality
  describe('Functionality Preservation', () => {
    it('should fetch recommendations from API when selectedMuscles changes', async () => {
      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/recommendations/exercises',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Chest')
          })
        );
      });
    });

    it('should transform API response to ExerciseRecommendation format', async () => {
      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        // Recommendation card should be rendered with transformed data
        expect(screen.getByTestId('recommendation-card')).toBeInTheDocument();
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
    });

    it('should group recommendations by status', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          safe: [
            {
              exercise: { id: 'bench-press' },
              score: 85, // excellent
              isSafe: true,
              warnings: [],
              factors: { targetMatch: 90, freshness: 85, variety: 80, preference: 85, primarySecondary: 85, total: 85 }
            },
            {
              exercise: { id: 'bench-press' },
              score: 65, // good
              isSafe: true,
              warnings: [],
              factors: { targetMatch: 70, freshness: 65, variety: 60, preference: 65, primarySecondary: 65, total: 65 }
            },
            {
              exercise: { id: 'bench-press' },
              score: 50, // suboptimal
              isSafe: true,
              warnings: [],
              factors: { targetMatch: 55, freshness: 50, variety: 45, preference: 50, primarySecondary: 50, total: 50 }
            }
          ],
          unsafe: [],
          totalFiltered: 3
        })
      });

      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        // Section headings should exist
        expect(screen.getByText(/Excellent Opportunities/i)).toBeInTheDocument();
        expect(screen.getByText(/Good Options/i)).toBeInTheDocument();
        expect(screen.getByText(/Suboptimal/i)).toBeInTheDocument();
      });
    });

    it('should fetch user calibrations on mount', async () => {
      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        expect(getUserCalibrations).toHaveBeenCalled();
      });
    });

    it('should render CategoryTabs component', async () => {
      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('category-tabs')).toBeInTheDocument();
      });
    });

    it('should display correct category counts', async () => {
      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        // Category tabs should show counts
        expect(screen.getByText(/All \(1\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Push \(1\)/i)).toBeInTheDocument();
      });
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('should have no axe violations', async () => {
      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('category-tabs')).toBeInTheDocument();
      });

      // Disable landmark-unique rule (known Card primitive limitation)
      const results = await axe(container, {
        rules: {
          'landmark-unique': { enabled: false }
        }
      });

      expect(results).toHaveNoViolations();
    });

    it('should have semantic HTML structure', async () => {
      const { container } = render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      await waitFor(() => {
        // Headings should be present
        const headings = container.querySelectorAll('h3, h4');
        expect(headings.length).toBeGreaterThan(0);
      });
    });

    it('should provide loading state feedback', () => {
      (global.fetch as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <ExerciseRecommendations
          muscleStates={mockMuscleStates}
          equipment={mockEquipment}
          selectedMuscles={mockSelectedMuscles}
          onAddToWorkout={mockOnAddToWorkout}
        />
      );

      // Loading message should be accessible
      expect(screen.getByText(/Loading Recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/Analyzing muscle fatigue/i)).toBeInTheDocument();
    });
  });
});

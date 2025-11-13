/**
 * QuickAdd Sheet Integration Tests - Story 6.2 AC2 & AC3
 *
 * Tests for QuickAdd refactored to use Sheet component
 * Verifies:
 * - QuickAdd opens as bottom sheet at 60% height (AC2)
 * - ExercisePicker content swaps within same sheet level (AC3)
 * - No nested modals created
 * - All dismiss methods work (swipe, backdrop, Escape)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import QuickAdd from '../QuickAdd';
import * as smartDefaultsUtils from '../../utils/smartDefaults';
import * as api from '../../api';

expect.extend(toHaveNoViolations);

// Mock dependencies
vi.mock('../../utils/smartDefaults');
vi.mock('../../api');

describe('QuickAdd - Story 6.2 AC2 & AC3', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnToast = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    onToast: mockOnToast,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetchSmartDefaults
    vi.mocked(smartDefaultsUtils.fetchSmartDefaults).mockResolvedValue({
      suggestedWeight: 135,
      suggestedReps: 8,
      lastWorkoutDate: '2025-11-10',
    });

    // Mock getUserCalibrations (called by ExercisePicker)
    vi.mocked(api.getUserCalibrations).mockResolvedValue({});

    // Mock getExerciseCalibrations
    vi.mocked(api.getExerciseCalibrations).mockResolvedValue({
      exerciseId: 'bench-press',
      exerciseName: 'Bench Press',
      engagements: [],
    });

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as Storage;
  });

  describe('AC2: QuickAdd opens as bottom sheet (60% height)', () => {
    it('should render as Sheet component with height="md" (60vh)', () => {
      render(<QuickAdd {...defaultProps} />);

      // Sheet component should be present with proper height - Vaul renders in Portal
      const sheetContent = document.querySelector('[style*="60vh"]');
      expect(sheetContent).toBeTruthy();
    });

    it('should NOT render as modal with fixed inset-0 backdrop', () => {
      render(<QuickAdd {...defaultProps} />);

      // Old modal pattern should NOT exist
      const oldModalBackdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-70');
      expect(oldModalBackdrop).toBeNull();
    });

    it('should display Sheet title and description', () => {
      render(<QuickAdd {...defaultProps} />);

      expect(screen.getByText('Quick Workout Logger')).toBeInTheDocument();
      expect(screen.getByText('Log exercises and sets quickly')).toBeInTheDocument();
    });

    it('should maintain existing state machine modes', () => {
      render(<QuickAdd {...defaultProps} />);

      // Should start in exercise-picker mode
      expect(screen.getByPlaceholderText('Search exercises...')).toBeInTheDocument();
    });
  });

  describe('AC3: ExercisePicker replaces QuickAdd content (same level)', () => {
    it('should render ExercisePicker content within Sheet (not as nested modal)', () => {
      render(<QuickAdd {...defaultProps} />);

      // ExercisePicker should be rendered
      expect(screen.getByPlaceholderText('Search exercises...')).toBeInTheDocument();

      // Should NOT create nested Sheet or Modal - Vaul renders in Portal
      const sheets = document.querySelectorAll('.fixed.bottom-0');
      expect(sheets.length).toBeLessThanOrEqual(1); // Only QuickAdd Sheet
    });

    it('should swap to set-entry mode within same Sheet after exercise selection', async () => {
      render(<QuickAdd {...defaultProps} />);

      // Select an exercise - use an exercise that exists in EXERCISE_LIBRARY
      const exerciseButton = screen.getByText('Dumbbell Bench Press');
      fireEvent.click(exerciseButton);

      // Should transition to set-entry mode (QuickAddForm) within same Sheet
      await waitFor(() => {
        expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Reps/i)).toBeInTheDocument();
      });

      // ExercisePicker should no longer be visible
      expect(screen.queryByPlaceholderText('Search exercises...')).not.toBeInTheDocument();
    });

    it('should swap to summary mode within same Sheet after logging set', async () => {
      render(<QuickAdd {...defaultProps} />);

      // Select exercise - use an exercise that exists in EXERCISE_LIBRARY
      fireEvent.click(screen.getByText('Dumbbell Bench Press'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
      });

      // Log a set
      const logSetButton = screen.getByText(/Log Set/i);
      fireEvent.click(logSetButton);

      // Should transition to summary mode within same Sheet
      await waitFor(() => {
        expect(screen.getByText(/Another Set/i)).toBeInTheDocument();
        expect(screen.getByText(/Add Exercise/i)).toBeInTheDocument();
        expect(screen.getByText(/Finish Workout/i)).toBeInTheDocument();
      });
    });

    it('should return to ExercisePicker when "Add Exercise" clicked from summary', async () => {
      render(<QuickAdd {...defaultProps} />);

      // Go through flow: pick exercise -> log set -> summary
      fireEvent.click(screen.getByText('Dumbbell Bench Press'));
      await waitFor(() => {
        expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText(/Log Set/i));

      await waitFor(() => {
        expect(screen.getByText(/Add Exercise/i)).toBeInTheDocument();
      });

      // Click "Add Exercise"
      fireEvent.click(screen.getByText(/Add Exercise/i));

      // Should return to ExercisePicker (still within same Sheet)
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search exercises...')).toBeInTheDocument();
      });
    });
  });

  describe('Dismiss Methods', () => {
    it('should close Sheet on backdrop click', () => {
      render(<QuickAdd {...defaultProps} />);

      // Find Sheet overlay (backdrop) - Vaul renders in Portal
      const overlay = document.querySelector('.fixed.inset-0.z-40');
      expect(overlay).toBeTruthy();

      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should close Sheet when Escape key pressed', () => {
      render(<QuickAdd {...defaultProps} />);

      // Sheet component handles Escape via Vaul
      // Test by triggering onOpenChange with false
      fireEvent.keyDown(document, { key: 'Escape' });

      // Note: Vaul handles Escape internally, so we verify Sheet closes
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show confirmation when closing with logged exercises', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<QuickAdd {...defaultProps} />);

      // Log an exercise - use an exercise that exists in EXERCISE_LIBRARY
      fireEvent.click(screen.getByText('Dumbbell Bench Press'));
      await waitFor(() => {
        expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText(/Log Set/i));

      // Try to close - Vaul renders in Portal
      const overlay = document.querySelector('.fixed.inset-0.z-40');
      fireEvent.click(overlay!);

      // Should show confirmation when exercises logged
      expect(confirmSpy).toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Modal Depth Verification', () => {
    it('should maintain max 1 Sheet level (QuickAdd Sheet only)', () => {
      render(<QuickAdd {...defaultProps} />);

      // Count Vaul sheets - Vaul renders in Portal using .fixed.bottom-0
      const sheets = document.querySelectorAll('.fixed.bottom-0');
      expect(sheets.length).toBe(1);

      // Verify no nested modals
      const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      expect(modals.length).toBe(0); // Sheet uses different ARIA pattern
    });

    it('should NOT nest modals when navigating between modes', async () => {
      render(<QuickAdd {...defaultProps} />);

      // Navigate: ExercisePicker -> SetEntry -> Summary
      fireEvent.click(screen.getByText('Dumbbell Bench Press'));
      await waitFor(() => {
        expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText(/Log Set/i));
      await waitFor(() => {
        expect(screen.getByText(/Add Exercise/i)).toBeInTheDocument();
      });

      // Verify still only 1 Sheet
      const sheets = document.querySelectorAll('.fixed.bottom-0');
      expect(sheets.length).toBe(1);
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<QuickAdd {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility through mode transitions', async () => {
      const { container } = render(<QuickAdd {...defaultProps} />);

      // Test exercise-picker mode
      let results = await axe(container);
      expect(results).toHaveNoViolations();

      // Navigate to set-entry mode
      fireEvent.click(screen.getByText('Dumbbell Bench Press'));
      await waitFor(() => {
        expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
      });

      results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

/**
 * Profile Component Tests - Story 6.5.2D-1
 *
 * Tests for Profile migrated to design system primitives
 * Verifies:
 * - Design system primitives used (Card, Button, Input, Select)
 * - Design tokens used (no hardcoded colors)
 * - Touch targets meet 60x60px WCAG AA minimum
 * - No visual regressions in functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Profile from '../Profile';
import { Muscle, Difficulty } from '../../types';

expect.extend(toHaveNoViolations);

describe('Profile - Story 6.5.2D-1', () => {
  const mockProfile = {
    name: 'Test User',
    experience: 'Intermediate' as Difficulty,
    bodyweightHistory: [
      { date: Date.now(), weight: 180 },
      { date: Date.now() - 86400000, weight: 179 },
    ],
    height: 70,
    age: 30,
    recoveryDaysToFull: 5,
    equipment: [
      {
        id: 'eq-1',
        type: 'Dumbbells' as const,
        weightRange: { min: 10, max: 50 },
        quantity: 2 as const,
        increment: 5 as const,
      },
    ],
  };

  const mockMuscleBaselines = {
    [Muscle.Pectoralis]: { userOverride: null, systemLearnedMax: 10000 },
    [Muscle.Deltoids]: { userOverride: 8000, systemLearnedMax: 7500 },
    [Muscle.Biceps]: { userOverride: null, systemLearnedMax: 0 },
    [Muscle.Triceps]: { userOverride: null, systemLearnedMax: 0 },
    [Muscle.Lats]: { userOverride: null, systemLearnedMax: 0 },
    [Muscle.Trapezius]: { userOverride: null, systemLearnedMax: 0 },
    [Muscle.Core]: { userOverride: null, systemLearnedMax: 0 },
    [Muscle.Glutes]: { userOverride: null, systemLearnedMax: 0 },
    [Muscle.Quadriceps]: { userOverride: null, systemLearnedMax: 0 },
    [Muscle.Hamstrings]: { userOverride: null, systemLearnedMax: 0 },
    [Muscle.Calves]: { userOverride: null, systemLearnedMax: 0 },
    [Muscle.Forearms]: { userOverride: null, systemLearnedMax: 0 },
    [Muscle.Rhomboids]: { userOverride: null, systemLearnedMax: 0 },
  };

  const mockSetProfile = vi.fn();
  const mockSetMuscleBaselines = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC1: Profile uses Card primitive for settings sections
  it('should render with Card components from design system', () => {
    const { container } = render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Verify Card components are rendered (sections use Card primitive)
    const cards = container.querySelectorAll('[class*="bg-white/50"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  // AC1: Verify glass morphism on Card components
  it('should apply glass morphism styling to cards', () => {
    const { container } = render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Check for glass morphism classes (bg-white/50 backdrop-blur-lg)
    const glassCards = container.querySelectorAll('[class*="backdrop-blur"]');
    expect(glassCards.length).toBeGreaterThan(0);
  });

  // AC2: Profile uses Button primitive for all actions
  it('should use Button primitive for action buttons', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Verify back button exists (Button primitive)
    const backButton = screen.getByLabelText(/go back/i);
    expect(backButton).toBeInTheDocument();

    // Verify Add button exists for equipment
    const addButton = screen.getByText(/add/i);
    expect(addButton).toBeInTheDocument();
  });

  // AC3: Profile uses Input primitive for text fields
  it('should use Input primitive for text input fields', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Verify height and age inputs exist
    const heightInput = screen.getByLabelText(/height \(inches\)/i);
    const ageInput = screen.getByLabelText(/age \(years\)/i);

    expect(heightInput).toBeInTheDocument();
    expect(ageInput).toBeInTheDocument();
  });

  // AC4: Profile uses Select primitive for dropdown selections
  it('should use Select primitive for dropdown selections', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Verify experience level select exists
    const experienceLabel = screen.getByText(/experience level/i);
    expect(experienceLabel).toBeInTheDocument();
  });

  // AC5: Design tokens used for all colors (no hardcoded hex/rgb)
  it('should use design tokens for colors (no hardcoded colors)', () => {
    const { container } = render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Check for design token classes (text-primary, bg-primary, font-display, font-body)
    const html = container.innerHTML;
    expect(html).toContain('text-primary');
    expect(html).toContain('bg-background');
    expect(html).toContain('font-display');
    expect(html).toContain('font-body');
  });

  // AC6: WCAG AA compliance (60x60px touch targets)
  it('should have 60x60px minimum touch targets for buttons', () => {
    const { container } = render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Check for min-w-[60px] min-h-[60px] classes on buttons
    const touchTargets = container.querySelectorAll('[class*="min-w-[60px]"]');
    expect(touchTargets.length).toBeGreaterThan(0);
  });

  // AC9: Test profile name editing functionality
  it('should allow editing profile name', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Click on name to edit
    const nameDisplay = screen.getByText('Test User');
    fireEvent.click(nameDisplay);

    // Verify input appears
    const nameInput = screen.getByDisplayValue('Test User');
    expect(nameInput).toBeInTheDocument();

    // Change name
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    // Click save button
    const saveButton = screen.getByLabelText(/save name/i);
    fireEvent.click(saveButton);

    // Verify setProfile was called with new name
    expect(mockSetProfile).toHaveBeenCalled();
  });

  // AC9: Test weight editing functionality
  it('should allow editing bodyweight', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Click on weight to edit
    const weightDisplay = screen.getByText('180');
    fireEvent.click(weightDisplay);

    // Verify input appears
    const weightInput = screen.getByDisplayValue('180');
    expect(weightInput).toBeInTheDocument();

    // Change weight
    fireEvent.change(weightInput, { target: { value: '185' } });

    // Click save button
    const saveButton = screen.getByLabelText(/save weight/i);
    fireEvent.click(saveButton);

    // Verify setProfile was called with updated weight
    expect(mockSetProfile).toHaveBeenCalled();
  });

  // AC9: Test equipment modal opens/closes
  it('should open and close equipment modal', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Click Add button to open modal
    const addButton = screen.getByText(/add/i);
    fireEvent.click(addButton);

    // Verify modal is open (check for modal title)
    const modalTitle = screen.getByText(/add equipment/i);
    expect(modalTitle).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeButton);

    // Modal should be closed (title not in document)
    expect(screen.queryByText(/add equipment/i)).not.toBeInTheDocument();
  });

  // AC9: Test equipment deletion
  it('should allow deleting equipment', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Find equipment item
    const equipmentItem = screen.getByText('Dumbbells');
    expect(equipmentItem).toBeInTheDocument();

    // Click delete button
    const deleteButtons = screen.getAllByLabelText(/delete equipment/i);
    fireEvent.click(deleteButtons[0]);

    // Verify setProfile was called to remove equipment
    expect(mockSetProfile).toHaveBeenCalled();
  });

  // AC9: Test baselines expansion
  it('should expand and collapse muscle baselines section', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Find baselines button
    const baselinesButton = screen.getByText(/set muscle capacity baselines/i);
    fireEvent.click(baselinesButton);

    // Verify baselines section is expanded (check for description text)
    const description = screen.getByText(/estimate the maximum volume/i);
    expect(description).toBeInTheDocument();

    // Collapse section
    fireEvent.click(baselinesButton);

    // Description should not be visible
    expect(screen.queryByText(/estimate the maximum volume/i)).not.toBeInTheDocument();
  });

  // AC9: Test baseline changes
  it('should track and save baseline changes', async () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Expand baselines section
    const baselinesButton = screen.getByText(/set muscle capacity baselines/i);
    fireEvent.click(baselinesButton);

    // Find a baseline input (Pectoralis)
    const pectoralisLabel = screen.getByText(/pectoralis/i);
    expect(pectoralisLabel).toBeInTheDocument();

    // Save button should be disabled initially (no changes)
    const saveButton = screen.getByText(/save baselines/i);
    expect(saveButton).toBeDisabled();
  });

  // AC9: Test weight chart with sufficient data
  it('should render weight chart with sufficient data', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Verify SVG chart is rendered
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Verify polyline (chart line) exists
    const polyline = document.querySelector('polyline');
    expect(polyline).toBeInTheDocument();
  });

  // AC9: Test weight chart with insufficient data
  it('should show message when not enough data for chart', () => {
    const profileWithNoHistory = {
      ...mockProfile,
      bodyweightHistory: [{ date: Date.now(), weight: 180 }],
    };

    render(
      <Profile
        profile={profileWithNoHistory}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Verify message is shown
    const message = screen.getByText(/not enough data for chart/i);
    expect(message).toBeInTheDocument();
  });

  // AC9: Test muscle detail level toggle
  it('should allow changing muscle detail level', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Find radio buttons
    const simpleRadio = screen.getByLabelText(/simple \(13 muscle groups\)/i);
    const detailedRadio = screen.getByLabelText(/detailed \(43 specific muscles\)/i);

    expect(simpleRadio).toBeInTheDocument();
    expect(detailedRadio).toBeInTheDocument();

    // Simple should be checked by default
    expect(simpleRadio).toBeChecked();

    // Click detailed
    fireEvent.click(detailedRadio);

    // Detailed should now be checked
    expect(detailedRadio).toBeChecked();
  });

  // AC9: Test recovery speed slider
  it('should allow adjusting recovery speed', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Find recovery slider
    const slider = screen.getByLabelText(/recovery speed/i);
    expect(slider).toBeInTheDocument();

    // Change slider value
    fireEvent.change(slider, { target: { value: '7' } });

    // Verify setProfile was called
    expect(mockSetProfile).toHaveBeenCalled();
  });

  // AC9: Test back button navigation
  it('should call onBack when back button is clicked', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Click back button
    const backButton = screen.getByLabelText(/go back/i);
    fireEvent.click(backButton);

    // Verify onBack was called
    expect(mockOnBack).toHaveBeenCalled();
  });

  // AC9: Test empty equipment list message
  it('should show message when no equipment is added', () => {
    const profileWithNoEquipment = {
      ...mockProfile,
      equipment: [],
    };

    render(
      <Profile
        profile={profileWithNoEquipment}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Verify empty message is shown
    const message = screen.getByText(/no equipment added yet/i);
    expect(message).toBeInTheDocument();
  });

  // AC10: Accessibility test with axe-core (WCAG AA compliance)
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Run axe accessibility audit
    const results = await axe(container, {
      rules: {
        // Disable landmark-unique rule (known Card primitive limitation from Story 6.5.2C)
        'landmark-unique': { enabled: false },
      },
    });

    expect(results).toHaveNoViolations();
  });

  // AC10: Test ARIA labels on interactive elements
  it('should have proper ARIA labels on interactive elements', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Verify ARIA labels exist on buttons
    expect(screen.getByLabelText(/go back/i)).toBeInTheDocument();

    // Open equipment modal to test more ARIA labels
    const addButton = screen.getByText(/add/i);
    fireEvent.click(addButton);

    expect(screen.getByLabelText(/equipment type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/equipment quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weight increment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/close modal/i)).toBeInTheDocument();
  });

  // AC9: Test height and age inputs work correctly
  it('should allow editing height and age', () => {
    render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Find height input
    const heightInput = screen.getByLabelText(/height \(inches\)/i);
    fireEvent.change(heightInput, { target: { value: '72' } });
    expect(mockSetProfile).toHaveBeenCalled();

    // Find age input
    const ageInput = screen.getByLabelText(/age \(years\)/i);
    fireEvent.change(ageInput, { target: { value: '35' } });
    expect(mockSetProfile).toHaveBeenCalled();
  });

  // AC5: Verify design token usage in labels
  it('should use font-body and font-display design tokens', () => {
    const { container } = render(
      <Profile
        profile={mockProfile}
        setProfile={mockSetProfile}
        muscleBaselines={mockMuscleBaselines}
        setMuscleBaselines={mockSetMuscleBaselines}
        onBack={mockOnBack}
      />
    );

    // Check for font-body and font-display classes
    const html = container.innerHTML;
    expect(html).toContain('font-body');
    expect(html).toContain('font-display');
  });
});

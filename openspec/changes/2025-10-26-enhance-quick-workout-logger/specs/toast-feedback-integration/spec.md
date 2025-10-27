# toast-feedback-integration Specification

## Purpose
Replace browser alert() calls with branded Toast component for consistent, non-blocking user feedback.

## ADDED Requirements

### Requirement: Toast on Set Logged
**ID:** `TFI-001`
**Priority:** P1 (High)

The system SHALL display a Toast notification after each set is successfully logged.

#### Scenario: Toast shown after logging set

**Given** the user logs Set 1 of "Push-ups" (20 reps @ 0 lbs)
**When** the set is successfully saved to state
**Then** the system SHALL display Toast with message: "Set 1 logged!"
**And** the Toast SHALL auto-dismiss after 2 seconds
**And** the Toast SHALL NOT block interaction with summary view

#### Scenario: Toast shown with set details

**Given** the user logs Set 2 of "Bench Press" (135 lbs, 10 reps)
**When** the set is successfully logged
**Then** the Toast SHALL display: "Set 2 logged! 10 reps @ 135 lbs"
**And** the Toast SHALL use success styling (green background)

---

### Requirement: Toast on Workout Completion
**ID:** `TFI-002`
**Priority:** P0 (Critical)

The system SHALL display a Toast notification when workout is successfully saved.

#### Scenario: Toast on successful workout save

**Given** the user clicks "Finish Workout"
**And** the API successfully saves the workout
**When** the API responds with 200 OK
**Then** the system SHALL display Toast with message: "Workout saved!"
**And** the Toast SHALL show workout summary: "3 exercises, 9 sets, 15 minutes"
**And** the Toast SHALL auto-dismiss after 4 seconds

#### Scenario: Toast includes PR count

**Given** the workout resulted in 2 PRs
**When** the API returns PR info
**Then** the Toast SHALL display: "Workout saved! 🎉 2 PRs detected"
**And** the Toast SHALL highlight PR count
**And** the Toast SHALL use celebration styling

---

### Requirement: Toast on API Errors
**ID:** `TFI-003`
**Priority:** P0 (Critical)

The system SHALL display error Toast when API calls fail.

#### Scenario: Toast on workout save failure

**Given** the user clicks "Finish Workout"
**And** the API returns 500 Internal Server Error
**When** the error is caught
**Then** the system SHALL display error Toast
**And** the Toast SHALL show message: "Failed to save workout. Please try again."
**And** the Toast SHALL use error styling (red background)
**And** the Toast SHALL NOT auto-dismiss (manual close only)
**And** the modal SHALL remain open with logged sets preserved

#### Scenario: Toast on network failure

**Given** the API call fails due to network timeout
**When** the error is caught
**Then** the Toast SHALL display: "Network error. Check connection and retry."
**And** the Toast SHALL include retry button
**And** clicking retry SHALL re-attempt API call

---

## REMOVED Requirements

### Requirement: Browser Alert for Success
**ID:** `QA-UI-005` (from quick-add-ui)
**Status:** REMOVED

~~The system used browser alert() for success feedback.~~

**Rationale:** Replaced with Toast component for better UX and brand consistency.

#### Scenario: No more alert() calls

**Given** any successful operation in Quick Workout Logger
**When** feedback is needed
**Then** the system SHALL NOT call `alert()`
**Or** `window.alert()`
**And** the system SHALL use Toast component instead

---

## MODIFIED Requirements

### Requirement: Toast Component Integration
**ID:** `TOAST-001` (from App.tsx)
**Priority:** P0 (Critical)

The existing Toast component SHALL be accessible from QuickAdd component.

#### Scenario: QuickAdd can trigger Toast

**Given** the QuickAdd component is rendered
**When** QuickAdd needs to show feedback
**Then** QuickAdd SHALL call `onToast(message, type)` callback prop
**And** the App component SHALL receive the callback
**And** the App SHALL render Toast component with message
**And** the Toast SHALL be visible globally (not inside modal)

#### Scenario: Toast appears above modal

**Given** the QuickAdd modal is open
**When** a Toast is triggered
**Then** the Toast SHALL have z-index > modal z-index
**And** the Toast SHALL be visible and not hidden by modal overlay
**And** the Toast SHALL be positioned at top-center of viewport

---

## Integration Notes

**Toast Component Interface:**
```typescript
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;  // milliseconds, 0 = no auto-dismiss
  onClose: () => void;
}
```

**QuickAdd Prop Extension:**
```typescript
interface QuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;  // NEW
}
```

**Usage in QuickAdd:**
```typescript
// After logging set
onToast('Set 1 logged! 20 reps @ 0 lbs', 'success');

// After workout saved
onToast('Workout saved! 3 exercises, 9 sets', 'success');

// On error
onToast('Failed to save workout. Please try again.', 'error');
```

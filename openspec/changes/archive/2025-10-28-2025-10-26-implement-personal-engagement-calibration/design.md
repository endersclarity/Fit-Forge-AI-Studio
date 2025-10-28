# Design: Personal Muscle Engagement Calibration

**Change ID:** `implement-personal-engagement-calibration`
**Created:** 2025-10-26

---

## Overview

This document provides the technical design for enabling users to override default muscle engagement percentages for exercises based on their personal biomechanics and subjective experience.

---

## Architecture

### Data Flow

```
User Adjusts Calibration
   ↓
Frontend sends PUT /api/calibrations/:exerciseId
   ↓
Backend saves to user_exercise_calibrations table
   ↓
Frontend/Backend merges calibrations with defaults
   ↓
Merged engagement data used for recommendations & fatigue
```

### Layered Approach

**Layer 1: Defaults** (EXERCISE_LIBRARY in constants.ts)
- Population averages from exercise science
- Read-only, never modified
- Example: Push-ups = Pectoralis 75%, Triceps 75%, Deltoids 30%, Core 35%

**Layer 2: User Calibrations** (user_exercise_calibrations table)
- User-specific overrides for individual exercises
- Sparse (only stores exercises the user has calibrated)
- Merged with defaults at runtime

**Effective Engagement** = User Calibration OR Default (if no calibration exists)

---

## Database Schema

### New Table: `user_exercise_calibrations`

```sql
CREATE TABLE IF NOT EXISTS user_exercise_calibrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exercise_id TEXT NOT NULL,           -- e.g., "ex03" (Push-up)
  muscle_name TEXT NOT NULL,           -- e.g., "Pectoralis"
  engagement_percentage REAL NOT NULL, -- e.g., 80.0
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, exercise_id, muscle_name)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_calibrations_user_exercise
  ON user_exercise_calibrations(user_id, exercise_id);
```

**Design Decisions:**
- `UNIQUE(user_id, exercise_id, muscle_name)` ensures one calibration per muscle per exercise per user
- Sparse storage: only store calibrated muscles (not all muscles for all exercises)
- `exercise_id` matches Exercise.id from EXERCISE_LIBRARY (e.g., "ex03")
- `muscle_name` matches Muscle enum values (e.g., "Pectoralis", "Triceps")

### Migration Script

Location: `backend/database/migrations/002_add_user_exercise_calibrations.sql`

```sql
-- Migration: Add user exercise calibrations table
-- Date: 2025-10-26
-- Purpose: Enable personal muscle engagement overrides

CREATE TABLE IF NOT EXISTS user_exercise_calibrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exercise_id TEXT NOT NULL,
  muscle_name TEXT NOT NULL,
  engagement_percentage REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, exercise_id, muscle_name)
);

CREATE INDEX IF NOT EXISTS idx_calibrations_user_exercise
  ON user_exercise_calibrations(user_id, exercise_id);
```

---

## API Design

### 1. GET /api/calibrations

**Purpose:** Fetch all calibrations for current user

**Response:**
```typescript
{
  [exerciseId: string]: {
    [muscleName: string]: number  // engagement percentage
  }
}
```

**Example:**
```json
{
  "ex03": {
    "Pectoralis": 80,
    "Triceps": 85
  },
  "ex05": {
    "Deltoids": 90
  }
}
```

---

### 2. GET /api/calibrations/:exerciseId

**Purpose:** Fetch calibrations for specific exercise (merged with defaults)

**Response:**
```typescript
{
  exerciseId: string;
  exerciseName: string;
  engagements: {
    muscle: string;
    percentage: number;
    isCalibrated: boolean;  // true if user override exists
  }[];
}
```

**Example:**
```json
{
  "exerciseId": "ex03",
  "exerciseName": "Push-up",
  "engagements": [
    { "muscle": "Pectoralis", "percentage": 80, "isCalibrated": true },
    { "muscle": "Triceps", "percentage": 85, "isCalibrated": true },
    { "muscle": "Deltoids", "percentage": 30, "isCalibrated": false },
    { "muscle": "Core", "percentage": 35, "isCalibrated": false }
  ]
}
```

---

### 3. PUT /api/calibrations/:exerciseId

**Purpose:** Save calibrations for specific exercise

**Request Body:**
```typescript
{
  calibrations: {
    [muscleName: string]: number  // engagement percentage
  }
}
```

**Example:**
```json
{
  "calibrations": {
    "Pectoralis": 80,
    "Triceps": 85,
    "Deltoids": 30,
    "Core": 35
  }
}
```

**Validation:**
- All percentages must be 0-100
- Total engagement should be reasonable (100-300%)
- Warn if deviation from default >50%

**Response:** Same as GET /api/calibrations/:exerciseId (merged data)

---

### 4. DELETE /api/calibrations/:exerciseId

**Purpose:** Reset exercise to default (remove all calibrations)

**Response:**
```typescript
{
  message: "Calibrations reset for exercise: Push-up",
  exerciseId: string
}
```

---

## Backend Implementation

### File: `backend/database/database.ts`

**New Functions:**

```typescript
/**
 * Get all calibrations for user
 */
function getUserCalibrations(): Record<string, Record<string, number>> {
  const calibrations = db.prepare(`
    SELECT exercise_id, muscle_name, engagement_percentage
    FROM user_exercise_calibrations
    WHERE user_id = 1
  `).all() as Array<{
    exercise_id: string;
    muscle_name: string;
    engagement_percentage: number;
  }>;

  const result: Record<string, Record<string, number>> = {};
  for (const cal of calibrations) {
    if (!result[cal.exercise_id]) {
      result[cal.exercise_id] = {};
    }
    result[cal.exercise_id][cal.muscle_name] = cal.engagement_percentage;
  }

  return result;
}

/**
 * Get calibrations for specific exercise (merged with defaults)
 */
function getExerciseCalibrations(exerciseId: string): {
  exerciseId: string;
  exerciseName: string;
  engagements: Array<{
    muscle: string;
    percentage: number;
    isCalibrated: boolean;
  }>;
} {
  // Find exercise in library
  const exercise = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
  if (!exercise) {
    throw new Error(`Exercise not found: ${exerciseId}`);
  }

  // Get user calibrations for this exercise
  const calibrations = db.prepare(`
    SELECT muscle_name, engagement_percentage
    FROM user_exercise_calibrations
    WHERE user_id = 1 AND exercise_id = ?
  `).all(exerciseId) as Array<{
    muscle_name: string;
    engagement_percentage: number;
  }>;

  // Create lookup map
  const calibrationMap: Record<string, number> = {};
  for (const cal of calibrations) {
    calibrationMap[cal.muscle_name] = cal.engagement_percentage;
  }

  // Merge with defaults
  const engagements = exercise.muscleEngagements.map(engagement => ({
    muscle: engagement.muscle,
    percentage: calibrationMap[engagement.muscle] ?? engagement.percentage,
    isCalibrated: !!calibrationMap[engagement.muscle]
  }));

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    engagements
  };
}

/**
 * Save calibrations for exercise
 */
function saveExerciseCalibrations(
  exerciseId: string,
  calibrations: Record<string, number>
): void {
  // Validate exercise exists
  const exercise = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
  if (!exercise) {
    throw new Error(`Exercise not found: ${exerciseId}`);
  }

  // Transaction: upsert all calibrations
  const upsert = db.prepare(`
    INSERT INTO user_exercise_calibrations (user_id, exercise_id, muscle_name, engagement_percentage)
    VALUES (1, ?, ?, ?)
    ON CONFLICT(user_id, exercise_id, muscle_name) DO UPDATE SET
      engagement_percentage = excluded.engagement_percentage,
      updated_at = CURRENT_TIMESTAMP
  `);

  const saveTransaction = db.transaction(() => {
    for (const [muscleName, percentage] of Object.entries(calibrations)) {
      upsert.run(exerciseId, muscleName, percentage);
    }
  });

  saveTransaction();
}

/**
 * Delete all calibrations for exercise
 */
function deleteExerciseCalibrations(exerciseId: string): void {
  db.prepare(`
    DELETE FROM user_exercise_calibrations
    WHERE user_id = 1 AND exercise_id = ?
  `).run(exerciseId);
}
```

### File: `backend/server.ts`

**New Routes:**

```typescript
// GET /api/calibrations
app.get('/api/calibrations', (req, res) => {
  try {
    const calibrations = getUserCalibrations();
    res.json(calibrations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/calibrations/:exerciseId
app.get('/api/calibrations/:exerciseId', (req, res) => {
  try {
    const { exerciseId } = req.params;
    const data = getExerciseCalibrations(exerciseId);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

// PUT /api/calibrations/:exerciseId
app.put('/api/calibrations/:exerciseId', (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { calibrations } = req.body;

    // Validation
    for (const [muscle, percentage] of Object.entries(calibrations)) {
      if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
        return res.status(400).json({
          error: `Invalid percentage for ${muscle}: ${percentage}`
        });
      }
    }

    saveExerciseCalibrations(exerciseId, calibrations);
    const updated = getExerciseCalibrations(exerciseId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE /api/calibrations/:exerciseId
app.delete('/api/calibrations/:exerciseId', (req, res) => {
  try {
    const { exerciseId } = req.params;
    const exercise = EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    deleteExerciseCalibrations(exerciseId);
    res.json({
      message: `Calibrations reset for exercise: ${exercise.name}`,
      exerciseId
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
```

---

## Frontend Implementation

### TypeScript Types

**File: `types.ts`**

```typescript
export interface ExerciseEngagement {
  muscle: string;
  percentage: number;
  isCalibrated: boolean;
}

export interface ExerciseCalibrationData {
  exerciseId: string;
  exerciseName: string;
  engagements: ExerciseEngagement[];
}

export interface CalibrationMap {
  [exerciseId: string]: {
    [muscleName: string]: number;
  };
}
```

### API Client Functions

**File: `api.ts`**

```typescript
/**
 * Get all user calibrations
 */
export async function getUserCalibrations(): Promise<CalibrationMap> {
  return apiRequest<CalibrationMap>('/calibrations');
}

/**
 * Get calibrations for specific exercise (merged with defaults)
 */
export async function getExerciseCalibrations(
  exerciseId: string
): Promise<ExerciseCalibrationData> {
  return apiRequest<ExerciseCalibrationData>(`/calibrations/${exerciseId}`);
}

/**
 * Save calibrations for exercise
 */
export async function saveExerciseCalibrations(
  exerciseId: string,
  calibrations: Record<string, number>
): Promise<ExerciseCalibrationData> {
  return apiRequest<ExerciseCalibrationData>(`/calibrations/${exerciseId}`, {
    method: 'PUT',
    body: JSON.stringify({ calibrations })
  });
}

/**
 * Reset exercise to defaults
 */
export async function deleteExerciseCalibrations(
  exerciseId: string
): Promise<{ message: string; exerciseId: string }> {
  return apiRequest(`/calibrations/${exerciseId}`, {
    method: 'DELETE'
  });
}
```

---

## UI Components

### 1. Engagement Viewer Modal

**File: `components/EngagementViewer.tsx`**

**Purpose:** Display muscle engagement breakdown for an exercise

**Features:**
- Horizontal bars showing engagement percentage for each muscle
- Color-coded by percentage (red = high, yellow = medium, blue = low)
- "Default" or "Calibrated by you" label on each muscle
- "Edit" button to enter calibration mode
- Accessible from Exercise Library and Recommendations screen

**Visual:**
```
┌────────────────────────────────────┐
│   Push-up Muscle Engagement        │
├────────────────────────────────────┤
│ Pectoralis (Calibrated by you)     │
│ ████████████████░░░░░░░░░░  80%   │
│                                    │
│ Triceps (Calibrated by you)        │
│ █████████████████░░░░░░░░  85%    │
│                                    │
│ Deltoids (Default)                 │
│ ██████░░░░░░░░░░░░░░░░░░  30%    │
│                                    │
│ Core (Default)                     │
│ ███████░░░░░░░░░░░░░░░░░  35%    │
│                                    │
│          [Edit Calibration]        │
└────────────────────────────────────┘
```

---

### 2. Calibration Editor Modal

**File: `components/CalibrationEditor.tsx`**

**Purpose:** Edit muscle engagement percentages with sliders

**Features:**
- Slider for each muscle (0-100%)
- Real-time total percentage display
- Warning if total is unreasonable (<100% or >300%)
- Warning if deviation from default >50%
- "Reset to Default" button per exercise
- Save/Cancel buttons

**Visual:**
```
┌────────────────────────────────────┐
│   Calibrate Push-up Engagement     │
├────────────────────────────────────┤
│ Pectoralis                         │
│ ●────────────────────○─────  80%  │
│ Default: 75% (+5%)                 │
│                                    │
│ Triceps                            │
│ ●─────────────────────○────  85%  │
│ Default: 75% (+10%)                │
│                                    │
│ Deltoids                           │
│ ●──────○───────────────────  30%  │
│ Default: 30% (0%)                  │
│                                    │
│ Core                               │
│ ●───────○──────────────────  35%  │
│ Default: 35% (0%)                  │
│                                    │
│ Total Engagement: 230% ✓           │
│                                    │
│ [Reset to Default] [Cancel] [Save] │
└────────────────────────────────────┘
```

**Validation Logic:**
```typescript
function validateCalibrations(
  calibrations: Record<string, number>,
  defaults: Record<string, number>
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Calculate total
  const total = Object.values(calibrations).reduce((sum, v) => sum + v, 0);

  // Check reasonable range
  if (total < 100) {
    warnings.push('Total engagement is unusually low (<100%). This may affect recommendations.');
  }
  if (total > 300) {
    warnings.push('Total engagement is very high (>300%). Consider reducing some muscles.');
  }

  // Check large deviations
  for (const [muscle, percentage] of Object.entries(calibrations)) {
    const defaultValue = defaults[muscle] ?? 0;
    const deviation = Math.abs(percentage - defaultValue);
    const percentChange = (deviation / defaultValue) * 100;

    if (percentChange > 50) {
      warnings.push(
        `${muscle} differs by ${Math.round(percentChange)}% from default. ` +
        `Are you sure this is correct?`
      );
    }
  }

  return {
    valid: warnings.length === 0 || total >= 50, // Allow warnings, but block if total < 50%
    warnings
  };
}
```

---

### 3. Calibration Badge

**File: `components/CalibrationBadge.tsx`**

**Purpose:** Show "Calibrated" indicator on exercises with user overrides

**Visual:**
```tsx
{isCalibrated && (
  <span className="calibration-badge" title="You've customized this exercise">
    ⚙️ Calibrated
  </span>
)}
```

**Styling:**
- Small badge (subtle, not distracting)
- Icon + text or icon only
- Tooltip explaining customization
- Appears in Exercise Library and Recommendations

---

## Integration Points

### 1. Recommendation Algorithm

**File: `utils/exerciseRecommendations.ts`**

**Change:** Use calibrated engagement percentages instead of defaults

**Before:**
```typescript
const engagement = exercise.muscleEngagements.find(e => e.muscle === muscle);
const muscleVolume = totalVolume * (engagement.percentage / 100);
```

**After:**
```typescript
// Get calibrated engagement or default
const calibrations = await getUserCalibrations();
const exerciseCalibration = calibrations[exercise.id];
const engagementPercentage = exerciseCalibration?.[muscle]
  ?? exercise.muscleEngagements.find(e => e.muscle === muscle)?.percentage
  ?? 0;
const muscleVolume = totalVolume * (engagementPercentage / 100);
```

**Strategy:** Backend merges calibrations with defaults before returning data, so frontend can use merged data directly without conditional logic.

---

### 2. Fatigue Calculation

**File: `utils/fatigueCalculation.ts`**

**Change:** Use calibrated engagement when calculating muscle fatigue

**Implementation:** Same as recommendation algorithm - use merged engagement data from API.

---

### 3. Exercise Library UI

**File: `screens/ExerciseLibrary.tsx`**

**Add:**
- "View Engagement" button on each exercise card
- Calibration badge for calibrated exercises
- Opens Engagement Viewer modal on click

---

### 4. Recommendations Screen

**File: `screens/Recommendations.tsx`**

**Add:**
- "View Engagement" button on recommended exercises
- Calibration badge for calibrated exercises
- Opens Engagement Viewer modal on click

---

## User Education

### Help Article: "When and How to Calibrate Muscle Engagement"

**Location:** In-app help or docs section

**Content:**

> **What is Muscle Engagement Calibration?**
>
> FitForge uses default muscle engagement percentages based on exercise science research. However, every person's body is different:
> - Different leverages (arm length, torso length)
> - Different form variations (wide vs narrow grip)
> - Different mind-muscle connection
> - Different anatomical variations
>
> Calibration allows you to teach FitForge how exercises actually feel for YOUR body.
>
> **When Should I Calibrate?**
>
> 1. **You feel an exercise differently** - "Push-ups hit my triceps way more than my chest"
> 2. **You use a specific form variation** - "I do wide-grip pull-ups, so my lats work harder"
> 3. **You have an injury adaptation** - "I have a shoulder issue, so overhead presses hit my traps more"
> 4. **You've developed mind-muscle connection** - "I've learned to really activate my glutes in squats"
>
> **When Should I NOT Calibrate?**
>
> - You're a beginner (defaults are good starting points)
> - You're not sure how an exercise feels yet
> - You haven't done the exercise multiple times
>
> **How to Calibrate:**
>
> 1. Go to Exercise Library or Recommendations
> 2. Click "View Engagement" on an exercise
> 3. Click "Edit Calibration"
> 4. Adjust sliders to match your experience
> 5. Save changes
>
> **Tips:**
>
> - Start with small adjustments (±10-20%)
> - Calibrate exercises you do frequently
> - Don't overthink it - trust your instincts
> - You can always reset to defaults
>
> **Warnings:**
>
> - Large changes (>50% deviation) may affect recommendations significantly
> - Total engagement should be reasonable (100-300%)
> - If recommendations seem off, try resetting calibrations

---

## Success Criteria

### Functional Requirements
- ✅ User can view engagement breakdown for any exercise
- ✅ User can adjust engagement percentages with sliders
- ✅ User calibrations saved to database
- ✅ Recommendations use calibrated values
- ✅ Fatigue calculations use calibrated values
- ✅ "Calibrated" badge appears on adjusted exercises
- ✅ User can reset to defaults

### Non-Functional Requirements
- ✅ UI is responsive (mobile-friendly)
- ✅ Sliders have 44px touch targets (iOS accessibility)
- ✅ Validation prevents invalid inputs
- ✅ Warning for extreme adjustments (>50% deviation)
- ✅ Backend merge logic is efficient (no N+1 queries)
- ✅ Data persists across sessions

### Edge Cases Handled
- ✅ Exercise with no calibrations (uses defaults)
- ✅ Exercise with partial calibrations (merges with defaults)
- ✅ Invalid percentage values (rejected by API)
- ✅ Non-existent exercise ID (404 error)
- ✅ Total engagement unreasonable (warning shown)

---

## Testing Strategy

### Unit Tests
- Backend: Database CRUD operations for calibrations
- Backend: Merge logic (calibrations + defaults)
- Frontend: Validation logic for slider inputs
- Frontend: API client functions

### Integration Tests
- Save calibration → Verify in database
- Get calibration → Verify merged with defaults
- Delete calibration → Verify reset to defaults
- Recommendation algorithm uses calibrated values

### End-to-End Tests
1. User adjusts engagement → See recommendations change
2. User resets calibration → Recommendations revert to defaults
3. User calibrates exercise → Badge appears
4. User logs out → Calibrations persist on re-login

### Manual Testing
- Test on mobile (slider touch targets)
- Test validation warnings
- Test edge cases (all 0%, all 100%, extreme deviations)
- Test accessibility (keyboard navigation, screen readers)

---

## Performance Considerations

### Database Performance
- Index on `(user_id, exercise_id)` for fast lookups
- Sparse storage (only calibrated exercises stored)
- Batch inserts for multiple calibrations

### Frontend Performance
- Calibration data fetched once and cached
- Merge logic runs in-memory (no repeated API calls)
- Debounce slider changes (don't save on every pixel move)

### Backend Performance
- Merge calibrations with defaults in single query
- Use prepared statements for database operations
- Transaction for multi-muscle calibrations

---

## Future Enhancements

### Phase 2 (Out of Scope for V1)
- **Auto-calibration via ML:** Analyze failure patterns to suggest calibrations
- **Form variation presets:** Quick-select templates like "Wide-grip pull-up"
- **Community calibration data:** See calibrations from similar users (if multi-user)
- **Calibration history:** Track how calibrations change over time
- **Import/export calibrations:** Backup and restore user overrides

---

## Appendix: Example Use Cases

### Use Case 1: Long-Armed User

**Problem:** User has long arms, so push-ups feel harder on triceps than chest.

**Solution:**
1. Open Push-up in Exercise Library
2. Click "View Engagement"
3. Click "Edit Calibration"
4. Adjust: Pectoralis 70% → 60%, Triceps 75% → 90%
5. Save
6. Recommendations now prioritize other chest exercises (since push-ups are less effective for chest)

---

### Use Case 2: Wide-Grip Pull-ups

**Problem:** User does wide-grip pull-ups, which emphasize lats over biceps.

**Solution:**
1. Open Pull-up in Exercise Library
2. Click "View Engagement"
3. Click "Edit Calibration"
4. Adjust: Lats 120% → 130%, Biceps 87% → 70%
5. Save
6. Fatigue tracking reflects higher lat engagement

---

### Use Case 3: Shoulder Injury

**Problem:** User has shoulder injury, so overhead presses hit traps more than deltoids.

**Solution:**
1. Open Dumbbell Shoulder Press
2. Click "View Engagement"
3. Click "Edit Calibration"
4. Adjust: Deltoids 63% → 40%, Trapezius (add if missing) → 60%
5. Save
6. System avoids over-recommending shoulder presses (since deltoids are less engaged)

---

## Conclusion

This design provides a complete blueprint for implementing personal muscle engagement calibration. The system is:
- **Simple:** Users adjust sliders, system stores overrides
- **Flexible:** Handles partial calibrations and edge cases
- **Transparent:** Users see which exercises are calibrated
- **Safe:** Validation prevents breaking recommendations
- **Scalable:** Database schema supports future enhancements

Next step: Create `tasks.md` with detailed implementation checklist.

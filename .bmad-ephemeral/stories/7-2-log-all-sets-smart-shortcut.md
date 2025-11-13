# Story 7-2: "Log All Sets?" Smart Shortcut

## Epic Context
Epic 7: Intelligence Shortcuts

## Story Description
Implement pattern detection (2/3 sets match) and "Log All Sets?" bottom sheet for one-tap completion.

## Acceptance Criteria
- [ ] AC1: Pattern detected after 2/3 sets complete with same weight/reps
- [ ] AC2: Bottom sheet modal with pre-filled values
- [ ] AC3: "Yes" button logs all remaining sets
- [ ] AC4: Toast feedback: "3 sets logged!"
- [ ] AC5: Haptic confirmation (100ms)
- [ ] AC6: 60% interaction reduction verified

## Files to Modify
- `components/Workout.tsx` (pattern detection + modal)

## Dependencies
**Depends On:** 6-1 (BottomSheet), 6-3 (inline pickers)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] Pattern detection works
- [ ] Modal presents correctly
- [ ] One-tap logs remaining sets
- [ ] Interaction reduction measured
- [ ] Merged to main branch

---

## Technical Implementation Details

### Pattern Detection Algorithm

Detect when 2+ sets match weight and reps:

```typescript
// src/utils/detectLogAllSetsPattern.ts

interface SetData {
  weight: number
  reps: number
  completed: boolean
}

interface LogAllSetsPattern {
  shouldPrompt: boolean
  totalSets: number
  completedSets: number
  remainingSets: number
  matchedWeight: number
  matchedReps: number
}

export function detectLogAllSetsPattern(sets: SetData[]): LogAllSetsPattern {
  const completedSets = sets.filter(s => s.completed)
  const remainingSets = sets.filter(s => !s.completed)

  // Need at least 2 completed sets to detect pattern
  if (completedSets.length < 2) {
    return {
      shouldPrompt: false,
      totalSets: sets.length,
      completedSets: completedSets.length,
      remainingSets: remainingSets.length,
      matchedWeight: 0,
      matchedReps: 0
    }
  }

  // Check if all completed sets have same weight and reps
  const firstSet = completedSets[0]
  const allMatch = completedSets.every(
    set => set.weight === firstSet.weight && set.reps === firstSet.reps
  )

  // Only prompt if:
  // 1. Pattern detected (all completed sets match)
  // 2. At least 1 remaining set
  // 3. At least 2/3 of total sets completed
  const shouldPrompt = allMatch
    && remainingSets.length > 0
    && completedSets.length >= Math.ceil(sets.length * 0.66)

  return {
    shouldPrompt,
    totalSets: sets.length,
    completedSets: completedSets.length,
    remainingSets: remainingSets.length,
    matchedWeight: allMatch ? firstSet.weight : 0,
    matchedReps: allMatch ? firstSet.reps : 0
  }
}
```

### Smart Shortcut Modal

Present "Log All Sets?" prompt when pattern detected:

```tsx
// src/components/LogAllSetsModal.tsx
import { Drawer } from 'vaul'
import { CheckCircle } from 'lucide-react'

interface LogAllSetsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  remainingSets: number
  weight: number
  reps: number
  onConfirm: () => void
}

export function LogAllSetsModal({
  open,
  onOpenChange,
  remainingSets,
  weight,
  reps,
  onConfirm
}: LogAllSetsModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />

        <Drawer.Content
          className="fixed bottom-0 left-0 right-0
                     bg-white/95 dark:bg-slate-900/95
                     backdrop-blur-xl
                     rounded-t-[24px]
                     h-[40vh]
                     flex flex-col items-center justify-center
                     p-6"
        >
          {/* Icon */}
          <CheckCircle
            size={64}
            className="text-green-600 dark:text-green-400 mb-4"
          />

          {/* Title */}
          <h2 className="text-[32px] font-cinzel font-bold text-center
                        text-primary-dark dark:text-gray-50 mb-2">
            Log All Sets?
          </h2>

          {/* Description */}
          <p className="text-lg text-center text-primary-medium dark:text-gray-300 mb-6">
            Log {remainingSets} {remainingSets === 1 ? 'set' : 'sets'} of{' '}
            <span className="font-bold">{reps} reps</span> at{' '}
            <span className="font-bold">{weight} lbs</span>
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 py-4 rounded-xl
                        bg-white/80 dark:bg-white/10
                        border border-gray-300 dark:border-white/20
                        text-lg font-lato font-bold
                        text-primary-dark dark:text-gray-50
                        hover:bg-white dark:hover:bg-white/20
                        active:scale-95
                        transition-all"
            >
              No
            </button>

            <button
              onClick={handleConfirm}
              className="flex-1 py-4 rounded-xl
                        bg-primary dark:bg-primary-light
                        text-white dark:text-slate-900
                        text-lg font-lato font-bold
                        hover:brightness-110
                        active:scale-95
                        transition-all"
            >
              Yes
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
```

### Integration with Workout Flow

Detect pattern and show modal after logging a set:

```tsx
// In WorkoutBuilder.tsx
import { detectLogAllSetsPattern } from '@/utils/detectLogAllSetsPattern'
import { LogAllSetsModal } from '@/components/LogAllSetsModal'
import { useState, useEffect } from 'react'

function ExerciseCard({ exercise }) {
  const [sets, setSets] = useState(exercise.sets)
  const [showLogAllModal, setShowLogAllModal] = useState(false)
  const [pattern, setPattern] = useState(null)

  const handleLogSet = (setIndex: number, setData: SetData) => {
    // Mark set as completed
    const updatedSets = [...sets]
    updatedSets[setIndex] = { ...setData, completed: true }
    setSets(updatedSets)

    // Detect pattern
    const detected = detectLogAllSetsPattern(updatedSets)
    if (detected.shouldPrompt) {
      setPattern(detected)
      setShowLogAllModal(true)
    }
  }

  const handleLogAllSets = () => {
    // Log all remaining sets with matched values
    const updatedSets = sets.map(set =>
      set.completed
        ? set
        : {
            weight: pattern.matchedWeight,
            reps: pattern.matchedReps,
            completed: true
          }
    )
    setSets(updatedSets)

    // Show success toast
    showToast('All sets logged! 🎉')
  }

  return (
    <>
      {/* Exercise sets UI */}

      {/* Smart Shortcut Modal */}
      {pattern && (
        <LogAllSetsModal
          open={showLogAllModal}
          onOpenChange={setShowLogAllModal}
          remainingSets={pattern.remainingSets}
          weight={pattern.matchedWeight}
          reps={pattern.matchedReps}
          onConfirm={handleLogAllSets}
        />
      )}
    </>
  )
}
```

### Interaction Measurement Strategy

Measure 60% reduction by counting taps:

```typescript
// Track interactions before/after feature
interface InteractionMetrics {
  tapsBeforeFeature: number  // Manual: 8-12 taps per set × remaining sets
  tapsWithFeature: number     // Smart: 2 taps (Yes button + toast dismiss)
  reduction: number           // Percentage reduction
}

function measureInteractionReduction(
  remainingSets: number,
  avgTapsPerSet: number = 10
): InteractionMetrics {
  const tapsBeforeFeature = remainingSets * avgTapsPerSet
  const tapsWithFeature = 2 // "Yes" + dismiss
  const reduction = ((tapsBeforeFeature - tapsWithFeature) / tapsBeforeFeature) * 100

  return {
    tapsBeforeFeature,
    tapsWithFeature,
    reduction: Math.round(reduction)
  }
}

// Example: 3 remaining sets
// Before: 3 sets × 10 taps = 30 taps
// After: 2 taps (Yes + dismiss)
// Reduction: (30 - 2) / 30 = 93%  ✅ Exceeds 60% target
```

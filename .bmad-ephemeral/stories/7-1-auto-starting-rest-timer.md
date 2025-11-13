# Story 7-1: Auto-Starting Rest Timer

## Epic Context
Epic 7: Intelligence Shortcuts

## Story Description
Create compact rest timer banner that auto-starts after logging set, shows progress, and doesn't block content.

## Acceptance Criteria
- [ ] AC1: Timer auto-starts with 90s default after set logged
- [ ] AC2: Compact banner design (64px height, top position)
- [ ] AC3: Progress bar (4px height, animates 100% → 0%)
- [ ] AC4: Skip button and +15s button
- [ ] AC5: Gentle haptic pulse at 0s (20ms)
- [ ] AC6: Banner doesn't block next exercise view

## Files to Create
- `src/design-system/components/patterns/RestTimerBanner.tsx`

## Files to Modify
- `components/Workout.tsx` (auto-start logic)

## Dependencies
**Depends On:** 5-3 (Card primitive)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] Timer auto-starts after set
- [ ] Compact design verified
- [ ] Haptic feedback works
- [ ] Doesn't obstruct content
- [ ] Merged to main branch

---

## Technical Implementation Details

### Rest Timer Banner Component

Complete implementation with 64px height, progress bar, and auto-start:

```tsx
// src/components/RestTimer.tsx
import { X, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useHaptic } from '@/design-system/hooks/useHaptic'

interface RestTimerProps {
  initialSeconds?: number
  onComplete?: () => void
  onSkip?: () => void
}

export function RestTimer({
  initialSeconds = 90,
  onComplete,
  onSkip
}: RestTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(true)
  const { vibrate } = useHaptic()

  useEffect(() => {
    if (!isActive || secondsRemaining <= 0) return

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          vibrate(20) // Completion pulse
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, secondsRemaining, onComplete, vibrate])

  const progress = ((initialSeconds - secondsRemaining) / initialSeconds) * 100

  const handleSkip = () => {
    setIsActive(false)
    onSkip?.()
  }

  const handleAddTime = () => {
    setSecondsRemaining(prev => prev + 15)
    vibrate(10)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (secondsRemaining === 0 || !isActive) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50
                    h-16 bg-white/90 dark:bg-slate-900/90
                    backdrop-blur-xl
                    border-b border-primary/30 dark:border-primary-light/30
                    shadow-lg">
      <div className="relative h-full flex items-center justify-between px-4">
        {/* Progress Bar Background */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 dark:bg-primary-light/20">
          {/* Progress Bar Fill */}
          <div
            className="h-full bg-primary dark:bg-primary-light transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-lato font-bold text-primary-medium dark:text-gray-400">
            Rest Timer
          </span>
          <span className="text-[36px] font-lato font-semibold leading-none
                          text-primary dark:text-primary-light">
            {formatTime(secondsRemaining)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Add 15s Button */}
          <button
            onClick={handleAddTime}
            className="p-2 rounded-lg
                      bg-white/60 dark:bg-white/10
                      border border-gray-300/50 dark:border-white/10
                      hover:bg-white dark:hover:bg-white/20
                      active:scale-95
                      transition-all"
            aria-label="Add 15 seconds"
          >
            <Plus size={20} className="text-primary-dark dark:text-gray-50" />
            <span className="text-xs font-lato font-bold ml-1">15s</span>
          </button>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="p-2 rounded-lg
                      bg-white/60 dark:bg-white/10
                      border border-gray-300/50 dark:border-white/10
                      hover:bg-white dark:hover:bg-white/20
                      active:scale-95
                      transition-all"
            aria-label="Skip rest timer"
          >
            <X size={20} className="text-primary-dark dark:text-gray-50" />
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Auto-Start Integration

Trigger timer automatically after logging a set:

```tsx
// In WorkoutBuilder.tsx
import { RestTimer } from '@/components/RestTimer'
import { useState } from 'react'

function WorkoutBuilder() {
  const [showRestTimer, setShowRestTimer] = useState(false)

  const handleLogSet = async (exerciseId: string, setData: SetData) => {
    // Save set to database
    await saveSet(exerciseId, setData)

    // Auto-start rest timer
    setShowRestTimer(true)
  }

  return (
    <div>
      {/* Rest Timer Banner */}
      {showRestTimer && (
        <RestTimer
          initialSeconds={90}
          onComplete={() => setShowRestTimer(false)}
          onSkip={() => setShowRestTimer(false)}
        />
      )}

      {/* Workout content */}
      <div className="pt-16"> {/* Offset for fixed timer */}
        {/* Exercise cards, sets, etc. */}
      </div>
    </div>
  )
}
```

### Progress Bar Animation

CSS for smooth 1-second tick animation:

```css
/* Linear progression over 1 second */
.timer-progress {
  transition: width 1000ms linear;
}

/* Pulse animation at completion */
@keyframes pulse-green {
  0%, 100% { background-color: rgb(16, 185, 129); }
  50% { background-color: rgb(34, 197, 94); }
}

.timer-complete {
  animation: pulse-green 500ms ease-in-out;
}
```

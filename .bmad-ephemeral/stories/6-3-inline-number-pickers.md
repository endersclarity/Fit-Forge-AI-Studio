# Story 6-3: Inline Number Pickers

## Epic Context
Epic 6: Core Interaction Redesign

## Story Description
Create inline number picker with 60pt font display, +/- buttons (60x60px), haptic feedback, and tap-to-edit functionality.

## Acceptance Criteria
- [ ] AC1: Display value at 60pt font (gym readable from 2 feet)
- [ ] AC2: +/- buttons (60x60px touch targets)
- [ ] AC3: Tap value opens bottom sheet picker with keyboard
- [ ] AC4: Haptic feedback on button press (10ms vibration)
- [ ] AC5: Min/max validation, step increment support
- [ ] AC6: Replace inputs in Workout.tsx and QuickAddForm.tsx

## Files to Create
- `src/design-system/components/patterns/InlineNumberPicker.tsx`

## Dependencies
**Depends On:** 6-1 (BottomSheet), 5-3 (Button primitive)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] Component created with 60pt display
- [ ] Integrated into Workout and QuickAdd
- [ ] Haptic feedback works on mobile
- [ ] Tested with gloves/sweaty fingers
- [ ] Merged to main branch

## Technical Approach

### Component Implementation

Complete InlineNumberPicker component with haptic feedback:

```tsx
// src/design-system/components/patterns/InlineNumberPicker.tsx
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useHaptic } from '@/design-system/hooks/useHaptic'

interface InlineNumberPickerProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  label: string
  onTapEdit?: () => void
}

export function InlineNumberPicker({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit = '',
  label,
  onTapEdit
}: InlineNumberPickerProps) {
  const { vibrate } = useHaptic()

  const handleIncrement = () => {
    if (value < max) {
      onChange(Math.min(value + step, max))
      vibrate(10) // 10ms haptic pulse
    }
  }

  const handleDecrement = () => {
    if (value > min) {
      onChange(Math.max(value - step, min))
      vibrate(10)
    }
  }

  const handleTapValue = () => {
    vibrate(10)
    onTapEdit?.()
  }

  return (
    <div className="inline-flex items-center gap-2">
      {/* Label */}
      <label className="text-sm font-lato font-bold text-primary-medium
                        dark:text-gray-400 tracking-wide">
        {label}
      </label>

      {/* Picker Container: 180×80px */}
      <div className="flex items-center gap-2
                      bg-white/60 dark:bg-white/5
                      border border-gray-300/50 dark:border-white/10
                      rounded-2xl p-2">
        {/* Minus Button: 60×60px */}
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-[60px] h-[60px] rounded-xl
                     bg-primary dark:bg-primary-light
                     text-white dark:text-slate-900
                     hover:brightness-110
                     active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-100
                     flex items-center justify-center"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={24} strokeWidth={3} />
        </button>

        {/* Value Display: 60pt font */}
        <button
          onClick={handleTapValue}
          className="min-w-[60px] px-2
                     font-lato font-bold text-[60px] leading-none
                     text-primary-dark dark:text-gray-50
                     hover:text-primary dark:hover:text-primary-light
                     active:scale-95
                     transition-all"
          aria-label={`Edit ${label}`}
        >
          {value}
          {unit && (
            <span className="text-2xl text-primary-medium dark:text-gray-400 ml-1">
              {unit}
            </span>
          )}
        </button>

        {/* Plus Button: 60×60px */}
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-[60px] h-[60px] rounded-xl
                     bg-primary dark:bg-primary-light
                     text-white dark:text-slate-900
                     hover:brightness-110
                     active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-100
                     flex items-center justify-center"
          aria-label={`Increase ${label}`}
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
```

### Haptic Feedback Hook

Web Vibration API wrapper for haptic feedback:

```typescript
// src/design-system/hooks/useHaptic.ts

export function useHaptic() {
  const vibrate = (duration: number) => {
    // Check if vibration API is supported
    if ('vibrate' in navigator) {
      navigator.vibrate(duration)
    }
  }

  const vibratePattern = (pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  return { vibrate, vibratePattern }
}
```

**Usage:**
```tsx
const { vibrate } = useHaptic()

// Single pulse (10ms = subtle, 20ms = medium, 50ms = strong)
vibrate(10)

// Pattern: [vibrate, pause, vibrate, pause, ...]
vibratePattern([10, 50, 10]) // Double tap
```

### Bottom Sheet Integration for Tap-to-Edit

When user taps the value, open bottom sheet with number pad:

```tsx
// Usage in WorkoutBuilder.tsx
import { InlineNumberPicker } from '@/design-system/components/patterns/InlineNumberPicker'
import { NumberPadSheet } from '@/design-system/components/patterns/NumberPadSheet'
import { useState } from 'react'

function WorkoutSetRow() {
  const [weight, setWeight] = useState(135)
  const [reps, setReps] = useState(8)
  const [editingField, setEditingField] = useState<'weight' | 'reps' | null>(null)

  return (
    <div className="flex gap-4">
      {/* Weight Picker */}
      <InlineNumberPicker
        label="Weight"
        value={weight}
        onChange={setWeight}
        min={0}
        max={1000}
        step={5} // 5 lb increments
        unit="lbs"
        onTapEdit={() => setEditingField('weight')}
      />

      {/* Reps Picker */}
      <InlineNumberPicker
        label="Reps"
        value={reps}
        onChange={setReps}
        min={1}
        max={50}
        step={1}
        onTapEdit={() => setEditingField('reps')}
      />

      {/* Number Pad Sheet */}
      <NumberPadSheet
        open={editingField !== null}
        onOpenChange={(open) => !open && setEditingField(null)}
        title={`Edit ${editingField === 'weight' ? 'Weight' : 'Reps'}`}
        initialValue={editingField === 'weight' ? weight : reps}
        onSubmit={(value) => {
          if (editingField === 'weight') setWeight(value)
          else if (editingField === 'reps') setReps(value)
          setEditingField(null)
        }}
        unit={editingField === 'weight' ? 'lbs' : undefined}
      />
    </div>
  )
}
```

### NumberPadSheet Component

Bottom sheet with number pad for direct value entry:

```tsx
// src/design-system/components/patterns/NumberPadSheet.tsx
import { Drawer } from 'vaul'
import { Delete } from 'lucide-react'
import { useState } from 'react'
import { useSheetHeight } from '@/design-system/hooks/useSheetHeight'

interface NumberPadSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  initialValue: number
  onSubmit: (value: number) => void
  unit?: string
}

export function NumberPadSheet({
  open,
  onOpenChange,
  title,
  initialValue,
  onSubmit,
  unit = ''
}: NumberPadSheetProps) {
  const [inputValue, setInputValue] = useState(initialValue.toString())
  const height = useSheetHeight('confirmation') // 40vh/35vh/30vh

  const handleNumberPress = (num: string) => {
    setInputValue(prev => prev === '0' ? num : prev + num)
  }

  const handleBackspace = () => {
    setInputValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0')
  }

  const handleSubmit = () => {
    const value = parseInt(inputValue, 10)
    if (!isNaN(value)) {
      onSubmit(value)
    }
  }

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />

        <Drawer.Content
          className="fixed bottom-0 left-0 right-0
                     bg-white/95 dark:bg-slate-900/95
                     backdrop-blur-xl
                     rounded-t-[24px]"
          style={{ height }}
        >
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 bg-primary-pale dark:bg-gray-600
                          rounded-full mt-3" />

          {/* Title */}
          <h2 className="text-2xl font-cinzel font-bold text-center mt-4
                        text-primary-dark dark:text-gray-50">
            {title}
          </h2>

          {/* Display */}
          <div className="text-center py-6">
            <span className="text-6xl font-lato font-bold
                            text-primary-dark dark:text-gray-50">
              {inputValue}
            </span>
            {unit && (
              <span className="text-3xl text-primary-medium dark:text-gray-400 ml-2">
                {unit}
              </span>
            )}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 px-4 pb-4">
            {numbers.map(num => (
              <button
                key={num}
                onClick={() => handleNumberPress(num)}
                className="h-16 rounded-xl
                          bg-white/60 dark:bg-white/10
                          border border-gray-300/50 dark:border-white/10
                          text-2xl font-lato font-bold
                          text-primary-dark dark:text-gray-50
                          hover:bg-white dark:hover:bg-white/20
                          active:scale-95
                          transition-all"
              >
                {num}
              </button>
            ))}

            {/* Backspace */}
            <button
              onClick={handleBackspace}
              className="h-16 rounded-xl
                        bg-white/60 dark:bg-white/10
                        border border-gray-300/50 dark:border-white/10
                        hover:bg-white dark:hover:bg-white/20
                        active:scale-95
                        transition-all
                        flex items-center justify-center"
            >
              <Delete size={24} className="text-primary-dark dark:text-gray-50" />
            </button>

            {/* Submit Button (spans 2 columns) */}
            <button
              onClick={handleSubmit}
              className="col-span-2 h-16 rounded-xl
                        bg-primary dark:bg-primary-light
                        text-white dark:text-slate-900
                        text-xl font-lato font-bold
                        hover:brightness-110
                        active:scale-95
                        transition-all"
            >
              Done
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
```

### Min/Max Validation

Validation is built into the InlineNumberPicker component:

```typescript
// Increment with max validation
const handleIncrement = () => {
  if (value < max) {
    onChange(Math.min(value + step, max)) // Clamp to max
    vibrate(10)
  }
  // If at max, buttons disabled (opacity-50, cursor-not-allowed)
}

// Decrement with min validation
const handleDecrement = () => {
  if (value > min) {
    onChange(Math.max(value - step, min)) // Clamp to min
    vibrate(10)
  }
}
```

**Visual Feedback:**
- Buttons disable at min/max (`disabled:opacity-50`)
- No haptic feedback when disabled
- No value change when at limits

**Reference:**
- UX Design Section 3 (Component Specifications - Inline Number Picker)
- UX Design Section 4 (Interaction Patterns - Inline Number Picker Flow)

## Testing Strategy

**Unit Tests:**
```typescript
describe('InlineNumberPicker', () => {
  it('increments value on plus button click', () => {
    const onChange = jest.fn()
    render(<InlineNumberPicker value={10} onChange={onChange} label="Reps" />)

    fireEvent.click(screen.getByLabelText('Increase Reps'))
    expect(onChange).toHaveBeenCalledWith(11)
  })

  it('decrements value on minus button click', () => {
    const onChange = jest.fn()
    render(<InlineNumberPicker value={10} onChange={onChange} label="Reps" />)

    fireEvent.click(screen.getByLabelText('Decrease Reps'))
    expect(onChange).toHaveBeenCalledWith(9)
  })

  it('respects min constraint', () => {
    const onChange = jest.fn()
    render(<InlineNumberPicker value={1} min={1} onChange={onChange} label="Reps" />)

    fireEvent.click(screen.getByLabelText('Decrease Reps'))
    expect(onChange).not.toHaveBeenCalled() // No change at min
  })

  it('respects max constraint', () => {
    const onChange = jest.fn()
    render(<InlineNumberPicker value={50} max={50} onChange={onChange} label="Reps" />)

    fireEvent.click(screen.getByLabelText('Increase Reps'))
    expect(onChange).not.toHaveBeenCalled() // No change at max
  })

  it('opens number pad on value tap', () => {
    const onTapEdit = jest.fn()
    render(<InlineNumberPicker value={10} onChange={() => {}} label="Reps" onTapEdit={onTapEdit} />)

    fireEvent.click(screen.getByLabelText('Edit Reps'))
    expect(onTapEdit).toHaveBeenCalled()
  })
})
```

**Haptic Feedback Tests:**
```typescript
describe('Haptic Feedback', () => {
  it('vibrates on increment', () => {
    const vibrateSpy = jest.spyOn(navigator, 'vibrate')
    render(<InlineNumberPicker value={10} onChange={() => {}} label="Reps" />)

    fireEvent.click(screen.getByLabelText('Increase Reps'))
    expect(vibrateSpy).toHaveBeenCalledWith(10) // 10ms pulse
  })

  it('does not vibrate when disabled', () => {
    const vibrateSpy = jest.spyOn(navigator, 'vibrate')
    render(<InlineNumberPicker value={50} max={50} onChange={() => {}} label="Reps" />)

    fireEvent.click(screen.getByLabelText('Increase Reps'))
    expect(vibrateSpy).not.toHaveBeenCalled()
  })
})
```

**E2E Tests (Playwright):**
```typescript
test('inline number picker interaction', async ({ page }) => {
  await page.goto('/workout/builder')

  // Find weight picker
  const weightDisplay = page.locator('text=/^135$/')
  await expect(weightDisplay).toBeVisible()

  // Increment weight
  await page.click('button[aria-label="Increase Weight"]')
  await expect(page.locator('text=/^140$/')).toBeVisible() // +5 lbs step

  // Decrement weight
  await page.click('button[aria-label="Decrease Weight"]')
  await expect(page.locator('text=/^135$/')).toBeVisible()

  // Tap value to open number pad
  await weightDisplay.click()
  await expect(page.locator('text=Edit Weight')).toBeVisible()

  // Enter value on number pad
  await page.click('button:has-text("2")')
  await page.click('button:has-text("2")')
  await page.click('button:has-text("5")')
  await page.click('button:has-text("Done")')

  // Verify new value
  await expect(page.locator('text=/^225$/')).toBeVisible()
})
```

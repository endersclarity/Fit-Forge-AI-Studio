# Story 6-1: Bottom Sheet Navigation Component

## Epic Context
Epic 6: Core Interaction Redesign

## Story Description
Create Vaul-based bottom sheet component with 40%/60%/90% height variants, drag handle, swipe-to-dismiss.

## Acceptance Criteria
- [ ] AC1: Sheet component with height variants (40%, 60%, 90%)
- [ ] AC2: Drag handle (48x6px, pale blue)
- [ ] AC3: Swipe-to-dismiss gesture (threshold 40%, min 200px)
- [ ] AC4: Backdrop dismiss + X button + ESC key
- [ ] AC5: Spring animation (stiffness 300, damping 30)
- [ ] AC6: Responsive heights implemented per use case:
  - Exercise Picker: 90vh (mobile) → 70vh (tablet) → 60vh (desktop)
  - Quick Add: 60vh (mobile) → 60vh (tablet) → 50vh (desktop)
  - Filters: 40vh (all viewports)
  - Confirmations: 40vh → 35vh → 30vh
  - Rest Timer Settings: 50vh → 45vh → 40vh
  - Workout History: 85vh → 75vh → 65vh

## Technical Approach
Use Vaul library (already installed). Create wrapper component per UX Design Section 3.1.

**Reference:** UX Design Section 3.1, PRD Epic 6 Story 1, Gate Check Gap #1 (tablet heights)

### Responsive Height Implementation

Use a helper function to determine sheet height based on use case and viewport:

```typescript
// src/design-system/hooks/useSheetHeight.ts
import { useMediaQuery } from './useMediaQuery'

export type SheetUseCase =
  | 'exercisePicker'
  | 'quickAdd'
  | 'filter'
  | 'confirmation'
  | 'restTimer'
  | 'history'

export function useSheetHeight(useCase: SheetUseCase) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const heightMap: Record<SheetUseCase, { mobile: string; tablet: string; desktop: string }> = {
    exercisePicker: { mobile: '90vh', tablet: '70vh', desktop: '60vh' },
    quickAdd: { mobile: '60vh', tablet: '60vh', desktop: '50vh' },
    filter: { mobile: '40vh', tablet: '40vh', desktop: '40vh' },
    confirmation: { mobile: '40vh', tablet: '35vh', desktop: '30vh' },
    restTimer: { mobile: '50vh', tablet: '45vh', desktop: '40vh' },
    history: { mobile: '85vh', tablet: '75vh', desktop: '65vh' },
  }

  const heights = heightMap[useCase]

  if (isMobile) return heights.mobile
  if (isTablet) return heights.tablet
  if (isDesktop) return heights.desktop
  return heights.mobile // fallback
}

// Usage in component:
function ExercisePicker() {
  const height = useSheetHeight('exercisePicker')

  return (
    <Drawer.Root>
      <Drawer.Content style={{ height }}>
        {/* Sheet content */}
      </Drawer.Content>
    </Drawer.Root>
  )
}
```

### Vaul Library Integration

Install Vaul for bottom sheet functionality:

```bash
npm install vaul
```

**Basic Vaul API:**

```tsx
import { Drawer } from 'vaul'

function BottomSheetExample() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      {/* Trigger button */}
      <Drawer.Trigger asChild>
        <button className="btn-primary">Open Sheet</button>
      </Drawer.Trigger>

      {/* Backdrop */}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />

        {/* Sheet content */}
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0
                     bg-white dark:bg-slate-900
                     rounded-t-[24px]
                     h-[90vh]"
        >
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 bg-gray-300 dark:bg-gray-600
                          rounded-full mt-3" />

          {/* Your content here */}
          <div className="p-4">
            <h2 className="text-2xl font-cinzel">Sheet Title</h2>
            <p className="text-gray-600 dark:text-gray-300">Content here</p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
```

### Spring Animation Configuration

Vaul uses Framer Motion under the hood. Configure spring animations:

```tsx
import { Drawer } from 'vaul'

function AnimatedBottomSheet() {
  return (
    <Drawer.Root
      // Spring animation config
      snapPoints={[0.4, 0.6, 0.9]} // 40%, 60%, 90% height snap points
      defaultSnapPoint={0.6}
      modal={true}
      shouldScaleBackground={true}
    >
      {/* Drawer content */}
    </Drawer.Root>
  )
}
```

**Framer Motion Spring Config (from UX Design Section 5):**
```typescript
const springConfig = {
  type: "spring",
  stiffness: 300,  // Higher = faster animation
  damping: 30,     // Higher = less bounce
  mass: 1          // Higher = slower animation
}
```

### Exercise Picker Implementation

Complete bottom sheet for exercise selection:

```tsx
// src/components/ExercisePicker.tsx
import { Drawer } from 'vaul'
import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { useSheetHeight } from '@/design-system/hooks/useSheetHeight'

interface Exercise {
  id: string
  name: string
  category: string
  equipment: string[]
  primaryMuscles: string[]
}

interface ExercisePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectExercise: (exercise: Exercise) => void
  exercises: Exercise[]
}

export function ExercisePicker({
  open,
  onOpenChange,
  onSelectExercise,
  exercises
}: ExercisePickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const height = useSheetHeight('exercisePicker') // 90vh/70vh/60vh

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || ex.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['Strength', 'Cardio', 'Flexibility', 'Olympic', 'Plyometric']

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        <Drawer.Content
          className="fixed bottom-0 left-0 right-0
                     bg-white/95 dark:bg-slate-900/95
                     backdrop-blur-xl
                     rounded-t-[24px]
                     border-t border-gray-300/50 dark:border-white/10"
          style={{ height }}
        >
          {/* Drag handle */}
          <div
            className="mx-auto w-12 h-1.5 bg-primary-pale dark:bg-gray-600
                       rounded-full mt-3"
            aria-label="Drag to close"
          />

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b
                         border-gray-200 dark:border-white/10">
            <h2 className="text-2xl font-cinzel font-bold text-primary-dark
                          dark:text-gray-50">
              Add Exercise
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10
                        transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2
                          text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl
                          bg-white/60 dark:bg-white/5
                          border border-gray-300 dark:border-white/20
                          focus:border-primary dark:focus:border-primary-light
                          focus:ring-2 focus:ring-primary/20
                          text-primary-dark dark:text-gray-50
                          placeholder:text-primary-light dark:placeholder:text-gray-500"
                autoFocus
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(
                  selectedCategory === category ? null : category
                )}
                className={`px-5 py-2 rounded-full font-lato font-bold
                          tracking-wide text-sm whitespace-nowrap
                          transition-all
                          ${selectedCategory === category
                            ? 'bg-primary dark:bg-primary-light text-white dark:text-slate-900 shadow-md'
                            : 'bg-white/60 dark:bg-white/10 text-primary-medium dark:text-gray-300 border border-gray-300 dark:border-white/20'
                          }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-primary-medium dark:text-gray-400">
                  No exercises found
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => {
                      onSelectExercise(exercise)
                      onOpenChange(false)
                    }}
                    className="w-full p-4 rounded-2xl text-left
                              bg-white/50 dark:bg-white/10
                              backdrop-blur-sm
                              border border-gray-300/50 dark:border-white/10
                              hover:shadow-md hover:border-primary/50
                              transition-all
                              active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-cinzel font-semibold text-lg
                                      text-primary-dark dark:text-gray-50">
                          {exercise.name}
                        </h3>
                        <p className="text-sm text-primary-medium dark:text-gray-300">
                          {exercise.primaryMuscles.join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {exercise.equipment.map(eq => (
                          <span
                            key={eq}
                            className="px-2 py-1 rounded-full text-xs
                                      bg-badge-blue dark:bg-blue-900/50
                                      border border-badge-blue-border dark:border-blue-700
                                      text-primary-medium dark:text-blue-300"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
```

### Swipe-to-Dismiss Implementation

Vaul handles swipe gestures automatically. Configure thresholds:

```tsx
<Drawer.Root
  open={open}
  onOpenChange={setOpen}
  // Swipe config
  dismissible={true}
  snapPoints={[0.9]}
  // Close when swiped down 40% or 200px
  closeThreshold={0.4}
>
  {/* Drawer content */}
</Drawer.Root>
```

**Accessibility:**
- Drawer.Content has automatic ARIA attributes
- Esc key dismisses by default
- Focus trap enabled when open
- Backdrop click dismisses

**Reference:**
- UX Design Section 3 (Component Specifications - Bottom Sheet)
- UX Design Section 5 (Animation Specifications)
- Architecture Section 3 (Component Migration Strategy)

## Testing Strategy

**Unit Tests:**
```typescript
describe('ExercisePicker', () => {
  it('opens sheet when triggered', () => {
    render(<ExercisePicker open={true} {...props} />)
    expect(screen.getByText('Add Exercise')).toBeInTheDocument()
  })

  it('filters exercises by search query', () => {
    render(<ExercisePicker open={true} {...props} />)
    const search = screen.getByPlaceholderText('Search exercises...')
    fireEvent.change(search, { target: { value: 'bench' } })
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.queryByText('Squat')).not.toBeInTheDocument()
  })

  it('filters by category pill', () => {
    render(<ExercisePicker open={true} {...props} />)
    fireEvent.click(screen.getByText('Strength'))
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.queryByText('Running')).not.toBeInTheDocument()
  })
})
```

**E2E Tests (Playwright):**
```typescript
test('bottom sheet exercise picker flow', async ({ page }) => {
  await page.goto('/workout/builder')

  // Open sheet
  await page.click('button:has-text("Add Exercise")')
  await expect(page.locator('[role="dialog"]')).toBeVisible()

  // Search
  await page.fill('input[placeholder="Search exercises..."]', 'bench')
  await expect(page.locator('text=Bench Press')).toBeVisible()

  // Select exercise
  await page.click('text=Bench Press')
  await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  await expect(page.locator('text=Bench Press')).toBeInTheDocument()
})
```

**Accessibility Tests:**
```typescript
test('bottom sheet accessibility', async ({ page }) => {
  await page.goto('/workout/builder')
  await page.click('button:has-text("Add Exercise")')

  // Focus trap
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.tagName)
  expect(['INPUT', 'BUTTON']).toContain(focused)

  // ESC key
  await page.keyboard.press('Escape')
  await expect(page.locator('[role="dialog"]')).not.toBeVisible()
})
```

## Files to Create
- `src/design-system/components/patterns/BottomSheet.tsx`

## Dependencies
**Depends On:** 5-3 (primitives)
**Blocks:** 6-2 (modal nesting), 6-5 (FAB patterns)

## Estimated Effort
**1 day**

## Definition of Done
- [ ] Component created with all variants
- [ ] Swipe gesture works on mobile
- [ ] Accessibility verified (focus trap, keyboard)
- [ ] Storybook story added
- [ ] Merged to main branch

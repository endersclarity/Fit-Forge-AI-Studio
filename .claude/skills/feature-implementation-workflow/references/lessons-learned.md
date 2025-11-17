# Lessons Learned from Workflow Execution

## Planning Phase Issues

### Data Structure Assumptions
**Problem:** Plan assumed EXERCISE_LIBRARY was nested object but it's actually an array.

**Root Cause:** Plan was written without verifying actual codebase structure.

**Solution:** Before writing implementation plans, use Serena's `get_symbols_overview` or `search_for_pattern` to verify actual data structures:
```typescript
// Verify structure first
mcp__serena__search_for_pattern("export const EXERCISE_LIBRARY")
```

### Sub-agent Commit Behavior
**Problem:** Sub-agents claimed to commit but didn't always do so.

**Root Cause:** Sub-agents complete the task implementation but may not execute git operations.

**Solution:** Verify commits after sub-agent tasks, or explicitly include commit verification in task prompt.

## Execution Phase Issues

### useEffect Redirect Race Condition
**Problem:** Clicking "Finish Workout" navigated to wrong page.

**Root Cause:** SetLoggerPage had useEffect that redirected when `currentExercise` was null:
```typescript
useEffect(() => {
  if (!session.currentExercise) {
    navigate('/workout/select'); // Fires before intentional navigate!
  }
}, [session.currentExercise, navigate]);
```

When `handleFinish()` called `clearCurrentExercise()` before `navigate('/workout/summary')`, the useEffect fired first.

**Solution:** Don't modify state that triggers redirects immediately before navigating elsewhere. Let the destination component handle state cleanup.

### API Contract Mismatches
**Problem:** Save workout failed silently.

**Root Cause:** WorkoutSummaryPage sent simplified data format, but `workoutsAPI.create()` expected full `WorkoutSession` object.

**Solution:** Read the actual API method signature before integration:
```typescript
// WRONG - simplified format
const data = { date: ..., exercises: [...] };

// CORRECT - full WorkoutSession
const data = {
  id: '',
  name: 'Custom Workout',
  type: 'Push' as const,
  variation: 'A' as const,
  startTime: number,
  endTime: number,
  loggedExercises: [...],  // Not "exercises"
  muscleFatigueHistory: {},
};
```

### Docker HMR Limitations
**Problem:** New directories not recognized by Vite HMR.

**Root Cause:** Docker volume mounting doesn't automatically pick up new directories.

**Solution:**
- Simple file edits: `docker-compose restart frontend`
- New directories: `docker-compose down && docker-compose up -d --build`
- Wait 6-8 seconds after restart for Vite initialization

## Testing Phase Issues

### Stale DevTools Snapshots
**Problem:** Clicking elements failed with "Protocol error (DOM.resolveNode)".

**Root Cause:** UI re-rendered between snapshot and click, invalidating element UIDs.

**Solution:** Always take fresh snapshot immediately before clicking:
```typescript
mcp__chrome-devtools__take_snapshot()
// Then click using new UIDs
mcp__chrome-devtools__click({ uid: "fresh_uid" })
```

### Form Validation UX
**Problem:** "Log Set" button appeared disabled despite visible values.

**Root Cause:** Input showed placeholder text, but actual state was empty string.

**Solution:** Initialize form state with sensible defaults:
```typescript
// WRONG - empty state with placeholder
const [weight, setWeight] = useState('');
<input placeholder="135" />  // Confusing UX

// CORRECT - default values
const [weight, setWeight] = useState('135');
```

## Knowledge Capture Best Practices

### What to Include in Serena Memory
1. **Architecture decisions** with rationale
2. **API contracts** with exact field names and types
3. **Bug fixes** with root causes and solutions
4. **Code patterns** specific to the codebase (e.g., light-first dark mode)
5. **Integration points** showing where new code connects to existing code

### Memory Structure Template
```markdown
# [Feature] Implementation - Design Decisions & Patterns

## Overview
Brief description and date.

## Architecture Decisions
Why certain approaches were chosen.

## Key Implementation Details
Critical patterns and structures.

## Critical Bug Fixes
Root causes and solutions for issues encountered.

## API Integration
Exact contracts and data transformations.

## Files Created/Modified
Complete list with brief descriptions.
```

## Workflow Improvements for Future

1. **Verify codebase assumptions** before writing implementation plans
2. **Include API contract verification** as explicit sub-agent task
3. **Test each task incrementally** rather than batching all tasks
4. **Update Serena memory immediately** when discovering bugs (don't wait until end)
5. **Use Chrome DevTools for end-to-end testing** to catch navigation and state issues

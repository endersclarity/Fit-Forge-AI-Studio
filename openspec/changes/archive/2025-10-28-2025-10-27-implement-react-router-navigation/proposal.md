# Proposal: Implement React Router Navigation

**Change ID:** `implement-react-router-navigation`
**Created:** 2025-10-27
**Status:** Draft
**Priority:** High
**Estimated Effort:** 4-6 hours

---

## Problem Statement

Based on user feedback (USER_FEEDBACK.md, 2025-10-27) and current navigation frustration:

**User Quote:**
> "No back button visible - everything seems crammed into one page (localhost:3000). Need actual page navigation or modal flows, not everything on one screen."

**Current Issues:**
1. **Browser navigation broken** - Back/forward buttons don't work because no URL changes occur
2. **Poor mental model** - Users expect "I'm on a different page" but experience "state toggled"
3. **No bookmarkable URLs** - Can't save/share direct links to specific views
4. **Single URL for everything** - All views render at `localhost:3000` with no URL differentiation
5. **Confusing UX** - Standard web navigation patterns are missing

**Current Implementation:**
- App.tsx uses `view` state variable with conditional rendering
- Callbacks like `navigateTo('workout')` set state but don't change URL
- 7 distinct views: dashboard, workout, profile, bests, templates, analytics, muscle-baselines
- Components receive `onBack` callbacks that set state back to 'dashboard'

---

## Goals

### Primary Goal
Replace state-based view switching with **proper client-side routing** using React Router, enabling standard browser navigation and URL-based view management.

### Success Criteria
1. ✅ Browser back/forward buttons work correctly
2. ✅ Each view has its own URL (e.g., `/workout`, `/templates`, `/profile`)
3. ✅ URLs are bookmarkable and shareable
4. ✅ Navigation feels like a standard web application
5. ✅ Existing functionality preserved (no features lost)
6. ✅ State management updated to work with routing
7. ✅ Docker serve configuration supports client-side routing

---

## Proposed Solution

### Route Structure

```
/                    → Dashboard (default)
/workout             → Workout Tracker
/profile             → Profile & Settings
/bests               → Personal Bests
/templates           → Workout Templates
/analytics           → Analytics & Stats
/muscle-baselines    → Muscle Baselines Configuration
```

### Implementation Approach

#### 1. Install React Router

```bash
npm install react-router-dom
```

#### 2. Wrap App in BrowserRouter

```typescript
// index.tsx
import { BrowserRouter } from 'react-router-dom';

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

#### 3. Replace State-Based Navigation with Routes

```typescript
// App.tsx
import { Routes, Route, useNavigate } from 'react-router-dom';

const App: React.FC = () => {
  const navigate = useNavigate();

  // Remove: const [view, setView] = useState<View>("dashboard");
  // Remove: const navigateTo = (v: View) => setView(v);

  return (
    <div className="max-w-2xl mx-auto">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <Routes>
        <Route path="/" element={
          <Dashboard
            profile={profile}
            workouts={workouts}
            muscleBaselines={muscleBaselines}
            templates={templates}
            onStartWorkout={() => navigate('/workout')}
            onNavigateToProfile={() => navigate('/profile')}
            onNavigateToBests={() => navigate('/bests')}
            onNavigateToTemplates={() => navigate('/templates')}
            onNavigateToAnalytics={() => navigate('/analytics')}
            onNavigateToMuscleBaselines={() => navigate('/muscle-baselines')}
          />
        } />

        <Route path="/workout" element={
          <WorkoutTracker
            onFinishWorkout={handleFinishWorkout}
            onCancel={() => navigate('/')}
            allWorkouts={workouts}
            personalBests={personalBests}
            userProfile={profile}
            muscleBaselines={muscleBaselines}
            initialData={recommendedWorkout}
          />
        } />

        <Route path="/profile" element={
          <Profile
            profile={profile}
            setProfile={setProfile}
            muscleBaselines={muscleBaselines}
            setMuscleBaselines={setMuscleBaselines}
            onBack={() => navigate('/')}
          />
        } />

        <Route path="/bests" element={
          <PersonalBestsComponent
            personalBests={personalBests}
            onBack={() => navigate('/')}
          />
        } />

        <Route path="/templates" element={
          <WorkoutTemplates
            onBack={() => navigate('/')}
            onSelectTemplate={handleSelectTemplate}
          />
        } />

        <Route path="/analytics" element={<Analytics />} />

        <Route path="/muscle-baselines" element={<MuscleBaselinesPage />} />
      </Routes>
    </div>
  );
};
```

#### 4. Update Component Navigation

Components currently receive `onBack` callbacks - these will continue to work but now call `navigate('/')` instead of `setView('dashboard')`.

No component changes needed unless they have internal navigation logic.

#### 5. Server Configuration

Docker already uses `serve -s dist` which handles SPA routing correctly (serves index.html for all routes). No changes needed.

---

## Capabilities

This change introduces:

1. **`client-side-routing`** (NEW)
   - URL-based navigation
   - Browser history integration
   - Bookmarkable URLs
   - Back/forward button support

2. **`navigation-state-management`** (MODIFIED)
   - Remove view state management from App.tsx
   - Route-driven view rendering
   - Preserved global state (profile, workouts, etc.)

---

## Out of Scope

1. **URL state/query params** - V1 uses simple routes, no URL state encoding (e.g., `/workout?template=123`)
2. **Nested routing** - Flat route structure only
3. **Route guards/protection** - No auth/permission checks (single-user app)
4. **Animated transitions** - Simple instant navigation
5. **Back navigation warnings** - No "unsaved changes" prompts (future enhancement)

---

## Dependencies

- ✅ Current navigation uses state-based switching
- ✅ Docker serve already configured for SPA (`-s` flag)
- ⚠️  Need to install react-router-dom (new dependency)
- ⚠️  Components expect callback-based navigation (compatible with routing)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| State lost on navigation | High | Use Context API or keep state in App.tsx (current pattern) |
| URL state persistence on refresh | Medium | V1 accepts page reload = fresh state, V2 can add localStorage |
| Breaking existing navigation callbacks | High | Keep callback pattern, just change implementation to use navigate() |
| Docker serve configuration | Low | Already configured with `-s` flag for SPA routing |
| Bundle size increase | Low | React Router adds ~10-15KB gzipped (acceptable) |

---

## Implementation Phases

### Phase 1: Install and Setup (30 minutes)
- Install react-router-dom
- Wrap App in BrowserRouter (index.tsx)
- Test basic routing works
- Verify Docker serve handles routes

### Phase 2: Migrate Routes (2-3 hours)
- Replace view state with Routes component
- Update all navigateTo calls to use useNavigate
- Replace conditional rendering with Route elements
- Test each route individually

### Phase 3: State Management Validation (1 hour)
- Verify global state persists across navigation
- Test in-progress workout state handling
- Ensure muscle states, workouts, profile persist

### Phase 4: Testing & Polish (1-2 hours)
- Test all navigation flows
- Verify browser back/forward works
- Test direct URL access (refresh on /workout)
- Test Docker deployment
- Edge case handling

---

## Testing Plan

### Manual Testing Checklist
- [ ] Can navigate to each route via buttons
- [ ] Browser back button returns to previous view
- [ ] Browser forward button works
- [ ] Refreshing page on any route loads correctly
- [ ] Direct URL access works (type /workout in address bar)
- [ ] Global state (profile, workouts) persists across navigation
- [ ] Toast notifications work on all routes
- [ ] PR notifications work on all routes
- [ ] Docker deployment serves routes correctly
- [ ] All existing features work as before

### Navigation Flow Tests
- [ ] Dashboard → Workout → Back button → Dashboard
- [ ] Dashboard → Templates → Select template → Workout
- [ ] Dashboard → Profile → Back → Dashboard
- [ ] Dashboard → Bests → Back → Dashboard
- [ ] Dashboard → Analytics → Back → Dashboard
- [ ] Workout in progress → Back button (what happens?)

---

## Rollback Plan

If routing causes issues:
1. Git revert to previous commit
2. Remove react-router-dom dependency
3. Restore view state management
4. Alternative: Use hash routing (`HashRouter`) if BrowserRouter causes Docker issues

---

## State Management Considerations

**Current Pattern (Preserved):**
- Global state (profile, workouts, muscleBaselines, templates) stays in App.tsx
- Components receive data and callbacks as props
- Navigation callbacks trigger route changes instead of state changes

**Route-Specific Considerations:**
- **Dashboard** - No local state, just displays data
- **Workout** - Has active workout state; needs warning if user navigates away (future enhancement)
- **Profile** - Edits global profile state
- **Templates** - Displays templates list
- **Bests** - Read-only view of personal bests
- **Analytics** - Read-only stats view

**Recommendation:** Keep current pattern. React Router will handle URL changes, App.tsx continues to manage global state.

---

## Related

- **User Feedback:** USER_FEEDBACK.md (2025-10-27 entry)
- **Related Proposals:**
  - Homepage Information Architecture (already implemented)
  - Navigation Icon Clarity (separate UI proposal)

---

## Notes

**Why React Router?**
- Industry standard for React apps
- Excellent documentation and community support
- Handles edge cases (nested routes, redirects, 404s)
- Future-proof (can add features like route guards, lazy loading, etc.)
- ~10-15KB gzipped (minimal cost)

**Alternatives Considered:**
- **wouter** - Lighter weight but less features, smaller community
- **Manual history.pushState** - Reinventing the wheel, error-prone
- **Keep state-based** - Doesn't solve user's frustration with browser navigation

React Router is the right choice for this use case.

---

## Recommendation

**Status:** Ready for implementation

**Priority:** High - User is actively frustrated by lack of browser navigation

**Effort:** 4-6 hours is reasonable for the UX improvement

**Next Steps:**
1. Install react-router-dom
2. Implement Phase 1 (setup)
3. Implement Phase 2 (migrate routes)
4. Test thoroughly
5. Deploy to Docker and verify

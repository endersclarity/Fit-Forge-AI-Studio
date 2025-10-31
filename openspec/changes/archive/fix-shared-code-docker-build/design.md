# Design: Shared Code Architecture

## Overview

This design establishes a sustainable pattern for sharing code between the frontend and backend applications while maintaining compatibility with Docker containerization and preserving development workflow.

## Background

FitForge Local is structured as a monorepo containing separate frontend and backend applications that share some common code (types, constants, utilities). However, the project was not set up with proper workspace tooling, leading to ad-hoc code sharing attempts that broke the Docker build process.

## Problem Analysis

### Directory Structure Mismatch

**Development Environment:**
```
/project-root/
  ├── backend/
  │   ├── database/
  │   │   └── analytics.ts    # imports ../../shared/exercise-library
  │   └── types.ts
  ├── shared/
  │   └── exercise-library.ts
  └── types.ts
```

**Docker Container (Current Broken Attempt):**
```
/app/
  ├── database/
  │   └── analytics.ts    # imports ../../shared/exercise-library
  │                       # This looks for /shared/ (outside container!)
  ├── shared/
  │   └── exercise-library.ts
  └── types.ts
```

The relative path `../../shared/` from `/app/database/analytics.ts` tries to access `/shared/exercise-library` which doesn't exist. It should be `../shared/exercise-library`.

### Why Not Just Change the Imports?

Changing imports to `../shared/` would fix Docker but break development:

```typescript
// This works in Docker but breaks in development
import { EXERCISE_LIBRARY } from '../shared/exercise-library';

// From /app/database/analytics.ts:    ../shared/ → /app/shared/ ✅
// From backend/database/analytics.ts: ../shared/ → backend/shared/ ❌
```

We need **one set of imports that works in both environments**.

## Design Decision: Mirror Host Structure

### Solution

Restructure the Docker container to preserve the exact directory layout from development:

**Docker Container (Proposed):**
```
/app/
  ├── backend/
  │   ├── database/
  │   │   └── analytics.ts    # imports ../../shared/exercise-library
  │   └── types.ts
  ├── shared/
  │   └── exercise-library.ts
  └── types.ts
```

Now the relative path `../../shared/` from `/app/backend/database/analytics.ts` correctly resolves to `/app/shared/exercise-library`.

### Implementation in Dockerfile

**Current (Broken):**
```dockerfile
WORKDIR /app
COPY backend/package*.json ./
COPY shared/ ./shared/
COPY types.ts ./types.ts
COPY backend/ ./           # Flattens structure
RUN npm run build
```

**Proposed (Working):**
```dockerfile
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
WORKDIR /app
COPY shared/ ./shared/
COPY types.ts ./types.ts
COPY backend/ ./backend/   # Preserves structure
WORKDIR /app/backend
RUN npm run build
```

### Key Changes

1. **Install dependencies in /app/backend** - Package.json remains in its subdirectory
2. **Copy files to preserve structure** - Backend files go to `/app/backend/`, not `/app/`
3. **Build from backend directory** - TypeScript compilation happens in correct location
4. **Run from backend directory** - CMD executes from `/app/backend/`

## Type System Architecture

### Current Problem

Two `types.ts` files exist with overlapping definitions:

**Root `/types.ts`:**
```typescript
export enum Muscle { Pectoralis = "Pectoralis", ... }
export interface Exercise { id: string, name: string, ... }
// Frontend-specific types
export interface WorkoutFormData { ... }
```

**Backend `/backend/types.ts`:**
```typescript
export enum Muscle { Pectoralis = "Pectoralis", ... }  // DUPLICATE
export interface Exercise { ... }                       // DUPLICATE
// Backend-specific types
export interface DatabaseWorkout { ... }
```

### Design Solution: Type Hierarchy

**Root `/types.ts`** - Shared types used by both frontend and backend:
```typescript
export enum Muscle { Pectoralis = "Pectoralis", ... }
export interface Exercise { id: string, name: string, ... }
export interface MuscleEngagement { muscle: Muscle, percentage: number }
// Frontend-specific types
export interface WorkoutFormData { ... }
```

**Backend `/backend/types.ts`** - Backend-specific extensions:
```typescript
import { Muscle, Exercise, MuscleEngagement } from '../types';

// Re-export shared types for convenience
export { Muscle, Exercise, MuscleEngagement };

// Backend-specific types only
export interface DatabaseWorkout {
  id: number;
  user_id: number;
  started_at: string;
  // ...
}

export interface WorkoutResponse {
  workout_id: number;
  updated_muscle_states: MuscleStatesResponse;
  updated_personal_bests: PersonalBests;
  updated_baselines?: BaselineUpdate[];  // FIX: Add missing property
  prs_detected?: PRInfo[];
}
```

**Shared `/shared/exercise-library.ts`:**
```typescript
import { Exercise, Muscle } from '../types';  // Import from root

export const EXERCISE_LIBRARY: Exercise[] = [ ... ];
```

### Benefits

1. **Single Source of Truth** - Muscle and Exercise defined once
2. **Type Safety** - TypeScript catches drift immediately
3. **Clear Ownership** - Root = shared, backend/types.ts = backend-specific
4. **Easy Imports** - Backend code can import from `./types` or `../types` as needed
5. **No Duplication** - Maintenance burden eliminated

## Alternative Approaches Considered

### 1. TypeScript Path Mapping

Use `tsconfig.json` paths to create aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

**Pros:**
- Clean import syntax: `import { X } from '@shared/exercise-library'`

**Cons:**
- Path mapping only works at compile time
- Node.js runtime doesn't understand paths without additional tooling (tsconfig-paths)
- Adds complexity to build process
- Different configuration needed for development vs Docker

**Verdict:** Rejected - adds unnecessary complexity when simpler solution exists

### 2. Monorepo with Workspaces

Convert to yarn/pnpm workspaces:

```
/packages/
  /shared/
    package.json
  /frontend/
    package.json
  /backend/
    package.json
```

**Pros:**
- "Correct" architectural pattern for monorepos
- Proper dependency management
- Can publish internal packages

**Cons:**
- Massive restructuring required (1+ days work)
- Overkill for sharing one constant file
- Affects entire development workflow
- Risk of breaking existing functionality

**Verdict:** Rejected - disproportionate effort for current needs; revisit if sharing needs grow significantly

### 3. Backend-Owned Exercise Library

Move EXERCISE_LIBRARY to backend, frontend fetches via API:

**Pros:**
- Backend is source of truth
- No code sharing needed
- Clean separation of concerns

**Cons:**
- Requires API endpoint
- Frontend needs network call on startup
- Caching complexity
- More significant frontend refactoring
- Doesn't solve type sharing problem

**Verdict:** Rejected for now - interesting for future, but solves wrong problem (we still need to share types)

### 4. Code Duplication

Simply copy EXERCISE_LIBRARY to both frontend and backend:

**Pros:**
- Extremely simple
- Works immediately
- No architectural changes

**Cons:**
- Maintenance burden if exercise library changes
- Goes against DRY principle
- Doesn't scale to future sharing needs
- Doesn't solve type duplication

**Verdict:** Rejected - creates technical debt, doesn't address root cause

## Detailed Implementation Plan

### Phase 1: Restructure Backend Dockerfile

**File:** `backend/Dockerfile`

1. Update WORKDIR usage to preserve directory structure
2. Copy package.json to `/app/backend/` instead of `/app/`
3. Copy source files to `/app/backend/` instead of `/app/`
4. Update CMD to run from correct directory
5. Ensure build artifacts go to `/app/backend/dist/`

**File:** `docker-compose.yml`

- Build context already set to `.` (project root) ✅
- No changes needed

**File:** `backend/.dockerignore`

- Verify it doesn't exclude `/shared/` or `/types.ts`
- Update if necessary

### Phase 2: Consolidate Type Definitions

**File:** `/types.ts` (Root)

- Verify it contains all shared types
- Keep frontend-specific types here

**File:** `/backend/types.ts`

1. Remove duplicate Muscle enum
2. Remove duplicate Exercise interface
3. Add import: `import { Muscle, Exercise, MuscleEngagement } from '../types';`
4. Re-export for convenience: `export { Muscle, Exercise, MuscleEngagement };`
5. Keep only backend-specific types
6. Add missing `updated_baselines?` property to WorkoutResponse

**File:** `/shared/exercise-library.ts`

- Verify import is from `'../types'` (root types.ts)
- No changes needed if already correct

### Phase 3: Fix Pre-existing Type Errors

**File:** `/backend/server.ts`

The quick-add endpoints reference `updated_baselines` property that doesn't exist in WorkoutResponse type. After adding it to the type definition in Phase 2, verify the code is correct.

### Phase 4: Testing Strategy

**Build Testing:**
```bash
# Test backend Docker build
docker-compose build backend

# Test frontend Docker build (should still work)
docker-compose build frontend

# Full rebuild
docker-compose build
```

**Runtime Testing:**
```bash
# Start containers
docker-compose up -d

# Check backend health
curl http://localhost:3001/api/health

# Test import script (uses shared code)
npm run import-workout workouts/test-workout.json

# Verify frontend loads
open http://localhost:3000
```

**Type Safety Verification:**
```bash
# Backend TypeScript compilation
cd backend && npm run build

# Frontend TypeScript compilation
npm run build
```

## Edge Cases and Considerations

### 1. Package.json Location

The backend package.json must remain at `/app/backend/package.json` in Docker. This means:

- `COPY backend/package*.json ./backend/` is required
- `npm install` must run from `/app/backend/`
- Build scripts in package.json are relative to backend folder

### 2. Compiled Output Location

After `npm run build`, compiled JavaScript goes to `/app/backend/dist/`. The CMD must reference this:

```dockerfile
CMD ["node", "dist/server.js"]
```

Since we `WORKDIR /app/backend` before CMD, this resolves correctly to `/app/backend/dist/server.js`.

### 3. Import Script Compatibility

The import scripts run on the HOST (not in Docker) using `tsx`. They need to work with the host directory structure. Since we're preserving the structure, no changes needed.

### 4. Frontend Dockerfile

The frontend Dockerfile already uses `COPY . .` which copies the entire project root. No changes needed, but verify it still builds after we modify the shared folder.

### 5. Future Shared Code

This pattern scales naturally:

```
/shared/
  /constants/
    exercise-library.ts
    equipment-types.ts
  /utils/
    validation.ts
    formatting.ts
```

All can be imported using relative paths that work in both environments.

## Rollback Plan

If this change causes issues:

1. **Immediate Rollback:** `git revert` the commit
2. **Use Duplication Workaround:** Copy EXERCISE_LIBRARY to `backend/constants.ts`
3. **Docker Still Builds:** Revert Dockerfile changes to previous working state
4. **Types Handled Separately:** Keep type consolidation if it works, revert Docker changes only

The proposal is designed with small, independent commits so partial rollback is possible.

## Success Metrics

1. ✅ Backend Docker image builds without TypeScript errors
2. ✅ Frontend Docker image still builds
3. ✅ Both containers start successfully via docker-compose
4. ✅ Backend can import EXERCISE_LIBRARY from shared/
5. ✅ No type errors in either frontend or backend
6. ✅ Import scripts work with shared code
7. ✅ All existing functionality continues working

## Future Considerations

### When to Revisit Monorepo

Consider full monorepo restructuring with workspaces when:

- Sharing 5+ separate modules between frontend/backend
- Need versioning for shared packages
- Multiple teams working on different parts
- Publishing shared code to npm

### Backend-Owned Data

Consider moving EXERCISE_LIBRARY to backend API when:

- Exercise library needs to be editable by users
- Different deployments need different exercise sets
- Exercise data grows significantly (100+ exercises)
- Need centralized data management

### Path Mapping

Consider adding path aliases when:

- Import paths become deeply nested (4+ levels)
- Team prefers absolute imports over relative
- Willing to add build tooling (tsconfig-paths, bundler)

## Conclusion

The "Mirror Host Structure" approach provides the optimal balance of simplicity, maintainability, and future scalability. It solves the immediate Docker build issue while establishing patterns that can grow with the project's needs.

This design requires minimal code changes, preserves existing workflows, and creates a clear precedent for future code sharing between frontend and backend applications.

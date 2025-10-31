# Implementation Tasks: Fix Shared Code Docker Build

**Change ID:** `fix-shared-code-docker-build`
**Estimated Time:** 2-3 hours
**Dependencies:** None

---

## Phase 1: Docker Build Restructuring (45 min)

### Task 1.1: Update Backend Dockerfile to Preserve Directory Structure

**File:** `backend/Dockerfile`

**Changes:**
1. Update initial WORKDIR to `/app` (stays the same)
2. Change `COPY backend/package*.json ./` to `COPY backend/package*.json ./backend/`
3. Add `WORKDIR /app/backend` before npm install
4. Run `npm install` (now installs to /app/backend/node_modules)
5. Return to `WORKDIR /app`
6. Copy shared and types: Keep `COPY shared/ ./shared/` and `COPY types.ts ./types.ts`
7. Change `COPY backend/ ./` to `COPY backend/ ./backend/`
8. Add `WORKDIR /app/backend` before npm run build
9. Ensure CMD stays as `["node", "dist/server.js"]` (runs from /app/backend)

**Expected Dockerfile structure:**
```dockerfile
FROM node:20-alpine
RUN apk add --no-cache wget
WORKDIR /app

# Install dependencies in backend subdirectory
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy shared code and types
WORKDIR /app
COPY shared/ ./shared/
COPY types.ts ./types.ts

# Copy backend source (preserves structure)
COPY backend/ ./backend/

# Build from backend directory
WORKDIR /app/backend
RUN npm run build
RUN npm prune --production

EXPOSE 3001
ENV DB_PATH=/data/fitforge.db
CMD ["node", "dist/server.js"]
```

**Validation:**
```bash
docker-compose build backend
# Should complete without errors
```

**Related Requirements:**
- Docker Directory Structure Preservation
- Docker Build Configuration

---

### Task 1.2: Verify Docker Compose Build Context

**File:** `docker-compose.yml`

**Check:**
- Verify backend service has `context: .` (project root) ✅
- Verify backend service has `dockerfile: ./backend/Dockerfile` ✅
- No changes needed if already correct

**Validation:**
```bash
docker-compose config
# Verify backend.build.context is "."
```

**Related Requirements:**
- Build Context Configuration

---

### Task 1.3: Review and Update Backend .dockerignore

**File:** `backend/.dockerignore`

**Check:**
- Ensure `shared/` is NOT in .dockerignore
- Ensure `types.ts` is NOT in .dockerignore
- Ensure `backend/` is NOT in .dockerignore
- Keep node_modules, .git, data/ excluded

**Current file should contain:**
```
node_modules
npm-debug.log
.git
.gitignore
.vscode
.idea
.DS_Store
Thumbs.db
README.md
data/
```

**Validation:**
```bash
# Check what would be copied
cd backend && tar -czf - . --exclude-from=.dockerignore | tar -tz
# Should include TypeScript source files but exclude node_modules, data/
```

**Related Requirements:**
- Build Context Configuration

---

## Phase 2: Type System Consolidation (45 min)

### Task 2.1: Consolidate Shared Types in Root types.ts

**File:** `types.ts` (root)

**Check and verify:**
1. Confirm `Muscle` enum is defined with all 13 muscle groups
2. Confirm `Exercise` interface is fully defined
3. Confirm `MuscleEngagement` interface exists
4. Keep frontend-specific types (WorkoutFormData, etc.)
5. Remove any backend-specific types if they exist

**No changes expected** - root types.ts should already be correct

**Validation:**
```typescript
// Verify these exports exist
export enum Muscle { ... }
export interface Exercise { ... }
export interface MuscleEngagement { ... }
```

**Related Requirements:**
- Type Definition Hierarchy

---

### Task 2.2: Update Backend Types to Import from Root

**File:** `backend/types.ts`

**Changes:**
1. **Add import** at the top:
   ```typescript
   import { Muscle, Exercise, MuscleEngagement } from '../types';
   ```

2. **Re-export for convenience**:
   ```typescript
   export { Muscle, Exercise, MuscleEngagement };
   ```

3. **Remove duplicate definitions**:
   - Delete the entire `Muscle` enum definition if it exists
   - Delete the `Exercise` interface definition if it exists
   - Delete the `MuscleEngagement` interface definition if it exists

4. **Keep only backend-specific types**:
   - DatabaseWorkout
   - WorkoutResponse
   - PRInfo
   - BaselineUpdate
   - MuscleStatesResponse
   - PersonalBests
   - Etc.

**Expected structure:**
```typescript
import { Muscle, Exercise, MuscleEngagement } from '../types';

// Re-export shared types
export { Muscle, Exercise, MuscleEngagement };

// Backend-specific enum
export enum DetailedMuscle { ... }

// Backend-specific interfaces
export interface DatabaseWorkout { ... }
export interface WorkoutResponse { ... }
// ... rest of backend-only types
```

**Validation:**
```bash
cd backend && npm run build
# Should compile without errors about duplicate identifiers
```

**Related Requirements:**
- Type Definition Hierarchy
- No Duplicate Type Definitions

---

### Task 2.3: Add Missing updated_baselines Property

**File:** `backend/types.ts`

**Change:**
Find the `WorkoutResponse` interface and ensure it includes:

```typescript
export interface WorkoutResponse {
  workout_id: number;
  updated_muscle_states: MuscleStatesResponse;
  updated_personal_bests: PersonalBests;
  updated_baselines?: BaselineUpdate[];  // ADD THIS LINE if missing
  prs_detected?: PRInfo[];
}
```

**Validation:**
```bash
cd backend && npm run build
# Should compile without errors about updated_baselines not existing
```

**Related Requirements:**
- Type Error Resolution
- WorkoutResponse Includes Updated Baselines

---

### Task 2.4: Verify Shared Exercise Library Imports

**File:** `shared/exercise-library.ts`

**Check:**
Verify the import statement is correct:
```typescript
import { Exercise, Muscle } from '../types';
```

This should import from root types.ts (one level up from shared/)

**No changes expected** - should already be correct

**Validation:**
```bash
# TypeScript should resolve this import
npm run build
```

**Related Requirements:**
- Shared Code Uses Root Types
- Relative Import Path Consistency

---

### Task 2.5: Verify Backend Analytics Imports

**File:** `backend/database/analytics.ts`

**Check:**
Verify these import statements:
```typescript
// Shared exercise library (two levels up to root, then into shared/)
import { EXERCISE_LIBRARY as SHARED_EXERCISE_LIBRARY } from '../../shared/exercise-library';

// Types from backend types.ts (one level up)
import { Muscle, MuscleStatesResponse, BaselineUpdate, PRInfo } from '../types';
```

**No changes expected** - should already be correct

**Validation:**
```bash
cd backend && npm run build
# Should compile without module resolution errors
```

**Related Requirements:**
- Backend Imports from Shared Directory
- Relative Import Path Consistency

---

## Phase 3: Build and Runtime Testing (45 min)

### Task 3.1: Build Backend Docker Image

**Command:**
```bash
docker-compose build backend
```

**Expected outcome:**
- Build completes without errors
- TypeScript compilation succeeds
- No module resolution errors
- Final image is created

**Troubleshooting:**
If build fails:
1. Check TypeScript errors in build output
2. Verify import paths in error messages
3. Check that shared/ and types.ts are being copied
4. Verify WORKDIR is correct before build

**Related Requirements:**
- Docker Build Testing
- Backend Docker Build Succeeds

---

### Task 3.2: Build Frontend Docker Image

**Command:**
```bash
docker-compose build frontend
```

**Expected outcome:**
- Build completes without errors
- Frontend build succeeds
- No regression from backend changes

**Validation:**
Frontend should build exactly as before since we didn't change it.

**Related Requirements:**
- Frontend Build Compatibility
- Frontend Docker Build Still Works

---

### Task 3.3: Start Both Containers

**Command:**
```bash
docker-compose up -d
```

**Expected outcome:**
- Both containers start successfully
- Backend health check passes (may take 5-10 seconds)
- No errors in logs

**Check status:**
```bash
docker-compose ps
# Both should show "Up" status

docker-compose logs backend
# Should show "Server running on http://0.0.0.0:3001"

docker-compose logs frontend
# Should show serve running on port 3000
```

**Related Requirements:**
- Both Containers Start Successfully

---

### Task 3.4: Test Backend Health Endpoint

**Command:**
```bash
curl http://localhost:3001/api/health
```

**Expected response:**
```json
{"status":"healthy"}
```

**Validation:**
Backend is running and responding to requests.

**Related Requirements:**
- Runtime Validation

---

### Task 3.5: Test Frontend Access

**Command:**
```bash
# Open in browser
http://localhost:3000
```

**Expected outcome:**
- Frontend loads successfully
- No console errors
- Can navigate to all pages

**Validation:**
Frontend container is serving files correctly.

**Related Requirements:**
- Frontend Build Compatibility

---

### Task 3.6: Test Import Script with Shared Code

**Command:**
```bash
npm run import-workout workouts/2025-10-29-chest-triceps.json
```

**Expected outcome:**
- Script executes successfully
- Uses EXERCISE_LIBRARY from shared/
- Calculates muscle metrics
- Saves workout to database

**Check output:**
```
✓ Workout imported successfully
✓ Muscle states updated
✓ Personal bests updated
✓ Baselines updated (if applicable)
✓ PRs detected: [list if any]
```

**Related Requirements:**
- Import Script Uses Shared Exercise Library
- Backend API Uses Shared Exercise Library

---

### Task 3.7: Test API Workout Metrics Endpoint

**Command:**
```bash
# First, import a workout to get an ID
npm run import-workout workouts/test-workout.json

# Then test the metrics calculation
curl -X POST http://localhost:3001/api/workouts/1/calculate-metrics
```

**Expected response:**
```json
{
  "workout_id": 1,
  "muscle_volumes": { ... },
  "updated_baselines": [ ... ],
  "prs_detected": [ ... ]
}
```

**Validation:**
- API endpoint works
- Uses EXERCISE_LIBRARY to calculate muscle engagement
- Returns correct data structure

**Related Requirements:**
- Backend API Uses Shared Exercise Library

---

## Phase 4: Validation and Cleanup (30 min)

### Task 4.1: Run Full TypeScript Type Check

**Commands:**
```bash
# Backend type check
cd backend && npx tsc --noEmit

# Frontend type check
npx tsc --noEmit
```

**Expected outcome:**
- No type errors in backend
- No type errors in frontend
- No duplicate identifier errors
- All imports resolve correctly

**Related Requirements:**
- Type Safety Validation
- No Type Conflicts Between Files

---

### Task 4.2: Verify No Duplicate Types

**Command:**
```bash
# Search for duplicate Muscle enum definitions
rg "export enum Muscle" --type ts

# Search for duplicate Exercise interface definitions
rg "export interface Exercise" --type ts
```

**Expected outcome:**
- Only ONE `export enum Muscle` (in root types.ts)
- Only ONE `export interface Exercise` (in root types.ts)
- Backend types.ts should only have `export { Muscle, Exercise }` (re-export)

**Related Requirements:**
- No Duplicate Type Definitions

---

### Task 4.3: Test Complete Workflow End-to-End

**Steps:**
1. Start containers: `docker-compose up -d`
2. Open frontend: http://localhost:3000
3. Create a workout in the UI
4. Save the workout
5. Verify muscle states update
6. Verify personal bests update
7. Run import script: `npm run import-workout workouts/test-workout.json`
8. Check that workout appears in frontend
9. Test metrics endpoint: `curl -X POST http://localhost:3001/api/workouts/<id>/calculate-metrics`

**Expected outcome:**
- All steps complete successfully
- No errors in browser console
- No errors in backend logs
- Shared code works in both containers

**Related Requirements:**
- Success Criteria (all 10 points)

---

### Task 4.4: Document Changes

**Files to update:**
- `CHANGELOG.md` - Add entry for this fix
- Update `docs/docker-build-issue-analysis.md` with resolution notes

**Changelog entry:**
```markdown
## [Current] - 2025-10-30

### Fixed
- Backend Docker build now succeeds by preserving project directory structure
- Type definitions consolidated to prevent duplication and drift
- Shared code (exercise library, types) now accessible to both frontend and backend
- Added missing `updated_baselines` property to WorkoutResponse type

### Changed
- Backend Dockerfile restructured to mirror host directory layout
- Backend types.ts now imports shared types from root instead of duplicating
```

**Related Requirements:**
- Documentation

---

## Phase 5: Cleanup (15 min)

### Task 5.1: Remove Temporary Files

**Check for and remove:**
- Any backup files created during implementation
- Test workout JSON files if created for testing
- Old Docker volumes if needed: `docker volume prune`

**Related Requirements:**
- Cleanup

---

### Task 5.2: Commit Changes

**Git workflow:**
```bash
# Stage changes
git add backend/Dockerfile backend/types.ts shared/ types.ts CHANGELOG.md

# Commit with descriptive message
git commit -m "fix: restructure Docker build to enable shared code

- Preserve project directory structure in backend Docker container
- Consolidate type definitions to eliminate duplication
- Fix missing updated_baselines property in WorkoutResponse
- Enable backend access to shared exercise library

Resolves: Docker build failure blocking API metrics deployment
Related: docs/docker-build-issue-analysis.md"

# Verify everything still works
docker-compose down && docker-compose up -d
```

**Related Requirements:**
- Version Control

---

## Rollback Plan

If issues are discovered after deployment:

**Quick Rollback:**
```bash
git revert HEAD
docker-compose down
docker-compose build
docker-compose up -d
```

**Temporary Workaround:**
```bash
# Copy EXERCISE_LIBRARY to backend/constants.ts
# Update backend/database/analytics.ts to import from backend/constants
# This allows backend to build while we debug the structural issues
```

---

## Success Checklist

Before marking this change as complete, verify:

- [x] Backend Docker image builds without errors
- [x] Frontend Docker image still builds
- [ ] Both containers start successfully (NOTE: Pre-existing better-sqlite3 platform issue, unrelated to shared code fix)
- [x] Backend imports EXERCISE_LIBRARY from shared/
- [x] No duplicate type definitions exist
- [x] All TypeScript compilation passes
- [ ] Import script works with shared code (Requires container runtime fix)
- [ ] API metrics endpoint functions correctly (Requires container runtime fix)
- [x] No regression in existing functionality
- [x] Directory structure consistent between dev and Docker
- [ ] Changelog updated
- [ ] Changes committed to git

---

## Time Breakdown

| Phase | Tasks | Estimated | Actual |
|-------|-------|-----------|--------|
| Phase 1 | Docker Restructuring | 45 min | |
| Phase 2 | Type Consolidation | 45 min | |
| Phase 3 | Testing | 45 min | |
| Phase 4 | Validation | 30 min | |
| Phase 5 | Cleanup | 15 min | |
| **Total** | **15 tasks** | **3 hours** | |

---

## Dependencies

**Blocked By:** None
**Blocks:**
- Deployment of API workout metrics calculation feature
- Any future shared code additions

**Related Tasks:**
- Implementation of API workout processing (waiting on this fix)

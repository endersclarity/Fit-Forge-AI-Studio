# Proposal: Fix Shared Code Docker Build

**Change ID:** `fix-shared-code-docker-build`
**Status:** ✅ IMPLEMENTED & ARCHIVED
**Created:** 2025-10-30
**Implemented:** 2025-10-30
**Commit:** `83cd8ae`
**Target Version:** Current

## Problem Statement

The backend Docker build currently fails when attempting to share code between frontend and backend through a `/shared` directory. This blocks the API workout processing feature from being deployed in production.

### Root Causes

1. **Directory Structure Mismatch**: The backend Dockerfile copies files into `/app/` which changes relative import paths from development (where backend code lives in `backend/` subdirectory)
2. **Type Definition Duplication**: Both `/types.ts` and `/backend/types.ts` define the same base types (Exercise, Muscle), creating conflicts and maintenance burden
3. **Import Path Inconsistency**: Code imports like `../../shared/exercise-library` work in development but break in Docker where the directory structure is flattened

### Current Impact

- ✅ Frontend Docker build works (copies entire project root)
- ❌ Backend Docker build fails with TypeScript compilation errors
- ❌ Cannot deploy API workout metrics calculation feature
- ⚠️ Import scripts work locally but would fail in production
- ⚠️ Type definitions are duplicated and can drift out of sync

### Attempted Quick Fix

Created `/shared/exercise-library.ts` to share EXERCISE_LIBRARY constant between frontend and backend, but this exposed the deeper architectural issues with code sharing between the two parts of the application.

## Proposed Solution

Restructure the Docker build process to preserve the project's directory structure, enabling consistent relative imports across development and production environments. Consolidate type definitions to establish a clear hierarchy for shared vs. application-specific types.

### Core Approach

**"Mirror Host Structure in Container"** - The Docker container will replicate the exact directory layout from the host machine:

```
Host Development:                Docker Production:
/project-root/                   /app/
  backend/                         backend/
    database/                        database/
      analytics.ts                     analytics.ts
    types.ts                         types.ts
  shared/                          shared/
    exercise-library.ts              exercise-library.ts
  types.ts                         types.ts
```

This makes relative imports identical in both environments.

### Type System Hierarchy

1. **Root `/types.ts`** → Source of truth for shared types (Exercise, Muscle, etc.)
2. **Backend `/backend/types.ts`** → Imports shared types, adds backend-specific extensions
3. **Shared code** → Always imports from root types.ts
4. **No duplication** → Each type defined once, extended where needed

## Benefits

1. **Build Success**: Backend compiles successfully in Docker
2. **Path Consistency**: Same imports work in development and production
3. **Type Safety**: Single source of truth prevents type drift
4. **Future Scalability**: Clear pattern for adding more shared code
5. **Low Risk**: Minimal code changes, mostly configuration
6. **Quick Resolution**: Can be implemented in 2-3 hours vs. days for monorepo restructuring

## Capabilities

This change introduces one new capability:

- **shared-code-architecture** - Proper code sharing between frontend and backend with Docker support

## Non-Goals

- ❌ Full monorepo restructuring with yarn/pnpm workspaces
- ❌ Backend-as-source-of-truth for exercise library (future consideration)
- ❌ Path mapping or module aliases (adds complexity)
- ❌ Changes to frontend build process (already working)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Backend build scripts break | High | Test all npm scripts after Docker changes |
| Runtime module resolution fails | High | Verify compiled output references correct paths |
| .dockerignore excludes needed files | Medium | Review and update .dockerignore files |
| Frontend inadvertently affected | Medium | Frontend Dockerfile unchanged, test independently |
| Increased Docker image size | Low | Minimal - only copying necessary files |

## Success Criteria

1. ✅ Backend Docker container builds successfully without errors
2. ✅ Backend can import from `/shared/exercise-library.ts`
3. ✅ Type definitions consolidated without duplication
4. ✅ Import scripts work with shared code
5. ✅ Frontend continues working unchanged
6. ✅ Both containers start and communicate via docker-compose
7. ✅ API workout metrics calculation works end-to-end

## Dependencies

- Requires `/shared/exercise-library.ts` to exist (already created)
- Blocks deployment of API workout processing feature
- No dependencies on other OpenSpec changes

## Timeline Estimate

**Total: 2-3 hours**

- Phase 1: Docker restructuring (45 min)
- Phase 2: Type consolidation (45 min)
- Phase 3: Testing and validation (45 min)
- Buffer for issues (15-30 min)

## Related Documents

- Issue analysis: `docs/docker-build-issue-analysis.md`
- API proposal: `docs/api-workout-processing-proposal.md`
- Project structure: `openspec/project.md`

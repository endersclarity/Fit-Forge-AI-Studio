# Proposal: Fix Deployment Blockers

## Overview

Fix all critical deployment blockers preventing FitForge from running in Docker or local npm development. This change addresses 7 issues identified through comprehensive testing: 1 critical Docker blocker, 3 high-priority build/startup issues, 2 medium-priority type safety issues, and 1 low-priority warning.

## Problem Statement

FitForge is currently completely non-functional:
- **Docker**: Backend crashes on startup with SQLite WAL mode I/O error
- **Local npm dev**: Cannot build or start due to missing dependencies and build configuration issues
- **Frontend**: Build fails with missing Rollup module
- **Backend**: Build output structure doesn't match expected paths
- **TypeScript**: Multiple type errors prevent compilation

## Affected Components

- Backend database layer (SQLite configuration)
- Backend build system (TypeScript compilation)
- Frontend build system (Rollup dependency)
- Type definitions (Vite, React type safety)
- Docker configuration (compose file)

## Success Criteria

- [ ] Docker containers start successfully and remain healthy
- [ ] Backend responds to health check endpoint
- [ ] Frontend builds without errors
- [ ] Backend compiles and starts correctly
- [ ] All TypeScript compilation passes without errors
- [ ] No build warnings or deprecation notices

## Risks and Mitigation

### Risk: Data Loss from SQLite Mode Change
- **Mitigation**: WAL → DELETE mode is backwards compatible; existing .db files will work

### Risk: Breaking Existing Local Development
- **Mitigation**: Changes are strictly additive (new tsconfig paths, missing files)

### Risk: Docker Volume Conflicts
- **Mitigation**: Clear instructions to remove old volumes before restart

## Dependencies

None - this is a foundational fix that other features depend on.

## Timeline Estimate

- Investigation: Complete (already done)
- Implementation: 30-45 minutes
- Testing: 15-20 minutes
- Total: ~1 hour

## Open Questions

None - all issues have been diagnosed and solutions are known.

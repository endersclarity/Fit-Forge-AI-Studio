# Archived OpenSpec Changes

This directory contains OpenSpec proposals that have been fully implemented and archived.

## Archive Format

Each entry includes:
- **Archived date**: When the proposal was moved to archive
- **Implementation commit(s)**: Git commit hash(es) that implemented the change
- **What was delivered**: Summary of implemented features
- **Status**: Final status (typically "Implemented" or "Cancelled")

---

## 2025-10-30 - Fix Shared Code Docker Build

**Change ID**: `fix-shared-code-docker-build`
**Archived**: 2025-10-30
**Implementation Commit**: `83cd8ae`
**Status**: ✅ IMPLEMENTED

**What was delivered**:
- Restructured backend Docker build to preserve project directory structure
- Created `/shared` directory for code shared between frontend and backend
- Consolidated type definitions with root `/types.ts` as source of truth
- Fixed import paths to work identically in development and production
- Added `/api/workouts/:id/calculate-metrics` endpoint using shared exercise library
- Eliminated ~400 lines of duplicated type definitions

**Key changes**:
- Backend Dockerfile now mirrors host directory layout (`/app/backend`, `/app/shared`)
- TypeScript `rootDir` updated to include parent directories
- Type system hierarchy: Root types → Backend extensions → Shared data
- Docker build succeeds without errors, enabling deployment of API features

**Known issues**:
- better-sqlite3 Alpine compilation issue (documented separately in `docs/better-sqlite3-alpine-issue.md`)

**Related documentation**:
- `docs/docker-build-issue-analysis.md` - Root cause analysis
- `docs/api-workout-processing-proposal.md` - Feature proposal that was blocked
- CHANGELOG entry: 2025-10-30 - Fix Shared Code Docker Build

---

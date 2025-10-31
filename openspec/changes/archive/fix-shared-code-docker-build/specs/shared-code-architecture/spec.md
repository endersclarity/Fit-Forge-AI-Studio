# Spec: Shared Code Architecture

**Capability:** shared-code-architecture
**Status:** Draft
**Version:** 1.0.0

## Overview

This capability enables code sharing between frontend and backend applications while maintaining Docker containerization support and development workflow compatibility.

---

## ADDED Requirements

### Requirement: Docker Directory Structure Preservation

The backend Docker container must mirror the host project's directory structure to ensure relative import paths work identically in both development and production environments.

**Rationale:** Flattening the directory structure in Docker causes relative imports (e.g., `../../shared/`) to break because the path traversal expects the same nesting level as in development.

#### Scenario: Backend Files Copied to Preserve Structure

**GIVEN** the project has the following structure:
```
/project-root/
  backend/
    database/
      analytics.ts
    server.ts
    types.ts
  shared/
    exercise-library.ts
  types.ts
```

**WHEN** the backend Docker image is built

**THEN** the container must have the structure:
```
/app/
  backend/
    database/
      analytics.ts
    server.ts
    types.ts
  shared/
    exercise-library.ts
  types.ts
```

**AND** all files must be in their respective subdirectories matching the host

#### Scenario: Backend Package.json Installed in Subdirectory

**GIVEN** the backend has dependencies defined in `backend/package.json`

**WHEN** the Docker image is built

**THEN** `package.json` must be copied to `/app/backend/package.json`

**AND** `npm install` must run in the `/app/backend/` directory

**AND** `node_modules` must be created at `/app/backend/node_modules`

#### Scenario: Backend Build Artifacts in Correct Location

**GIVEN** the backend TypeScript source files are in `/app/backend/`

**WHEN** `npm run build` is executed in the container

**THEN** compiled JavaScript must output to `/app/backend/dist/`

**AND** the build must compile successfully without path resolution errors

**AND** source maps must reference the correct source file locations

#### Scenario: Backend Server Starts from Correct Directory

**GIVEN** the compiled server is at `/app/backend/dist/server.js`

**WHEN** the container starts

**THEN** the working directory must be `/app/backend/`

**AND** the command must execute `node dist/server.js`

**AND** the server must start without module resolution errors

---

### Requirement: Relative Import Path Consistency

Import statements using relative paths must resolve correctly in both development (host machine) and production (Docker container) environments without modification.

**Rationale:** Developers should not need different import statements for different environments. The code should be environment-agnostic.

#### Scenario: Backend Imports from Shared Directory

**GIVEN** a backend file at `backend/database/analytics.ts`

**AND** a shared file at `shared/exercise-library.ts`

**WHEN** analytics.ts contains: `import { EXERCISE_LIBRARY } from '../../shared/exercise-library'`

**THEN** the import must resolve in development from `backend/database/analytics.ts` → `shared/exercise-library.ts`

**AND** the import must resolve in Docker from `/app/backend/database/analytics.ts` → `/app/shared/exercise-library.ts`

**AND** no TypeScript compilation errors must occur in either environment

#### Scenario: Shared Code Imports Root Types

**GIVEN** a shared file at `shared/exercise-library.ts`

**AND** root types file at `types.ts`

**WHEN** exercise-library.ts contains: `import { Exercise, Muscle } from '../types'`

**THEN** the import must resolve in development from `shared/exercise-library.ts` → `types.ts`

**AND** the import must resolve in Docker from `/app/shared/exercise-library.ts` → `/app/types.ts`

**AND** type definitions must be available without errors

#### Scenario: Backend Imports Root Types

**GIVEN** a backend file at `backend/types.ts`

**AND** root types file at `types.ts`

**WHEN** backend/types.ts contains: `import { Exercise, Muscle } from '../types'`

**THEN** the import must resolve in development from `backend/types.ts` → `types.ts`

**AND** the import must resolve in Docker from `/app/backend/types.ts` → `/app/types.ts`

**AND** TypeScript must recognize the imported types

---

### Requirement: Type Definition Hierarchy

Type definitions must follow a clear hierarchy where shared types are defined once in the root types.ts, and application-specific type files import and extend them as needed.

**Rationale:** Prevents type definition drift, reduces maintenance burden, and enforces a single source of truth for shared domain types.

#### Scenario: Shared Types Defined in Root

**GIVEN** the project has shared types used by both frontend and backend

**WHEN** examining `types.ts` at the project root

**THEN** it must export the `Muscle` enum with all muscle group values

**AND** it must export the `Exercise` interface with all exercise properties

**AND** it must export the `MuscleEngagement` interface

**AND** it must not contain backend-specific database types

**AND** it may contain frontend-specific UI types

#### Scenario: Backend Types Import and Extend Shared Types

**GIVEN** the root `types.ts` exports shared types

**WHEN** examining `backend/types.ts`

**THEN** it must import shared types: `import { Muscle, Exercise, MuscleEngagement } from '../types'`

**AND** it must re-export them for convenience: `export { Muscle, Exercise, MuscleEngagement }`

**AND** it must define only backend-specific types (e.g., DatabaseWorkout, WorkoutResponse)

**AND** it must not duplicate the definition of Muscle or Exercise

#### Scenario: No Duplicate Type Definitions

**GIVEN** the `Muscle` enum is defined in root `types.ts`

**WHEN** checking all TypeScript files in the project

**THEN** there must be exactly one definition of the `Muscle` enum (in root types.ts)

**AND** all other files must import it rather than redefine it

**AND** TypeScript must not report type conflicts between files

#### Scenario: Shared Code Uses Root Types

**GIVEN** shared code at `shared/exercise-library.ts` needs type definitions

**WHEN** the file imports types

**THEN** it must import from the root types.ts: `import { Exercise, Muscle } from '../types'`

**AND** it must not import from `backend/types.ts`

**AND** type checking must pass without errors

---

### Requirement: Docker Build Configuration

The backend Dockerfile must be configured to preserve directory structure while maintaining efficient layer caching and minimal image size.

**Rationale:** Proper layer ordering optimizes Docker build cache, and preserving structure enables correct module resolution.

#### Scenario: Dependencies Installed Before Source Copy

**GIVEN** the backend Dockerfile

**WHEN** building the Docker image

**THEN** package.json must be copied before other source files

**AND** npm install must run before source code is copied

**AND** subsequent source changes must not trigger dependency reinstallation

**AND** Docker layer caching must optimize rebuild times

#### Scenario: Shared Files Copied to Container

**GIVEN** the project has a `shared/` directory with shared code

**WHEN** building the backend Docker image

**THEN** the `shared/` directory must be copied to `/app/shared/`

**AND** the root `types.ts` must be copied to `/app/types.ts`

**AND** `.dockerignore` must not exclude these files

**AND** the files must be available during TypeScript compilation

#### Scenario: TypeScript Compilation in Container

**GIVEN** all source files are copied to the container

**WHEN** `npm run build` is executed

**THEN** TypeScript must compile all `.ts` files without errors

**AND** the compilation must resolve imports from `shared/` directory

**AND** the compilation must resolve imports from root `types.ts`

**AND** output must be written to `/app/backend/dist/`

#### Scenario: Production Dependencies Only

**GIVEN** TypeScript compilation is complete

**WHEN** preparing the final image

**THEN** `npm prune --production` must remove dev dependencies

**AND** the final image must contain only runtime dependencies

**AND** TypeScript, ts-node, and build tools must be removed

**AND** the image size must be minimized

---

### Requirement: Build Context Configuration

The docker-compose.yml must configure build contexts correctly to access both backend and shared code.

**Rationale:** The build context determines which files Docker can access during the build. It must include both backend and shared directories.

#### Scenario: Backend Build Context Includes Project Root

**GIVEN** the `docker-compose.yml` backend service configuration

**WHEN** the backend service is built

**THEN** the build context must be set to `.` (project root)

**AND** the Dockerfile path must be `./backend/Dockerfile`

**AND** the build must have access to `shared/` directory

**AND** the build must have access to root `types.ts`

#### Scenario: Dockerignore Does Not Exclude Shared Code

**GIVEN** the backend has a `.dockerignore` file

**WHEN** copying files during Docker build

**THEN** `shared/` must not be in `.dockerignore`

**AND** `types.ts` must not be in `.dockerignore`

**AND** `backend/` must not be in `.dockerignore`

**AND** node_modules, .git, and data/ should still be excluded

---

### Requirement: Type Error Resolution

Pre-existing type errors that were exposed by the strict type checking must be resolved.

**Rationale:** The WorkoutResponse type is missing a property that's referenced in the code, causing compilation failures.

#### Scenario: WorkoutResponse Includes Updated Baselines

**GIVEN** the backend server.ts has quick-add endpoints

**AND** they reference `response.updated_baselines`

**WHEN** checking the `WorkoutResponse` type definition in `backend/types.ts`

**THEN** it must include the property: `updated_baselines?: BaselineUpdate[]`

**AND** the property must be optional (with `?`)

**AND** TypeScript must not report errors when accessing this property

#### Scenario: BaselineUpdate Type Exists

**GIVEN** WorkoutResponse references `BaselineUpdate[]`

**WHEN** checking `backend/types.ts`

**THEN** the `BaselineUpdate` interface must be defined

**AND** it must export properly for use in WorkoutResponse

**AND** it must match the structure returned by the database

---

### Requirement: Frontend Build Compatibility

The frontend Docker build must continue working unchanged, and the shared code must be accessible to both containers.

**Rationale:** The frontend already works correctly. Changes must not break it.

#### Scenario: Frontend Accesses Shared Directory

**GIVEN** the frontend Dockerfile uses `COPY . .`

**WHEN** building the frontend image

**THEN** the `shared/` directory must be copied to the container

**AND** frontend code must be able to import from `shared/`

**AND** the build must complete successfully

**AND** no TypeScript errors must occur

#### Scenario: Frontend and Backend Share Same Code Files

**GIVEN** both frontend and backend import from `shared/exercise-library.ts`

**WHEN** both containers are built

**THEN** they must use the identical source file (same content)

**AND** any changes to `shared/exercise-library.ts` must affect both

**AND** no synchronization issues must occur

---

## Testing Requirements

### Requirement: Docker Build Testing

All Docker build configurations must be validated before deployment.

#### Scenario: Backend Docker Build Succeeds

**GIVEN** all changes are implemented

**WHEN** running `docker-compose build backend`

**THEN** the build must complete without errors

**AND** no TypeScript compilation errors must occur

**AND** the final image must be created successfully

#### Scenario: Frontend Docker Build Still Works

**GIVEN** all changes are implemented

**WHEN** running `docker-compose build frontend`

**THEN** the build must complete without errors

**AND** all previous functionality must remain intact

#### Scenario: Both Containers Start Successfully

**GIVEN** both images are built

**WHEN** running `docker-compose up -d`

**THEN** both frontend and backend containers must start

**AND** the backend health check must pass

**AND** the frontend must be accessible at http://localhost:3000

**AND** the backend must be accessible at http://localhost:3001/api

---

### Requirement: Runtime Validation

Shared code functionality must work correctly at runtime in both development and Docker environments.

#### Scenario: Import Script Uses Shared Exercise Library

**GIVEN** the import script at `scripts/import-workout.ts`

**AND** it imports from `shared/exercise-library.ts`

**WHEN** running `npm run import-workout workouts/test-workout.json`

**THEN** the script must execute successfully

**AND** it must access EXERCISE_LIBRARY data

**AND** no module resolution errors must occur

#### Scenario: Backend API Uses Shared Exercise Library

**GIVEN** the backend analytics.ts imports EXERCISE_LIBRARY

**WHEN** calling `POST /api/workouts/:id/calculate-metrics`

**THEN** the API must respond successfully

**AND** it must use EXERCISE_LIBRARY to look up exercise data

**AND** muscle fatigue calculations must work correctly

**AND** no runtime errors must occur

---

### Requirement: Type Safety Validation

TypeScript must successfully compile all code without type errors.

#### Scenario: Backend TypeScript Compilation Clean

**GIVEN** all source code changes are complete

**WHEN** running `cd backend && npm run build`

**THEN** TypeScript must compile without errors

**AND** no warnings about missing types must appear

**AND** all imports must resolve successfully

#### Scenario: No Type Conflicts Between Files

**GIVEN** types are imported from multiple locations

**WHEN** TypeScript performs type checking

**THEN** there must be no conflicts between imported types

**AND** Muscle enum values must be consistent everywhere

**AND** Exercise interface must be identical across all uses

---

## Success Criteria

This capability is considered successfully implemented when:

1. ✅ Backend Docker container builds without errors
2. ✅ Frontend Docker container still builds
3. ✅ Both containers start via docker-compose
4. ✅ Backend can import and use EXERCISE_LIBRARY from shared/
5. ✅ No duplicate type definitions exist
6. ✅ All TypeScript compilation passes without errors
7. ✅ Import scripts work with shared code
8. ✅ API endpoints using shared code function correctly
9. ✅ No regression in existing functionality
10. ✅ Directory structure is consistent between development and Docker

---

## Related Capabilities

- None (this is a new capability)

## Dependencies

- Requires `/shared/exercise-library.ts` to exist
- Requires root `/types.ts` to define shared types

## Migration Notes

**From:** Attempted shared folder with broken Docker build
**To:** Working shared code architecture with proper Docker support

**Breaking Changes:** None - this fixes a broken state

**Rollback:** Revert commits and use code duplication as temporary workaround

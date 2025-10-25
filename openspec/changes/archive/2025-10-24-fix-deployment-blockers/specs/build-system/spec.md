# Spec: Build System

## MODIFIED Requirements

### Requirement: TypeScript compilation must produce correctly structured output

**Priority**: High
**Status**: Modified to fix output directory structure

The TypeScript compiler MUST generate output files in a flat directory structure that matches the package.json entry points. Compiled files SHALL be output to `dist/server.js` and `dist/database/`, NOT `dist/backend/server.js`.

#### Scenario: Backend TypeScript compilation produces flat dist structure

**Given** the backend TypeScript source files
**When** running `npm run build` in the backend directory
**Then** compiled files are output to `dist/server.js`
**And** database files are output to `dist/database/database.js`
**And** NO nested `dist/backend/` directory is created

**Validation**:
- `backend/dist/server.js` exists
- `backend/dist/database/database.js` exists
- `backend/dist/backend/` directory does NOT exist
- `npm start` successfully finds `dist/server.js`

#### Scenario: Schema SQL file is copied to build output

**Given** the `backend/database/schema.sql` source file
**When** running `npm run build` in the backend directory
**Then** the schema.sql file is copied to `dist/database/schema.sql`
**And** the database module can load the schema at runtime

**Validation**:
- `backend/dist/database/schema.sql` exists
- File contains complete SQL schema
- Database initialization succeeds without ENOENT error

---

## ADDED Requirements

### Requirement: Frontend build must have all required dependencies

**Priority**: High
**Status**: New

The frontend build process MUST have access to all required dependencies for the target platform. On Windows x64, the system SHALL install the `@rollup/rollup-win32-x64-msvc` package.

#### Scenario: Rollup dependency installed on Windows

**Given** the project runs on Windows x64
**When** running `npm install` in the project root
**Then** the `@rollup/rollup-win32-x64-msvc` package is installed
**And** `npm run build` completes successfully

**Validation**:
- Package exists in `node_modules/@rollup/`
- `npm run build` exits with code 0
- No "Cannot find module @rollup" errors

#### Scenario: Frontend Vite build completes without errors

**Given** all frontend dependencies are installed
**When** running `npm run build`
**Then** Vite successfully bundles the application
**And** output files are created in `dist/` directory
**And** no compilation errors occur

**Validation**:
- `dist/index.html` exists
- `dist/assets/` contains bundled JS and CSS
- Build output shows "✓ built in [time]"

---

### Requirement: Build scripts must work on Windows and Unix platforms

**Priority**: Medium
**Status**: New

Build scripts in package.json MUST execute successfully on both Windows and Unix-like systems. File copy operations SHALL use cross-platform compatible commands or tools.

#### Scenario: Cross-platform file copy in build script

**Given** the build script needs to copy non-TypeScript files
**When** the build script runs on Windows
**Then** Windows-compatible copy commands succeed
**When** the build script runs on Unix/Linux
**Then** Unix-compatible copy commands succeed

**Validation**:
- Script uses cross-platform tool (e.g., `copyfiles`, `cpy-cli`)
- OR script uses fallback: `cp || xcopy` pattern
- Build succeeds on both platforms

---

## REMOVED Requirements

### Requirement: ~~TypeScript must include parent directory types~~

**Reason**: Caused nested output structure
**Status**: Removed

The previous requirement to include `../types.ts` in backend compilation created an unintended nested directory structure. Types are now handled differently.

---

## Cross-References

- Related to: `database-reliability` spec (schema.sql must be in build output)
- Related to: `type-safety` spec (TypeScript compilation must pass)
- Impacts: Docker image build, local development, CI/CD pipelines
- Dependencies: None

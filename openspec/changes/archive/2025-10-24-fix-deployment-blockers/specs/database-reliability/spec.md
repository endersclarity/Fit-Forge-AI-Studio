# Spec: Database Reliability

## MODIFIED Requirements

### Requirement: SQLite journal mode must work reliably in Docker containers

**Priority**: Critical
**Status**: Modified from WAL to DELETE mode

The SQLite database MUST use DELETE journal mode to ensure reliable operation across all deployment environments, including Docker containers with volume mounts on Windows hosts. The system SHALL NOT use WAL mode due to incompatibility with Docker volume mounts.

#### Scenario: Database initializes in Docker container on Windows

**Given** the backend application starts in a Docker container
**And** the database file is mounted from a Windows host volume
**When** the database module initializes
**Then** the SQLite connection succeeds without I/O errors
**And** the journal mode is set to DELETE
**And** no `.db-shm` or `.db-wal` files are created

**Validation**:
- Backend logs show: `Database initialized at: /data/fitforge.db`
- Backend logs do NOT show: `SqliteError: disk I/O error`
- Container health check passes
- Only `fitforge.db` file exists in data directory

#### Scenario: Existing WAL-mode database converts automatically

**Given** an existing database file using WAL mode
**When** the application starts with DELETE mode configuration
**Then** SQLite automatically converts the journal mode
**And** existing data remains intact
**And** all queries function normally

**Validation**:
- No data loss occurs
- All tables and indexes remain
- Application functionality unchanged

#### Scenario: Database operations perform adequately in DELETE mode

**Given** the database is using DELETE journal mode
**When** performing typical single-user operations (workout logging, template management)
**Then** operations complete within acceptable time (<100ms for writes, <50ms for reads)
**And** concurrent read operations work correctly

**Validation**:
- Performance benchmarks meet thresholds
- No user-perceivable latency increase
- No concurrency issues in single-user context

---

## ADDED Requirements

### Requirement: Database initialization must be resilient to platform differences

**Priority**: High
**Status**: New

The database initialization logic MUST handle cross-platform file system differences without requiring environment-specific configuration. The system SHALL automatically detect and adapt to Windows or Unix path conventions.

#### Scenario: Database file path creation on Windows

**Given** the application runs on Windows
**When** the database module checks for the data directory
**Then** Windows-style paths are handled correctly
**And** the directory is created with proper permissions

**Validation**:
- `data/` directory created successfully
- Backslash paths resolved correctly
- No path traversal errors

#### Scenario: Database file path creation on Linux (Docker)

**Given** the application runs in a Linux Docker container
**When** the database module checks for the data directory
**Then** Unix-style paths are handled correctly
**And** the directory is created with proper permissions

**Validation**:
- `/data/` directory created successfully
- Forward slash paths resolved correctly
- Proper Unix file permissions set

---

## Cross-References

- Related to: `build-system` spec (database.js must exist in build output)
- Impacts: Docker deployment, local development, data persistence
- Dependencies: None

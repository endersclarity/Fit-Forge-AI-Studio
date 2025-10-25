# Design: Fix Deployment Blockers

## Architectural Context

FitForge uses a microservices architecture with separate frontend and backend containers. The application must work in two environments:
1. **Docker deployment** (recommended): Isolated containers with volume mounts
2. **Local npm development**: Direct Node.js execution for faster iteration

## Root Cause Analysis

### Issue 1: SQLite WAL Mode + Docker Volumes (CRITICAL)

**Problem**: SQLite's Write-Ahead Logging (WAL) mode creates shared memory files (`.db-shm` and `.db-wal`) that don't work reliably on Docker volume mounts, especially on Windows.

**Technical Details**:
- WAL mode requires `mmap()` for shared memory
- Docker volume mounts on Windows don't support all POSIX file operations
- Results in `SQLITE_IOERR_SHMOPEN` error
- Backend crashes immediately on startup

**Solution Options**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| WAL → DELETE mode | ✓ Works on all platforms<br>✓ Backwards compatible<br>✓ Simple fix | ✗ Slight performance decrease | **CHOSEN** |
| WAL → Memory mode | ✓ Fast | ✗ Data loss on crash<br>✗ Not suitable for persistent app | Rejected |
| Local file only | ✓ Avoids Docker | ✗ Defeats purpose of Docker deployment | Rejected |

**Chosen Solution**: Change journal mode from WAL to DELETE

**Trade-offs**:
- **Performance**: DELETE mode is ~5-10% slower for writes, negligible for single-user app
- **Reliability**: DELETE mode is more reliable across platforms
- **Compatibility**: Existing databases will automatically convert

**Implementation**:
```javascript
// Before
db.pragma('journal_mode = WAL');

// After
db.pragma('journal_mode = DELETE');
```

---

### Issue 2: TypeScript Build Structure Mismatch

**Problem**: TypeScript compiles to `dist/backend/server.js` but `package.json` expects `dist/server.js`

**Root Cause**: `tsconfig.json` includes parent directory in compilation:
```json
"include": ["**/*.ts", "../types.ts"]
```

This causes TypeScript to create a `backend/` subdirectory in output, mirroring source structure.

**Solution Options**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Fix tsconfig include | ✓ Correct structure<br>✓ Simple | ✗ Might break type imports | **CHOSEN** |
| Update package.json path | ✗ Wrong abstraction | ✗ Nested output is unintended | Rejected |
| Copy types locally | ✓ Isolated | ✗ Duplication | Rejected |

**Chosen Solution**: Update `tsconfig.json` to not traverse parent directory

**Implementation**:
```json
"include": ["*.ts", "**/*.ts"]
```

This keeps compilation isolated to backend directory while still finding all TypeScript files.

---

### Issue 3: Non-Code Assets Not Copied

**Problem**: `schema.sql` is not copied to `dist/` during TypeScript compilation

**Root Cause**: TypeScript only compiles `.ts` files, doesn't copy other assets

**Solution Options**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Add copy to build script | ✓ Simple<br>✓ Explicit | ✗ Platform-specific commands | **CHOSEN** (cross-platform) |
| Use absolute path | ✗ Breaks Docker | ✗ Environment-specific | Rejected |
| Bundle in code | ✗ Hard to maintain | ✗ Not best practice | Rejected |

**Chosen Solution**: Extend build script with cross-platform copy

**Implementation**:
```json
"build": "tsc && cp database/schema.sql dist/database/ || xcopy database\\schema.sql dist\\database\\"
```

Or use a build tool like `copyfiles`:
```json
"build": "tsc && copyfiles -u 1 database/schema.sql dist/"
```

---

### Issue 4: Missing Optional Dependency

**Problem**: `@rollup/rollup-win32-x64-msvc` not installed despite being in `optionalDependencies`

**Root Cause**: npm sometimes skips optional dependencies on install, especially after lockfile corruption

**Solution**: Force reinstall
```bash
npm install
```

**Alternative Prevention**: Move to regular dependencies if consistently needed on Windows

---

### Issue 5-7: TypeScript Type Errors

**Pattern**: Missing type declarations for framework-specific features

**Solutions**:
- **Vite env**: Add reference directive for Vite types
- **Spread types**: Add explicit type annotations
- **Map on unknown**: Add type assertion for grouped data

**Implementation Strategy**: Minimal type assertions, prefer inference when possible

---

## System Impact Analysis

### Docker Deployment
- **Before**: Crashes on startup (100% failure rate)
- **After**: Starts successfully, all health checks pass
- **Performance**: Negligible impact (<1% for single-user workload)

### Local Development
- **Before**: Cannot build or start
- **After**: Full development workflow functional
- **Developer Experience**: Improved with faster iteration

### Data Migration
- **Before**: N/A (system not working)
- **After**: Existing databases automatically migrate to DELETE mode
- **Backwards Compatibility**: Full compatibility maintained

## Testing Strategy

### Unit Tests
- Database initialization with DELETE mode
- Schema file loading
- Type compilation passes

### Integration Tests
1. Docker container startup
2. Health check endpoint responds
3. Database operations succeed
4. Frontend-backend communication works

### Regression Tests
- Existing workout data loads correctly
- Template CRUD operations work
- Muscle state calculations accurate

## Rollback Plan

All changes are easily reversible:
1. **SQLite mode**: Change pragma back to WAL
2. **Build config**: Revert tsconfig.json
3. **Dependencies**: npm install previous lockfile

No database migration required - DELETE mode databases work with WAL mode.

## Future Considerations

### Performance Monitoring
- Track database operation latency
- Compare WAL vs DELETE mode in production
- Consider WAL mode re-enablement if Docker improves Windows support

### Build Optimization
- Consider switching to esbuild for faster builds
- Evaluate build cache strategies
- Potentially merge frontend/backend build processes

### Type Safety
- Add strict mode to all TypeScript files
- Enable noUncheckedIndexedAccess
- Consider Zod for runtime type validation

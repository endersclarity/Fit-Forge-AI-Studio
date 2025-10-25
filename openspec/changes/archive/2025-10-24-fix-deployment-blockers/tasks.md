# Tasks: Fix Deployment Blockers

## Ordered Implementation Tasks

### Phase 1: Critical Docker Blocker (15 min)

1. **Fix SQLite WAL mode incompatibility with Docker volumes**
   - File: `backend/database/database.js:17`
   - Change: `db.pragma('journal_mode = WAL')` → `db.pragma('journal_mode = DELETE')`
   - Validation: Backend container starts without I/O error
   - Why: WAL mode requires shared memory files (.db-shm) that don't work on Docker Windows volumes
   - Dependency: None

### Phase 2: High-Priority Build Issues (20 min)

2. **Install missing Rollup dependency**
   - File: Root directory
   - Action: Run `npm install` to install `@rollup/rollup-win32-x64-msvc`
   - Validation: `npm run build` completes successfully
   - Why: Optional dependency not installed, preventing frontend builds
   - Dependency: None

3. **Fix TypeScript build output structure**
   - File: `backend/tsconfig.json`
   - Change: Update `include` to exclude parent directory traversal
   - Update: Modify to `["*.ts", "**/*.ts"]` (remove `"../types.ts"`)
   - Validation: Build outputs to `dist/server.js` not `dist/backend/server.js`
   - Why: Current config creates nested folder structure
   - Dependency: None

4. **Copy schema.sql to build output**
   - File: `backend/tsconfig.json` or add copy script
   - Option A: Add to `backend/package.json` build script
   - Option B: Update database.js to use absolute path
   - Action: Modify build script: `"build": "tsc && cp database/schema.sql dist/database/"`
   - Validation: `dist/database/schema.sql` exists after build
   - Why: SQL file not copied during TypeScript compilation
   - Dependency: Task 3 (tsconfig structure)

### Phase 3: Medium-Priority Type Safety (10 min)

5. **Fix Vite env type error**
   - File: `api.ts:21`
   - Add: `/// <reference types="vite/client" />` at top of file
   - Validation: TypeScript compilation passes
   - Why: Vite env types not imported
   - Dependency: None

6. **Fix PersonalBests spread type error**
   - File: `components/PersonalBests.tsx:20`
   - Investigation: Review spread usage and add proper type assertion
   - Validation: TypeScript compilation passes
   - Why: Spreading unknown type
   - Dependency: None

7. **Fix WorkoutTemplates map type error**
   - File: `components/WorkoutTemplates.tsx:112`
   - Investigation: Add proper type assertion for `categoryTemplates`
   - Validation: TypeScript compilation passes
   - Why: Type inference failing on grouped templates
   - Dependency: None

### Phase 4: Low-Priority Cleanup (5 min)

8. **Remove obsolete docker-compose version**
   - File: `docker-compose.yml:4`
   - Change: Delete line `version: '3.8'`
   - Validation: No warning when running docker-compose commands
   - Why: Version field is deprecated in Compose specification
   - Dependency: None

## Validation Tasks

9. **Full system integration test**
   - Action: `docker-compose up -d`
   - Verify: Both containers healthy
   - Verify: Backend health check returns 200
   - Verify: Frontend accessible at http://localhost:3000
   - Verify: Can create and save a workout template
   - Dependency: Tasks 1-8

10. **Local npm development test**
    - Action: Start backend with `cd backend && npm run dev`
    - Action: Start frontend with `npm run dev`
    - Verify: No errors in either terminal
    - Verify: Application accessible and functional
    - Dependency: Tasks 2-7

## Parallelization Opportunities

- Tasks 1, 2, 8 can be done in parallel (different files)
- Tasks 5, 6, 7 can be done in parallel (different files)
- Tasks 3 and 4 must be sequential (4 depends on 3's output structure)

## Testing Checklist

After all tasks complete:

- [ ] Docker containers start and stay healthy
- [ ] GET /api/health returns 200 OK
- [ ] Frontend loads without console errors
- [ ] Can create a new workout template
- [ ] Can view existing templates
- [ ] npm run build completes without errors
- [ ] npm run dev (backend) starts without errors
- [ ] npm run dev (frontend) starts without errors
- [ ] No TypeScript compilation errors
- [ ] No Docker Compose warnings

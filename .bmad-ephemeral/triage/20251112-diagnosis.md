# Triage Diagnosis - 2025-11-12

## Issue Description
Database initialization failing after fresh database creation. Backend server starts but critical functionality is broken due to:
1. FOREIGN KEY constraint failure during template seeding
2. Missing user profile (user_id=1 not initialized)
3. Schema mismatch in muscle_states table (code expects fatigue_percent, schema has initial_fatigue_percent)

## System State
- **Containers:** Both containers UP and healthy
  - fitforge-backend: Up ~1 minute (healthy)
  - fitforge-frontend: Up ~1 minute
- **Backend:** Server responding but critical endpoints failing
- **Frontend:** Running on port 3000
- **Database:** File exists (144K), schema created but empty

## What Works ✅
- `/api/health` - Returns 200 OK with timestamp
- `/api/workouts` - Returns 200 OK (empty array, no workouts yet)
- `/api/personal-bests` - Returns 200 OK (empty object)
- Container health checks passing
- Backend server startup
- Database file creation and schema execution

## What's Broken ❌

### 1. Profile Endpoint (CRITICAL)
- **URL:** `http://localhost:3001/api/profile`
- **Status:** 500 Internal Server Error
- **Error:** `TypeError: Cannot read properties of undefined (reading 'name')`
- **Root Cause:** No user record exists in database (user_id=1 not initialized)

### 2. Muscle States Endpoint (CRITICAL)
- **URL:** `http://localhost:3001/api/muscle-states`
- **Status:** 500 Internal Server Error
- **Error:** `SqliteError: no such column: fatigue_percent`
- **Root Cause:** Schema mismatch - code queries `fatigue_percent` but schema defines `initial_fatigue_percent`

### 3. Template Seeding (CRITICAL)
- **Process:** Automatic on backend startup
- **Error:** `FOREIGN KEY constraint failed`
- **Root Cause:** Trying to insert templates with user_id=1, but no user exists

## Error Messages

### Backend Startup Logs
```
Database initialized at: /data/fitforge.db
Database schema initialized
Running seed function...
Checking for existing templates...
Found 0 existing templates
Seeding default workout templates...
❌ Error seeding default templates: FOREIGN KEY constraint failed
SqliteError: FOREIGN KEY constraint failed
    at /app/backend/database/database.js:649:14
    at sqliteTransaction (/app/backend/node_modules/better-sqlite3/lib/methods/transaction.js:65:24)
    at seedDefaultTemplates (/app/backend/database/database.js:659:3)
    at Object.<anonymous> (/app/backend/database/database.js:669:1)
    at Module._compile (node:internal/modules/cjs/loader:1521:14)
```

### API Test Results

#### Health Endpoint
```bash
$ curl http://localhost:3001/api/health
{"status":"ok","timestamp":"2025-11-12T16:45:58.332Z"}
HTTP Status: 200
```

#### Profile Endpoint
```bash
$ curl http://localhost:3001/api/profile
{"error":"Failed to get profile"}
HTTP Status: 500

Backend Error:
Error getting profile: TypeError: Cannot read properties of undefined (reading 'name')
    at Object.getProfile (/app/backend/database/database.js:50:16)
```

#### Workouts Endpoint
```bash
$ curl http://localhost:3001/api/workouts
[]
HTTP Status: 200
```

#### Muscle States Endpoint
```bash
$ curl http://localhost:3001/api/muscle-states
{"error":"Failed to get muscle states"}
HTTP Status: 500

Backend Error:
Error getting muscle states: SqliteError: no such column: fatigue_percent
    at Database.prepare (/app/backend/node_modules/better-sqlite3/lib/methods/wrappers.js:5:21)
    at Object.getMuscleStates (/app/backend/database/database.js:266:21)
```

#### Personal Bests Endpoint
```bash
$ curl http://localhost:3001/api/personal-bests
{}
HTTP Status: 200
```

## Schema vs Code Mismatch Analysis

### Muscle States Table
**Schema Definition (schema.sql:62-72):**
```sql
CREATE TABLE IF NOT EXISTS muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  initial_fatigue_percent REAL NOT NULL DEFAULT 0 CHECK(initial_fatigue_percent >= 0 AND initial_fatigue_percent <= 100),
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)
);
```

**Code Query (database.js:266-270):**
```javascript
function getMuscleStates() {
  const states = db.prepare(`
    SELECT muscle_name, fatigue_percent, volume_today, recovered_at, last_trained
    FROM muscle_states
    WHERE user_id = 1
  `).all();
```

**Issues Identified:**
1. Column name mismatch: `fatigue_percent` (code) vs `initial_fatigue_percent` (schema)
2. Column missing: `recovered_at` (code expects it, schema doesn't have it)

## Initial Observations

### Root Cause Chain

1. **Primary Issue:** No user initialization on fresh database
   - Schema comment (line 181-183) says: "Default user initialization removed - handled by onboarding flow"
   - But onboarding flow is not being triggered on fresh install
   - Seeding code expects user_id=1 to exist

2. **Secondary Issue:** Schema/code drift
   - Schema was refactored to use `initial_fatigue_percent` (immutable historical fact)
   - Code still queries `fatigue_percent` and `recovered_at` (calculated values)
   - This suggests incomplete migration or stale code

3. **Cascade Effect:**
   - No user → Template seeding fails (FOREIGN KEY constraint)
   - No muscle states → Muscle states endpoint fails
   - No profile → Profile endpoint fails
   - Frontend features dependent on these APIs are non-functional

### Architectural Notes

According to schema.sql comments:
- Muscle states table stores "immutable historical facts, not calculated values"
- Default user initialization was intentionally removed in favor of onboarding flow
- Referenced OpenSpec change: `openspec/changes/2025-10-26-enable-first-time-user-onboarding/`

This suggests there was an architectural shift that wasn't fully completed:
- Schema was updated to new model
- Code wasn't fully updated to match
- Onboarding flow may not be working or may not be triggered on fresh DB

## Severity Assessment

**CRITICAL** - Application is effectively non-functional

### Impact Scope
- **User Profile:** Cannot be retrieved or created
- **Muscle States:** Cannot be retrieved or updated
- **Workout Templates:** Cannot be seeded
- **Workout Builder:** Non-functional (depends on all above)
- **Progressive Overload:** Non-functional (depends on muscle states)

### User Impact
- Fresh installation is completely broken
- No way to use the application without manual database intervention
- Onboarding flow (if it exists) is likely broken

### Required Actions
1. Determine correct source of truth (schema or code)
2. Fix schema/code alignment
3. Implement or fix user initialization flow
4. Test fresh database creation end-to-end

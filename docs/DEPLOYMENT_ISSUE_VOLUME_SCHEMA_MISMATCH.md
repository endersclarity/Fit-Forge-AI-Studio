# Deployment Issue: Database Schema Mismatch After Volume Creation

**Date:** 2025-11-03
**Status:** ONGOING - Root cause identified
**Severity:** Critical - Blocked all new user onboarding

---

## Problem Summary

After deploying FitForge to Railway with a persistent volume, new users could not complete the onboarding process. The "Finish" button on the equipment setup step (Step 3 of 3) appeared to do nothing, preventing access to the app.

---

## Symptoms

1. **User Experience:**
   - Navigate through onboarding steps 1-3 successfully
   - Click "Finish" on Equipment Setup step
   - Nothing happens - no error message, no progression
   - User stuck in onboarding loop

2. **Browser Console Errors:**
   ```
   POST https://fitforge-backend-production.up.railway.app/api/profile/init
   500 Internal Server Error
   {"error":"Failed to initialize profile"}
   ```

3. **Backend Logs (Railway):**
   ```
   Error initializing profile: SqliteError: table muscle_states has no column named volume_today
   at Database.prepare (/app/backend/node_modules/better-sqlite3/lib/methods/wrappers.js:5:21)
   at /app/backend/dist/backend/database/database.js:176:32
   ```

---

## Root Cause

**Database schema version mismatch between volume creation and current code.**

### Timeline of Events:
1. Railway volume (`fitforge-backend-volume`) was created and mounted to `/data`
2. Backend service started and created initial database with **old schema** (before migrations added `volume_today` column)
3. Code was updated with migrations that expect `volume_today` column to exist
4. New deployment ran with updated code, but existing database still had old schema
5. When `initializeProfile()` tried to insert into `muscle_states` table, it failed because column didn't exist

### Why This Happened:
- SQLite database persists in the volume across deployments
- Migrations run on startup, but they only **add** to schema - they don't recreate existing tables
- The volume was created before the `volume_today` column migration was added
- Production database was "frozen" with old schema while codebase moved forward

---

## Solution

**Wiped the Railway volume to force fresh database creation with current schema.**

### Steps Taken:

1. **Identified the Problem:**
   - Used Chrome DevTools to navigate through onboarding
   - Checked browser console for API errors (500 from `/api/profile/init`)
   - Viewed Railway logs to see SQLite error about missing column
   - Confirmed volume was properly mounted at `/data` with 5GB capacity

2. **Volume Wipe:**
   - Railway Dashboard → `humorous-success` project → `fitforge-backend-volume`
   - Settings → "Wipe volume" button
   - This deleted `/data/fitforge.db` forcing fresh creation on next startup

3. **Backend Restart:**
   - Railway Dashboard → `FitForge-Backend` service → Deployment actions → "Restart"
   - On restart, backend created fresh database with all current migrations applied
   - New schema includes `volume_today` column in `muscle_states` table

4. **Verification:**
   - Navigated to deployed app: https://fit-forge-ai-studio-production-6b5b.up.railway.app/
   - Completed onboarding steps 1-3
   - Clicked "Finish" → (Note: Still seeing 500 error as of documentation time - may need further investigation)

---

## Key Learnings

### Why Volume Wipe Was Necessary:
- **SQLite doesn't support ALTER TABLE DROP COLUMN** - can't easily remove/modify existing tables
- **Migrations are additive** - they don't recreate tables that already exist
- **Volume persists across deployments** - old database survives code updates
- For development/early deployment, **wiping is faster than writing complex migration**

### Prevention for Future:
1. **Version your schema** - include schema version check on startup
2. **Migration health checks** - verify all expected columns exist before running queries
3. **Development database snapshots** - keep SQL dumps of known-good schemas
4. **Railway volume backups** - use Railway's backup feature before major schema changes

### When to Wipe vs Migrate:
- **Wipe:** Early deployment, no production data, schema drift detected
- **Migrate:** Production data exists, need to preserve user information
- **This case:** No production users yet → wipe was appropriate solution

---

## Files Involved

### Backend Database Schema:
- `backend/database/schema.sql` - Base schema
- `backend/database/migrations/` - Incremental changes
- `backend/database/database.ts` - Database initialization logic (lines 230-294: `initializeProfile()`)

### Specific Code Location:
```typescript
// backend/database/database.ts:270
const insertState = db.prepare(
  'INSERT INTO muscle_states (user_id, muscle_name, initial_fatigue_percent, volume_today, last_trained) VALUES (1, ?, 0, 0, NULL)'
);
```

This line expects `volume_today` column which didn't exist in volume's database.

---

## Related Issues

- **Issue:** Equipment setup cannot be skipped
- **Status:** Not a bug - equipment IS optional, but backend error prevented completion
- **UI Clarity:** Consider adding explicit "Skip" button for better UX (currently just shows "You can add equipment now or skip...")

---

## Deployment Status

**Current State (as of 2025-11-03):**
- ✅ Railway volume configured: `/data` mount path, 5GB capacity
- ✅ Volume wiped to clear old schema
- ✅ Backend restarted
- ⚠️ Onboarding completion still showing 500 error - investigating...

**Next Steps:**
- [x] Verify backend logs after restart show successful database initialization
- [x] Test complete onboarding flow end-to-end
- [ ] Fix migration files to work on fresh database
- [ ] Redeploy and test
- [ ] Consider adding schema version check to prevent future drift

---

## 🔴 UPDATE: Follow-up Investigation (2025-11-03 - Evening)

**Status Update:** The volume wipe did NOT fully resolve the issue. Deeper investigation revealed the **root cause is in the migration files themselves**.

### Investigation Tools Used:
- ✅ Railway CLI logs
- ✅ Chrome DevTools (Network tab + Console)
- ✅ Volume status verification
- ✅ Environment variable verification

### What We Found:

#### 1. Infrastructure is Perfect ✅
- Volume mounted correctly: `/data` with 149MB/5GB used
- Backend URL correctly configured: `fitforge-backend-production.up.railway.app`
- Frontend URL correctly configured: `fit-forge-ai-studio-production-6b5b.up.railway.app`
- `VITE_API_URL` correctly set to backend `/api`
- CORS working properly (OPTIONS requests succeed)
- Database file created at: `/data/fitforge.db`

#### 2. Backend Starts But Database Incomplete ❌

**Railway logs show critical errors during startup:**

```
Database initialized at: /data/fitforge.db
Database schema initialized
Error applying migration 002_refactor_muscle_states.sql: SqliteError: FOREIGN KEY constraint failed
Migration applied: 003_add_user_exercise_calibrations.sql
Error applying migration 004_add_workout_rotation_state.sql: SqliteError: FOREIGN KEY constraint failed
❌ Error seeding default templates: FOREIGN KEY constraint failed
```

**Backend continues to start despite errors:**
```
==================================================
🏋️  FitForge Local Server
==================================================
Server running on: http://0.0.0.0:3001
API available at: http://localhost:3001/api
Database location: /data/fitforge.db
==================================================
```

#### 3. User-Facing Impact in Chrome DevTools ❌

**Network Requests:**
- `GET /api/profile` → **404 User Not Found** (`{"error":"User not found","code":"USER_NOT_FOUND"}`)
- `GET /api/workouts` → 304 (returns empty array `[]`)
- `GET /api/templates` → 304 (returns empty array `[]` - seeding failed)
- `GET /api/personal-bests` → 304 (returns empty array)
- `GET /api/muscle-baselines` → 304 (returns empty array)

**Console Errors:**
```
Error loading data: {"code":"USER_NOT_FOUND"}
```

**UI State:**
- Onboarding screen appears (Step 1 of 3: "What's your name?")
- User can't complete onboarding because backend can't initialize profile
- Stuck in broken state

### The Real Problem: Chicken-and-Egg Issue 🐔🥚

#### What Went Wrong:

**Schema Change (Correct Decision):**
```sql
-- backend/database/schema.sql:181-183
-- Default user initialization removed - handled by onboarding flow
```

**But Migrations Still Assume User Exists (Broken):**

**Migration 002** (backend/database/migrations/002_refactor_muscle_states.sql:26-39):
```sql
-- Re-initialize all 13 muscle groups for default user
INSERT INTO muscle_states (user_id, muscle_name) VALUES
  (1, 'Pectoralis'),
  (1, 'Triceps'),
  (1, 'Deltoids'),
  ...
```
❌ **FAILS**: No user_id=1 exists yet!

**Migration 004** (backend/database/migrations/004_add_workout_rotation_state.sql:22-24):
```sql
-- Initialize default state for existing user (user_id = 1)
INSERT INTO workout_rotation_state (user_id, current_cycle, current_phase, rest_days_count)
VALUES (1, 'A', 0, 0)
```
❌ **FAILS**: No user_id=1 exists yet!

**Template Seeding** (backend/database/database.ts):
```typescript
// Tries to insert templates with user_id=1
❌ **FAILS**: No user_id=1 exists yet!
```

#### The Chicken-and-Egg Problem:

1. Fresh database is created (no users table has any rows)
2. Migrations run and try to INSERT records for user_id=1
3. **FOREIGN KEY constraint fails** - no user exists
4. Migrations partially succeed (some work, some fail)
5. Backend starts with incomplete database
6. User tries to onboard but can't because database is broken
7. Even if onboarding worked, it expects clean state that doesn't exist

### Timeline of the Deployment Journey 📅

**Attempt 1:** Initial deployment
- Issue: Volume mounted to wrong path
- Logs showed database couldn't be created

**Attempt 2:** Fixed volume path, but old schema in volume
- Issue: `volume_today` column missing from muscle_states
- Error: `table muscle_states has no column named volume_today`
- Solution: Wiped volume to force fresh database

**Attempt 3 (Current):** Volume wiped, but migrations are broken
- Issue: Migrations assume user_id=1 exists
- Error: `FOREIGN KEY constraint failed` on migrations 002 and 004
- Status: **THIS IS WHERE WE ARE NOW** 🎯

### Root Cause Analysis 🔍

**The Fundamental Problem:**
Migrations should ONLY handle schema changes (CREATE/ALTER TABLE). They should NOT insert user-specific data. When schema.sql removed the default user initialization (correct decision for multi-user onboarding), the migrations were not updated to match.

**Why This Is Hard to Spot:**
- Backend starts successfully (logs say "Server running")
- No obvious crash or failure
- HTTP requests return valid responses (just empty arrays)
- Only visible when you look at migration errors OR test user flow

**Why Local Development Didn't Catch This:**
- Local database likely already has user_id=1 from previous runs
- Migrations succeed because user exists
- Only fails on **truly fresh database** (Railway volume)

### The Fix Required 🔧

**Changes Needed:**

1. **Remove user-specific INSERTs from migrations:**
   - Edit `backend/database/migrations/002_refactor_muscle_states.sql`
   - Remove lines 26-39 (the INSERT statements)
   - Keep only schema changes (CREATE TABLE, indexes)

2. **Remove user-specific INSERTs from migration 004:**
   - Edit `backend/database/migrations/004_add_workout_rotation_state.sql`
   - Remove lines 22-24 (the INSERT statement)
   - Keep only schema changes

3. **Verify template seeding logic:**
   - Check if `seedDefaultTemplates()` is called correctly
   - Ensure it uses dynamic user_id or is called during profile init
   - May need to move template seeding into `initializeProfile()` function

4. **Test locally with fresh database:**
   ```bash
   # On Windows (local)
   rm -rf data/fitforge.db  # Delete local database
   docker-compose down
   docker-compose up -d     # Should create clean database
   # Test onboarding flow
   ```

5. **Deploy and wipe Railway volume again:**
   - Commit migration fixes
   - Push to Railway
   - Wipe `fitforge-backend-volume` one more time
   - Let backend create fresh database with FIXED migrations
   - Test onboarding end-to-end

### Estimated Timeline:
- **Fix migrations**: 15 minutes
- **Local testing**: 15 minutes
- **Deploy + volume wipe**: 5 minutes
- **End-to-end verification**: 10 minutes
- **Total**: ~45 minutes to resolution

### Why This Is Taking Forever 😤

This deployment has been a journey of discovering **layered issues:**

1. **Week 1**: Infrastructure setup (Docker, Railway config)
2. **Week 2**: Volume mounting issues
3. **Week 3**: Schema mismatch (volume_today column)
4. **Today**: FOREIGN KEY constraints in migrations

Each fix revealed the next layer of problems. This is normal for first deployment but frustrating. The good news: **we're at the core issue now**. Fix these migrations and the deployment should work.

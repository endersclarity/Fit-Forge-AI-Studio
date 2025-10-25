# SQLite WAL File Cleanup Guide

## Problem
After switching from WAL mode to DELETE mode, old WAL files (`fitforge.db-shm`, `fitforge.db-wal`) remain in the `data/` directory and become locked by Windows processes, preventing Docker containers from starting.

## Symptoms
- Docker backend container fails health check
- Error: "Device or resource busy" when trying to delete WAL files
- Files locked even after `docker-compose down`

## Root Cause
- A process (likely Node.js, VS Code, or Windows Explorer) has an open handle to the database files
- Windows doesn't release the lock even after Docker containers stop

## Solution

### Step 1: Identify What's Locking the Files
Close all of the following:
- ✅ VS Code windows with this project open
- ✅ All terminal windows (PowerShell, Git Bash, CMD)
- ✅ Windows Explorer windows viewing the project folder
- ✅ Any running Node.js processes related to FitForge
- ✅ Docker Desktop (if needed)

### Step 2: Clean Up WAL Files

**Option A: Delete WAL files** (after closing all applications)
```powershell
# In PowerShell with admin rights
Remove-Item -Path "data\fitforge.db-shm", "data\fitforge.db-wal" -Force
```

**Option B: Rename data folder** (recommended if deletion fails)
```bash
# Backup and create fresh data directory
mv data data-backup-$(Get-Date -Format "yyyyMMdd-HHmmss")
mkdir data
```

**Option C: Use Process Explorer** (for advanced users)
1. Download [Process Explorer](https://docs.microsoft.com/en-us/sysinternals/downloads/process-explorer)
2. Run as Administrator
3. Find → Find Handle or DLL → Search for "fitforge.db"
4. Close the process holding the lock

### Step 3: Verify and Start Docker
```bash
# Verify data directory is clean
ls data/

# Should show empty directory or just fitforge.db with no WAL files

# Start Docker containers
docker-compose up -d

# Check health
docker-compose ps
```

## Prevention
The DELETE mode configuration in the backend should prevent this issue in the future:
```typescript
// backend/database/database.ts
await db.exec('PRAGMA journal_mode = DELETE;');
```

## Verification Checklist
- [ ] All applications accessing the project are closed
- [ ] WAL files removed or data folder renamed
- [ ] New data directory created
- [ ] Docker containers start successfully
- [ ] Backend health check passes
- [ ] Database queries work without errors

## Related Files
- `backend/database/database.ts` - Database initialization with DELETE mode
- `docker-compose.yml` - Container configuration
- `openspec/changes/fix-deployment-blockers/` - Full deployment fix proposal

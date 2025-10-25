# Spec: Muscle State Storage

**Capability:** `muscle-state-storage`
**Status:** Modified (Breaking Changes)
**Change:** refactor-backend-driven-muscle-states

---

## Overview

Database storage layer for muscle state data SHALL store only immutable historical facts (what happened), not calculated current state (what it means). Schema modifications improve semantic clarity and fix multi-user constraint bug.

---

## MODIFIED Requirements

### Requirement: Store Initial Fatigue at Time of Workout

**Description:** Database SHALL store fatigue percentage as it was immediately after workout completion, renamed from ambiguous `fatigue_percent` to semantic `initial_fatigue_percent`.

**Schema Change:**
```sql
-- BEFORE
fatigue_percent REAL NOT NULL DEFAULT 0

-- AFTER
initial_fatigue_percent REAL NOT NULL DEFAULT 0
```

**Acceptance Criteria:**
- Field renamed in schema
- Default value remains 0
- NOT NULL constraint maintained
- Value represents fatigue AT TIME OF WORKOUT (immutable)
- Value never recalculated after storage

#### Scenario: Initial fatigue stored when workout saved

**Given:** User completes workout with calculated muscle fatigue
**And:** Triceps fatigue calculated as 51% from workout volume
**When:** Backend saves muscle state
**Then:** `initial_fatigue_percent` is set to 51.0 in database
**And:** Value never changes until next workout for that muscle

#### Scenario: Historical fatigue preserved across time

**Given:** Muscle stored with `initial_fatigue_percent = 51.0`
**And:** 3 days pass (no new workout for that muscle)
**When:** Backend reads muscle state
**Then:** `initial_fatigue_percent` is still 51.0 (unchanged)
**And:** Current fatigue is calculated from this immutable value

---

### Requirement: Store Workout Timestamp in UTC

**Description:** Database SHALL store `last_trained` timestamp in UTC ISO 8601 format to prevent timezone calculation bugs.

**Schema:**
```sql
last_trained TEXT  -- UTC ISO 8601: "2025-10-24T18:30:00.000Z"
```

**Acceptance Criteria:**
- Field accepts TEXT type (SQLite standard for timestamps)
- Value must be UTC (enforced by application layer)
- Format: ISO 8601 with milliseconds and Z suffix
- Null allowed for never-trained muscles
- Validation rejects non-UTC timestamps

#### Scenario: Workout timestamp stored in UTC

**Given:** User logs workout at local time 11:30 AM PDT (UTC-7)
**When:** Backend stores muscle state
**Then:** `last_trained` is "2025-10-24T18:30:00.000Z" (UTC)
**And:** No local timezone information stored

#### Scenario: Never-trained muscle has null timestamp

**Given:** Muscle "Forearms" has never been trained
**When:** Database initializes muscle states
**Then:** `last_trained` is null
**And:** Remains null until first workout

---

## ADDED Requirements

### Requirement: Enforce Multi-User Composite Unique Constraint

**Description:** Database SHALL enforce unique muscle names per user using composite constraint, fixing single-user UNIQUE bug.

**Schema Change:**
```sql
-- BEFORE (BROKEN)
muscle_name TEXT NOT NULL UNIQUE

-- AFTER (FIXED)
muscle_name TEXT NOT NULL
UNIQUE(user_id, muscle_name)
```

**Acceptance Criteria:**
- Constraint applies to both columns together
- Same user cannot have duplicate muscle names
- Different users CAN have same muscle names
- Constraint violation returns SQL error
- Prevents data corruption in multi-user scenarios

#### Scenario: Same user cannot duplicate muscle

**Given:** User ID 1 has muscle "Pectoralis" in database
**When:** System attempts to INSERT another "Pectoralis" for user 1
**Then:** Database rejects with UNIQUE constraint violation
**And:** No duplicate record created

#### Scenario: Different users can have same muscle (future-proofing)

**Given:** User ID 1 has muscle "Pectoralis"
**When:** User ID 2 creates their own "Pectoralis" record
**Then:** Database accepts INSERT successfully
**And:** Two separate records exist (user_id=1, user_id=2)

---

## REMOVED Requirements

### Requirement: Remove Unused recovered_at Field

**Description:** Database SHALL remove `recovered_at` field which is always null and never used.

**Schema Change:**
```sql
-- BEFORE
recovered_at TEXT

-- AFTER
(field removed entirely)
```

**Rationale:**
- Field was always null in existing code
- Never written to by any function
- Never read by any function
- Originally intended for future recovery prediction (now calculated on-demand)
- Removing reduces schema complexity

**Acceptance Criteria:**
- Field does not exist in new schema
- Migration drops column (or recreates table)
- No application code references this field
- No impact on functionality (was dead code)

#### Scenario: Field not present after migration

**Given:** Migration script runs successfully
**When:** Schema is inspected with `PRAGMA table_info(muscle_states)`
**Then:** Field list does not include "recovered_at"
**And:** Only 7 columns exist: id, user_id, muscle_name, initial_fatigue_percent, volume_today, last_trained, updated_at

---

## Updated Schema

```sql
CREATE TABLE muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  initial_fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,                                 -- UTC ISO 8601 or null
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)                       -- Composite constraint
);

CREATE INDEX IF NOT EXISTS idx_muscle_states_user ON muscle_states(user_id);
```

---

## Migration Strategy

**Approach:** Fresh start (DROP and CREATE)

**Migration SQL:**
```sql
-- Drop existing table
DROP TABLE IF EXISTS muscle_states;

-- Recreate with new schema
CREATE TABLE muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL,
  initial_fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)
);

CREATE INDEX IF NOT EXISTS idx_muscle_states_user ON muscle_states(user_id);

-- Re-initialize default muscle states for user 1
INSERT INTO muscle_states (user_id, muscle_name) VALUES
  (1, 'Pectoralis'), (1, 'Triceps'), (1, 'Deltoids'),
  (1, 'Lats'), (1, 'Biceps'), (1, 'Rhomboids'),
  (1, 'Trapezius'), (1, 'Forearms'), (1, 'Quadriceps'),
  (1, 'Glutes'), (1, 'Hamstrings'), (1, 'Calves'), (1, 'Core');
```

**Execution:**
```bash
# Step 1: Save migration SQL to file
# backend/database/migrations/002_refactor_muscle_states.sql

# Step 2: Stop containers
docker-compose down

# Step 3: Run migration
docker-compose up -d backend
docker-compose exec backend node database/run-migration.js migrations/002_refactor_muscle_states.sql

# Step 4: Verify migration
docker-compose exec backend sqlite3 /data/fitforge.db "PRAGMA table_info(muscle_states);"

# Step 5: Restart all services
docker-compose down && docker-compose up
```

**Expected Verification Output:**
```
0|id|INTEGER|0||1
1|user_id|INTEGER|1||0
2|muscle_name|TEXT|1||0
3|initial_fatigue_percent|REAL|1|0|0
4|volume_today|REAL|1|0|0
5|last_trained|TEXT|0||0
6|updated_at|TIMESTAMP|0|CURRENT_TIMESTAMP|0
```

---

### Requirement: Update Backend Storage Functions

**Description:** Backend database operations SHALL use new field names when storing muscle states.

**Acceptance Criteria:**
- `updateMuscleStates()` accepts `initial_fatigue_percent` parameter (not `fatiguePercentage`)
- UTC validation applied to `last_trained` timestamps
- No references to `recovered_at` in code
- SQL queries use new column names

#### Scenario: Backend stores muscle state with new field names

**Given:** Frontend sends workout completion data
**And:** Request includes `{Triceps: {initial_fatigue_percent: 51, last_trained: "2025-10-24T18:30:00Z"}}`
**When:** Backend executes UPDATE query
**Then:** Query uses `SET initial_fatigue_percent = 51, last_trained = '2025-10-24T18:30:00Z'`
**And:** No reference to old `fatigue_percent` field
**And:** No reference to `recovered_at` field

---

## Implementation Notes

**Files to Modify:**
- `backend/database/schema.sql` - Update table definition
- `backend/database/database.ts` - Update field references in queries
- Create `backend/database/migrations/002_refactor_muscle_states.sql`

**Testing:**
```bash
# Verify schema
docker-compose exec backend sqlite3 /data/fitforge.db "PRAGMA table_info(muscle_states);"

# Verify data
docker-compose exec backend sqlite3 /data/fitforge.db "SELECT * FROM muscle_states LIMIT 3;"
```

---

*Spec version 1.0 - 2025-10-25*

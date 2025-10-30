# volume-today-investigation Specification

## Purpose

Investigate and document the purpose of the `volume_today` column in the `muscle_states` table, determine if it's truly unused, and decide whether to remove it or implement its intended functionality.

---

## Background

During investigation of the baseline learning system, the `volume_today` column was found to exist but never be updated. This spec documents the investigation to determine if it's vestigial code or an unimplemented feature.

---

## Investigation Requirements

### Requirement: Comprehensive Codebase Search

**Description:** System SHALL search entire codebase for all references to `volume_today` to understand its intended purpose and current usage.

**Acceptance Criteria:**
- All SQL queries mentioning `volume_today` documented
- All TypeScript/JavaScript references catalogued
- All schema definitions examined
- All comments or documentation referencing the column found

#### Scenario: Identify all read operations

**Given:** Codebase contains `volume_today` column
**When:** Searching for SELECT statements
**Then:** Document all locations where `volume_today` is read from database
**And:** Determine if values are actually used in calculations
**And:** Identify if any UI displays this value

#### Scenario: Identify all write operations

**Given:** Codebase contains `volume_today` column
**When:** Searching for INSERT and UPDATE statements
**Then:** Document all locations where `volume_today` is set
**And:** Verify if any location updates it after initialization
**And:** Determine when column should be updated (daily reset? per workout?)

#### Scenario: Trace fatigue calculation dependencies

**Given:** Fatigue system calculates fatigue percentages
**When:** Analyzing fatigue calculation code
**Then:** Determine if `volume_today` is used in formula
**And:** Identify what data IS actually used for fatigue
**And:** Document if `volume_today` was meant to be used but isn't

---

## Current Findings (As of 2025-10-29)

### Finding 1: Column Exists in Schema

**Location:** `backend/database/schema.sql` (line 67 in muscle_states table)
```sql
volume_today REAL NOT NULL DEFAULT 0,
```

**Status:** Column defined and created with default value of 0

---

### Finding 2: Column Initialized But Never Updated

**Initialization:** `backend/database/database.ts:270`
```typescript
'INSERT INTO muscle_states (user_id, muscle_name, initial_fatigue_percent, volume_today, last_trained) VALUES (1, ?, 0, 0, NULL)'
```

**Read Locations:**
- `database.ts:317` - Selected in query
- `database.ts:1709` - Selected in detailed muscle states query
- `database.ts:1757` - Mapped to response (`volumeToday: state.volume_today`)

**Update Locations:**
- **NONE FOUND** - No UPDATE statements set this column after initialization

**Evidence:** Two UPDATE statements on `muscle_states` table found:
- `database.ts:848-851` - Updates `last_trained` and `initial_fatigue_percent` only
- `database.ts:1670-1674` - Updates `initial_fatigue_percent` and `last_trained` only

Neither touches `volume_today`.

---

### Finding 3: Fatigue System Does NOT Use `volume_today`

**Frontend Fatigue Calculation:** `App.tsx:80`
```typescript
const fatiguePercent = Math.min((volume / baseline) * 100, 100);
```

**Variables Used:**
- `volume` - Calculated from current workout sets (lines 63-71)
- `baseline` - From `muscleBaselines` state (user override or system learned max)
- **NOT using `volume_today` from database**

**Fatigue Storage:** `App.tsx:97`
```typescript
initial_fatigue_percent: fatigue,
```

Stores calculated fatigue in `initial_fatigue_percent`, NOT `volume_today`.

---

### Finding 4: Column Has TypeScript Type Definition

**Location:** `types.ts:687`
```typescript
volume_today: number;
```

**Implication:** Part of the DetailedMuscleState interface, suggesting it was designed to be used but implementation never completed.

---

## Possible Original Intent (Hypothesis)

Based on the column name and structure, the likely original design was:

**Intended Flow:**
1. When workout is saved, calculate muscle volumes
2. **UPDATE** `muscle_states.volume_today` with those volumes
3. Use `volume_today / baseline` to calculate fatigue percentage
4. Daily reset: Set `volume_today = 0` at midnight

**What Actually Happens:**
1. When workout is saved, calculate muscle volumes (in frontend)
2. Calculate fatigue percentage immediately: `volume / baseline`
3. Store result in `initial_fatigue_percent` column
4. `volume_today` remains at 0 forever

**Why Current Approach Works:**
- Frontend calculates volume on-the-fly during workout save
- Fatigue stored directly as percentage, not as volume
- Backend applies time-based decay to fatigue percentage
- No need to track "today's volume" separately

---

## Decision Matrix

### Option 1: Remove `volume_today` Column

**Pros:**
- ✅ Eliminates vestigial code
- ✅ Reduces database size (minimal impact)
- ✅ Reduces confusion for future developers
- ✅ Current system works without it

**Cons:**
- ⚠️ Requires database migration (ALTER TABLE DROP COLUMN)
- ⚠️ Requires removing from TypeScript types
- ⚠️ Breaking change if anyone is reading this column (unlikely but possible)

**Migration Required:**
```sql
ALTER TABLE muscle_states DROP COLUMN volume_today;
ALTER TABLE detailed_muscle_states DROP COLUMN volume_today;
```

**Code Changes:**
- Remove from `schema.sql`
- Remove from TypeScript interfaces
- Remove from SELECT queries
- Remove from INSERT statements

---

### Option 2: Implement Volume Tracking Feature

**Pros:**
- ✅ Provides historical volume data
- ✅ Could enable "total volume today" metrics
- ✅ Could support multi-session-per-day tracking

**Cons:**
- ❌ Current fatigue system doesn't need it
- ❌ Would need daily reset logic (when to reset to 0?)
- ❌ Adds complexity for questionable benefit
- ❌ Frontend already calculates volume on-the-fly

**Implementation Required:**
- Add UPDATE logic after workout save
- Add daily reset job (cron or app startup check)
- Update frontend to display "volume today" metrics
- Define timezone handling for "today"

---

### Option 3: Leave As-Is (Document Only)

**Pros:**
- ✅ Zero risk
- ✅ No code changes needed
- ✅ No migration required

**Cons:**
- ❌ Confusing for future developers
- ❌ Wastes database space (minimal)
- ❌ Leaves incomplete feature in codebase

---

## Recommendation

**Option 1: Remove `volume_today` Column**

**Rationale:**
1. Column serves no purpose in current system
2. Fatigue calculation works correctly without it
3. No evidence of any code reading/using the value
4. Removing it improves code clarity

**Risk Assessment:**
- **Low Risk** - Column is read but values never used in calculations
- **Breaking Change** - Yes, but only if someone added external code reading this column
- **Data Loss** - None (column only contains zeros)

**Implementation Priority:** Low (cosmetic cleanup, not urgent)

---

## Validation Checklist

Before deciding to remove:
- [ ] Confirm no external tools/scripts read `volume_today`
- [ ] Verify no frontend UI displays this value
- [ ] Check no analytics/reporting depends on it
- [ ] Confirm mobile app (if exists) doesn't use it
- [ ] Search for any TODO/FIXME comments referencing it

Before implementing volume tracking:
- [ ] Define use cases: Why do we need "volume today"?
- [ ] Design daily reset behavior (midnight in what timezone?)
- [ ] Handle multiple workouts per day (sum or separate?)
- [ ] Update UI to show new metric

---

## Related Specifications

- `fix-critical-data-bugs` - Parent proposal containing this investigation
- `baseline-learning-accuracy` - Related to muscle capacity measurement
- Fatigue calculation logic (currently in `App.tsx`, no formal spec)

---

## Success Criteria for Investigation

- [ ] All references to `volume_today` documented
- [ ] Original intent clearly hypothesized
- [ ] Current fatigue calculation flow documented
- [ ] Decision made: Remove, Implement, or Leave As-Is
- [ ] If Remove: Migration plan created
- [ ] If Implement: Feature spec created
- [ ] If Leave: Documentation comment added to schema

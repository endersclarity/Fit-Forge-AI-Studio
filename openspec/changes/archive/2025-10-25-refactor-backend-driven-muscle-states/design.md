# Design: Backend-Driven Muscle State Calculations

**Change ID:** `refactor-backend-driven-muscle-states`
**Version:** 1.0
**Last Updated:** 2025-10-25

---

## 🎯 Design Goals

1. **Single Source of Truth** - All time-based calculations happen in backend only
2. **Semantic Clarity** - Database field names clearly indicate what they store
3. **Zero Calculation Logic in Frontend** - Frontend is pure presentation layer
4. **Backward Compatibility** - Phased migration prevents breaking existing functionality
5. **Maintainability** - Recovery formulas in one place, easy to modify

---

## 🏗️ Architectural Patterns

### Pattern 1: Calculation Engine Separation

**Problem:** Frontend and backend both perform the same calculations

**Solution:** Backend Calculation Engine pattern

```
┌─────────────────────────────────────────────────┐
│  Database: "What Happened"                      │
│  - initial_fatigue_percent: 51                  │
│  - last_trained: 2025-10-24T18:30:00Z           │
│  (Immutable historical fact)                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Backend: "What It Means Now"                   │
│  - Read: initial=51%, trained=1.2 days ago      │
│  - Calculate: recovery=4.1 days, current=25.5%  │
│  - Return: status="ready"                       │
│  (Real-time interpretation)                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Frontend: "What User Sees"                     │
│  - Display: "Triceps: 25.5% fatigued"          │
│  - Display: "Ready in 2.9 days"                │
│  - Display: Green status badge                  │
│  (Visual presentation only)                     │
└─────────────────────────────────────────────────┘
```

**Trade-offs:**
- ✅ Single calculation point (easy debugging)
- ✅ Frontend code reduction (~100 lines)
- ⚠️ Frontend depends on API for all calculations (acceptable - already API-dependent)
- ⚠️ Backend does more work per request (minimal - arithmetic only, <1ms)

### Pattern 2: Immutable Facts Storage

**Problem:** Database stores calculated values that become stale

**Solution:** Store only immutable historical facts, calculate current state on-demand

**Database stores:**
- `initial_fatigue_percent` - Fatigue AT TIME OF WORKOUT (never changes)
- `last_trained` - Timestamp WHEN WORKOUT HAPPENED (never changes)

**Backend calculates:**
- `currentFatiguePercent` - Fatigue NOW (changes as time passes)
- `daysElapsed` - Time since workout (changes every second)
- `daysUntilRecovered` - Remaining recovery time (changes as time passes)

**Why this works:**
- Historical facts never become stale (they're facts about the past)
- Calculations are deterministic (same inputs → same outputs)
- No cron jobs or background updates needed

### Pattern 3: Progressive Migration

**Problem:** Big-bang refactors are risky

**Solution:** 5-phase migration with checkpoints

```
Phase 1: Backend     → Checkpoint (backend ready, frontend unchanged)
Phase 2: Types       → Checkpoint (new types added, old types kept)
Phase 3: Dashboard   → Checkpoint (one component refactored)
Phase 4: Workout     → Checkpoint (save flow updated)
Phase 5: Cleanup     → Checkpoint (deprecated code removed)
```

**Rollback points:**
- After each phase, commit and verify
- Can rollback to any checkpoint
- Each phase is independently testable

---

## 🔢 Recovery Formula Design

### V1 Formula (Linear Decay)

**Design Decision:** Use simple linear decay for V1

**Recovery Time:**
```javascript
recoveryDays = 1 + (initialFatigue / 100) * 6
```

**Examples:**
- 0% fatigue → 1 day recovery (base recovery time)
- 50% fatigue → 4 days recovery (moderate workout)
- 100% fatigue → 7 days recovery (maximum fatigue)

**Decay Calculation:**
```javascript
currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)
currentFatigue = Math.max(0, currentFatigue)  // Floor at 0%
```

**Decay Curve:**
```
Fatigue %
  100 │     ●
      │      ╲
   75 │       ╲
      │        ╲
   50 │         ●
      │          ╲
   25 │           ╲
      │            ╲
    0 │_____________●_______
      0   1   2   3   4   5   6   7
              Days Elapsed
```

**Design Rationale:**
- **Simple:** Easy to understand and implement
- **Predictable:** Linear relationship between time and recovery
- **Fast:** No expensive math operations (no exp, log, etc.)
- **Good enough:** Provides value despite physiological inaccuracy

**Acknowledged Limitations:**
- Real muscle recovery is non-linear (fast initially, slower later)
- Doesn't account for muscle size differences
- Hardcoded baseline (10,000 units)

**V2 Improvements (Future):**
- Exponential decay curves
- Muscle-specific recovery rates
- Personalized baselines from workout history

---

## 🗄️ Database Schema Design

### Field Naming Convention

**Problem:** `fatigue_percent` is ambiguous

**Solution:** Semantic naming that indicates temporal state

```sql
-- ❌ BEFORE: Ambiguous
fatigue_percent REAL  -- Is this current or initial fatigue?

-- ✅ AFTER: Clear semantic meaning
initial_fatigue_percent REAL  -- Fatigue at time of workout
```

**Pairs conceptually with:**
- `currentFatiguePercent` (calculated by backend)
- `lastTrained` (when the initial fatigue was recorded)

### Constraint Design

**Problem:** UNIQUE constraint breaks multi-user support

```sql
-- ❌ BEFORE: Broken for multiple users
UNIQUE(muscle_name)  -- Two users can't both have "Pectoralis"

-- ✅ AFTER: Proper composite constraint
UNIQUE(user_id, muscle_name)  -- Each user has their own muscle states
```

**Why this matters:**
- Even though FitForge is single-user now, this is foundational architecture
- Prevents future refactoring pain if multi-user support added
- Aligns with other tables (personal_bests, muscle_baselines already use composite constraints)

### Dead Code Removal

**Field:** `recovered_at TEXT`

**Analysis:**
- Always null in codebase
- Never written to
- Never read from
- Was intended for future recovery prediction (now calculated on-demand)

**Decision:** Remove entirely
- Reduces confusion
- Simplifies schema
- No migration needed (always null anyway)

---

## 📡 API Contract Design

### Response Expansion Strategy

**Current Response (4 fields):**
```typescript
{
  fatiguePercent: number;
  volumeToday: number;
  recoveredAt: string | null;
  lastTrained: string | null;
}
```

**New Response (7 fields):**
```typescript
{
  // Calculated fields (NEW)
  currentFatiguePercent: number;
  daysElapsed: number | null;
  estimatedRecoveryDays: number;
  daysUntilRecovered: number;
  recoveryStatus: 'ready' | 'recovering' | 'fatigued';

  // Stored fields (from DB)
  initialFatiguePercent: number;
  lastTrained: string | null;
}
```

**Design Rationale:**
- **Backward incompatible:** Frontend MUST update to use new fields
- **Expansion strategy:** Add all calculated fields at once (avoid incremental API versioning)
- **Field naming:** `current` vs `initial` makes temporal state explicit
- **Status enum:** Three clear states based on research-backed thresholds (33%, 66%)

### Request Format Design

**Current:**
```typescript
{
  [muscleName]: {
    fatiguePercentage: number;
    recoveryDaysNeeded: number;
  }
}
```

**New:**
```typescript
{
  [muscleName]: {
    initial_fatigue_percent: number;  // ← snake_case matches DB column
    last_trained: string;              // ← UTC ISO 8601
    volume_today?: number;
  }
}
```

**Design Decisions:**
- **Snake case:** Matches database column names (backend internal convention)
- **Remove `recoveryDaysNeeded`:** Now calculated, not stored
- **UTC requirement:** Prevent timezone bugs (document in API contract)

---

## 🎨 Frontend Architecture Design

### Component Responsibility

**Before (Bad):**
```typescript
// Dashboard.tsx - BAD: Mixed concerns
function Dashboard() {
  const states = fetchMuscleStates();  // Data fetching
  const daysSince = getDaysSince(states.lastTrained);  // Business logic
  const fatigue = calculateFatigue(daysSince);  // Business logic
  return <MuscleCard fatigue={fatigue} />;  // Presentation
}
```

**After (Good):**
```typescript
// Dashboard.tsx - GOOD: Pure presentation
function Dashboard() {
  const states = fetchMuscleStates();  // Data fetching only
  return <MuscleCard fatigue={states.currentFatiguePercent} />;  // Presentation only
}
```

**Design Principle:** Single Responsibility Principle
- Dashboard component responsible for: layout, display, user interaction
- NOT responsible for: time calculations, recovery formulas, status determination

### Refresh Strategy Design

**Options Considered:**

1. **Periodic polling** (setInterval every N minutes)
   - ❌ Unnecessary complexity for this use case
   - ❌ Muscle fatigue changes slowly (days, not minutes)
   - ❌ Battery drain on mobile devices

2. **WebSocket/SSE real-time updates**
   - ❌ Massive over-engineering
   - ❌ This is a local-only app
   - ❌ Adds infrastructure complexity

3. **Auto-refresh on mount only**
   - ✅ Simple to implement
   - ✅ Covers primary use case (user opens app → sees fresh data)
   - ✅ No background polling overhead

4. **Auto-refresh on mount + manual button** ← **CHOSEN**
   - ✅ All benefits of option 3
   - ✅ User control for edge case (sitting on page for hours)
   - ✅ Minimal additional code

**Implementation:**
```typescript
useEffect(() => {
  fetchMuscleStates();  // Auto-refresh on mount
}, []);

<button onClick={fetchMuscleStates}>🔄 Refresh</button>
```

---

## 🧪 Testing Strategy

### Backend Testing

**Unit Tests (Future):**
```javascript
describe('getMuscleStates()', () => {
  test('never-trained muscle returns 0% fatigue', () => {
    const states = getMuscleStates();
    expect(states.Pectoralis.currentFatiguePercent).toBe(0);
    expect(states.Pectoralis.lastTrained).toBeNull();
  });

  test('just-trained muscle returns initial fatigue', () => {
    // Mock: trained 0 days ago with 51% initial fatigue
    const states = getMuscleStates();
    expect(states.Triceps.currentFatiguePercent).toBe(51);
  });

  test('partially-recovered muscle applies decay', () => {
    // Mock: trained 2 days ago, 50% initial, 4 day recovery
    const states = getMuscleStates();
    expect(states.Deltoids.currentFatiguePercent).toBe(25);  // 50% * (1 - 2/4)
  });
});
```

**Manual Testing (V1):**
```bash
# Test GET endpoint
curl http://localhost:3001/api/muscle-states | jq

# Test PUT endpoint
curl -X PUT http://localhost:3001/api/muscle-states \
  -H "Content-Type: application/json" \
  -d '{"Triceps": {"initial_fatigue_percent": 51, "last_trained": "2025-10-24T18:30:00Z"}}' | jq
```

### Frontend Testing

**Manual Test Cases:**
1. Fresh database → all muscles "Never trained"
2. Log workout → heat map updates
3. Navigate away and back → auto-refresh works
4. Click refresh button → data updates
5. Wait 24 hours → fatigue decreases
6. Muscle at 33% exactly → status is "ready"
7. Muscle at 66% exactly → status is "recovering"

### Integration Testing

**End-to-End Workflow:**
```
1. Fresh database (docker-compose down -v)
2. Start app (docker-compose up)
3. Create profile
4. Log workout (6 exercises, 18 sets)
5. Check heat map (all targeted muscles fatigued)
6. Navigate to Profile and back (auto-refresh)
7. Click refresh button (manual refresh)
8. Log second workout next day
9. Verify fatigue decreased from first workout
10. Check PRs still work
```

---

## 🔒 Security & Data Integrity

### UTC Timestamp Enforcement

**Problem:** Timezone bugs cause incorrect elapsed time

**Solution:** Enforce UTC everywhere

```typescript
// ✅ CORRECT
const now = new Date().toISOString();  // "2025-10-24T18:30:00.000Z"

// ❌ WRONG
const now = new Date().toString();  // "Thu Oct 24 2025 11:30:00 GMT-0700"
```

**Backend Validation:**
```typescript
function validateTimestamp(timestamp: string): boolean {
  // Must be ISO 8601 format with Z suffix
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(timestamp);
}
```

### Bounds Checking

**Problem:** Floating point math can produce invalid values

**Solution:** Clamp all calculated values

```typescript
// Fatigue must be 0-100
currentFatigue = Math.max(0, Math.min(100, currentFatigue));

// Days until recovered must be >= 0
daysUntilRecovered = Math.max(0, daysUntilRecovered);

// Round to 1 decimal place
currentFatigue = Math.round(currentFatigue * 10) / 10;
```

### Null Safety

**Problem:** Never-trained muscles have null timestamps

**Solution:** Explicit null handling

```typescript
const daysElapsed = muscle.last_trained
  ? (now - new Date(muscle.last_trained)) / (1000 * 60 * 60 * 24)
  : null;

const currentFatigue = muscle.last_trained
  ? calculateDecay(muscle.initial_fatigue_percent, daysElapsed)
  : 0;
```

---

## 📊 Performance Considerations

### Calculation Cost Analysis

**Per-request work:**
```
13 muscles × (
  1 date subtraction +
  2 divisions +
  1 multiplication +
  3 Math operations +
  1 comparison
) = ~130 arithmetic operations
```

**Estimated time:** <1ms on modern hardware

**Why no caching needed:**
- Local API (no network latency)
- Arithmetic is fast (no I/O, no DB queries after initial read)
- Results change over time (caching adds complexity for minimal gain)

### Database Query Optimization

**Current:**
```sql
SELECT * FROM muscle_states WHERE user_id = 1;
```

**Already optimized:**
- Index on `user_id` (idx_muscle_states_user)
- Single query fetches all 13 muscles
- No N+1 query problems

**No changes needed** - database access is already optimal.

---

## 🔮 Future Enhancements

### V2: Non-Linear Recovery Curves

**Current (V1):**
```javascript
currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays);
```

**Future (V2):**
```javascript
// Exponential decay (physiologically accurate)
currentFatigue = initialFatigue * Math.exp(-decayRate * daysElapsed);

// OR logarithmic curve
currentFatigue = initialFatigue * (1 - Math.log(1 + daysElapsed) / Math.log(1 + recoveryDays));
```

### V3: Muscle-Specific Recovery Rates

```javascript
const RECOVERY_RATES = {
  'Pectoralis': 1.2,   // Large muscles recover slower
  'Quadriceps': 1.4,
  'Triceps': 0.8,      // Small muscles recover faster
  'Forearms': 0.7
};

const recoveryDays = (1 + initialFatigue / 100 * 6) * RECOVERY_RATES[muscle];
```

### V4: Personalized Baselines

```javascript
// Learn from workout history instead of hardcoded 10,000
const personalBaseline = await db.query(`
  SELECT MAX(volume_today) FROM muscle_states
  WHERE user_id = ? AND muscle_name = ?
`);

const fatiguePercent = (workoutVolume / personalBaseline) * 100;
```

---

## 📝 Design Decisions Log

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Linear decay formula | Simple, fast, good enough for V1 | Exponential (more accurate, more complex) |
| Data wipe migration | Only test data exists | Preserve-and-migrate (unnecessary complexity) |
| 5-phase rollout | Minimize risk, clear checkpoints | Big-bang (too risky) |
| Auto-refresh on mount | Covers primary use case | Periodic polling (over-engineering) |
| Backend calculates all | Single source of truth | Frontend calculates (current buggy state) |
| UTC timestamps only | Prevent timezone bugs | Support local time (bug-prone) |
| No caching | Premature optimization | In-memory cache (unnecessary) |

---

*Design Document v1.0 - 2025-10-25*

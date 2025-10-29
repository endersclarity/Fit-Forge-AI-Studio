# Design: Dual-Layer Muscle Tracking Architecture

## Architecture Overview

### Current State (13 Visualization Muscles)

```
Exercise → muscleEngagements[] → muscle_states → Dashboard Display
              (13 muscles)        (13 records)    (13 cards)
```

**Limitation:** Cannot track stabilizers, muscle heads, regional divisions

### Proposed State (Dual-Layer System)

```
                                 ┌──────────────────────┐
                                 │   Exercise Library   │
                                 │  (40 exercises)      │
                                 └──────────┬───────────┘
                                            │
                        ┌───────────────────┴───────────────────┐
                        │                                       │
                        ▼                                       ▼
           ┌─────────────────────────┐           ┌──────────────────────────┐
           │  muscleEngagements[]    │           │ detailedMuscleEngagements│
           │  (13 viz muscles)       │           │  (40+ specific muscles)  │
           │  LEGACY - visualization │           │  NEW - recuperation      │
           └────────────┬────────────┘           └────────────┬─────────────┘
                        │                                     │
                        ▼                                     ▼
           ┌─────────────────────────┐           ┌──────────────────────────┐
           │   muscle_baselines      │           │ detailed_muscle_states   │
           │   (13 records)          │◄──────────│  (40+ records)           │
           │   UNCHANGED             │  maps to  │  role: primary/secondary │
           └────────────┬────────────┘           │        /stabilizer       │
                        │                        └────────────┬─────────────┘
                        │                                     │
                        │         Aggregation Function        │
                        │         (primary movers only)       │
                        │                  │                  │
                        │                  ▼                  │
                        │         ┌─────────────────┐         │
                        └────────►│ Visualization   │◄────────┘
                                  │  (13 cards)     │
                                  │  UNCHANGED UI   │
                                  └─────────────────┘
                                          │
                                          │ (optional toggle)
                                          ▼
                                  ┌─────────────────┐
                                  │  Detailed View  │
                                  │  (40+ muscles)  │
                                  │  OPT-IN         │
                                  └─────────────────┘
```

## Data Model

### Enumeration Structure

```typescript
// LAYER 1: Visualization (existing, 13 muscles)
enum VisualizationMuscle {
  Pectoralis = "Pectoralis",
  Triceps = "Triceps",
  Deltoids = "Deltoids",
  Lats = "Lats",
  Biceps = "Biceps",
  Rhomboids = "Rhomboids",
  Trapezius = "Trapezius",
  Forearms = "Forearms",
  Quadriceps = "Quadriceps",
  Glutes = "Glutes",
  Hamstrings = "Hamstrings",
  Calves = "Calves",
  Core = "Core",
}

// LAYER 2: Detailed (new, 40+ muscles)
enum DetailedMuscle {
  // CHEST (2)
  PectoralisMajorClavicular = "Pectoralis Major (Clavicular)",
  PectoralisMajorSternal = "Pectoralis Major (Sternal)",

  // SHOULDERS (3)
  AnteriorDeltoid = "Anterior Deltoid",
  MedialDeltoid = "Medial Deltoid",
  PosteriorDeltoid = "Posterior Deltoid",

  // ROTATOR CUFF (4)
  Infraspinatus = "Infraspinatus",
  Supraspinatus = "Supraspinatus",
  TeresMinor = "Teres Minor",
  Subscapularis = "Subscapularis",

  // SCAPULAR STABILIZERS (3)
  SerratusAnterior = "Serratus Anterior",
  RhomboidsDetailed = "Rhomboids",
  LevatorScapulae = "Levator Scapulae",

  // BACK (5)
  LatissimusDorsi = "Latissimus Dorsi",
  UpperTrapezius = "Upper Trapezius",
  MiddleTrapezius = "Middle Trapezius",
  LowerTrapezius = "Lower Trapezius",
  ErectorSpinae = "Erector Spinae",

  // ARMS (7)
  BicepsBrachii = "Biceps Brachii",
  Brachialis = "Brachialis",
  Brachioradialis = "Brachioradialis",
  TricepsLongHead = "Triceps (Long Head)",
  TricepsLateralHead = "Triceps (Lateral Head)",
  TricepsMedialHead = "Triceps (Medial Head)",
  WristFlexors = "Wrist Flexors",
  WristExtensors = "Wrist Extensors",

  // CORE (5)
  RectusAbdominis = "Rectus Abdominis",
  ExternalObliques = "External Obliques",
  InternalObliques = "Internal Obliques",
  TransverseAbdominis = "Transverse Abdominis",
  Iliopsoas = "Iliopsoas",

  // LEGS - QUADS (4)
  VastusLateralis = "Vastus Lateralis",
  VastusMedialis = "Vastus Medialis",
  VastusIntermedius = "Vastus Intermedius",
  RectusFemoris = "Rectus Femoris",

  // LEGS - GLUTES (3)
  GluteusMaximus = "Gluteus Maximus",
  GluteusMedius = "Gluteus Medius",
  GluteusMinimus = "Gluteus Minimus",

  // LEGS - HAMSTRINGS (3)
  BicepsFemoris = "Biceps Femoris",
  Semitendinosus = "Semitendinosus",
  Semimembranosus = "Semimembranosus",

  // LEGS - CALVES (3)
  GastrocnemiusMedial = "Gastrocnemius (Medial)",
  GastrocnemiusLateral = "Gastrocnemius (Lateral)",
  Soleus = "Soleus",
}

// Total: 42 detailed muscles
```

### Database Schema

#### New Table: `detailed_muscle_states`

```sql
CREATE TABLE IF NOT EXISTS detailed_muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- Muscle identification
  detailed_muscle_name TEXT NOT NULL, -- DetailedMuscle enum value
  visualization_muscle_name TEXT NOT NULL, -- Maps to VisualizationMuscle
  role TEXT NOT NULL CHECK(role IN ('primary', 'secondary', 'stabilizer')),

  -- Current state (same as muscle_states)
  fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT, -- ISO 8601 date

  -- Baseline capacity
  baseline_capacity REAL NOT NULL,
  baseline_source TEXT DEFAULT 'inherited' CHECK(
    baseline_source IN ('inherited', 'learned', 'user_override')
  ),
  baseline_confidence TEXT DEFAULT 'low' CHECK(
    baseline_confidence IN ('low', 'medium', 'high')
  ),

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, visualization_muscle_name)
    REFERENCES muscle_baselines(user_id, muscle_name) ON DELETE CASCADE,
  UNIQUE(user_id, detailed_muscle_name)
);

CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_user
  ON detailed_muscle_states(user_id);

CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_viz
  ON detailed_muscle_states(visualization_muscle_name);

CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_role
  ON detailed_muscle_states(role);

CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_updated
  ON detailed_muscle_states(updated_at);
```

#### Existing Tables: Unchanged

- `muscle_baselines` - Keep for visualization (13 muscles)
- `muscle_states` - Keep for backward compatibility
- All other tables unchanged

### Type Definitions

```typescript
// Exercise library format (add new optional field)
interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment | Equipment[];
  difficulty: Difficulty;
  variation: Variation;

  // EXISTING: For visualization (backward compatible)
  muscleEngagements: MuscleEngagement[];

  // NEW: For detailed tracking
  detailedMuscleEngagements?: DetailedMuscleEngagement[];
}

interface DetailedMuscleEngagement {
  muscle: DetailedMuscle;
  percentage: number; // % MVIC from EMG research
  role: 'primary' | 'secondary' | 'stabilizer';
  citation?: string; // Research reference
}

// Database row types
interface DetailedMuscleStateRow {
  id: number;
  user_id: number;
  detailed_muscle_name: string;
  visualization_muscle_name: string;
  role: 'primary' | 'secondary' | 'stabilizer';
  fatigue_percent: number;
  volume_today: number;
  last_trained: string | null;
  baseline_capacity: number;
  baseline_source: 'inherited' | 'learned' | 'user_override';
  baseline_confidence: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}
```

## Core Algorithms

### 1. Baseline Initialization (Conservative Approach)

**Rule:** All detailed muscles inherit the full baseline from their visualization group

```typescript
function initializeDetailedBaselines(
  userId: number,
  vizMuscle: VisualizationMuscle,
  baselineValue: number
): void {
  const detailedMuscles = DETAILED_TO_VIZ_MAP
    .filter(([detailed, viz]) => viz === vizMuscle)
    .map(([detailed]) => detailed);

  for (const detailedMuscle of detailedMuscles) {
    const role = determineRole(detailedMuscle); // primary/secondary/stabilizer

    db.insert('detailed_muscle_states', {
      user_id: userId,
      detailed_muscle_name: detailedMuscle,
      visualization_muscle_name: vizMuscle,
      role: role,
      fatigue_percent: 0,
      volume_today: 0,
      baseline_capacity: baselineValue, // Inherit full baseline
      baseline_source: 'inherited',
      baseline_confidence: 'low',
    });
  }
}
```

### 2. Visualization Aggregation (Primary Movers Only)

**Rule:** Show weighted average of PRIMARY and SECONDARY movers only, hide stabilizers

```typescript
function calculateVisualizationFatigue(
  userId: number,
  vizMuscle: VisualizationMuscle
): number {
  const detailedStates = db.query(`
    SELECT detailed_muscle_name, role, fatigue_percent
    FROM detailed_muscle_states
    WHERE user_id = ? AND visualization_muscle_name = ?
      AND role IN ('primary', 'secondary')
    ORDER BY fatigue_percent DESC
  `, [userId, vizMuscle]);

  if (detailedStates.length === 0) return 0;

  // Weighted average based on typical engagement
  const totalWeight = detailedStates.length;
  const weightedSum = detailedStates.reduce((sum, state) =>
    sum + state.fatigue_percent, 0
  );

  return weightedSum / totalWeight;
}
```

### 3. Smart Exercise Recommendations

**Rule:** Recommend exercises targeting FRESH muscles, even within same group

```typescript
function scoreExerciseOpportunity(
  exercise: Exercise,
  detailedStates: DetailedMuscleState[]
): ExerciseScore {
  const engagements = exercise.detailedMuscleEngagements || [];

  let totalFatigueLoad = 0;
  let maxMuscleFatigue = 0;
  const limitingFactors: string[] = [];

  for (const engagement of engagements) {
    const state = detailedStates.find(s =>
      s.detailed_muscle_name === engagement.muscle
    );

    if (!state) continue;

    const fatigueContribution =
      (state.fatigue_percent / 100) * (engagement.percentage / 100);

    totalFatigueLoad += fatigueContribution;

    if (state.fatigue_percent > maxMuscleFatigue) {
      maxMuscleFatigue = state.fatigue_percent;
    }

    // Track limiting factors (fatigued muscles)
    if (state.fatigue_percent > 60 && engagement.role === 'primary') {
      limitingFactors.push(engagement.muscle);
    }
  }

  const opportunityScore = 100 - (totalFatigueLoad * 100);

  return {
    exercise: exercise.name,
    opportunityScore: Math.max(0, opportunityScore),
    maxMuscleFatigue: maxMuscleFatigue,
    limitingFactors: limitingFactors,
    recommendation: determineRecommendation(opportunityScore, limitingFactors),
    reason: generateReason(engagements, detailedStates, limitingFactors),
  };
}

function generateReason(
  engagements: DetailedMuscleEngagement[],
  states: DetailedMuscleState[],
  limitingFactors: string[]
): string {
  if (limitingFactors.length > 0) {
    return `May overtrain: ${limitingFactors.join(', ')} already fatigued`;
  }

  const freshMuscles = engagements
    .filter(e => {
      const state = states.find(s => s.detailed_muscle_name === e.muscle);
      return state && state.fatigue_percent < 30 && e.role === 'primary';
    })
    .map(e => e.muscle);

  if (freshMuscles.length > 0) {
    return `Targets fresh muscles: ${freshMuscles.join(', ')}`;
  }

  return 'Moderate opportunity for training';
}
```

### 4. Uniform Recovery

**Rule:** All detailed muscles within a visualization group recover at same rate

```typescript
function applyRecovery(
  userId: number,
  hoursSinceLastUpdate: number
): void {
  // Get recovery rates for each visualization muscle
  const recoveryRates = RECOVERY_RATES; // From existing system

  // Apply recovery to detailed muscles based on their viz group
  db.exec(`
    UPDATE detailed_muscle_states
    SET
      fatigue_percent = MAX(0, fatigue_percent - (
        SELECT recovery_rate
        FROM muscle_recovery_config
        WHERE muscle_name = detailed_muscle_states.visualization_muscle_name
      ) * ?),
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `, [hoursSinceLastUpdate, userId]);
}
```

## UI Components

### Settings Toggle

```typescript
interface UserSettings {
  // Existing settings...
  muscleDetailLevel: 'simple' | 'detailed'; // NEW
}

// Settings component
function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings>({
    muscleDetailLevel: 'simple', // Default
  });

  return (
    <div className="settings-section">
      <h3>Display Settings</h3>

      <div className="setting-group">
        <label>Muscle Detail Level</label>
        <RadioGroup
          value={settings.muscleDetailLevel}
          onChange={(val) => setSettings({
            ...settings,
            muscleDetailLevel: val
          })}
        >
          <Radio value="simple">
            <strong>Simple (13 muscle groups)</strong>
            <span className="help-text">Recommended for most users</span>
          </Radio>

          <Radio value="detailed">
            <strong>Detailed (40+ specific muscles)</strong>
            <span className="help-text">
              Advanced: Shows individual muscle fatigue including
              stabilizers, rotator cuff, and muscle heads
            </span>
          </Radio>
        </RadioGroup>
      </div>
    </div>
  );
}
```

### Detailed Muscle Card

```typescript
function MuscleCard({ muscle, detailedView }: MuscleCardProps) {
  if (!detailedView) {
    // Existing simple card
    return <SimpleMuscleCard muscle={muscle} />;
  }

  // Fetch detailed muscle data
  const detailedMuscles = useDetailedMuscles(muscle);

  const primaryMovers = detailedMuscles.filter(m => m.role === 'primary');
  const secondaryMovers = detailedMuscles.filter(m => m.role === 'secondary');
  const stabilizers = detailedMuscles.filter(m => m.role === 'stabilizer');

  return (
    <div className="detailed-muscle-card">
      <div className="card-header">
        <h3>{muscle}</h3>
        <div className="aggregate-fatigue">
          {calculateAggregateFatigue(primaryMovers)}%
        </div>
      </div>

      <div className="muscle-breakdown">
        {primaryMovers.length > 0 && (
          <section className="muscle-group">
            <h4>Primary Movers</h4>
            {primaryMovers.map(m => (
              <MuscleRow
                key={m.detailed_muscle_name}
                name={m.detailed_muscle_name}
                fatigue={m.fatigue_percent}
                role="primary"
              />
            ))}
          </section>
        )}

        {secondaryMovers.length > 0 && (
          <section className="muscle-group">
            <h4>Secondary Movers</h4>
            {secondaryMovers.map(m => (
              <MuscleRow
                key={m.detailed_muscle_name}
                name={m.detailed_muscle_name}
                fatigue={m.fatigue_percent}
                role="secondary"
              />
            ))}
          </section>
        )}

        {stabilizers.length > 0 && (
          <details className="muscle-group collapsible">
            <summary>
              <h4>Stabilizers ({stabilizers.length})</h4>
            </summary>
            {stabilizers.map(m => (
              <MuscleRow
                key={m.detailed_muscle_name}
                name={m.detailed_muscle_name}
                fatigue={m.fatigue_percent}
                role="stabilizer"
              />
            ))}
          </details>
        )}
      </div>
    </div>
  );
}
```

## Migration Strategy

### Phase 1: Schema Addition (Non-Breaking)

1. Add `detailed_muscle_states` table
2. Add `detailedMuscleEngagements` field to Exercise type (optional)
3. Keep all existing tables unchanged
4. System runs with both layers

### Phase 2: Data Population

1. Initialize detailed muscle states for existing users
2. Inherit baselines from visualization muscles
3. Populate `detailedMuscleEngagements` for all 40 exercises

### Phase 3: Algorithm Migration

1. Update recommendation engine to use detailed muscles
2. Keep visualization aggregation for UI
3. Maintain backward compatibility

### Phase 4: UI Enhancement

1. Add settings toggle
2. Implement detailed view components
3. Test with power users

## Performance Considerations

### Expected Overhead

- **Database size:** +40 rows per user (~3KB)
- **Query time:** Aggregation adds ~5-10ms per muscle card
- **Memory:** Minimal (DetailedMuscle enum cached)

### Optimization Strategies

1. **Index properly** - Index on `visualization_muscle_name` for fast aggregation
2. **Batch updates** - Update all detailed muscles in single transaction
3. **Cache mappings** - Keep `DETAILED_TO_VIZ_MAP` in memory
4. **Lazy load** - Only fetch detailed data when advanced view enabled

### Benchmarking Plan

- Measure dashboard load time before/after
- Target: <5% regression
- If exceeded: Add query optimization or caching layer

## Testing Strategy

### Unit Tests

- Baseline initialization logic
- Aggregation calculations
- Mapping functions
- Recovery application

### Integration Tests

- Exercise scoring with detailed muscles
- Recommendation generation
- Database migrations
- UI toggle behavior

### User Acceptance Testing

- Power users test detailed view
- Typical users see no changes
- Recommendations feel "smarter"
- Performance acceptable

## Security & Privacy

- No new attack surface (all backend)
- Same data protection as existing muscle tracking
- User settings stored locally
- No external API calls

## Backward Compatibility

### Guaranteed

- Existing 13-muscle visualization unchanged
- All existing API endpoints work
- Database migrations non-destructive
- Users can opt-out of detailed view

### Deprecation Path

- `muscleEngagements` stays forever (visualization needs it)
- `detailedMuscleEngagements` supplements, doesn't replace
- Dual-layer architecture permanent

---

*Design Document v1.0*
*Ready for Spec Delta Creation*

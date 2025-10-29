# Dual-Layer Muscle Tracking System Design

## Overview

**Goal:** Track detailed muscle recuperation behind the scenes while keeping visualization simple and clean.

## Architecture

### Layer 1: Visualization Muscles (13 major groups)
**Purpose:** Simple, clean UI display
**Usage:** Dashboard muscle cards, visual feedback

```typescript
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
```

### Layer 2: Detailed Recuperation Muscles (30+ specific muscles)
**Purpose:** Accurate fatigue tracking, recovery calculations
**Usage:** Backend calculations, recuperation algorithms

```typescript
enum DetailedMuscle {
  // CHEST
  PectoralisMajorClavicular = "Pectoralis Major (Clavicular)",
  PectoralisMajorSternal = "Pectoralis Major (Sternal)",

  // SHOULDERS
  AnteriorDeltoid = "Anterior Deltoid",
  MedialDeltoid = "Medial Deltoid",
  PosteriorDeltoid = "Posterior Deltoid",

  // ROTATOR CUFF
  Infraspinatus = "Infraspinatus",
  Supraspinatus = "Supraspinatus",
  TeresMinor = "Teres Minor",
  Subscapularis = "Subscapularis",

  // SCAPULAR STABILIZERS
  SerratusAnterior = "Serratus Anterior",
  Rhomboids = "Rhomboids",
  LevatorScapulae = "Levator Scapulae",

  // BACK
  LatissimusDorsi = "Latissimus Dorsi",
  UpperTrapezius = "Upper Trapezius",
  MiddleTrapezius = "Middle Trapezius",
  LowerTrapezius = "Lower Trapezius",
  ErectorSpinae = "Erector Spinae",

  // ARMS
  BicepsBrachii = "Biceps Brachii",
  Brachialis = "Brachialis",
  Brachioradialis = "Brachioradialis",
  TricepsLongHead = "Triceps (Long Head)",
  TricepsLateralHead = "Triceps (Lateral Head)",
  TricepsMedialHead = "Triceps (Medial Head)",

  // FOREARMS
  WristFlexors = "Wrist Flexors",
  WristExtensors = "Wrist Extensors",

  // CORE
  RectusAbdominis = "Rectus Abdominis",
  ExternalObliques = "External Obliques",
  InternalObliques = "Internal Obliques",
  TransverseAbdominis = "Transverse Abdominis",

  // LEGS - QUADS
  VastusLateralis = "Vastus Lateralis",
  VastusMedialis = "Vastus Medialis",
  VastusIntermedius = "Vastus Intermedius",
  RectusFemoris = "Rectus Femoris",

  // LEGS - GLUTES
  GluteusMaximus = "Gluteus Maximus",
  GluteusMedius = "Gluteus Medius",
  GluteusMinimus = "Gluteus Minimus",

  // LEGS - HAMSTRINGS
  BicepsFemoris = "Biceps Femoris",
  Semitendinosus = "Semitendinosus",
  Semimembranosus = "Semimembranosus",

  // LEGS - CALVES
  GastrocnemiusMedial = "Gastrocnemius (Medial)",
  GastrocnemiusLateral = "Gastrocnemius (Lateral)",
  Soleus = "Soleus",

  // HIP FLEXORS
  Iliopsoas = "Iliopsoas",
  RectusFemorisHipFlexion = "Rectus Femoris (Hip Flexion)",
}
```

## Mapping System

```typescript
const DETAILED_TO_VISUALIZATION_MAP: Record<DetailedMuscle, VisualizationMuscle> = {
  // CHEST
  [DetailedMuscle.PectoralisMajorClavicular]: VisualizationMuscle.Pectoralis,
  [DetailedMuscle.PectoralisMajorSternal]: VisualizationMuscle.Pectoralis,

  // SHOULDERS
  [DetailedMuscle.AnteriorDeltoid]: VisualizationMuscle.Deltoids,
  [DetailedMuscle.MedialDeltoid]: VisualizationMuscle.Deltoids,
  [DetailedMuscle.PosteriorDeltoid]: VisualizationMuscle.Deltoids,

  // ROTATOR CUFF → Deltoids (stability role)
  [DetailedMuscle.Infraspinatus]: VisualizationMuscle.Deltoids,
  [DetailedMuscle.Supraspinatus]: VisualizationMuscle.Deltoids,
  [DetailedMuscle.TeresMinor]: VisualizationMuscle.Deltoids,
  [DetailedMuscle.Subscapularis]: VisualizationMuscle.Deltoids,

  // SCAPULAR STABILIZERS
  [DetailedMuscle.SerratusAnterior]: VisualizationMuscle.Core, // or could map to Pectoralis
  [DetailedMuscle.Rhomboids]: VisualizationMuscle.Rhomboids,
  [DetailedMuscle.LevatorScapulae]: VisualizationMuscle.Trapezius,

  // BACK
  [DetailedMuscle.LatissimusDorsi]: VisualizationMuscle.Lats,
  [DetailedMuscle.UpperTrapezius]: VisualizationMuscle.Trapezius,
  [DetailedMuscle.MiddleTrapezius]: VisualizationMuscle.Trapezius,
  [DetailedMuscle.LowerTrapezius]: VisualizationMuscle.Trapezius,
  [DetailedMuscle.ErectorSpinae]: VisualizationMuscle.Core,

  // ARMS
  [DetailedMuscle.BicepsBrachii]: VisualizationMuscle.Biceps,
  [DetailedMuscle.Brachialis]: VisualizationMuscle.Biceps,
  [DetailedMuscle.Brachioradialis]: VisualizationMuscle.Forearms,
  [DetailedMuscle.TricepsLongHead]: VisualizationMuscle.Triceps,
  [DetailedMuscle.TricepsLateralHead]: VisualizationMuscle.Triceps,
  [DetailedMuscle.TricepsMedialHead]: VisualizationMuscle.Triceps,

  // FOREARMS
  [DetailedMuscle.WristFlexors]: VisualizationMuscle.Forearms,
  [DetailedMuscle.WristExtensors]: VisualizationMuscle.Forearms,

  // CORE
  [DetailedMuscle.RectusAbdominis]: VisualizationMuscle.Core,
  [DetailedMuscle.ExternalObliques]: VisualizationMuscle.Core,
  [DetailedMuscle.InternalObliques]: VisualizationMuscle.Core,
  [DetailedMuscle.TransverseAbdominis]: VisualizationMuscle.Core,

  // LEGS - QUADS
  [DetailedMuscle.VastusLateralis]: VisualizationMuscle.Quadriceps,
  [DetailedMuscle.VastusMedialis]: VisualizationMuscle.Quadriceps,
  [DetailedMuscle.VastusIntermedius]: VisualizationMuscle.Quadriceps,
  [DetailedMuscle.RectusFemoris]: VisualizationMuscle.Quadriceps,

  // LEGS - GLUTES
  [DetailedMuscle.GluteusMaximus]: VisualizationMuscle.Glutes,
  [DetailedMuscle.GluteusMedius]: VisualizationMuscle.Glutes,
  [DetailedMuscle.GluteusMinimus]: VisualizationMuscle.Glutes,

  // LEGS - HAMSTRINGS
  [DetailedMuscle.BicepsFemoris]: VisualizationMuscle.Hamstrings,
  [DetailedMuscle.Semitendinosus]: VisualizationMuscle.Hamstrings,
  [DetailedMuscle.Semimembranosus]: VisualizationMuscle.Hamstrings,

  // LEGS - CALVES
  [DetailedMuscle.GastrocnemiusMedial]: VisualizationMuscle.Calves,
  [DetailedMuscle.GastrocnemiusLateral]: VisualizationMuscle.Calves,
  [DetailedMuscle.Soleus]: VisualizationMuscle.Calves,

  // HIP FLEXORS
  [DetailedMuscle.Iliopsoas]: VisualizationMuscle.Core,
  [DetailedMuscle.RectusFemorisHipFlexion]: VisualizationMuscle.Quadriceps,
};
```

## Exercise Library Format

```typescript
interface DetailedMuscleEngagement {
  muscle: DetailedMuscle;
  percentage: number; // % MVIC from EMG research
  role: 'primary' | 'secondary' | 'stabilizer';
}

interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;

  // LEGACY: Keep for backward compatibility with visualization
  muscleEngagements: MuscleEngagement[]; // Uses VisualizationMuscle

  // NEW: Detailed tracking for recuperation
  detailedMuscleEngagements: DetailedMuscleEngagement[];
}
```

## Example: Push-up with Complete Data

```typescript
{
  id: "ex03",
  name: "Push-up",
  category: "Push",

  // VISUALIZATION LAYER (current UI)
  muscleEngagements: [
    { muscle: Muscle.Pectoralis, percentage: 75 },
    { muscle: Muscle.Triceps, percentage: 75 },
    { muscle: Muscle.Deltoids, percentage: 30 },
    { muscle: Muscle.Core, percentage: 35 },
  ],

  // DETAILED LAYER (recuperation tracking)
  detailedMuscleEngagements: [
    // PRIMARY MOVERS
    { muscle: DetailedMuscle.PectoralisMajorSternal, percentage: 75, role: 'primary' },
    { muscle: DetailedMuscle.TricepsLongHead, percentage: 75, role: 'primary' },
    { muscle: DetailedMuscle.TricepsLateralHead, percentage: 75, role: 'primary' },

    // SECONDARY
    { muscle: DetailedMuscle.AnteriorDeltoid, percentage: 30, role: 'secondary' },
    { muscle: DetailedMuscle.RectusAbdominis, percentage: 35, role: 'secondary' },

    // STABILIZERS (from research!)
    { muscle: DetailedMuscle.SerratusAnterior, percentage: 45, role: 'stabilizer' },
    { muscle: DetailedMuscle.ExternalObliques, percentage: 30, role: 'stabilizer' },
    { muscle: DetailedMuscle.InternalObliques, percentage: 25, role: 'stabilizer' },
    { muscle: DetailedMuscle.ErectorSpinae, percentage: 20, role: 'stabilizer' },
    { muscle: DetailedMuscle.Infraspinatus, percentage: 15, role: 'stabilizer' },
  ],
}
```

## Database Schema Changes

### Option 1: Separate Table (Recommended)
```sql
-- Keep existing muscle_baselines table for visualization (13 muscles)
-- Add new table for detailed tracking

CREATE TABLE IF NOT EXISTS detailed_muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  detailed_muscle_name TEXT NOT NULL,
  visualization_muscle_name TEXT NOT NULL, -- FK to muscle_baselines
  fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, detailed_muscle_name)
);

CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_user
  ON detailed_muscle_states(user_id);
CREATE INDEX IF NOT EXISTS idx_detailed_muscle_states_viz
  ON detailed_muscle_states(visualization_muscle_name);
```

### Option 2: JSON Column (Alternative)
```sql
-- Add JSON column to muscle_baselines for detailed breakdown
ALTER TABLE muscle_baselines
  ADD COLUMN detailed_muscles_json TEXT; -- JSON array of detailed muscle states
```

## Recuperation Algorithm Changes

### Current: Simple per-visualization-muscle
```typescript
function calculateFatigue(muscle: VisualizationMuscle, volume: number): number {
  const baseline = getMuscleBaseline(muscle);
  return (volume / baseline) * 100;
}
```

### New: Aggregate from detailed muscles
```typescript
function calculateDetailedFatigue(
  detailedMuscle: DetailedMuscle,
  volume: number
): number {
  // Track specific muscle fatigue
  const baseline = getDetailedMuscleBaseline(detailedMuscle);
  return (volume / baseline) * 100;
}

function calculateVisualizationFatigue(
  vizMuscle: VisualizationMuscle
): number {
  // Aggregate from all detailed muscles that map to this viz muscle
  const detailedMuscles = getDetailedMusclesForVisualization(vizMuscle);

  // Use weighted average based on engagement percentages
  const weightedFatigue = detailedMuscles.reduce((sum, dm) => {
    return sum + (dm.fatiguePercent * dm.contribution);
  }, 0);

  return weightedFatigue;
}
```

## Migration Strategy

### Phase 1: Add New System (Backward Compatible)
1. Add `DetailedMuscle` enum
2. Add `detailedMuscleEngagements` to exercises (optional field)
3. Keep existing `muscleEngagements` for visualization
4. Add `detailed_muscle_states` table
5. Backend calculates both layers

### Phase 2: Populate Data
1. Update exercise library with EMG research data
2. Populate all detailed muscle engagements
3. Initialize detailed_muscle_states for user

### Phase 3: Switch Recuperation Logic
1. Backend switches to detailed muscle calculations
2. Aggregates for visualization display
3. Frontend unchanged (still shows 13 muscles)

### Phase 4: Optional Cleanup
1. Keep `muscleEngagements` for UI
2. Use `detailedMuscleEngagements` for calculations
3. Both coexist permanently

## Benefits

✅ **Accurate recuperation** - Track serratus anterior, infraspinatus, obliques separately
✅ **Simple UI** - Users still see 13 clean muscle cards
✅ **Research-backed** - All EMG data properly represented
✅ **Backward compatible** - Existing UI code unchanged
✅ **Future-proof** - Can add muscle-specific deep dives later
✅ **Better recommendations** - Know when rotator cuff needs rest even if "deltoids" look fine

## Open Questions

1. **Baseline calibration:** Do we need separate baselines for detailed muscles or derive from visualization baseline?
2. **User override:** Can users override detailed muscle baselines or only visualization level?
3. **Performance:** 30+ muscles vs 13 - acceptable overhead?
4. **Display option:** Should advanced users be able to toggle "detailed view" in UI eventually?

## Recommendation

**START:** Implement dual-layer system with Option 1 (separate table)
- Most flexible
- Clear separation of concerns
- Easy to query both layers
- No risk to existing visualization code

---

*Design Document - Ready for Review*
*Next Step: Create OpenSpec proposal for implementation*

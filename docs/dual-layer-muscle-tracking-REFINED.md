# Dual-Layer Muscle Tracking System - REFINED DESIGN

## 🎯 Design Principles

1. **Smart but Invisible** - Better recommendations without UI complexity
2. **Accuracy over Simplicity** - Track all muscles, display 13
3. **On-Demand Detail** - Advanced view available when explicitly requested
4. **Conservative Safety** - When in doubt, protect the user from injury

---

## Architecture Overview

### Layer 1: Visualization (13 Muscles) - WHAT USERS SEE
**Display:** Dashboard muscle cards, workout feedback
**Fatigue shown:** Aggregate of PRIMARY MOVERS only (ignores stabilizers)
**Purpose:** Simple mental model, clean UI

### Layer 2: Detailed (40+ Muscles) - WHAT SYSTEM TRACKS
**Tracked:** All muscles including stabilizers, synergists
**Used for:** Recovery calculations, exercise recommendations, learning
**Purpose:** Accurate recuperation, smart recommendations

---

## Key Design Decisions

### ✅ Decision 1: Conservative Baseline Initialization
**Rule:** Both detailed muscles inherit the full baseline

**Example:**
- User baseline: `Pectoralis = 2,500 lb`
- System creates:
  - `Pectoralis Major (Clavicular) = 2,500 lb baseline`
  - `Pectoralis Major (Sternal) = 2,500 lb baseline`

**Rationale:** Conservative approach prevents overtraining during initial calibration. System will learn actual capacities over time.

**Implementation:**
```typescript
function initializeDetailedBaselines(
  vizMuscle: VisualizationMuscle,
  baseline: number
): DetailedBaseline[] {
  const detailedMuscles = getDetailedMusclesForViz(vizMuscle);

  return detailedMuscles.map(dm => ({
    muscle: dm,
    baseline: baseline, // All inherit full baseline
    source: 'inherited',
    confidence: 'low' // Will improve with training data
  }));
}
```

---

### ✅ Decision 2: Visualization Shows Primary Movers Only
**Rule:** Stabilizer fatigue is HIDDEN from basic visualization

**Example - Deltoids Card:**
- ✅ Shows: Anterior deltoid (80%), Medial deltoid (40%), Posterior deltoid (20%)
- ❌ Hides: Infraspinatus (60%), Supraspinatus (45%), Teres minor (30%)
- **Display:** Weighted average of PRIMARY MOVERS = ~47% fatigue

**Rationale:** Users think of "shoulder muscles" not "rotator cuff stabilizers". Keep mental model clean.

**Implementation:**
```typescript
function calculateVisualizationFatigue(
  vizMuscle: VisualizationMuscle
): number {
  const detailedMuscles = getDetailedMusclesForViz(vizMuscle);

  // ONLY include primary/secondary movers, EXCLUDE stabilizers
  const movers = detailedMuscles.filter(dm =>
    dm.role === 'primary' || dm.role === 'secondary'
  );

  // Weighted average based on typical engagement
  return calculateWeightedAverage(movers);
}
```

---

### ✅ Decision 3: Uniform Recovery Within Groups
**Rule:** All detailed muscles within a visualization group recover at the same rate

**Example:**
- `Biceps Brachii`, `Brachialis`, `Brachioradialis` all use same recovery curve
- No special treatment for fast-twitch vs slow-twitch
- No role-based modifiers (primary vs stabilizer)

**Rationale:** Simpler to reason about, easier to maintain. Can add sophistication later if data shows need.

**Implementation:**
```typescript
function calculateRecovery(
  detailedMuscle: DetailedMuscle,
  hoursSinceTraining: number
): number {
  const vizMuscle = mapToVisualization(detailedMuscle);
  const recoveryRate = RECOVERY_RATES[vizMuscle]; // Same rate for all in group

  return Math.max(0, currentFatigue - (recoveryRate * hoursSinceTraining));
}
```

---

### ✅ Decision 4: Smart Muscle-Specific Recommendations
**Rule:** Recommend exercises that work FRESH muscles, even within same group

**Example Scenario:**
- User just did heavy bench press + shoulder press
- `Anterior Deltoid: 85% fatigued`
- `Posterior Deltoid: 15% fatigued`

**System Behavior:**
- ❌ Don't recommend: Shoulder Press, Bench Press (hit anterior delt)
- ✅ DO recommend: Face Pulls, Reverse Flys (hit posterior delt)
- **User sees:** "Your shoulders are partially recovered - good for rear delt work!"

**Rationale:** Optimize training by targeting fresh muscles. This is where detailed tracking shines.

**Implementation:**
```typescript
function recommendExercises(
  availableExercises: Exercise[],
  muscleStates: DetailedMuscleState[]
): ExerciseRecommendation[] {

  return availableExercises.map(exercise => {
    // Check DETAILED muscles, not just visualization groups
    const detailedEngagements = exercise.detailedMuscleEngagements;

    const fatigueScore = detailedEngagements.reduce((sum, eng) => {
      const muscleState = muscleStates.find(s => s.muscle === eng.muscle);
      return sum + (muscleState.fatigue * eng.percentage / 100);
    }, 0);

    return {
      exercise: exercise,
      fatigueScore: fatigueScore,
      recommendation: getFatigueLevel(fatigueScore),
      reason: generateSmartReason(detailedEngagements, muscleStates)
    };
  });
}

function generateSmartReason(
  engagements: DetailedMuscleEngagement[],
  states: DetailedMuscleState[]
): string {
  const fatigued = engagements.filter(e =>
    states.find(s => s.muscle === e.muscle)?.fatigue > 60
  );

  const fresh = engagements.filter(e =>
    states.find(s => s.muscle === e.muscle)?.fatigue < 30
  );

  if (fresh.length > fatigued.length) {
    return `Targets fresh muscles: ${fresh.map(f => f.muscle).join(', ')}`;
  } else {
    return `May overtrain: ${fatigued.map(f => f.muscle).join(', ')} already fatigued`;
  }
}
```

---

### ✅ Decision 5: Advanced Toggle for Power Users
**Rule:** Default view = 13 muscles. Optional "Detailed View" in settings.

**UI Specification:**

**Settings Screen:**
```
⚙️ Settings > Display > Muscle Detail Level

○ Simple (13 muscle groups) - Recommended
● Detailed (40+ specific muscles) - Advanced

ℹ️ Detailed view shows individual muscle fatigue including
   stabilizers, rotator cuff, and muscle heads.
   Useful for experienced lifters tracking specific weaknesses.
```

**Dashboard Changes When Enabled:**

**SIMPLE MODE (Default):**
```
┌─────────────────────┐
│ 💪 Deltoids    47%  │
│ ▓▓▓▓▓░░░░░          │
└─────────────────────┘
```

**DETAILED MODE (Opt-in):**
```
┌─────────────────────────────────┐
│ 💪 Deltoids (Group)        47%  │
│ ▓▓▓▓▓░░░░░                      │
│                                  │
│ Primary Movers:                  │
│   • Anterior Deltoid      80% ▓▓▓▓▓▓▓▓░░ │
│   • Medial Deltoid        40% ▓▓▓▓░░░░░░ │
│   • Posterior Deltoid     20% ▓▓░░░░░░░░ │
│                                  │
│ Stabilizers:                     │
│   • Infraspinatus        60% ▓▓▓▓▓▓░░░░ │
│   • Supraspinatus        45% ▓▓▓▓▓░░░░░ │
│   • Teres Minor          30% ▓▓▓░░░░░░░ │
└─────────────────────────────────┘
```

**Implementation:**
```typescript
// User preference
interface UserSettings {
  muscleDetailLevel: 'simple' | 'detailed';
}

// Component logic
function MuscleCard({ muscle, detailedView }: Props) {
  if (!detailedView) {
    return <SimpleMuscleCard muscle={muscle} />;
  }

  return (
    <DetailedMuscleCard
      muscle={muscle}
      primaryMovers={getPrimaryMovers(muscle)}
      stabilizers={getStabilizers(muscle)}
    />
  );
}
```

---

## Database Schema

### Existing (Keep Unchanged)
```sql
CREATE TABLE IF NOT EXISTS muscle_baselines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  muscle_name TEXT NOT NULL, -- 13 visualization muscles
  system_learned_max REAL NOT NULL DEFAULT 10000,
  user_override REAL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, muscle_name)
);
```

### New (Add for Detailed Tracking)
```sql
CREATE TABLE IF NOT EXISTS detailed_muscle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  detailed_muscle_name TEXT NOT NULL, -- 40+ specific muscles
  visualization_muscle_name TEXT NOT NULL, -- Maps to muscle_baselines
  role TEXT NOT NULL, -- 'primary', 'secondary', 'stabilizer'

  -- Fatigue tracking
  fatigue_percent REAL NOT NULL DEFAULT 0,
  volume_today REAL NOT NULL DEFAULT 0,
  last_trained TEXT,

  -- Baseline (inherited from visualization muscle initially)
  baseline_capacity REAL NOT NULL,
  baseline_source TEXT DEFAULT 'inherited', -- 'inherited' | 'learned' | 'user_override'
  baseline_confidence TEXT DEFAULT 'low', -- 'low' | 'medium' | 'high'

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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
```

---

## Exercise Library Format

```typescript
interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment | Equipment[];
  difficulty: Difficulty;
  variation: Variation;

  // LAYER 1: Visualization (existing, keep for backward compatibility)
  muscleEngagements: MuscleEngagement[]; // 13 viz muscles

  // LAYER 2: Detailed tracking (new)
  detailedMuscleEngagements: DetailedMuscleEngagement[]; // 40+ muscles
}

interface DetailedMuscleEngagement {
  muscle: DetailedMuscle; // Enum of 40+ muscles
  percentage: number; // % MVIC from EMG research
  role: 'primary' | 'secondary' | 'stabilizer';
  citation?: string; // Optional research reference
}
```

---

## Example: Push-up Complete Data

```typescript
{
  id: "ex03",
  name: "Push-up",
  category: "Push",
  equipment: "Bodyweight",
  difficulty: "Beginner",
  variation: "B",

  // SIMPLE VIEW (existing)
  muscleEngagements: [
    { muscle: Muscle.Pectoralis, percentage: 75 },
    { muscle: Muscle.Triceps, percentage: 75 },
    { muscle: Muscle.Deltoids, percentage: 30 },
    { muscle: Muscle.Core, percentage: 35 },
  ],

  // DETAILED VIEW (new - from EMG research)
  detailedMuscleEngagements: [
    // PRIMARY MOVERS (shown in visualization)
    {
      muscle: DetailedMuscle.PectoralisMajorSternal,
      percentage: 75,
      role: 'primary',
      citation: 'Rodríguez-Ridao et al., 2020'
    },
    {
      muscle: DetailedMuscle.TricepsLongHead,
      percentage: 75,
      role: 'primary',
      citation: 'Rodríguez-Ridao et al., 2020'
    },
    {
      muscle: DetailedMuscle.TricepsLateralHead,
      percentage: 75,
      role: 'primary',
      citation: 'Rodríguez-Ridao et al., 2020'
    },

    // SECONDARY MOVERS (shown in visualization)
    {
      muscle: DetailedMuscle.AnteriorDeltoid,
      percentage: 30,
      role: 'secondary',
      citation: 'Rodríguez-Ridao et al., 2020'
    },
    {
      muscle: DetailedMuscle.RectusAbdominis,
      percentage: 35,
      role: 'secondary',
      citation: 'Rodríguez-Ridao et al., 2020'
    },

    // STABILIZERS (hidden from basic view, used for recommendations)
    {
      muscle: DetailedMuscle.SerratusAnterior,
      percentage: 45,
      role: 'stabilizer',
      citation: 'Rodríguez-Ridao et al., 2020'
    },
    {
      muscle: DetailedMuscle.ExternalObliques,
      percentage: 30,
      role: 'stabilizer'
    },
    {
      muscle: DetailedMuscle.InternalObliques,
      percentage: 25,
      role: 'stabilizer'
    },
    {
      muscle: DetailedMuscle.ErectorSpinae,
      percentage: 20,
      role: 'stabilizer'
    },
    {
      muscle: DetailedMuscle.Infraspinatus,
      percentage: 15,
      role: 'stabilizer'
    },
  ],
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Add `DetailedMuscle` enum (40+ muscles)
- [ ] Add `detailed_muscle_states` table
- [ ] Create mapping functions (detailed ↔ visualization)
- [ ] Initialize detailed baselines from existing visualization baselines

### Phase 2: Data Population (Week 2)
- [ ] Update all 40 exercises with `detailedMuscleEngagements` from EMG research
- [ ] Populate detailed muscle data for test user
- [ ] Verify aggregation logic works correctly

### Phase 3: Smart Recommendations (Week 3)
- [ ] Refactor recommendation engine to use detailed muscles
- [ ] Add muscle-specific reasoning ("targets fresh posterior delts")
- [ ] Test recommendation accuracy improvements

### Phase 4: Advanced UI Toggle (Week 4)
- [ ] Add settings toggle for muscle detail level
- [ ] Create `DetailedMuscleCard` component
- [ ] Add expandable sections for stabilizers
- [ ] User testing with power users

### Phase 5: Learning & Optimization (Ongoing)
- [ ] Track detailed muscle volume over time
- [ ] Improve baseline confidence as data accumulates
- [ ] Identify patterns (e.g., "user's serratus anterior recovers faster")

---

## Success Metrics

### Quantitative
- ✅ Recommendation accuracy improves (fewer "this feels wrong" moments)
- ✅ User completion rate of recommended workouts increases
- ✅ Reduced reports of muscle soreness mismatches
- ✅ <5% performance impact on dashboard load time

### Qualitative
- ✅ Recommendations "feel smarter" to users
- ✅ Advanced users appreciate detailed view
- ✅ No confusion from basic users (they don't notice the change)
- ✅ System learns user patterns over time

---

## Open Questions

1. **Auto-learn baselines?** Should system automatically adjust detailed muscle baselines based on observed performance, or wait for user input?

2. **Show confidence?** In detailed view, should we show baseline confidence (low/medium/high) to help users understand what system knows?

3. **Asymmetry tracking?** Should we track left vs right side separately for unilateral exercises?

4. **Export data?** Should power users be able to export detailed muscle data for their own analysis?

---

## Next Steps

1. **Review this design** - Confirm this matches your vision
2. **Create OpenSpec proposal** - Formal change proposal with implementation plan
3. **Prototype recommendation engine** - Test if detailed tracking actually improves recommendations
4. **Build Phase 1** - Foundational schema and enum changes

---

*Design Document v2.0 - Ready for Implementation*
*Incorporates decisions from brainstorming session*

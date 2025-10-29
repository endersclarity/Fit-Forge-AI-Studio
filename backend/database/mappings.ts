/**
 * Dual-Layer Muscle Tracking Mappings
 *
 * Maps 42 detailed muscles to 13 visualization muscles for dual-layer architecture:
 * - Layer 1 (Visualization): 13 muscle groups for clean UI
 * - Layer 2 (Detailed): 42 specific muscles for accurate recuperation tracking
 *
 * This enables granular tracking of stabilizers, rotator cuff, and muscle subdivisions
 * while maintaining a simple user interface.
 */

import { Muscle, DetailedMuscle } from '../types';

/**
 * Map each detailed muscle to its visualization muscle group
 * This is the canonical source of truth for the dual-layer architecture
 */
export const DETAILED_TO_VIZ_MAP: Record<DetailedMuscle, Muscle> = {
  // CHEST → Pectoralis
  [DetailedMuscle.PectoralisMajorClavicular]: Muscle.Pectoralis,
  [DetailedMuscle.PectoralisMajorSternal]: Muscle.Pectoralis,

  // SHOULDERS → Deltoids
  [DetailedMuscle.AnteriorDeltoid]: Muscle.Deltoids,
  [DetailedMuscle.MedialDeltoid]: Muscle.Deltoids,
  [DetailedMuscle.PosteriorDeltoid]: Muscle.Deltoids,

  // ROTATOR CUFF → Deltoids (stabilizers for shoulder)
  [DetailedMuscle.Infraspinatus]: Muscle.Deltoids,
  [DetailedMuscle.Supraspinatus]: Muscle.Deltoids,
  [DetailedMuscle.TeresMinor]: Muscle.Deltoids,
  [DetailedMuscle.Subscapularis]: Muscle.Deltoids,

  // SCAPULAR STABILIZERS
  [DetailedMuscle.SerratusAnterior]: Muscle.Pectoralis, // Assists in push movements
  [DetailedMuscle.RhomboidsDetailed]: Muscle.Rhomboids,
  [DetailedMuscle.LevatorScapulae]: Muscle.Trapezius,

  // BACK
  [DetailedMuscle.LatissimusDorsi]: Muscle.Lats,
  [DetailedMuscle.UpperTrapezius]: Muscle.Trapezius,
  [DetailedMuscle.MiddleTrapezius]: Muscle.Trapezius,
  [DetailedMuscle.LowerTrapezius]: Muscle.Trapezius,
  [DetailedMuscle.ErectorSpinae]: Muscle.Core, // Lower back stabilizer

  // ARMS - Biceps group
  [DetailedMuscle.BicepsBrachii]: Muscle.Biceps,
  [DetailedMuscle.Brachialis]: Muscle.Biceps,
  [DetailedMuscle.Brachioradialis]: Muscle.Forearms,

  // ARMS - Triceps group
  [DetailedMuscle.TricepsLongHead]: Muscle.Triceps,
  [DetailedMuscle.TricepsLateralHead]: Muscle.Triceps,
  [DetailedMuscle.TricepsMedialHead]: Muscle.Triceps,

  // ARMS - Forearms
  [DetailedMuscle.WristFlexors]: Muscle.Forearms,
  [DetailedMuscle.WristExtensors]: Muscle.Forearms,

  // CORE
  [DetailedMuscle.RectusAbdominis]: Muscle.Core,
  [DetailedMuscle.ExternalObliques]: Muscle.Core,
  [DetailedMuscle.InternalObliques]: Muscle.Core,
  [DetailedMuscle.TransverseAbdominis]: Muscle.Core,
  [DetailedMuscle.Iliopsoas]: Muscle.Core,

  // LEGS - Quadriceps
  [DetailedMuscle.VastusLateralis]: Muscle.Quadriceps,
  [DetailedMuscle.VastusMedialis]: Muscle.Quadriceps,
  [DetailedMuscle.VastusIntermedius]: Muscle.Quadriceps,
  [DetailedMuscle.RectusFemoris]: Muscle.Quadriceps,

  // LEGS - Glutes
  [DetailedMuscle.GluteusMaximus]: Muscle.Glutes,
  [DetailedMuscle.GluteusMedius]: Muscle.Glutes,
  [DetailedMuscle.GluteusMinimus]: Muscle.Glutes,

  // LEGS - Hamstrings
  [DetailedMuscle.BicepsFemoris]: Muscle.Hamstrings,
  [DetailedMuscle.Semitendinosus]: Muscle.Hamstrings,
  [DetailedMuscle.Semimembranosus]: Muscle.Hamstrings,

  // LEGS - Calves
  [DetailedMuscle.GastrocnemiusMedial]: Muscle.Calves,
  [DetailedMuscle.GastrocnemiusLateral]: Muscle.Calves,
  [DetailedMuscle.Soleus]: Muscle.Calves,
};

/**
 * Reverse map: Get all detailed muscles for a given visualization muscle
 * Built dynamically from DETAILED_TO_VIZ_MAP to maintain single source of truth
 */
export const VIZ_TO_DETAILED_MAP: Record<Muscle, DetailedMuscle[]> = (() => {
  const map: Record<Muscle, DetailedMuscle[]> = {} as Record<Muscle, DetailedMuscle[]>;

  // Initialize empty arrays for each visualization muscle
  Object.values(Muscle).forEach((vizMuscle) => {
    map[vizMuscle] = [];
  });

  // Populate by inverting DETAILED_TO_VIZ_MAP
  Object.entries(DETAILED_TO_VIZ_MAP).forEach(([detailedMuscle, vizMuscle]) => {
    map[vizMuscle].push(detailedMuscle as DetailedMuscle);
  });

  return map;
})();

/**
 * Determine the role of a detailed muscle in exercises
 *
 * Rules:
 * - Rotator cuff muscles are always stabilizers
 * - Scapular stabilizers (serratus, levator) are always stabilizers
 * - Erector spinae is a stabilizer
 * - All others are classified dynamically based on engagement percentage in exercises
 */
export function determineDefaultRole(detailed: DetailedMuscle): 'primary' | 'secondary' | 'stabilizer' {
  // Rotator cuff muscles are always stabilizers
  if ([
    DetailedMuscle.Infraspinatus,
    DetailedMuscle.Supraspinatus,
    DetailedMuscle.TeresMinor,
    DetailedMuscle.Subscapularis,
  ].includes(detailed)) {
    return 'stabilizer';
  }

  // Scapular stabilizers
  if ([
    DetailedMuscle.SerratusAnterior,
    DetailedMuscle.LevatorScapulae,
  ].includes(detailed)) {
    return 'stabilizer';
  }

  // Erector spinae is a core stabilizer
  if (detailed === DetailedMuscle.ErectorSpinae) {
    return 'stabilizer';
  }

  // Default to primary for movers (actual role determined per exercise)
  return 'primary';
}

/**
 * Get the visualization muscle for a given detailed muscle
 */
export function getVisualizationMuscle(detailed: DetailedMuscle): Muscle {
  return DETAILED_TO_VIZ_MAP[detailed];
}

/**
 * Get all detailed muscles for a given visualization muscle
 */
export function getDetailedMuscles(viz: Muscle): DetailedMuscle[] {
  return VIZ_TO_DETAILED_MAP[viz];
}

/**
 * Get total count of detailed muscles
 */
export function getDetailedMuscleCount(): number {
  return Object.keys(DetailedMuscle).length;
}

/**
 * Validate that all detailed muscles have a mapping
 * Throws error if mapping is incomplete (useful for tests)
 */
export function validateMappingCompleteness(): void {
  const allDetailedMuscles = Object.values(DetailedMuscle);
  const mappedMuscles = Object.keys(DETAILED_TO_VIZ_MAP);

  if (allDetailedMuscles.length !== mappedMuscles.length) {
    throw new Error(
      `Incomplete muscle mapping: ${allDetailedMuscles.length} detailed muscles but only ${mappedMuscles.length} mapped`
    );
  }

  // Verify all visualization muscles have at least one detailed muscle
  Object.values(Muscle).forEach((vizMuscle) => {
    if (!VIZ_TO_DETAILED_MAP[vizMuscle] || VIZ_TO_DETAILED_MAP[vizMuscle].length === 0) {
      throw new Error(`Visualization muscle "${vizMuscle}" has no detailed muscles mapped to it`);
    }
  });
}

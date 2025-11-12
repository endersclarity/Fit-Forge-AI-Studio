"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIZ_TO_DETAILED_MAP = exports.DETAILED_TO_VIZ_MAP = void 0;
exports.determineDefaultRole = determineDefaultRole;
exports.getVisualizationMuscle = getVisualizationMuscle;
exports.getDetailedMuscles = getDetailedMuscles;
exports.getDetailedMuscleCount = getDetailedMuscleCount;
exports.validateMappingCompleteness = validateMappingCompleteness;
const types_1 = require("../types");
/**
 * Map each detailed muscle to its visualization muscle group
 * This is the canonical source of truth for the dual-layer architecture
 */
exports.DETAILED_TO_VIZ_MAP = {
    // CHEST → Pectoralis
    [types_1.DetailedMuscle.PectoralisMajorClavicular]: types_1.Muscle.Pectoralis,
    [types_1.DetailedMuscle.PectoralisMajorSternal]: types_1.Muscle.Pectoralis,
    // SHOULDERS → Deltoids
    [types_1.DetailedMuscle.AnteriorDeltoid]: types_1.Muscle.Deltoids,
    [types_1.DetailedMuscle.MedialDeltoid]: types_1.Muscle.Deltoids,
    [types_1.DetailedMuscle.PosteriorDeltoid]: types_1.Muscle.Deltoids,
    // ROTATOR CUFF → Deltoids (stabilizers for shoulder)
    [types_1.DetailedMuscle.Infraspinatus]: types_1.Muscle.Deltoids,
    [types_1.DetailedMuscle.Supraspinatus]: types_1.Muscle.Deltoids,
    [types_1.DetailedMuscle.TeresMinor]: types_1.Muscle.Deltoids,
    [types_1.DetailedMuscle.Subscapularis]: types_1.Muscle.Deltoids,
    // SCAPULAR STABILIZERS
    [types_1.DetailedMuscle.SerratusAnterior]: types_1.Muscle.Pectoralis, // Assists in push movements
    [types_1.DetailedMuscle.RhomboidsDetailed]: types_1.Muscle.Rhomboids,
    [types_1.DetailedMuscle.LevatorScapulae]: types_1.Muscle.Trapezius,
    // BACK
    [types_1.DetailedMuscle.LatissimusDorsi]: types_1.Muscle.Lats,
    [types_1.DetailedMuscle.UpperTrapezius]: types_1.Muscle.Trapezius,
    [types_1.DetailedMuscle.MiddleTrapezius]: types_1.Muscle.Trapezius,
    [types_1.DetailedMuscle.LowerTrapezius]: types_1.Muscle.Trapezius,
    [types_1.DetailedMuscle.ErectorSpinae]: types_1.Muscle.Core, // Lower back stabilizer
    // ARMS - Biceps group
    [types_1.DetailedMuscle.BicepsBrachii]: types_1.Muscle.Biceps,
    [types_1.DetailedMuscle.Brachialis]: types_1.Muscle.Biceps,
    [types_1.DetailedMuscle.Brachioradialis]: types_1.Muscle.Forearms,
    // ARMS - Triceps group
    [types_1.DetailedMuscle.TricepsLongHead]: types_1.Muscle.Triceps,
    [types_1.DetailedMuscle.TricepsLateralHead]: types_1.Muscle.Triceps,
    [types_1.DetailedMuscle.TricepsMedialHead]: types_1.Muscle.Triceps,
    // ARMS - Forearms
    [types_1.DetailedMuscle.WristFlexors]: types_1.Muscle.Forearms,
    [types_1.DetailedMuscle.WristExtensors]: types_1.Muscle.Forearms,
    // CORE
    [types_1.DetailedMuscle.RectusAbdominis]: types_1.Muscle.Core,
    [types_1.DetailedMuscle.ExternalObliques]: types_1.Muscle.Core,
    [types_1.DetailedMuscle.InternalObliques]: types_1.Muscle.Core,
    [types_1.DetailedMuscle.TransverseAbdominis]: types_1.Muscle.Core,
    [types_1.DetailedMuscle.Iliopsoas]: types_1.Muscle.Core,
    // LEGS - Quadriceps
    [types_1.DetailedMuscle.VastusLateralis]: types_1.Muscle.Quadriceps,
    [types_1.DetailedMuscle.VastusMedialis]: types_1.Muscle.Quadriceps,
    [types_1.DetailedMuscle.VastusIntermedius]: types_1.Muscle.Quadriceps,
    [types_1.DetailedMuscle.RectusFemoris]: types_1.Muscle.Quadriceps,
    // LEGS - Glutes
    [types_1.DetailedMuscle.GluteusMaximus]: types_1.Muscle.Glutes,
    [types_1.DetailedMuscle.GluteusMedius]: types_1.Muscle.Glutes,
    [types_1.DetailedMuscle.GluteusMinimus]: types_1.Muscle.Glutes,
    // LEGS - Hamstrings
    [types_1.DetailedMuscle.BicepsFemoris]: types_1.Muscle.Hamstrings,
    [types_1.DetailedMuscle.Semitendinosus]: types_1.Muscle.Hamstrings,
    [types_1.DetailedMuscle.Semimembranosus]: types_1.Muscle.Hamstrings,
    // LEGS - Calves
    [types_1.DetailedMuscle.GastrocnemiusMedial]: types_1.Muscle.Calves,
    [types_1.DetailedMuscle.GastrocnemiusLateral]: types_1.Muscle.Calves,
    [types_1.DetailedMuscle.Soleus]: types_1.Muscle.Calves,
};
/**
 * Reverse map: Get all detailed muscles for a given visualization muscle
 * Built dynamically from DETAILED_TO_VIZ_MAP to maintain single source of truth
 */
exports.VIZ_TO_DETAILED_MAP = (() => {
    const map = {};
    // Initialize empty arrays for each visualization muscle
    Object.values(types_1.Muscle).forEach((vizMuscle) => {
        map[vizMuscle] = [];
    });
    // Populate by inverting DETAILED_TO_VIZ_MAP
    Object.entries(exports.DETAILED_TO_VIZ_MAP).forEach(([detailedMuscle, vizMuscle]) => {
        map[vizMuscle].push(detailedMuscle);
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
function determineDefaultRole(detailed) {
    // Rotator cuff muscles are always stabilizers
    if ([
        types_1.DetailedMuscle.Infraspinatus,
        types_1.DetailedMuscle.Supraspinatus,
        types_1.DetailedMuscle.TeresMinor,
        types_1.DetailedMuscle.Subscapularis,
    ].includes(detailed)) {
        return 'stabilizer';
    }
    // Scapular stabilizers
    if ([
        types_1.DetailedMuscle.SerratusAnterior,
        types_1.DetailedMuscle.LevatorScapulae,
    ].includes(detailed)) {
        return 'stabilizer';
    }
    // Erector spinae is a core stabilizer
    if (detailed === types_1.DetailedMuscle.ErectorSpinae) {
        return 'stabilizer';
    }
    // Default to primary for movers (actual role determined per exercise)
    return 'primary';
}
/**
 * Get the visualization muscle for a given detailed muscle
 */
function getVisualizationMuscle(detailed) {
    return exports.DETAILED_TO_VIZ_MAP[detailed];
}
/**
 * Get all detailed muscles for a given visualization muscle
 */
function getDetailedMuscles(viz) {
    return exports.VIZ_TO_DETAILED_MAP[viz];
}
/**
 * Get total count of detailed muscles
 */
function getDetailedMuscleCount() {
    return Object.keys(types_1.DetailedMuscle).length;
}
/**
 * Validate that all detailed muscles have a mapping
 * Throws error if mapping is incomplete (useful for tests)
 */
function validateMappingCompleteness() {
    const allDetailedMuscles = Object.values(types_1.DetailedMuscle);
    const mappedMuscles = Object.keys(exports.DETAILED_TO_VIZ_MAP);
    if (allDetailedMuscles.length !== mappedMuscles.length) {
        throw new Error(`Incomplete muscle mapping: ${allDetailedMuscles.length} detailed muscles but only ${mappedMuscles.length} mapped`);
    }
    // Verify all visualization muscles have at least one detailed muscle
    Object.values(types_1.Muscle).forEach((vizMuscle) => {
        if (!exports.VIZ_TO_DETAILED_MAP[vizMuscle] || exports.VIZ_TO_DETAILED_MAP[vizMuscle].length === 0) {
            throw new Error(`Visualization muscle "${vizMuscle}" has no detailed muscles mapped to it`);
        }
    });
}

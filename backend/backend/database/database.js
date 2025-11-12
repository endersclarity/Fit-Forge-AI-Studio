"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.seedDefaultTemplates = seedDefaultTemplates;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.initializeProfile = initializeProfile;
exports.getWorkouts = getWorkouts;
exports.getLastWorkoutByCategory = getLastWorkoutByCategory;
exports.getLastVariationForCategory = getLastVariationForCategory;
exports.saveWorkout = saveWorkout;
exports.detectPRsForWorkout = detectPRsForWorkout;
exports.getProgressiveSuggestions = getProgressiveSuggestions;
exports.getMuscleStates = getMuscleStates;
exports.updateMuscleStates = updateMuscleStates;
exports.getDetailedMuscleStates = getDetailedMuscleStates;
exports.calculateVisualizationFatigue = calculateVisualizationFatigue;
exports.getPersonalBests = getPersonalBests;
exports.updatePersonalBests = updatePersonalBests;
exports.getMuscleBaselines = getMuscleBaselines;
exports.updateMuscleBaselines = updateMuscleBaselines;
exports.getWorkoutTemplates = getWorkoutTemplates;
exports.getWorkoutTemplateById = getWorkoutTemplateById;
exports.createWorkoutTemplate = createWorkoutTemplate;
exports.updateWorkoutTemplate = updateWorkoutTemplate;
exports.deleteWorkoutTemplate = deleteWorkoutTemplate;
exports.getUserCalibrations = getUserCalibrations;
exports.getExerciseCalibrations = getExerciseCalibrations;
exports.saveExerciseCalibrations = saveExerciseCalibrations;
exports.deleteExerciseCalibrations = deleteExerciseCalibrations;
exports.getExerciseHistory = getExerciseHistory;
exports.getRotationState = getRotationState;
exports.getNextWorkout = getNextWorkout;
exports.advanceRotation = advanceRotation;
exports.rebuildMuscleBaselines = rebuildMuscleBaselines;
exports.rebuildPersonalBests = rebuildPersonalBests;
exports.resetMuscleStatesForDate = resetMuscleStatesForDate;
exports.validateDataIntegrity = validateDataIntegrity;
exports.deleteWorkoutWithRecalculation = deleteWorkoutWithRecalculation;
exports.getWorkoutDeletionPreview = getWorkoutDeletionPreview;
exports.getDatabaseSchemaInfo = getDatabaseSchemaInfo;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../constants");
const mappings_1 = require("./mappings");
// Database file location (persisted in data/ folder)
const DB_PATH = process.env.DB_PATH || path_1.default.join(__dirname, '../../data/fitforge.db');
// Ensure data directory exists
const dataDir = path_1.default.dirname(DB_PATH);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
    console.log(`Created data directory: ${dataDir}`);
}
// Initialize database
const db = new better_sqlite3_1.default(DB_PATH);
exports.db = db;
db.pragma('journal_mode = DELETE'); // DELETE mode for Docker compatibility (WAL doesn't work on Windows volume mounts)
console.log(`Database initialized at: ${DB_PATH}`);
// Run schema to create tables
const schemaPath = path_1.default.join(__dirname, 'schema.sql');
const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
db.exec(schema);
console.log('Database schema initialized');
// Ensure default user exists (defensive initialization for fresh installs)
ensureDefaultUser();
// Run migrations
const migrationsDir = path_1.default.join(__dirname, 'migrations');
if (fs_1.default.existsSync(migrationsDir)) {
    const migrationFiles = fs_1.default.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql') && !file.includes('rollback'))
        .sort();
    for (const file of migrationFiles) {
        const migrationPath = path_1.default.join(migrationsDir, file);
        const migration = fs_1.default.readFileSync(migrationPath, 'utf8');
        // Verify muscle_states schema BEFORE migration
        if (file.includes('002') || file.includes('011')) {
            const beforeSchema = db.prepare('PRAGMA table_info(muscle_states)').all();
            console.log(`BEFORE ${file}: muscle_states has ${beforeSchema.length} columns`);
        }
        try {
            db.exec(migration);
            console.log(`Migration applied: ${file}`);
            // Verify muscle_states schema AFTER migration
            if (file.includes('002') || file.includes('011')) {
                const afterSchema = db.prepare('PRAGMA table_info(muscle_states)').all();
                console.log(`AFTER ${file}: muscle_states has ${afterSchema.length} columns`);
                const hasVolumeToday = afterSchema.some((col) => col.name === 'volume_today');
                console.log(`volume_today present: ${hasVolumeToday}`);
            }
        }
        catch (error) {
            // Ignore errors for migrations that have already been applied
            if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
                console.error(`Error applying migration ${file}:`, error);
            }
        }
    }
}
// ============================================
// CUSTOM ERROR TYPES
// ============================================
class UserNotFoundError extends Error {
    constructor(message = 'User not found') {
        super(message);
        this.name = 'UserNotFoundError';
        this.code = 'USER_NOT_FOUND';
    }
}
// ============================================
// HELPER FUNCTIONS FOR DATABASE OPERATIONS
// ============================================
/**
 * Get user profile
 */
function getProfile() {
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (!user) {
        throw new UserNotFoundError();
    }
    const bodyweightHistory = db.prepare(`
    SELECT date, weight
    FROM bodyweight_history
    WHERE user_id = 1
    ORDER BY date DESC
  `).all();
    const equipment = db.prepare(`
    SELECT name, min_weight as minWeight, max_weight as maxWeight, weight_increment as increment
    FROM equipment
    WHERE user_id = 1
  `).all();
    return {
        name: user.name,
        experience: user.experience,
        bodyweightHistory,
        equipment,
        recovery_days_to_full: user.recovery_days_to_full || 5
    };
}
/**
 * Update user profile
 */
function updateProfile(profile) {
    // Build dynamic SQL based on provided fields
    const updates = [];
    const params = [];
    if (profile.name !== undefined) {
        updates.push('name = ?');
        params.push(profile.name);
    }
    if (profile.experience !== undefined) {
        updates.push('experience = ?');
        params.push(profile.experience);
    }
    if (profile.recovery_days_to_full !== undefined) {
        updates.push('recovery_days_to_full = ?');
        params.push(profile.recovery_days_to_full);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    if (updates.length > 1) { // More than just updated_at
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = 1`;
        db.prepare(sql).run(...params);
    }
    // Clear and re-insert bodyweight history
    db.prepare('DELETE FROM bodyweight_history WHERE user_id = 1').run();
    if (profile.bodyweightHistory && profile.bodyweightHistory.length > 0) {
        const insertBodyweight = db.prepare('INSERT INTO bodyweight_history (user_id, date, weight) VALUES (1, ?, ?)');
        const insertMany = db.transaction((items) => {
            for (const item of items) {
                insertBodyweight.run(item.date, item.weight);
            }
        });
        insertMany(profile.bodyweightHistory);
    }
    // Clear and re-insert equipment
    db.prepare('DELETE FROM equipment WHERE user_id = 1').run();
    if (profile.equipment && profile.equipment.length > 0) {
        const insertEquipment = db.prepare('INSERT INTO equipment (user_id, name, min_weight, max_weight, weight_increment) VALUES (1, ?, ?, ?, ?)');
        const insertMany = db.transaction((items) => {
            for (const item of items) {
                insertEquipment.run(item.name, item.minWeight, item.maxWeight, item.increment);
            }
        });
        insertMany(profile.equipment);
    }
    return getProfile();
}
/**
 * Initialize user profile for first-time users
 */
function initializeProfile(request) {
    // Check if user already exists (idempotent behavior)
    const existingUser = db.prepare('SELECT * FROM users WHERE id = 1').get();
    if (existingUser) {
        return getProfile();
    }
    // Scale baselines based on experience level
    const baselinesByExperience = {
        'Beginner': 5000,
        'Intermediate': 10000,
        'Advanced': 15000
    };
    const baseline = baselinesByExperience[request.experience];
    // All 13 muscles from Muscle enum
    const muscles = [
        'Pectoralis', 'Triceps', 'Deltoids', 'Lats', 'Biceps',
        'Rhomboids', 'Trapezius', 'Forearms', 'Quadriceps',
        'Glutes', 'Hamstrings', 'Calves', 'Core'
    ];
    // Transaction to ensure atomicity
    const initTransaction = db.transaction(() => {
        // Insert user
        db.prepare('INSERT INTO users (id, name, experience) VALUES (1, ?, ?)').run(request.name, request.experience);
        // Initialize muscle baselines
        const insertBaseline = db.prepare('INSERT INTO muscle_baselines (user_id, muscle_name, system_learned_max) VALUES (1, ?, ?)');
        for (const muscle of muscles) {
            insertBaseline.run(muscle, baseline);
        }
        // Initialize muscle states
        const insertState = db.prepare('INSERT INTO muscle_states (user_id, muscle_name, initial_fatigue_percent, volume_today, last_trained) VALUES (1, ?, 0, 0, NULL)');
        for (const muscle of muscles) {
            insertState.run(muscle);
        }
        // Insert equipment if provided
        if (request.equipment && request.equipment.length > 0) {
            const insertEquipment = db.prepare('INSERT INTO equipment (user_id, name, min_weight, max_weight, weight_increment) VALUES (1, ?, ?, ?, ?)');
            for (const item of request.equipment) {
                insertEquipment.run(item.name, item.minWeight, item.maxWeight, item.increment);
            }
        }
    });
    // Execute transaction
    initTransaction();
    // Initialize detailed muscle states (Phase 1 of dual-layer muscle tracking)
    initializeDetailedMuscleStates(1, baseline);
    // Seed default workout templates (Push/Pull/Legs/Core A+B variations)
    seedDefaultTemplates();
    return getProfile();
}
/**
 * Initialize detailed muscle states for dual-layer muscle tracking
 * Creates 42 detailed muscle records inheriting baselines from visualization muscles
 *
 * Called during profile initialization and can be used for migration of existing users
 */
function initializeDetailedMuscleStates(userId, baselineValue) {
    // Get all visualization muscles
    const muscles = [
        'Pectoralis', 'Triceps', 'Deltoids', 'Lats', 'Biceps',
        'Rhomboids', 'Trapezius', 'Forearms', 'Quadriceps',
        'Glutes', 'Hamstrings', 'Calves', 'Core'
    ];
    const insertDetailedState = db.prepare(`
    INSERT INTO detailed_muscle_states (
      user_id,
      detailed_muscle_name,
      visualization_muscle_name,
      role,
      fatigue_percent,
      volume_today,
      last_trained,
      baseline_capacity,
      baseline_source,
      baseline_confidence
    ) VALUES (?, ?, ?, ?, 0, 0, NULL, ?, 'inherited', 'low')
  `);
    // For each visualization muscle, create detailed muscle records
    for (const vizMuscleName of muscles) {
        const vizMuscle = vizMuscleName;
        const detailedMuscles = (0, mappings_1.getDetailedMuscles)(vizMuscle);
        for (const detailedMuscle of detailedMuscles) {
            const role = (0, mappings_1.determineDefaultRole)(detailedMuscle);
            const detailedMuscleName = detailedMuscle;
            // Check if detailed muscle state already exists (for idempotency)
            const existing = db.prepare('SELECT id FROM detailed_muscle_states WHERE user_id = ? AND detailed_muscle_name = ?').get(userId, detailedMuscleName);
            if (!existing) {
                insertDetailedState.run(userId, detailedMuscleName, vizMuscleName, role, baselineValue);
            }
        }
    }
    console.log(`Initialized detailed muscle states for user ${userId} (42 detailed muscles)`);
}
/**
 * Get all workouts
 */
function getWorkouts() {
    const workouts = db.prepare(`
    SELECT * FROM workouts
    WHERE user_id = 1
    ORDER BY date DESC
  `).all();
    // For each workout, get its exercise sets
    const results = [];
    for (const workout of workouts) {
        const sets = db.prepare(`
      SELECT exercise_name as exercise, weight, reps, set_number
      FROM exercise_sets
      WHERE workout_id = ?
      ORDER BY set_number
    `).all(workout.id);
        // Group sets by exercise
        const exercisesMap = {};
        for (const set of sets) {
            if (!exercisesMap[set.exercise]) {
                exercisesMap[set.exercise] = { exercise: set.exercise, sets: [] };
            }
            const exercise = exercisesMap[set.exercise];
            if (exercise) {
                exercise.sets.push({ weight: set.weight, reps: set.reps });
            }
        }
        results.push({
            id: workout.id,
            date: workout.date,
            category: workout.category,
            variation: workout.variation,
            progression_method: workout.progression_method,
            duration_seconds: workout.duration_seconds,
            exercises: Object.values(exercisesMap),
            created_at: workout.created_at
        });
    }
    return results;
}
/**
 * Save a new workout
 */
function saveWorkout(workout) {
    const insertWorkout = db.prepare(`
    INSERT INTO workouts (user_id, date, category, variation, progression_method, duration_seconds)
    VALUES (1, ?, ?, ?, ?, ?)
  `);
    const insertSet = db.prepare(`
    INSERT INTO exercise_sets (workout_id, exercise_name, weight, reps, set_number, to_failure)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    const saveTransaction = db.transaction(() => {
        // Convert date to ISO string if it's a timestamp number
        let dateValue = workout.date;
        if (typeof workout.date === 'number') {
            dateValue = new Date(workout.date).toISOString();
        }
        // Insert workout
        const result = insertWorkout.run(dateValue, workout.category || null, workout.variation || null, workout.progressionMethod || null, workout.durationSeconds || null);
        const workoutId = result.lastInsertRowid;
        // Insert exercise sets
        let globalSetNumber = 1;
        for (const exercise of workout.exercises) {
            for (const set of exercise.sets) {
                insertSet.run(workoutId, exercise.exercise, set.weight, set.reps, globalSetNumber, set.to_failure ? 1 : 0 // Convert boolean to SQLite integer: 1 for true (to failure), 0 for false (non-failure)
                );
                globalSetNumber++;
            }
        }
        // NOTE: Baseline learning is handled by frontend (App.tsx:73-88).
        // Backend previously had duplicate baseline learning that was removed to fix race condition.
        // See: openspec/changes/fix-critical-data-bugs/specs/baseline-race-condition-fix/spec.md
        // Detect personal records (NOW INSIDE TRANSACTION)
        const prs = detectPRsForWorkout(workoutId);
        return { workoutId, prs };
    });
    const { workoutId } = saveTransaction();
    // Return the saved workout
    const savedWorkout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
    const sets = db.prepare(`
    SELECT exercise_name as exercise, weight, reps, set_number
    FROM exercise_sets
    WHERE workout_id = ?
    ORDER BY set_number
  `).all(workoutId);
    const exercisesMap = {};
    for (const set of sets) {
        if (!exercisesMap[set.exercise]) {
            exercisesMap[set.exercise] = { exercise: set.exercise, sets: [] };
        }
        const exercise = exercisesMap[set.exercise];
        if (exercise) {
            exercise.sets.push({ weight: set.weight, reps: set.reps });
        }
    }
    return {
        id: savedWorkout.id,
        date: savedWorkout.date,
        category: savedWorkout.category,
        variation: savedWorkout.variation,
        progression_method: savedWorkout.progression_method,
        duration_seconds: savedWorkout.duration_seconds,
        exercises: Object.values(exercisesMap),
        created_at: savedWorkout.created_at
    };
}
/**
 * Rebuild all muscle baselines from scratch based on all failure sets in history
 *
 * This function recalculates muscle baselines by:
 * 1. Querying ALL workouts from history
 * 2. Calculating SESSION VOLUME per muscle for each workout
 * 3. Tracking the highest session volume observed per muscle
 * 4. Updating baselines to match actual observed performance
 *
 * IMPORTANT: Baselines represent the maximum volume a muscle can handle in a SINGLE SESSION,
 * not the maximum single-set volume. This is critical for accurate fatigue forecasting.
 *
 * Use this when:
 * - Deleting workouts (to ensure baselines reflect remaining data)
 * - Verifying data integrity
 * - Resetting baselines after data corruption
 *
 * @returns Array of baseline updates showing old vs new values
 */
function rebuildMuscleBaselines() {
    const rebuildTransaction = db.transaction(() => {
        // 1. Query all unique workout IDs that have failure sets
        const workouts = db.prepare(`
      SELECT DISTINCT workout_id
      FROM exercise_sets
      WHERE to_failure = 1
    `).all();
        // 2. Calculate session volume per muscle for each workout
        const muscleMaxSessionVolumes = {};
        for (const { workout_id } of workouts) {
            // Get all failure sets from this workout
            const sets = db.prepare(`
        SELECT exercise_name, weight, reps
        FROM exercise_sets
        WHERE workout_id = ? AND to_failure = 1
      `).all(workout_id);
            // Calculate volume per muscle for THIS SESSION (sum all sets)
            const sessionMuscleVolumes = {};
            for (const set of sets) {
                const exercise = constants_1.EXERCISE_LIBRARY.find(ex => ex.name === set.exercise_name);
                if (!exercise) {
                    console.warn(`Exercise not found in library: ${set.exercise_name}`);
                    continue;
                }
                const totalVolume = set.weight * set.reps;
                const calibrations = getExerciseCalibrations(exercise.id);
                for (const engagement of calibrations.engagements) {
                    const muscleVolume = totalVolume * (engagement.percentage / 100);
                    const muscleName = engagement.muscle;
                    // SUM volume for this muscle in this session
                    sessionMuscleVolumes[muscleName] =
                        (sessionMuscleVolumes[muscleName] || 0) + muscleVolume;
                }
            }
            // Track the highest SESSION volume across all workouts
            for (const [muscleName, sessionVolume] of Object.entries(sessionMuscleVolumes)) {
                if (!muscleMaxSessionVolumes[muscleName] ||
                    sessionVolume > muscleMaxSessionVolumes[muscleName]) {
                    muscleMaxSessionVolumes[muscleName] = sessionVolume;
                }
            }
        }
        // 3. Update all baselines to match observed session maximums
        const updates = [];
        for (const [muscleName, newMax] of Object.entries(muscleMaxSessionVolumes)) {
            const current = db.prepare(`
        SELECT system_learned_max FROM muscle_baselines
        WHERE user_id = 1 AND muscle_name = ?
      `).get(muscleName);
            if (current && current.system_learned_max !== newMax) {
                db.prepare(`
          UPDATE muscle_baselines
          SET system_learned_max = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = 1 AND muscle_name = ?
        `).run(newMax, muscleName);
                updates.push({
                    muscle: muscleName,
                    oldMax: current.system_learned_max,
                    newMax
                });
            }
        }
        return updates;
    });
    return rebuildTransaction();
}
/**
 * Rebuild all personal bests from scratch based on complete workout history
 *
 * This function recalculates PRs by:
 * 1. Clearing all existing personal_bests records
 * 2. Querying ALL sets from workout history
 * 3. Calculating best single set and best session volume per exercise
 * 4. Inserting fresh PR records
 *
 * Use this when:
 * - Deleting workouts (to ensure PRs reflect remaining data)
 * - Verifying data integrity
 * - Recovering from corrupted PR data
 *
 * @returns Array of PR updates for all exercises with PRs
 */
function rebuildPersonalBests() {
    const rebuildTransaction = db.transaction(() => {
        // 1. Save current PRs for comparison
        const oldPRs = db.prepare(`
      SELECT exercise_name, best_single_set, best_session_volume
      FROM personal_bests
      WHERE user_id = 1
    `).all();
        const oldPRMap = {};
        for (const pr of oldPRs) {
            oldPRMap[pr.exercise_name] = {
                bestSingleSet: pr.best_single_set,
                bestSessionVolume: pr.best_session_volume
            };
        }
        // 2. Clear existing PRs
        db.prepare('DELETE FROM personal_bests WHERE user_id = 1').run();
        // 3. Query all sets grouped by workout and exercise
        const allSets = db.prepare(`
      SELECT es.exercise_name, es.weight, es.reps, w.id as workout_id, w.date
      FROM exercise_sets es
      JOIN workouts w ON es.workout_id = w.id
      WHERE w.user_id = 1
      ORDER BY w.date ASC, es.exercise_name, es.set_number
    `).all();
        // 4. Calculate PRs per exercise
        const exercisePRs = {};
        for (const set of allSets) {
            const volume = set.weight * set.reps;
            if (!exercisePRs[set.exercise_name]) {
                exercisePRs[set.exercise_name] = {
                    bestSingle: 0,
                    bestSession: 0,
                    workoutSessions: {}
                };
            }
            const exercise = exercisePRs[set.exercise_name];
            // Track best single set
            if (volume > exercise.bestSingle) {
                exercise.bestSingle = volume;
            }
            // Track session volume (sum of all sets in each workout)
            if (!exercise.workoutSessions[set.workout_id]) {
                exercise.workoutSessions[set.workout_id] = 0;
            }
            exercise.workoutSessions[set.workout_id] += volume;
        }
        // Find best session volume across all workouts
        for (const data of Object.values(exercisePRs)) {
            const sessionVolumes = Object.values(data.workoutSessions);
            if (sessionVolumes.length > 0) {
                data.bestSession = Math.max(...sessionVolumes);
            }
        }
        // 5. Insert new PRs
        const updates = [];
        for (const [exerciseName, prs] of Object.entries(exercisePRs)) {
            db.prepare(`
        INSERT INTO personal_bests (user_id, exercise_name, best_single_set, best_session_volume, updated_at)
        VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(exerciseName, prs.bestSingle, prs.bestSession);
            const oldPR = oldPRMap[exerciseName];
            updates.push({
                exercise: exerciseName,
                oldBestSingleSet: oldPR?.bestSingleSet ?? null,
                newBestSingleSet: prs.bestSingle,
                oldBestSessionVolume: oldPR?.bestSessionVolume ?? null,
                newBestSessionVolume: prs.bestSession
            });
        }
        return updates;
    });
    return rebuildTransaction();
}
/**
 * Reset muscle states for a given date after workout deletion
 *
 * When a workout is deleted, muscle states that had last_trained set to that date
 * need to be recalculated to reflect the previous workout date for those muscles.
 *
 * This function:
 * 1. Finds all muscles with last_trained = deleted date
 * 2. Finds the previous workout date for each muscle
 * 3. Updates last_trained and recalculates fatigue based on previous date
 *
 * @param date - ISO date string of the deleted workout
 * @returns Array of muscle state updates showing old vs new values
 */
function resetMuscleStatesForDate(date) {
    const resetTransaction = db.transaction(() => {
        const updates = [];
        // Find all muscles that were last trained on this date
        const affectedMuscles = db.prepare(`
      SELECT muscle_name, initial_fatigue_percent, last_trained
      FROM muscle_states
      WHERE user_id = 1 AND last_trained = ?
    `).all(date);
        for (const muscle of affectedMuscles) {
            // Find previous workout date for this muscle by looking at remaining workouts
            // We need to find exercises that train this muscle
            const previousWorkout = db.prepare(`
        SELECT MAX(w.date) as prev_date
        FROM workouts w
        JOIN exercise_sets es ON w.id = es.workout_id
        WHERE w.user_id = 1 AND w.date < ?
      `).get(date);
            const newLastTrained = previousWorkout?.prev_date || null;
            // If there's a previous workout, we keep some fatigue; otherwise reset to 0
            // Note: In real usage, getMuscleStates() calculates current fatigue based on time decay
            // Here we're just resetting the initial_fatigue_percent to 0 since we can't easily
            // recalculate historical fatigue without the full workout context
            const newFatigue = 0;
            db.prepare(`
        UPDATE muscle_states
        SET last_trained = ?, initial_fatigue_percent = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = 1 AND muscle_name = ?
      `).run(newLastTrained, newFatigue, muscle.muscle_name);
            updates.push({
                muscle: muscle.muscle_name,
                oldLastTrained: muscle.last_trained,
                newLastTrained,
                oldFatigue: muscle.initial_fatigue_percent,
                newFatigue
            });
        }
        return updates;
    });
    return resetTransaction();
}
/**
 * Validate data integrity across all tables
 *
 * Checks for:
 * - Baseline mismatches (current baselines vs max observed volumes)
 * - PR mismatches (current PRs vs actual best performances)
 * - Orphaned muscle states (muscles with last_trained but no workouts)
 * - Invalid constraint violations (if constraints were bypassed)
 *
 * @returns Object with validation result and list of issues found
 */
function validateDataIntegrity() {
    const issues = [];
    // Check 1: Baseline mismatches
    // Calculate expected baselines and compare to current
    const failureSets = db.prepare(`
    SELECT es.exercise_name, es.weight, es.reps
    FROM exercise_sets es
    WHERE es.to_failure = 1
  `).all();
    const expectedBaselines = {};
    for (const set of failureSets) {
        const exercise = constants_1.EXERCISE_LIBRARY.find(ex => ex.name === set.exercise_name);
        if (!exercise)
            continue;
        const totalVolume = set.weight * set.reps;
        const calibrations = getExerciseCalibrations(exercise.id);
        for (const engagement of calibrations.engagements) {
            const muscleVolume = totalVolume * (engagement.percentage / 100);
            const muscleName = engagement.muscle;
            if (!expectedBaselines[muscleName] || muscleVolume > expectedBaselines[muscleName]) {
                expectedBaselines[muscleName] = muscleVolume;
            }
        }
    }
    // Compare to actual baselines
    const actualBaselines = db.prepare(`
    SELECT muscle_name, system_learned_max
    FROM muscle_baselines
    WHERE user_id = 1
  `).all();
    for (const actual of actualBaselines) {
        const expected = expectedBaselines[actual.muscle_name];
        if (expected && Math.abs(expected - actual.system_learned_max) > 0.01) {
            issues.push({
                type: 'baseline_mismatch',
                severity: 'error',
                description: `Baseline mismatch for ${actual.muscle_name}`,
                details: {
                    muscle: actual.muscle_name,
                    currentBaseline: actual.system_learned_max,
                    expectedBaseline: expected,
                    difference: expected - actual.system_learned_max
                }
            });
        }
    }
    // Check 2: PR mismatches
    // Calculate expected PRs and compare to current
    const allSets = db.prepare(`
    SELECT es.exercise_name, es.weight, es.reps, w.id as workout_id
    FROM exercise_sets es
    JOIN workouts w ON es.workout_id = w.id
    WHERE w.user_id = 1
  `).all();
    const expectedPRs = {};
    const workoutSessions = {};
    for (const set of allSets) {
        const volume = set.weight * set.reps;
        if (!expectedPRs[set.exercise_name]) {
            expectedPRs[set.exercise_name] = { bestSingle: 0, bestSession: 0 };
            workoutSessions[set.exercise_name] = {};
        }
        if (volume > expectedPRs[set.exercise_name].bestSingle) {
            expectedPRs[set.exercise_name].bestSingle = volume;
        }
        if (!workoutSessions[set.exercise_name][set.workout_id]) {
            workoutSessions[set.exercise_name][set.workout_id] = 0;
        }
        workoutSessions[set.exercise_name][set.workout_id] += volume;
    }
    for (const [exerciseName, sessions] of Object.entries(workoutSessions)) {
        const sessionVolumes = Object.values(sessions);
        if (sessionVolumes.length > 0) {
            expectedPRs[exerciseName].bestSession = Math.max(...sessionVolumes);
        }
    }
    // Compare to actual PRs
    const actualPRs = db.prepare(`
    SELECT exercise_name, best_single_set, best_session_volume
    FROM personal_bests
    WHERE user_id = 1
  `).all();
    for (const actual of actualPRs) {
        const expected = expectedPRs[actual.exercise_name];
        if (expected) {
            if (Math.abs(expected.bestSingle - actual.best_single_set) > 0.01) {
                issues.push({
                    type: 'pr_mismatch',
                    severity: 'error',
                    description: `PR mismatch for ${actual.exercise_name} (single set)`,
                    details: {
                        exercise: actual.exercise_name,
                        currentPR: actual.best_single_set,
                        expectedPR: expected.bestSingle,
                        difference: expected.bestSingle - actual.best_single_set
                    }
                });
            }
            if (Math.abs(expected.bestSession - actual.best_session_volume) > 0.01) {
                issues.push({
                    type: 'pr_mismatch',
                    severity: 'error',
                    description: `PR mismatch for ${actual.exercise_name} (session volume)`,
                    details: {
                        exercise: actual.exercise_name,
                        currentSessionPR: actual.best_session_volume,
                        expectedSessionPR: expected.bestSession,
                        difference: expected.bestSession - actual.best_session_volume
                    }
                });
            }
        }
    }
    // Check 3: Orphaned muscle states
    const muscleStates = db.prepare(`
    SELECT muscle_name, last_trained
    FROM muscle_states
    WHERE user_id = 1 AND last_trained IS NOT NULL
  `).all();
    for (const state of muscleStates) {
        // Check if there are any workouts on this date
        const workoutExists = db.prepare(`
      SELECT COUNT(*) as count
      FROM workouts
      WHERE user_id = 1 AND date = ?
    `).get(state.last_trained);
        if (workoutExists.count === 0) {
            issues.push({
                type: 'orphaned_muscle_state',
                severity: 'warning',
                description: `Orphaned muscle state for ${state.muscle_name}`,
                details: {
                    muscle: state.muscle_name,
                    lastTrained: state.last_trained,
                    message: 'No workout found for this last_trained date'
                }
            });
        }
    }
    return {
        valid: issues.length === 0,
        issues
    };
}
/**
 * Delete a workout and recalculate all dependent state
 *
 * This function:
 * 1. Deletes the workout (CASCADE deletes exercise_sets)
 * 2. Rebuilds muscle baselines from remaining workouts
 * 3. Rebuilds personal bests from remaining workouts
 * 4. Resets muscle states for the deleted workout date
 * 5. Returns summary of all changes
 *
 * All operations are wrapped in a transaction for atomicity.
 *
 * @param workoutId - ID of the workout to delete
 * @returns Deletion result with affected data summary
 * @throws Error if workout not found
 */
function deleteWorkoutWithRecalculation(workoutId) {
    const deleteTransaction = db.transaction(() => {
        // 1. Get workout details before deletion
        const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
        if (!workout) {
            throw new Error('NOT_FOUND');
        }
        // 2. Count sets that will be deleted
        const setCountResult = db.prepare('SELECT COUNT(*) as count FROM exercise_sets WHERE workout_id = ?')
            .get(workoutId);
        const setCount = setCountResult.count;
        // 3. Delete workout (CASCADE deletes exercise_sets)
        db.prepare('DELETE FROM workouts WHERE id = ?').run(workoutId);
        // 4. Recalculate all state
        const baselineUpdates = rebuildMuscleBaselines();
        const prUpdates = rebuildPersonalBests();
        const muscleUpdates = resetMuscleStatesForDate(workout.date);
        // 5. Log deletion for audit trail
        console.log(`[${new Date().toISOString()}] WORKOUT_DELETED:`, {
            workoutId,
            date: workout.date,
            category: workout.category,
            variation: workout.variation,
            deletedSets: setCount,
            baselinesAffected: baselineUpdates.length,
            prsAffected: prUpdates.length,
            musclesAffected: muscleUpdates.length
        });
        return {
            success: true,
            workoutId,
            deletedSets: setCount,
            affectedBaselines: baselineUpdates,
            affectedPRs: prUpdates,
            affectedMuscles: muscleUpdates.map(u => u.muscle)
        };
    });
    return deleteTransaction();
}
/**
 * Get a preview of what would be affected by deleting a workout
 *
 * This function checks if the workout contains any personal records or
 * important data before deletion, allowing users to make informed decisions.
 *
 * @param workoutId - ID of the workout to preview
 * @returns Preview information about the workout and what would be affected
 * @throws Error if workout not found
 */
function getWorkoutDeletionPreview(workoutId) {
    const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
    if (!workout) {
        throw new Error('NOT_FOUND');
    }
    // Get all sets for this workout
    const sets = db.prepare('SELECT * FROM exercise_sets WHERE workout_id = ?').all(workoutId);
    // Check which sets are current PRs
    const prs = [];
    for (const set of sets) {
        const volume = set.weight * set.reps;
        const currentPR = db.prepare(`
      SELECT best_single_set FROM personal_bests
      WHERE user_id = 1 AND exercise_name = ?
    `).get(set.exercise_name);
        if (currentPR && volume === currentPR.best_single_set) {
            prs.push({
                exercise: set.exercise_name,
                value: volume
            });
        }
    }
    const containsPRs = prs.length > 0;
    const warning = containsPRs
        ? `This workout contains ${prs.length} personal record${prs.length > 1 ? 's' : ''}. Deleting it will recalculate your PRs from remaining workouts.`
        : null;
    return {
        workoutId,
        workoutDate: workout.date,
        workoutCategory: workout.category,
        workoutVariation: workout.variation,
        setsCount: sets.length,
        containsPRs,
        prs,
        warning
    };
}
/**
 * Detect personal records (PRs) for all exercises in a workout
 *
 * Compares each exercise's performance to historical personal bests:
 * - Best single set (weight × reps)
 * - Best session volume (sum of all sets)
 *
 * @param workoutId - ID of the workout to analyze
 * @returns Array of PR info for each exercise with improvements
 */
function detectPRsForWorkout(workoutId) {
    // Get all exercises and their sets from this workout
    const exerciseSets = db.prepare(`
    SELECT exercise_name, weight, reps
    FROM exercise_sets
    WHERE workout_id = ?
    ORDER BY exercise_name, set_number
  `).all(workoutId);
    if (exerciseSets.length === 0) {
        return [];
    }
    // Group sets by exercise
    const exerciseGroups = {};
    for (const set of exerciseSets) {
        if (!exerciseGroups[set.exercise_name]) {
            exerciseGroups[set.exercise_name] = [];
        }
        exerciseGroups[set.exercise_name].push({ weight: set.weight, reps: set.reps });
    }
    // Get current personal bests
    const currentPBs = getPersonalBests();
    const prs = [];
    // Check each exercise for PRs
    for (const [exerciseName, sets] of Object.entries(exerciseGroups)) {
        // Calculate best single set and session volume for this workout
        const volumes = sets.map(s => s.weight * s.reps);
        const newBestSingleSet = Math.max(...volumes);
        const newSessionVolume = volumes.reduce((sum, v) => sum + v, 0);
        // Get previous personal bests for this exercise
        const previousPB = currentPBs[exerciseName];
        const previousBestSingleSet = previousPB?.bestSingleSet ?? 0;
        const previousSessionVolume = previousPB?.bestSessionVolume ?? 0;
        const isFirstTime = !previousPB;
        let isPR = false;
        let improvement = 0;
        let percentIncrease = 0;
        // Check for PR (single set or session volume)
        if (isFirstTime) {
            isPR = true;
            improvement = newBestSingleSet;
            percentIncrease = 100;
        }
        else if (newBestSingleSet > previousBestSingleSet || newSessionVolume > previousSessionVolume) {
            isPR = true;
            // Use best single set as primary metric for improvement
            improvement = newBestSingleSet - previousBestSingleSet;
            percentIncrease = previousBestSingleSet > 0
                ? ((newBestSingleSet - previousBestSingleSet) / previousBestSingleSet) * 100
                : 100;
        }
        // Update personal bests in database if PR detected
        if (isPR) {
            const updatePB = db.prepare(`
        INSERT INTO personal_bests (user_id, exercise_name, best_single_set, best_session_volume, updated_at)
        VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, exercise_name) DO UPDATE SET
          best_single_set = MAX(best_single_set, excluded.best_single_set),
          best_session_volume = MAX(best_session_volume, excluded.best_session_volume),
          updated_at = CURRENT_TIMESTAMP
      `);
            updatePB.run(exerciseName, newBestSingleSet, newSessionVolume);
        }
        // Add to results if PR or first time
        if (isPR || isFirstTime) {
            prs.push({
                isPR,
                exercise: exerciseName,
                newVolume: newBestSingleSet,
                previousVolume: previousBestSingleSet,
                improvement,
                percentIncrease: Math.round(percentIncrease * 10) / 10, // Round to 1 decimal
                isFirstTime
            });
        }
    }
    return prs;
}
/**
 * Get last performance for a specific exercise
 *
 * Retrieves the most recent workout containing the specified exercise
 * and returns the first set's data (weight, reps, date) as the baseline.
 *
 * @param exerciseName - Name of the exercise to query
 * @returns Last performance data or null if no history exists
 */
function getLastPerformanceForExercise(exerciseName) {
    const result = db.prepare(`
    SELECT w.id as workout_id, w.date, es.weight, es.reps
    FROM workouts w
    JOIN exercise_sets es ON w.id = es.workout_id
    WHERE w.user_id = 1 AND es.exercise_name = ?
    ORDER BY w.date DESC, es.set_number ASC
    LIMIT 1
  `).get(exerciseName);
    if (!result) {
        return null;
    }
    return {
        weight: result.weight,
        reps: result.reps,
        date: result.date,
        workoutId: result.workout_id
    };
}
/**
 * Get previous performance for a specific exercise (second-to-last workout)
 *
 * Used to detect which progression method was used last time.
 *
 * @param exerciseName - Name of the exercise to query
 * @returns Previous performance data or null if insufficient history
 */
function getPreviousPerformanceForExercise(exerciseName) {
    const result = db.prepare(`
    SELECT w.date, es.weight, es.reps
    FROM workouts w
    JOIN exercise_sets es ON w.id = es.workout_id
    WHERE w.user_id = 1 AND es.exercise_name = ?
    ORDER BY w.date DESC, es.set_number ASC
    LIMIT 1 OFFSET 1
  `).get(exerciseName);
    if (!result) {
        return null;
    }
    return {
        weight: result.weight,
        reps: result.reps,
        date: result.date
    };
}
/**
 * Get progressive overload suggestions for an exercise
 *
 * Calculates both +3% weight and +3% reps options from last performance,
 * detects which method was used last time, and recommends alternating.
 *
 * @param exerciseName - Name of the exercise
 * @returns Progressive suggestion object or null if no history
 */
function getProgressiveSuggestions(exerciseName) {
    // Get last two performances
    const lastPerf = getLastPerformanceForExercise(exerciseName);
    const previousPerf = getPreviousPerformanceForExercise(exerciseName);
    if (!lastPerf) {
        return null; // No history, user must establish baseline
    }
    // Calculate days since last performance
    const lastDate = new Date(lastPerf.date).getTime();
    const now = Date.now();
    const daysAgo = Math.round((now - lastDate) / (1000 * 60 * 60 * 24));
    // Detect last method used (weight/reps/none)
    let lastMethod = 'none';
    if (previousPerf) {
        const weightIncreased = lastPerf.weight > previousPerf.weight;
        const repsIncreased = lastPerf.reps > previousPerf.reps;
        const weightDecreased = lastPerf.weight < previousPerf.weight;
        const repsDecreased = lastPerf.reps < previousPerf.reps;
        // Clear weight progression: weight up, reps same
        if (weightIncreased && !repsIncreased && !repsDecreased) {
            lastMethod = 'weight';
        }
        // Clear reps progression: reps up, weight same
        else if (repsIncreased && !weightIncreased && !weightDecreased) {
            lastMethod = 'reps';
        }
        // Otherwise: both changed, neither changed, or regression → "none"
    }
    // Calculate +3% weight option (round to nearest integer)
    const weightOption = {
        weight: Math.round(lastPerf.weight * 1.03),
        reps: lastPerf.reps,
        method: 'weight'
    };
    // Calculate +3% reps option (round up)
    const repsOption = {
        weight: lastPerf.weight,
        reps: Math.ceil(lastPerf.reps * 1.03),
        method: 'reps'
    };
    // Determine recommended method (alternate from last)
    const suggested = lastMethod === 'weight' ? 'reps' :
        lastMethod === 'reps' ? 'weight' :
            'reps'; // Default to reps if unclear (safer for joints)
    return {
        lastPerformance: {
            weight: lastPerf.weight,
            reps: lastPerf.reps,
            date: lastPerf.date
        },
        lastMethod,
        weightOption,
        repsOption,
        suggested,
        daysAgo
    };
}
/**
 * Calculate visualization muscle fatigue from detailed muscle states
 *
 * Aggregates fatigue from detailed muscles (primary and secondary movers only)
 * Excludes stabilizers to avoid inflating fatigue display
 *
 * @param userId User ID (default: 1)
 * @param vizMuscleName Name of visualization muscle (e.g., "Deltoids")
 * @param recoveryDaysToFull User's recovery days setting
 * @returns Weighted average fatigue percentage
 */
function calculateVisualizationFatigue(userId, vizMuscleName, recoveryDaysToFull) {
    // Query detailed muscle states for this visualization muscle
    const detailedStates = db.prepare(`
    SELECT detailed_muscle_name, role, fatigue_percent, last_trained
    FROM detailed_muscle_states
    WHERE user_id = ? AND visualization_muscle_name = ?
      AND role IN ('primary', 'secondary')
    ORDER BY fatigue_percent DESC
  `).all(userId, vizMuscleName);
    // If no detailed states exist, fall back to visualization muscle state
    if (detailedStates.length === 0) {
        const vizState = db.prepare(`
      SELECT initial_fatigue_percent, last_trained
      FROM muscle_states
      WHERE user_id = ? AND muscle_name = ?
    `).get(userId, vizMuscleName);
        if (!vizState || !vizState.last_trained) {
            return 0;
        }
        // Calculate current fatigue using linear decay
        const now = Date.now();
        const lastTrainedTime = new Date(vizState.last_trained).getTime();
        const daysElapsed = (now - lastTrainedTime) / (1000 * 60 * 60 * 24);
        let currentFatigue = vizState.initial_fatigue_percent * (1 - daysElapsed / recoveryDaysToFull);
        currentFatigue = Math.max(0, Math.min(100, currentFatigue));
        return Math.round(currentFatigue * 10) / 10;
    }
    // Calculate time-decayed fatigue for each detailed muscle
    const now = Date.now();
    const currentFatigues = [];
    for (const state of detailedStates) {
        if (!state.last_trained) {
            currentFatigues.push(0);
            continue;
        }
        const lastTrainedTime = new Date(state.last_trained).getTime();
        const daysElapsed = (now - lastTrainedTime) / (1000 * 60 * 60 * 24);
        // Apply linear decay: currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)
        let currentFatigue = state.fatigue_percent * (1 - daysElapsed / recoveryDaysToFull);
        currentFatigue = Math.max(0, Math.min(100, currentFatigue));
        currentFatigues.push(currentFatigue);
    }
    // Calculate weighted average
    // TODO: In future, could weight by typical engagement percentage
    const totalWeight = currentFatigues.length;
    const weightedSum = currentFatigues.reduce((sum, fatigue) => sum + fatigue, 0);
    const aggregatedFatigue = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return Math.round(aggregatedFatigue * 10) / 10;
}
/**
 * Get muscle states with calculated fields
 *
 * This function implements the backend calculation engine for muscle state.
 * It reads immutable historical facts from the database and calculates current
 * state based on time elapsed and recovery formulas.
 *
 * When detailed muscle states are available, uses aggregation for more accurate display.
 */
function getMuscleStates() {
    // Get user's recovery days setting
    const user = db.prepare('SELECT recovery_days_to_full FROM users WHERE id = 1').get();
    const recoveryDaysToFull = user?.recovery_days_to_full || 5;
    const states = db.prepare(`
    SELECT muscle_name, initial_fatigue_percent, last_trained
    FROM muscle_states
    WHERE user_id = 1
  `).all();
    const now = Date.now();
    const result = {};
    for (const state of states) {
        // Handle never-trained muscles (last_trained is null)
        if (!state.last_trained) {
            result[state.muscle_name] = {
                currentFatiguePercent: 0,
                daysElapsed: null,
                estimatedRecoveryDays: 1, // Base recovery time
                daysUntilRecovered: 0,
                recoveryStatus: 'ready',
                initialFatiguePercent: 0,
                lastTrained: null
            };
            continue;
        }
        // Calculate time elapsed since workout
        const lastTrainedTime = new Date(state.last_trained).getTime();
        const daysElapsed = (now - lastTrainedTime) / (1000 * 60 * 60 * 24);
        // Calculate recovery time using user's configured recovery days
        // Use user's recovery_days_to_full setting instead of hardcoded 7 days
        // Formula: currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)
        const estimatedRecoveryDays = recoveryDaysToFull;
        // Calculate current fatigue using linear decay
        // currentFatigue = initialFatigue * (1 - daysElapsed / recoveryDays)
        let currentFatiguePercent = state.initial_fatigue_percent * (1 - daysElapsed / estimatedRecoveryDays);
        // Apply bounds checking (clamp to 0-100)
        currentFatiguePercent = Math.max(0, Math.min(100, currentFatiguePercent));
        // Round to 1 decimal place for display
        currentFatiguePercent = Math.round(currentFatiguePercent * 10) / 10;
        // Calculate days until fully recovered
        let daysUntilRecovered = Math.max(0, estimatedRecoveryDays - daysElapsed);
        daysUntilRecovered = Math.round(daysUntilRecovered * 10) / 10;
        // Determine recovery status based on thresholds
        // ready: <= 33%, recovering: <= 66%, fatigued: > 66%
        let recoveryStatus;
        if (currentFatiguePercent <= 33) {
            recoveryStatus = 'ready';
        }
        else if (currentFatiguePercent <= 66) {
            recoveryStatus = 'recovering';
        }
        else {
            recoveryStatus = 'fatigued';
        }
        result[state.muscle_name] = {
            currentFatiguePercent,
            daysElapsed: Math.round(daysElapsed * 10) / 10,
            estimatedRecoveryDays: Math.round(estimatedRecoveryDays * 10) / 10,
            daysUntilRecovered,
            recoveryStatus,
            initialFatiguePercent: state.initial_fatigue_percent,
            lastTrained: state.last_trained
        };
    }
    return result;
}
/**
 * Update muscle states
 *
 * Stores immutable historical facts from a workout and returns calculated current state.
 * The response includes all calculated fields from getMuscleStates().
 */
function updateMuscleStates(states) {
    // Validate all inputs before database operation
    for (const [muscleName, state] of Object.entries(states)) {
        if (state.initial_fatigue_percent < 0 || state.initial_fatigue_percent > 100) {
            throw new Error(`Invalid fatigue for ${muscleName}: ${state.initial_fatigue_percent}. Must be 0-100.`);
        }
    }
    const update = db.prepare(`
    UPDATE muscle_states
    SET initial_fatigue_percent = ?, last_trained = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = 1 AND muscle_name = ?
  `);
    const updateTransaction = db.transaction(() => {
        for (const [muscleName, state] of Object.entries(states)) {
            update.run(state.initial_fatigue_percent, state.last_trained, muscleName);
        }
    });
    updateTransaction();
    // Return calculated muscle states with all fields
    return getMuscleStates();
}
/**
 * Get detailed muscle states with current fatigue calculations
 *
 * Returns all 43 detailed muscle states with time-decayed fatigue,
 * grouped by visualization muscle for easy UI consumption.
 */
function getDetailedMuscleStates(userId = 1) {
    // Get user's recovery days setting
    const user = db.prepare('SELECT recovery_days_to_full FROM users WHERE id = ?').get(userId);
    const recoveryDaysToFull = user?.recovery_days_to_full || 5;
    const states = db.prepare(`
    SELECT
      detailed_muscle_name,
      visualization_muscle_name,
      role,
      fatigue_percent,
      volume_today,
      last_trained,
      baseline_capacity,
      baseline_source,
      baseline_confidence
    FROM detailed_muscle_states
    WHERE user_id = ?
    ORDER BY visualization_muscle_name,
      CASE role
        WHEN 'primary' THEN 1
        WHEN 'secondary' THEN 2
        WHEN 'stabilizer' THEN 3
      END,
      detailed_muscle_name
  `).all(userId);
    const now = Date.now();
    const result = {};
    for (const state of states) {
        // Calculate time-decayed fatigue
        let currentFatiguePercent = 0;
        if (state.last_trained) {
            const lastTrainedTime = new Date(state.last_trained).getTime();
            const daysElapsed = (now - lastTrainedTime) / (1000 * 60 * 60 * 24);
            // Apply linear decay
            currentFatiguePercent = state.fatigue_percent * (1 - daysElapsed / recoveryDaysToFull);
            currentFatiguePercent = Math.max(0, Math.min(100, currentFatiguePercent));
            currentFatiguePercent = Math.round(currentFatiguePercent * 10) / 10;
        }
        result[state.detailed_muscle_name] = {
            detailedMuscleName: state.detailed_muscle_name,
            visualizationMuscleName: state.visualization_muscle_name,
            role: state.role,
            currentFatiguePercent,
            volumeToday: state.volume_today,
            lastTrained: state.last_trained,
            baselineCapacity: state.baseline_capacity,
            baselineSource: state.baseline_source,
            baselineConfidence: state.baseline_confidence
        };
    }
    return result;
}
/**
 * Get personal bests
 */
function getPersonalBests() {
    const pbs = db.prepare(`
    SELECT exercise_name, best_single_set, best_session_volume, rolling_average_max
    FROM personal_bests
    WHERE user_id = 1
  `).all();
    const result = {};
    for (const pb of pbs) {
        result[pb.exercise_name] = {
            bestSingleSet: pb.best_single_set,
            bestSessionVolume: pb.best_session_volume,
            rollingAverageMax: pb.rolling_average_max
        };
    }
    return result;
}
/**
 * Update personal bests
 */
function updatePersonalBests(pbs) {
    const upsert = db.prepare(`
    INSERT INTO personal_bests (user_id, exercise_name, best_single_set, best_session_volume, rolling_average_max, updated_at)
    VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, exercise_name) DO UPDATE SET
      best_single_set = excluded.best_single_set,
      best_session_volume = excluded.best_session_volume,
      rolling_average_max = excluded.rolling_average_max,
      updated_at = CURRENT_TIMESTAMP
  `);
    const updateTransaction = db.transaction(() => {
        for (const [exerciseName, pb] of Object.entries(pbs)) {
            upsert.run(exerciseName, pb.bestSingleSet ?? null, pb.bestSessionVolume ?? null, pb.rollingAverageMax ?? null);
        }
    });
    updateTransaction();
    return getPersonalBests();
}
/**
 * Get muscle baselines
 */
function getMuscleBaselines() {
    const baselines = db.prepare(`
    SELECT muscle_name, system_learned_max, user_override
    FROM muscle_baselines
    WHERE user_id = 1
  `).all();
    const result = {};
    for (const baseline of baselines) {
        result[baseline.muscle_name] = {
            systemLearnedMax: baseline.system_learned_max,
            userOverride: baseline.user_override
        };
    }
    return result;
}
/**
 * Update muscle baselines
 */
function updateMuscleBaselines(baselines) {
    const update = db.prepare(`
    UPDATE muscle_baselines
    SET system_learned_max = ?, user_override = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = 1 AND muscle_name = ?
  `);
    const updateTransaction = db.transaction(() => {
        for (const [muscleName, baseline] of Object.entries(baselines)) {
            update.run(baseline.systemLearnedMax ?? 10000, baseline.userOverride ?? null, muscleName);
        }
    });
    updateTransaction();
    return getMuscleBaselines();
}
/**
 * Get all workout templates
 */
function getWorkoutTemplates() {
    const templates = db.prepare(`
    SELECT * FROM workout_templates
    WHERE user_id = 1
    ORDER BY times_used DESC, updated_at DESC
  `).all();
    return templates.map(t => ({
        id: t.id.toString(),
        name: t.name,
        category: t.category,
        variation: t.variation,
        exerciseIds: t.exercise_ids ? JSON.parse(t.exercise_ids) : [],
        isFavorite: Boolean(t.is_favorite),
        timesUsed: t.times_used,
        createdAt: new Date(t.created_at).getTime(),
        updatedAt: new Date(t.updated_at).getTime()
    }));
}
/**
 * Get a single workout template by ID
 */
function getWorkoutTemplateById(id) {
    const template = db.prepare(`
    SELECT * FROM workout_templates
    WHERE id = ? AND user_id = 1
  `).get(id);
    if (!template)
        return null;
    return {
        id: template.id.toString(),
        name: template.name,
        category: template.category,
        variation: template.variation,
        exerciseIds: template.exercise_ids ? JSON.parse(template.exercise_ids) : [],
        isFavorite: Boolean(template.is_favorite),
        timesUsed: template.times_used,
        createdAt: new Date(template.created_at).getTime(),
        updatedAt: new Date(template.updated_at).getTime()
    };
}
/**
 * Create a new workout template
 */
function createWorkoutTemplate(template) {
    const insert = db.prepare(`
    INSERT INTO workout_templates (user_id, name, category, variation, exercise_ids, is_favorite, created_at, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
    const result = insert.run(template.name, template.category, template.variation, JSON.stringify(template.exerciseIds), template.isFavorite ? 1 : 0);
    const created = getWorkoutTemplateById(result.lastInsertRowid);
    if (!created) {
        throw new Error('Failed to create workout template');
    }
    return created;
}
/**
 * Update a workout template
 */
function updateWorkoutTemplate(id, template) {
    const update = db.prepare(`
    UPDATE workout_templates
    SET name = ?, category = ?, variation = ?, exercise_ids = ?, is_favorite = ?, times_used = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = 1
  `);
    const result = update.run(template.name, template.category, template.variation, template.exerciseIds ? JSON.stringify(template.exerciseIds) : undefined, template.isFavorite ? 1 : 0, template.timesUsed ?? 0, id);
    if (result.changes === 0)
        return null;
    return getWorkoutTemplateById(id);
}
/**
 * Delete a workout template
 */
function deleteWorkoutTemplate(id) {
    const del = db.prepare('DELETE FROM workout_templates WHERE id = ? AND user_id = 1');
    const result = del.run(id);
    return result.changes > 0;
}
/**
 * Seed default workout templates (called on startup if none exist)
 */
// Function kept for potential future use - exported to avoid unused warning
function seedDefaultTemplates() {
    try {
        console.log('Checking for existing templates...');
        // Check if templates already exist
        const existing = db.prepare('SELECT COUNT(*) as count FROM workout_templates WHERE user_id = 1').get();
        console.log(`Found ${existing.count} existing templates`);
        if (existing.count > 0) {
            console.log('Default templates already exist, skipping seed');
            return;
        }
        console.log('Seeding default workout templates...');
        // Define default templates with curated exercise selections (6-8 exercises each)
        const defaultTemplates = [
            {
                name: 'Push Day A',
                category: 'Push',
                variation: 'A',
                exerciseIds: ['ex02', 'ex30', 'ex38', 'ex05', 'ex34', 'ex31'], // Dumbbell Bench, Tricep Ext, Single Arm Bench, Shoulder Press, KB Press, TRX Pushup
                isFavorite: 1
            },
            {
                name: 'Push Day B',
                category: 'Push',
                variation: 'B',
                exerciseIds: ['ex03', 'ex05', 'ex32', 'ex33', 'ex40', 'ex29'], // Push-up, Shoulder Press, Incline Bench, Dips, TRX Tricep, TRX Reverse Flys
                isFavorite: 0
            },
            {
                name: 'Pull Day A',
                category: 'Pull',
                variation: 'A',
                exerciseIds: ['ex42', 'ex22', 'ex07', 'ex18', 'ex23', 'ex25'], // Wide Grip Pull-ups, Concentration Curl, Bicep Curl, Upright Row, Shrugs, Incline Hammer Curl
                isFavorite: 0
            },
            {
                name: 'Pull Day B',
                category: 'Pull',
                variation: 'B',
                exerciseIds: ['ex09', 'ex07', 'ex21', 'ex20', 'ex19', 'ex48'], // Dumbbell Row, Bicep Curl, Face Pull, Chin-Ups, TRX Bicep Curl, Pullover
                isFavorite: 0
            },
            {
                name: 'Legs Day A',
                category: 'Legs',
                variation: 'A',
                exerciseIds: ['ex12', 'ex15', 'ex43', 'ex37'], // Kettlebell Goblet Squat, Calf Raises, Dumbbell Goblet Squat, Kettlebell Swings
                isFavorite: 0
            },
            {
                name: 'Legs Day B',
                category: 'Legs',
                variation: 'B',
                exerciseIds: ['ex13', 'ex35', 'ex36', 'ex47', 'ex37'], // Romanian Deadlift, Glute Bridges, Stiff Legged Deadlift, Box Step-ups, Kettlebell Swings
                isFavorite: 0
            },
            {
                name: 'Core Day A',
                category: 'Core',
                variation: 'A',
                exerciseIds: ['ex17', 'ex16', 'ex44'], // Bench Sit-ups, Plank, Spider Planks
                isFavorite: 0
            },
            {
                name: 'Core Day B',
                category: 'Core',
                variation: 'B',
                exerciseIds: ['ex16', 'ex45', 'ex46'], // Plank, TRX Mountain Climbers, Hanging Leg Raises
                isFavorite: 0
            }
        ];
        const insert = db.prepare(`
    INSERT INTO workout_templates (user_id, name, category, variation, exercise_ids, is_favorite, times_used)
    VALUES (1, ?, ?, ?, ?, ?, 0)
  `);
        const insertAll = db.transaction((templates) => {
            for (const template of templates) {
                insert.run(template.name, template.category, template.variation, JSON.stringify(template.exerciseIds), template.isFavorite);
            }
        });
        insertAll(defaultTemplates);
        console.log(`✅ Successfully seeded ${defaultTemplates.length} default workout templates`);
    }
    catch (error) {
        console.error('❌ Error seeding default templates:', error.message);
        console.error(error.stack);
    }
}
// Note: Automatic template seeding disabled to support fresh database initialization
// Templates can be seeded after first user is created, or added manually
// TODO: Consider adding template seeding to initializeProfile() if default templates are desired
console.log('Running seed function...');
seedDefaultTemplates();
/**
 * Defensive initialization: Ensure user_id=1 exists
 *
 * Creates a default user if none exists, preventing FOREIGN KEY failures
 * in template seeding and other operations that assume user exists.
 *
 * This is a safety net for fresh installations where onboarding was not completed.
 * Normal flow: User created via POST /api/profile/init during onboarding
 * Fallback: This function creates minimal user to prevent failures
 */
function ensureDefaultUser() {
    // Check if user_id=1 exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = 1').get();
    if (existingUser) {
        console.log('✅ User exists (id=1)');
        return;
    }
    console.log('⚠️  No user found - creating default user (id=1)');
    // Default baseline value for Intermediate experience level
    const defaultBaseline = 10000;
    // All 13 muscles from Muscle enum
    const muscles = [
        'Pectoralis', 'Triceps', 'Deltoids', 'Lats', 'Biceps',
        'Rhomboids', 'Trapezius', 'Forearms', 'Quadriceps',
        'Glutes', 'Hamstrings', 'Calves', 'Core'
    ];
    // Transaction to ensure atomicity
    const createDefaultUser = db.transaction(() => {
        // Create default user
        db.prepare('INSERT INTO users (id, name, experience) VALUES (1, ?, ?)').run('Local User', 'Intermediate');
        console.log('  ✓ Created default user (Local User, Intermediate)');
        // Initialize muscle baselines
        const insertBaseline = db.prepare('INSERT INTO muscle_baselines (user_id, muscle_name, system_learned_max) VALUES (1, ?, ?)');
        for (const muscle of muscles) {
            insertBaseline.run(muscle, defaultBaseline);
        }
        console.log('  ✓ Initialized muscle baselines (13 muscles)');
        // Initialize muscle states
        const insertState = db.prepare('INSERT INTO muscle_states (user_id, muscle_name, initial_fatigue_percent, volume_today, last_trained) VALUES (1, ?, 0, 0, NULL)');
        for (const muscle of muscles) {
            insertState.run(muscle);
        }
        console.log('  ✓ Initialized muscle states (13 muscles)');
        // Initialize detailed muscle states (42 detailed muscles)
        initializeDetailedMuscleStates(1, defaultBaseline);
    });
    // Execute transaction
    createDefaultUser();
    console.log('✅ Default user initialization complete');
}
/**
 * Get last variation used for a category and suggest opposite
 *
 * Returns the last variation used in a category and suggests
 * the opposite variation for balanced training.
 *
 * @param category - Exercise category (Push/Pull/Legs/Core)
 * @returns Variation suggestion object or default to 'A' if no history
 */
function getLastVariationForCategory(category) {
    const lastWorkout = db.prepare(`
    SELECT variation, date
    FROM workouts
    WHERE user_id = 1 AND category = ?
    ORDER BY date DESC
    LIMIT 1
  `).get(category);
    if (!lastWorkout) {
        return {
            suggested: 'A', // Default to A for first workout
            lastVariation: null,
            lastDate: null,
            daysAgo: null
        };
    }
    // Calculate days since last workout
    const lastDate = new Date(lastWorkout.date).getTime();
    const now = Date.now();
    const daysAgo = Math.round((now - lastDate) / (1000 * 60 * 60 * 24));
    // Suggest opposite of what was done last time
    const suggested = lastWorkout.variation === 'A' ? 'B' : 'A';
    return {
        suggested,
        lastVariation: lastWorkout.variation,
        lastDate: lastWorkout.date,
        daysAgo
    };
}
/**
 * Get last workout by category
 */
function getLastWorkoutByCategory(category) {
    const workout = db.prepare(`
    SELECT * FROM workouts
    WHERE user_id = 1 AND category = ?
    ORDER BY date DESC
    LIMIT 1
  `).get(category);
    if (!workout) {
        return null;
    }
    // Get exercise sets for this workout
    const sets = db.prepare(`
    SELECT exercise_name as exercise, weight, reps, set_number
    FROM exercise_sets
    WHERE workout_id = ?
    ORDER BY set_number
  `).all(workout.id);
    // Group sets by exercise
    const exercisesMap = {};
    for (const set of sets) {
        if (!exercisesMap[set.exercise]) {
            exercisesMap[set.exercise] = { exercise: set.exercise, sets: [] };
        }
        const exercise = exercisesMap[set.exercise];
        if (exercise) {
            exercise.sets.push({ weight: set.weight, reps: set.reps });
        }
    }
    return {
        id: workout.id,
        date: workout.date,
        category: workout.category,
        variation: workout.variation,
        progression_method: workout.progression_method,
        duration_seconds: workout.duration_seconds,
        exercises: Object.values(exercisesMap),
        created_at: workout.created_at
    };
}
/**
 * Get all calibrations for user
 */
function getUserCalibrations() {
    const calibrations = db.prepare(`
    SELECT exercise_id, muscle_name, engagement_percentage
    FROM user_exercise_calibrations
    WHERE user_id = 1
  `).all();
    const result = {};
    for (const cal of calibrations) {
        if (!result[cal.exercise_id]) {
            result[cal.exercise_id] = {};
        }
        result[cal.exercise_id][cal.muscle_name] = cal.engagement_percentage;
    }
    return result;
}
/**
 * Get calibrations for specific exercise (merged with defaults)
 */
function getExerciseCalibrations(exerciseId) {
    // Find exercise in library
    const exercise = constants_1.EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
    if (!exercise) {
        throw new Error(`Exercise not found: ${exerciseId}`);
    }
    // Get user calibrations for this exercise
    const calibrations = db.prepare(`
    SELECT muscle_name, engagement_percentage
    FROM user_exercise_calibrations
    WHERE user_id = 1 AND exercise_id = ?
  `).all(exerciseId);
    // Create lookup map
    const calibrationMap = {};
    for (const cal of calibrations) {
        calibrationMap[cal.muscle_name] = cal.engagement_percentage;
    }
    // Merge with defaults
    const engagements = exercise.muscleEngagements.map(engagement => ({
        muscle: engagement.muscle,
        percentage: calibrationMap[engagement.muscle] ?? engagement.percentage,
        isCalibrated: !!calibrationMap[engagement.muscle]
    }));
    return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        engagements
    };
}
/**
 * Save calibrations for exercise
 */
function saveExerciseCalibrations(exerciseId, calibrations) {
    // Validate exercise exists
    const exercise = constants_1.EXERCISE_LIBRARY.find(ex => ex.id === exerciseId);
    if (!exercise) {
        throw new Error(`Exercise not found: ${exerciseId}`);
    }
    // Transaction: upsert all calibrations
    const upsert = db.prepare(`
    INSERT INTO user_exercise_calibrations (user_id, exercise_id, muscle_name, engagement_percentage)
    VALUES (1, ?, ?, ?)
    ON CONFLICT(user_id, exercise_id, muscle_name) DO UPDATE SET
      engagement_percentage = excluded.engagement_percentage,
      updated_at = CURRENT_TIMESTAMP
  `);
    const saveTransaction = db.transaction(() => {
        for (const [muscleName, percentage] of Object.entries(calibrations)) {
            upsert.run(exerciseId, muscleName, percentage);
        }
    });
    saveTransaction();
}
/**
 * Delete all calibrations for exercise
 */
function deleteExerciseCalibrations(exerciseId) {
    db.prepare(`
    DELETE FROM user_exercise_calibrations
    WHERE user_id = 1 AND exercise_id = ?
  `).run(exerciseId);
}
/**
 * Get exercise history for a specific exercise
 * Returns last performance data and personal records
 */
function getExerciseHistory(exerciseId) {
    const userId = 1;
    // Query to get the most recent workout for this exercise
    const lastWorkout = db.prepare(`
    SELECT w.date as completed_at, es.weight, es.reps
    FROM exercise_sets es
    JOIN workouts w ON es.workout_id = w.id
    WHERE w.user_id = ? AND es.exercise_name = ?
    ORDER BY w.date DESC
    LIMIT 1
  `).get(userId, exerciseId);
    if (!lastWorkout) {
        // No history found
        return {
            exerciseId,
            lastPerformed: null,
            sets: [],
            totalVolume: 0,
            personalRecord: null
        };
    }
    // Get all sets from the last workout session
    const lastSessionSets = db.prepare(`
    SELECT es.weight, es.reps
    FROM exercise_sets es
    JOIN workouts w ON es.workout_id = w.id
    WHERE w.user_id = ? AND es.exercise_name = ? AND w.date = ?
    ORDER BY es.set_number
  `).all(userId, exerciseId, lastWorkout.completed_at);
    // Calculate total volume from last session
    const totalVolume = lastSessionSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
    // Find personal record (highest weight × reps product)
    const allSets = db.prepare(`
    SELECT es.weight, es.reps
    FROM exercise_sets es
    JOIN workouts w ON es.workout_id = w.id
    WHERE w.user_id = ? AND es.exercise_name = ?
  `).all(userId, exerciseId);
    let personalRecord = null;
    if (allSets.length > 0) {
        personalRecord = allSets.reduce((best, set) => {
            const currentVolume = set.weight * set.reps;
            const bestVolume = best.weight * best.reps;
            return currentVolume > bestVolume ? set : best;
        });
    }
    return {
        exerciseId,
        lastPerformed: lastWorkout.completed_at,
        sets: lastSessionSets,
        totalVolume,
        personalRecord
    };
}
/**
 * Get database schema information for debugging
 */
function getDatabaseSchemaInfo() {
    const muscleStatesInfo = db.prepare('PRAGMA table_info(muscle_states)').all();
    const detailedMuscleStatesInfo = db.prepare('PRAGMA table_info(detailed_muscle_states)').all();
    const usersInfo = db.prepare('PRAGMA table_info(users)').all();
    return {
        muscle_states: muscleStatesInfo,
        detailed_muscle_states: detailedMuscleStatesInfo,
        users: usersInfo,
        schema_file_path: path_1.default.join(__dirname, 'schema.sql'),
        migrations_dir: path_1.default.join(__dirname, 'migrations')
    };
}
// ============================================
// WORKOUT ROTATION ENGINE
// ============================================
/**
 * Get the current rotation state for a user
 */
function getRotationState(userId = 1) {
    const row = db.prepare(`
    SELECT * FROM workout_rotation_state WHERE user_id = ?
  `).get(userId);
    if (!row) {
        // Initialize default state if not exists
        db.prepare(`
      INSERT INTO workout_rotation_state (user_id, current_cycle, current_phase, rest_days_count)
      VALUES (?, 'A', 0, 0)
    `).run(userId);
        return {
            userId,
            currentCycle: 'A',
            currentPhase: 0,
            lastWorkoutDate: null,
            lastWorkoutCategory: null,
            lastWorkoutVariation: null,
            restDaysCount: 0
        };
    }
    return {
        id: row.id,
        userId: row.user_id,
        currentCycle: row.current_cycle,
        currentPhase: row.current_phase,
        lastWorkoutDate: row.last_workout_date,
        lastWorkoutCategory: row.last_workout_category,
        lastWorkoutVariation: row.last_workout_variation,
        restDaysCount: row.rest_days_count,
        updatedAt: row.updated_at
    };
}
/**
 * Get the next recommended workout based on rotation state
 */
function getNextWorkout(userId = 1) {
    const state = getRotationState(userId);
    // Calculate days since last workout
    let daysAgo = 0;
    if (state.lastWorkoutDate) {
        const lastDate = new Date(state.lastWorkoutDate);
        const now = new Date();
        daysAgo = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    // If this is the first workout ever, start at Push A
    if (!state.lastWorkoutDate) {
        const firstWorkout = constants_1.ROTATION_SEQUENCE[0];
        return {
            isRestDay: false,
            category: firstWorkout.category,
            variation: firstWorkout.variation,
            phase: 0
        };
    }
    // Check if rest days are needed
    const lastWorkout = constants_1.ROTATION_SEQUENCE[state.currentPhase];
    if (state.restDaysCount < lastWorkout.restAfter) {
        return {
            isRestDay: true,
            reason: 'Scheduled rest day',
            lastWorkout: state.lastWorkoutCategory && state.lastWorkoutVariation ? {
                category: state.lastWorkoutCategory,
                variation: state.lastWorkoutVariation,
                date: state.lastWorkoutDate,
                daysAgo
            } : undefined
        };
    }
    // Get next workout in sequence
    const nextPhase = (state.currentPhase + 1) % constants_1.ROTATION_SEQUENCE.length;
    const nextWorkout = constants_1.ROTATION_SEQUENCE[nextPhase];
    // Validate 5-day rule: same muscle group shouldn't be hit within 5 days
    if (state.lastWorkoutCategory && state.lastWorkoutDate) {
        // Push/Pull/Legs are the main categories, Core doesn't count for 5-day rule
        if (state.lastWorkoutCategory !== 'Core' && nextWorkout.category !== 'Core') {
            if (state.lastWorkoutCategory === nextWorkout.category && daysAgo < 5) {
                return {
                    isRestDay: true,
                    reason: 'Muscle group needs more recovery (5-day rule)',
                    lastWorkout: {
                        category: state.lastWorkoutCategory,
                        variation: state.lastWorkoutVariation,
                        date: state.lastWorkoutDate,
                        daysAgo
                    }
                };
            }
        }
    }
    return {
        isRestDay: false,
        category: nextWorkout.category,
        variation: nextWorkout.variation,
        phase: nextPhase,
        lastWorkout: state.lastWorkoutCategory && state.lastWorkoutVariation ? {
            category: state.lastWorkoutCategory,
            variation: state.lastWorkoutVariation,
            date: state.lastWorkoutDate,
            daysAgo
        } : undefined
    };
}
/**
 * Advance the rotation state after completing a workout
 */
function advanceRotation(userId, completedCategory, completedVariation, workoutDate) {
    const state = getRotationState(userId);
    // Core workouts don't advance the rotation phase
    if (completedCategory === 'Core') {
        db.prepare(`
      UPDATE workout_rotation_state
      SET last_workout_date = ?,
          last_workout_category = ?,
          last_workout_variation = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(workoutDate, completedCategory, completedVariation, userId);
        return;
    }
    // Advance to next phase
    const nextPhase = (state.currentPhase + 1) % constants_1.ROTATION_SEQUENCE.length;
    // Determine cycle: transitions happen after Pull B (phase 5 → phase 0)
    let newCycle = state.currentCycle;
    if (state.currentPhase === 5 && nextPhase === 0) {
        // Cycle repeats, stay in current cycle pattern
        // The sequence itself handles A/B variation
    }
    db.prepare(`
    UPDATE workout_rotation_state
    SET current_phase = ?,
        current_cycle = ?,
        last_workout_date = ?,
        last_workout_category = ?,
        last_workout_variation = ?,
        rest_days_count = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(nextPhase, newCycle, workoutDate, completedCategory, completedVariation, userId);
    console.log(`Rotation advanced: Phase ${state.currentPhase} → ${nextPhase}, Category: ${completedCategory} ${completedVariation}`);
}

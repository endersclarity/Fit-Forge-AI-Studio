/**
 * Database Query Profiling Script (Story 4.2)
 *
 * Analyzes critical database queries with EXPLAIN QUERY PLAN
 * Measures execution time and verifies index usage
 *
 * Usage: node backend/scripts/profile-queries.js
 */

const Database = require('better-sqlite3');
const { performance } = require('perf_hooks');
const path = require('path');

// Open database
// Use environment variable or default path (works in Docker and local)
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/fitforge.db');
const db = new Database(dbPath);

// Enable query timing
db.pragma('timer = ON');

console.log('='.repeat(60));
console.log('Database Query Profiling Report');
console.log('='.repeat(60));
console.log();

// Define critical queries to profile
const queries = [
  {
    name: 'Fetch muscle states for user',
    sql: `
      SELECT muscle_name, initial_fatigue_percent, volume_today, last_trained
      FROM muscle_states
      WHERE user_id = 1
    `
  },
  {
    name: 'Fetch workout with sets (LEFT JOIN exercise_sets)',
    sql: `
      SELECT w.id, w.date, w.category, w.variation, w.duration_seconds,
             es.exercise_name, es.weight, es.reps, es.to_failure
      FROM workouts w
      LEFT JOIN exercise_sets es ON w.id = es.workout_id
      WHERE w.user_id = 1
      ORDER BY w.date DESC
      LIMIT 10
    `
  },
  {
    name: 'Fetch muscle baselines',
    sql: `
      SELECT muscle_name, system_learned_max, user_override, updated_at
      FROM muscle_baselines
      WHERE user_id = 1
    `
  },
  {
    name: 'Recent workouts (30 days)',
    sql: `
      SELECT id, date, category, variation, duration_seconds
      FROM workouts
      WHERE user_id = 1
        AND date >= date('now', '-30 days')
      ORDER BY date DESC
    `
  }
];

let totalQueries = 0;
let passedQueries = 0;
let slowQueries = 0;

// Profile each query
queries.forEach((query, index) => {
  console.log(`Query ${index + 1}: ${query.name}`);
  console.log('-'.repeat(60));

  // Run EXPLAIN QUERY PLAN
  const plan = db.prepare(`EXPLAIN QUERY PLAN ${query.sql}`).all();
  console.log('Execution Plan:');
  plan.forEach((row) => {
    console.log(`  ${row.detail}`);
  });

  // Measure execution time
  const start = performance.now();
  const stmt = db.prepare(query.sql);
  const rows = stmt.all();
  const duration = performance.now() - start;

  totalQueries++;

  // Log results
  console.log(`Rows returned: ${rows.length}`);
  console.log(`Duration: ${duration.toFixed(2)}ms`);

  // Mark PASS or SLOW
  if (duration < 50) {
    console.log('Status: ✓ PASS (<50ms)');
    passedQueries++;
  } else {
    console.log(`Status: ✗ SLOW (>${duration.toFixed(2)}ms)`);
    slowQueries++;
  }

  console.log();
});

// Query sqlite_master for all idx_* indexes
console.log('='.repeat(60));
console.log('Database Indexes');
console.log('='.repeat(60));

const indexes = db.prepare(`
  SELECT name, tbl_name, sql
  FROM sqlite_master
  WHERE type = 'index'
    AND name LIKE 'idx_%'
  ORDER BY name
`).all();

console.log(`Total indexes: ${indexes.length}`);
console.log();

indexes.forEach((idx) => {
  console.log(`- ${idx.name} (table: ${idx.tbl_name})`);
});

console.log();
console.log('='.repeat(60));
console.log('Summary');
console.log('='.repeat(60));
console.log(`Total queries profiled: ${totalQueries}`);
console.log(`Passed (<50ms): ${passedQueries}`);
console.log(`Slow (>=50ms): ${slowQueries}`);
console.log(`Pass rate: ${((passedQueries / totalQueries) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

// Close database
db.close();

#!/usr/bin/env node

/**
 * Migration Runner for FitForge Database
 * Applies SQL migrations to the database
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Database file location
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/fitforge.db');

// Check if database exists
if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Database not found at: ${DB_PATH}`);
  console.error('Please ensure the database exists before running migrations.');
  process.exit(1);
}

// Open database connection
console.log(`📂 Opening database: ${DB_PATH}`);
const db = new Database(DB_PATH);

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Usage: node run-migration.js <migration-file>');
  console.error('Example: node run-migration.js migrations/001_add_to_failure_column.sql');
  process.exit(1);
}

// Resolve migration file path
const migrationPath = path.join(__dirname, migrationFile);

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

console.log(`📄 Reading migration: ${migrationPath}`);
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Apply migration
try {
  console.log('🔄 Applying migration...');
  db.exec(migrationSQL);
  console.log('✅ Migration applied successfully!');

  // Verify the migration (for to_failure column)
  if (migrationFile.includes('add_to_failure_column')) {
    console.log('\n📊 Verifying migration...');

    // Check if column exists
    const tableInfo = db.prepare('PRAGMA table_info(exercise_sets)').all();
    const toFailureColumn = tableInfo.find(col => col.name === 'to_failure');

    if (toFailureColumn) {
      console.log('✅ Column "to_failure" exists');
      console.log(`   Type: ${toFailureColumn.type}, Default: ${toFailureColumn.dflt_value}`);
    } else {
      console.error('❌ Column "to_failure" not found!');
      process.exit(1);
    }

    // Check existing data
    const count = db.prepare('SELECT COUNT(*) as total FROM exercise_sets').get();
    if (count.total > 0) {
      const failureCount = db.prepare('SELECT COUNT(*) as count FROM exercise_sets WHERE to_failure = 1').get();
      console.log(`✅ Existing sets updated: ${failureCount.count}/${count.total} sets have to_failure = 1`);
    } else {
      console.log('ℹ️  No existing sets to migrate');
    }

    // Check index
    const indexes = db.prepare('PRAGMA index_list(exercise_sets)').all();
    const failureIndex = indexes.find(idx => idx.name === 'idx_exercise_sets_to_failure');

    if (failureIndex) {
      console.log('✅ Index "idx_exercise_sets_to_failure" created');
    } else {
      console.error('❌ Index "idx_exercise_sets_to_failure" not found!');
      process.exit(1);
    }
  }

  console.log('\n🎉 Migration complete!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.error(error.stack);
  process.exit(1);
} finally {
  db.close();
  console.log('📂 Database connection closed');
}

// Export workout templates from database to JSON
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/fitforge.db');
const db = new Database(DB_PATH, { readonly: true });

const templates = db.prepare(`
  SELECT id, name, category, variation, exercise_ids, is_favorite, times_used, created_at, updated_at
  FROM workout_templates
  WHERE user_id = 1
  ORDER BY times_used DESC, updated_at DESC
`).all();

console.log(JSON.stringify(templates, null, 2));

db.close();

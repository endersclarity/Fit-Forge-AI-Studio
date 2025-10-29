import Database from 'better-sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'fitforge.db');
const db = new Database(dbPath);

const result = db.prepare(`
  SELECT muscle_name, system_learned_max, user_override, updated_at
  FROM muscle_baselines
  WHERE muscle_name = 'Lats'
`).get();

console.log('Lats Baseline in Database:');
console.log(JSON.stringify(result, null, 2));

db.close();

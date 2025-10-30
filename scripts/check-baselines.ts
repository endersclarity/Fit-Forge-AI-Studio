/**
 * Quick script to check current muscle baselines in database
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'fitforge.db');
const db = new Database(dbPath);

const baselines = db.prepare(`
  SELECT muscle_name, system_learned_max, user_override
  FROM muscle_baselines
  ORDER BY muscle_name
`).all() as Array<{
  muscle_name: string;
  system_learned_max: number;
  user_override: number | null;
}>;

console.log('\n📊 Current Muscle Baselines:\n');
for (const baseline of baselines) {
  const effective = baseline.user_override ?? baseline.system_learned_max;
  console.log(`${baseline.muscle_name.padEnd(15)} - System: ${baseline.system_learned_max.toString().padStart(6)}, Override: ${baseline.user_override?.toString().padStart(6) || '   null'}, Effective: ${effective.toString().padStart(6)}`);
}

db.close();

try {
  const Database = require('better-sqlite3');
  const path = require('path');
  
  const DB_PATH = 'c:\Users\ender\.claude\projects\FitForge-Local\data\fitforge.db';
  console.log('Database path:', DB_PATH);
  
  const db = new Database(DB_PATH);
  
  console.log('\n=== DATABASE ROW COUNTS ===\n');
  
  const tables = [
    'workouts',
    'exercise_sets',
    'muscle_states',
    'personal_bests',
    'muscle_baselines',
    'detailed_muscle_states',
    'workout_templates',
    'users',
    'user_exercise_calibrations',
    'bodyweight_history',
    'equipment'
  ];
  
  tables.forEach(table => {
    try {
      const result = db.prepare('SELECT COUNT(*) as cnt FROM ' + table).get();
      console.log(table + ': ' + result.cnt);
    } catch (e) {
      console.log(table + ': ERROR - ' + e.message);
    }
  });
  
  db.close();
  process.exit(0);
} catch (e) {
  console.log('Error:', e.message);
  process.exit(1);
}

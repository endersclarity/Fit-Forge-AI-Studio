// Export workout templates from database to JSON
const db = require('../database/database');

const templates = db.getWorkoutTemplates();
console.log(JSON.stringify(templates, null, 2));

db.db.close();

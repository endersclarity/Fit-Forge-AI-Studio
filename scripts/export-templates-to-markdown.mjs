// Export workout templates to Markdown files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Exercise library mapping
const exerciseMap = {
  "ex02": { name: "Dumbbell Bench Press", category: "Push", equipment: "Dumbbells" },
  "ex38": { name: "Single Arm Dumbbell Bench Press", category: "Push", equipment: "Dumbbells" },
  "ex03": { name: "Push-up", category: "Push", equipment: "Bodyweight/Pull-up Bar" },
  "ex05": { name: "Dumbbell Shoulder Press", category: "Push", equipment: "Dumbbells" },
  "ex06": { name: "Pull-up", category: "Pull", equipment: "Pull-up Bar" },
  "ex07": { name: "Dumbbell Bicep Curl", category: "Pull", equipment: "Dumbbells" },
  "ex09": { name: "Dumbbell Row", category: "Pull", equipment: "Dumbbells" },
  "ex12": { name: "Kettlebell Goblet Squat", category: "Legs", equipment: "Kettlebell" },
  "ex13": { name: "Dumbbell Romanian Deadlift", category: "Legs", equipment: "Dumbbells" },
  "ex15": { name: "Calf Raises", category: "Legs", equipment: "Bodyweight/Dumbbells" },
  "ex16": { name: "Plank", category: "Core", equipment: "Bodyweight" },
  "ex17": { name: "Bench Sit-ups", category: "Core", equipment: "Bodyweight" },
  "ex18": { name: "Dumbbell Upright Row", category: "Pull", equipment: "Dumbbells" },
  "ex19": { name: "TRX Bicep Curl", category: "Pull", equipment: "TRX" },
  "ex20": { name: "Chin-Ups", category: "Pull", equipment: "Pull-up Bar" },
  "ex21": { name: "Face Pull", category: "Pull", equipment: "TRX" },
  "ex22": { name: "Concentration Curl", category: "Pull", equipment: "Dumbbells" },
  "ex23": { name: "Shoulder Shrugs", category: "Pull", equipment: "Dumbbells" },
  "ex25": { name: "Incline Hammer Curl", category: "Pull", equipment: "Dumbbells" },
  "ex26": { name: "Neutral Grip Pull-ups", category: "Pull", equipment: "Pull-up Bar" },
  "ex28": { name: "Renegade Rows", category: "Pull", equipment: "Dumbbells" },
  "ex29": { name: "TRX Reverse Flys", category: "Push", equipment: "TRX" },
  "ex30": { name: "Tricep Extension", category: "Push", equipment: "Dumbbells" },
  "ex31": { name: "TRX Pushup", category: "Push", equipment: "TRX" },
  "ex32": { name: "Incline Dumbbell Bench Press", category: "Push", equipment: "Dumbbells" },
  "ex33": { name: "Dips", category: "Push", equipment: "Dip Station" },
  "ex34": { name: "Kettlebell Press", category: "Push", equipment: "Kettlebell" },
  "ex35": { name: "Glute Bridges", category: "Legs", equipment: "Bodyweight/Dumbbells" },
  "ex36": { name: "Dumbbell Stiff Legged Deadlift", category: "Legs", equipment: "Dumbbells" },
  "ex37": { name: "Kettlebell Swings", category: "Legs", equipment: "Kettlebell" },
  "ex39": { name: "Single Arm Incline Dumbbell Bench Press", category: "Push", equipment: "Dumbbells" },
  "ex40": { name: "TRX Tricep Extension", category: "Push", equipment: "TRX" },
  "ex41": { name: "TRX Pull-up", category: "Pull", equipment: "TRX" },
  "ex42": { name: "Wide Grip Pull-ups", category: "Pull", equipment: "Pull-up Bar" },
  "ex43": { name: "Dumbbell Goblet Squat", category: "Legs", equipment: "Dumbbells" },
  "ex44": { name: "Spider Planks", category: "Core", equipment: "Bodyweight" },
  "ex45": { name: "TRX Mountain Climbers", category: "Core", equipment: "TRX" },
  "ex46": { name: "Hanging Leg Raises", category: "Core", equipment: "Pull-up Bar" },
  "ex47": { name: "Box Step-ups", category: "Legs", equipment: "Plyo Box" },
  "ex48": { name: "Dumbbell Pullover", category: "Pull", equipment: "Dumbbells" }
};

// Fetch templates from API
const response = await fetch('http://localhost:3001/api/templates');
const templates = await response.json();

// Output directory
const outputDir = path.join(__dirname, '../docs/logic-sandbox/workouts/saved-workouts');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate markdown for each template
templates.forEach(template => {
  const markdown = generateMarkdown(template);
  const filename = template.name.toLowerCase().replace(/\s+/g, '-') + '.md';
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, markdown, 'utf8');
  console.log(`Created: ${filename}`);
});

console.log(`\n✅ Exported ${templates.length} templates to ${outputDir}`);

function generateMarkdown(template) {
  const date = new Date(template.createdAt).toLocaleDateString();
  const updated = new Date(template.updatedAt).toLocaleDateString();

  let md = `# ${template.name}\n\n`;
  md += `**Category:** ${template.category}  \n`;
  md += `**Variation:** ${template.variation}  \n`;
  md += `**Favorite:** ${template.isFavorite ? '⭐ Yes' : 'No'}  \n`;
  md += `**Times Used:** ${template.timesUsed}  \n`;
  md += `**Created:** ${date}  \n`;
  md += `**Last Updated:** ${updated}  \n\n`;

  md += `## Exercises (${template.exerciseIds.length})\n\n`;

  template.exerciseIds.forEach((exId, index) => {
    const exercise = exerciseMap[exId];
    if (exercise) {
      md += `${index + 1}. **${exercise.name}**  \n`;
      md += `   - Equipment: ${exercise.equipment}  \n`;
      md += `   - Category: ${exercise.category}  \n\n`;
    } else {
      md += `${index + 1}. **Unknown Exercise** (${exId})  \n\n`;
    }
  });

  md += `---\n\n`;
  md += `*Template ID: ${template.id}*  \n`;
  md += `*Exported from FitForge database*\n`;

  return md;
}

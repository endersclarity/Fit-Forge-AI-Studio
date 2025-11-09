# Saved Workout Templates

This directory contains exported workout templates from the FitForge database, converted to Markdown format for easy reference and documentation.

## Overview

These templates represent the default workout programs available in the FitForge app. They follow a Push/Pull/Legs/Core split with A/B variations for each category.

## Template Structure

Each template includes:
- **Category**: The workout type (Push, Pull, Legs, Core)
- **Variation**: A or B variation of the workout
- **Exercise List**: Ordered list of exercises with equipment requirements
- **Metadata**: Creation date, usage stats, and favorite status

## Available Templates

### Push Workouts
- [Push Day A](push-day-a.md) ⭐ - Dumbbell-focused chest, shoulders, and triceps
- [Push Day B](push-day-b.md) - Bodyweight and machine variations

### Pull Workouts
- [Pull Day A](pull-day-a.md) - Back and biceps with pull-up variations
- [Pull Day B](pull-day-b.md) - Rowing and curling movements

### Legs Workouts
- [Legs Day A](legs-day-a.md) - Squat-focused with quad emphasis
- [Legs Day B](legs-day-b.md) - Deadlift-focused with posterior chain emphasis

### Core Workouts
- [Core Day A](core-day-a.md) - Traditional core exercises
- [Core Day B](core-day-b.md) - Advanced core variations

## Data Source

These templates are exported from:
- **Database**: `data/fitforge.db`
- **Table**: `workout_templates`
- **Export Script**: `scripts/export-templates-to-markdown.mjs`

## Regenerating

To re-export templates after database changes:

```bash
node scripts/export-templates-to-markdown.mjs
```

This will overwrite existing files with fresh data from the database.

---

*Last Generated: November 8, 2025*

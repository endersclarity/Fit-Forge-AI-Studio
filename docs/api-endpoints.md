# FitForge API Endpoints

**Last Updated**: 2025-11-09
**Base URL (Local)**: http://localhost:3001/api
**Base URL (Production)**: https://fit-forge-ai-studio-production-6b5b.up.railway.app/api

---

## Table of Contents

1. [Workouts Resource](#workouts-resource)
2. [Templates Resource](#templates-resource)
3. [Muscle States Resource](#muscle-states-resource)
4. [Baselines Resource](#baselines-resource)
5. [Analytics Resource](#analytics-resource)
6. [Health Check](#health-check)

---

## Workouts Resource

### Create New Workout

**POST** `/api/workouts`

Create a new workout session.

**Request Body:**
```json
{
  "name": "Push Day A",
  "date": "2025-11-09",
  "notes": "Feeling strong today"
}
```

**Response:** `201 Created`
```json
{
  "id": 123,
  "name": "Push Day A",
  "date": "2025-11-09",
  "notes": "Feeling strong today",
  "created_at": "2025-11-09T10:30:00Z"
}
```

---

### List All Workouts

**GET** `/api/workouts`

Retrieve all workout sessions (sorted by date descending).

**Response:** `200 OK`
```json
[
  {
    "id": 123,
    "name": "Push Day A",
    "date": "2025-11-09",
    "notes": "Feeling strong today",
    "created_at": "2025-11-09T10:30:00Z",
    "exercise_count": 5,
    "total_sets": 15
  }
]
```

---

### Get Workout Details

**GET** `/api/workouts/:id`

Get specific workout with all exercises and sets.

**Response:** `200 OK`
```json
{
  "id": 123,
  "name": "Push Day A",
  "date": "2025-11-09",
  "notes": "Feeling strong today",
  "created_at": "2025-11-09T10:30:00Z",
  "exercises": [
    {
      "id": 1,
      "exercise_id": "ex01",
      "exercise_name": "Bench Press",
      "order": 1,
      "sets": [
        {
          "id": 1,
          "set_number": 1,
          "weight": 225,
          "reps": 10,
          "rpe": 7,
          "rest_time": 120
        }
      ]
    }
  ]
}
```

---

### Update Workout

**PUT** `/api/workouts/:id`

Update workout metadata (name, date, notes).

**Request Body:**
```json
{
  "name": "Push Day A (Modified)",
  "notes": "Added extra set"
}
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "name": "Push Day A (Modified)",
  "date": "2025-11-09",
  "notes": "Added extra set",
  "created_at": "2025-11-09T10:30:00Z"
}
```

---

### Delete Workout

**DELETE** `/api/workouts/:id`

Delete workout and all related data (cascades to exercises and sets).

**Response:** `204 No Content`

---

### Add Exercise to Workout

**POST** `/api/workouts/:id/exercises`

Add an exercise to a workout session.

**Request Body:**
```json
{
  "exerciseId": "ex01",
  "order": 1
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "workout_id": 123,
  "exercise_id": "ex01",
  "exercise_name": "Bench Press",
  "order": 1,
  "created_at": "2025-11-09T10:30:00Z"
}
```

---

### Add Set to Exercise

**POST** `/api/workouts/:workoutId/exercises/:exerciseId/sets`

Log a set for an exercise in a workout.

**Request Body:**
```json
{
  "weight": 225,
  "reps": 10,
  "rpe": 7,
  "rest_time": 120
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "workout_exercise_id": 1,
  "set_number": 1,
  "weight": 225,
  "reps": 10,
  "rpe": 7,
  "rest_time": 120,
  "created_at": "2025-11-09T10:35:00Z"
}
```

---

### Update Set

**PUT** `/api/workouts/:workoutId/exercises/:exerciseId/sets/:setId`

Update specific set data.

**Request Body:**
```json
{
  "weight": 230,
  "reps": 8,
  "rpe": 8
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "workout_exercise_id": 1,
  "set_number": 1,
  "weight": 230,
  "reps": 8,
  "rpe": 8,
  "rest_time": 120
}
```

---

### Delete Set

**DELETE** `/api/workouts/:workoutId/exercises/:exerciseId/sets/:setId`

Delete a specific set.

**Response:** `204 No Content`

---

## Templates Resource

### Create Template

**POST** `/api/templates`

Save a workout as a reusable template.

**Request Body:**
```json
{
  "name": "Push Day Template",
  "description": "My standard push day routine",
  "exercises": [
    {
      "exerciseId": "ex01",
      "order": 1,
      "default_sets": 4,
      "default_reps": 10,
      "default_weight": 225
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Push Day Template",
  "description": "My standard push day routine",
  "created_at": "2025-11-09T10:30:00Z",
  "last_used": null
}
```

---

### List Templates

**GET** `/api/templates`

Retrieve all workout templates.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Push Day Template",
    "description": "My standard push day routine",
    "created_at": "2025-11-09T10:30:00Z",
    "last_used": "2025-11-09T12:00:00Z",
    "exercise_count": 5
  }
]
```

---

### Get Template Details

**GET** `/api/templates/:id`

Get specific template with all exercises.

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Push Day Template",
  "description": "My standard push day routine",
  "created_at": "2025-11-09T10:30:00Z",
  "exercises": [
    {
      "id": 1,
      "exercise_id": "ex01",
      "exercise_name": "Bench Press",
      "order": 1,
      "default_sets": 4,
      "default_reps": 10,
      "default_weight": 225
    }
  ]
}
```

---

### Update Template

**PUT** `/api/templates/:id`

Update template metadata.

**Request Body:**
```json
{
  "name": "Push Day A",
  "description": "Updated description"
}
```

**Response:** `200 OK`

---

### Delete Template

**DELETE** `/api/templates/:id`

Delete template and all related exercises.

**Response:** `204 No Content`

---

### Start Workout from Template

**POST** `/api/templates/:id/start`

Create a new workout from a template (copies structure).

**Response:** `201 Created`
```json
{
  "workout_id": 124,
  "template_id": 1,
  "name": "Push Day Template",
  "date": "2025-11-09",
  "exercises": [...]
}
```

---

## Muscle States Resource

### Get Current Muscle States

**GET** `/api/muscle-states`

Get current fatigue state for all muscle groups.

**Response:** `200 OK`
```json
{
  "Chest": {
    "fatigue": 45.2,
    "last_trained": "2025-11-08T10:00:00Z",
    "recovery_status": "Slight Fatigue"
  },
  "Back": {
    "fatigue": 12.5,
    "last_trained": "2025-11-07T14:00:00Z",
    "recovery_status": "Fresh"
  }
}
```

**Recovery Status Levels:**
- `Fresh` (0-20% fatigue)
- `Slight Fatigue` (20-40%)
- `Moderate Fatigue` (40-60%)
- `High Fatigue` (60-80%)
- `Exhausted` (80-100%)

---

### Get Muscle State History

**GET** `/api/muscle-states/history`

Get time-series fatigue data for charting.

**Query Parameters:**
- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date
- `muscle` (optional): Filter by specific muscle group

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "muscle": "Chest",
    "fatigue": 75.5,
    "timestamp": "2025-11-08T10:00:00Z",
    "workout_id": 123
  },
  {
    "id": 2,
    "muscle": "Chest",
    "fatigue": 60.2,
    "timestamp": "2025-11-08T22:00:00Z",
    "workout_id": null
  }
]
```

---

### Recalculate Muscle States

**POST** `/api/muscle-states/calculate`

Trigger recalculation of muscle states based on recent workouts.

**Response:** `200 OK`
```json
{
  "updated_muscles": ["Chest", "Triceps", "Shoulders"],
  "timestamp": "2025-11-09T10:30:00Z"
}
```

**Note:** This endpoint is typically called automatically after workout completion.

---

## Baselines Resource

### Get Muscle Baselines

**GET** `/api/baselines`

Get learned muscle capacity baselines.

**Response:** `200 OK`
```json
{
  "Chest": {
    "baseline_volume": 32.5,
    "baseline_frequency": 2.5,
    "confidence": 0.85,
    "last_updated": "2025-11-09T00:00:00Z"
  },
  "Back": {
    "baseline_volume": 45.0,
    "baseline_frequency": 2.0,
    "confidence": 0.72,
    "last_updated": "2025-11-08T00:00:00Z"
  }
}
```

**Fields:**
- `baseline_volume`: Sets per week at optimal capacity
- `baseline_frequency`: Workouts per week targeting this muscle
- `confidence`: Learning confidence (0.0-1.0)

---

### Update Baseline

**POST** `/api/baselines/update`

Manually update baseline for a specific muscle.

**Request Body:**
```json
{
  "muscle": "Chest",
  "baseline_volume": 35.0,
  "baseline_frequency": 3.0
}
```

**Response:** `200 OK`
```json
{
  "muscle": "Chest",
  "baseline_volume": 35.0,
  "baseline_frequency": 3.0,
  "confidence": 0.90,
  "last_updated": "2025-11-09T10:30:00Z"
}
```

---

### Trigger Baseline Learning

**POST** `/api/baselines/learn`

Analyze historical workout data to learn personalized baselines.

**Response:** `200 OK`
```json
{
  "updated_muscles": ["Chest", "Back", "Shoulders"],
  "analysis_period": "8 weeks",
  "confidence_levels": {
    "Chest": 0.85,
    "Back": 0.72,
    "Shoulders": 0.65
  }
}
```

**Note:** Requires at least 3-4 weeks of workout data for meaningful results.

---

## Analytics Resource

### Get Workout Summary

**GET** `/api/analytics/summary`

Get aggregate workout statistics.

**Query Parameters:**
- `period` (optional): `week`, `month`, `year`, `all-time` (default: `month`)

**Response:** `200 OK`
```json
{
  "period": "month",
  "total_workouts": 16,
  "total_volume": 145820,
  "avg_duration": 3600,
  "muscle_distribution": {
    "Chest": 28.5,
    "Back": 32.1,
    "Legs": 25.0,
    "Arms": 14.4
  }
}
```

---

### Get Performance Trends

**GET** `/api/analytics/trends`

Get performance trends over time for charting.

**Query Parameters:**
- `metric` (required): `volume`, `frequency`, `intensity`
- `muscle` (optional): Filter by muscle group

**Response:** `200 OK`
```json
[
  { "date": "2025-11-01", "value": 8500 },
  { "date": "2025-11-02", "value": 9200 },
  { "date": "2025-11-03", "value": 8800 }
]
```

---

### Get Exercise Recommendations

**GET** `/api/analytics/recommendations`

Get AI-powered workout recommendations based on recovery state.

**Response:** `200 OK`
```json
{
  "recommended_exercises": [
    {
      "exercise_id": "ex12",
      "exercise_name": "Barbell Row",
      "score": 95.5,
      "reasoning": "Back is fully recovered (12% fatigue), high baseline match",
      "target_muscles": ["Back"],
      "suggested_sets": 4,
      "suggested_reps": 10
    }
  ],
  "avoid_muscles": [
    {
      "muscle": "Chest",
      "fatigue": 72.5,
      "time_to_recovery": "18 hours"
    }
  ]
}
```

**Recommendation Scoring Factors:**
- Muscle recovery state (30%)
- Baseline volume match (40%)
- Exercise variety (20%)
- Equipment availability (10%)

---

## Health Check

### Server Health

**GET** `/health`

Check backend server status.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T10:30:00Z",
  "database": "connected",
  "uptime": 86400
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this structure:

```json
{
  "error": "Error message for developers",
  "message": "User-friendly error message",
  "statusCode": 400
}
```

### Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Deletion successful
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Implementation Status

### ✅ Fully Implemented Endpoints

- POST /api/workouts
- GET /api/workouts
- GET /api/workouts/:id
- PUT /api/workouts/:id
- DELETE /api/workouts/:id
- POST /api/workouts/:id/exercises
- POST /api/workouts/:workoutId/exercises/:exerciseId/sets
- PUT /api/workouts/:workoutId/exercises/:exerciseId/sets/:setId
- DELETE /api/workouts/:workoutId/exercises/:exerciseId/sets/:setId
- POST /api/templates
- GET /api/templates
- GET /api/templates/:id
- PUT /api/templates/:id
- DELETE /api/templates/:id
- POST /api/templates/:id/start
- GET /health

### ⚠️ Partially Implemented Endpoints

- GET /api/muscle-states - Returns data, but calculation service incomplete
- POST /api/muscle-states/calculate - Stub implementation
- GET /api/baselines - Returns default baselines, no learning yet
- GET /api/analytics/summary - Basic stats only
- GET /api/analytics/trends - Mock data

### ❌ Not Yet Implemented

- GET /api/muscle-states/history - Endpoint exists, needs time-series query
- POST /api/baselines/update - Stub only
- POST /api/baselines/learn - Baseline learning algorithm not integrated
- GET /api/analytics/recommendations - Returns empty array (algorithm not connected)

---

## API Testing

### cURL Examples

**Create Workout:**
```bash
curl -X POST http://localhost:3001/api/workouts \
  -H "Content-Type: application/json" \
  -d '{"name": "Push Day A", "date": "2025-11-09"}'
```

**Get Muscle States:**
```bash
curl http://localhost:3001/api/muscle-states
```

**Start Workout from Template:**
```bash
curl -X POST http://localhost:3001/api/templates/1/start
```

---

## Related Documentation

- [Tech Stack](./tech-stack.md) - Backend framework details
- [Data Model](./data-model.md) - Database schema reference
- [Business Logic](./business-logic.md) - Calculation algorithms
- [Component Architecture](./component-architecture.md) - Frontend API consumers

---

**Maintained by**: AI-assisted documentation workflow
**Accuracy**: Verified against backend/server.ts as of 2025-11-09

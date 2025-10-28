#!/bin/bash
API="http://localhost:3002/api"

echo "=== Initial Recommendation ==="
curl -s "$API/rotation/next" | jq '.'

echo -e "\n=== Completing Push A Workout ==="
curl -s -X POST "$API/workouts" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-27",
    "category": "Push",
    "variation": "A",
    "durationSeconds": 3600,
    "exercises": [
      {
        "exercise": "Dumbbell Bench Press",
        "sets": [{"weight": 50, "reps": 10}]
      }
    ]
  }' | jq '{id, category, variation, date}'

echo -e "\n=== Next Recommendation (should be Legs A) ==="
curl -s "$API/rotation/next" | jq '.'

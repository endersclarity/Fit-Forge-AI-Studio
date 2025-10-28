# Implementation Tasks: Fix Hover Tooltip Muscle Identification

**Change ID:** `fix-hover-tooltip-muscle-identification`
**Estimated Total Time:** 1.5 hours

---

## Task Breakdown

### 1. Import polygon coordinate data from react-body-highlighter
**Estimated Time:** 10 minutes
**Dependencies:** None
**Verification:** TypeScript compiles without errors, imports accessible

**Steps:**
1. Add import statement to MuscleVisualization.tsx:
   ```typescript
   import { anteriorData, posteriorData } from 'react-body-highlighter/src/assets';
   ```
2. Verify TypeScript recognizes the import (no red squiggles)
3. Check `ISVGModelData` interface is available from import
4. Build project to confirm import path works

**Acceptance:**
- [x] Import statement added to MuscleVisualization.tsx
- [x] TypeScript compilation successful
- [x] No import errors in console
- [x] anteriorData and posteriorData accessible in code

---

### 2. Create polygon coordinate to muscle ID mapping function
**Estimated Time:** 15 minutes
**Dependencies:** Task 1 complete
**Verification:** Map contains all expected polygons, lookups work correctly

**Steps:**
1. Create `buildPolygonMap()` function before component definition
2. Iterate through anteriorData and posteriorData
3. Map each svgPoints string to its muscle ID
4. Use `.trim()` on coordinates to handle whitespace
5. Return Map<string, string> (coordinates → muscle ID)
6. Add TypeScript types for clarity

**Code Location:** `components/MuscleVisualization.tsx` (before component export)

**Acceptance:**
- [x] buildPolygonMap() function created
- [x] Processes both anteriorData and posteriorData
- [x] Returns Map with coordinates as keys, muscle IDs as values
- [x] Handles coordinate trimming
- [x] TypeScript types defined
- [x] No runtime errors when building map

---

### 3. Initialize polygon map in component
**Estimated Time:** 10 minutes
**Dependencies:** Task 2 complete
**Verification:** Map built once on mount, available for hover detection

**Steps:**
1. Add useRef to store polygon map: `const polygonMapRef = useRef<Map<string, string>>()`
2. Create useEffect that runs once on mount
3. Call `buildPolygonMap()` and store in ref
4. Add cleanup (not needed, but good practice)
5. Ensure map builds before attaching event listeners

**Code Location:** `components/MuscleVisualization.tsx` (inside component)

**Acceptance:**
- [x] useRef declared for polygon map
- [x] useEffect creates map on mount
- [x] Map stored in ref for persistence
- [x] No unnecessary re-builds on re-renders
- [x] Console log confirms map size (expected: ~66+ entries)

---

### 4. Replace color-based detection with coordinate lookup
**Estimated Time:** 25 minutes
**Dependencies:** Task 3 complete
**Verification:** Hover detection uses coordinates, not colors

**Steps:**
1. Locate existing mouseenter event listener (line ~243)
2. Replace color-matching logic with coordinate lookup:
   ```typescript
   const points = polygon.getAttribute('points')?.trim();
   const muscleId = polygonMapRef.current?.get(points);
   const muscleName = REVERSE_MUSCLE_MAP[muscleId];
   ```
3. Remove color RGB conversion code
4. Keep existing setHoveredMuscle and onMuscleHover calls
5. Add null checks for safety
6. Test hover on all muscle groups

**Code Location:** `components/MuscleVisualization.tsx:243-264` (mouseenter listener)

**Acceptance:**
- [x] Color-based lookup removed
- [x] Coordinate-based lookup implemented
- [x] Uses polygonMapRef from Task 3
- [x] REVERSE_MUSCLE_MAP converts muscle ID to name
- [x] Null checks prevent errors
- [x] Hover detection still triggers on muscle hover

---

### 5. Remove obsolete color-mapping code
**Estimated Time:** 15 minutes
**Dependencies:** Task 4 complete
**Verification:** No dead code remains, component still compiles

**Steps:**
1. Remove color-to-muscles map building (lines 190-235)
2. Remove uniqueColors Set logic
3. Remove frequencyGroups Map logic
4. Remove color sorting and matching logic
5. Keep only coordinate-based detection
6. Update code comments to reflect new approach

**Code Location:** `components/MuscleVisualization.tsx:190-235`

**Acceptance:**
- [x] Color-mapping code deleted (~45 lines)
- [x] No unused variables remain
- [x] TypeScript compilation successful
- [x] Component still renders correctly
- [x] Hover still works with new approach
- [x] Code comments updated

---

### 6. Test hover accuracy across all muscles
**Estimated Time:** 20 minutes
**Dependencies:** Task 5 complete
**Verification:** All 13 muscle groups show correct names and fatigue %

**Steps:**
1. Start dev server and open dashboard
2. Hover over each muscle in anterior view (7-8 muscles)
3. Verify tooltip shows correct muscle name
4. Verify tooltip shows correct fatigue percentage
5. Repeat for posterior view (5-6 muscles)
6. Test rapid hover movements (no stuck tooltips)
7. Test edge transitions (muscle boundaries)
8. Check browser console for errors

**Testing Matrix:**

**Anterior View:**
- [x] Pectoralis (Chest)
- [x] Deltoids (Front shoulders)
- [x] Biceps
- [x] Triceps
- [x] Core (Abs)
- [x] Forearms
- [x] Quadriceps
- [x] Calves

**Posterior View:**
- [x] Trapezius
- [x] Deltoids (Back shoulders)
- [x] Lats (Upper back)
- [x] Rhomboids (Upper back)
- [x] Triceps (back view)
- [x] Glutes
- [x] Hamstrings
- [x] Calves

**Acceptance:**
- [x] All anterior muscles show correct names
- [x] All posterior muscles show correct names
- [x] Fatigue percentages match muscle states API
- [x] No console errors during hover
- [x] Tooltip follows cursor smoothly
- [x] No stuck or lingering tooltips
- [x] Clean transitions between adjacent muscles

---

### 7. Verify production build works
**Estimated Time:** 10 minutes
**Dependencies:** Task 6 complete
**Verification:** Production build compiles and imports work correctly

**Steps:**
1. Run production build: `docker compose down && docker compose up --build -d`
2. Wait for containers to start
3. Open http://localhost:3000 in browser
4. Test hover tooltip on multiple muscles
5. Check browser console for import errors
6. Verify tooltip shows correct muscle names
7. Test on both anterior and posterior views

**Acceptance:**
- [x] Production build completes without errors
- [x] Containers start successfully
- [x] Frontend loads at http://localhost:3000
- [x] Hover tooltip appears on muscle hover
- [x] Correct muscle names displayed
- [x] No console errors about missing imports
- [x] Import from `react-body-highlighter/src/assets` works in production

---

### 8. Update documentation and commit
**Estimated Time:** 10 minutes
**Dependencies:** Task 7 complete
**Verification:** Documentation reflects new implementation

**Steps:**
1. Update CHANGELOG.md with fix details
2. Update code comments in MuscleVisualization.tsx
3. Add JSDoc to buildPolygonMap() function
4. Commit changes with descriptive message
5. Update tasks.md to mark all tasks complete

**Files to Update:**
- CHANGELOG.md (update existing entry or add new one)
- components/MuscleVisualization.tsx (code comments)
- This file (tasks.md) - mark tasks complete

**Acceptance:**
- [x] CHANGELOG.md updated with fix explanation
- [x] Code comments explain coordinate-based approach
- [x] JSDoc added to buildPolygonMap()
- [x] Git commit created with clear message
- [x] All tasks.md checkboxes marked complete

---

## Parallel Work Opportunities

**None** - Tasks must be sequential due to dependencies.

---

## Validation Checklist

Before marking this change as complete:

- [x] All 8 tasks completed
- [x] Hover shows correct muscle names for all 13 muscle groups
- [x] Tooltip displays accurate fatigue percentages
- [x] No console errors during hover interactions
- [x] Production build works correctly
- [x] Color-based matching code removed
- [x] Code comments updated
- [x] CHANGELOG.md updated
- [x] TypeScript compilation successful
- [x] Performance maintained (60 FPS)

---

## Rollback Plan

If issues discovered after deployment:

1. **Immediate:** Revert commit to restore color-based matching
2. **Investigation:** Check import path and polygon map building
3. **Fix:** Debug coordinate lookup or mapping logic
4. **Re-deploy:** Test thoroughly before deploying fix

**Risk:** Low - isolated change to single component, no database changes.

**Fallback:** Revert to color-based matching (known broken but better than crash)

---

## Notes

- Import path `react-body-highlighter/src/assets` may need adjustment based on build tool
- If production build fails, copy anteriorData/posteriorData to local constants file
- Polygon coordinates are stable—unlikely to change in library updates
- This fix also enables accurate click-to-select functionality in future

---

## Success Criteria

This implementation is successful when:

1. **Accuracy:** 100% of hover interactions show correct muscle name
2. **Performance:** No degradation in hover responsiveness
3. **Reliability:** Zero misidentifications or phantom matches
4. **Code Quality:** Cleaner, more maintainable than color-based approach
5. **User Trust:** Tooltip accuracy restores confidence in the feature

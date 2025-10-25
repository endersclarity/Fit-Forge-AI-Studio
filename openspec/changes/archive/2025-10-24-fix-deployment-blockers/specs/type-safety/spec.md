# Spec: Type Safety

## ADDED Requirements

### Requirement: Frontend must have proper Vite type definitions

**Priority**: Medium
**Status**: New

TypeScript files that use Vite-specific features (import.meta.env) MUST have the appropriate type definitions included. Files accessing `import.meta.env` SHALL include the Vite client type reference.

#### Scenario: API module accesses Vite environment variables

**Given** the `api.ts` file needs to access `import.meta.env.VITE_API_URL`
**When** TypeScript compiles the file
**Then** the `env` property is recognized on `ImportMeta` type
**And** no type errors are reported

**Validation**:
- `api.ts` compiles without errors
- No error: "Property 'env' does not exist on type 'ImportMeta'"
- TypeScript compiler exit code 0

**Implementation**:
```typescript
/// <reference types="vite/client" />
```

---

### Requirement: Component state types must be explicit when using spread operators

**Priority**: Medium
**Status**: New

React components using spread operators with state MUST have explicit type annotations to prevent type inference errors. The system SHALL NOT rely on implicit type inference for spread operations.

#### Scenario: PersonalBests component spreads state updates

**Given** the PersonalBests component updates state using spread operator
**When** TypeScript compiles the component
**Then** the spread operation has a known object type
**And** no "Spread types may only be created from object types" error occurs

**Validation**:
- `components/PersonalBests.tsx` compiles without errors
- Type checker accepts spread operation
- TypeScript compiler exit code 0

**Implementation**: Add explicit type annotation
```typescript
const newState: PersonalBestsState = { ...oldState, ...updates };
```

---

### Requirement: Template grouping operations must have proper type inference

**Priority**: Medium
**Status**: New

When grouping or transforming arrays of templates, TypeScript MUST be able to infer or be told the resulting types. Complex transformations SHALL include explicit type annotations or assertions.

#### Scenario: WorkoutTemplates groups templates by category

**Given** the WorkoutTemplates component groups templates using reduce
**When** TypeScript compiles the component
**Then** the grouped result has a known type
**And** `.map()` operations are recognized on the values
**And** no "Property 'map' does not exist on type 'unknown'" error occurs

**Validation**:
- `components/WorkoutTemplates.tsx` compiles without errors
- Array methods recognized on grouped templates
- TypeScript compiler exit code 0

**Implementation**: Add type assertion or explicit typing
```typescript
const groupedTemplates: Record<string, WorkoutTemplate[]> = templates.reduce(...);
```

---

## MODIFIED Requirements

### Requirement: All TypeScript code must compile without errors

**Priority**: High
**Status**: Strengthened to catch framework-specific type issues

All TypeScript source files in both frontend and backend MUST compile successfully with strict type checking enabled. The system SHALL produce zero type errors when running `tsc --noEmit`.

#### Scenario: Full codebase type check passes

**Given** all source files in the project
**When** running `npx tsc --noEmit` in the frontend
**And** running `npm run build` in the backend
**Then** no type errors are reported
**And** compiler exit code is 0

**Validation**:
- Frontend: `npx tsc --noEmit` exits with code 0
- Backend: `npm run build` exits with code 0
- No TS2339, TS2698, or TS2345 errors
- Zero type errors in output

---

## Cross-References

- Related to: `build-system` spec (compilation must succeed before build)
- Impacts: Development experience, IDE support, runtime type safety
- Dependencies: Build system must be working first

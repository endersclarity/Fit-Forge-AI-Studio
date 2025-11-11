# FitForge Technology Stack

**Last Updated**: 2025-11-09
**Project**: FitForge-Local
**Type**: Multi-part (Frontend + Backend)

---

## Frontend Technologies

### Core Framework
- **React**: 19.2.0 (latest with concurrent features)
- **React DOM**: 19.2.0
- **TypeScript**: 5.8.2
- **Vite**: 6.2.0 (build tool with HMR)

### UI & Visualization
- **Recharts**: 3.3.0 (muscle fatigue visualizations, analytics charts)
- **React Body Highlighter**: 2.0.5 (muscle group visualization)
- **React Router DOM**: 6.30.1 (declarative routing)

### State Management
- **Context API**: WorkoutContext for global workout state
- **React Hooks**: useState, useEffect, useCallback, useContext

### Testing & Development
- **Vitest**: 4.0.3 (unit testing framework)
- **@testing-library/react**: 16.3.0 (component testing)
- **@testing-library/jest-dom**: 6.9.1 (DOM matchers)
- **Storybook**: 9.1.15 (component development environment)
- **Playwright**: 1.56.1 (browser automation for integration tests)
- **jsdom**: 27.0.1 (DOM simulation)

### Build & Development Tools
- **@vitejs/plugin-react**: 5.0.0 (React Fast Refresh)
- **tsx**: 4.20.6 (TypeScript execution)
- **rollup**: 4.52.5 (bundler)

---

## Backend Technologies

### Runtime & Framework
- **Node.js**: Runtime environment
- **Express**: 4.18.2 (REST API framework)
- **TypeScript**: 5.3.3
- **ts-node**: 10.9.2 (TypeScript execution)

### Database
- **better-sqlite3**: 9.2.2 (synchronous SQLite3 bindings)
- **SQLite Database**: `workout-tracker.db` (embedded database file)

### Development Tools
- **nodemon**: 3.0.2 (auto-restart on file changes)
- **dotenv**: 17.2.3 (environment variables)

### API Middleware
- **cors**: 2.8.5 (Cross-Origin Resource Sharing)
- **body-parser**: Built into Express 4.18+ (JSON parsing)

---

## Database Schema

### Core Tables (7 total)

1. **workouts** - Workout sessions with timestamps
2. **workout_exercises** - Individual exercises in workouts
3. **exercise_sets** - Sets with weight, reps, RPE per exercise
4. **muscle_states** - Time-series muscle fatigue tracking
5. **baseline_states** - Learned muscle baselines (volume, frequency)
6. **workout_templates** - Saved workout templates
7. **template_exercises** - Exercises in templates

**Schema Location**: `backend/database/schema.sql`

### Exercise Library
- **Location**: `shared/exercise-library.ts`
- **Count**: 150+ exercises
- **Validated Data**: `docs/logic-sandbox/exercises.json` (48 exercises with corrected muscle engagement)
- **Structure**: Exercise objects with muscle targeting, equipment, difficulty

---

## Development Workflow

### Local Development (Docker Compose)
**Configuration**: `docker-compose.yml`

**Frontend Container**:
- Uses `Dockerfile.dev`
- Vite dev server with HMR enabled
- Port: 3000
- Volume mount: `.:/app` (hot reload without rebuilds)

**Backend Container**:
- Uses `backend/Dockerfile.dev`
- Nodemon with auto-restart
- Port: 3001
- Volume mount: `./backend:/app` (auto-restart on file changes)

**Development Commands**:
```bash
docker-compose up -d      # Start dev environment
docker-compose logs -f    # View logs
docker-compose down       # Stop services
```

**Hot Module Reload (HMR)**:
- Frontend: Instant browser refresh on `.tsx`, `.ts`, `.css` changes
- Backend: Automatic server restart on file changes
- **NO container rebuilds needed** for code changes
- Only rebuild when `package.json` dependencies change

### Port Configuration (MANDATORY)
⚠️ **CRITICAL RULES**:
- Frontend: Always port **3000**
- Backend: Always port **3001**
- Never allow Vite to use alternate ports (3002, 3003, etc.)
- If ports are busy, containers are still running - run `docker-compose down` first

---

## Production Deployment (Railway)

### Configuration
- **Platform**: Railway (https://railway.app)
- **URL**: https://fit-forge-ai-studio-production-6b5b.up.railway.app/
- **Dockerfile**: `Dockerfile` (multi-stage production build)
- **Deployment**: Auto-deploy from GitHub main branch

### Build Process
1. Frontend built with `vite build` → static files
2. Backend compiled with `tsc` → dist/
3. Single container serves both frontend and backend
4. Frontend port: 3000
5. Backend port: 3001

### Environment Variables
- `NODE_ENV=production`
- Database file persisted in Railway volume

---

## Testing Strategy

### Unit Testing (Vitest)
- **Framework**: Vitest 4.0.3
- **Location**: Test files co-located with components (`.test.tsx`)
- **Command**: `npm test`
- **Coverage**: `npm run test:coverage`

### Component Testing
- **Framework**: React Testing Library 16.3.0
- **Purpose**: Component behavior and user interaction testing
- **Accessibility**: @axe-core/react for a11y testing

### Component Development (Storybook)
- **Version**: 9.1.15
- **Port**: 6006
- **Command**: `npm run storybook`
- **Stories**: Isolated component development and documentation
- **Addons**: a11y addon for accessibility testing

### Integration Testing (Planned)
- **Framework**: Playwright 1.56.1
- **Status**: Dependencies installed, tests not yet implemented
- **Target**: API endpoint testing, full workflow testing

---

## Shared Code

### Shared Directory Structure
```
shared/
├── exercise-library.ts     # Exercise database (150+ exercises)
├── types.ts               # TypeScript type definitions
├── muscle-groups.ts       # Muscle group enums and mappings
└── constants.ts           # Shared constants
```

### Type Definitions
- Workout types
- Exercise types
- Set types
- Muscle state types
- Template types

**Usage**: Shared between frontend and backend for type safety

---

## Development Patterns

### Code Organization
```
FitForge-Local/
├── components/            # React components
├── contexts/             # React Context providers
├── shared/               # Shared TypeScript code
├── backend/              # Express API
│   ├── database/        # SQLite operations
│   └── server.ts        # Main server file
├── docs/                 # Documentation
│   ├── logic-sandbox/   # Validated algorithms
│   └── plans/           # Implementation plans
└── openspec/            # OpenSpec change proposals
```

### State Management Pattern
- **WorkoutContext**: Global workout state via Context API
- **Local State**: Component-level state with useState
- **No Redux**: Keeping it simple with Context API

### API Communication
- **Frontend → Backend**: axios HTTP client
- **Base URL**: Configured via environment variable
- **Error Handling**: Try-catch with user-friendly error messages

---

## Key Dependencies Rationale

### Why React 19?
- Latest concurrent features for performance
- Improved server components (future-proofing)
- Better TypeScript integration

### Why Vite over Create React App?
- Faster HMR (instant feedback)
- Smaller bundle size
- Better TypeScript support
- ESM-first approach

### Why SQLite over PostgreSQL?
- Embedded database (no separate server needed)
- Perfect for single-user local app
- Fast queries for workout data
- Easy backup (single file)
- Railway supports SQLite volumes

### Why Express over Next.js API Routes?
- Separate frontend/backend for flexibility
- Easier to reason about API layer
- Better for local development (HMR independence)
- Simpler deployment model

---

## Performance Considerations

### Frontend Optimization
- Vite code splitting (automatic)
- React.memo for expensive components
- useCallback for stable function references
- Recharts lazy loading for chart components

### Backend Optimization
- SQLite indexes on frequently queried columns
- Connection pooling (better-sqlite3 handles this)
- Prepared statements for security and performance

### Database Indexes
- `idx_muscle_states_timestamp` on muscle_states(timestamp)
- `idx_muscle_states_muscle` on muscle_states(muscle)
- Foreign keys for referential integrity

---

## Security Considerations

### Current Status
- CORS enabled for local development
- No authentication system (single-user app)
- SQL injection protected (prepared statements)
- Input validation needed (TODO)

### Future Enhancements (Post-MVP)
- Input validation middleware (express-validator)
- Rate limiting for API endpoints
- HTTPS enforcement in production
- Content Security Policy headers

---

## Known Issues & Technical Debt

### Critical Issues
1. **TemplateCard React 19 Compatibility**: Missing key props causing crash
2. **Fatigue Calculation Service**: Stub implementation, needs full integration
3. **Exercise Library Corrections**: 10-15 exercises have wrong muscle targeting

### Minor Issues
1. No API request timeout handling
2. Error messages not user-friendly
3. Loading states missing in some components
4. No retry logic for failed API calls

### Technical Debt
1. No TypeScript strict mode enabled
2. Test coverage below 50%
3. Some components need accessibility improvements
4. No CI/CD pipeline (manual deployment review)

---

## Version History

### Current Versions (2025-11-09)
- React: 19.2.0
- TypeScript: 5.8.2
- Vite: 6.2.0
- Express: 4.18.2
- better-sqlite3: 9.2.2

### Upgrade Path
- React 19 stable (upgraded from 18)
- TypeScript 5.8 (upgraded from 5.3)
- Vite 6 (upgraded from 5)
- All dependencies relatively recent (within 6 months)

---

## Development Environment Setup

### Prerequisites
- Docker Desktop installed
- Git for version control
- Node.js 18+ (for local testing without Docker)

### First Time Setup
```bash
# Clone repository
git clone <repo-url>
cd FitForge-Local

# Start development environment
docker-compose up -d

# Access application
open http://localhost:3000
```

### Rebuilding After Dependency Changes
```bash
# Stop containers
docker-compose down

# Rebuild with new dependencies
docker-compose up -d --build
```

---

## Related Documentation

- [API Endpoints](./api-endpoints.md) - Complete REST API reference
- [Data Model](./data-model.md) - Database schema and relationships
- [Component Architecture](./component-architecture.md) - React component hierarchy
- [Business Logic](./business-logic.md) - Algorithms and calculations
- [Logic Sandbox](./logic-sandbox/README.md) - Validated algorithms and test data

---

**Maintained by**: AI-assisted documentation workflow
**Accuracy**: Verified against codebase as of 2025-11-09

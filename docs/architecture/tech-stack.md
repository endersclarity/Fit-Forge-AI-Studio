# FitForge Technology Stack

**Last Updated:** 2025-11-15
**Extracted From:** [docs/architecture-ui-redesign-2025-11-12.md](../architecture-ui-redesign-2025-11-12.md)

## Frontend Stack

### Core Framework
```typescript
React: 19.2.0              // Modern concurrent features
TypeScript: 5.8.2          // Strict type checking enabled
Vite: 6.2.0                // HMR dev server (instant reload)
React Router DOM: 6.30.1   // Client-side routing
```

### Styling & Design
```typescript
Tailwind CSS: 3.x (PostCSS) // Design token system
@fontsource/cinzel: ^5.2.8  // Display font (headlines, titles)
@fontsource/lato: ^5.2.8    // Body font (readable text)
```

### UI Libraries
```typescript
Framer Motion: 12.23.24    // Animations, transitions, springs
Vaul: 1.1.2                // Bottom sheet drawer component
```

### Testing
```typescript
Vitest: Latest             // Unit testing framework
@testing-library/react     // Component testing utilities
@axe-core/react           // Accessibility testing (dev-only)
Playwright               // E2E testing (optional)
```

## Backend Stack

**Note:** Epic 8 is frontend-only. Backend remains unchanged.

### Runtime & Framework
```typescript
Node.js: 20.x
Express: 4.18.2
TypeScript: 5.3.3
```

### Database
```typescript
better-sqlite3: 9.2.2      // Synchronous SQLite ORM
```

### APIs
- 20+ REST endpoints (unchanged)
- No GraphQL
- No WebSocket connections

## Development Environment

### Docker Configuration
```yaml
# Frontend Container
Service: frontend
Port: 3000 (MANDATORY - never change)
Build: Dockerfile.dev
HMR: Enabled via volume mounts
Rebuild Required: Only when package.json dependencies change

# Backend Container
Service: backend
Port: 3001 (MANDATORY - never change)
Build: backend/Dockerfile.dev
Auto-restart: nodemon watches backend/ directory
```

### Critical Port Rules
⚠️ **NEVER CHANGE PORTS**
- Frontend: `localhost:3000`
- Backend: `localhost:3001`
- If ports are busy, containers are still running - stop with `docker-compose down`

### Hot Reload
- Frontend: Vite detects changes → Browser auto-refreshes
- Backend: Nodemon detects changes → Server restarts
- **No rebuilds needed** for code changes

### When to Rebuild
Rebuild containers only when:
- `package.json` dependencies change
- Dockerfiles modified
- Build configuration changes

```bash
docker-compose down
docker-compose up -d --build
```

## Build Tools

### Vite Configuration
- Dev server on port 3000
- HMR enabled by default
- PostCSS processing for Tailwind
- Tree-shaking in production builds

### TypeScript Configuration
- Strict mode enabled
- Path aliases: `@/` → project root
- Target: ES2020
- Module: ESNext

## Feature Flags

### Animation Control
```typescript
VITE_ANIMATIONS_ENABLED=true  // Toggle Framer Motion animations
```

### Reduced Motion
- Respects OS `prefers-reduced-motion` setting
- Can be overridden for QA testing

## Production Deployment

### Railway (Production)
- URL: https://fit-forge-ai-studio-production-6b5b.up.railway.app/
- Uses `Dockerfile` (production build, NOT Dockerfile.dev)
- Auto-deploys on GitHub push to main branch
- **Separate from local development** - local changes don't affect production

### Local vs Production
- Local: `docker-compose.yml` with HMR
- Production: Railway uses standalone Dockerfile
- Railway does NOT use docker-compose.yml

## Dependencies to Watch

### Potential Additions (Epic 8)
```typescript
// Performance optimization candidates
react-lazy         // Code splitting
rollup-visualizer  // Bundle analysis

// Empty state assets
// (TBD based on design decisions)
```

### Dependencies to Avoid
- No CSS-in-JS libraries (styled-components, emotion)
- No UI component libraries (Material-UI, Ant Design)
- No state management libraries (Redux, MobX) - React context is sufficient

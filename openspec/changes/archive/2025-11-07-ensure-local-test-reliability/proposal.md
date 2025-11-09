# Proposal: Ensure Local Test Reliability

**Change ID:** `2025-11-07-ensure-local-test-reliability`
**Status:** Proposed
**Created:** 2025-11-07
**Author:** Development Team
**Priority:** Medium (Developer Experience)

---

## Why

Backend database tests are currently failing in local development environments due to Node.js version mismatches with the better-sqlite3 native module:

```
Error: The module '...\better-sqlite3\build\Release\better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 127. This version of Node.js requires
NODE_MODULE_VERSION 141.
```

**Current Impact:**
- Backend tests fail with `npm test` (1 test suite fails, 36 pass)
- Developers cannot verify database operations locally
- New contributors may waste time debugging environmental issues
- Backend changes cannot be validated before pushing to CI/CD

**Root Cause:**
The better-sqlite3 package includes a native Node.js addon (C++ binary) that must be compiled for the specific Node.js version in use. When developers upgrade Node.js locally (e.g., from v18 to v22), the pre-compiled binary becomes incompatible.

**Why This Matters:**
While production deployments work fine (Docker rebuilds modules with correct Node version), local development experience is degraded. This creates friction for:
- Backend feature development
- Database schema changes
- Debugging database-related issues
- Developer onboarding

---

## Problem Statement

**Current Behavior:**
1. Developer upgrades Node.js locally (common with tools like nvm, Volta, etc.)
2. Existing `node_modules/better-sqlite3` contains binary for old Node version
3. Running `npm test` fails with MODULE_VERSION mismatch
4. Developer must manually diagnose and rebuild native modules

**Why This Is a Problem:**
1. **Hidden Dependency**: Developers don't realize native modules need rebuilding after Node upgrades
2. **Inconsistent DX**: Frontend tests work, backend tests fail - confusing split
3. **Time Waste**: Debugging environmental issues instead of building features
4. **Onboarding Friction**: New devs hit this issue immediately if using newer Node versions
5. **CI/CD Blind Spot**: If CI uses different Node version, issues may only surface locally

**Gap Analysis:**
- ✅ Production: Works (Docker rebuilds modules)
- ✅ Docker Dev: Works (containerized Node version)
- ❌ Local npm test: Broken (stale native modules)
- ❌ Documentation: No guidance on Node version requirements or troubleshooting

---

## Proposed Solution

Implement a multi-layered approach to prevent and detect native module version mismatches:

### 1. Automated Module Rebuild (Preventive)
Add `postinstall` script to automatically rebuild native modules after `npm install`:

```json
// backend/package.json
{
  "scripts": {
    "postinstall": "npm rebuild better-sqlite3"
  }
}
```

**Benefits:**
- Automatically fixes the issue when running `npm install` after Node upgrade
- Zero manual intervention required
- Handles other native modules if added in the future

**Tradeoffs:**
- Adds ~2-5 seconds to `npm install` time
- Requires build tools (node-gyp, Python, C++ compiler) on dev machines

### 2. Node Version Check (Detective)
Add pre-test script to detect Node version mismatches and provide helpful error:

```json
// backend/package.json
{
  "scripts": {
    "pretest": "node scripts/check-node-version.js"
  }
}
```

```javascript
// backend/scripts/check-node-version.js
const { execSync } = require('child_process');

try {
  // Attempt to load better-sqlite3 to detect version mismatch
  require('better-sqlite3');
} catch (error) {
  if (error.message.includes('NODE_MODULE_VERSION')) {
    console.error('❌ Native module version mismatch detected!');
    console.error('');
    console.error('Your Node.js version has changed since modules were installed.');
    console.error('');
    console.error('Fix: Run the following command:');
    console.error('  cd backend && npm rebuild better-sqlite3');
    console.error('');
    process.exit(1);
  }
  throw error;
}
```

**Benefits:**
- Clear, actionable error message
- Fails fast before running tests
- Educates developers about the issue

### 3. Documentation (Informative)
Add Node version requirements and troubleshooting to README:

**Location:** `backend/README.md` (create if doesn't exist)

```markdown
## Local Development Requirements

- Node.js: v20.x or v22.x (matches Dockerfile)
- npm: v9.x+
- Build tools for native modules:
  - **Windows:** `npm install --global windows-build-tools`
  - **macOS:** Xcode Command Line Tools
  - **Linux:** `build-essential` package

## Troubleshooting

### "NODE_MODULE_VERSION mismatch" error

**Cause:** Node.js version changed since modules were installed.

**Fix:**
```bash
cd backend
npm rebuild better-sqlite3
```

**Prevent:** Use a Node version manager (nvm, Volta) and pin the version:
```bash
# Using nvm
nvm use 20

# Or create .nvmrc
echo "20" > .nvmrc
```
```

### 4. .nvmrc File (Standardization)
Create `.nvmrc` in project root to specify Node version:

```
20
```

**Benefits:**
- `nvm use` automatically switches to correct version
- CI/CD can reference this file
- Documents the supported Node version

---

## Non-Goals

This proposal does NOT aim to:
- ❌ Change Docker configuration (already works correctly)
- ❌ Remove better-sqlite3 dependency (required for SQLite)
- ❌ Add a database abstraction layer (out of scope)
- ❌ Switch to a different database (not justified by this issue alone)

---

## Success Criteria

- ✅ `npm test` passes in backend directory after fresh clone + `npm install`
- ✅ `npm test` passes after switching Node versions (via postinstall rebuild)
- ✅ Clear error message if module mismatch is detected
- ✅ Documentation guides developers through troubleshooting
- ✅ `.nvmrc` file standardizes Node version across team
- ✅ No impact on Docker or production deployments

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| postinstall slows down npm install | Low (2-5s) | Acceptable for reliability gain |
| Build tools not installed on dev machines | Medium | Document requirements in README |
| Different native modules added in future | Low | postinstall pattern handles all native modules |
| Version check false positives | Low | Only triggers on actual MODULE_VERSION errors |

---

## Alternatives Considered

### Alternative 1: Pure Docker Development
**Approach:** Require all backend development inside Docker containers

**Pros:**
- Guarantees consistent environment
- No native module issues

**Cons:**
- Slower iteration (container overhead)
- More complex debugging
- Steeper learning curve for contributors

**Verdict:** ❌ Rejected - Too heavy-handed for a simple environment issue

### Alternative 2: Switch to pure-JavaScript SQLite
**Approach:** Replace better-sqlite3 with sql.js (WASM-based)

**Pros:**
- No native modules
- Works everywhere

**Cons:**
- Significant performance penalty (10-100x slower)
- Different API (refactoring required)
- Less battle-tested for production use

**Verdict:** ❌ Rejected - Performance trade-off not justified

### Alternative 3: Manual Documentation Only
**Approach:** Just document the issue in README

**Pros:**
- Zero code changes
- Simple to implement

**Cons:**
- Developers still hit the issue
- Relies on reading docs (often skipped)
- Doesn't prevent the problem

**Verdict:** ❌ Rejected - Doesn't solve the problem, only documents it

---

## Implementation Estimate

- **Effort:** 1-2 hours
- **Complexity:** Low
- **Files Changed:** 3-4 files
- **Breaking Changes:** None

---

## Dependencies

- None - this change is isolated to backend development environment
- Does not require changes to frontend, Docker, or production infrastructure

---

## Future Considerations

Once implemented, this pattern can be extended to:
1. Detect other environment issues (missing dependencies, port conflicts)
2. Provide setup scripts for common platforms
3. Integrate with CI/CD to fail early on version mismatches

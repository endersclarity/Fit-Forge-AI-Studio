# Implementation Tasks: Ensure Local Test Reliability

**Change ID:** `2025-11-07-ensure-local-test-reliability`

---

## Task 1: Add Automated Module Rebuild

**Goal:** Automatically rebuild native modules after npm install

**Files:**
- Modify: `backend/package.json`

**Steps:**

1. Read current backend/package.json scripts section
2. Add postinstall script to rebuild better-sqlite3:
   ```json
   "scripts": {
     "postinstall": "npm rebuild better-sqlite3"
   }
   ```
3. Test by deleting node_modules and running `npm install`
4. Verify better-sqlite3 rebuilds for current Node version
5. Commit: `chore(backend): auto-rebuild native modules after install`

**Validation:**
```bash
cd backend
rm -rf node_modules
npm install
# Should see rebuild output
npm test
# Should pass without MODULE_VERSION error
```

**Time Estimate:** 15 minutes

---

## Task 2: Create Node Version Check Script

**Goal:** Detect and provide helpful errors for module version mismatches

**Files:**
- Create: `backend/scripts/check-node-version.js`
- Modify: `backend/package.json` (add pretest script)

**Steps:**

1. Create backend/scripts directory if it doesn't exist
2. Write check-node-version.js script:
   ```javascript
   const { execSync } = require('child_process');

   console.log('Checking native module compatibility...');

   try {
     // Attempt to load better-sqlite3
     require('better-sqlite3');
     console.log('✓ Native modules compatible with Node.js', process.version);
   } catch (error) {
     if (error.message.includes('NODE_MODULE_VERSION')) {
       console.error('\n❌ Native module version mismatch detected!\n');
       console.error('Your Node.js version has changed since modules were installed.\n');
       console.error('Current Node.js:', process.version);
       console.error('\nFix: Run the following command:');
       console.error('  cd backend && npm rebuild better-sqlite3\n');
       console.error('Or reinstall dependencies:');
       console.error('  cd backend && rm -rf node_modules && npm install\n');
       process.exit(1);
     }
     // Re-throw if not a version mismatch
     throw error;
   }
   ```
3. Add pretest script to backend/package.json:
   ```json
   "scripts": {
     "pretest": "node scripts/check-node-version.js"
   }
   ```
4. Test by intentionally causing mismatch (downgrade better-sqlite3 module version)
5. Verify helpful error message appears
6. Commit: `feat(backend): add native module version check`

**Validation:**
```bash
# Simulate mismatch by manually breaking better-sqlite3
cd backend
npm test
# Should show helpful error message and exit code 1

# Fix it
npm rebuild better-sqlite3
npm test
# Should pass with green checkmark
```

**Time Estimate:** 20 minutes

---

## Task 3: Create .nvmrc File

**Goal:** Standardize Node version across development team

**Files:**
- Create: `.nvmrc` (project root)

**Steps:**

1. Check current Node version in Dockerfile:
   ```bash
   grep "FROM node" backend/Dockerfile
   # Look for version number
   ```
2. Create .nvmrc in project root matching Dockerfile version:
   ```
   20
   ```
3. Test with nvm (if available):
   ```bash
   nvm use
   # Should switch to v20.x
   ```
4. Commit: `chore: add .nvmrc to standardize Node version`

**Validation:**
- File exists at project root
- Version matches Dockerfile (currently Node 20-alpine)
- `nvm use` works (if nvm installed)

**Time Estimate:** 5 minutes

---

## Task 4: Add Backend Development Documentation

**Goal:** Document requirements and troubleshooting for backend development

**Files:**
- Create: `backend/README.md`

**Steps:**

1. Create backend/README.md with sections:
   - Local Development Requirements
   - Setup Instructions
   - Running Tests
   - Troubleshooting Common Issues
2. Include Node version requirements
3. Document build tools needed for native modules
4. Add troubleshooting section for MODULE_VERSION errors
5. Include commands for rebuilding modules
6. Commit: `docs(backend): add development setup guide`

**Content:**
```markdown
# Backend Development Guide

## Requirements

- Node.js: v20.x (matches production Docker container)
- npm: v9.x or higher
- Build tools for compiling native modules

### Installing Build Tools

**Windows:**
```bash
npm install --global windows-build-tools
```

**macOS:**
```bash
xcode-select --install
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get install build-essential
```

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

### "NODE_MODULE_VERSION mismatch" Error

**Symptoms:**
```
Error: The module was compiled against a different Node.js version
```

**Cause:** Your Node.js version changed since dependencies were installed.

**Solution:**
```bash
cd backend
npm rebuild better-sqlite3
```

**Or reinstall all dependencies:**
```bash
cd backend
rm -rf node_modules
npm install
```

### Tests Failing After Node Upgrade

1. Check your Node version matches .nvmrc:
   ```bash
   node --version  # Should be v20.x
   ```

2. If using nvm, switch to correct version:
   ```bash
   nvm use
   ```

3. Rebuild native modules:
   ```bash
   npm rebuild
   ```

## Node Version Management

This project uses Node.js v20. We recommend using a version manager:

**nvm (macOS/Linux):**
```bash
nvm install 20
nvm use 20
```

**nvm-windows:**
```bash
nvm install 20
nvm use 20
```

**Volta:**
```bash
volta install node@20
```

The `.nvmrc` file at project root specifies the exact version.
```

**Validation:**
- README.md exists in backend/
- All sections are clear and actionable
- Commands are copy-pasteable
- Troubleshooting covers common issues

**Time Estimate:** 25 minutes

---

## Task 5: Update Root README

**Goal:** Link to backend development guide from main README

**Files:**
- Modify: `README.md` (project root)

**Steps:**

1. Read current README.md
2. Add "Development" section if it doesn't exist
3. Link to backend/README.md:
   ```markdown
   ## Development

   - [Backend Development Guide](backend/README.md)
   ```
4. Commit: `docs: link to backend development guide`

**Validation:**
- Link points to correct file
- Section is easy to find
- Markdown renders correctly

**Time Estimate:** 5 minutes

---

## Task 6: Immediate Fix for Current Issue

**Goal:** Fix the existing MODULE_VERSION error right now

**Files:**
- None (just running commands)

**Steps:**

1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Rebuild better-sqlite3 for current Node version:
   ```bash
   npm rebuild better-sqlite3
   ```
3. Verify tests pass:
   ```bash
   npm test
   ```
4. Document the fix in commit message

**Validation:**
```bash
cd backend
npm test
# All tests should pass (no MODULE_VERSION error)
```

**Time Estimate:** 2 minutes

---

## Task 7: Verification and Testing

**Goal:** Ensure solution works across different scenarios

**Test Scenarios:**

1. **Fresh Clone:**
   ```bash
   git clone <repo>
   cd backend
   npm install
   npm test
   # Should pass
   ```

2. **Node Version Switch:**
   ```bash
   nvm use 18
   cd backend
   npm install
   npm test
   # Should pass (postinstall rebuilds)

   nvm use 20
   npm test
   # Should still pass
   ```

3. **Intentional Break:**
   ```bash
   # Manually corrupt better-sqlite3
   cd backend
   npm test
   # Should show helpful error message

   npm rebuild better-sqlite3
   npm test
   # Should pass
   ```

**Validation:**
- All scenarios work as expected
- Error messages are helpful
- Recovery steps are clear

**Time Estimate:** 15 minutes

---

## Summary

**Total Estimated Time:** ~1.5 hours

**Tasks in Order:**
1. Add automated rebuild (15min) - Prevents the issue
2. Add version check script (20min) - Detects and guides
3. Create .nvmrc (5min) - Standardizes version
4. Add backend README (25min) - Documents solution
5. Update root README (5min) - Makes docs discoverable
6. Immediate fix (2min) - Solves current problem
7. Verification (15min) - Ensures robustness

**Parallelization Opportunities:**
- Tasks 3, 4, and 5 can be done in parallel (documentation)
- Tasks 1 and 2 should be sequential (testing depends on both)

**Dependencies:**
- Task 7 depends on all others (verification)
- All other tasks are independent

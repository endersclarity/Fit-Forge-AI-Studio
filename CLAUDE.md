<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

---

# Deployment URLs

**Production (Railway):** https://fit-forge-ai-studio-production-6b5b.up.railway.app/

**Local Development:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

# Development Environment with Hot Module Reload (HMR)

## ✨ Hot Reload Setup

The local development environment uses **Vite dev server** (frontend) and **nodemon** (backend) for instant hot reloading.

**You do NOT need to rebuild containers for code changes!**

### Quick Start

```bash
# Start development environment
docker-compose up -d

# Make changes to .tsx, .ts, .js files
# → Browser auto-refreshes instantly!
# → Backend auto-restarts on file changes!

# View logs (optional)
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop when done
docker-compose down
```

### How It Works

- **Frontend**: Mounts source files as volumes → Vite detects changes → Browser hot-reloads
- **Backend**: Mounts backend files as volumes → Nodemon detects changes → Server restarts
- **No rebuilds needed** for code changes - only when `package.json` dependencies change

### When to Rebuild

You ONLY need to rebuild if you:
- Change `package.json` dependencies
- Modify Dockerfiles
- Change build configuration

```bash
docker-compose down
docker-compose up -d --build
```

---

## 🚀 Production Deployment (Railway)

**Railway is completely separate and safe from local dev changes.**

- Railway uses `Dockerfile` (production build)
- Local dev uses `Dockerfile.dev` (development with HMR)
- Railway does NOT use `docker-compose.yml`
- Changes only deploy when you push to GitHub

**Workflow:**
1. ✏️ Edit code locally → See changes instantly
2. ✅ Test locally with hot reload
3. 📤 Commit & push to GitHub
4. 🚀 Railway auto-deploys production build

---

## ⚠️ Port Configuration - NEVER CHANGE

**MANDATORY RULES:**
1. Frontend MUST ALWAYS run on port **3000**
2. Backend MUST ALWAYS run on port **3001**
3. NEVER let Vite or any process run on different ports (3002, 3003, 3005, etc.)
4. If ports are busy, containers are still running - STOP THEM FIRST with `docker-compose down`

---

# Serena MCP: Semantic Code Intelligence (ALWAYS CONSIDER)

**Before using Read, Grep, or Edit on TypeScript/JavaScript code, ALWAYS consider Serena alternatives:**

## Tool Selection Rules (Validated via A/B Testing)

| Task | Use Serena Instead | Savings |
|------|-------------------|---------|
| Understand file structure | `get_symbols_overview` instead of Read | 4x token savings |
| Find function usage | `find_referencing_symbols` instead of Grep | No false positives |
| Get previous analysis | `read_memory` instead of re-analyzing | 100x faster |
| Trace dependencies | `find_referencing_symbols` instead of manual grep | Semantic context |
| Rename identifiers | `rename_symbol` instead of multiple Edits | Auto-updates all refs |

## When Serena Wins (Always Use)
- Understanding code symbols → `mcp__serena__get_symbols_overview`
- Tracing hook/function consumers → `mcp__serena__find_referencing_symbols`
- Loading previous context → `mcp__serena__read_memory`
- Forced reflection → `mcp__serena__think_about_*` tools
- Persisting decisions → `mcp__serena__write_memory`

## When Claude Code Wins (Use These)
- CSS class patterns → Grep
- Config/JSON files → Read
- String literal changes → Edit
- Text patterns (not symbols) → Grep

## Memory First Pattern
```
1. list_memories() → Check what context exists
2. read_memory("relevant_topic") → Load prior analysis instantly
3. Only re-analyze if memory doesn't exist
```

**See `.claude/skills/serena-mastery/SKILL.md` for comprehensive patterns and examples.**
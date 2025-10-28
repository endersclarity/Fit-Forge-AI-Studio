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

# User Feedback Process

## USER_FEEDBACK.md - Experience Log

This project maintains a living document (`USER_FEEDBACK.md`) that captures raw user experiences and friction points during real-world usage. This log serves as the "discovery phase" that feeds into formal OpenSpec proposals.

**Workflow:**
1. **Capture** - Record immediate reactions while using the app (gut feelings, friction, delight)
2. **Pattern Recognition** - Review periodically to identify recurring themes
3. **Proposal Creation** - When patterns emerge, create OpenSpec proposals to address them
4. **Implementation** - Follow standard OpenSpec process

**Key Principles:**
- Raw reactions before rationalization
- Vague feelings are valid data
- Focus on problems, not solutions
- Chronological to show evolution of understanding
- Low friction to encourage consistent use

See `USER_FEEDBACK.md` for the active log and usage guidelines.

---

# CRITICAL: Container/Server Restart Protocol

## ⚠️ NEVER CHANGE PORTS - ALWAYS USE 3000 AND 3001

**MANDATORY RULES:**
1. Frontend MUST ALWAYS run on port **3000**
2. Backend MUST ALWAYS run on port **3001**
3. NEVER let Vite or any process run on different ports (3002, 3003, 3005, etc.)
4. If ports are busy, it means containers/processes are still running - STOP THEM FIRST

## Correct Restart Procedure:

**Step 1: Stop Everything**
```bash
# Kill any background shells
# Then stop Docker containers
docker-compose down
```

**Step 2: Restart Containers**
```bash
docker-compose up -d
```

**NEVER:**
- ❌ Start npm manually without stopping Docker first
- ❌ Let Vite auto-select different ports
- ❌ Run multiple instances on different ports
- ❌ Change port configuration

**ALWAYS:**
- ✅ Stop Docker containers first with `docker-compose down`
- ✅ Restart with `docker-compose up -d`
- ✅ Verify services are on ports 3000 and 3001
- ✅ Kill processes if ports conflict before restarting
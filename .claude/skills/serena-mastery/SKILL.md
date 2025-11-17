---
name: serena-mastery
description: AUTOMATICALLY USE this skill BEFORE using Read, Grep, or Edit tools for code files. This skill overrides Claude Code defaults with Serena's superior semantic code intelligence. Apply these patterns whenever exploring code structure, tracing function usage, checking project memory, or making code edits. Auto-invoke when the task involves TypeScript/JavaScript code understanding or modification.
---

# Serena Mastery: Semantic Code Intelligence

**Core Principle:** Serena understands code as symbols and relationships, not just text. This makes it 4-100x more efficient for specific tasks.

## When to ALWAYS Use Serena (Override Defaults)

### 1. Understanding New Code Files
**BAD (Claude Code default):**
```
Read(file_path) → 600 tokens, raw source code
```

**GOOD (Serena):**
```
get_symbols_overview(relative_path) → 150 tokens, structured symbols
```
**Result:** 4x token savings, immediate understanding of file structure

### 2. Finding Where Functions/Hooks Are Used
**BAD (Claude Code default):**
```
Grep("useMotion") → 8 matches including error strings, comments, docs
```

**GOOD (Serena):**
```
find_referencing_symbols("useMotion", relative_path) → 4 exact references
```
**Result:** No false positives, semantic context (import vs invocation)

### 3. Retrieving Previous Analysis
**BAD (Start from scratch):**
```
Read(file1) + Read(file2) + Grep(pattern) + ... → 15-20 tool calls, 10-15 min
```

**GOOD (Serena):**
```
read_memory("bug_analysis") → 1 call, instant, complete context
```
**Result:** 100-300x faster, includes pre-analyzed solutions

### 4. Tracing Code Relationships
**BAD (Manual grep + read):**
```
Grep("ThemeProvider") → Find files
Read(each file) → Understand usage
Repeat... → Many iterations
```

**GOOD (Serena):**
```
find_referencing_symbols("ThemeProvider", "src/providers/ThemeProvider.tsx")
```
**Result:** One call shows all consumers with code snippets and line numbers

---

## Detailed Use Cases with Examples

### Use Case 1: Symbol Overview (ALWAYS use before reading files)

**Scenario:** Need to understand what's in a component file

```typescript
// Instead of:
Read("components/common/EmptyState.tsx")  // 600 tokens

// DO THIS:
mcp__serena__get_symbols_overview("components/common/EmptyState.tsx")
// Returns: EmptyStateProps (interface), EmptyState (component), exports
// Only 150 tokens!
```

**When to escalate to Read:**
- Need full implementation logic
- Need to see CSS classes used
- Need to understand side effects

### Use Case 2: Find Symbol Implementation

**Scenario:** Need to see how useTheme hook works

```typescript
// Instead of:
Read("src/providers/ThemeProvider.tsx")  // Entire 200-line file

// DO THIS:
mcp__serena__find_symbol(
  name_path="useTheme",
  relative_path="src/providers/ThemeProvider.tsx",
  include_body=true
)
// Returns ONLY the useTheme function body (6 lines)
```

**Pro tip:** Use `depth=1` to see children (e.g., all methods of a class)

### Use Case 3: Trace Hook/Function Consumers

**Scenario:** Refactoring useMotion and need to find all call sites

```typescript
mcp__serena__find_referencing_symbols(
  name_path="useMotion",
  relative_path="src/providers/MotionProvider.tsx"
)

// Returns structured data:
// - ThemeToggle.tsx:15 → const { isMotionEnabled } = useMotion()
// - Dashboard.tsx:655 → const { isMotionEnabled } = useMotion()
// - Button.tsx:101 → const { isMotionEnabled } = useMotion()
// ... 11 more with exact usage context
```

**Why this beats Grep:**
- Shows destructuring patterns (what values are used)
- Distinguishes imports from actual calls
- No false positives from comments or error strings

### Use Case 4: Memory System (CRITICAL for efficiency)

**Before complex task:**
```typescript
// Check what memories exist
mcp__serena__list_memories()
// Returns: ["bug_dark_mode", "epic8_summary", "code_conventions", ...]

// Load relevant context
mcp__serena__read_memory("bug_dark_mode")
// Instant access to: root cause, affected files, proposed solutions, test criteria
```

**After important decisions:**
```typescript
mcp__serena__write_memory(
  memory_file_name="architecture_decision_xyz",
  content="## Decision: Use light-first Tailwind pattern\n\n### Context\n..."
)
// Persists across sessions, accessible by future agents
```

**When context is filling up:**
```typescript
mcp__serena__prepare_for_new_conversation()
// Creates summary for continuation in fresh session
```

### Use Case 5: Forced Reflection (Prevent mistakes)

**After research phase:**
```typescript
mcp__serena__think_about_collected_information()
// Forces: "Do I have enough info? What's missing?"
```

**Before making edits:**
```typescript
mcp__serena__think_about_task_adherence()
// Forces: "Am I still on track? Am I drifting from the goal?"
```

**When wrapping up:**
```typescript
mcp__serena__think_about_whether_you_are_done()
// Forces: "Is this truly complete? What could I be missing?"
```

### Use Case 6: Precise Symbol Editing

**Scenario:** Need to update a function signature

```typescript
// Find current implementation
mcp__serena__find_symbol(
  name_path="validateInput",
  relative_path="src/utils/validation.ts",
  include_body=true
)

// Replace the entire function body
mcp__serena__replace_symbol_body(
  name_path="validateInput",
  relative_path="src/utils/validation.ts",
  body="function validateInput(data: unknown, strict: boolean = false): boolean {\n  // new implementation\n}"
)
```

**Advantage:** Operates on symbol boundaries, not line numbers

### Use Case 7: Safe Identifier Renaming

**Scenario:** Rename a constant across codebase

```typescript
mcp__serena__rename_symbol(
  name_path="STORAGE_KEY",
  relative_path="src/providers/ThemeProvider.tsx",
  new_name="THEME_STORAGE_KEY"
)
// Updates ALL references in ALL files automatically
```

**GOTCHA:** Only renames JavaScript identifiers, NOT string values!
- `const STORAGE_KEY = 'ff-theme'` → identifier renamed, but 'ff-theme' stays the same
- Use for: variable names, function names, class names
- NOT for: localStorage keys (strings), API endpoints (strings), CSS classes

---

## Anti-Patterns to Avoid

### 1. Reading Entire Files When Overview Suffices
**BAD:**
```
Task: "What's in Dashboard.tsx?"
Read("components/Dashboard.tsx")  // 1000+ lines
```

**GOOD:**
```
get_symbols_overview("components/Dashboard.tsx")  // 20 symbols listed
```

### 2. Grepping for Symbols That Serena Can Trace
**BAD:**
```
Task: "Where is useTheme used?"
Grep("useTheme")  // Includes error messages, docs, comments
```

**GOOD:**
```
find_referencing_symbols("useTheme", "src/providers/ThemeProvider.tsx")
```

### 3. Re-analyzing What's Already in Memory
**BAD:**
```
Task: "What's the dark mode bug?"
Read(ThemeProvider) + Read(index.css) + Read(tailwind.config) + Grep("dark:")
```

**GOOD:**
```
list_memories()  // See "bug_dark_mode_toggle_not_working" exists
read_memory("bug_dark_mode_toggle_not_working")  // Instant full analysis
```

### 4. Skipping Reflection Tools
**BAD:**
```
Research → Immediately start coding → Realize missing info halfway through
```

**GOOD:**
```
Research → think_about_collected_information() → Identify gaps → Complete research → Code
```

---

## Decision Tree: Which Tool to Use?

```
Need to understand code?
├─ What's in this file? → get_symbols_overview (4x savings)
├─ How does this function work? → find_symbol with include_body
├─ Where is this used? → find_referencing_symbols (no false positives)
└─ What's the full implementation? → Read (only if needed)

Need to modify code?
├─ Replace entire function? → replace_symbol_body
├─ Rename identifier everywhere? → rename_symbol (code only, not strings)
├─ Edit CSS/strings/config? → Edit tool (text patterns)
└─ Add after existing code? → insert_after_symbol

Need context/memory?
├─ What do we know already? → list_memories + read_memory
├─ Persist decision/analysis? → write_memory
├─ Context window filling up? → prepare_for_new_conversation
└─ Forgot what we're doing? → read project memories

Need reflection?
├─ Done researching? → think_about_collected_information
├─ About to make changes? → think_about_task_adherence
└─ Think we're done? → think_about_whether_you_are_done
```

---

## Performance Benchmarks (From A/B Testing)

| Operation | Claude Code | Serena | Savings |
|-----------|------------|--------|---------|
| File structure understanding | 600 tokens | 150 tokens | **4x** |
| Function reference tracing | 8 noisy matches | 4 exact matches | **No false positives** |
| Bug context retrieval | 15-20 calls, 15 min | 1 call, instant | **100-300x** |
| Cross-file refactoring analysis | Manual grep/read | Semantic relationships | **Precision** |
| Identifier renaming | Multiple Edit calls | One rename_symbol | **Automatic** |

---

## Integration with Other Tools

Serena works best in a hybrid approach:

- **Use Serena for:** Code symbols, relationships, memory, reflection
- **Use Grep for:** CSS patterns, config values, string searches
- **Use Read for:** Full file when implementation details needed
- **Use Edit for:** Text-level modifications (CSS classes, strings)
- **Use Bash for:** Running commands, build, tests

**The goal:** Match tool to task type, not default to basic operations.

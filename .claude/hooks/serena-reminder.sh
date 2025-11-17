#!/bin/bash
# Serena Tools Reminder Hook
# Triggers before Read, Grep, or Edit to suggest Serena alternatives

# Read the input JSON from stdin
input=$(cat)

# Extract tool name
tool_name=$(echo "$input" | jq -r '.tool_name // empty')

# Build reminder based on tool
case "$tool_name" in
  "Read")
    reminder="SERENA ALTERNATIVE: Before reading this file, consider:
- get_symbols_overview() for file structure (4x token savings)
- find_symbol() with include_body for specific functions
- read_memory() if this analysis was done before (100x faster)
Only use Read if you need full implementation details or non-code files."
    ;;
  "Grep")
    reminder="SERENA ALTERNATIVE: Before grepping, consider:
- find_referencing_symbols() for function/hook usage (no false positives)
- find_symbol() with substring_matching for symbol discovery
- read_memory() if this pattern was searched before
Only use Grep for CSS patterns, config values, or string literals."
    ;;
  "Edit")
    reminder="SERENA ALTERNATIVE: Before editing, consider:
- replace_symbol_body() for entire function replacements
- rename_symbol() for identifier renaming (auto-updates all refs)
- insert_after_symbol() or insert_before_symbol() for additions
Only use Edit for CSS classes, string literals, or config changes."
    ;;
  *)
    reminder=""
    ;;
esac

# Output JSON with additional context if we have a reminder
if [ -n "$reminder" ]; then
  jq -n --arg reminder "$reminder" '{
    "additionalContext": $reminder
  }'
else
  echo '{}'
fi

exit 0

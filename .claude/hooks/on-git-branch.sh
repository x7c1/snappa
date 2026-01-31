#!/bin/bash
# Hook: Provide branch naming rules before creating a new branch

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Check if this is a branch creation command
if echo "$COMMAND" | grep -qE 'git (checkout -b|branch|switch -c)'; then
  cat << 'EOF'
## Branch Naming Rules

Choose the appropriate format based on your situation:

1. **Exploratory work** (no specific task yet):
   - Format: `YYYY-MM-DD_HHMM`
   - Example: `2026-01-31_1400`

2. **Plan-based work** (from plan.md):
   - Format: `plan/{year}-{number}-{description}`
     - `{year}`: 4-digit year (e.g., 2026)
     - `{number}`: sequential number (e.g., 1, 2, 12)
     - `{description}`: kebab-case description
   - Examples:
     - `plan/2026-1-add-dark-mode`
     - `plan/2026-12-refactor-auth`
   - Plan location: `docs/plans/{year}/{number}-{description}/plan.md`

EOF
  echo "Current date/time for exploratory branch: $(date '+%Y-%m-%d_%H%M')"
fi

exit 0

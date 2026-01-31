#!/bin/bash

# PreToolUse hook for git commit
# - Validates commit message format
# - Runs auto-formatting on staged files
# - Provides commit message rules

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only process git commit commands
if ! echo "$COMMAND" | grep -qE '^git commit'; then
    exit 0
fi

# Extract commit message from command
COMMIT_MSG=""
if echo "$COMMAND" | grep -qE -- '-m\s'; then
    # Extract message after -m flag
    COMMIT_MSG=$(echo "$COMMAND" | sed -E 's/.*-m\s*["\x27]([^"\x27]*)["\x27].*/\1/' || true)
fi

# Run formatting on staged files
echo "## Auto-formatting staged files"
bash "$SCRIPT_DIR/format-staged-files.sh" 2>/dev/null || true
echo ""

# Validate commit message if present
if [[ -n "$COMMIT_MSG" ]]; then
    # Check for newlines
    if [[ "$COMMIT_MSG" == *$'\n'* ]]; then
        echo "ERROR: Commit message must be a single line" >&2
        exit 2
    fi

    # Check for forbidden patterns
    FORBIDDEN_PATTERNS=(
        "Files Added"
        "Files Modified"
        "Files Changed"
        "Generated with"
        "Co-Authored-By"
    )

    for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
        if echo "$COMMIT_MSG" | grep -qi "$pattern"; then
            echo "ERROR: Commit message contains forbidden pattern: '$pattern'" >&2
            exit 2
        fi
    done
fi

# Provide commit message rules
cat << 'EOF'
## Commit Message Rules

Format: `type(scope): description`

Types: feat, fix, docs, refactor, test, chore
- Keep message on a single line
- Be concise but descriptive
- Use English only
EOF

exit 0

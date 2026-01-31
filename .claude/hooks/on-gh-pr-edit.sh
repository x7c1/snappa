#!/bin/bash

# PreToolUse hook for gh pr edit
# Provides PR update rules

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/pr-rules.sh"

main() {
    local input command

    input=$(cat)
    command=$(echo "$input" | jq -r '.tool_input.command // empty')

    # Only process gh pr edit commands
    if ! echo "$command" | grep -qE '^gh pr edit'; then
        exit 0
    fi

    print_update_rules

    exit 0
}

print_update_rules() {
    cat << 'EOF'
## PR Update Rules

### IMPORTANT: Handle Checked Items Carefully
Before updating, ALWAYS read the current PR description first:
```
gh pr view <number> --json body -q '.body'
```

- `[x]` (checked): Preserve as-is, unless the content changed in recent commits
- If content changed: Update the text AND uncheck it (`[x]` → `[ ]`) for human re-verification
- Only update if there are actual changes to add

EOF
    print_full_template
    echo ""
    print_labels_rules
}

main

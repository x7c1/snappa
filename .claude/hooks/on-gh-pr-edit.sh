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
    echo "## PR Update Rules"
    echo ""
    print_full_template
    echo ""
    print_labels_rules
}

main

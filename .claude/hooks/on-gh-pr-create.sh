#!/bin/bash

# PreToolUse hook for gh pr create
# Provides PR creation rules based on branch type

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/pr-rules.sh"

main() {
    local input command branch_name

    input=$(cat)
    command=$(echo "$input" | jq -r '.tool_input.command // empty')

    # Only process gh pr create commands
    if ! echo "$command" | grep -qE '^gh pr create'; then
        exit 0
    fi

    branch_name=$(git branch --show-current 2>/dev/null || echo "")

    if is_exploratory_branch "$branch_name"; then
        print_exploratory_rules
    else
        print_standard_create_rules
    fi

    exit 0
}

is_exploratory_branch() {
    local branch="$1"
    # Match YYYY-MM-DD_HHMM format
    [[ "$branch" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{4}$ ]]
}

get_first_commit_date() {
    git log main..HEAD --reverse --format="%ad" --date=format:"%Y-%m-%d" 2>/dev/null | head -n 1
}

print_exploratory_rules() {
    local first_date
    first_date=$(get_first_commit_date)

    cat << EOF
## PR Creation Rules (Exploratory Branch)

This is an exploratory branch. Create a minimal draft PR:

**Title**: \`since ${first_date:-YYYY-MM-DD}\`
**Body**: empty
**Options**: --draft

Example:
\`\`\`
gh pr create --title "since ${first_date:-YYYY-MM-DD}" --body "" --draft
\`\`\`
EOF
}

print_standard_create_rules() {
    echo "## PR Creation Rules (Standard Branch)"
    echo ""
    print_full_template
    echo ""
    echo "### Options"
    echo "Always use: --draft"
}

main

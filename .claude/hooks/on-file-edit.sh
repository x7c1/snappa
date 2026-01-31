#!/bin/bash

# PreToolUse hook for Edit|Write
# Blocks edits to protected files

set -euo pipefail

main() {
    local input tool_name file_path

    input=$(cat)
    tool_name=$(echo "$input" | jq -r '.tool_name // empty')

    # Only process Edit and Write tools
    if [[ "$tool_name" != "Edit" && "$tool_name" != "Write" ]]; then
        exit 0
    fi

    file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

    if is_protected_file "$file_path"; then
        echo "BLOCKED: '$file_path' is a protected file" >&2
        exit 2
    fi

    exit 0
}

is_protected_file() {
    local file="$1"
    local filename
    filename=$(basename "$file")

    # Protected file patterns
    local protected_patterns=(
        ".env"
        ".env.local"
        ".env.production"
        "credentials.json"
        "secrets.json"
        "*.pem"
        "*.key"
        "id_rsa"
        "id_ed25519"
        "package-lock.json"
        "yarn.lock"
        "pnpm-lock.yaml"
        "Cargo.lock"
        "Gemfile.lock"
        "poetry.lock"
        "composer.lock"
    )

    for pattern in "${protected_patterns[@]}"; do
        if [[ "$filename" == $pattern ]]; then
            return 0
        fi
    done

    # Protected directories
    if [[ "$file" == *"/.git/"* ]]; then
        return 0
    fi

    return 1
}

main

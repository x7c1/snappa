#!/bin/bash

# Format staged files before commit
# - Remove trailing whitespace (except .md files)
# - Ensure files end with newline

set -euo pipefail

main() {
    local staged_files
    staged_files=$(get_staged_files)

    [[ -z "$staged_files" ]] && exit 0

    local modified=false

    while IFS= read -r file; do
        [[ -z "$file" || ! -f "$file" ]] && continue

        local before_hash after_hash
        before_hash=$(md5sum "$file" 2>/dev/null | cut -d' ' -f1)

        remove_trailing_whitespace "$file"
        ensure_newline "$file"

        after_hash=$(md5sum "$file" 2>/dev/null | cut -d' ' -f1)

        if [[ "$before_hash" != "$after_hash" ]]; then
            git add "$file"
            modified=true
        fi
    done <<< "$staged_files"

    $modified && echo "  Re-staged formatted files"
}

get_staged_files() {
    git diff --cached --name-only --diff-filter=AMR | \
        grep -v "/node_modules/" | \
        grep -v "/.git/" || true
}

is_text_file() {
    local file="$1"
    [[ -f "$file" ]] && file "$file" | grep -q "text"
}

remove_trailing_whitespace() {
    local file="$1"
    # Skip markdown files
    [[ "$file" == *.md ]] && return 0
    is_text_file "$file" || return 0
    sed -i 's/[[:space:]]*$//' "$file"
    echo "  Removed trailing whitespace: $file"
}

ensure_newline() {
    local file="$1"
    is_text_file "$file" || return 0
    [[ ! -s "$file" ]] && return 0
    if [[ -n "$(tail -c1 "$file")" ]]; then
        echo >> "$file"
        echo "  Added newline: $file"
    fi
}

main

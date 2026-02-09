#!/usr/bin/env bash
# Shared changelog generation using conventional commit categorization
#
# Usage:
#   source generate-changelog.sh
#   changelog=$(generate_changelog "$last_tag" "$repo_url")
#
# Or standalone:
#   bash generate-changelog.sh [last_tag] <repo_url>

generate_changelog() {
    local last_tag="$1"
    local repo_url="$2"
    local log

    if [ -n "$last_tag" ]; then
        log=$(git log "${last_tag}..HEAD" --oneline --no-merges)
    else
        log=$(git log --oneline --no-merges -20)
    fi

    format_changelog "$log" "$repo_url"
}

format_changelog() {
    local log="$1"
    local repo_url="$2"
    local -A sections
    local -a section_order=(feat fix refactor docs chore other)
    local -A section_titles=(
        [feat]="Features"
        [fix]="Bug Fixes"
        [refactor]="Refactoring"
        [docs]="Documentation"
        [chore]="Chores"
        [other]="Other Changes"
    )

    # Initialize empty sections
    for key in "${section_order[@]}"; do
        sections[$key]=""
    done

    # Categorize each commit
    while IFS= read -r line; do
        [ -z "$line" ] && continue

        # Remove commit hash prefix
        local message="${line#* }"
        # Convert PR references to links
        message=$(echo "$message" | sed "s|#\([0-9]\+\)|[#\1](${repo_url}/pull/\1)|g")

        # Extract type from conventional commit format (type: or type(scope):)
        local type=""
        if [[ "$message" =~ ^([a-z]+)\(.*\): ]]; then
            type="${BASH_REMATCH[1]}"
        elif [[ "$message" =~ ^([a-z]+): ]]; then
            type="${BASH_REMATCH[1]}"
        fi

        case "$type" in
            feat|fix|refactor|docs|chore)
                sections[$type]+="- ${message}"$'\n'
                ;;
            *)
                sections[other]+="- ${message}"$'\n'
                ;;
        esac
    done <<< "$log"

    # Output sections in order
    local output=""
    for key in "${section_order[@]}"; do
        if [ -n "${sections[$key]}" ]; then
            output+="## ${section_titles[$key]}"$'\n\n'
            output+="${sections[$key]}"$'\n'
        fi
    done

    echo "$output"
}

# Allow standalone execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    set -euo pipefail
    last_tag="${1:-}"
    repo_url="${2:?Usage: generate-changelog.sh [last_tag] <repo_url>}"
    generate_changelog "$last_tag" "$repo_url"
fi

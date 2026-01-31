#!/bin/bash

# Shared PR rules for create and update hooks

print_title_rules() {
    cat << 'EOF'
### Title Format
```
<type>(<scope>): <subject>
```

**Types**: feat, fix, refactor, docs, chore
**Constraints**:
- Max 60 characters
- Lowercase, imperative mood
- No period at end
EOF
}

print_body_rules() {
    cat << 'EOF'
### Body Format
```markdown
## New Features
- [ ] Feature description

## Bug Fixes
- [ ] Bug fix description

## Refactoring
- Refactoring description

## Breaking Changes
- Breaking change description
```

**Rules**:
- Use checkboxes (`- [ ]`) for New Features and Bug Fixes
- Use regular bullets (`-`) for Refactoring and Breaking Changes
- Skip sections with no items
- Keep descriptions concise
EOF
}

print_forbidden_patterns() {
    cat << 'EOF'
### Forbidden Patterns
- "Files Added", "Files Modified", "Files Changed"
- "Generated with"
EOF
}

print_labels_rules() {
    cat << 'EOF'
### Labels
- `enhancement` - New features or improvements
- `bug` - Bug fixes
- `documentation` - Documentation changes
EOF
}

print_full_template() {
    print_title_rules
    echo ""
    print_body_rules
    echo ""
    print_forbidden_patterns
}

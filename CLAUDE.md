# Claude AI Guidelines

## Documentation

**DRY Principle**: Write each piece of information in ONE place only.

- **README.md**: Overview and command reference only
- **docs/guides/**: Detailed explanations

Never duplicate content across files.

For documentation directory roles and rules, see `docs/guides/10-documentation-structure.md`.

### Markdown Files (100+ lines)
- Always include an Overview section at the beginning
- The Overview should summarize the document's purpose and key points
- This is critical because automated tools may read only the beginning of .md files
- Without an Overview at the top, tools cannot understand the document's content

## Code Quality

After making code changes, always run:

```bash
npm run build && npm run check && npm run test:run
```

Fix any issues before considering the task complete.

## Code Rules

Language-specific coding rules are in `.claude/rules/`.


---
paths:
  - "src/**/*.ts"
---

## General

Avoid comments that merely restate what the code does. Comment WHY, not WHAT.
- Explain rationale, constraints, gotchas, or non-obvious behavior
- Don't add comments that duplicate the code in natural language
- Self-documenting code needs no comment

## Interface Fields

Use `/** */` (JSDoc) comments for interface and type fields, not trailing `//` comments.
Insert a blank line between fields when a field has a JSDoc comment.

Nullable fields (`| null`) must always have a JSDoc comment explaining when the value is null.

Good:
```typescript
interface Example {
  /** null when not yet initialized */
  value: string | null;

  /** Timestamp in milliseconds */
  createdAt: number;
}
```

Bad:
```typescript
interface Example {
  value: string | null; // null when not yet initialized
  createdAt: number; // Timestamp in milliseconds
}
```

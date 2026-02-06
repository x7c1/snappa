# Add E2E/UI Testing

## Overview

No automated testing of actual user workflows. Manual testing required for each release.

## Priority

Low

## Effort

High

## Category

Quality

## Problem

Core user flows are only tested manually:
- Drag window to edge → Panel appears → Click layout → Window snaps
- Keyboard shortcut → Panel appears → Navigate → Apply layout

## Research Done

- `docs/plans/2026/9-demo-gif-generation/ui-automation-research.md` explored UI automation options

## Proposed Actions

1. Evaluate GNOME testing frameworks (dogtail, ldtp)
2. Create smoke test for core flow
3. Integrate with CI (may require VM/container with GNOME session)

## Complexity

High - requires GNOME Shell session for testing, complex CI setup.

## Decision

- [ ] Accept
- [ ] Reject
- [x] Defer

**Notes**: Would be valuable if feasible, but need to research approach first. Unknown whether GNOME Shell extension E2E testing is practical. Prerequisite: investigate testing frameworks and CI setup options before committing.

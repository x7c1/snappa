# Preset Wide/Standard Split

## Overview

Split preset SpaceCollections into two categories based on monitor aspect ratio: wide (ultrawide monitors) and standard. This provides optimized default layouts for different monitor types.

## Background

Currently, presets are generated based on monitor count only (e.g., "Single Monitor", "Dual Monitor"). The existing layout configurations were designed for ultrawide monitors (5120x2160). Standard monitors (16:9) would benefit from different layout configurations optimized for their aspect ratio.

## Requirements

### Wide Monitor Definition
- Aspect ratio >= 21:9 (approximately 2.33:1)
- Examples: 2560x1080, 3440x1440, 5120x2160

### Preset Naming Convention
- Wide: "{N} Wide Monitor" / "{N} Wide Monitors" (e.g., "Single Wide Monitor", "Dual Wide Monitors")
- Standard: "{N} Monitor" / "{N} Monitors" (e.g., "Single Monitor", "Dual Monitors")

### Preset Generation Rules
- Generate presets for both wide and standard variants for each monitor count
- At minimum, always have:
  - "Single Monitor" (standard)
  - "Single Wide Monitor" (wide)

### Layout Differences
- **Wide monitors** (existing): Current layout groups (vertical 2-split, vertical 3-split, vertical 3-split wide center, grid 4x2, full screen)
- **Standard monitors** (new): Simpler splits optimized for 16:9 (e.g., vertical 2-split, vertical 3-split, full screen)

## Implementation Plan

### Phase 1: Wide Monitor Detection
- Add utility function to determine if a monitor is wide based on aspect ratio
- Threshold: width/height >= 21/9 (≈ 2.33)

### Phase 2: Standard Monitor Layout Configuration
- Define layout groups for standard monitors
- Simpler configurations than wide monitors

### Phase 3: Preset Generation Update
- Rename existing presets to include "Wide" suffix
- Add new standard monitor presets
- Modify `ensurePresetForCurrentMonitors()` to generate both wide and standard presets

### Phase 4: Sample JSON Files
- Example files in `docs/examples/`:
  - `single-wide-monitor.json` (existing)
  - `dual-wide-monitors.json` (existing)
  - `single-standard-monitor.json` (new)
  - `dual-standard-monitors.json` (new)

## Out of Scope

- Automatic detection of current monitor type for preset selection
- Custom aspect ratio thresholds in settings

## Timeline

- Phase 1: 1 point
- Phase 2: 2 points
- Phase 3: 2 points
- Phase 4: 1 point
- **Total: 6 points**

## Notes

This change also ensures at least two presets always exist, which avoids a GTK4 rendering issue where a single radio button appears as a checkbox (see `adr.md` for details).


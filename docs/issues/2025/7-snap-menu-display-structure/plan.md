# Snap Menu Display Structure Refactoring

## Overview

Refactor the SnapMenu rendering structure to create a more hierarchical and maintainable layout system. The new structure will separate display representation from layout groups, enabling better organization and future multi-display support.

## Current Situation

The current `SnapMenu` implementation (src/snap/snap-menu.ts) uses a flat structure with `FixedLayout`:

```
container (St.Widget)
├── groupContainer × 3 (manually positioned)
│   └── layout buttons (St.Button)
└── footer (St.Label)
```

**Current Issues:**
- All elements use absolute positioning with manual Y-coordinate calculation
- Layout groups are directly placed in the container
- No visual separation between the concept of "display" and "layout groups"
- Difficult to extend for multi-display scenarios

## Goals

Transform the structure to:

```
container (St.BoxLayout - vertical)
├── displays (St.BoxLayout - horizontal)
│   └── miniatureDisplay (St.Widget) × N
│       ├── background with light black color
│       └── layout buttons (St.Button) - from all layout groups
└── footer (St.Label)
```

**Key Requirements:**
- Container has vertical layout: displays on top, footer on bottom
- Displays container can hold multiple miniature displays (initial: 1 display)
- Miniature display has light black background color
- Miniature display aspect ratio matches the user's actual display aspect ratio
- **Layout groups are logical groupings only** - no visual container is rendered
- All layout buttons from all groups are placed directly inside the miniature display
- Maintain existing interfaces: `SnapLayout`, `SnapLayoutGroup`
- Preserve all existing functionality: hover effects, click events, auto-hide behavior

## Implementation Plan

### Phase 1: Analysis
- Analyze current `SnapLayout` and `SnapLayoutGroup` interfaces to confirm no changes needed
- Analyze existing hover, click, and auto-hide implementations to understand dependencies
- Document current size calculation logic for reference

### Phase 2: Create New Structure Components
- Create `_createDisplaysContainer()` method
  - Returns St.BoxLayout with horizontal layout
  - Initially contains single miniature display
- Create `_createMiniatureDisplay()` method
  - Returns St.Widget with light black background
  - Calculates size based on screen aspect ratio
  - Uses FixedLayout for internal positioning of buttons
  - Accepts all layout buttons from all groups
- Remove `_createGroupContainer()` method
  - Layout groups no longer have visual containers
  - Buttons from all groups are placed directly in miniature display
- Update `_createLayoutButtonForGroup()` method
  - Rename to `_createLayoutButton()` (no longer group-specific)
  - Calculate button position relative to miniature display size
  - Maintain existing hover and click logic

### Phase 3: Refactor Main Container
- Change container from St.Widget (FixedLayout) to St.BoxLayout (vertical)
- Replace manual positioning logic with BoxLayout-based structure
- Update size calculations to account for new hierarchy
  - Miniature display size based on screen aspect ratio
  - Container size based on displays + footer
- Position displays container and footer using BoxLayout
- Iterate through all layout groups and create all buttons
  - Add all buttons directly to miniature display (no group containers)

### Phase 4: Update Position and Layout Detection
- Update `updatePosition()` if needed for new structure
- Update `getLayoutAtPosition()` to account for miniature display offset
  - Transform coordinates from screen space to miniature display space
- Test coordinate transformation with existing layout detection logic

### Phase 5: Testing and Validation
- Verify all existing functionality works:
  - Menu shows at correct position
  - Layout buttons respond to hover
  - Click events trigger layout selection
  - Auto-hide works when cursor leaves
  - Background click closes menu
- Verify visual appearance:
  - Miniature display has correct aspect ratio
  - Background color is visible
  - Layout groups are properly positioned within miniature display
  - Footer appears below displays

### Phase 6: Code Quality
- Run `npm run build && npm run check`
- Fix any type errors or linting issues
- Ensure code follows existing patterns

## Technical Considerations

### Coordinate Transformation
With the new structure, coordinates need transformation:
- Screen coordinates (from cursor) → Container coordinates → Displays coordinates → Miniature display coordinates → Layout button coordinates
- `getLayoutAtPosition()` must account for all these offsets
- **Action Required**: Check usage of `getLayoutAtPosition()` in codebase before refactoring to understand all callers

### Size Calculations
Current approach:
```typescript
const groupWidth = 300;
const groupHeight = groupWidth * aspectRatio;
```

New approach:
```typescript
const miniatureDisplayWidth = 300; // Fixed value (confirmed)
const miniatureDisplayHeight = miniatureDisplayWidth * aspectRatio;

// Layout groups no longer have containers
// All buttons are sized relative to miniature display dimensions
```

### Background Color
**Confirmed value**: Use `rgba(30, 30, 30, 0.8)` for miniature display background

### Layout Group to Miniature Display Relationship
**Important**: Each layout group has a 1:1 relationship with a specific region within the miniature display:
- Each layout group is positioned in its corresponding area of the miniature display (e.g., left half, right half, center)
- Visual separation between groups occurs naturally through their spatial positioning
- Groups do not need separate container elements - they are logical groupings only

### Layout Manager Changes
- Container: Change from `FixedLayout` to `BoxLayout` with vertical orientation
- Displays: New `BoxLayout` with horizontal orientation
- Miniature display: Keep `FixedLayout` for internal button positioning
- **No group containers** - layout groups are logical only

## Future Considerations

### Multi-Display Support
The new structure enables future multi-display support:
- Add multiple miniature displays to displays container
- Each miniature display represents one physical display
- Each miniature display shows buttons from all its assigned layout groups
- Horizontal layout naturally shows displays side-by-side

This refactoring lays the groundwork without implementing full multi-display support yet.

## Success Criteria

- [ ] New hierarchical structure implemented (container → displays → miniature display → buttons)
- [ ] Miniature display has light black background color
- [ ] Miniature display aspect ratio matches screen aspect ratio
- [ ] All existing hover effects work correctly
- [ ] All click events trigger properly
- [ ] Auto-hide behavior functions as before
- [ ] `SnapLayout` and `SnapLayoutGroup` interfaces unchanged
- [ ] No type errors or linting issues
- [ ] Code passes `npm run build && npm run check`

## Timeline Estimate

**6 points** - Medium complexity refactoring with careful coordinate transformation work

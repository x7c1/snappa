/**
 * Boundary Adjuster
 *
 * Provides functions to adjust UI element positions to keep them within screen boundaries.
 */

import type { Dimensions, MainPanelPositionOptions, Position, ScreenBoundaries } from './types.js';

/**
 * Adjust main panel position to keep it within screen boundaries
 * Supports horizontal and vertical centering
 */
export function adjustMainPanelPosition(
  cursorPosition: Position,
  panelDimensions: Dimensions,
  boundaries: ScreenBoundaries,
  options: MainPanelPositionOptions = {}
): Position {
  const { centerHorizontally = true, centerVertically = false } = options;

  let adjustedX = cursorPosition.x;
  let adjustedY = cursorPosition.y;

  // Apply horizontal centering if requested
  if (centerHorizontally) {
    adjustedX = cursorPosition.x - panelDimensions.width / 2;
  }

  // Apply vertical centering if requested
  if (centerVertically) {
    adjustedY = cursorPosition.y - panelDimensions.height / 2;
  }

  // Calculate maximum X position
  const maxX = boundaries.screenWidth - panelDimensions.width - boundaries.edgePadding;

  // Check right edge: clamp to maxX
  if (adjustedX > maxX) {
    adjustedX = maxX;
  }

  // Check left edge: clamp to padding
  if (adjustedX < boundaries.edgePadding) {
    adjustedX = boundaries.edgePadding;
  }

  // Check bottom edge: shift up if needed
  if (adjustedY + panelDimensions.height > boundaries.screenHeight - boundaries.edgePadding) {
    adjustedY = boundaries.screenHeight - panelDimensions.height - boundaries.edgePadding;
  }

  // Check top edge: clamp to padding
  if (adjustedY < boundaries.edgePadding) {
    adjustedY = boundaries.edgePadding;
  }

  return { x: adjustedX, y: adjustedY };
}

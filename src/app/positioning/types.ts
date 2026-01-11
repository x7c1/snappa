/**
 * Position coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Element dimensions
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Screen boundaries configuration
 */
export interface ScreenBoundaries {
  screenWidth: number;
  screenHeight: number;
  edgePadding: number;
}

/**
 * Options for main panel positioning
 */
export interface MainPanelPositionOptions {
  /** Whether to center the panel horizontally on the cursor */
  centerHorizontally?: boolean;
  /** Whether to center the panel vertically on the cursor */
  centerVertically?: boolean;
}

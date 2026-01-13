/**
 * MainPanelPositionManager
 *
 * Manages panel positioning and dimension calculations.
 * Handles boundary adjustments.
 */

import type St from 'gi://St';
import {
  DISPLAY_GROUP_SPACING,
  FOOTER_MARGIN_TOP,
  PANEL_EDGE_PADDING,
  PANEL_PADDING,
  ROW_SPACING,
} from '../constants.js';
import type { MonitorManager } from '../monitor/manager.js';
import { adjustMainPanelPosition } from '../positioning/index.js';
import type { ScreenBoundaries } from '../positioning/types.js';
import type { DisplayGroupsRow, Position, Size } from '../types/index.js';
import { calculateDisplayGroupDimensions } from '../ui/display-group-dimensions.js';

export class MainPanelPositionManager {
  private monitorManager: MonitorManager;

  constructor(monitorManager: MonitorManager) {
    this.monitorManager = monitorManager;
  }
  /**
   * Calculate panel dimensions based on rows to render
   * Only supports DisplayGroupsRow format
   */
  calculatePanelDimensions(rowsToRender: DisplayGroupsRow[], showFooter: boolean): Size {
    // Handle empty rows case
    if (rowsToRender.length === 0) {
      const minWidth = 200; // Minimum width for "No rows" message
      const minHeight = 120 + (showFooter ? FOOTER_MARGIN_TOP + 20 : 0);
      return { width: minWidth, height: minHeight };
    }

    const monitors = this.monitorManager.getMonitors();

    // Calculate width: maximum row width
    let maxRowWidth = 0;
    for (const row of rowsToRender) {
      // Defensive check: ensure row has displayGroups array
      if (!row.displayGroups || !Array.isArray(row.displayGroups)) {
        continue;
      }

      // Calculate total width for all Display Groups in this row (horizontal layout)
      let rowWidth = 0;
      for (let j = 0; j < row.displayGroups.length; j++) {
        const displayGroup = row.displayGroups[j];
        const dimensions = calculateDisplayGroupDimensions(displayGroup, monitors);
        rowWidth += dimensions.width;

        // Add spacing between Display Groups (except for last one)
        if (j < row.displayGroups.length - 1) {
          rowWidth += DISPLAY_GROUP_SPACING;
        }
      }

      maxRowWidth = Math.max(maxRowWidth, rowWidth);
    }
    const panelWidth = maxRowWidth + PANEL_PADDING * 2;

    // Calculate height: sum of all row heights with spacing
    let totalHeight = PANEL_PADDING; // Top padding
    for (let i = 0; i < rowsToRender.length; i++) {
      const row = rowsToRender[i];

      // Defensive check: ensure row has displayGroups array
      if (!row.displayGroups || !Array.isArray(row.displayGroups)) {
        continue;
      }

      // Find the tallest Display Group in this row
      let maxDisplayGroupHeight = 0;
      for (const displayGroup of row.displayGroups) {
        const dimensions = calculateDisplayGroupDimensions(displayGroup, monitors);
        maxDisplayGroupHeight = Math.max(maxDisplayGroupHeight, dimensions.height);
      }

      if (maxDisplayGroupHeight > 0) {
        // Add the height of this row (tallest Display Group + bottom margin)
        totalHeight += maxDisplayGroupHeight + DISPLAY_GROUP_SPACING;

        // Add row spacing except for last row
        if (i < rowsToRender.length - 1) {
          totalHeight += ROW_SPACING;
        }
      }
    }

    // Add footer height if showing footer
    if (showFooter) {
      totalHeight += FOOTER_MARGIN_TOP + 20; // 20px approximate footer text height
    }

    totalHeight += PANEL_PADDING; // Bottom padding

    return { width: panelWidth, height: totalHeight };
  }

  /**
   * Adjust panel position for screen boundaries with center alignment
   * Constrains panel within the monitor that contains the cursor
   */
  adjustPosition(cursor: Position, panelDimensions: Size, centerVertically = false): Position {
    // Get monitor at cursor position
    const monitor = this.monitorManager.getMonitorAtPosition(cursor.x, cursor.y);

    // Use monitor workArea if found, otherwise fallback to global screen
    let boundaries: ScreenBoundaries;
    if (monitor) {
      boundaries = {
        offsetX: monitor.workArea.x,
        offsetY: monitor.workArea.y,
        screenWidth: monitor.workArea.width,
        screenHeight: monitor.workArea.height,
        edgePadding: PANEL_EDGE_PADDING,
      };
    } else {
      boundaries = {
        offsetX: 0,
        offsetY: 0,
        screenWidth: global.screen_width,
        screenHeight: global.screen_height,
        edgePadding: PANEL_EDGE_PADDING,
      };
    }

    const adjusted = adjustMainPanelPosition(cursor, panelDimensions, boundaries, {
      centerHorizontally: true,
      centerVertically,
    });

    return adjusted;
  }

  /**
   * Update panel container position
   */
  updatePanelPosition(container: St.BoxLayout, position: Position): void {
    container.set_position(position.x, position.y);
  }
}

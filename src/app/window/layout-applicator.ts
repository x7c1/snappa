/**
 * LayoutApplicator
 *
 * Applies layouts to windows.
 * Handles layout expression evaluation, window positioning, and history recording.
 */

import type Meta from 'gi://Meta';

import { evaluate, parse } from '../layout-expression/index.js';
import type { MonitorManager } from '../monitor/manager.js';
import type { LayoutHistoryRepository } from '../repository/layout-history.js';
import type { Layout } from '../types/index.js';

declare function log(message: string): void;

export interface LayoutApplicationCallbacks {
  onLayoutApplied?: (layoutId: string, monitorKey: string) => void;
}

export class LayoutApplicator {
  constructor(
    private readonly monitorManager: MonitorManager,
    private readonly layoutHistoryRepository: LayoutHistoryRepository,
    private readonly callbacks: LayoutApplicationCallbacks = {}
  ) {}

  /**
   * Apply layout to window
   */
  applyLayout(window: Meta.Window | null, layout: Layout, monitorKey?: string): void {
    log(`[LayoutApplicator] Apply layout: ${layout.label} (ID: ${layout.id})`);

    if (!window) {
      log('[LayoutApplicator] No window to apply layout to');
      return;
    }

    let targetMonitor: import('../types/index.js').Monitor | null;
    if (monitorKey !== undefined) {
      log(`[LayoutApplicator] Using user-selected monitor: ${monitorKey}`);
      targetMonitor = this.monitorManager.getMonitorByKey(monitorKey);
      if (!targetMonitor) {
        log(`[LayoutApplicator] Could not find monitor with key: ${monitorKey}`);
        return;
      }
    } else {
      log('[LayoutApplicator] Auto-detecting monitor from window');
      targetMonitor = this.monitorManager.getMonitorForWindow(window);
      if (!targetMonitor) {
        log('[LayoutApplicator] Could not determine monitor for window');
        return;
      }
      monitorKey = String(targetMonitor.index);
    }
    const workArea = targetMonitor.workArea;

    const windowId = window.get_id();
    const wmClass = window.get_wm_class();
    const title = window.get_title();
    if (wmClass) {
      this.layoutHistoryRepository.setSelectedLayoutForMonitor(
        monitorKey,
        windowId,
        wmClass,
        title,
        layout.id
      );
      if (this.callbacks.onLayoutApplied) {
        this.callbacks.onLayoutApplied(layout.id, monitorKey);
      }
    } else {
      log('[LayoutApplicator] Window has no WM_CLASS, skipping history update');
    }

    const resolve = (value: string, containerSize: number): number => {
      const expr = parse(value);
      return evaluate(expr, containerSize);
    };

    const x = workArea.x + resolve(layout.x, workArea.width);
    const y = workArea.y + resolve(layout.y, workArea.height);
    const width = resolve(layout.width, workArea.width);
    const height = resolve(layout.height, workArea.height);

    log(
      `[LayoutApplicator] Moving window to x=${x}, y=${y}, w=${width}, h=${height} (work area: ${workArea.x},${workArea.y} ${workArea.width}x${workArea.height})`
    );

    if (window.get_maximized()) {
      log('[LayoutApplicator] Unmaximizing window');
      window.unmaximize(3); // Both horizontally and vertically
    }

    window.move_resize_frame(false, x, y, width, height);
    log('[LayoutApplicator] Window moved');
  }
}

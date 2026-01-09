export interface Monitor {
  index: number; // 0-based monitor index ("0", "1", "2"...)
  geometry: { x: number; y: number; width: number; height: number };
  workArea: { x: number; y: number; width: number; height: number };
  isPrimary: boolean;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface PerMonitorLayoutHistory {
  version: 2;
  byMonitor: {
    [monitorKey: string]: {
      // monitorKey: "0", "1", "2"...
      byWindowId: { [windowId: number]: string };
      byWmClass: { [wmClass: string]: string[] };
      byWmClassAndLabel: { [key: string]: string };
    };
  };
}

/**
 * Note: Version 2 format is required for per-monitor history.
 * Migration from version 1 (old format) is handled automatically.
 * Old history entries are migrated to monitor "0".
 */

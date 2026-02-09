import type { CollectionId } from '../layout/collection-id.js';

export interface Monitor {
  /** 0-based monitor index (0, 1, 2...) */
  index: number;

  geometry: { x: number; y: number; width: number; height: number };
  workArea: { x: number; y: number; width: number; height: number };
  isPrimary: boolean;
}

// Fallback monitor dimensions (used when no physical monitor info is available)
export const DEFAULT_MONITOR_WIDTH = 1920;
export const DEFAULT_MONITOR_HEIGHT = 1080;

export interface BoundingBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

/**
 * Monitor environment - stores monitors configuration for a specific physical setup
 */
export interface MonitorEnvironment {
  /** Hash computed from all monitors' geometry data */
  id: string;

  monitors: Monitor[];

  /** null when no collection has been used yet */
  lastActiveCollectionId: CollectionId | null;

  /** Timestamp when environment was last active */
  lastActiveAt: number;
}

/**
 * Multi-environment monitor storage structure
 */
export interface MonitorEnvironmentStorage {
  environments: MonitorEnvironment[];

  /** ID of the current environment */
  current: string;
}

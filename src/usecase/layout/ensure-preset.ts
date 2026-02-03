import type {
  LayoutGroupSetting,
  MonitorType,
  SpaceCollectionData,
} from '../../domain/layout/preset-generator.js';
import { generatePreset, getPresetName } from '../../domain/layout/preset-generator.js';
import { generateUUID } from '../../libs/uuid/index.js';
import type { SpaceCollectionRepository } from './space-collection-repository.js';

declare function log(message: string): void;

export interface MonitorCountProvider {
  loadMonitorCount(): number;
}

export interface LayoutGroupConfig {
  allLayoutGroups: LayoutGroupSetting[];
  wideLayoutGroupNames: string[];
  standardLayoutGroupNames: string[];
}

const uuidGenerator = {
  generate: generateUUID,
};

/**
 * Check if a preset exists for the given monitor count and type
 */
export function hasPresetForMonitorCount(
  repository: SpaceCollectionRepository,
  monitorCount: number,
  monitorType: MonitorType
): boolean {
  const presets = repository.loadPresetCollections();
  const presetName = getPresetName(monitorCount, monitorType);
  return presets.some((p) => p.name === presetName);
}

/**
 * Ensure presets exist for the given monitor count
 * Generates both standard and wide presets if they don't exist
 */
export function ensurePresetForMonitorCount(
  repository: SpaceCollectionRepository,
  config: LayoutGroupConfig,
  monitorCount: number
): void {
  if (monitorCount <= 0) {
    log('[EnsurePreset] Invalid monitor count, skipping preset generation');
    return;
  }

  const presets = repository.loadPresetCollections();
  const monitorTypes: MonitorType[] = ['standard', 'wide'];
  const newPresets: SpaceCollectionData[] = [];

  for (const monitorType of monitorTypes) {
    const presetName = getPresetName(monitorCount, monitorType);
    const existing = presets.find((p) => p.name === presetName);

    if (!existing) {
      log(`[EnsurePreset] Generating preset "${presetName}"`);
      const layoutGroupNames =
        monitorType === 'wide' ? config.wideLayoutGroupNames : config.standardLayoutGroupNames;
      const newPreset = generatePreset(
        monitorCount,
        monitorType,
        layoutGroupNames,
        config.allLayoutGroups,
        uuidGenerator
      );
      newPresets.push(newPreset);
    }
  }

  if (newPresets.length > 0) {
    repository.savePresetCollections([...presets, ...newPresets]);
  }
}

/**
 * Ensure presets exist for the current monitor count
 * Called when main panel or settings screen opens
 */
export function ensurePresetForCurrentMonitors(
  repository: SpaceCollectionRepository,
  config: LayoutGroupConfig,
  monitorCountProvider: MonitorCountProvider
): void {
  const monitorCount = monitorCountProvider.loadMonitorCount();
  if (monitorCount === 0) {
    log('[EnsurePreset] No monitor info available, skipping preset generation');
    return;
  }
  ensurePresetForMonitorCount(repository, config, monitorCount);
}

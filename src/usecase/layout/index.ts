export { getActiveSpaceCollection, resolveActiveSpaceCollectionId } from './active-collection.js';
export type { LayoutGroupConfig, MonitorCountProvider } from './ensure-preset.js';
export {
  ensurePresetForCurrentMonitors,
  ensurePresetForMonitorCount,
  hasPresetForMonitorCount,
} from './ensure-preset.js';
export type {
  LayoutConfiguration,
  LayoutGroupSetting as ImportLayoutGroupSetting,
  LayoutSetting as ImportLayoutSetting,
  SpaceSetting,
  SpacesRowSetting,
} from './import-collection.js';
export {
  deleteCustomCollection,
  importLayoutConfiguration,
  importLayoutConfigurationFromJson,
} from './import-collection.js';
export type {
  LayoutData,
  LayoutGroupData,
  SpaceCollectionData,
  SpaceCollectionRepository,
  SpaceData,
  SpacesRowData,
} from './space-collection-repository.js';

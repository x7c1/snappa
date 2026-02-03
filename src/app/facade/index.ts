// Facade layer
// Provides backward-compatible APIs using new layer implementations

export {
  getActiveSpaceCollection,
  resolveActiveSpaceCollectionId,
} from './active-space-collection.js';
export {
  deleteCustomCollection,
  importLayoutConfiguration,
  importLayoutConfigurationFromJson,
} from './custom-import.js';
export {
  ensurePresetForCurrentMonitors,
  ensurePresetForMonitorCount,
  hasPresetForMonitorCount,
  loadMonitorCount,
  type MonitorType,
} from './preset-generator.js';
export {
  addCustomCollection,
  deleteCustomCollection as deleteCustomCollectionById,
  findCollectionById,
  loadAllCollections,
  loadCustomCollections,
  loadPresetCollections,
  saveCustomCollections,
  savePresetCollections,
  updateSpaceEnabled,
} from './space-collection.js';

/**
 * Composition Layer
 *
 * Responsible for dependency injection and wiring concrete implementations.
 * This layer knows about concrete classes from all layers and composes them together.
 *
 * Guidelines:
 * - Create factory functions that return configured instances
 * - Import concrete implementations here
 * - Export only factory functions, not concrete classes
 * - Other layers should depend on interfaces, not concrete implementations
 */

// Custom Import Service
export {
  deleteCustomCollection as deleteCustomCollectionById,
  importLayoutConfiguration,
  importLayoutConfigurationFromJson,
} from './custom-import-service.js';
// Preset Generator Service
export {
  ensurePresetForCurrentMonitors,
  ensurePresetForMonitorCount,
  hasPresetForMonitorCount,
  loadMonitorCount,
  type MonitorType,
} from './preset-generator-service.js';
export {
  getSpaceCollectionRepository,
  resetSpaceCollectionRepository,
} from './space-collection-repository.js';
// Space Collection Service
export {
  addCustomCollection,
  deleteCustomCollection,
  findCollectionById,
  getActiveSpaceCollection,
  loadAllCollections,
  loadCustomCollections,
  loadPresetCollections,
  resolveActiveSpaceCollectionId,
  saveCustomCollections,
  savePresetCollections,
  updateSpaceEnabled,
} from './space-collection-service.js';

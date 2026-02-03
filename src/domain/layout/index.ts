export { CollectionId, InvalidCollectionIdError } from './collection-id.js';
export { generateLayoutHash } from './layout-hash.js';
export { InvalidLayoutIdError, LayoutId } from './layout-id.js';
export type {
  LayoutData as PresetLayoutData,
  LayoutGroupData as PresetLayoutGroupData,
  LayoutGroupSetting,
  LayoutSetting,
  MonitorType,
  SpaceCollectionData as PresetSpaceCollectionData,
  SpaceData as PresetSpaceData,
  SpacesRowData as PresetSpacesRowData,
  UUIDGenerator,
} from './preset-generator.js';
export { generatePreset, getPresetName } from './preset-generator.js';
export { InvalidSpaceIdError, SpaceId } from './space-id.js';

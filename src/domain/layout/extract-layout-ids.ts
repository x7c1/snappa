import { ValueSet } from '../../libs/value-set/index.js';
import type { LayoutId } from './layout-id.js';
import type { SpaceCollection } from './types.js';

/**
 * Extract all layout IDs from a list of SpaceCollections
 */
export function extractLayoutIds(collections: SpaceCollection[]): ValueSet<LayoutId> {
  const ids: LayoutId[] = [];

  for (const collection of collections) {
    for (const row of collection.rows) {
      for (const space of row.spaces) {
        for (const monitorKey in space.displays) {
          const layoutGroup = space.displays[monitorKey];
          for (const layout of layoutGroup.layouts) {
            ids.push(layout.id);
          }
        }
      }
    }
  }

  return new ValueSet(ids);
}

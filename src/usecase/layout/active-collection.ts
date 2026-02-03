import { CollectionId } from '../../domain/layout/index.js';
import type {
  SpaceCollectionData,
  SpaceCollectionRepository,
} from './space-collection-repository.js';

declare function log(message: string): void;

/**
 * Get the active SpaceCollection based on the stored ID
 * Falls back to the first preset collection if the ID is empty or invalid
 *
 * @param repository - The space collection repository
 * @param activeId - The stored active collection ID from GSettings
 * @returns The active SpaceCollection, or undefined if no collections exist
 */
export function getActiveSpaceCollection(
  repository: SpaceCollectionRepository,
  activeId: string
): SpaceCollectionData | undefined {
  // If activeId is set, try to find it
  if (activeId) {
    const collectionId = CollectionId.tryCreate(activeId);
    if (collectionId) {
      const collection = repository.findCollectionById(collectionId);
      if (collection) {
        return collection;
      }
    }
    log(`[ActiveCollection] Collection with ID "${activeId}" not found, falling back`);
  }

  // Fallback: use first preset collection
  const presets = repository.loadPresetCollections();
  if (presets.length > 0) {
    log(`[ActiveCollection] Using first preset collection: ${presets[0].name}`);
    return presets[0];
  }

  // No presets available, try custom collections
  const all = repository.loadAllCollections();
  if (all.length > 0) {
    log(`[ActiveCollection] Using first available collection: ${all[0].name}`);
    return all[0];
  }

  log('[ActiveCollection] No collections available');
  return undefined;
}

/**
 * Get the ID that should be used as active
 * Returns the provided ID if valid, otherwise returns the first preset's ID
 *
 * @param repository - The space collection repository
 * @param activeId - The stored active collection ID from GSettings
 * @returns The resolved active collection ID, or empty string if no collections exist
 */
export function resolveActiveSpaceCollectionId(
  repository: SpaceCollectionRepository,
  activeId: string
): string {
  const collection = getActiveSpaceCollection(repository, activeId);
  return collection?.id ?? '';
}

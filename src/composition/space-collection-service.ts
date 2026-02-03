/**
 * Space Collection Service
 *
 * Application services for managing space collections.
 * Provides high-level operations using the repository.
 */

import { CollectionId, SpaceId } from '../domain/layout/index.js';
import type { SpaceCollectionData } from '../usecase/layout/index.js';
import { getSpaceCollectionRepository } from './space-collection-repository.js';

// Re-export SpaceCollection type for consumers
export type { SpaceCollectionData as SpaceCollection };

function getRepository() {
  return getSpaceCollectionRepository();
}

export function loadPresetCollections(): SpaceCollectionData[] {
  return getRepository().loadPresetCollections();
}

export function savePresetCollections(collections: SpaceCollectionData[]): void {
  getRepository().savePresetCollections(collections);
}

export function loadCustomCollections(): SpaceCollectionData[] {
  return getRepository().loadCustomCollections();
}

export function saveCustomCollections(collections: SpaceCollectionData[]): void {
  getRepository().saveCustomCollections(collections);
}

export function loadAllCollections(): SpaceCollectionData[] {
  return getRepository().loadAllCollections();
}

export function addCustomCollection(
  collection: Omit<SpaceCollectionData, 'id'>
): SpaceCollectionData {
  return getRepository().addCustomCollection(collection);
}

export function deleteCustomCollection(collectionId: string): boolean {
  const id = CollectionId.tryCreate(collectionId);
  if (!id) {
    return false;
  }
  return getRepository().deleteCustomCollection(id);
}

export function findCollectionById(collectionId: string): SpaceCollectionData | undefined {
  const id = CollectionId.tryCreate(collectionId);
  if (!id) {
    return undefined;
  }
  return getRepository().findCollectionById(id);
}

export function updateSpaceEnabled(
  collectionId: string,
  spaceId: string,
  enabled: boolean
): boolean {
  const cId = CollectionId.tryCreate(collectionId);
  const sId = SpaceId.tryCreate(spaceId);
  if (!cId || !sId) {
    return false;
  }
  return getRepository().updateSpaceEnabled(cId, sId, enabled);
}

/**
 * Get the active SpaceCollection based on the stored ID
 * Falls back to the first preset collection if the ID is empty or invalid
 */
export function getActiveSpaceCollection(activeId: string): SpaceCollectionData | undefined {
  // If activeId is set, try to find it
  if (activeId) {
    const collection = findCollectionById(activeId);
    if (collection) {
      return collection;
    }
  }

  // Fallback: use first preset collection
  const presets = loadPresetCollections();
  if (presets.length > 0) {
    return presets[0];
  }

  // No presets available, try custom collections
  const all = loadAllCollections();
  if (all.length > 0) {
    return all[0];
  }

  return undefined;
}

/**
 * Get the ID that should be used as active
 * Returns the provided ID if valid, otherwise returns the first preset's ID
 */
export function resolveActiveSpaceCollectionId(activeId: string): string {
  const collection = getActiveSpaceCollection(activeId);
  return collection?.id ?? '';
}

import { CollectionId, SpaceId } from '../../domain/layout/index.js';
import { FileSpaceCollectionRepository, getExtensionDataPath } from '../../infra/file/index.js';
import { generateUUID } from '../../libs/uuid/index.js';
import type { SpaceCollectionData } from '../../usecase/layout/index.js';
import {
  CUSTOM_SPACE_COLLECTIONS_FILE_NAME,
  PRESET_SPACE_COLLECTIONS_FILE_NAME,
} from '../constants.js';
import type { SpaceCollection } from '../types/index.js';

let repositoryInstance: FileSpaceCollectionRepository | null = null;

function getRepository(): FileSpaceCollectionRepository {
  if (!repositoryInstance) {
    repositoryInstance = new FileSpaceCollectionRepository(
      getExtensionDataPath(PRESET_SPACE_COLLECTIONS_FILE_NAME),
      getExtensionDataPath(CUSTOM_SPACE_COLLECTIONS_FILE_NAME),
      generateUUID
    );
  }
  return repositoryInstance;
}

export function loadPresetCollections(): SpaceCollection[] {
  return getRepository().loadPresetCollections() as SpaceCollection[];
}

export function savePresetCollections(collections: SpaceCollection[]): void {
  getRepository().savePresetCollections(collections as SpaceCollectionData[]);
}

export function loadCustomCollections(): SpaceCollection[] {
  return getRepository().loadCustomCollections() as SpaceCollection[];
}

export function saveCustomCollections(collections: SpaceCollection[]): void {
  getRepository().saveCustomCollections(collections as SpaceCollectionData[]);
}

export function loadAllCollections(): SpaceCollection[] {
  return getRepository().loadAllCollections() as SpaceCollection[];
}

export function addCustomCollection(collection: Omit<SpaceCollection, 'id'>): SpaceCollection {
  return getRepository().addCustomCollection(
    collection as Omit<SpaceCollectionData, 'id'>
  ) as SpaceCollection;
}

export function deleteCustomCollection(collectionId: string): boolean {
  const id = CollectionId.tryCreate(collectionId);
  if (!id) {
    return false;
  }
  return getRepository().deleteCustomCollection(id);
}

export function findCollectionById(collectionId: string): SpaceCollection | undefined {
  const id = CollectionId.tryCreate(collectionId);
  if (!id) {
    return undefined;
  }
  return getRepository().findCollectionById(id) as SpaceCollection | undefined;
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

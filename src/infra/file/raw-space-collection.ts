/**
 * Raw Space Collection
 *
 * JSON format types and serialization/deserialization for SpaceCollection.
 */

import {
  CollectionId,
  type Layout,
  type LayoutGroup,
  LayoutId,
  type Space,
  type SpaceCollection,
  SpaceId,
} from '../../domain/layout/index.js';

export interface RawSpaceCollection {
  id: string;
  name: string;
  rows: RawSpacesRow[];
}

export function deserializeSpaceCollection(raw: RawSpaceCollection): SpaceCollection {
  return {
    id: new CollectionId(raw.id),
    name: raw.name,
    rows: raw.rows.map((row) => ({
      spaces: row.spaces.map(deserializeSpace),
    })),
  };
}

export function serializeSpaceCollection(collection: SpaceCollection): RawSpaceCollection {
  return {
    id: collection.id.toString(),
    name: collection.name,
    rows: collection.rows.map((row) => ({
      spaces: row.spaces.map(serializeSpace),
    })),
  };
}

export function isValidRawSpaceCollectionArray(data: unknown): data is RawSpaceCollection[] {
  if (!Array.isArray(data)) {
    return false;
  }

  for (const item of data) {
    if (typeof item !== 'object' || item === null) {
      return false;
    }
    if (!('id' in item) || typeof item.id !== 'string') {
      return false;
    }
    if (!('name' in item) || typeof item.name !== 'string') {
      return false;
    }
    if (!('rows' in item) || !Array.isArray(item.rows)) {
      return false;
    }
  }

  return true;
}

interface RawSpacesRow {
  spaces: RawSpace[];
}

interface RawSpace {
  id: string;
  enabled: boolean;
  displays: {
    [monitorKey: string]: RawLayoutGroup;
  };
}

interface RawLayoutGroup {
  name: string;
  layouts: RawLayout[];
}

interface RawLayout {
  id: string;
  hash: string;
  label: string;
  position: { x: string; y: string };
  size: { width: string; height: string };
}

function deserializeSpace(raw: RawSpace): Space {
  return {
    id: new SpaceId(raw.id),
    enabled: raw.enabled,
    displays: Object.fromEntries(
      Object.entries(raw.displays).map(([key, group]) => [key, deserializeLayoutGroup(group)])
    ),
  };
}

function serializeSpace(space: Space): RawSpace {
  return {
    id: space.id.toString(),
    enabled: space.enabled,
    displays: Object.fromEntries(
      Object.entries(space.displays).map(([key, group]) => [key, serializeLayoutGroup(group)])
    ),
  };
}

function deserializeLayoutGroup(raw: RawLayoutGroup): LayoutGroup {
  return {
    name: raw.name,
    layouts: raw.layouts.map(deserializeLayout),
  };
}

function serializeLayoutGroup(group: LayoutGroup): RawLayoutGroup {
  return {
    name: group.name,
    layouts: group.layouts.map(serializeLayout),
  };
}

function deserializeLayout(raw: RawLayout): Layout {
  return {
    id: new LayoutId(raw.id),
    hash: raw.hash,
    label: raw.label,
    position: raw.position,
    size: raw.size,
  };
}

function serializeLayout(layout: Layout): RawLayout {
  return {
    id: layout.id.toString(),
    hash: layout.hash,
    label: layout.label,
    position: layout.position,
    size: layout.size,
  };
}

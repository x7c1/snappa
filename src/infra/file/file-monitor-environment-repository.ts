import Gio from 'gi://Gio';

import { CollectionId } from '../../domain/layout/index.js';
import type { MonitorEnvironment, MonitorEnvironmentStorage } from '../../domain/monitor/index.js';
import type { MonitorEnvironmentRepository } from '../../operations/monitor/index.js';

const log = (message: string): void => console.log(message);

interface RawMonitorEnvironment {
  id: string;
  monitors: MonitorEnvironment['monitors'];
  lastActiveCollectionId: string;
  lastActiveAt: number;
}

interface RawMonitorEnvironmentStorage {
  environments: RawMonitorEnvironment[];
  current: string;
}

/**
 * File-based implementation of MonitorEnvironmentRepository.
 * Handles reading/writing MonitorEnvironmentStorage to a JSON file.
 */
export class FileMonitorEnvironmentRepository implements MonitorEnvironmentRepository {
  constructor(private readonly filePath: string) {}

  load(): MonitorEnvironmentStorage | null {
    const file = Gio.File.new_for_path(this.filePath);

    if (!file.query_exists(null)) {
      log('[FileMonitorEnvironmentRepository] No storage file found');
      return null;
    }

    try {
      const [success, contents] = file.load_contents(null);
      if (!success) {
        return null;
      }

      const json = new TextDecoder('utf-8').decode(contents);
      const raw = JSON.parse(json) as RawMonitorEnvironmentStorage;
      return this.deserialize(raw);
    } catch (e) {
      log(`[FileMonitorEnvironmentRepository] Error loading storage: ${e}`);
      return null;
    }
  }

  save(storage: MonitorEnvironmentStorage): void {
    const file = Gio.File.new_for_path(this.filePath);

    try {
      const parent = file.get_parent();
      if (parent && !parent.query_exists(null)) {
        parent.make_directory_with_parents(null);
      }

      const raw = this.serialize(storage);
      const json = JSON.stringify(raw, null, 2);
      file.replace_contents(json, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);

      log('[FileMonitorEnvironmentRepository] Storage saved successfully');
    } catch (e) {
      log(`[FileMonitorEnvironmentRepository] Error saving storage: ${e}`);
    }
  }

  private deserialize(raw: RawMonitorEnvironmentStorage): MonitorEnvironmentStorage {
    return {
      environments: raw.environments.map((env) => ({
        id: env.id,
        monitors: env.monitors,
        lastActiveCollectionId: this.parseCollectionId(env.lastActiveCollectionId),
        lastActiveAt: env.lastActiveAt,
      })),
      current: raw.current,
    };
  }

  private serialize(storage: MonitorEnvironmentStorage): RawMonitorEnvironmentStorage {
    return {
      environments: storage.environments.map((env) => ({
        id: env.id,
        monitors: env.monitors,
        lastActiveCollectionId: env.lastActiveCollectionId?.toString() ?? '',
        lastActiveAt: env.lastActiveAt,
      })),
      current: storage.current,
    };
  }

  private parseCollectionId(value: string): CollectionId | null {
    if (!value) return null;
    try {
      return new CollectionId(value);
    } catch {
      // Invalid values (e.g. legacy preset-N-monitor) become null
      log(`[FileMonitorEnvironmentRepository] Invalid collection ID "${value}", treating as null`);
      return null;
    }
  }
}

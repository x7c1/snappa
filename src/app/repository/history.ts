import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { HISTORY_FILE_NAME } from '../constants.js';
import { getExtensionDataPath } from './extension-path.js';
import { loadAllCollections } from './space-collection.js';

declare function log(message: string): void;

interface LayoutEvent {
  ts: number;
  wmClassHash: string;
  titleHash: string;
  layoutId: string;
}

interface LayoutEntry {
  layoutId: string;
  lastUsed: number;
}

interface LayoutHistoryMemory {
  byWindowId: Map<number, string>;
  byWmClassHash: Map<string, LayoutEntry[]>;
  byTitleHash: Map<string, LayoutEntry>;
}

const MAX_LAYOUTS_PER_WM_CLASS = 5;
const COMPACTION_THRESHOLD = 5000;

function hashString(input: string): string {
  const checksum = GLib.compute_checksum_for_string(GLib.ChecksumType.SHA256, input, -1);
  if (!checksum) {
    return '0000000000000000';
  }
  return checksum.substring(0, 16);
}

function getAllValidLayoutIds(): Set<string> {
  const ids = new Set<string>();
  const collections = loadAllCollections();

  for (const collection of collections) {
    for (const row of collection.rows) {
      for (const space of row.spaces) {
        for (const monitorKey in space.displays) {
          const layoutGroup = space.displays[monitorKey];
          for (const layout of layoutGroup.layouts) {
            ids.add(layout.id);
          }
        }
      }
    }
  }

  return ids;
}

/**
 * LayoutHistoryRepository
 *
 * Manages layout selection history using an event log approach.
 * Events are stored as JSONL (append-only), and in-memory structures
 * are built at startup for efficient lookups.
 */
export class LayoutHistoryRepository {
  private memory: LayoutHistoryMemory = {
    byWindowId: new Map(),
    byWmClassHash: new Map(),
    byTitleHash: new Map(),
  };

  private events: LayoutEvent[] = [];
  private file: Gio.File | null = null;

  private getHistoryFilePath(): string {
    return getExtensionDataPath(HISTORY_FILE_NAME);
  }

  private ensureFile(): Gio.File {
    if (!this.file) {
      this.file = Gio.File.new_for_path(this.getHistoryFilePath());
    }
    return this.file;
  }

  load(): void {
    const file = this.ensureFile();

    if (!file.query_exists(null)) {
      log('[LayoutHistory] History file does not exist, using empty history');
      return;
    }

    try {
      const [success, contents] = file.load_contents(null);
      if (!success) {
        log('[LayoutHistory] Failed to load history file');
        return;
      }

      const contentsString = new TextDecoder('utf-8').decode(contents);
      const lines = contentsString.split('\n').filter((line) => line.trim() !== '');

      const rawEvents: LayoutEvent[] = [];
      for (const line of lines) {
        try {
          const event = JSON.parse(line) as LayoutEvent;
          rawEvents.push(event);
        } catch (e) {
          log(`[LayoutHistory] Skipping invalid line: ${line}`);
        }
      }

      const validLayoutIds = getAllValidLayoutIds();
      this.events = rawEvents.filter((event) => validLayoutIds.has(event.layoutId));

      const filteredCount = rawEvents.length - this.events.length;
      if (filteredCount > 0) {
        log(`[LayoutHistory] Filtered ${filteredCount} events with invalid layoutId`);
      }

      this.events.sort((a, b) => a.ts - b.ts);
      this.buildMemoryStructures();

      log(`[LayoutHistory] Loaded ${this.events.length} events`);

      if (this.events.length > COMPACTION_THRESHOLD) {
        this.compact();
      }
    } catch (e) {
      log(`[LayoutHistory] Error loading history: ${e}`);
      this.memory = {
        byWindowId: new Map(),
        byWmClassHash: new Map(),
        byTitleHash: new Map(),
      };
      this.events = [];
    }
  }

  private buildMemoryStructures(): void {
    // byWindowId is volatile - always starts fresh each session
    this.memory.byWindowId = new Map();
    this.memory.byWmClassHash = new Map();
    this.memory.byTitleHash = new Map();

    for (const event of this.events) {
      this.updateMemoryWithEvent(event);
    }
  }

  private updateMemoryWithEvent(event: LayoutEvent): void {
    const { wmClassHash, titleHash, layoutId, ts } = event;

    let entries = this.memory.byWmClassHash.get(wmClassHash);
    if (!entries) {
      entries = [];
      this.memory.byWmClassHash.set(wmClassHash, entries);
    }

    const existingIndex = entries.findIndex((e) => e.layoutId === layoutId);
    if (existingIndex !== -1) {
      entries.splice(existingIndex, 1);
    }

    entries.unshift({ layoutId, lastUsed: ts });

    if (entries.length > MAX_LAYOUTS_PER_WM_CLASS) {
      entries.length = MAX_LAYOUTS_PER_WM_CLASS;
    }

    const titleKey = `${wmClassHash}:${titleHash}`;
    this.memory.byTitleHash.set(titleKey, { layoutId, lastUsed: ts });
  }

  private appendEvent(event: LayoutEvent): void {
    const file = this.ensureFile();

    try {
      const parent = file.get_parent();
      if (parent && !parent.query_exists(null)) {
        parent.make_directory_with_parents(null);
      }

      const line = `${JSON.stringify(event)}\n`;
      const outputStream = file.append_to(Gio.FileCreateFlags.NONE, null);
      outputStream.write_all(new TextEncoder().encode(line), null);
      outputStream.close(null);

      this.events.push(event);

      log('[LayoutHistory] Event appended successfully');
    } catch (e) {
      log(`[LayoutHistory] Error appending event: ${e}`);
    }
  }

  private compact(): void {
    log(`[LayoutHistory] Starting compaction (${this.events.length} events)`);

    const eventsToKeep: LayoutEvent[] = [];

    const wmClassLayouts = new Map<string, Set<string>>();
    for (const [wmClassHash, entries] of this.memory.byWmClassHash) {
      const layoutIds = new Set(entries.map((e) => e.layoutId));
      wmClassLayouts.set(wmClassHash, layoutIds);
    }

    const titleLatest = new Map<string, LayoutEvent>();
    for (const event of this.events) {
      const titleKey = `${event.wmClassHash}:${event.titleHash}`;
      const existing = titleLatest.get(titleKey);
      if (!existing || event.ts > existing.ts) {
        titleLatest.set(titleKey, event);
      }
    }

    const keepSet = new Set<LayoutEvent>();

    for (const event of titleLatest.values()) {
      keepSet.add(event);
    }

    for (const event of this.events) {
      const layouts = wmClassLayouts.get(event.wmClassHash);
      if (layouts?.has(event.layoutId)) {
        keepSet.add(event);
      }
    }

    eventsToKeep.push(...keepSet);
    eventsToKeep.sort((a, b) => a.ts - b.ts);

    const filePath = this.getHistoryFilePath();
    const tempPath = `${filePath}.tmp`;
    const tempFile = Gio.File.new_for_path(tempPath);
    const file = this.ensureFile();

    try {
      const content = `${eventsToKeep.map((e) => JSON.stringify(e)).join('\n')}\n`;
      tempFile.replace_contents(
        new TextEncoder().encode(content),
        null,
        false,
        Gio.FileCreateFlags.REPLACE_DESTINATION,
        null
      );

      // Atomic rename ensures no data loss if process is interrupted
      tempFile.move(file, Gio.FileCopyFlags.OVERWRITE, null, null);

      this.events = eventsToKeep;
      log(`[LayoutHistory] Compaction complete: ${eventsToKeep.length} events kept`);
    } catch (e) {
      log(`[LayoutHistory] Error during compaction: ${e}`);
      try {
        if (tempFile.query_exists(null)) {
          tempFile.delete(null);
        }
      } catch {
        // Cleanup failure is not critical
      }
    }
  }

  setSelectedLayout(windowId: number, wmClass: string, title: string, layoutId: string): void {
    if (!wmClass) {
      log('[LayoutHistory] wmClass is empty, skipping history update');
      return;
    }

    this.memory.byWindowId.set(windowId, layoutId);

    const wmClassHash = hashString(wmClass);
    const titleHash = hashString(title);

    const event: LayoutEvent = {
      ts: Date.now(),
      wmClassHash,
      titleHash,
      layoutId,
    };

    this.appendEvent(event);
    this.updateMemoryWithEvent(event);

    log(
      `[LayoutHistory] Recorded selection: windowId=${windowId}, wmClassHash=${wmClassHash}, titleHash=${titleHash} -> ${layoutId}`
    );
  }

  getSelectedLayoutId(windowId: number, wmClass: string, title: string): string | null {
    if (!wmClass) {
      return null;
    }

    const byWindowId = this.memory.byWindowId.get(windowId);
    if (byWindowId) {
      log(`[LayoutHistory] Found by windowId: ${windowId} -> ${byWindowId}`);
      return byWindowId;
    }

    const wmClassHash = hashString(wmClass);
    const titleHash = hashString(title);

    const titleKey = `${wmClassHash}:${titleHash}`;
    const byTitle = this.memory.byTitleHash.get(titleKey);
    if (byTitle) {
      log(`[LayoutHistory] Found by titleHash: ${titleKey} -> ${byTitle.layoutId}`);
      return byTitle.layoutId;
    }

    const byWmClass = this.memory.byWmClassHash.get(wmClassHash);
    if (byWmClass && byWmClass.length > 0) {
      log(`[LayoutHistory] Found by wmClassHash: ${wmClassHash} -> ${byWmClass[0].layoutId}`);
      return byWmClass[0].layoutId;
    }

    log(`[LayoutHistory] No history for wmClass: ${wmClass}`);
    return null;
  }
}

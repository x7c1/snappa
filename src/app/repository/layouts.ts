import Gio from 'gi://Gio';

import type { DisplayGroup, DisplayGroupsRow, Layout, LayoutGroup } from '../types/index.js';
import type {
  DisplayGroupSetting,
  DisplayGroupsRowSetting,
  LayoutConfiguration,
  LayoutGroupSetting,
  LayoutSetting,
} from '../types/layout-setting.js';
import { getExtensionDataPath } from './extension-path.js';
import { generateLayoutHash } from './layout-hash-generator.js';

declare function log(message: string): void;

// Storage file path
const LAYOUTS_FILE_NAME = 'imported-layouts.json';

function getLayoutsFilePath(): string {
  return getExtensionDataPath(LAYOUTS_FILE_NAME);
}

/**
 * Generates a simple UUID v4-like string
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function generateUUID(): string {
  const chars = '0123456789abcdef';
  let uuid = '';

  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4'; // Version 4
    } else if (i === 19) {
      // Variant bits: 10xx (8, 9, a, or b)
      const randomIndex = Math.floor(Math.random() * 4);
      uuid += chars[8 + randomIndex];
    } else {
      const randomIndex = Math.floor(Math.random() * 16);
      uuid += chars[randomIndex];
    }
  }

  return uuid;
}

/**
 * Converts a LayoutSetting to a Layout by adding ID and hash
 */
function settingToLayout(setting: LayoutSetting, monitorKey: string): Layout {
  return {
    id: generateUUID(),
    hash: generateLayoutHash(setting.x, setting.y, setting.width, setting.height),
    label: setting.label,
    monitorKey,
    x: setting.x,
    y: setting.y,
    width: setting.width,
    height: setting.height,
  };
}

/**
 * Converts LayoutGroupSetting to LayoutGroup
 */
function settingToLayoutGroup(
  groupSetting: LayoutGroupSetting,
  monitorKey: string = '0'
): LayoutGroup {
  return {
    name: groupSetting.name,
    layouts: groupSetting.layouts.map((setting) => settingToLayout(setting, monitorKey)),
  };
}

/**
 * Public helper: Convert layout group settings to layout groups
 * Used for test layouts in debug mode
 */
export function convertLayoutGroupSettings(groupSettings: LayoutGroupSetting[]): LayoutGroup[] {
  return groupSettings.map((setting) => settingToLayoutGroup(setting, '0'));
}

// ============================================================================
// Multi-monitor support functions
// ============================================================================

/**
 * Convert DisplayGroupSetting to DisplayGroup (runtime type)
 * Expands Layout Group names to full LayoutGroup objects with unique IDs
 */
function settingToDisplayGroup(
  displayGroupSetting: DisplayGroupSetting,
  layoutGroupSettings: LayoutGroupSetting[]
): DisplayGroup {
  const displays: { [monitorKey: string]: LayoutGroup } = {};

  // For each monitor in the Display Group
  for (const [monitorKey, layoutGroupName] of Object.entries(displayGroupSetting.displays)) {
    // Find the Layout Group definition by name
    const layoutGroupSetting = layoutGroupSettings.find((g) => g.name === layoutGroupName);

    if (!layoutGroupSetting) {
      log(
        `[LayoutsRepository] Warning: Layout Group "${layoutGroupName}" not found for monitor ${monitorKey}`
      );
      continue;
    }

    // Create a new LayoutGroup instance with unique IDs for this monitor
    // Each monitor gets its own LayoutGroup instance with separate IDs
    const layoutGroup: LayoutGroup = {
      name: layoutGroupSetting.name,
      layouts: layoutGroupSetting.layouts.map((setting) => settingToLayout(setting, monitorKey)),
    };

    displays[monitorKey] = layoutGroup;
  }

  return {
    id: generateUUID(),
    displays,
  };
}

/**
 * Convert DisplayGroupsRowSetting to DisplayGroupsRow (runtime type)
 */
function settingToDisplayGroupsRow(
  rowSetting: DisplayGroupsRowSetting,
  layoutGroupSettings: LayoutGroupSetting[]
): DisplayGroupsRow {
  return {
    displayGroups: rowSetting.displayGroups.map((dg) =>
      settingToDisplayGroup(dg, layoutGroupSettings)
    ),
  };
}

/**
 * Convert LayoutConfiguration to DisplayGroupsRow[] (runtime type)
 * Expands Layout Group references into full LayoutGroup objects with unique IDs
 */
function configurationToDisplayGroupRows(config: LayoutConfiguration): DisplayGroupsRow[] {
  return config.rows.map((rowSetting) =>
    settingToDisplayGroupsRow(rowSetting, config.layoutGroups)
  );
}

/**
 * Import layout configuration and convert to runtime format
 *
 */
export function importLayoutConfiguration(config: LayoutConfiguration): void {
  try {
    const rows = configurationToDisplayGroupRows(config);
    saveDisplayGroupRows(rows);
    log('[LayoutsRepository] Layout configuration imported successfully');
  } catch (e) {
    log(`[LayoutsRepository] Error importing layout configuration: ${e}`);
  }
}

/**
 * Validate that data is in the DisplayGroupsRow[] format
 * Returns true if valid, false if old format or invalid
 */
function isValidDisplayGroupRowsData(data: unknown): data is DisplayGroupsRow[] {
  if (!Array.isArray(data)) {
    return false;
  }

  // Check if all rows have displayGroups
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (typeof row !== 'object' || row === null) {
      return false;
    }

    // Check for old format (has layoutGroups instead of displayGroups)
    if ('layoutGroups' in row && !('displayGroups' in row)) {
      log(
        `[LayoutsRepository] Detected old format: row at index ${i} has layoutGroups instead of displayGroups`
      );
      return false;
    }

    // Check for required fields
    if (!('displayGroups' in row)) {
      return false;
    }

    if (!Array.isArray(row.displayGroups)) {
      return false;
    }
  }

  return true;
}

/**
 * Load layouts as display group rows (returns DisplayGroupsRow[] with expanded Display Groups)
 *
 */
export function loadLayoutsAsDisplayGroupRows(): DisplayGroupsRow[] {
  const layoutsPath = getLayoutsFilePath();
  const file = Gio.File.new_for_path(layoutsPath);

  if (!file.query_exists(null)) {
    log('[LayoutsRepository] Layouts file does not exist, returning empty array');
    return [];
  }

  try {
    const [success, contents] = file.load_contents(null);
    if (!success) {
      log('[LayoutsRepository] Failed to load layouts file');
      return [];
    }

    const contentsString = new TextDecoder('utf-8').decode(contents);
    const data: unknown = JSON.parse(contentsString);

    // Validate data format
    if (!isValidDisplayGroupRowsData(data)) {
      log('[LayoutsRepository] WARNING: Invalid or old format data detected in layouts file');
      log('[LayoutsRepository] Deleting old format file and returning empty array');
      // Delete the old format file
      try {
        file.delete(null);
        log('[LayoutsRepository] Old format file deleted successfully');
      } catch (deleteError) {
        log(`[LayoutsRepository] Failed to delete old format file: ${deleteError}`);
      }
      return [];
    }

    log('[LayoutsRepository] Display group rows loaded successfully');
    return data;
  } catch (e) {
    log(`[LayoutsRepository] Error loading display group rows: ${e}`);
    return [];
  }
}

/**
 * Save DisplayGroupsRow[] to disk (runtime format with Display Groups)
 *
 */
function saveDisplayGroupRows(rows: DisplayGroupsRow[]): void {
  const layoutsPath = getLayoutsFilePath();
  const file = Gio.File.new_for_path(layoutsPath);

  try {
    // Ensure directory exists
    const parent = file.get_parent();
    if (parent && !parent.query_exists(null)) {
      parent.make_directory_with_parents(null);
    }

    // Write to file
    const json = JSON.stringify(rows, null, 2);
    file.replace_contents(json, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);

    log('[LayoutsRepository] Display group rows saved successfully');
  } catch (e) {
    log(`[LayoutsRepository] Error saving display group rows: ${e}`);
  }
}

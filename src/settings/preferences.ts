/// <reference path="../types/build-mode.d.ts" />

import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';

import { loadLayoutsAsSpacesRows, setSpaceEnabled } from '../app/repository/spaces.js';
import type { Monitor, Space, SpacesRow } from '../app/types/index.js';
import { createGtkMiniatureSpace } from './gtk-miniature-space.js';

const SETTINGS_KEY_SHORTCUT = 'show-panel-shortcut';
const MONITORS_FILE_NAME = 'monitors.json';

/**
 * Build the preferences UI
 */
export function buildPreferencesUI(window: Adw.PreferencesWindow, settings: Gio.Settings): void {
  // Create General page (existing keyboard shortcut settings)
  const generalPage = createGeneralPage(window, settings);
  window.add(generalPage);

  // Create Spaces page
  const spacesPage = createSpacesPage();
  window.add(spacesPage);
}

/**
 * Create the General preferences page with keyboard shortcut settings
 */
function createGeneralPage(
  window: Adw.PreferencesWindow,
  settings: Gio.Settings
): Adw.PreferencesPage {
  const page = new Adw.PreferencesPage({
    title: 'General',
    icon_name: 'preferences-system-symbolic',
  });

  const group = new Adw.PreferencesGroup({
    title: 'Keyboard Shortcuts',
  });

  const row = new Adw.ActionRow({
    title: 'Show Main Panel',
    subtitle: 'Keyboard shortcut to invoke main panel for focused window',
  });

  const shortcutButton = new Gtk.Button({
    valign: Gtk.Align.CENTER,
    has_frame: true,
  });

  const updateShortcutLabel = () => {
    const shortcuts = settings.get_strv(SETTINGS_KEY_SHORTCUT);
    shortcutButton.set_label(shortcuts.length > 0 ? shortcuts[0] : 'Disabled');
  };

  updateShortcutLabel();

  shortcutButton.connect('clicked', () => {
    showShortcutDialog(window, settings, updateShortcutLabel);
  });

  const clearButton = new Gtk.Button({
    icon_name: 'edit-clear-symbolic',
    valign: Gtk.Align.CENTER,
    has_frame: false,
    tooltip_text: 'Clear shortcut',
  });

  clearButton.connect('clicked', () => {
    settings.set_strv(SETTINGS_KEY_SHORTCUT, []);
    updateShortcutLabel();
  });

  const box = new Gtk.Box({
    spacing: 6,
    valign: Gtk.Align.CENTER,
  });
  box.append(shortcutButton);
  box.append(clearButton);

  row.add_suffix(box);
  group.add(row);
  page.add(group);

  return page;
}

/**
 * Create the Spaces preferences page
 */
function createSpacesPage(): Adw.PreferencesPage {
  const page = new Adw.PreferencesPage({
    title: 'Spaces',
    icon_name: 'view-grid-symbolic',
  });

  const group = new Adw.PreferencesGroup({
    title: 'Space Visibility',
    description: 'Toggle Spaces on/off. Disabled Spaces are hidden from the main panel.',
  });

  // Load spaces from repository
  const rows = loadLayoutsAsSpacesRows();

  // Load monitor configuration saved by extension
  const monitors = loadMonitors(rows);

  // Add each Space with a toggle
  let spaceIndex = 0;
  for (const row of rows) {
    for (const space of row.spaces) {
      spaceIndex++;
      const spaceRow = createSpaceRow(space, spaceIndex, monitors);
      group.add(spaceRow);
    }
  }

  if (spaceIndex === 0) {
    const emptyRow = new Adw.ActionRow({
      title: 'No Spaces configured',
      subtitle: 'Import a layout configuration to add Spaces',
    });
    group.add(emptyRow);
  }

  page.add(group);

  return page;
}

/**
 * Get extension data directory path
 */
function getExtensionDataPath(filename: string): string {
  const dataDir = GLib.get_user_data_dir();
  return GLib.build_filenamev([
    dataDir,
    'gnome-shell',
    'extensions',
    'snappa@x7c1.github.io',
    filename,
  ]);
}

/**
 * Load monitor configuration from file saved by extension
 * Falls back to default horizontal layout if file doesn't exist
 */
function loadMonitors(rows: SpacesRow[]): Map<string, Monitor> {
  const monitors = new Map<string, Monitor>();
  const filePath = getExtensionDataPath(MONITORS_FILE_NAME);
  const file = Gio.File.new_for_path(filePath);

  if (file.query_exists(null)) {
    try {
      const [success, contents] = file.load_contents(null);
      if (success) {
        const contentsString = new TextDecoder('utf-8').decode(contents);
        const monitorsArray = JSON.parse(contentsString) as Monitor[];
        for (const monitor of monitorsArray) {
          monitors.set(String(monitor.index), monitor);
        }
        return monitors;
      }
    } catch (e) {
      // Fall through to default
    }
  }

  // Fallback: create default horizontal layout
  const monitorKeys = new Set<string>();
  for (const row of rows) {
    for (const space of row.spaces) {
      for (const key of Object.keys(space.displays)) {
        monitorKeys.add(key);
      }
    }
  }

  const sortedKeys = Array.from(monitorKeys).sort();
  const defaultWidth = 1920;
  const defaultHeight = 1080;

  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    monitors.set(key, {
      index: parseInt(key, 10),
      geometry: {
        x: i * defaultWidth,
        y: 0,
        width: defaultWidth,
        height: defaultHeight,
      },
      workArea: {
        x: i * defaultWidth,
        y: 0,
        width: defaultWidth,
        height: defaultHeight,
      },
      isPrimary: i === 0,
    });
  }

  return monitors;
}

/**
 * Create a row for a Space with miniature visualization and toggle switch
 */
function createSpaceRow(space: Space, index: number, monitors: Map<string, Monitor>): Gtk.Widget {
  // Alternate background colors for rows
  const isEven = index % 2 === 0;
  const bgColor = isEven ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';

  // Create outer frame with background
  const frame = new Gtk.Frame({
    margin_top: 2,
    margin_bottom: 2,
  });

  // Apply CSS for background color
  const cssProvider = new Gtk.CssProvider();
  cssProvider.load_from_string(`
    frame {
      background-color: ${bgColor};
      border-radius: 8px;
      border: none;
    }
  `);
  frame.get_style_context().add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

  // Create horizontal box: [spacer] [miniature] [toggle]
  const row = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 12,
    margin_top: 12,
    margin_bottom: 12,
    margin_start: 16,
    margin_end: 16,
  });

  // Left spacer for centering
  const leftSpacer = new Gtk.Box({ hexpand: true });

  // Create miniature space visualization
  const miniatureWidget = createGtkMiniatureSpace({
    space,
    monitors,
  });

  // Right spacer for centering
  const rightSpacer = new Gtk.Box({ hexpand: true });

  // Create toggle switch
  const toggle = new Gtk.Switch({
    valign: Gtk.Align.CENTER,
    active: space.enabled !== false,
  });

  toggle.connect('notify::active', () => {
    const enabled = toggle.get_active();
    setSpaceEnabled(space.id, enabled);
  });

  row.append(leftSpacer);
  row.append(miniatureWidget);
  row.append(rightSpacer);
  row.append(toggle);

  frame.set_child(row);
  return frame;
}

/**
 * Create and show shortcut capture dialog
 */
function showShortcutDialog(
  window: Adw.PreferencesWindow,
  settings: Gio.Settings,
  updateCallback: () => void
): void {
  const dialog = new Gtk.Window({
    transient_for: window,
    modal: true,
    title: 'Press shortcut keys',
  });

  const box = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 12,
  });

  const label = new Gtk.Label({
    label: 'Press Escape to cancel or BackSpace to clear',
    margin_top: 12,
    margin_bottom: 12,
    margin_start: 12,
    margin_end: 12,
  });

  box.append(label);
  dialog.set_child(box);

  const controller = new Gtk.EventControllerKey();
  controller.connect(
    'key-pressed',
    (_controller: unknown, keyval: number, _keycode: number, state: number) => {
      const mask = state & Gtk.accelerator_get_default_mod_mask();

      if (keyval === Gdk.KEY_Escape) {
        dialog.close();
        return true;
      }

      if (keyval === Gdk.KEY_BackSpace) {
        settings.set_strv(SETTINGS_KEY_SHORTCUT, []);
        updateCallback();
        dialog.close();
        return true;
      }

      if (isModifierKey(keyval)) {
        return false;
      }

      if (mask === 0) {
        return false;
      }

      const accelerator = Gtk.accelerator_name(keyval, mask);
      settings.set_strv(SETTINGS_KEY_SHORTCUT, [accelerator]);
      updateCallback();
      dialog.close();
      return true;
    }
  );

  dialog.add_controller(controller);
  dialog.present();
}

/**
 * Check if a keyval represents a modifier key
 */
function isModifierKey(keyval: number): boolean {
  return (
    keyval === Gdk.KEY_Control_L ||
    keyval === Gdk.KEY_Control_R ||
    keyval === Gdk.KEY_Alt_L ||
    keyval === Gdk.KEY_Alt_R ||
    keyval === Gdk.KEY_Shift_L ||
    keyval === Gdk.KEY_Shift_R ||
    keyval === Gdk.KEY_Super_L ||
    keyval === Gdk.KEY_Super_R ||
    keyval === Gdk.KEY_Meta_L ||
    keyval === Gdk.KEY_Meta_R
  );
}

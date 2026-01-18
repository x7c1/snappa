/// <reference path="../types/build-mode.d.ts" />

import type Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import type Gio from 'gi://Gio';

import { loadLayoutsAsSpacesRows } from '../app/repository/spaces.js';
import { createGeneralPage } from './keyboard-shortcuts.js';
import { loadMonitors } from './monitors.js';
import { calculateRequiredWidth, createSpacesPage } from './spaces-page.js';

// Window size constants
const MIN_WINDOW_WIDTH = 400;
const DEFAULT_WINDOW_HEIGHT = 500;
const DEFAULT_SCREEN_WIDTH = 1920;
const WINDOW_HORIZONTAL_PADDING = 80;

/**
 * Build the preferences UI
 */
export function buildPreferencesUI(window: Adw.PreferencesWindow, settings: Gio.Settings): void {
  // Load spaces and monitors for width calculation
  const rows = loadLayoutsAsSpacesRows();
  const monitors = loadMonitors(rows);

  // Calculate required width and set window size
  const contentWidth = calculateRequiredWidth(rows, monitors);
  const screenWidth = getScreenWidth();
  const windowWidth = Math.min(contentWidth + WINDOW_HORIZONTAL_PADDING, screenWidth);
  window.set_default_size(Math.max(windowWidth, MIN_WINDOW_WIDTH), DEFAULT_WINDOW_HEIGHT);

  // Create General page (existing keyboard shortcut settings)
  const generalPage = createGeneralPage(window, settings);
  window.add(generalPage);

  // Create Spaces page (reuse already loaded data)
  const spacesPage = createSpacesPage(rows, monitors);
  window.add(spacesPage);

  // Set Spaces page as the default visible page
  window.set_visible_page(spacesPage);
}

/**
 * Get the width of the primary screen/monitor
 */
function getScreenWidth(): number {
  const display = Gdk.Display.get_default();
  if (!display) {
    return DEFAULT_SCREEN_WIDTH;
  }

  const monitorList = display.get_monitors();
  if (!monitorList || monitorList.get_n_items() === 0) {
    return DEFAULT_SCREEN_WIDTH;
  }

  // Get the first monitor (primary)
  const monitor = monitorList.get_item(0) as Gdk.Monitor | null;
  if (!monitor) {
    return DEFAULT_SCREEN_WIDTH;
  }

  const geometry = monitor.get_geometry();
  return geometry.width;
}

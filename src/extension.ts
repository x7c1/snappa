/// <reference path="./types/build-mode.d.ts" />

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { Controller } from './app/controller.js';
import { DBusReloader } from './reloader/dbus-reloader.js';
import { ExtensionSettings } from './settings/extension-settings.js';

export default class SnappaExtension extends Extension {
  private dbusReloader: DBusReloader | null = null;
  private controller: Controller | null = null;

  enable() {
    console.log('[Snappa] Extension enabled');

    this.dbusReloader = this.initializeDevReloader();

    const settings = this.initializeSettings();
    this.controller = settings ? this.initializeController(settings) : null;
  }

  disable() {
    console.log('[Snappa] Extension disabled');

    // Clean up controller
    if (this.controller) {
      this.controller.disable();
      this.controller = null;
    }

    // Clean up D-Bus reloader
    if (this.dbusReloader) {
      this.dbusReloader.disable();
      this.dbusReloader = null;
    }
  }

  private initializeDevReloader(): DBusReloader | null {
    if (!__DEV__) {
      return null;
    }

    const reloader = new DBusReloader('snappa@x7c1.github.io', this.metadata.uuid);
    reloader.enable();
    return reloader;
  }

  private initializeSettings(): ExtensionSettings | null {
    try {
      const settings = new ExtensionSettings(this.metadata);
      console.log('[Snappa] Settings loaded successfully');
      return settings;
    } catch (e) {
      console.log(`[Snappa] ERROR: Failed to load settings: ${e}`);
      return null;
    }
  }

  private initializeController(settings: ExtensionSettings): Controller | null {
    try {
      const controller = new Controller(settings, this.metadata);
      controller.enable();
      console.log('[Snappa] Controller initialized');
      return controller;
    } catch (e) {
      console.log(`[Snappa] ERROR: Failed to initialize controller: ${e}`);
      return null;
    }
  }
}

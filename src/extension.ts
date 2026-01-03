/// <reference path="./types/build-mode.d.ts" />

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {DBusReloader} from './reloader/dbus-reloader.js';

export default class SnappaExtension extends Extension {
  private dbusReloader: DBusReloader | null = null;

  enable() {
    console.log('[Snappa] Extension enabled');

    // Initialize D-Bus reloader in development mode
    if (__DEV__) {
      this.dbusReloader = new DBusReloader('snappa@x7c1.github.io', this.metadata.uuid);
      this.dbusReloader.enable();
    }
  }

  disable() {
    console.log('[Snappa] Extension disabled');

    // Clean up D-Bus reloader
    if (this.dbusReloader) {
      this.dbusReloader.disable();
      this.dbusReloader = null;
    }
  }
}

/**
 * Main Panel - Simplified version for Step 3
 * Displays a basic panel with a test button at a fixed position
 */

import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class MainPanel {
  private panel: St.BoxLayout | null = null;
  private button: St.Button | null = null;

  /**
   * Show the panel at a fixed position
   */
  show(): void {
    if (this.panel) {
      console.log('[MainPanel] Panel already exists');
      return;
    }

    console.log('[MainPanel] Creating panel...');

    // Create panel container
    this.panel = new St.BoxLayout({
      style_class: 'snap-main-panel',
      vertical: false,
      reactive: true,
      style: 'background-color: rgba(0, 0, 0, 0.8); padding: 10px; border-radius: 8px;',
    });

    // Create test button
    this.button = new St.Button({
      label: 'Test Button',
      style_class: 'button',
      reactive: true,
      can_focus: true,
      track_hover: true,
      style: 'background-color: rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 4px; color: white;',
    });

    // Add click handler
    this.button.connect('clicked', () => {
      console.log('[MainPanel] Test button clicked!');
    });

    this.panel.add_child(this.button);

    // Add panel to UI group (global.stage is deprecated in Shell 46)
    (Main.layoutManager as any).addChrome(this.panel, {
      affectsInputRegion: true,
    });

    // Position panel at center of primary monitor
    const monitor = (Main.layoutManager as any).primaryMonitor;
    const x = monitor.x + Math.floor(monitor.width / 2) - 100;
    const y = monitor.y + Math.floor(monitor.height / 2);

    this.panel.set_position(x, y);

    console.log('[MainPanel] Panel created and positioned at', x, y);
  }

  /**
   * Hide and destroy the panel
   */
  hide(): void {
    if (!this.panel) {
      return;
    }

    console.log('[MainPanel] Hiding panel...');

    // Remove from UI
    (Main.layoutManager as any).removeChrome(this.panel);

    // Destroy widgets
    if (this.button) {
      this.button.destroy();
      this.button = null;
    }

    if (this.panel) {
      this.panel.destroy();
      this.panel = null;
    }

    console.log('[MainPanel] Panel destroyed');
  }

  /**
   * Check if panel is currently visible
   */
  isVisible(): boolean {
    return this.panel !== null;
  }
}

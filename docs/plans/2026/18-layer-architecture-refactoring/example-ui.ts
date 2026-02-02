// ===== Example: UI Layer =====
// This file demonstrates how UI interacts with UseCase layer

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

// --- Types from other layers (imported) ---

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type ActivationError =
  | { type: 'INVALID_KEY'; message: string }
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'LICENSE_EXPIRED'; message: string };

interface License {
  key: { value: string };
  status: string;
  validUntil: Date;
}

interface ActivateLicense {
  execute(rawKey: string): Promise<Result<License, ActivationError>>;
}

// --- UI Implementation ---

export class LicenseSettingsPage {
  #activateLicense: ActivateLicense;
  #entryRow: Adw.EntryRow;
  #statusLabel: Gtk.Label;
  #activateButton: Gtk.Button;

  constructor(activateLicense: ActivateLicense) {
    // UseCase is injected (no direct infra dependency)
    this.#activateLicense = activateLicense;

    this.#entryRow = new Adw.EntryRow({ title: 'License Key' });
    this.#statusLabel = new Gtk.Label({ label: '' });
    this.#activateButton = new Gtk.Button({ label: 'Activate' });

    this.#activateButton.connect('clicked', () => {
      // Signal handler is thin - delegates immediately
      this.#onActivateClicked();
    });
  }

  async #onActivateClicked(): Promise<void> {
    const rawKey = this.#entryRow.get_text();

    this.#setLoading(true);

    // UseCase returns Result - must handle both cases
    const result = await this.#activateLicense.execute(rawKey);

    this.#setLoading(false);

    if (!result.ok) {
      // Compiler ensures error handling
      this.#showError(result.error);
      return;
    }

    // Compiler ensures value is available here
    this.#showSuccess(result.value);
  }

  #showError(error: ActivationError): void {
    // Exhaustive handling - TypeScript warns if case is missing
    switch (error.type) {
      case 'INVALID_KEY':
        this.#statusLabel.set_label('Invalid license key format');
        break;
      case 'NETWORK_ERROR':
        this.#statusLabel.set_label('Network error. Please try again.');
        break;
      case 'LICENSE_EXPIRED':
        this.#statusLabel.set_label('This license has expired');
        break;
    }
  }

  #showSuccess(license: License): void {
    const until = license.validUntil.toLocaleDateString();
    this.#statusLabel.set_label(`Activated! Valid until ${until}`);
  }

  #setLoading(loading: boolean): void {
    this.#activateButton.set_sensitive(!loading);
    this.#entryRow.set_sensitive(!loading);
  }
}

// --- Wiring (in extension entry point or prefs.ts) ---

// import { ActivateLicense } from '../usecase/licensing/activate-license';
// import { HttpLicenseApiClient } from '../infra/api/license-api-client';
// import { GSettingsLicenseRepository } from '../infra/gsettings/license-settings';
//
// const activateLicense = new ActivateLicense(
//   new GSettingsLicenseRepository(settings),
//   new HttpLicenseApiClient(),
// );
//
// const page = new LicenseSettingsPage(activateLicense);

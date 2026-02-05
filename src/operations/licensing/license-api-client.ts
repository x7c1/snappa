import type {
  ActivationId,
  ActivationResult,
  DeviceId,
  LicenseKey,
} from '../../domain/licensing/index.js';

/**
 * Interface for license API operations
 * Infrastructure layer implements this interface with HTTP calls
 */
export interface LicenseApiClient {
  /**
   * Activate a license key for a device
   */
  activate(
    licenseKey: LicenseKey,
    deviceId: DeviceId,
    deviceLabel: string
  ): Promise<ActivationResult>;

  /**
   * Validate an existing activation
   */
  validate(licenseKey: LicenseKey, activationId: ActivationId): Promise<ValidationResult>;
}

export type ValidationError =
  | 'INVALID_LICENSE_KEY'
  | 'INVALID_ACTIVATION'
  | 'LICENSE_EXPIRED'
  | 'LICENSE_CANCELLED'
  | 'DEVICE_DEACTIVATED'
  | 'NETWORK_ERROR'
  | 'BACKEND_UNREACHABLE';

export interface ValidationSuccess {
  validUntil: Date;
  subscriptionStatus: string;
}

export type ValidationResult =
  | { success: true; data: ValidationSuccess }
  | { success: false; error: ValidationError };

export const ValidationResult = {
  succeeded: (data: ValidationSuccess): ValidationResult => ({ success: true, data }),
  failed: (error: ValidationError): ValidationResult => ({ success: false, error }),
};

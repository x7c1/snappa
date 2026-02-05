import type { ActivationId } from './activation-id.js';

export type ActivationError =
  | 'INVALID_LICENSE_KEY'
  | 'LICENSE_EXPIRED'
  | 'LICENSE_CANCELLED'
  | 'NETWORK_ERROR'
  | 'BACKEND_UNREACHABLE'
  | 'UNKNOWN_ERROR';

export interface ActivationSuccessData {
  activationId: ActivationId;
  validUntil: Date;
  devicesUsed: number;
  devicesLimit: number;
  deactivatedDevice: string | null;
}

export type ActivationResult =
  | { success: true; data: ActivationSuccessData }
  | { success: false; error: ActivationError; errorMessage?: string };

export const ActivationResult = {
  succeeded: (data: ActivationSuccessData): ActivationResult => ({ success: true, data }),
  failed: (error: ActivationError, errorMessage?: string): ActivationResult => ({
    success: false,
    error,
    errorMessage,
  }),
};

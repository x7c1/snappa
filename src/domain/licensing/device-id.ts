export class InvalidDeviceIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDeviceIdError';
  }
}

const MACHINE_ID_REGEX = /^[0-9a-f]{32}$/i;
const UNKNOWN_DEVICE = 'unknown-device';

export class DeviceId {
  private readonly value: string;

  constructor(value: string) {
    if (value === UNKNOWN_DEVICE) {
      this.value = value;
      return;
    }
    const normalized = value.trim().toLowerCase();
    if (!MACHINE_ID_REGEX.test(normalized)) {
      throw new InvalidDeviceIdError(`Invalid machine-id format: ${value}`);
    }
    this.value = normalized;
  }

  static unknown(): DeviceId {
    return new DeviceId(UNKNOWN_DEVICE);
  }

  toString(): string {
    return this.value;
  }

  equals(other: DeviceId): boolean {
    return this.value === other.value;
  }

  isUnknown(): boolean {
    return this.value === UNKNOWN_DEVICE;
  }
}

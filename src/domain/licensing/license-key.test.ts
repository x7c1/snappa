import { describe, expect, it } from 'vitest';
import { InvalidLicenseKeyError, LicenseKey } from './license-key.js';

describe('LicenseKey', () => {
  describe('constructor', () => {
    it('creates a valid license key from non-empty string', () => {
      const key = new LicenseKey('ABC-123-XYZ');
      expect(key.toString()).toBe('ABC-123-XYZ');
    });

    it('trims whitespace from input', () => {
      const key = new LicenseKey('  ABC-123  ');
      expect(key.toString()).toBe('ABC-123');
    });

    it('throws InvalidLicenseKeyError for empty string', () => {
      expect(() => new LicenseKey('')).toThrow(InvalidLicenseKeyError);
      expect(() => new LicenseKey('   ')).toThrow(InvalidLicenseKeyError);
    });
  });

  describe('equals', () => {
    it('returns true for equal keys', () => {
      const key1 = new LicenseKey('ABC-123');
      const key2 = new LicenseKey('ABC-123');
      expect(key1.equals(key2)).toBe(true);
    });

    it('returns false for different keys', () => {
      const key1 = new LicenseKey('ABC-123');
      const key2 = new LicenseKey('XYZ-789');
      expect(key1.equals(key2)).toBe(false);
    });
  });
});

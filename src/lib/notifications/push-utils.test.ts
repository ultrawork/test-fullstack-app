import { describe, it, expect } from 'vitest';
import { isBrowser, base64UrlToUint8Array } from './push-utils';

describe('isBrowser', () => {
  it('should return true in jsdom environment (window is defined)', () => {
    expect(isBrowser()).toBe(true);
  });

  it('should return false when window is undefined', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error — intentionally removing window for testing
    delete globalThis.window;
    expect(isBrowser()).toBe(false);
    globalThis.window = originalWindow;
  });
});

describe('base64UrlToUint8Array', () => {
  it('should convert a standard base64url VAPID key to Uint8Array', () => {
    // Standard 65-byte VAPID public key in base64url encoding
    const base64Url =
      'BNbxGYNMhEC3ISkgnFRHGOzFGOW_GnLVKF4yX3sIjMc88wHmRoIfQCEjtIlIbCFBKqBHtLGmMiGhXiS0MBBe8Pg';
    const result = base64UrlToUint8Array(base64Url);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(65);
  });

  it('should handle base64url characters (- and _)', () => {
    // "???" in base64url is "Pz8_" and in base64 is "Pz8/"
    const base64Url = 'Pz8_';
    const result = base64UrlToUint8Array(base64Url);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result[0]).toBe(63); // '?'
    expect(result[1]).toBe(63); // '?'
    expect(result[2]).toBe(63); // '?'
  });

  it('should handle base64url with - character', () => {
    // ">>>" in base64url is "Pj4-" and in base64 is "Pj4+"
    const base64Url = 'Pj4-';
    const result = base64UrlToUint8Array(base64Url);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result[0]).toBe(62); // '>'
    expect(result[1]).toBe(62); // '>'
    expect(result[2]).toBe(62); // '>'
  });

  it('should add padding when needed', () => {
    // base64url often omits padding '='
    // "AB" = [0] in base64 is "AA" (needs ==), base64url "AA"
    const base64Url = 'AA';
    const result = base64UrlToUint8Array(base64Url);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result[0]).toBe(0);
  });

  it('should return empty Uint8Array for empty string', () => {
    const result = base64UrlToUint8Array('');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });
});

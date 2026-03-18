import { describe, it, expect } from "vitest";
import {
  isNonEmptyString,
  isBase64UrlString,
  validatePushSubscription,
  validateUnsubscribe,
} from "./push";

describe("isNonEmptyString", () => {
  it("returns true for non-empty string", () => {
    expect(isNonEmptyString("hello")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isNonEmptyString("")).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(isNonEmptyString("   ")).toBe(false);
  });

  it("returns false for non-string values", () => {
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
  });
});

describe("isBase64UrlString", () => {
  it("returns true for valid base64url string", () => {
    expect(isBase64UrlString("SGVsbG8gV29ybGQ")).toBe(true);
    expect(isBase64UrlString("abc-def_ghi")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isBase64UrlString("")).toBe(false);
  });

  it("returns false for string with invalid characters", () => {
    expect(isBase64UrlString("abc+def")).toBe(false);
    expect(isBase64UrlString("abc/def")).toBe(false);
    expect(isBase64UrlString("abc def")).toBe(false);
  });

  it("returns false for non-string values", () => {
    expect(isBase64UrlString(null)).toBe(false);
    expect(isBase64UrlString(42)).toBe(false);
  });
});

describe("validatePushSubscription", () => {
  const validPayload = {
    endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
    keys: {
      p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8p8",
      auth: "tBHItJI5svbpC7sc9FMw",
    },
  };

  it("returns empty errors for valid subscription", () => {
    const errors = validatePushSubscription(validPayload);
    expect(errors).toEqual([]);
  });

  it("returns empty errors when optional expirationTime is provided", () => {
    const errors = validatePushSubscription({
      ...validPayload,
      expirationTime: 1234567890,
    });
    expect(errors).toEqual([]);
  });

  it("returns empty errors when optional userId is provided", () => {
    const errors = validatePushSubscription({
      ...validPayload,
      userId: "user-123",
    });
    expect(errors).toEqual([]);
  });

  it("returns error when endpoint is missing", () => {
    const errors = validatePushSubscription({ keys: validPayload.keys });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("endpoint"))).toBe(true);
  });

  it("returns error when endpoint is empty string", () => {
    const errors = validatePushSubscription({
      endpoint: "",
      keys: validPayload.keys,
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("endpoint"))).toBe(true);
  });

  it("returns error when endpoint is not a valid URL", () => {
    const errors = validatePushSubscription({
      endpoint: "not-a-url",
      keys: validPayload.keys,
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("endpoint"))).toBe(true);
  });

  it("returns error when keys is missing", () => {
    const errors = validatePushSubscription({
      endpoint: validPayload.endpoint,
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("keys"))).toBe(true);
  });

  it("returns error when keys.p256dh is missing", () => {
    const errors = validatePushSubscription({
      endpoint: validPayload.endpoint,
      keys: { auth: validPayload.keys.auth },
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("p256dh"))).toBe(true);
  });

  it("returns error when keys.auth is missing", () => {
    const errors = validatePushSubscription({
      endpoint: validPayload.endpoint,
      keys: { p256dh: validPayload.keys.p256dh },
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("auth"))).toBe(true);
  });

  it("returns error when keys.p256dh is not valid base64url", () => {
    const errors = validatePushSubscription({
      endpoint: validPayload.endpoint,
      keys: { p256dh: "invalid+chars/here", auth: validPayload.keys.auth },
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("p256dh"))).toBe(true);
  });

  it("returns error when keys.auth is not valid base64url", () => {
    const errors = validatePushSubscription({
      endpoint: validPayload.endpoint,
      keys: { p256dh: validPayload.keys.p256dh, auth: "invalid+chars" },
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("auth"))).toBe(true);
  });

  it("returns multiple errors when multiple fields are invalid", () => {
    const errors = validatePushSubscription({});
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it("handles null/undefined input", () => {
    const errors = validatePushSubscription(null);
    expect(errors.length).toBeGreaterThan(0);

    const errors2 = validatePushSubscription(undefined);
    expect(errors2.length).toBeGreaterThan(0);
  });
});

describe("validateUnsubscribe", () => {
  it("returns empty errors for valid endpoint", () => {
    const errors = validateUnsubscribe({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
    });
    expect(errors).toEqual([]);
  });

  it("returns error when endpoint is missing", () => {
    const errors = validateUnsubscribe({});
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("endpoint"))).toBe(true);
  });

  it("returns error when endpoint is empty", () => {
    const errors = validateUnsubscribe({ endpoint: "" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when endpoint is not a valid URL", () => {
    const errors = validateUnsubscribe({ endpoint: "not-a-url" });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("endpoint"))).toBe(true);
  });

  it("handles null/undefined input", () => {
    const errors = validateUnsubscribe(null);
    expect(errors.length).toBeGreaterThan(0);

    const errors2 = validateUnsubscribe(undefined);
    expect(errors2.length).toBeGreaterThan(0);
  });
});

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
  });
});

describe("isBase64UrlString", () => {
  it("returns true for valid base64url string", () => {
    expect(isBase64UrlString("abc123_-")).toBe(true);
    expect(isBase64UrlString("dGVzdA==")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isBase64UrlString("")).toBe(false);
  });

  it("returns false for string with invalid characters", () => {
    expect(isBase64UrlString("abc!@#")).toBe(false);
  });

  it("returns false for non-string values", () => {
    expect(isBase64UrlString(null)).toBe(false);
    expect(isBase64UrlString(42)).toBe(false);
  });
});

describe("validatePushSubscription", () => {
  const validBody = {
    endpoint: "https://push.example.com/send/abc123",
    keys: {
      p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8p8REfWLk=",
      auth: "tBHItJI5svbpC7-BHnIB3w==",
    },
  };

  it("returns empty array for valid body", () => {
    expect(validatePushSubscription(validBody)).toEqual([]);
  });

  it("returns error for null body", () => {
    const errors = validatePushSubscription(null);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("object");
  });

  it("returns error for missing endpoint", () => {
    const errors = validatePushSubscription({ keys: validBody.keys });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("endpoint");
  });

  it("returns error for invalid endpoint URL", () => {
    const errors = validatePushSubscription({
      ...validBody,
      endpoint: "not-a-url",
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("URL");
  });

  it("returns error for missing keys", () => {
    const errors = validatePushSubscription({ endpoint: validBody.endpoint });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("keys");
  });

  it("returns error for missing keys.p256dh", () => {
    const errors = validatePushSubscription({
      endpoint: validBody.endpoint,
      keys: { auth: validBody.keys.auth },
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("p256dh");
  });

  it("returns error for missing keys.auth", () => {
    const errors = validatePushSubscription({
      endpoint: validBody.endpoint,
      keys: { p256dh: validBody.keys.p256dh },
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("auth");
  });
});

describe("validateUnsubscribe", () => {
  it("returns empty array for valid body", () => {
    expect(
      validateUnsubscribe({ endpoint: "https://push.example.com/send/abc123" })
    ).toEqual([]);
  });

  it("returns error for null body", () => {
    const errors = validateUnsubscribe(null);
    expect(errors).toHaveLength(1);
  });

  it("returns error for missing endpoint", () => {
    const errors = validateUnsubscribe({});
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("endpoint");
  });

  it("returns error for invalid endpoint URL", () => {
    const errors = validateUnsubscribe({ endpoint: "not-a-url" });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("URL");
  });
});

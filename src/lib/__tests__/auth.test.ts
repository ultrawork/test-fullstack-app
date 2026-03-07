// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../auth";

beforeEach(() => {
  vi.stubEnv("JWT_SECRET", "test-jwt-secret-key-for-testing");
  vi.stubEnv("JWT_REFRESH_SECRET", "test-jwt-refresh-secret-key-for-testing");
});

describe("hashPassword", () => {
  it("should hash a password", async () => {
    const hash = await hashPassword("password123");
    expect(hash).toBeDefined();
    expect(hash).not.toBe("password123");
  });

  it("should produce different hashes for the same password", async () => {
    const hash1 = await hashPassword("password123");
    const hash2 = await hashPassword("password123");
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  it("should verify correct password", async () => {
    const hash = await hashPassword("password123");
    const isValid = await verifyPassword("password123", hash);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const hash = await hashPassword("password123");
    const isValid = await verifyPassword("wrongpassword", hash);
    expect(isValid).toBe(false);
  });
});

describe("generateAccessToken / verifyAccessToken", () => {
  it("should generate and verify a valid access token", async () => {
    const token = await generateAccessToken("user-123", "test@example.com");
    expect(token).toBeDefined();

    const payload = await verifyAccessToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe("user-123");
    expect(payload?.email).toBe("test@example.com");
  });

  it("should return null for invalid token", async () => {
    const payload = await verifyAccessToken("invalid-token");
    expect(payload).toBeNull();
  });
});

describe("generateRefreshToken / verifyRefreshToken", () => {
  it("should generate and verify a valid refresh token", async () => {
    const token = await generateRefreshToken("user-456", "user@test.com");
    expect(token).toBeDefined();

    const payload = await verifyRefreshToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe("user-456");
    expect(payload?.email).toBe("user@test.com");
  });

  it("should return null for invalid refresh token", async () => {
    const payload = await verifyRefreshToken("invalid-token");
    expect(payload).toBeNull();
  });

  it("should not verify access token as refresh token", async () => {
    const accessToken = await generateAccessToken("user-123", "test@example.com");
    const payload = await verifyRefreshToken(accessToken);
    expect(payload).toBeNull();
  });
});

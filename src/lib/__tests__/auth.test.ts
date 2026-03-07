// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../auth";

// Mock jose and env vars
vi.stubEnv("JWT_SECRET", "test-secret-key-at-least-32-characters-long");
vi.stubEnv("JWT_REFRESH_SECRET", "test-refresh-secret-key-at-least-32-chars");

describe("Auth utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const hash = await hashPassword("password123");
      expect(hash).not.toBe("password123");
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it("should produce different hashes for same password", async () => {
      const hash1 = await hashPassword("password123");
      const hash2 = await hashPassword("password123");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching password", async () => {
      const hash = await hashPassword("password123");
      const result = await comparePassword("password123", hash);
      expect(result).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const hash = await hashPassword("password123");
      const result = await comparePassword("wrongpassword", hash);
      expect(result).toBe(false);
    });
  });

  describe("generateAccessToken", () => {
    it("should generate a valid JWT string", async () => {
      const token = await generateAccessToken({
        userId: "user-1",
        email: "test@example.com",
      });
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify and return payload from valid token", async () => {
      const payload = { userId: "user-1", email: "test@example.com" };
      const token = await generateAccessToken(payload);
      const result = await verifyAccessToken(token);
      expect(result.userId).toBe(payload.userId);
      expect(result.email).toBe(payload.email);
    });

    it("should reject an invalid token", async () => {
      await expect(verifyAccessToken("invalid.token.here")).rejects.toThrow();
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid JWT string", async () => {
      const token = await generateRefreshToken({
        userId: "user-1",
        email: "test@example.com",
      });
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify and return payload from valid token", async () => {
      const payload = { userId: "user-1", email: "test@example.com" };
      const token = await generateRefreshToken(payload);
      const result = await verifyRefreshToken(token);
      expect(result.userId).toBe(payload.userId);
      expect(result.email).toBe(payload.email);
    });

    it("should reject an access token used as refresh token", async () => {
      const token = await generateAccessToken({
        userId: "user-1",
        email: "test@example.com",
      });
      await expect(verifyRefreshToken(token)).rejects.toThrow();
    });
  });
});

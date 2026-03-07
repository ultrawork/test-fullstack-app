import { describe, it, expect, vi } from "vitest";
import { hashPassword, comparePassword } from "../auth";

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
});

import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  createNoteSchema,
  createTagSchema,
  updateTagSchema,
  attachTagsSchema,
} from "../validation";

describe("Validation schemas", () => {
  describe("loginSchema", () => {
    it("should validate correct input", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "pass",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid",
        password: "pass",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should validate correct input", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        name: "John",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject short name", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        name: "J",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        name: "John",
        password: "short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createTagSchema", () => {
    it("should validate correct input", () => {
      const result = createTagSchema.safeParse({
        name: "Work",
        color: "#FF0000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const result = createTagSchema.safeParse({ name: "", color: "#FF0000" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid color", () => {
      const result = createTagSchema.safeParse({ name: "Work", color: "red" });
      expect(result.success).toBe(false);
    });

    it("should reject color without hash", () => {
      const result = createTagSchema.safeParse({
        name: "Work",
        color: "FF0000",
      });
      expect(result.success).toBe(false);
    });

    it("should accept lowercase hex", () => {
      const result = createTagSchema.safeParse({
        name: "Work",
        color: "#ff00aa",
      });
      expect(result.success).toBe(true);
    });

    it("should reject name longer than 50 chars", () => {
      const result = createTagSchema.safeParse({
        name: "a".repeat(51),
        color: "#FF0000",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateTagSchema", () => {
    it("should validate partial update with name only", () => {
      const result = updateTagSchema.safeParse({ name: "Updated" });
      expect(result.success).toBe(true);
    });

    it("should validate partial update with color only", () => {
      const result = updateTagSchema.safeParse({ color: "#00FF00" });
      expect(result.success).toBe(true);
    });

    it("should reject empty object", () => {
      const result = updateTagSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("createNoteSchema", () => {
    it("should validate correct input", () => {
      const result = createNoteSchema.safeParse({
        title: "Test Note",
        content: "Content here",
      });
      expect(result.success).toBe(true);
    });

    it("should accept with tagIds", () => {
      const result = createNoteSchema.safeParse({
        title: "Test Note",
        content: "Content here",
        tagIds: ["clxxxxxxxxxxxxxxxxx"],
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = createNoteSchema.safeParse({
        title: "",
        content: "Content here",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("attachTagsSchema", () => {
    it("should validate array of cuid strings", () => {
      const result = attachTagsSchema.safeParse({ tagIds: [] });
      expect(result.success).toBe(true);
    });
  });
});

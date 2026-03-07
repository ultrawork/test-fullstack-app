import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  createNoteSchema,
  updateNoteSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validation";

describe("registerSchema", () => {
  it("should validate correct input", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
      name: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = registerSchema.safeParse({
      email: "invalid",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject mismatched passwords", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
  });

  it("should allow optional name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("should validate correct input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("createNoteSchema", () => {
  it("should validate correct input", () => {
    const result = createNoteSchema.safeParse({
      title: "Test Note",
      content: "Some content",
    });
    expect(result.success).toBe(true);
  });

  it("should accept optional categoryId", () => {
    const result = createNoteSchema.safeParse({
      title: "Test Note",
      content: "Some content",
      categoryId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty title", () => {
    const result = createNoteSchema.safeParse({
      title: "",
      content: "Some content",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty content", () => {
    const result = createNoteSchema.safeParse({
      title: "Test",
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid categoryId", () => {
    const result = createNoteSchema.safeParse({
      title: "Test",
      content: "Content",
      categoryId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateNoteSchema", () => {
  it("should validate partial update", () => {
    const result = updateNoteSchema.safeParse({ title: "Updated Title" });
    expect(result.success).toBe(true);
  });

  it("should allow nullable categoryId", () => {
    const result = updateNoteSchema.safeParse({ categoryId: null });
    expect(result.success).toBe(true);
  });

  it("should allow empty object", () => {
    const result = updateNoteSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("createCategorySchema", () => {
  it("should validate correct input", () => {
    const result = createCategorySchema.safeParse({ name: "Work" });
    expect(result.success).toBe(true);
  });

  it("should accept optional color", () => {
    const result = createCategorySchema.safeParse({
      name: "Work",
      color: "#FF5733",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = createCategorySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid color format", () => {
    const result = createCategorySchema.safeParse({
      name: "Work",
      color: "red",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCategorySchema", () => {
  it("should validate partial update", () => {
    const result = updateCategorySchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(true);
  });

  it("should allow empty object", () => {
    const result = updateCategorySchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

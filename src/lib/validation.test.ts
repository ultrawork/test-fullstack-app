import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateTagName,
  validateHexColor,
  validateUUID,
  validateNoteTitle,
  validateNoteContent,
} from "./validation";

describe("validateEmail", () => {
  it("accepts valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(validateEmail("notanemail")).toBe(false);
    expect(validateEmail("")).toBe(false);
    expect(validateEmail(123)).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts valid password", () => {
    expect(validatePassword("123456")).toBe(true);
  });

  it("rejects short password", () => {
    expect(validatePassword("12345")).toBe(false);
    expect(validatePassword("")).toBe(false);
  });
});

describe("validateName", () => {
  it("accepts valid name", () => {
    expect(validateName("John")).toBe(true);
  });

  it("rejects empty or too long name", () => {
    expect(validateName("")).toBe(false);
    expect(validateName("a".repeat(101))).toBe(false);
  });
});

describe("validateTagName", () => {
  it("accepts valid tag name", () => {
    expect(validateTagName("Work")).toBe(true);
  });

  it("rejects empty or too long tag name", () => {
    expect(validateTagName("")).toBe(false);
    expect(validateTagName("a".repeat(51))).toBe(false);
  });
});

describe("validateHexColor", () => {
  it("accepts valid hex color", () => {
    expect(validateHexColor("#FF0000")).toBe(true);
    expect(validateHexColor("#abcdef")).toBe(true);
  });

  it("rejects invalid hex color", () => {
    expect(validateHexColor("red")).toBe(false);
    expect(validateHexColor("#FFF")).toBe(false);
    expect(validateHexColor("#GGGGGG")).toBe(false);
  });
});

describe("validateUUID", () => {
  it("accepts valid UUID", () => {
    expect(validateUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects invalid UUID", () => {
    expect(validateUUID("not-a-uuid")).toBe(false);
    expect(validateUUID("")).toBe(false);
  });
});

describe("validateNoteTitle", () => {
  it("accepts valid title", () => {
    expect(validateNoteTitle("My Note")).toBe(true);
  });

  it("rejects empty or too long title", () => {
    expect(validateNoteTitle("")).toBe(false);
    expect(validateNoteTitle("a".repeat(201))).toBe(false);
  });
});

describe("validateNoteContent", () => {
  it("accepts valid content", () => {
    expect(validateNoteContent("Hello world")).toBe(true);
    expect(validateNoteContent("")).toBe(true);
  });

  it("rejects too long content", () => {
    expect(validateNoteContent("a".repeat(50001))).toBe(false);
  });
});

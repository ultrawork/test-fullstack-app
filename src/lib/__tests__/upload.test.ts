import { describe, it, expect } from "vitest";
import {
  IMAGE_CONSTRAINTS,
  generateFilename,
  validateImageFile,
  validateMagicBytes,
  getPublicPath,
  formatNoteImage,
} from "../upload";

describe("upload utilities", () => {
  describe("IMAGE_CONSTRAINTS", () => {
    it("should have max file size of 5MB", () => {
      expect(IMAGE_CONSTRAINTS.MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    });

    it("should allow max 5 images per note", () => {
      expect(IMAGE_CONSTRAINTS.MAX_IMAGES_PER_NOTE).toBe(5);
    });

    it("should allow JPEG and PNG", () => {
      expect(IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES).toContain("image/jpeg");
      expect(IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES).toContain("image/png");
    });
  });

  describe("generateFilename", () => {
    it("should generate unique filename with .jpg for image/jpeg", () => {
      const result = generateFilename("image/jpeg");
      expect(result).toMatch(/^\d+-[a-z0-9]+\.jpg$/);
    });

    it("should generate filename with .png for image/png", () => {
      const result = generateFilename("image/png");
      expect(result).toMatch(/\.png$/);
    });

    it("should generate different filenames", () => {
      const a = generateFilename("image/jpeg");
      const b = generateFilename("image/jpeg");
      expect(a).not.toBe(b);
    });
  });

  describe("validateImageFile", () => {
    it("should accept valid JPEG file", () => {
      const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
      expect(validateImageFile(file)).toEqual({ valid: true });
    });

    it("should accept valid PNG file", () => {
      const file = new File(["test"], "photo.png", { type: "image/png" });
      expect(validateImageFile(file)).toEqual({ valid: true });
    });

    it("should reject invalid mime type", () => {
      const file = new File(["test"], "photo.gif", { type: "image/gif" });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("Invalid file type");
      }
    });

    it("should reject invalid file extension", () => {
      const file = new File(["test"], "evil.html", { type: "image/jpeg" });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("Invalid file extension");
      }
    });

    it("should reject file exceeding size limit", () => {
      const largeContent = new Uint8Array(6 * 1024 * 1024);
      const file = new File([largeContent], "large.jpg", {
        type: "image/jpeg",
      });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("File too large");
      }
    });
  });

  describe("validateMagicBytes", () => {
    it("should accept valid JPEG magic bytes", () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
      expect(validateMagicBytes(buffer, "image/jpeg")).toBe(true);
    });

    it("should accept valid PNG magic bytes", () => {
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
      ]);
      expect(validateMagicBytes(buffer, "image/png")).toBe(true);
    });

    it("should reject invalid magic bytes", () => {
      const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      expect(validateMagicBytes(buffer, "image/jpeg")).toBe(false);
    });

    it("should reject unknown mime type", () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff]);
      expect(validateMagicBytes(buffer, "image/gif")).toBe(false);
    });
  });

  describe("formatNoteImage", () => {
    it("should format note image with ISO date string", () => {
      const date = new Date("2024-01-01T00:00:00.000Z");
      const result = formatNoteImage({
        id: "img1",
        filename: "photo.jpg",
        path: "/uploads/images/1/photo.jpg",
        mimeType: "image/jpeg",
        size: 1024,
        order: 0,
        createdAt: date,
      });
      expect(result).toEqual({
        id: "img1",
        filename: "photo.jpg",
        path: "/uploads/images/1/photo.jpg",
        mimeType: "image/jpeg",
        size: 1024,
        order: 0,
        createdAt: "2024-01-01T00:00:00.000Z",
      });
    });
  });

  describe("getPublicPath", () => {
    it("should return correct public path", () => {
      expect(getPublicPath("note123", "photo.jpg")).toBe(
        "/uploads/images/note123/photo.jpg",
      );
    });
  });
});

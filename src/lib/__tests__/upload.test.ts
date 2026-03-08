import { describe, it, expect } from "vitest";
import {
  IMAGE_CONSTRAINTS,
  generateFilename,
  validateImageFile,
  getPublicPath,
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
    it("should generate unique filename with correct extension", () => {
      const result = generateFilename("photo.jpg");
      expect(result).toMatch(/^\d+-[a-z0-9]+\.jpg$/);
    });

    it("should handle .png extension", () => {
      const result = generateFilename("image.PNG");
      expect(result).toMatch(/\.png$/);
    });

    it("should generate different filenames", () => {
      const a = generateFilename("test.jpg");
      const b = generateFilename("test.jpg");
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

  describe("getPublicPath", () => {
    it("should return correct public path", () => {
      expect(getPublicPath("note123", "photo.jpg")).toBe(
        "/uploads/images/note123/photo.jpg",
      );
    });
  });
});

import { describe, it, expect } from "vitest";
import type { Attachment, Tag, Note } from "./note";

/**
 * Compile-time type assertions for domain types.
 * These tests verify that the types have the correct shape
 * and enforce strict typing (no any, correct optionality).
 */

describe("Attachment type", () => {
  it("should accept a valid Attachment object", () => {
    const attachment: Attachment = {
      id: "att-1",
      type: "image",
      filename: "screenshot.png",
      mimeType: "image/png",
      size: 1024,
      url: "https://example.com/files/screenshot.png",
      createdAt: new Date("2025-01-01T00:00:00Z"),
    };

    expect(attachment.id).toBe("att-1");
    expect(attachment.type).toBe("image");
    expect(attachment.filename).toBe("screenshot.png");
    expect(attachment.mimeType).toBe("image/png");
    expect(attachment.size).toBe(1024);
    expect(attachment.url).toBe("https://example.com/files/screenshot.png");
    expect(attachment.createdAt).toEqual(new Date("2025-01-01T00:00:00Z"));
  });

  it("should accept optional previewUrl", () => {
    const withPreview: Attachment = {
      id: "att-2",
      type: "image",
      filename: "photo.jpg",
      mimeType: "image/jpeg",
      size: 2048,
      url: "https://example.com/files/photo.jpg",
      previewUrl: "https://example.com/files/photo_thumb.jpg",
      createdAt: new Date("2025-06-15T12:00:00Z"),
    };

    expect(withPreview.previewUrl).toBe(
      "https://example.com/files/photo_thumb.jpg"
    );

    const withoutPreview: Attachment = {
      id: "att-3",
      type: "document",
      filename: "report.pdf",
      mimeType: "application/pdf",
      size: 4096,
      url: "https://example.com/files/report.pdf",
      createdAt: new Date("2025-06-15T12:00:00Z"),
    };

    expect(withoutPreview.previewUrl).toBeUndefined();
  });
});

describe("Tag type", () => {
  it("should accept a valid Tag object", () => {
    const tag: Tag = {
      id: "tag-1",
      name: "important",
    };

    expect(tag.id).toBe("tag-1");
    expect(tag.name).toBe("important");
  });

  it("should accept optional color", () => {
    const withColor: Tag = {
      id: "tag-2",
      name: "work",
      color: "#ff0000",
    };

    expect(withColor.color).toBe("#ff0000");

    const withoutColor: Tag = {
      id: "tag-3",
      name: "personal",
    };

    expect(withoutColor.color).toBeUndefined();
  });
});

describe("Note type", () => {
  it("should accept a valid Note object", () => {
    const note: Note = {
      id: "note-1",
      title: "My First Note",
      content: "This is the content of the note.",
      tags: [],
      attachments: [],
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-02T00:00:00Z"),
    };

    expect(note.id).toBe("note-1");
    expect(note.title).toBe("My First Note");
    expect(note.content).toBe("This is the content of the note.");
    expect(note.tags).toEqual([]);
    expect(note.attachments).toEqual([]);
    expect(note.createdAt).toEqual(new Date("2025-01-01T00:00:00Z"));
    expect(note.updatedAt).toEqual(new Date("2025-01-02T00:00:00Z"));
  });

  it("should accept Note with tags and attachments", () => {
    const tag: Tag = { id: "tag-1", name: "work", color: "#00ff00" };
    const attachment: Attachment = {
      id: "att-1",
      type: "image",
      filename: "diagram.png",
      mimeType: "image/png",
      size: 8192,
      url: "https://example.com/files/diagram.png",
      previewUrl: "https://example.com/files/diagram_thumb.png",
      createdAt: new Date("2025-03-01T10:00:00Z"),
    };

    const note: Note = {
      id: "note-2",
      title: "Work Meeting Notes",
      content: "Discussion about project timeline.",
      tags: [tag],
      attachments: [attachment],
      createdAt: new Date("2025-03-01T09:00:00Z"),
      updatedAt: new Date("2025-03-01T11:00:00Z"),
    };

    expect(note.tags).toHaveLength(1);
    expect(note.tags[0].name).toBe("work");
    expect(note.attachments).toHaveLength(1);
    expect(note.attachments[0].filename).toBe("diagram.png");
  });
});

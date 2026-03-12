import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatNoteAsText,
  sanitizeFilename,
  downloadNoteAsTextFile,
} from "../export-note";
import type { Note } from "@/types/note";

const baseNote: Note = {
  id: "1",
  title: "Test Note",
  content: "Hello world",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-16T12:00:00Z",
};

describe("sanitizeFilename", () => {
  it("replaces forbidden characters with underscores", () => {
    expect(sanitizeFilename('file<>:"/\\|?*name')).toBe("file_name");
  });

  it("collapses multiple spaces into a single underscore", () => {
    expect(sanitizeFilename("hello   world")).toBe("hello_world");
  });

  it("trims leading and trailing underscores", () => {
    expect(sanitizeFilename("  hello  ")).toBe("hello");
  });

  it("truncates to 200 characters", () => {
    const longName = "a".repeat(250);
    expect(sanitizeFilename(longName).length).toBe(200);
  });

  it("returns 'note' for empty string after sanitization", () => {
    expect(sanitizeFilename("***")).toBe("note");
  });

  it("handles Cyrillic characters", () => {
    expect(sanitizeFilename("Моя заметка")).toBe("Моя_заметка");
  });
});

describe("formatNoteAsText", () => {
  it("includes title and dates", () => {
    const text = formatNoteAsText(baseNote);
    expect(text).toContain("Title: Test Note");
    expect(text).toContain("Created: 2024-01-15T10:00:00Z");
    expect(text).toContain("Updated: 2024-01-16T12:00:00Z");
  });

  it("includes content after separator", () => {
    const text = formatNoteAsText(baseNote);
    const parts = text.split("---");
    expect(parts[1].trim()).toBe("Hello world");
  });

  it("includes category when present", () => {
    const note: Note = { ...baseNote, category: "Work" };
    const text = formatNoteAsText(note);
    expect(text).toContain("Category: Work");
  });

  it("does not include category line when absent", () => {
    const text = formatNoteAsText(baseNote);
    expect(text).not.toContain("Category:");
  });

  it("includes tags when present", () => {
    const note: Note = { ...baseNote, tags: ["urgent", "todo"] };
    const text = formatNoteAsText(note);
    expect(text).toContain("Tags: urgent, todo");
  });

  it("does not include tags line when tags are empty", () => {
    const note: Note = { ...baseNote, tags: [] };
    const text = formatNoteAsText(note);
    expect(text).not.toContain("Tags:");
  });
});

describe("downloadNoteAsTextFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a link and triggers download", () => {
    const clickSpy = vi.fn();
    const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    const removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);

    vi.spyOn(document, "createElement").mockReturnValue({
      set href(_: string) { /* noop */ },
      set download(_: string) { /* noop */ },
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    const revokeObjectURLSpy = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn().mockReturnValue("blob:mock-url"),
      revokeObjectURL: revokeObjectURLSpy,
    });

    downloadNoteAsTextFile(baseNote);

    expect(appendChildSpy).toHaveBeenCalledOnce();
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(removeChildSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });
});

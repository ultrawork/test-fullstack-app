import { describe, it, expect, beforeEach } from "vitest";
import { getNotes, resetNotes, NotFoundError } from "./notesService";

beforeEach(() => {
  resetNotes();
});

describe("NotFoundError", () => {
  it("is an instance of Error", () => {
    const error = new NotFoundError("note-999");
    expect(error).toBeInstanceOf(Error);
  });

  it("has name 'NotFoundError'", () => {
    const error = new NotFoundError("note-999");
    expect(error.name).toBe("NotFoundError");
  });

  it("contains the id in message", () => {
    const error = new NotFoundError("note-42");
    expect(error.message).toContain("note-42");
  });
});

describe("getNotes", () => {
  it("returns only active notes when includeArchived is false", () => {
    const notes = getNotes({ includeArchived: false });
    for (const note of notes) {
      expect(note.archivedAt).toBeNull();
    }
  });

  it("returns all notes (including archived) when includeArchived is true", () => {
    const notes = getNotes({ includeArchived: true });
    const archived = notes.filter((n) => n.archivedAt !== null);
    expect(archived.length).toBeGreaterThanOrEqual(1);
  });

  it("defaults to active-only notes when no options provided", () => {
    const notes = getNotes();
    for (const note of notes) {
      expect(note.archivedAt).toBeNull();
    }
  });

  it("returns copies — mutating result does not affect stored data", () => {
    const notes1 = getNotes();
    notes1[0].title = "MUTATED";
    const notes2 = getNotes();
    expect(notes2[0].title).not.toBe("MUTATED");
  });
});

describe("resetNotes", () => {
  it("restores original state after mutations", () => {
    const before = getNotes({ includeArchived: true });
    // resetNotes already called in beforeEach, just verify it works
    resetNotes();
    const after = getNotes({ includeArchived: true });
    expect(after.length).toBe(before.length);
  });
});

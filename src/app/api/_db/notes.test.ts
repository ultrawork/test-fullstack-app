import { describe, it, expect, beforeEach } from "vitest";
import {
  listNotes,
  findNote,
  updateNote,
  resetDb,
  addTagToNote,
  removeTagFromNote,
  listTags,
} from "./notes";
import type { Note } from "@/types/note";

beforeEach(() => {
  resetDb();
});

describe("listNotes", () => {
  it("returns an array of notes", () => {
    const notes = listNotes();
    expect(Array.isArray(notes)).toBe(true);
  });

  it("returns at least 3 notes", () => {
    const notes = listNotes();
    expect(notes.length).toBeGreaterThanOrEqual(3);
  });

  it("each note has required fields", () => {
    const notes = listNotes();
    for (const note of notes) {
      expect(note).toHaveProperty("id");
      expect(note).toHaveProperty("title");
      expect(note).toHaveProperty("content");
      expect(note).toHaveProperty("archivedAt");
      expect(note).toHaveProperty("createdAt");
      expect(note).toHaveProperty("updatedAt");
    }
  });

  it("contains at least one active note (archivedAt === null)", () => {
    const notes = listNotes();
    const active = notes.filter((n: Note) => n.archivedAt === null);
    expect(active.length).toBeGreaterThanOrEqual(1);
  });

  it("contains at least one archived note (archivedAt is ISO string)", () => {
    const notes = listNotes();
    const archived = notes.filter((n: Note) => n.archivedAt !== null);
    expect(archived.length).toBeGreaterThanOrEqual(1);
    for (const note of archived) {
      expect(typeof note.archivedAt).toBe("string");
      expect(() => new Date(note.archivedAt as string)).not.toThrow();
    }
  });

  it("returns copies — mutating result does not affect stored data", () => {
    const notes1 = listNotes();
    notes1[0].title = "MUTATED";
    const notes2 = listNotes();
    expect(notes2[0].title).not.toBe("MUTATED");
  });
});

describe("findNote", () => {
  it("returns the note by id", () => {
    const [first] = listNotes();
    const found = findNote(first.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
  });

  it("returns undefined for unknown id", () => {
    expect(findNote("non-existent-id")).toBeUndefined();
  });

  it("returns a copy — mutating result does not affect stored data", () => {
    const [first] = listNotes();
    const found = findNote(first.id)!;
    found.title = "MUTATED";
    expect(findNote(first.id)?.title).not.toBe("MUTATED");
  });
});

describe("updateNote", () => {
  it("updates title and returns updated note", () => {
    const [first] = listNotes();
    const updated = updateNote(first.id, { title: "New Title" });
    expect(updated).toBeDefined();
    expect(updated?.title).toBe("New Title");
  });

  it("updates content", () => {
    const [first] = listNotes();
    const updated = updateNote(first.id, { content: "New content" });
    expect(updated?.content).toBe("New content");
  });

  it("updates archivedAt", () => {
    const notes = listNotes();
    const active = notes.find((n) => n.archivedAt === null)!;
    const iso = new Date().toISOString();
    const updated = updateNote(active.id, { archivedAt: iso });
    expect(updated?.archivedAt).toBe(iso);
  });

  it("automatically updates updatedAt", () => {
    const [first] = listNotes();
    const originalUpdatedAt = first.updatedAt;
    const updated = updateNote(first.id, { title: "Changed" });
    expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
  });

  it("persists changes — findNote reflects update", () => {
    const [first] = listNotes();
    updateNote(first.id, { title: "Persisted" });
    expect(findNote(first.id)?.title).toBe("Persisted");
  });

  it("returns undefined for unknown id", () => {
    expect(updateNote("no-such-id", { title: "X" })).toBeUndefined();
  });

  it("returns a copy — mutating result does not affect stored data", () => {
    const [first] = listNotes();
    const updated = updateNote(first.id, { title: "Copy Test" })!;
    updated.title = "MUTATED";
    expect(findNote(first.id)?.title).toBe("Copy Test");
  });
});

describe("resetDb", () => {
  it("restores original notes after mutations", () => {
    const [first] = listNotes();
    updateNote(first.id, { title: "Changed" });
    resetDb();
    const restored = findNote(first.id);
    expect(restored?.title).not.toBe("Changed");
  });

  it("returns the same number of notes after reset", () => {
    const countBefore = listNotes().length;
    listNotes().forEach((n) => updateNote(n.id, { title: "x" }));
    resetDb();
    expect(listNotes().length).toBe(countBefore);
  });
});

describe("addTagToNote", () => {
  it("adds trimmed tag and updates updatedAt", () => {
    const notes = listNotes();
    const noteWithoutTags = notes.find((n) => n.tags.length === 0)!;
    const originalUpdatedAt = noteWithoutTags.updatedAt;

    const result = addTagToNote(noteWithoutTags.id, " work ");

    expect(result).toBeDefined();
    expect(result?.tags).toContain("work");
    expect(result?.tags.filter((t) => t === "work").length).toBe(1);
    expect(result?.updatedAt).not.toBe(originalUpdatedAt);
  });

  it("deduplicates and does not update updatedAt on duplicate", () => {
    const notes = listNotes();
    const noteWithWork = notes.find((n) => n.tags.includes("work"))!;
    const originalLength = noteWithWork.tags.length;
    const originalUpdatedAt = noteWithWork.updatedAt;

    const result = addTagToNote(noteWithWork.id, "work");

    expect(result).toBeDefined();
    expect(result?.tags.length).toBe(originalLength);
    expect(result?.updatedAt).toBe(originalUpdatedAt);
  });

  it("returns undefined for unknown id", () => {
    expect(addTagToNote("no-such-id", "x")).toBeUndefined();
  });

  it("no-op on empty tag (whitespace only)", () => {
    const [first] = listNotes();
    const originalLength = first.tags.length;
    const originalUpdatedAt = first.updatedAt;

    const result = addTagToNote(first.id, "   ");

    expect(result?.tags.length).toBe(originalLength);
    expect(result?.updatedAt).toBe(originalUpdatedAt);
  });

  it("persists changes — findNote reflects added tag", () => {
    const notes = listNotes();
    const noteWithoutTags = notes.find((n) => n.tags.length === 0)!;

    addTagToNote(noteWithoutTags.id, "newTag");

    expect(findNote(noteWithoutTags.id)?.tags).toContain("newTag");
  });
});

describe("removeTagFromNote", () => {
  it("removes existing tag and updates updatedAt", () => {
    const notes = listNotes();
    const noteWithUrgent = notes.find((n) => n.tags.includes("urgent"))!;
    const originalUpdatedAt = noteWithUrgent.updatedAt;

    const result = removeTagFromNote(noteWithUrgent.id, " urgent ");

    expect(result).toBeDefined();
    expect(result?.tags).not.toContain("urgent");
    expect(result?.updatedAt).not.toBe(originalUpdatedAt);
  });

  it("no-op when tag not present (updatedAt unchanged)", () => {
    const [first] = listNotes();
    const originalUpdatedAt = first.updatedAt;

    const result = removeTagFromNote(first.id, "not-exists");

    expect(result?.updatedAt).toBe(originalUpdatedAt);
  });

  it("returns undefined for unknown id", () => {
    expect(removeTagFromNote("no-such-id", "work")).toBeUndefined();
  });

  it("persists changes — findNote reflects removed tag", () => {
    const notes = listNotes();
    const noteWithUrgent = notes.find((n) => n.tags.includes("urgent"))!;

    removeTagFromNote(noteWithUrgent.id, "urgent");

    expect(findNote(noteWithUrgent.id)?.tags).not.toContain("urgent");
  });
});

describe("listTags", () => {
  it("returns sorted unique list of tags", () => {
    const tags = listTags();

    expect(Array.isArray(tags)).toBe(true);
    // Теги должны быть отсортированы
    const sorted = [...tags].sort((a, b) => a.localeCompare(b));
    expect(tags).toEqual(sorted);
    // Нет дублей
    expect(new Set(tags).size).toBe(tags.length);
    // Содержит ожидаемые теги из initialNotes
    expect(tags).toContain("work");
    expect(tags).toContain("urgent");
    expect(tags).toContain("personal");
    expect(tags).toContain("ideas");
  });

  it("reflects updates after add", () => {
    addTagToNote("note-3", "brandNewTag");
    const tags = listTags();

    expect(tags).toContain("brandNewTag");
    const sorted = [...tags].sort((a, b) => a.localeCompare(b));
    expect(tags).toEqual(sorted);
  });

  it("removes tag from listTags when removed from all notes", () => {
    // "urgent" присутствует только в note-1
    removeTagFromNote("note-1", "urgent");
    const tags = listTags();

    expect(tags).not.toContain("urgent");
  });
});

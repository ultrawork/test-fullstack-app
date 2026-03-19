import { describe, it, expect, beforeEach } from "vitest";
import { archiveNote, unarchiveNote, NotFoundError } from "./notesService";
import { findNote, resetDb } from "@/app/api/_db/notes";

beforeEach(() => {
  resetDb();
});

describe("archiveNote", () => {
  it("throws NotFoundError for unknown id", () => {
    expect(() => archiveNote("non-existent")).toThrow(NotFoundError);
  });

  it("archives an active note (sets archivedAt to ISO string)", () => {
    const result = archiveNote("note-1");
    expect(result.id).toBe("note-1");
    expect(result.archivedAt).not.toBeNull();
    expect(typeof result.archivedAt).toBe("string");
    expect(() => new Date(result.archivedAt as string)).not.toThrow();
  });

  it("persists the archive — findNote reflects archivedAt", () => {
    archiveNote("note-1");
    const found = findNote("note-1");
    expect(found?.archivedAt).not.toBeNull();
  });

  it("is idempotent — archiving an already archived note returns it unchanged", () => {
    const first = archiveNote("note-1");
    const second = archiveNote("note-1");
    expect(second.archivedAt).toBe(first.archivedAt);
  });

  it("does not change archivedAt timestamp on repeated calls", () => {
    // note-3 is already archived in initial data
    const original = findNote("note-3");
    const result = archiveNote("note-3");
    expect(result.archivedAt).toBe(original?.archivedAt);
  });

  it("updates updatedAt only when state actually changes", () => {
    const before = findNote("note-1");
    const result = archiveNote("note-1");
    expect(result.updatedAt).not.toBe(before?.updatedAt);
  });
});

describe("unarchiveNote", () => {
  it("throws NotFoundError for unknown id", () => {
    expect(() => unarchiveNote("non-existent")).toThrow(NotFoundError);
  });

  it("unarchives an archived note (sets archivedAt to null)", () => {
    const result = unarchiveNote("note-3");
    expect(result.id).toBe("note-3");
    expect(result.archivedAt).toBeNull();
  });

  it("persists the unarchive — findNote reflects archivedAt === null", () => {
    unarchiveNote("note-3");
    const found = findNote("note-3");
    expect(found?.archivedAt).toBeNull();
  });

  it("is idempotent — unarchiving an active note returns it unchanged", () => {
    const before = findNote("note-1");
    const result = unarchiveNote("note-1");
    expect(result.archivedAt).toBeNull();
    expect(result.archivedAt).toBe(before?.archivedAt);
  });

  it("does not change updatedAt when already unarchived", () => {
    const before = findNote("note-1");
    const result = unarchiveNote("note-1");
    expect(result.updatedAt).toBe(before?.updatedAt);
  });

  it("updates updatedAt when state actually changes", () => {
    const before = findNote("note-3");
    const result = unarchiveNote("note-3");
    expect(result.updatedAt).not.toBe(before?.updatedAt);
  });
});

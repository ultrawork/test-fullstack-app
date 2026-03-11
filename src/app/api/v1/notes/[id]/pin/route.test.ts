import { describe, it, expect, beforeEach } from "vitest";
import { PATCH } from "./route";
import { NextRequest } from "next/server";
import { createNote } from "@/lib/notes-data";

// Reset module state between tests
beforeEach(async () => {
  const mod = await import("@/lib/notes-data");
  // Clear all notes by deleting them
  const notes = mod.getAllNotes();
  for (const note of notes) {
    mod.deleteNote(note.id);
  }
});

function createMockParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

describe("PATCH /api/v1/notes/[id]/pin", () => {
  it("toggles pin from false to true", async () => {
    const note = createNote("Test", "Content");
    expect(note.isPinned).toBe(false);

    const request = new NextRequest(
      "http://localhost/api/v1/notes/" + note.id + "/pin",
      {
        method: "PATCH",
      },
    );
    const response = await PATCH(request, createMockParams(note.id));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.isPinned).toBe(true);
    expect(body.id).toBe(note.id);
  });

  it("toggles pin from true to false", async () => {
    const note = createNote("Test", "Content");

    // First toggle: false -> true
    const req1 = new NextRequest(
      "http://localhost/api/v1/notes/" + note.id + "/pin",
      {
        method: "PATCH",
      },
    );
    await PATCH(req1, createMockParams(note.id));

    // Second toggle: true -> false
    const req2 = new NextRequest(
      "http://localhost/api/v1/notes/" + note.id + "/pin",
      {
        method: "PATCH",
      },
    );
    const response = await PATCH(req2, createMockParams(note.id));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.isPinned).toBe(false);
  });

  it("returns 404 for non-existent note", async () => {
    const request = new NextRequest(
      "http://localhost/api/v1/notes/non-existent/pin",
      { method: "PATCH" },
    );
    const response = await PATCH(request, createMockParams("non-existent"));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Note not found");
  });
});

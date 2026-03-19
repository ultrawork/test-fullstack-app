import { describe, it, expect, beforeEach } from "vitest";
import { DELETE } from "./route";
import { resetDb, findNote } from "@/app/api/_db/notes";

beforeEach(() => {
  resetDb();
});

describe("DELETE /api/notes/[id]/tags/[tag]", () => {
  it("returns 404 when note does not exist", async () => {
    const req = new Request("http://localhost/api/notes/non-existent/tags/work", {
      method: "DELETE",
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: "non-existent", tag: "work" }),
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("returns 200 and removes tag from note", async () => {
    const req = new Request("http://localhost/api/notes/note-1/tags/work", {
      method: "DELETE",
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: "note-1", tag: "work" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.tags).not.toContain("work");
  });

  it("is idempotent — returns 200 when removing non-existent tag", async () => {
    const req = new Request("http://localhost/api/notes/note-1/tags/nonexistent", {
      method: "DELETE",
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: "note-1", tag: "nonexistent" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("tags");
  });

  it("decodes URI-encoded tag parameter", async () => {
    const req = new Request("http://localhost/api/notes/note-1/tags/work%20life", {
      method: "DELETE",
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: "note-1", tag: "work%20life" }),
    });
    expect(res.status).toBe(200);
  });

  it("persists the tag removal in the database", async () => {
    const req = new Request("http://localhost/api/notes/note-1/tags/work", {
      method: "DELETE",
    });
    await DELETE(req, {
      params: Promise.resolve({ id: "note-1", tag: "work" }),
    });
    const note = findNote("note-1");
    expect(note?.tags).not.toContain("work");
  });

  it("does not affect other tags when removing one", async () => {
    const req = new Request("http://localhost/api/notes/note-1/tags/work", {
      method: "DELETE",
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: "note-1", tag: "work" }),
    });
    const json = await res.json();
    expect(json.tags).toContain("urgent");
  });
});

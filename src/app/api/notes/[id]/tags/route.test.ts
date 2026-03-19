import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";
import { resetDb, findNote } from "@/app/api/_db/notes";

beforeEach(() => {
  resetDb();
});

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/notes/note-1/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/notes/[id]/tags", () => {
  it("returns 400 when tag is missing from body", async () => {
    const res = await POST(makeRequest({}), {
      params: Promise.resolve({ id: "note-1" }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("returns 400 when tag is empty string", async () => {
    const res = await POST(makeRequest({ tag: "" }), {
      params: Promise.resolve({ id: "note-1" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when tag is whitespace only", async () => {
    const res = await POST(makeRequest({ tag: "   " }), {
      params: Promise.resolve({ id: "note-1" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 when note does not exist", async () => {
    const res = await POST(makeRequest({ tag: "newtag" }), {
      params: Promise.resolve({ id: "non-existent" }),
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("returns 200 and adds tag to note", async () => {
    const res = await POST(makeRequest({ tag: "newtag" }), {
      params: Promise.resolve({ id: "note-1" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.tags).toContain("newtag");
  });

  it("trims the tag before adding", async () => {
    const res = await POST(makeRequest({ tag: "  trimmed  " }), {
      params: Promise.resolve({ id: "note-1" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.tags).toContain("trimmed");
    expect(json.tags).not.toContain("  trimmed  ");
  });

  it("returns 200 with existing tags when adding duplicate", async () => {
    const res = await POST(makeRequest({ tag: "work" }), {
      params: Promise.resolve({ id: "note-1" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    const workCount = json.tags.filter((t: string) => t === "work").length;
    expect(workCount).toBe(1);
  });

  it("persists the added tag in the database", async () => {
    await POST(makeRequest({ tag: "persistent" }), {
      params: Promise.resolve({ id: "note-1" }),
    });
    const note = findNote("note-1");
    expect(note?.tags).toContain("persistent");
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/notes/note-1/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req, {
      params: Promise.resolve({ id: "note-1" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when tag is not a string", async () => {
    const res = await POST(makeRequest({ tag: 123 }), {
      params: Promise.resolve({ id: "note-1" }),
    });
    expect(res.status).toBe(400);
  });
});

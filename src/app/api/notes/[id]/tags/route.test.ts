import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { resetDb } from "@/app/api/_db/notes";
import { POST } from "./route";

beforeEach(() => {
  resetDb();
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/notes/note-1/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/notes/[id]/tags", () => {
  it("returns 200 and adds tag to note", async () => {
    const response = await POST(makeRequest({ tag: "new-tag" }), {
      params: Promise.resolve({ id: "note-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tags).toContain("new-tag");
  });

  it("does not duplicate existing tag", async () => {
    const response = await POST(makeRequest({ tag: "work" }), {
      params: Promise.resolve({ id: "note-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    const workCount = body.tags.filter((t: string) => t === "work").length;
    expect(workCount).toBe(1);
  });

  it("returns 400 for empty tag after trim", async () => {
    const response = await POST(makeRequest({ tag: "   " }), {
      params: Promise.resolve({ id: "note-1" }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 400 for missing tag field", async () => {
    const response = await POST(makeRequest({}), {
      params: Promise.resolve({ id: "note-1" }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 404 for non-existent note", async () => {
    const response = await POST(makeRequest({ tag: "test" }), {
      params: Promise.resolve({ id: "non-existent" }),
    });

    expect(response.status).toBe(404);
  });

  it("trims whitespace from tag", async () => {
    const response = await POST(makeRequest({ tag: "  trimmed  " }), {
      params: Promise.resolve({ id: "note-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tags).toContain("trimmed");
    expect(body.tags).not.toContain("  trimmed  ");
  });
});

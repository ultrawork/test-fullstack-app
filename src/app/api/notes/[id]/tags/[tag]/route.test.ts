import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { resetDb } from "@/app/api/_db/notes";
import { DELETE } from "./route";

beforeEach(() => {
  resetDb();
});

function makeRequest(): NextRequest {
  return new NextRequest("http://localhost/api/notes/note-1/tags/work", {
    method: "DELETE",
  });
}

describe("DELETE /api/notes/[id]/tags/[tag]", () => {
  it("returns 200 and removes tag from note", async () => {
    const response = await DELETE(makeRequest(), {
      params: Promise.resolve({ id: "note-1", tag: "work" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tags).not.toContain("work");
  });

  it("returns 200 idempotently when tag does not exist on note", async () => {
    const response = await DELETE(makeRequest(), {
      params: Promise.resolve({ id: "note-1", tag: "nonexistent" }),
    });

    expect(response.status).toBe(200);
  });

  it("returns 404 for non-existent note", async () => {
    const response = await DELETE(makeRequest(), {
      params: Promise.resolve({ id: "non-existent", tag: "work" }),
    });

    expect(response.status).toBe(404);
  });

  it("decodes URI-encoded tag", async () => {
    const response = await DELETE(makeRequest(), {
      params: Promise.resolve({ id: "note-1", tag: encodeURIComponent("urgent") }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tags).not.toContain("urgent");
  });
});

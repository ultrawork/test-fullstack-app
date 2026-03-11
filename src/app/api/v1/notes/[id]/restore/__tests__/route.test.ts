import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "../route";
import { archiveMap } from "@/lib/archive-storage";

beforeEach(() => {
  archiveMap.clear();
});

describe("POST /api/v1/notes/:id/restore", () => {
  it("restores an archived note", async () => {
    archiveMap.set("1", {
      id: "1",
      title: "Archived Note",
      content: "Some content",
      archivedAt: "2024-01-01T00:00:00.000Z",
    });

    const request = new Request("http://localhost/api/v1/notes/1/restore", {
      method: "POST",
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("1");
    expect(json.data.title).toBe("Archived Note");
    expect(archiveMap.has("1")).toBe(false);
  });

  it("returns 404 for non-existent note", async () => {
    const request = new Request("http://localhost/api/v1/notes/999/restore", {
      method: "POST",
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "999" }),
    });
    const json = await response.json();
    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Note not found in archive");
  });
});

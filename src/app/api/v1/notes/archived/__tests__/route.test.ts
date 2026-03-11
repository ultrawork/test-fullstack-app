import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "../route";
import { archiveMap } from "@/lib/archive-storage";

beforeEach(() => {
  archiveMap.clear();
});

describe("GET /api/v1/notes/archived", () => {
  it("returns empty array when no archived notes", async () => {
    const response = GET();
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("returns all archived notes", async () => {
    archiveMap.set("1", {
      id: "1",
      title: "Note 1",
      content: "Content 1",
      archivedAt: "2024-01-01T00:00:00.000Z",
    });
    archiveMap.set("2", {
      id: "2",
      title: "Note 2",
      content: "Content 2",
      archivedAt: "2024-01-02T00:00:00.000Z",
    });

    const response = GET();
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
  });
});

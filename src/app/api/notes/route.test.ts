import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { resetDb } from "@/app/api/_db/notes";
import { GET } from "./route";

/**
 * Вспомогательная функция для создания NextRequest с заданным URL.
 */
function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

beforeEach(() => {
  resetDb();
});

describe("GET /api/notes", () => {
  it("returns 200 with all notes when no tag filter", async () => {
    const response = await GET(makeRequest("http://localhost/api/notes"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(4);
  });

  it("returns 200 with filtered notes when tag param is provided", async () => {
    const response = await GET(
      makeRequest("http://localhost/api/notes?tag=work"),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    for (const note of body) {
      expect(note.tags).toContain("work");
    }
  });

  it("returns 200 with empty array when tag matches no notes", async () => {
    const response = await GET(
      makeRequest("http://localhost/api/notes?tag=nonexistent"),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });

  it("returns notes with correct structure", async () => {
    const response = await GET(makeRequest("http://localhost/api/notes"));
    const body = await response.json();

    for (const note of body) {
      expect(note).toHaveProperty("id");
      expect(note).toHaveProperty("title");
      expect(note).toHaveProperty("content");
      expect(note).toHaveProperty("archivedAt");
      expect(note).toHaveProperty("createdAt");
      expect(note).toHaveProperty("updatedAt");
      expect(note).toHaveProperty("tags");
      expect(Array.isArray(note.tags)).toBe(true);
    }
  });

  it("filters by tag=personal and returns only matching note", async () => {
    const response = await GET(
      makeRequest("http://localhost/api/notes?tag=personal"),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.length).toBe(1);
    expect(body[0].id).toBe("note-2");
  });

  it("ignores empty tag parameter and returns all notes", async () => {
    const response = await GET(
      makeRequest("http://localhost/api/notes?tag="),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.length).toBe(4);
  });
});

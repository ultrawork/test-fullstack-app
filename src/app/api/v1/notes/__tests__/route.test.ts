import { describe, it, expect } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/v1/notes", () => {
  it("returns all notes when no search param", async () => {
    const request = createRequest("/api/v1/notes");
    const response = GET(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.notes.length).toBe(5);
    expect(json.data.total).toBe(5);
  });

  it("returns all notes when search is empty", async () => {
    const request = createRequest("/api/v1/notes?search=");
    const response = GET(request);
    const json = await response.json();

    expect(json.data.notes.length).toBe(5);
  });

  it("filters notes by title (case-insensitive)", async () => {
    const request = createRequest("/api/v1/notes?search=рецепт");
    const response = GET(request);
    const json = await response.json();

    expect(json.data.notes.length).toBe(1);
    expect(json.data.notes[0].title).toBe("Рецепт пасты");
  });

  it("filters notes by content (case-insensitive)", async () => {
    const request = createRequest("/api/v1/notes?search=молоко");
    const response = GET(request);
    const json = await response.json();

    expect(json.data.notes.length).toBe(1);
    expect(json.data.notes[0].title).toBe("Список покупок");
  });

  it("returns empty when nothing matches", async () => {
    const request = createRequest("/api/v1/notes?search=xyznonexistent");
    const response = GET(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.notes.length).toBe(0);
    expect(json.data.total).toBe(0);
  });

  it("trims whitespace from search query", async () => {
    const request = createRequest("/api/v1/notes?search=%20%20рецепт%20%20");
    const response = GET(request);
    const json = await response.json();

    expect(json.data.notes.length).toBe(1);
  });

  it("limits search to 200 characters", async () => {
    const longQuery = "а".repeat(250);
    const request = createRequest(`/api/v1/notes?search=${longQuery}`);
    const response = GET(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.notes).toBeDefined();
  });
});

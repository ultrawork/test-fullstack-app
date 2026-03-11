import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "../route";
import { favoritesMap } from "@/lib/favorites-storage";
import { DELETE } from "../[id]/route";

beforeEach(() => {
  favoritesMap.clear();
});

describe("GET /api/v1/favorites", () => {
  it("returns empty array when no favorites", async () => {
    const response = GET();
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("returns all favorites", async () => {
    favoritesMap.set("1", {
      id: "1",
      title: "Note 1",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    favoritesMap.set("2", {
      id: "2",
      title: "Note 2",
      createdAt: "2024-01-02T00:00:00.000Z",
    });

    const response = GET();
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
  });
});

describe("POST /api/v1/favorites", () => {
  it("creates a new favorite", async () => {
    const request = new Request("http://localhost/api/v1/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "1", title: "Test Note" }),
    });

    const response = await POST(request);
    const json = await response.json();
    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("1");
    expect(json.data.title).toBe("Test Note");
    expect(json.data.createdAt).toBeDefined();
  });

  it("returns 409 for duplicate", async () => {
    favoritesMap.set("1", {
      id: "1",
      title: "Existing",
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    const request = new Request("http://localhost/api/v1/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "1", title: "Duplicate" }),
    });

    const response = await POST(request);
    const json = await response.json();
    expect(response.status).toBe(409);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Item already in favorites");
  });

  it("returns 400 for missing id", async () => {
    const request = new Request("http://localhost/api/v1/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "No ID" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for missing title", async () => {
    const request = new Request("http://localhost/api/v1/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "1" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost/api/v1/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid JSON body");
  });
});

describe("DELETE /api/v1/favorites/[id]", () => {
  it("deletes an existing favorite", async () => {
    favoritesMap.set("1", {
      id: "1",
      title: "To Delete",
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    const request = new Request("http://localhost/api/v1/favorites/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("1");
    expect(favoritesMap.has("1")).toBe(false);
  });

  it("returns 404 for non-existent item", async () => {
    const request = new Request("http://localhost/api/v1/favorites/999", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "999" }),
    });
    const json = await response.json();
    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Item not found in favorites");
  });
});

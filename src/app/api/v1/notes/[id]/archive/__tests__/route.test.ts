import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "../route";
import { archiveMap } from "@/lib/archive-storage";

beforeEach(() => {
  archiveMap.clear();
});

describe("POST /api/v1/notes/:id/archive", () => {
  it("archives a note successfully", async () => {
    const request = new Request("http://localhost/api/v1/notes/1/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Note", content: "Test Content" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const json = await response.json();
    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("1");
    expect(json.data.title).toBe("Test Note");
    expect(json.data.content).toBe("Test Content");
    expect(json.data.archivedAt).toBeDefined();
  });

  it("returns 409 for duplicate archive", async () => {
    archiveMap.set("1", {
      id: "1",
      title: "Existing",
      content: "Content",
      archivedAt: "2024-01-01T00:00:00.000Z",
    });

    const request = new Request("http://localhost/api/v1/notes/1/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Duplicate", content: "Content" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const json = await response.json();
    expect(response.status).toBe(409);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Note is already archived");
  });

  it("returns 400 for missing title", async () => {
    const request = new Request("http://localhost/api/v1/notes/1/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "No title" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 for missing content", async () => {
    const request = new Request("http://localhost/api/v1/notes/1/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "No content" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "1" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost/api/v1/notes/1/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "1" }),
    });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid JSON body");
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "./route";
import { resetTags } from "@/app/api/_db/tags";

beforeEach(() => {
  resetTags();
});

describe("GET /api/tags", () => {
  it("returns 200 status", async () => {
    const response = GET();
    expect(response.status).toBe(200);
  });

  it("returns JSON content-type", async () => {
    const response = GET();
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  it("returns an array of strings in the body", async () => {
    const response = GET();
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    for (const tag of body) {
      expect(typeof tag).toBe("string");
    }
  });

  it("returns unique tags", async () => {
    const response = GET();
    const body: string[] = await response.json();
    const unique = new Set(body);
    expect(body.length).toBe(unique.size);
  });
});

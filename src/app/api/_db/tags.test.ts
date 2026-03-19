import { describe, it, expect, beforeEach } from "vitest";
import { listTags, resetTags } from "./tags";

beforeEach(() => {
  resetTags();
});

describe("listTags", () => {
  it("returns an array of strings", () => {
    const tags = listTags();
    expect(Array.isArray(tags)).toBe(true);
    for (const tag of tags) {
      expect(typeof tag).toBe("string");
    }
  });

  it("returns unique tags", () => {
    const tags = listTags();
    const unique = new Set(tags);
    expect(tags.length).toBe(unique.size);
  });

  it("returns a copy — mutating result does not affect stored data", () => {
    const tags1 = listTags();
    tags1.push("MUTATED");
    const tags2 = listTags();
    expect(tags2).not.toContain("MUTATED");
  });
});

describe("resetTags", () => {
  it("restores original tags after mutations", () => {
    const before = listTags();
    resetTags();
    const after = listTags();
    expect(after).toEqual(before);
  });
});

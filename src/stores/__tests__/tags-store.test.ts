import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTagsStore } from "../tags-store";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api-client";

const mockedApi = vi.mocked(apiClient);

const mockTag = {
  id: "t1",
  name: "Work",
  color: "#FF0000",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  _count: { notes: 3 },
};

describe("TagsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTagsStore.setState({
      tags: [],
      isLoading: false,
      error: null,
    });
  });

  it("should have initial state", () => {
    const state = useTagsStore.getState();
    expect(state.tags).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should fetch tags", async () => {
    mockedApi.get.mockResolvedValueOnce({ success: true, data: [mockTag] });

    await useTagsStore.getState().fetchTags();

    expect(useTagsStore.getState().tags).toEqual([mockTag]);
  });

  it("should create tag", async () => {
    const newTag = {
      id: "t2",
      name: "Personal",
      color: "#00FF00",
      createdAt: "",
      updatedAt: "",
    };
    mockedApi.post.mockResolvedValueOnce({ success: true, data: newTag });

    const result = await useTagsStore
      .getState()
      .createTag({ name: "Personal", color: "#00FF00" });

    expect(result).toEqual(newTag);
    expect(useTagsStore.getState().tags).toHaveLength(1);
    expect(useTagsStore.getState().tags[0]._count.notes).toBe(0);
  });

  it("should update tag", async () => {
    useTagsStore.setState({ tags: [mockTag] });
    const updated = { ...mockTag, name: "Updated" };
    mockedApi.put.mockResolvedValueOnce({ success: true, data: updated });

    await useTagsStore.getState().updateTag("t1", { name: "Updated" });

    expect(useTagsStore.getState().tags[0].name).toBe("Updated");
    expect(useTagsStore.getState().tags[0]._count.notes).toBe(3); // preserved
  });

  it("should delete tag", async () => {
    useTagsStore.setState({ tags: [mockTag] });
    mockedApi.delete.mockResolvedValueOnce({ success: true, data: null });

    await useTagsStore.getState().deleteTag("t1");

    expect(useTagsStore.getState().tags).toEqual([]);
  });

  it("should handle fetch error", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("Network error"));

    await useTagsStore.getState().fetchTags();

    expect(useTagsStore.getState().error).toBe("Network error");
  });

  it("should clear error", () => {
    useTagsStore.setState({ error: "some error" });
    useTagsStore.getState().clearError();
    expect(useTagsStore.getState().error).toBeNull();
  });
});

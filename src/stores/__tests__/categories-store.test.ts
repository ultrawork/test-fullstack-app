import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCategoriesStore } from "../categories-store";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api-client";

const mockedApiClient = vi.mocked(apiClient);

const mockCategory = {
  id: "cat-1",
  name: "Work",
  color: "#3B82F6",
  userId: "user-1",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  _count: { notes: 3 },
};

describe("useCategoriesStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCategoriesStore.setState({
      categories: [],
      isLoading: false,
      error: null,
    });
  });

  it("should have initial state", () => {
    const state = useCategoriesStore.getState();
    expect(state.categories).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it("should fetch categories", async () => {
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: [mockCategory],
    });

    await useCategoriesStore.getState().fetchCategories();

    expect(useCategoriesStore.getState().categories).toEqual([mockCategory]);
  });

  it("should create a category", async () => {
    mockedApiClient.post.mockResolvedValue({
      success: true,
      data: mockCategory,
    });

    const result = await useCategoriesStore
      .getState()
      .createCategory("Work", "#3B82F6");

    expect(result).toEqual(mockCategory);
    expect(useCategoriesStore.getState().categories).toContainEqual(
      mockCategory,
    );
  });

  it("should update a category", async () => {
    useCategoriesStore.setState({ categories: [mockCategory] });
    const updated = { ...mockCategory, name: "Personal" };
    mockedApiClient.put.mockResolvedValue({
      success: true,
      data: updated,
    });

    const result = await useCategoriesStore
      .getState()
      .updateCategory("cat-1", { name: "Personal" });

    expect(result).toEqual(updated);
  });

  it("should delete a category", async () => {
    useCategoriesStore.setState({ categories: [mockCategory] });
    mockedApiClient.delete.mockResolvedValue({ success: true });

    const result = await useCategoriesStore.getState().deleteCategory("cat-1");

    expect(result).toBe(true);
    expect(useCategoriesStore.getState().categories).toEqual([]);
  });

  it("should handle fetch error", async () => {
    mockedApiClient.get.mockResolvedValue({ success: false });

    await useCategoriesStore.getState().fetchCategories();
    expect(useCategoriesStore.getState().error).toBe(
      "Failed to fetch categories",
    );
  });

  it("should clearError", () => {
    useCategoriesStore.setState({ error: "Some error" });
    useCategoriesStore.getState().clearError();
    expect(useCategoriesStore.getState().error).toBeNull();
  });
});

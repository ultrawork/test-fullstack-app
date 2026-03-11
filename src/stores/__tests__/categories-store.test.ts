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

const mockedApi = vi.mocked(apiClient);

const mockCategory = {
  id: "c1",
  name: "Work",
  color: "#FF0000",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  _count: { notes: 3 },
};

describe("CategoriesStore", () => {
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
    expect(state.error).toBeNull();
  });

  it("should fetch categories", async () => {
    mockedApi.get.mockResolvedValueOnce({
      success: true,
      data: { categories: [mockCategory] },
    });

    await useCategoriesStore.getState().fetchCategories();

    expect(useCategoriesStore.getState().categories).toEqual([mockCategory]);
  });

  it("should create category", async () => {
    const newCategory = {
      id: "c2",
      name: "Personal",
      color: "#00FF00",
      createdAt: "",
      updatedAt: "",
    };
    mockedApi.post.mockResolvedValueOnce({
      success: true,
      data: newCategory,
    });

    const result = await useCategoriesStore
      .getState()
      .createCategory({ name: "Personal", color: "#00FF00" });

    expect(result).toEqual(newCategory);
    expect(useCategoriesStore.getState().categories).toHaveLength(1);
    expect(useCategoriesStore.getState().categories[0]._count.notes).toBe(0);
  });

  it("should update category", async () => {
    useCategoriesStore.setState({ categories: [mockCategory] });
    const updated = { ...mockCategory, name: "Updated" };
    mockedApi.put.mockResolvedValueOnce({ success: true, data: updated });

    await useCategoriesStore.getState().updateCategory("c1", { name: "Updated" });

    expect(useCategoriesStore.getState().categories[0].name).toBe("Updated");
    expect(useCategoriesStore.getState().categories[0]._count.notes).toBe(3);
  });

  it("should delete category", async () => {
    useCategoriesStore.setState({ categories: [mockCategory] });
    mockedApi.delete.mockResolvedValueOnce({ success: true, data: null });

    await useCategoriesStore.getState().deleteCategory("c1");

    expect(useCategoriesStore.getState().categories).toEqual([]);
  });

  it("should handle fetch error", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("Network error"));

    await useCategoriesStore.getState().fetchCategories();

    expect(useCategoriesStore.getState().error).toBe("Network error");
  });

  it("should clear error", () => {
    useCategoriesStore.setState({ error: "some error" });
    useCategoriesStore.getState().clearError();
    expect(useCategoriesStore.getState().error).toBeNull();
  });
});

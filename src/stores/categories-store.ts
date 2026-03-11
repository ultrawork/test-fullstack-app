import { create } from "zustand";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryWithNoteCount,
} from "@/types/category";
import type { ApiResponse } from "@/types/api";
import { apiClient } from "@/lib/api-client";

interface CategoriesStore {
  categories: CategoryWithNoteCount[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (input: CreateCategoryInput) => Promise<Category>;
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<
        ApiResponse<{ categories: CategoryWithNoteCount[] }>
      >("/categories");
      set({ categories: res.data.categories, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch categories",
      });
    }
  },

  createCategory: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<ApiResponse<Category>>(
        "/categories",
        input,
      );
      const newCategory: CategoryWithNoteCount = {
        ...res.data,
        _count: { notes: 0 },
      };
      set((state) => ({
        categories: [...state.categories, newCategory],
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to create category",
      });
      throw err;
    }
  },

  updateCategory: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.put<ApiResponse<Category>>(
        `/categories/${id}`,
        input,
      );
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? { ...res.data, _count: c._count } : c,
        ),
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to update category",
      });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Failed to delete category",
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

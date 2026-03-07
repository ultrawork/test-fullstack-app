"use client";

import { create } from "zustand";
import type { Category } from "@/types/category";
import { apiClient } from "@/lib/api-client";

interface CategoriesStore {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (name: string, color?: string) => Promise<Category | null>;
  updateCategory: (
    id: string,
    data: { name?: string; color?: string },
  ) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    const response = await apiClient.get<Category[]>("/categories");
    if (response.success && response.data) {
      set({ categories: response.data, isLoading: false });
    } else {
      set({ isLoading: false, error: "Failed to fetch categories" });
    }
  },

  createCategory: async (name, color) => {
    set({ isLoading: true, error: null });
    const response = await apiClient.post<Category>("/categories", {
      name,
      ...(color && { color }),
    });
    if (response.success && response.data) {
      set((state) => ({
        categories: [...state.categories, response.data!].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
        isLoading: false,
      }));
      return response.data;
    }
    set({
      isLoading: false,
      error: response.error ?? "Failed to create category",
    });
    return null;
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    const response = await apiClient.put<Category>(
      `/categories/${id}`,
      data as Record<string, unknown>,
    );
    if (response.success && response.data) {
      set((state) => ({
        categories: state.categories
          .map((c) => (c.id === id ? response.data! : c))
          .sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }));
      return response.data;
    }
    set({
      isLoading: false,
      error: response.error ?? "Failed to update category",
    });
    return null;
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    const response = await apiClient.delete(`/categories/${id}`);
    if (response.success) {
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        isLoading: false,
      }));
      return true;
    }
    set({
      isLoading: false,
      error: response.error ?? "Failed to delete category",
    });
    return false;
  },

  clearError: () => set({ error: null }),
}));

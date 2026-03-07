import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/category';
import type { ApiResponse } from '@/types/api';

interface CategoriesStore {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (input: CreateCategoryInput) => Promise<Category>;
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>('/api/v1/categories');
      set({ categories: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load categories';
      set({ isLoading: false, error: message });
    }
  },

  createCategory: async (input: CreateCategoryInput): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/api/v1/categories', input);
    const category = response.data;
    set((state) => ({ categories: [...state.categories, category] }));
    return category;
  },

  updateCategory: async (id: string, input: UpdateCategoryInput): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/api/v1/categories/${id}`, input);
    const updated = response.data;
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/categories/${id}`);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },
}));

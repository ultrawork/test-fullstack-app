import { create } from "zustand";
import type {
  Tag,
  CreateTagInput,
  UpdateTagInput,
  TagWithNoteCount,
} from "@/types/tag";
import type { ApiResponse } from "@/types/api";
import { apiClient } from "@/lib/api-client";

interface TagsStore {
  tags: TagWithNoteCount[];
  isLoading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  createTag: (input: CreateTagInput) => Promise<Tag>;
  updateTag: (id: string, input: UpdateTagInput) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTagsStore = create<TagsStore>((set) => ({
  tags: [],
  isLoading: false,
  error: null,

  fetchTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const res =
        await apiClient.get<ApiResponse<{ tags: TagWithNoteCount[] }>>("/tags");
      set({ tags: res.data.tags, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch tags",
      });
    }
  },

  createTag: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<ApiResponse<Tag>>("/tags", input);
      const newTag: TagWithNoteCount = { ...res.data, _count: { notes: 0 } };
      set((state) => ({ tags: [...state.tags, newTag], isLoading: false }));
      return res.data;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to create tag",
      });
      throw err;
    }
  },

  updateTag: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.put<ApiResponse<Tag>>(`/tags/${id}`, input);
      set((state) => ({
        tags: state.tags.map((t) =>
          t.id === id ? { ...res.data, _count: t._count } : t,
        ),
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to update tag",
      });
      throw err;
    }
  },

  deleteTag: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/tags/${id}`);
      set((state) => ({
        tags: state.tags.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to delete tag",
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

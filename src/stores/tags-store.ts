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
  isLoadingList: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  createTag: (input: CreateTagInput) => Promise<Tag>;
  updateTag: (id: string, input: UpdateTagInput) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTagsStore = create<TagsStore>((set) => ({
  tags: [],
  isLoadingList: false,
  isSaving: false,
  isDeleting: false,
  error: null,

  fetchTags: async () => {
    set({ isLoadingList: true, error: null });
    try {
      const res =
        await apiClient.get<ApiResponse<{ tags: TagWithNoteCount[] }>>("/tags");
      set({ tags: res.data.tags, isLoadingList: false });
    } catch (err) {
      set({
        isLoadingList: false,
        error: err instanceof Error ? err.message : "Failed to fetch tags",
      });
    }
  },

  createTag: async (input) => {
    set({ isSaving: true, error: null });
    try {
      const res = await apiClient.post<ApiResponse<Tag>>("/tags", input);
      const newTag: TagWithNoteCount = { ...res.data, _count: { notes: 0 } };
      set((state) => ({ tags: [...state.tags, newTag], isSaving: false }));
      return res.data;
    } catch (err) {
      set({
        isSaving: false,
        error: err instanceof Error ? err.message : "Failed to create tag",
      });
      throw err;
    }
  },

  updateTag: async (id, input) => {
    set({ isSaving: true, error: null });
    try {
      const res = await apiClient.put<ApiResponse<Tag>>(`/tags/${id}`, input);
      set((state) => ({
        tags: state.tags.map((t) =>
          t.id === id ? { ...res.data, _count: t._count } : t,
        ),
        isSaving: false,
      }));
    } catch (err) {
      set({
        isSaving: false,
        error: err instanceof Error ? err.message : "Failed to update tag",
      });
      throw err;
    }
  },

  deleteTag: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await apiClient.delete(`/tags/${id}`);
      set((state) => ({
        tags: state.tags.filter((t) => t.id !== id),
        isDeleting: false,
      }));
    } catch (err) {
      set({
        isDeleting: false,
        error: err instanceof Error ? err.message : "Failed to delete tag",
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

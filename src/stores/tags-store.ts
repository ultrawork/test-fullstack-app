"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { TagDTO, TagWithCount, CreateTagInput, UpdateTagInput } from "@/types";

interface TagsState {
  tags: TagDTO[];
  tagsWithCount: TagWithCount[];
  isLoading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  fetchTagsWithCount: () => Promise<void>;
  createTag: (input: CreateTagInput) => Promise<TagDTO | null>;
  updateTag: (id: string, input: UpdateTagInput) => Promise<TagDTO | null>;
  deleteTag: (id: string) => Promise<boolean>;
}

export const useTagsStore = create<TagsState>((set) => ({
  tags: [],
  tagsWithCount: [],
  isLoading: false,
  error: null,

  fetchTags: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const tags = await api.get<TagDTO[]>("/tags");
      set({ tags, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch tags",
        isLoading: false,
      });
    }
  },

  fetchTagsWithCount: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const tagsWithCount = await api.get<TagWithCount[]>(
        "/tags?withCount=true"
      );
      set({ tagsWithCount, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch tags",
        isLoading: false,
      });
    }
  },

  createTag: async (input: CreateTagInput): Promise<TagDTO | null> => {
    try {
      const tag = await api.post<TagDTO>("/tags", input);
      set((state) => ({ tags: [...state.tags, tag] }));
      return tag;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to create tag" });
      return null;
    }
  },

  updateTag: async (
    id: string,
    input: UpdateTagInput
  ): Promise<TagDTO | null> => {
    try {
      const tag = await api.put<TagDTO>(`/tags/${id}`, input);
      set((state) => ({
        tags: state.tags.map((t) => (t.id === id ? tag : t)),
      }));
      return tag;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update tag" });
      return null;
    }
  },

  deleteTag: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/tags/${id}`);
      set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete tag" });
      return false;
    }
  },
}));

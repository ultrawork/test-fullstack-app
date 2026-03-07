"use client";

import { create } from "zustand";
import type { Note, NotesFilter } from "@/types/note";
import { apiClient } from "@/lib/api-client";

interface NotesStore {
  notes: Note[];
  selectedNote: Note | null;
  filter: NotesFilter;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchNotes: () => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (
    title: string,
    content: string,
    categoryId?: string,
  ) => Promise<Note | null>;
  updateNote: (
    id: string,
    data: { title?: string; content?: string; categoryId?: string | null },
  ) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<boolean>;
  setFilter: (filter: Partial<NotesFilter>) => void;
  clearSelectedNote: () => void;
  clearError: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  selectedNote: null,
  filter: { page: 1, limit: 10 },
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    const { filter } = get();
    const params = new URLSearchParams();
    if (filter.page) params.set("page", String(filter.page));
    if (filter.limit) params.set("limit", String(filter.limit));
    if (filter.categoryId) params.set("categoryId", filter.categoryId);
    if (filter.search) params.set("search", filter.search);

    const response = await apiClient.getPaginated<Note>(
      `/notes?${params.toString()}`,
    );
    if (response.success) {
      set({
        notes: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, error: "Failed to fetch notes" });
    }
  },

  fetchNote: async (id) => {
    set({ isLoading: true, error: null });
    const response = await apiClient.get<Note>(`/notes/${id}`);
    if (response.success && response.data) {
      set({ selectedNote: response.data, isLoading: false });
    } else {
      set({ isLoading: false, error: "Note not found" });
    }
  },

  createNote: async (title, content, categoryId) => {
    set({ isLoading: true, error: null });
    const response = await apiClient.post<Note>("/notes", {
      title,
      content,
      ...(categoryId && { categoryId }),
    });
    if (response.success && response.data) {
      set((state) => ({
        notes: [response.data!, ...state.notes],
        isLoading: false,
      }));
      return response.data;
    }
    set({ isLoading: false, error: response.error ?? "Failed to create note" });
    return null;
  },

  updateNote: async (id, data) => {
    set({ isLoading: true, error: null });
    const response = await apiClient.put<Note>(
      `/notes/${id}`,
      data as Record<string, unknown>,
    );
    if (response.success && response.data) {
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? response.data! : n,
        ),
        selectedNote:
          state.selectedNote?.id === id ? response.data! : state.selectedNote,
        isLoading: false,
      }));
      return response.data;
    }
    set({ isLoading: false, error: response.error ?? "Failed to update note" });
    return null;
  },

  deleteNote: async (id) => {
    set({ isLoading: true, error: null });
    const response = await apiClient.delete(`/notes/${id}`);
    if (response.success) {
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        selectedNote:
          state.selectedNote?.id === id ? null : state.selectedNote,
        isLoading: false,
      }));
      return true;
    }
    set({ isLoading: false, error: response.error ?? "Failed to delete note" });
    return false;
  },

  setFilter: (newFilter) => {
    set((state) => ({
      filter: { ...state.filter, ...newFilter },
    }));
  },

  clearSelectedNote: () => set({ selectedNote: null }),
  clearError: () => set({ error: null }),
}));

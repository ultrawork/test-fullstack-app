import { create } from "zustand";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@/types/note";
import type { ApiResponse } from "@/types/api";
import { apiClient } from "@/lib/api-client";

interface NotesStore {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  search: string;
  filterTagIds: string[];
  filterCategoryId: string | null;
  fetchNotes: () => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, input: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setSearch: (search: string) => void;
  setFilterTagIds: (tagIds: string[]) => void;
  setFilterCategoryId: (categoryId: string | null) => void;
  resetAllFilters: () => void;
  clearError: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  search: "",
  filterTagIds: [],
  filterCategoryId: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      const { search, filterTagIds, filterCategoryId } = get();
      if (search) params.set("search", search);
      for (const id of filterTagIds) {
        params.append("tagIds", id);
      }
      if (filterCategoryId) params.set("categoryId", filterCategoryId);
      const query = params.toString();
      const res = await apiClient.get<
        ApiResponse<{
          notes: Note[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>
      >(`/notes${query ? `?${query}` : ""}`);
      set({ notes: res.data.notes, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch notes",
      });
    }
  },

  fetchNote: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<ApiResponse<Note>>(`/notes/${id}`);
      set({ currentNote: res.data, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch note",
      });
    }
  },

  createNote: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<ApiResponse<Note>>("/notes", input);
      set((state) => ({ notes: [res.data, ...state.notes], isLoading: false }));
      return res.data;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to create note",
      });
      throw err;
    }
  },

  updateNote: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.put<ApiResponse<Note>>(`/notes/${id}`, input);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? res.data : n)),
        currentNote:
          state.currentNote?.id === id ? res.data : state.currentNote,
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to update note",
      });
      throw err;
    }
  },

  deleteNote: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/notes/${id}`);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to delete note",
      });
      throw err;
    }
  },

  setSearch: (search) => set({ search }),
  setFilterTagIds: (tagIds) => set({ filterTagIds: tagIds }),
  setFilterCategoryId: (categoryId) => set({ filterCategoryId: categoryId }),
  resetAllFilters: () => {
    set({ search: "", filterTagIds: [], filterCategoryId: null });
    void get().fetchNotes();
  },
  clearError: () => set({ error: null }),
}));

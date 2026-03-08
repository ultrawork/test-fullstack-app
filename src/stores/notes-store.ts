import { create } from "zustand";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@/types/note";
import type { NoteImage } from "@/types/note-image";
import type { ApiResponse } from "@/types/api";
import { apiClient } from "@/lib/api-client";

interface NotesStore {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  search: string;
  filterTagIds: string[];
  fetchNotes: () => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, input: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  uploadImages: (noteId: string, files: File[]) => Promise<NoteImage[]>;
  deleteImage: (noteId: string, imageId: string) => Promise<void>;
  setSearch: (search: string) => void;
  setFilterTagIds: (tagIds: string[]) => void;
  clearError: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  search: "",
  filterTagIds: [],

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      const { search, filterTagIds } = get();
      if (search) params.set("search", search);
      for (const id of filterTagIds) {
        params.append("tagIds", id);
      }
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

  uploadImages: async (noteId, files) => {
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("images", file);
      }
      const res = await apiClient.upload<ApiResponse<{ images: NoteImage[] }>>(
        `/notes/${noteId}/images`,
        formData,
      );
      const newImages = res.data.images;

      set((state) => {
        const updateImages = (note: Note): Note => ({
          ...note,
          images: [...note.images, ...newImages],
        });
        return {
          notes: state.notes.map((n) =>
            n.id === noteId ? updateImages(n) : n,
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? updateImages(state.currentNote)
              : state.currentNote,
        };
      });

      return newImages;
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to upload images",
      });
      throw err;
    }
  },

  deleteImage: async (noteId, imageId) => {
    try {
      await apiClient.delete(`/notes/${noteId}/images/${imageId}`);

      set((state) => {
        const removeImage = (note: Note): Note => ({
          ...note,
          images: note.images.filter((img) => img.id !== imageId),
        });
        return {
          notes: state.notes.map((n) =>
            n.id === noteId ? removeImage(n) : n,
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? removeImage(state.currentNote)
              : state.currentNote,
        };
      });
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to delete image",
      });
      throw err;
    }
  },

  setSearch: (search) => set({ search }),
  setFilterTagIds: (tagIds) => set({ filterTagIds: tagIds }),
  clearError: () => set({ error: null }),
}));

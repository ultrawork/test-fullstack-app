"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { NoteDTO, CreateNoteInput, UpdateNoteInput } from "@/types";

interface NotesState {
  notes: NoteDTO[];
  isLoading: boolean;
  error: string | null;
  selectedTagIds: string[];
  fetchNotes: () => Promise<void>;
  createNote: (input: CreateNoteInput) => Promise<NoteDTO | null>;
  updateNote: (id: string, input: UpdateNoteInput) => Promise<NoteDTO | null>;
  deleteNote: (id: string) => Promise<boolean>;
  updateNoteTags: (noteId: string, tagIds: string[]) => Promise<NoteDTO | null>;
  setSelectedTagIds: (tagIds: string[]) => void;
  toggleTagFilter: (tagId: string) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  selectedTagIds: [],

  fetchNotes: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const { selectedTagIds } = get();
      const query = selectedTagIds.length
        ? `?tagIds=${selectedTagIds.join(",")}`
        : "";
      const notes = await api.get<NoteDTO[]>(`/notes${query}`);
      set({ notes, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch notes",
        isLoading: false,
      });
    }
  },

  createNote: async (input: CreateNoteInput): Promise<NoteDTO | null> => {
    try {
      const note = await api.post<NoteDTO>("/notes", input);
      set((state) => ({ notes: [note, ...state.notes] }));
      return note;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to create note" });
      return null;
    }
  },

  updateNote: async (
    id: string,
    input: UpdateNoteInput
  ): Promise<NoteDTO | null> => {
    try {
      const note = await api.put<NoteDTO>(`/notes/${id}`, input);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? note : n)),
      }));
      return note;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update note" });
      return null;
    }
  },

  deleteNote: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/notes/${id}`);
      set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete note" });
      return false;
    }
  },

  updateNoteTags: async (
    noteId: string,
    tagIds: string[]
  ): Promise<NoteDTO | null> => {
    try {
      const note = await api.put<NoteDTO>(`/notes/${noteId}/tags`, { tagIds });
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? note : n)),
      }));
      return note;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update tags",
      });
      return null;
    }
  },

  setSelectedTagIds: (tagIds: string[]): void => {
    set({ selectedTagIds: tagIds });
  },

  toggleTagFilter: (tagId: string): void => {
    set((state) => {
      const exists = state.selectedTagIds.includes(tagId);
      return {
        selectedTagIds: exists
          ? state.selectedTagIds.filter((id) => id !== tagId)
          : [...state.selectedTagIds, tagId],
      };
    });
  },
}));

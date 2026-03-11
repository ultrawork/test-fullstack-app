import { create } from "zustand";
import { Note } from "@/types/note";
import { sortNotes } from "@/lib/notes-utils";

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  addNote: (title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/v1/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data: Note[] = await response.json();
      set({ notes: sortNotes(data), isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  addNote: async (title: string, content: string) => {
    set({ error: null });
    try {
      const response = await fetch("/api/v1/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!response.ok) throw new Error("Failed to create note");
      const note: Note = await response.json();
      set((state) => ({ notes: sortNotes([...state.notes, note]) }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  deleteNote: async (id: string) => {
    const previousNotes = get().notes;
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      error: null,
    }));
    try {
      const response = await fetch(`/api/v1/notes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete note");
      }
    } catch (error) {
      set({
        notes: previousNotes,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  togglePin: async (id: string) => {
    const previousNotes = get().notes;

    // Optimistic update
    set((state) => ({
      error: null,
      notes: sortNotes(
        state.notes.map((note) =>
          note.id === id ? { ...note, isPinned: !note.isPinned } : note,
        ),
      ),
    }));

    try {
      const response = await fetch(`/api/v1/notes/${id}/pin`, {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error("Failed to toggle pin");
      }
      const updated: Note = await response.json();
      set((state) => ({
        notes: sortNotes(
          state.notes.map((note) => (note.id === id ? updated : note)),
        ),
      }));
    } catch (error) {
      set({
        notes: previousNotes,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
}));

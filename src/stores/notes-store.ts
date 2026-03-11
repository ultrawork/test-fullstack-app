import { create } from "zustand";
import type { Note } from "@/types/note";

interface NotesState {
  notes: Note[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  setSearchQuery: (query: string) => void;
  fetchNotes: (search?: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  searchQuery: "",
  isLoading: false,
  error: null,

  setSearchQuery: (query: string): void => {
    set({ searchQuery: query });
  },

  fetchNotes: async (search?: string): Promise<void> => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      if (search) {
        params.set("search", search);
      }

      const url = `/api/v1/notes${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error ?? "Неизвестная ошибка");
      }

      set({ notes: json.data.notes, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      set({ error: message, isLoading: false });
    }
  },
}));

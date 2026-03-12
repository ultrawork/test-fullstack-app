import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import type { Note, CreateNoteInput, UpdateNoteInput, NotesFilter } from '@/types/note';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

interface NotesStore {
  notes: Note[];
  selectedNote: Note | null;
  filter: NotesFilter;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  fetchNotes: () => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, input: UpdateNoteInput) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  setFilter: (filter: Partial<NotesFilter>) => void;
  setPage: (page: number) => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  selectedNote: null,
  filter: { sortBy: 'createdAt', sortOrder: 'desc' },
  isLoading: false,
  error: null,
  total: 0,
  page: 1,

  fetchNotes: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const { filter, page } = get();
      const params = new URLSearchParams();
      if (filter.search) params.set('search', filter.search);
      if (filter.categoryId) params.set('categoryId', filter.categoryId);
      if (filter.sortBy) params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params.set('sortOrder', filter.sortOrder);
      params.set('page', String(page));
      params.set('limit', String(filter.limit || 20));

      const response = await apiClient.get<PaginatedResponse<Note>>(
        `/api/v1/notes?${params.toString()}`,
      );
      set({ notes: response.data, total: response.total, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load notes';
      set({ isLoading: false, error: message });
    }
  },

  fetchNote: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ApiResponse<Note>>(`/api/v1/notes/${id}`);
      set({ selectedNote: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load note';
      set({ isLoading: false, error: message });
    }
  },

  createNote: async (input: CreateNoteInput): Promise<Note> => {
    const response = await apiClient.post<ApiResponse<Note>>('/api/v1/notes', input);
    const note = response.data;
    set((state) => ({ notes: [note, ...state.notes] }));
    return note;
  },

  updateNote: async (id: string, input: UpdateNoteInput): Promise<Note> => {
    const response = await apiClient.put<ApiResponse<Note>>(`/api/v1/notes/${id}`, input);
    const updated = response.data;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
      selectedNote: state.selectedNote?.id === id ? updated : state.selectedNote,
    }));
    return updated;
  },

  deleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/notes/${id}`);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
    }));
  },

  setFilter: (filter: Partial<NotesFilter>): void => {
    set((state) => ({ filter: { ...state.filter, ...filter }, page: 1 }));
  },

  setPage: (page: number): void => {
    set({ page });
  },
}));

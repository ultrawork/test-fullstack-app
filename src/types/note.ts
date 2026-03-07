import type { Category } from './category';

export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  categoryId?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  categoryId?: string | null;
}

export interface NotesFilter {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

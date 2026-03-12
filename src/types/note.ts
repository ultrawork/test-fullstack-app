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

export type SortByField = 'createdAt' | 'updatedAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface NotesFilter {
  search?: string;
  categoryId?: string;
  sortBy?: SortByField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

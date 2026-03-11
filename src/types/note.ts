import type { Tag } from "./tag";
import type { Category } from "./category";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  categoryId: string | null;
  category: Category | null;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  tagIds?: string[];
  categoryId?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tagIds?: string[];
  categoryId?: string | null;
}

export interface NotesFilter {
  search?: string;
  tagIds?: string[];
  categoryId?: string;
  page?: number;
  limit?: number;
}

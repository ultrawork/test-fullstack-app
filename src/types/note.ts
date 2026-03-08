import type { Tag } from "./tag";
import type { NoteImage } from "./note-image";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  images: NoteImage[];
}

export interface CreateNoteInput {
  title: string;
  content: string;
  tagIds?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tagIds?: string[];
}

export interface NotesFilter {
  search?: string;
  tagIds?: string[];
  page?: number;
  limit?: number;
}

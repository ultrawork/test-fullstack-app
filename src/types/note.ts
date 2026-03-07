export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
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
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

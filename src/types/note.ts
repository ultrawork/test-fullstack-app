export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesFilter {
  search?: string;
}

export interface NotesResponse {
  notes: Note[];
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

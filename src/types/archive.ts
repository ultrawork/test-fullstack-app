export interface ArchivedNote {
  id: string;
  title: string;
  content: string;
  archivedAt: string;
}

export interface ArchiveNoteInput {
  title: string;
  content: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

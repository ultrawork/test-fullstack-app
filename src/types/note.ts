/** Вложение к заметке (изображение, документ и т.д.) */
export interface Attachment {
  id: string;
  type: "image" | "document" | "audio" | "video" | "other";
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  previewUrl?: string;
  createdAt: Date;
}

/** Тег для категоризации заметок */
export interface Tag {
  id: string;
  name: string;
  color?: string;
}

/** Заметка */
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

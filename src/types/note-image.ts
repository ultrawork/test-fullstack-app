export interface NoteImage {
  id: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  order: number;
  createdAt: string;
}

export interface UploadImageResponse {
  images: NoteImage[];
}

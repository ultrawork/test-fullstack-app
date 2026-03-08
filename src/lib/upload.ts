import { mkdir, writeFile, unlink, rm } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "public", "uploads", "images");

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
};

export const IMAGE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_NOTE: 5,
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png"] as readonly string[],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png"] as readonly string[],
} as const;

export function getUploadDir(noteId: string): string {
  return join(UPLOADS_DIR, noteId);
}

export function getPublicPath(noteId: string, filename: string): string {
  return `/uploads/images/${noteId}/${filename}`;
}

export function generateFilename(mimeType: string): string {
  const ext = MIME_TO_EXTENSION[mimeType] ?? ".jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

export function validateImageFile(
  file: File,
): { valid: true } | { valid: false; error: string } {
  if (!IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG`,
    };
  }

  const dotIndex = file.name.lastIndexOf(".");
  if (dotIndex >= 0) {
    const ext = file.name.substring(dotIndex).toLowerCase();
    if (!IMAGE_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file extension: ${ext}. Allowed: .jpg, .jpeg, .png`,
      };
    }
  }

  if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: 5MB`,
    };
  }

  return { valid: true };
}

export function validateMagicBytes(
  buffer: Buffer,
  mimeType: string,
): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some((sig) =>
    sig.every((byte, i) => i < buffer.length && buffer[i] === byte),
  );
}

export interface NoteImageDTO {
  id: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  order: number;
  createdAt: string;
}

export function formatNoteImage(img: {
  id: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  order: number;
  createdAt: Date;
}): NoteImageDTO {
  return {
    id: img.id,
    filename: img.filename,
    path: img.path,
    mimeType: img.mimeType,
    size: img.size,
    order: img.order,
    createdAt: img.createdAt.toISOString(),
  };
}

export async function saveImageFile(
  noteId: string,
  file: File,
): Promise<{ filename: string; path: string; size: number; mimeType: string }> {
  const dir = getUploadDir(noteId);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!validateMagicBytes(buffer, file.type)) {
    throw new Error("File content does not match declared MIME type");
  }

  const filename = generateFilename(file.type);
  const filePath = join(dir, filename);

  await writeFile(filePath, buffer);

  return {
    filename,
    path: getPublicPath(noteId, filename),
    size: file.size,
    mimeType: file.type,
  };
}

export async function deleteImageFile(
  noteId: string,
  filename: string,
): Promise<void> {
  const filePath = join(getUploadDir(noteId), filename);
  if (existsSync(filePath)) {
    await unlink(filePath);
  }
}

export async function deleteNoteImagesDir(noteId: string): Promise<void> {
  const dir = getUploadDir(noteId);
  if (!existsSync(dir)) return;
  await rm(dir, { recursive: true, force: true });
}

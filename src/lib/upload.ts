import { mkdir, writeFile, unlink, readdir, rmdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = join(process.cwd(), "public", "uploads", "images");

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

export function generateFilename(originalName: string): string {
  const ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
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

  if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: 5MB`,
    };
  }

  return { valid: true };
}

export async function saveImageFile(
  noteId: string,
  file: File,
): Promise<{ filename: string; path: string; size: number; mimeType: string }> {
  const dir = getUploadDir(noteId);
  await mkdir(dir, { recursive: true });

  const filename = generateFilename(file.name);
  const filePath = join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

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

  const files = await readdir(dir);
  for (const file of files) {
    await unlink(join(dir, file));
  }
  await rmdir(dir);
}

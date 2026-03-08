import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";
import { successResponse, handleApiError } from "@/lib/api-response";
import { NotFoundError, ValidationError } from "@/lib/errors";
import {
  IMAGE_CONSTRAINTS,
  validateImageFile,
  saveImageFile,
  deleteImageFile,
  formatNoteImage,
} from "@/lib/upload";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const note = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundError("Note");
    }

    const images = await prisma.noteImage.findMany({
      where: { noteId: id },
      orderBy: { order: "asc" },
    });

    return successResponse({ images: images.map(formatNoteImage) });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const note = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundError("Note");
    }

    const existingCount = await prisma.noteImage.count({
      where: { noteId: id },
    });

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      throw new ValidationError("No images provided");
    }

    if (existingCount + files.length > IMAGE_CONSTRAINTS.MAX_IMAGES_PER_NOTE) {
      throw new ValidationError(
        `Maximum ${IMAGE_CONSTRAINTS.MAX_IMAGES_PER_NOTE} images per note. Currently: ${existingCount}, trying to add: ${files.length}`,
      );
    }

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new ValidationError(validation.error);
      }
    }

    const savedImages = [];
    const savedFilenames: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileData = await saveImageFile(id, file);
        savedFilenames.push(fileData.filename);

        const image = await prisma.noteImage.create({
          data: {
            filename: fileData.filename,
            path: fileData.path,
            mimeType: fileData.mimeType,
            size: fileData.size,
            order: existingCount + i,
            noteId: id,
          },
        });

        savedImages.push(formatNoteImage(image));
      }
    } catch (error) {
      for (const filename of savedFilenames) {
        await deleteImageFile(id, filename).catch(() => {});
      }
      throw error;
    }

    return successResponse({ images: savedImages }, 201);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

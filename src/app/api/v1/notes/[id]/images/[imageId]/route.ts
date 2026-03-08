import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";
import { successResponse, handleApiError } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { deleteImageFile } from "@/lib/upload";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id, imageId } = await params;

    const note = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundError("Note");
    }

    const image = await prisma.noteImage.findFirst({
      where: { id: imageId, noteId: id },
    });

    if (!image) {
      throw new NotFoundError("Image");
    }

    await deleteImageFile(id, image.filename);

    await prisma.noteImage.delete({
      where: { id: imageId },
    });

    return successResponse({ message: "Image deleted successfully" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

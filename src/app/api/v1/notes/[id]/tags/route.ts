import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";
import { attachTagsSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/api-response";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const body: unknown = await request.json();
    const data = attachTagsSchema.parse(body);

    const updatedNote = await prisma.$transaction(async (tx) => {
      const note = await tx.note.findFirst({
        where: { id, userId },
      });

      if (!note) {
        throw new NotFoundError("Note");
      }

      if (data.tagIds.length > 0) {
        const tags = await tx.tag.findMany({
          where: { id: { in: data.tagIds }, userId },
        });

        if (tags.length !== data.tagIds.length) {
          throw new ValidationError("One or more tags are invalid");
        }
      }

      await tx.noteTag.deleteMany({
        where: { noteId: id },
      });

      if (data.tagIds.length > 0) {
        await tx.noteTag.createMany({
          data: data.tagIds.map((tagId) => ({ noteId: id, tagId })),
        });
      }

      return tx.note.findUnique({
        where: { id },
        include: {
          tags: {
            include: { tag: true },
          },
        },
      });
    });

    if (!updatedNote) {
      throw new NotFoundError("Note");
    }

    return successResponse({
      id: updatedNote.id,
      title: updatedNote.title,
      content: updatedNote.content,
      createdAt: updatedNote.createdAt.toISOString(),
      updatedAt: updatedNote.updatedAt.toISOString(),
      tags: updatedNote.tags.map((nt) => nt.tag),
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";
import { updateNoteSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/api-response";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const note = await prisma.note.findFirst({
      where: { id, userId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!note) {
      throw new NotFoundError("Note");
    }

    return successResponse({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      tags: note.tags.map((nt) => nt.tag),
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const body: unknown = await request.json();
    const data = updateNoteSchema.parse(body);

    const note = await prisma.$transaction(async (tx) => {
      const existingNote = await tx.note.findFirst({
        where: { id, userId },
      });

      if (!existingNote) {
        throw new NotFoundError("Note");
      }

      if (data.tagIds !== undefined) {
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
      }

      return tx.note.update({
        where: { id, userId },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.content !== undefined && { content: data.content }),
        },
        include: {
          tags: {
            include: { tag: true },
          },
        },
      });
    });

    return successResponse({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      tags: note.tags.map((nt) => nt.tag),
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const result = await prisma.note.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundError("Note");
    }

    return successResponse({ message: "Note deleted successfully" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

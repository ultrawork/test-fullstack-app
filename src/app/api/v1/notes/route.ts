import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";
import { createNoteSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/api-response";
import { ForbiddenError } from "@/lib/errors";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { searchParams } = request.nextUrl;

    const search = searchParams.get("search") || undefined;
    const tagIds = searchParams.getAll("tagIds");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.NoteWhereInput = {
      userId,
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            content: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        ],
      }),
      ...(tagIds.length > 0 && {
        tags: {
          some: {
            tagId: { in: tagIds },
          },
        },
      }),
    };

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          tags: {
            include: { tag: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    const formattedNotes = notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      tags: note.tags.map((nt) => nt.tag),
    }));

    return successResponse({
      notes: formattedNotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const body: unknown = await request.json();
    const data = createNoteSchema.parse(body);

    if (data.tagIds && data.tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: data.tagIds }, userId },
      });

      if (tags.length !== data.tagIds.length) {
        throw new ForbiddenError("One or more tags do not belong to you");
      }
    }

    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        userId,
        ...(data.tagIds &&
          data.tagIds.length > 0 && {
            tags: {
              create: data.tagIds.map((tagId) => ({ tagId })),
            },
          }),
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    return successResponse(
      {
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        tags: note.tags.map((nt) => nt.tag),
      },
      201,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

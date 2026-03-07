import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, unauthorizedResponse } from "@/lib/auth";
import {
  validateNoteTitle,
  validateNoteContent,
  validateUUID,
  badRequestResponse,
} from "@/lib/validation";
import type { NoteDTO, TagDTO } from "@/types";

function formatNote(
  note: {
    id: string;
    title: string;
    content: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    noteTags: { tag: { id: string; name: string; color: string; userId: string; createdAt: Date; updatedAt: Date } }[];
  }
): NoteDTO {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    userId: note.userId,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    tags: note.noteTags.map(
      (nt): TagDTO => ({
        id: nt.tag.id,
        name: nt.tag.name,
        color: nt.tag.color,
        userId: nt.tag.userId,
        createdAt: nt.tag.createdAt.toISOString(),
        updatedAt: nt.tag.updatedAt.toISOString(),
      })
    ),
  };
}

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const tagIdsParam = searchParams.get("tagIds");

  let tagIds: string[] | undefined;
  if (tagIdsParam) {
    tagIds = tagIdsParam.split(",").filter((id) => validateUUID(id));
    if (tagIds.length === 0) return badRequestResponse("Invalid tag IDs");
  }

  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
      ...(tagIds && {
        noteTags: { some: { tagId: { in: tagIds } } },
      }),
    },
    include: { noteTags: { include: { tag: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json(notes.map(formatNote));
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  if (!body) return badRequestResponse("Invalid JSON");

  const { title, content, tagIds } = body;

  if (!validateNoteTitle(title))
    return badRequestResponse("Title is required (max 200 characters)");
  if (!validateNoteContent(content))
    return badRequestResponse("Content too long (max 50000 characters)");

  if (tagIds !== undefined) {
    if (!Array.isArray(tagIds) || !tagIds.every(validateUUID))
      return badRequestResponse("tagIds must be an array of valid UUIDs");
  }

  const note = await prisma.note.create({
    data: {
      title: title.trim(),
      content: content ?? "",
      userId: user.id,
      ...(tagIds?.length && {
        noteTags: {
          create: tagIds.map((tagId: string) => ({ tagId })),
        },
      }),
    },
    include: { noteTags: { include: { tag: true } } },
  });

  return Response.json(formatNote(note), { status: 201 });
}

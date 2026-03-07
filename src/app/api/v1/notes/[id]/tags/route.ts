import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, unauthorizedResponse } from "@/lib/auth";
import {
  validateUUID,
  badRequestResponse,
  notFoundResponse,
} from "@/lib/validation";
import { formatNote } from "@/lib/formatters";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const existing = await prisma.note.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return notFoundResponse("Note not found");

  const body = await request.json().catch(() => null);
  if (!body) return badRequestResponse("Invalid JSON");

  const { tagIds } = body;
  if (!Array.isArray(tagIds) || !tagIds.every(validateUUID))
    return badRequestResponse("tagIds must be an array of valid UUIDs");

  // Verify all tags belong to the user
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds }, userId: user.id },
  });
  if (tags.length !== tagIds.length)
    return badRequestResponse("Some tags not found");

  // Replace all note tags
  await prisma.$transaction([
    prisma.noteTag.deleteMany({ where: { noteId: id } }),
    ...tagIds.map((tagId: string) =>
      prisma.noteTag.create({ data: { noteId: id, tagId } })
    ),
  ]);

  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
    include: { noteTags: { include: { tag: true } } },
  });

  return Response.json(formatNote(note!));
}

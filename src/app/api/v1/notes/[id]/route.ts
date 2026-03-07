import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, unauthorizedResponse } from "@/lib/auth";
import {
  validateNoteTitle,
  validateNoteContent,
  badRequestResponse,
  notFoundResponse,
} from "@/lib/validation";
import { formatNote } from "@/lib/formatters";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
    include: { noteTags: { include: { tag: true } } },
  });

  if (!note) return notFoundResponse("Note not found");
  return Response.json(formatNote(note));
}

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

  const { title, content } = body;

  if (title !== undefined && !validateNoteTitle(title))
    return badRequestResponse("Title is required (max 200 characters)");
  if (content !== undefined && !validateNoteContent(content))
    return badRequestResponse("Content too long (max 50000 characters)");

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(content !== undefined && { content }),
    },
    include: { noteTags: { include: { tag: true } } },
  });

  return Response.json(formatNote(note));
}

export async function DELETE(
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

  await prisma.note.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

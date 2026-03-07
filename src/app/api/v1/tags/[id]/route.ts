import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, unauthorizedResponse } from "@/lib/auth";
import {
  validateTagName,
  validateHexColor,
  badRequestResponse,
  notFoundResponse,
  conflictResponse,
} from "@/lib/validation";
import type { TagDTO } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const tag = await prisma.tag.findFirst({
    where: { id, userId: user.id },
  });

  if (!tag) return notFoundResponse("Tag not found");

  const result: TagDTO = {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    userId: tag.userId,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };

  return Response.json(result);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const existing = await prisma.tag.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return notFoundResponse("Tag not found");

  const body = await request.json().catch(() => null);
  if (!body) return badRequestResponse("Invalid JSON");

  const { name, color } = body;

  if (name !== undefined && !validateTagName(name))
    return badRequestResponse("Tag name is required (max 50 characters)");
  if (color !== undefined && !validateHexColor(color))
    return badRequestResponse("Color must be a valid hex color (#RRGGBB)");

  if (name !== undefined && name.trim() !== existing.name) {
    const duplicate = await prisma.tag.findFirst({
      where: { userId: user.id, name: name.trim(), id: { not: id } },
    });
    if (duplicate) return conflictResponse("Tag with this name already exists");
  }

  const tag = await prisma.tag.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(color !== undefined && { color }),
    },
  });

  const result: TagDTO = {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    userId: tag.userId,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };

  return Response.json(result);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const existing = await prisma.tag.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return notFoundResponse("Tag not found");

  await prisma.tag.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

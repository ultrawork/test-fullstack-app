import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, unauthorizedResponse } from "@/lib/auth";
import {
  validateTagName,
  validateHexColor,
  badRequestResponse,
  conflictResponse,
} from "@/lib/validation";
import type { TagDTO, TagWithCount } from "@/types";

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const withCount = searchParams.get("withCount") === "true";

  if (withCount) {
    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      include: { _count: { select: { noteTags: true } } },
      orderBy: { name: "asc" },
    });
    const result: TagWithCount[] = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      userId: tag.userId,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
      noteCount: tag._count.noteTags,
    }));
    return Response.json(result);
  }

  const tags = await prisma.tag.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
  const result: TagDTO[] = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    userId: tag.userId,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  }));

  return Response.json(result);
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  if (!body) return badRequestResponse("Invalid JSON");

  const { name, color } = body;

  if (!validateTagName(name))
    return badRequestResponse("Tag name is required (max 50 characters)");
  if (!validateHexColor(color))
    return badRequestResponse("Color must be a valid hex color (#RRGGBB)");

  const existing = await prisma.tag.findFirst({
    where: { userId: user.id, name: name.trim() },
  });
  if (existing) return conflictResponse("Tag with this name already exists");

  const tag = await prisma.tag.create({
    data: {
      name: name.trim(),
      color,
      userId: user.id,
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

  return Response.json(result, { status: 201 });
}

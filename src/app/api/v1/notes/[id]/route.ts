export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { updateNoteSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<Response> {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) return errorResponse("Unauthorized", 401);

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return errorResponse("Invalid token", 401);

    const note = await prisma.note.findFirst({
      where: { id, userId: payload.userId },
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
    });

    if (!note) return errorResponse("Note not found", 404);

    return successResponse(note);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
): Promise<Response> {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) return errorResponse("Unauthorized", 401);

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return errorResponse("Invalid token", 401);

    const existingNote = await prisma.note.findFirst({
      where: { id, userId: payload.userId },
    });
    if (!existingNote) return errorResponse("Note not found", 404);

    const body = await request.json();
    const parsed = updateNoteSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 422);
    }

    const { categoryId, ...rest } = parsed.data;

    if (categoryId !== undefined && categoryId !== null) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: payload.userId },
      });
      if (!category) return errorResponse("Category not found", 404);
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
    });

    return successResponse(note);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
): Promise<Response> {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) return errorResponse("Unauthorized", 401);

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return errorResponse("Invalid token", 401);

    const note = await prisma.note.findFirst({
      where: { id, userId: payload.userId },
    });
    if (!note) return errorResponse("Note not found", 404);

    await prisma.note.delete({ where: { id } });

    return successResponse({ message: "Note deleted successfully" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

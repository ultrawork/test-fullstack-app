export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { createNoteSchema } from "@/lib/validation";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) return errorResponse("Unauthorized", 401);

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return errorResponse("Invalid token", 401);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10") || 10),
    );
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const where: Prisma.NoteWhereInput = { userId: payload.userId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, color: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    return paginatedResponse(notes, page, limit, total);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) return errorResponse("Unauthorized", 401);

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return errorResponse("Invalid token", 401);

    const body = await request.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 422);
    }

    const { title, content, categoryId } = parsed.data;

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: payload.userId },
      });
      if (!category) return errorResponse("Category not found", 404);
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: payload.userId,
        categoryId: categoryId ?? null,
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
      },
    });

    return successResponse(note, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

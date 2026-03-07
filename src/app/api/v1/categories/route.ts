export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { createCategorySchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) return errorResponse("Unauthorized", 401);

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return errorResponse("Invalid token", 401);

    const categories = await prisma.category.findMany({
      where: { userId: payload.userId },
      include: { _count: { select: { notes: true } } },
      orderBy: { name: "asc" },
    });

    return successResponse(categories);
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
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 422);
    }

    const { name, color } = parsed.data;

    const existing = await prisma.category.findFirst({
      where: { name, userId: payload.userId },
    });
    if (existing) {
      return errorResponse("Category with this name already exists", 409);
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color ?? "#6B7280",
        userId: payload.userId,
      },
      include: { _count: { select: { notes: true } } },
    });

    return successResponse(category, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

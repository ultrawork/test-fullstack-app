export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { updateCategorySchema, uuidSchema } from "@/lib/validation";
import { successResponse, errorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
): Promise<Response> {
  try {
    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return errorResponse("Invalid category ID format", 400);
    }

    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) return errorResponse("Unauthorized", 401);

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return errorResponse("Invalid token", 401);

    const existing = await prisma.category.findFirst({
      where: { id, userId: payload.userId },
    });
    if (!existing) return errorResponse("Category not found", 404);

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 422);
    }

    const { name, color } = parsed.data;

    if (name && name !== existing.name) {
      const duplicate = await prisma.category.findFirst({
        where: { name, userId: payload.userId },
      });
      if (duplicate) {
        return errorResponse("Category with this name already exists", 409);
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: { ...(name && { name }), ...(color && { color }) },
      include: { _count: { select: { notes: true } } },
    });

    return successResponse(category);
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
    if (!uuidSchema.safeParse(id).success) {
      return errorResponse("Invalid category ID format", 400);
    }

    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) return errorResponse("Unauthorized", 401);

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return errorResponse("Invalid token", 401);

    const existing = await prisma.category.findFirst({
      where: { id, userId: payload.userId },
    });
    if (!existing) return errorResponse("Category not found", 404);

    await prisma.category.delete({ where: { id } });

    return successResponse({ message: "Category deleted successfully" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

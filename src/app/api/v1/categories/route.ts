import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";
import { createCategorySchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await getUserId();

    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return successResponse({ categories });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const body: unknown = await request.json();
    const data = createCategorySchema.parse(body);

    const existingCategory = await prisma.category.findFirst({
      where: { name: data.name, userId },
    });

    if (existingCategory) {
      throw new ValidationError("Category with this name already exists");
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
        userId,
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    return successResponse(category, 201);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

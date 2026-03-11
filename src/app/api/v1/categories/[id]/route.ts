import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";
import { updateCategorySchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/api-response";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundError("Category");
    }

    return successResponse(category);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;
    const body: unknown = await request.json();
    const data = updateCategorySchema.parse(body);

    const existingCategory = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existingCategory) {
      throw new NotFoundError("Category");
    }

    if (data.name && data.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: { name: data.name, userId, NOT: { id } },
      });

      if (duplicateCategory) {
        throw new ValidationError("Category with this name already exists");
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    return successResponse(category);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    const { id } = await params;

    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundError("Category");
    }

    await prisma.category.delete({
      where: { id },
    });

    return successResponse({ message: "Category deleted successfully" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

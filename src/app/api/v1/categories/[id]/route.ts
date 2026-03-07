import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { updateCategorySchema } from '@/lib/validation';
import { getCurrentUser, successResponse, errorResponse } from '@/lib/api-response';

const uuidSchema = z.string().uuid();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return errorResponse('Invalid category ID', 400);
    }

    const existing = await prisma.category.findFirst({
      where: { id, userId: currentUser.id },
    });

    if (!existing) {
      return errorResponse('Category not found', 404);
    }

    const body = await request.json();
    const result = updateCategorySchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return errorResponse(Object.values(errors).flat().join(', ') || 'Validation error', 400);
    }

    const { name, color } = result.data;

    if (name && name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await prisma.category.findFirst({
        where: {
          userId: currentUser.id,
          name: { equals: name, mode: 'insensitive' },
          NOT: { id },
        },
      });
      if (duplicate) {
        return errorResponse('Category with this name already exists', 409);
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(color !== undefined ? { color } : {}),
      },
      include: { _count: { select: { notes: true } } },
    });

    return successResponse(category);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return errorResponse('Invalid category ID', 400);
    }

    const category = await prisma.category.findFirst({
      where: { id, userId: currentUser.id },
    });

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    await prisma.category.delete({ where: { id } });

    return successResponse({ message: 'Category deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

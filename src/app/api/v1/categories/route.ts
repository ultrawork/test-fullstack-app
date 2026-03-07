import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCategorySchema } from '@/lib/validation';
import { getCurrentUser, successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const categories = await prisma.category.findMany({
      where: { userId: currentUser.id },
      include: { _count: { select: { notes: true } } },
      orderBy: { name: 'asc' },
    });

    return successResponse(categories);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const result = createCategorySchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return errorResponse(Object.values(errors).flat().join(', ') || 'Validation error', 400);
    }

    const { name, color } = result.data;

    const existing = await prisma.category.findFirst({
      where: { userId: currentUser.id, name },
    });
    if (existing) {
      return errorResponse('Category with this name already exists', 409);
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || null,
        userId: currentUser.id,
      },
      include: { _count: { select: { notes: true } } },
    });

    return successResponse(category, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

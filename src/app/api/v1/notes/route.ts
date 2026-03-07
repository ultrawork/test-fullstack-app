import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNoteSchema, notesFilterSchema } from '@/lib/validation';
import {
  getCurrentUser,
  successResponse,
  errorResponse,
  paginatedResponse,
} from '@/lib/api-response';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filterResult = notesFilterSchema.safeParse(searchParams);

    if (!filterResult.success) {
      return errorResponse('Invalid filter parameters', 400);
    }

    const { search, categoryId, page, limit } = filterResult.data;

    const where: Prisma.NoteWhereInput = { userId: currentUser.id };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: { category: true },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    return paginatedResponse(notes, total, page, limit);
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
    const result = createNoteSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return errorResponse(Object.values(errors).flat().join(', ') || 'Validation error', 400);
    }

    const { title, content, categoryId } = result.data;

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: currentUser.id },
      });
      if (!category) {
        return errorResponse('Category not found', 404);
      }
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        categoryId: categoryId || null,
        userId: currentUser.id,
      },
      include: { category: true },
    });

    return successResponse(note, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { updateNoteSchema } from '@/lib/validation';
import { getCurrentUser, successResponse, errorResponse } from '@/lib/api-response';

const uuidSchema = z.string().uuid();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return errorResponse('Invalid note ID', 400);
    }

    const note = await prisma.note.findFirst({
      where: { id, userId: currentUser.id },
      include: { category: true },
    });

    if (!note) {
      return errorResponse('Note not found', 404);
    }

    return successResponse(note);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return errorResponse('Invalid note ID', 400);
    }

    const existingNote = await prisma.note.findFirst({
      where: { id, userId: currentUser.id },
    });

    if (!existingNote) {
      return errorResponse('Note not found', 404);
    }

    const body = await request.json();
    const result = updateNoteSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return errorResponse(Object.values(errors).flat().join(', ') || 'Validation error', 400);
    }

    const { categoryId, ...rest } = result.data;

    if (categoryId !== undefined && categoryId !== null) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: currentUser.id },
      });
      if (!category) {
        return errorResponse('Category not found', 404);
      }
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined ? { categoryId } : {}),
        version: { increment: 1 },
      },
      include: { category: true },
    });

    return successResponse(note);
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
      return errorResponse('Invalid note ID', 400);
    }

    const note = await prisma.note.findFirst({
      where: { id, userId: currentUser.id },
    });

    if (!note) {
      return errorResponse('Note not found', 404);
    }

    await prisma.note.delete({ where: { id } });

    return successResponse({ message: 'Note deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

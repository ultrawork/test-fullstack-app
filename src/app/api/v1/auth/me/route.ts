import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ user });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

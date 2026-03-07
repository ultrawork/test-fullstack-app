import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateAccessToken, generateRefreshToken, hashToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return errorResponse('Invalid credentials', 400);
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return errorResponse('Invalid credentials', 401);
    }

    const accessToken = generateAccessToken({ sub: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ sub: user.id });

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = successResponse({
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
    });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/v1/auth',
    });

    return response;
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

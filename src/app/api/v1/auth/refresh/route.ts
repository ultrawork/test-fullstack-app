import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const oldRefreshToken = request.cookies.get('refresh_token')?.value;

    if (!oldRefreshToken) {
      return errorResponse('No refresh token', 401);
    }

    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      return errorResponse('Invalid refresh token', 401);
    }

    const tokenHash = hashToken(oldRefreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      return errorResponse('Invalid refresh token', 401);
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
      return errorResponse('User not found', 401);
    }

    const accessToken = generateAccessToken({ sub: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ sub: user.id });

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = successResponse({ user });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('refresh_token', newRefreshToken, {
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

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/cookies";
import { AuthError } from "@/lib/errors";

export async function POST(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const refreshTokenValue = cookieStore.get("refresh_token")?.value;

    if (!refreshTokenValue) {
      throw new AuthError("Refresh token not found");
    }

    const payload = await verifyRefreshToken(refreshTokenValue);

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshTokenValue,
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new AuthError("Invalid refresh token");
    }

    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AuthError("User not found");
    }

    const jwtPayload = { userId: user.id, email: user.email };
    const newAccessToken = await generateAccessToken(jwtPayload);
    const newRefreshToken = await generateRefreshToken(jwtPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await setAuthCookies(newAccessToken, newRefreshToken);

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

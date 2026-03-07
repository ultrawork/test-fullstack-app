export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;
    if (!refreshToken) {
      return errorResponse("Refresh token not found", 401);
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return errorResponse("Invalid refresh token", 401);
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken, expiresAt: { gt: new Date() } },
    });
    if (!storedToken) {
      return errorResponse("Refresh token revoked or expired", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      return errorResponse("User not found", 401);
    }

    const newAccessToken = await generateAccessToken(user.id, user.email);
    const newRefreshTokenValue = await generateRefreshToken(
      user.id,
      user.email,
    );

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token: refreshToken } }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshTokenValue,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Clean up expired refresh tokens (non-blocking)
    prisma.refreshToken
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => {});

    const response = successResponse({ message: "Token refreshed" });
    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
    response.cookies.set("refresh_token", newRefreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

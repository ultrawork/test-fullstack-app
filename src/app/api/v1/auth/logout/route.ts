import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/api-response";
import { AuthError } from "@/lib/errors";

export async function POST(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      throw new AuthError();
    }

    const payload = await verifyAccessToken(accessToken);

    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken, userId: payload.userId },
      });
    }

    cookieStore.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    cookieStore.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return successResponse({ message: "Logged out successfully" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

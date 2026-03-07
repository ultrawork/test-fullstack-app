export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload) {
        await prisma.refreshToken.deleteMany({
          where: { userId: payload.userId },
        });
      }
    }

    const response = successResponse({ message: "Logged out successfully" });
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

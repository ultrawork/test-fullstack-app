import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/cookies";
import { AuthError } from "@/lib/errors";

// Pre-computed bcrypt hash for timing attack mitigation on invalid emails
const DUMMY_HASH =
  "$2b$10$K4.eVSF/yO0NkU5rKwJbeOJWMEaFbQJDhB4sSqfDmKr9RoSmxshWG";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      await comparePassword(data.password, DUMMY_HASH);
      throw new AuthError("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AuthError("Invalid email or password");
    }

    const jwtPayload = { userId: user.id, email: user.email };
    const accessToken = await generateAccessToken(jwtPayload);
    const refreshToken = await generateRefreshToken(jwtPayload);

    await prisma.refreshToken.create({
      data: {
        token: hashRefreshToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await setAuthCookies(accessToken, refreshToken);

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

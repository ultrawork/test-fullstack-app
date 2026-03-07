import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { successResponse, handleApiError } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/cookies";
import { ValidationError } from "@/lib/errors";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const data = registerSchema.parse(body);

    const hashedPassword = await hashPassword(data.password);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    } catch (err: unknown) {
      const { Prisma } = await import("@prisma/client");
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ValidationError("Email already in use");
      }
      throw err;
    }

    const jwtPayload = { userId: user.id, email: user.email };
    const accessToken = await generateAccessToken(jwtPayload);
    const refreshToken = await generateRefreshToken(jwtPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await setAuthCookies(accessToken, refreshToken);

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt.toISOString(),
        },
      },
      201,
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

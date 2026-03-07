import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

const TOKEN_PREFIX = "Bearer ";

function encodeToken(userId: string): string {
  return Buffer.from(`session:${userId}:${Date.now()}`).toString("base64");
}

function decodeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts[0] !== "session" || !parts[1]) return null;
    return parts[1];
  } catch {
    return null;
  }
}

export function generateToken(userId: string): string {
  return encodeToken(userId);
}

export async function getUserFromRequest(
  request: NextRequest
): Promise<User | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith(TOKEN_PREFIX)) return null;

  const token = authHeader.slice(TOKEN_PREFIX.length);
  const userId = decodeToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

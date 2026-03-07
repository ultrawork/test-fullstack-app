import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

const TOKEN_PREFIX = "Bearer ";
const TOKEN_SECRET = process.env.TOKEN_SECRET || "default-secret-change-in-production";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sign(payload: string): string {
  return createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
}

function encodeToken(userId: string): string {
  const payload = `session:${userId}:${Date.now()}`;
  const signature = sign(payload);
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

function decodeToken(token: string): string | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const expectedSig = sign(payload);

    const sigBuf = Buffer.from(signature, "base64url");
    const expectedBuf = Buffer.from(expectedSig, "base64url");
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const parts = payload.split(":");
    if (parts[0] !== "session" || !parts[1] || !parts[2]) return null;

    const timestamp = parseInt(parts[2], 10);
    if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_TTL_MS) return null;

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

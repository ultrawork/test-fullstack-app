import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { JwtPayload } from "@/types/auth";
import { AuthError } from "@/lib/errors";

const SALT_ROUNDS = 10;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateAccessToken(
  payload: JwtPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getJwtSecret());
}

export async function generateRefreshToken(
  payload: JwtPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret());
  if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
    throw new AuthError("Invalid token payload");
  }
  return { userId: payload.userId, email: payload.email };
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getRefreshSecret());
  if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
    throw new AuthError("Invalid token payload");
  }
  return { userId: payload.userId, email: payload.email };
}

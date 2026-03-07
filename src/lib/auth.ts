// NOTE: bcryptjs is used for portability. For better performance in serverless/Edge,
// consider switching to native `bcrypt` or `@node-rs/bcrypt`.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import type { JwtPayload } from '@/types/auth';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}

function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET environment variable is required');
  return secret;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: { sub: string; email: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });
}

export function generateRefreshToken(payload: { sub: string }): string {
  return jwt.sign(payload, getJwtRefreshSecret(), { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, getJwtRefreshSecret()) as { sub: string };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

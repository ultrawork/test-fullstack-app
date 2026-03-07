import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): NextResponse {
  return NextResponse.json({ data, total, page, limit });
}

export function getCurrentUser(request: NextRequest): { id: string; email: string } | null {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return null;
  try {
    const payload = verifyAccessToken(token);
    if (!payload.sub || !payload.email) return null;
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

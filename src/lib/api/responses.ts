import { NextResponse } from "next/server";
import type { ApiSuccessResponse, ApiErrorResponse } from "@/types/notifications/push";

/** Return a 200 JSON response with `{ ok: true, data }`. */
export function ok<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ ok: true as const, data }, { status: 200 });
}

/** Return a 400 JSON response with `{ ok: false, error }`. */
export function badRequest(
  code: string,
  message: string,
  details?: string[]
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { ok: false as const, error: { code, message, details } },
    { status: 400 }
  );
}

/** Return a 500 JSON response with `{ ok: false, error }`. */
export function internalError(
  code: string,
  message: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { ok: false as const, error: { code, message } },
    { status: 500 }
  );
}

/** Safely parse JSON from a Request, returning `null` on failure. */
export async function safeJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

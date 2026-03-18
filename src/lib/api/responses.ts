import { NextResponse } from "next/server";

/**
 * Ошибка API с кодом, сообщением и опциональными деталями.
 */
export interface ApiError {
  code?: string;
  message: string;
  details?: string[];
}

/**
 * Унифицированный формат API-ответа (AD-3).
 * Все эндпоинты возвращают `{ ok, data }` или `{ ok, error }`.
 */
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

/**
 * Результат безопасного парсинга JSON.
 */
export type SafeJsonResult =
  | { success: true; data: unknown }
  | { success: false; error: string };

/** Формирует успешный ответ (REQ-1, REQ-3, REQ-4). */
export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ ok: true as const, data }, { status });
}

/** Формирует ответ 400 Bad Request (REQ-5, REQ-6). */
export function badRequest(
  message: string,
  details?: string[],
  code?: string,
): NextResponse<ApiResponse<never>> {
  const error: ApiError = { message };
  if (code) error.code = code;
  if (details) error.details = details;
  return NextResponse.json({ ok: false as const, error }, { status: 400 });
}

/** Формирует ответ 500 Internal Server Error (REQ-2). */
export function internalError(
  message: string,
  code: string,
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { ok: false as const, error: { code, message } },
    { status: 500 },
  );
}

/**
 * Безопасно парсит JSON из Request (REQ-5).
 * Возвращает `{ success: true, data }` или `{ success: false, error }`.
 */
export async function safeJson(request: Request): Promise<SafeJsonResult> {
  try {
    const text = await request.text();
    if (!text) {
      return { success: false, error: "Request body is empty" };
    }
    const data: unknown = JSON.parse(text);
    return { success: true, data };
  } catch {
    return { success: false, error: "Invalid JSON in request body" };
  }
}

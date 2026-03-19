import { NextResponse } from "next/server";
import { listTags } from "@/app/api/_db/tags";

/**
 * GET /api/tags
 * Возвращает список всех уникальных тегов. Всегда отвечает 200.
 */
export function GET(): NextResponse<string[]> {
  const tags = listTags();
  return NextResponse.json(tags);
}

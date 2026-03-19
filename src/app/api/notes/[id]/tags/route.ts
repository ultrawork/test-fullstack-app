import { NextResponse } from "next/server";
import { findNote, addTagToNote } from "@/app/api/_db/notes";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/notes/[id]/tags — добавляет тег к заметке.
 *
 * Body: { tag: string }
 * - Тег нормализуется через trim.
 * - Пустой тег (после trim) возвращает 400.
 * - Несуществующая заметка возвращает 404.
 * - Дублирующий тег — идемпотентно 200.
 */
export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("tag" in body) ||
    typeof (body as Record<string, unknown>).tag !== "string"
  ) {
    return NextResponse.json(
      { error: "Field 'tag' is required and must be a string" },
      { status: 400 },
    );
  }

  const tag = ((body as Record<string, unknown>).tag as string).trim();

  if (tag === "") {
    return NextResponse.json(
      { error: "Tag must not be empty after trimming" },
      { status: 400 },
    );
  }

  const note = findNote(id);
  if (!note) {
    return NextResponse.json(
      { error: `Note '${id}' not found` },
      { status: 404 },
    );
  }

  const updated = addTagToNote(id, tag);
  return NextResponse.json(updated, { status: 200 });
}

import { NextRequest, NextResponse } from "next/server";
import { addTagToNote } from "@/app/api/_db/notes";

/**
 * POST /api/notes/[id]/tags
 *
 * Добавляет тег к заметке. Принимает JSON { tag }.
 * Валидирует непустую строку после trim.
 * 200 — успех, 400 — невалидный ввод, 404 — заметка не найдена.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

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
    typeof (body as { tag: unknown }).tag !== "string"
  ) {
    return NextResponse.json(
      { error: "Field 'tag' is required and must be a string" },
      { status: 400 },
    );
  }

  const tag = ((body as { tag: string }).tag).trim();

  if (tag.length === 0) {
    return NextResponse.json(
      { error: "Tag must not be empty" },
      { status: 400 },
    );
  }

  const updated = addTagToNote(id, tag);

  if (!updated) {
    return NextResponse.json(
      { error: "Note not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(updated, { status: 200 });
}

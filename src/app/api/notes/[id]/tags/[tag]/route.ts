import { NextRequest, NextResponse } from "next/server";
import { removeTagFromNote } from "@/app/api/_db/notes";

/**
 * DELETE /api/notes/[id]/tags/[tag]
 *
 * Удаляет тег из заметки. Декодирует tag через decodeURIComponent.
 * Идемпотентно — если тега нет, всё равно возвращает 200.
 * 200 — успех с текущей заметкой, 404 — заметка не найдена.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; tag: string }> },
): Promise<NextResponse> {
  const { id, tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);

  const updated = removeTagFromNote(id, tag);

  if (!updated) {
    return NextResponse.json(
      { error: "Note not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(updated, { status: 200 });
}
